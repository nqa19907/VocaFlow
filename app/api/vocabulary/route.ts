import { NextResponse } from "next/server";
import {
  apiHandler,
  apiSession,
  ApiError,
  checkOrigin,
  databaseError,
  jsonBody,
  rateLimit,
} from "@/lib/api/http";
import { escapeLike, libraryQuerySchema, vocabularySchema } from "@/lib/validation/vocabulary";

export const GET = apiHandler(async (request) => {
  const { supabase, user } = await apiSession();
  const parsed = libraryQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  if (!parsed.success) throw new ApiError(400, "VALIDATION_ERROR", "Bộ lọc tìm kiếm không hợp lệ.");
  const { q, pos, sort, page } = parsed.data;
  let query = supabase
    .from("vocabulary_items")
    .select("*", { count: "exact" })
    .eq("user_id", user.id);
  if (q) query = query.ilike("word", `%${escapeLike(q)}%`);
  if (pos) query = query.eq("part_of_speech", pos);
  query = query
    .order(sort === "word" ? "word" : "created_at", { ascending: sort !== "newest" })
    .order("id");
  const { data, error, count } = await query.range((page - 1) * 20, page * 20 - 1);
  databaseError(error);
  return NextResponse.json(
    { data, count, page, pageSize: 20 },
    { headers: { "Cache-Control": "private, no-store" } },
  );
});

export const POST = apiHandler(async (request) => {
  const { supabase, user } = await apiSession();
  checkOrigin(request);
  await rateLimit(supabase, "vocabulary");
  const parsed = vocabularySchema.safeParse(await jsonBody(request));
  if (!parsed.success) throw new ApiError(400, "VALIDATION_ERROR", parsed.error.issues[0].message);
  const { data, error } = await supabase
    .from("vocabulary_items")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();
  databaseError(error);
  return NextResponse.json({ data }, { status: 201, headers: { "Cache-Control": "no-store" } });
});
