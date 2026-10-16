import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, checkOrigin, databaseError, errorResponse, jsonBody } from "@/lib/api/http";
import { vocabularyPatchSchema } from "@/lib/validation/vocabulary";

afterEach(() => {
  vi.unstubAllEnvs();
});
describe("HTTP security boundaries", () => {
  it("accepts only the configured origin for a mutation", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://vocaflow.example");
    expect(() =>
      checkOrigin(
        new Request("https://untrusted-host.example/api/vocabulary", {
          headers: { origin: "https://vocaflow.example" },
        }),
      ),
    ).not.toThrow();
    const blockedHeaders: Record<string, string>[] = [
      {},
      { origin: "https://evil.example" },
      { origin: "null" },
      { origin: "https://vocaflow.example", "sec-fetch-site": "cross-site" },
    ];
    for (const headers of blockedHeaders) {
      expect(() =>
        checkOrigin(new Request("https://vocaflow.example/api/vocabulary", { headers })),
      ).toThrow(ApiError);
    }
  });
  it("rejects non-JSON and malformed JSON bodies", async () => {
    await expect(
      jsonBody(new Request("https://example.com", { method: "POST", body: "word=test" })),
    ).rejects.toMatchObject({ status: 415 });
    await expect(
      jsonBody(
        new Request("https://example.com", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{",
        }),
      ),
    ).rejects.toMatchObject({ status: 400 });
  });
  it("limits streamed bodies without trusting Content-Length", async () => {
    const oversized = new Request("https://example.com", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "x".repeat(17000) }),
    });
    await expect(jsonBody(oversized)).rejects.toMatchObject({ status: 413 });
    const valid = new Request("https://example.com", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: '{"word":"hurricane"}',
    });
    expect(await jsonBody(valid)).toEqual({ word: "hurricane" });
  });
  it("maps duplicate/permission errors without returning raw database details", async () => {
    expect(() => databaseError({ code: "23505" })).toThrow(/đã có trong thư viện/);
    expect(() => databaseError({ code: "42501" })).toThrow(ApiError);
    const response = errorResponse(new ApiError(409, "DUPLICATE_WORD", "Từ đã có."));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: { code: "DUPLICATE_WORD", message: "Từ đã có." },
    });
  });
  it("allows a partial content update and rejects empty or privileged patches", () => {
    expect(vocabularyPatchSchema.parse({ definition_vi: "bão" })).toEqual({ definition_vi: "bão" });
    expect(vocabularyPatchSchema.safeParse({}).success).toBe(false);
    expect(vocabularyPatchSchema.safeParse({ user_id: "another-user" }).success).toBe(false);
  });
});
