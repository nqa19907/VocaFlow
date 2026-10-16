import { NextResponse } from "next/server";
import { z } from "zod";
import {
  apiSession,
  ApiError,
  checkOrigin,
  databaseError,
  errorResponse,
  jsonBody,
  rateLimit,
} from "@/lib/api/http";
import { vocabularyPatchSchema } from "@/lib/validation/vocabulary";

type Context = { params: Promise<{ id: string }> };
async function handle(request: Request, context: Context, method: "GET" | "PATCH" | "DELETE") {
  try {
    const { supabase, user } = await apiSession();
    const { id } = await context.params;
    if (!z.uuid().safeParse(id).success)
      throw new ApiError(404, "NOT_FOUND", "Không tìm thấy từ vựng.");
    if (method !== "GET") {
      checkOrigin(request);
      await rateLimit(supabase, "vocabulary");
    }
    const base = () => supabase.from("vocabulary_items");
    if (method === "GET") {
      const { data, error } = await base()
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      databaseError(error);
      if (!data) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy từ vựng.");
      return NextResponse.json({ data }, { headers: { "Cache-Control": "private, no-store" } });
    }
    if (method === "PATCH") {
      const parsed = vocabularyPatchSchema.safeParse(await jsonBody(request));
      if (!parsed.success)
        throw new ApiError(400, "VALIDATION_ERROR", parsed.error.issues[0].message);
      const { data, error } = await base()
        .update(parsed.data)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .maybeSingle();
      databaseError(error);
      if (!data) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy từ vựng.");
      return NextResponse.json({ data });
    }
    const { data, error } = await base()
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();
    databaseError(error);
    if (!data) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy từ vựng.");
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
export const GET = (request: Request, context: Context) => handle(request, context, "GET");
export const PATCH = (request: Request, context: Context) => handle(request, context, "PATCH");
export const DELETE = (request: Request, context: Context) => handle(request, context, "DELETE");
