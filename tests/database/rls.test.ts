import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const alice = "10000000-0000-4000-8000-000000000001";
const bob = "10000000-0000-4000-8000-000000000002";
let db: PGlite;
let aliceWord: string;
async function actor(id: string) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  await db.exec("set role authenticated");
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
  `);
  await db.exec(
    await readFile(
      new URL("../../supabase/migrations/202610160001_foundation.sql", import.meta.url),
      "utf8",
    ),
  );
  await db.exec(await readFile(new URL("../../supabase/seed.sql", import.meta.url), "utf8"));
  await db.query("insert into auth.users values ($1, $2), ($3, $4)", [
    alice,
    JSON.stringify({ display_name: "Alice", role: "admin" }),
    bob,
    JSON.stringify({ display_name: "Bob" }),
  ]);
});
afterAll(async () => {
  await db?.close();
});

describe.sequential("PostgreSQL migration, RLS and transaction invariants", () => {
  it("creates profile, wallet and one trial ledger row; ignores claimed admin metadata", async () => {
    await actor(alice);
    const profile = await db.query<{ role: string }>("select role from public.profiles");
    expect(profile.rows).toEqual([{ role: "user" }]);
    expect(
      (await db.query<{ balance: number }>("select balance from public.credit_wallets")).rows,
    ).toEqual([{ balance: 15 }]);
    expect((await db.query("select * from public.credit_transactions")).rows).toHaveLength(1);
  });
  it("atomically creates a normalized word and an immediately due review state", async () => {
    await actor(alice);
    const result = await db.query<{ id: string; normalized_word: string }>(
      "insert into public.vocabulary_items(user_id, word, part_of_speech, definition_vi) values ($1, '  Take   off  ', 'v.', 'cất cánh') returning id, normalized_word",
      [alice],
    );
    aliceWord = result.rows[0].id;
    expect(result.rows[0].normalized_word).toBe("take off");
    const state = await db.query<{ interval_days: number; repetitions: number; due: boolean }>(
      "select interval_days, repetitions, due_at <= now() as due from public.review_states",
    );
    expect(state.rows).toEqual([{ interval_days: 0, repetitions: 0, due: true }]);
  });
  it("blocks a normalized duplicate without leaving an extra review state", async () => {
    await expect(
      db.query(
        "insert into public.vocabulary_items(user_id, word, part_of_speech, definition_vi) values ($1, 'take off', 'v.', 'khởi hành')",
        [alice],
      ),
    ).rejects.toMatchObject({ code: "23505" });
    expect((await db.query("select * from public.review_states")).rows).toHaveLength(1);
  });
  it("allows the same word with another part of speech", async () => {
    await db.query(
      "insert into public.vocabulary_items(user_id, word, part_of_speech, definition_vi) values ($1, 'take off', 'n.', 'sự cất cánh')",
      [alice],
    );
    expect((await db.query("select * from public.vocabulary_items")).rows).toHaveLength(2);
  });
  it("blocks cross-account reads, updates, deletes and forged ownership", async () => {
    await actor(bob);
    expect(
      (await db.query("select * from public.vocabulary_items where id = $1", [aliceWord])).rows,
    ).toHaveLength(0);
    expect(
      (
        await db.query(
          "update public.vocabulary_items set definition_vi = 'hacked' where id = $1 returning id",
          [aliceWord],
        )
      ).rows,
    ).toHaveLength(0);
    expect(
      (
        await db.query("delete from public.vocabulary_items where id = $1 returning id", [
          aliceWord,
        ])
      ).rows,
    ).toHaveLength(0);
    expect((await db.query("select * from public.review_states")).rows).toHaveLength(0);
    await expect(
      db.query(
        "insert into public.vocabulary_items(user_id, word, part_of_speech, definition_vi) values ($1, 'storm', 'n.', 'bão')",
        [alice],
      ),
    ).rejects.toMatchObject({ code: "42501" });
  });
  it("denies role, wallet, ledger, owner, order and review-state tampering", async () => {
    await expect(
      db.query("update public.profiles set role = 'admin' where user_id = $1", [bob]),
    ).rejects.toMatchObject({ code: "42501" });
    await expect(db.exec("update public.credit_wallets set balance = 999")).rejects.toMatchObject({
      code: "42501",
    });
    await expect(db.exec("delete from public.credit_transactions")).rejects.toMatchObject({
      code: "42501",
    });
    await expect(
      db.exec("update public.review_states set interval_days = 100"),
    ).rejects.toMatchObject({ code: "42501" });
    await expect(db.exec("update public.orders set status = 'paid'")).rejects.toMatchObject({
      code: "42501",
    });
    await expect(
      db.exec(
        `insert into public.owned_packs(user_id,pack_id) values ('${bob}', gen_random_uuid())`,
      ),
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      db.exec("update public.vocabulary_items set user_id = gen_random_uuid()"),
    ).rejects.toMatchObject({ code: "42501" });
  });
  it("allows profile editing, but rejects invalid database timezones", async () => {
    await db.query(
      "update public.profiles set display_name = 'Bobby', timezone = 'Asia/Bangkok' where user_id = $1",
      [bob],
    );
    await expect(
      db.query("update public.profiles set timezone = 'Invalid/Zone' where user_id = $1", [bob]),
    ).rejects.toMatchObject({ code: "23514" });
  });
  it("enforces a shared atomic request limit", async () => {
    for (let i = 0; i < 30; i++)
      expect(
        (
          await db.query<{ allowed: boolean }>(
            "select public.consume_rate_limit('vocabulary') as allowed",
          )
        ).rows[0].allowed,
      ).toBe(true);
    expect(
      (
        await db.query<{ allowed: boolean }>(
          "select public.consume_rate_limit('vocabulary') as allowed",
        )
      ).rows[0].allowed,
    ).toBe(false);
    expect(
      (
        await db.query<{ allowed: boolean }>(
          "select public.consume_rate_limit('arbitrary') as allowed",
        )
      ).rows[0].allowed,
    ).toBe(false);
  });
  it("hides unpublished packs and rejects non-admin writes", async () => {
    expect((await db.query("select * from public.vocabulary_packs")).rows).toHaveLength(0);
    await expect(
      db.exec("insert into public.vocabulary_packs(slug,title) values ('forged','Forged')"),
    ).rejects.toMatchObject({ code: "42501" });
  });
  it("permits admin pack configuration only after a trusted role change", async () => {
    await db.exec("reset role");
    await db.query("update public.profiles set role = 'admin' where user_id = $1", [bob]);
    await actor(bob);
    const pack = await db.query<{ id: string }>(
      "insert into public.vocabulary_packs(slug,title,is_published,price_vnd) values ('paid-test','Paid',true,49000) returning id",
    );
    for (let i = 0; i < 6; i++)
      await db.query(
        "insert into public.pack_words(pack_id,word,part_of_speech,definition_vi,position) values ($1,'sample','n.','mẫu',$2)",
        [pack.rows[0].id, i],
      );
    await actor(alice);
    expect((await db.query("select * from public.pack_words")).rows).toHaveLength(5);
  });
  it("allows anonymous public previews but no user data", async () => {
    await db.exec("reset role; set role anon");
    expect((await db.query("select * from public.pack_words")).rows).toHaveLength(5);
    await expect(db.exec("select * from public.vocabulary_items")).rejects.toMatchObject({
      code: "42501",
    });
  });
  it("cascades deleted cards and deleted accounts without ghost records", async () => {
    await actor(alice);
    await db.query("delete from public.vocabulary_items where id = $1", [aliceWord]);
    expect(
      (
        await db.query("select * from public.review_states where vocabulary_item_id = $1", [
          aliceWord,
        ])
      ).rows,
    ).toHaveLength(0);
    await db.exec("reset role");
    await db.query("delete from auth.users where id = $1", [alice]);
    expect(
      (await db.query("select * from public.credit_wallets where user_id = $1", [alice])).rows,
    ).toHaveLength(0);
    expect(
      (await db.query("select * from public.vocabulary_items where user_id = $1", [alice])).rows,
    ).toHaveLength(0);
  });
});
