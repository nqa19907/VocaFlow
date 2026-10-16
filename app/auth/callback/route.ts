import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfig, siteUrl } from "@/lib/env";
import { safeNext } from "@/lib/auth/redirect";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!supabaseConfig()) return NextResponse.redirect(new URL("/setup", siteUrl()));
  const code = url.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(
          url.searchParams.get("recovery") === "1"
            ? "/auth/update-password"
            : safeNext(url.searchParams.get("next")),
          siteUrl(),
        ),
      );
  }
  return NextResponse.redirect(new URL("/auth/login?error=confirmation", siteUrl()));
}
