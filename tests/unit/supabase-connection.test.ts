import { mkdtempSync, rmdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const script = fileURLToPath(new URL("../../scripts/check-supabase.mjs", import.meta.url));
let isolatedDirectory: string;
beforeAll(() => {
  // No project .env files are read by these tests, even after a real account is connected.
  isolatedDirectory = mkdtempSync(join(tmpdir(), "vocaflow-connection-test-"));
});
afterAll(() => {
  // The test directory stays empty. No recursive cleanup or user data deletion.
  rmdirSync(isolatedDirectory);
});

function check(url = "", key = "") {
  return spawnSync(process.execPath, [script], {
    cwd: isolatedDirectory,
    encoding: "utf8",
    timeout: 5000,
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: url,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
    },
  });
}

describe("Supabase connection preflight (no network or real credentials)", () => {
  it("fails clearly without configuration", () => {
    const result = check();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Chưa kết nối Supabase");
  });
  it("rejects a URL with embedded credentials/path without echoing it", () => {
    const result = check("https://test-user:synthetic-password@example.com/private", "test-key");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("URL không hợp lệ");
    expect(result.stderr).not.toContain("synthetic-password");
  });
  it("rejects a secret key in the public key field", () => {
    const result = check("https://example.com", "sb_secret_synthetic_test_only");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Sai loại key");
    expect(result.stderr).not.toContain("sb_secret_synthetic_test_only");
  });
  it("rejects a legacy service-role JWT before any request", () => {
    const payload = Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url");
    const key = `synthetic-header.${payload}.synthetic-signature`;
    const result = check("https://example.com", key);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Sai loại key");
    expect(result.stderr).not.toContain(key);
  });
});
