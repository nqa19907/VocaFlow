import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfig, siteUrl } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export function errorResponse(error: unknown) {
  if (error instanceof ApiError)
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status, headers: { "Cache-Control": "no-store" } },
    );
  // Do not log user payloads, JWTs or provider response bodies.
  console.error("[api] request failed", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Có lỗi hệ thống. Vui lòng thử lại." } },
    { status: 500 },
  );
}
export function apiHandler(fn: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    try {
      return await fn(request);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
export async function apiSession() {
  if (!supabaseConfig())
    throw new ApiError(503, "SETUP_REQUIRED", "VocaFlow chưa được kết nối Supabase.");
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new ApiError(401, "UNAUTHORIZED", "Vui lòng đăng nhập để tiếp tục.");
  return { supabase, user };
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(siteUrl()).origin;
  if (!origin || origin !== expected || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new ApiError(403, "INVALID_ORIGIN", "Nguồn yêu cầu không hợp lệ.");
  }
}
export async function jsonBody(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    throw new ApiError(415, "CONTENT_TYPE", "Yêu cầu cần dữ liệu JSON.");
  // Read through a bounded stream, including requests without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "INVALID_JSON", "Dữ liệu JSON không hợp lệ.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 16384) {
      await reader.cancel();
      throw new ApiError(413, "BODY_TOO_LARGE", "Dữ liệu vượt quá giới hạn.");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Dữ liệu JSON không hợp lệ.");
  }
}
export function databaseError(error: { code?: string } | null) {
  if (!error) return;
  if (error.code === "23505")
    throw new ApiError(409, "DUPLICATE_WORD", "Từ với loại từ này đã có trong thư viện.");
  if (error.code === "42501")
    throw new ApiError(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này.");
  throw new ApiError(500, "DATABASE_ERROR", "Không thể truy cập dữ liệu. Vui lòng thử lại.");
}
export async function rateLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucket: "vocabulary" | "profile",
) {
  const { data, error } = await supabase.rpc("consume_rate_limit", { bucket_name: bucket });
  databaseError(error);
  if (!data)
    throw new ApiError(429, "RATE_LIMITED", "Bạn thao tác quá nhanh. Hãy thử lại sau một phút.");
}
