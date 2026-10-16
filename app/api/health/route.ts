import { supabaseConfig } from "@/lib/env";
export function GET() {
  return Response.json(
    { status: "ok", milestone: 1, supabase: supabaseConfig() ? "configured" : "not_configured" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
