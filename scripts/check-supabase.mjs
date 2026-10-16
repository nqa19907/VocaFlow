import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { createClient } from "@supabase/supabase-js";

// Load local settings without requiring a running Next.js server. Never print keys.
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) loadEnvFile(file);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
if (!url || !key) {
  console.error(
    "Chưa kết nối Supabase: cần NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY trong .env.local.",
  );
  console.error("Không cần service-role key để chạy website. Không gửi secret key trong chat.");
  process.exit(1);
}

let origin;
try {
  origin = new URL(url);
  if (
    !["http:", "https:"].includes(origin.protocol) ||
    origin.username ||
    origin.password ||
    origin.search ||
    origin.hash ||
    !["", "/"].includes(origin.pathname)
  ) {
    throw new Error("INVALID_URL");
  }
} catch {
  console.error("Supabase URL không hợp lệ. Dùng Project URL từ bảng Connect của project.");
  process.exit(1);
}

let privileged = key.startsWith("sb_secret_");
if (key.split(".").length === 3) {
  try {
    const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8"));
    privileged ||= payload.role === "service_role";
  } catch {
    // Invalid key is rejected by Supabase below; no claims are trusted here.
  }
}
if (privileged) {
  console.error(
    "Sai loại key: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY cần publishable/anon key, không phải secret/service-role key.",
  );
  process.exit(1);
}

const timedFetch = (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(10000) });
const client = createClient(origin.origin, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { fetch: timedFetch },
});

try {
  const [auth, schema] = await Promise.all([
    timedFetch(new URL("/auth/v1/health", origin), { headers: { apikey: key } }),
    // Zero rows: verifies the public schema contract without reading anyone's data.
    client.from("vocabulary_packs").select("id,slug,title,is_published,price_vnd").limit(0),
  ]);
  if (!auth.ok) {
    console.error(`Supabase Auth chưa sẵn sàng (HTTP ${auth.status}). Kiểm tra project và key.`);
    process.exitCode = 1;
  } else {
    console.log("PASS: Supabase Auth có thể truy cập.");
  }
  if (schema.error) {
    const missingSchema = schema.error.code === "PGRST205" || schema.error.code === "42P01";
    console.error(
      missingSchema
        ? "Chưa có schema VocaFlow. Cần áp dụng migration trong supabase/migrations."
        : "Chưa truy cập được schema VocaFlow. Kiểm tra key, quyền public-read của packs và kết nối.",
    );
    process.exitCode = 1;
  } else {
    console.log("PASS: Database API nhận diện schema bộ từ VocaFlow.");
  }
  if (!process.exitCode) {
    console.log(
      "Kết nối cơ bản sẵn sàng. Tiếp theo: kiểm tra đăng ký/email/đăng nhập và CRUD bằng tài khoản test.",
    );
  }
} catch {
  console.error("Không kết nối được Supabase trong 10 giây. Kiểm tra mạng và trạng thái project.");
  process.exitCode = 1;
}
