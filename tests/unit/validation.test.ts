import { describe, expect, it } from "vitest";
import {
  escapeLike,
  libraryQuerySchema,
  normalizeWord,
  vocabularySchema,
} from "@/lib/validation/vocabulary";
import { profileSchema } from "@/lib/validation/profile";
import { safeNext } from "@/lib/auth/redirect";

describe("vocabulary input", () => {
  const valid = { word: "hurricane", part_of_speech: "n.", definition_vi: "bão lớn" };
  it("accepts a manual card without paid AI fields", () => {
    expect(vocabularySchema.parse(valid).synonyms_en).toEqual([]);
  });
  it("normalizes duplicates consistently", () => {
    expect(normalizeWord("  Take   off  ")).toBe("take off");
  });
  it.each(["<script>alert(1)</script>", "1234", "hurricane; DROP TABLE", "", "a".repeat(101)])(
    "rejects invalid word %s",
    (word) => {
      expect(vocabularySchema.safeParse({ ...valid, word }).success).toBe(false);
    },
  );
  it("rejects owner/source/role mass assignment", () => {
    expect(
      vocabularySchema.safeParse({ ...valid, user_id: "someone", role: "admin", source: "ai" })
        .success,
    ).toBe(false);
  });
  it("rejects an empty definition and too many synonyms", () => {
    expect(vocabularySchema.safeParse({ ...valid, definition_vi: " " }).success).toBe(false);
    expect(
      vocabularySchema.safeParse({ ...valid, synonyms_en: Array(21).fill("storm") }).success,
    ).toBe(false);
  });
  it("bounds pagination and escapes wildcard searches", () => {
    expect(libraryQuerySchema.safeParse({ page: "-1" }).success).toBe(false);
    expect(libraryQuerySchema.safeParse({ page: "1e9" }).success).toBe(false);
    expect(escapeLike("50%_\\")).toBe("50\\%\\_\\\\");
  });
});
describe("profile and redirect boundaries", () => {
  it("accepts a real timezone and rejects an invented timezone", () => {
    expect(profileSchema.safeParse({ display_name: "An", timezone: "Asia/Bangkok" }).success).toBe(
      true,
    );
    expect(
      profileSchema.safeParse({ display_name: "An", timezone: "Nowhere/Unknown" }).success,
    ).toBe(false);
    expect(
      profileSchema.safeParse({ display_name: "An", timezone: "UTC", role: "admin" }).success,
    ).toBe(false);
  });
  it.each([
    "//evil.test",
    "https://evil.test",
    "/app\\evil.test",
    "/application",
    "/app\n/evil",
    "/auth/login",
  ])("blocks unsafe redirect %s", (value) => expect(safeNext(value)).toBe("/app"));
  it("preserves safe app destinations", () => {
    expect(safeNext("/app/settings")).toBe("/app/settings");
  });
});
