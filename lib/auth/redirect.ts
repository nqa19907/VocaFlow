export function safeNext(value: string | null, fallback = "/app") {
  // Only local app paths. No protocol-relative URLs, backslashes or control chars.
  if (!value || !value.startsWith("/app") || /[\\\u0000-\u0020]/.test(value)) return fallback;
  if (value !== "/app" && !value.startsWith("/app/") && !value.startsWith("/app?")) return fallback;
  return value;
}
