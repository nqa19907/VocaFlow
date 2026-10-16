import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfig, siteUrl } from "@/lib/env";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  if (!supabaseConfig()) return NextResponse.redirect(new URL("/setup", siteUrl()));
  if (token_hash && (type === "signup" || type === "recovery" || type === "email")) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error)
      return NextResponse.redirect(
        new URL(type === "recovery" ? "/auth/update-password" : "/app", siteUrl()),
      );
  }
  return NextResponse.redirect(new URL("/auth/login?error=confirmation", siteUrl()));
}
