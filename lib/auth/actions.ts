"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfig, siteUrl } from "@/lib/env";
import { requireUser } from "./session";

export type AuthMode = "login" | "sign-up" | "reset-password" | "update-password";
export type AuthState = { error?: string; success?: string };

const password = z.string().min(10, "Mật khẩu cần ít nhất 10 ký tự.").max(128);
const email = z.email("Email không hợp lệ.").max(254);

export async function authAction(
  mode: AuthMode,
  _previous: AuthState,
  form: FormData,
): Promise<AuthState> {
  if (!supabaseConfig()) return { error: "Chưa cấu hình Supabase. Xem trang hướng dẫn thiết lập." };
  const supabase = await createClient();
  const rawEmail = String(form.get("email") ?? "").trim();
  const rawPassword = String(form.get("password") ?? "");
  if (mode !== "update-password") {
    const result = email.safeParse(rawEmail);
    if (!result.success) return { error: result.error.issues[0].message };
  }
  if (mode !== "reset-password") {
    const result = password.safeParse(rawPassword);
    if (!result.success) return { error: result.error.issues[0].message };
  }
  if (mode === "sign-up") {
    const name = z
      .string()
      .trim()
      .min(1, "Hãy nhập tên của bạn.")
      .max(80)
      .safeParse(form.get("display_name"));
    if (!name.success) return { error: name.error.issues[0].message };
    if (form.get("accept_terms") !== "on")
      return { error: "Vui lòng đồng ý điều khoản và chính sách quyền riêng tư." };
    const { data, error } = await supabase.auth.signUp({
      email: rawEmail,
      password: rawPassword,
      options: {
        data: { display_name: name.data },
        emailRedirectTo: `${siteUrl()}/auth/callback`,
      },
    });
    if (error)
      return {
        error:
          error.status === 429
            ? "Quá nhiều yêu cầu. Vui lòng thử lại sau."
            : "Chưa thể đăng ký. Kiểm tra thông tin hoặc thử lại sau.",
      };
    if (data.session) redirect("/app");
    return { success: "Vui lòng kiểm tra email để xác nhận tài khoản, sau đó đăng nhập." };
  }
  if (mode === "reset-password") {
    const { error } = await supabase.auth.resetPasswordForEmail(rawEmail, {
      redirectTo: `${siteUrl()}/auth/callback?next=/app/settings&recovery=1`,
    });
    if (error?.status === 429) return { error: "Bạn yêu cầu quá nhanh. Vui lòng thử lại sau." };
    if (error) return { error: "Chưa thể gửi email lúc này. Vui lòng thử lại sau." };
    return { success: "Nếu email đã đăng ký, bạn sẽ nhận được liên kết đặt lại mật khẩu." };
  }
  if (mode === "update-password") {
    await requireUser();
    if (rawPassword !== String(form.get("confirm_password")))
      return { error: "Hai mật khẩu chưa khớp." };
    const { error } = await supabase.auth.updateUser({ password: rawPassword });
    if (error)
      return {
        error: "Không thể đổi mật khẩu. Hãy yêu cầu liên kết khôi phục mới hoặc đăng nhập lại.",
      };
    redirect("/app/settings?password=updated");
  }
  const { error } = await supabase.auth.signInWithPassword({
    email: rawEmail,
    password: rawPassword,
  });
  if (error)
    return {
      error:
        error.status === 429
          ? "Quá nhiều yêu cầu đăng nhập. Hãy thử lại sau."
          : "Email hoặc mật khẩu không đúng, hoặc email chưa được xác nhận.",
    };
  redirect("/app");
}

export async function signOut() {
  const { supabase } = await requireUser();
  const { error } = await supabase.auth.signOut();
  if (error) redirect("/app/settings?error=logout");
  redirect("/auth/login");
}

export async function googleSignIn(): Promise<void> {
  if (!supabaseConfig() || process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED !== "true")
    redirect("/auth/login?error=provider");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteUrl()}/auth/callback` },
  });
  if (error || !data.url) redirect("/auth/login?error=provider");
  // Uses the provider URL returned by the Supabase SDK, never user input.
  redirect(data.url);
}

export async function saveProfile(_previous: AuthState, form: FormData): Promise<AuthState> {
  const { profileSchema } = await import("@/lib/validation/profile");
  const { rateLimit } = await import("@/lib/api/http");
  const { revalidatePath } = await import("next/cache");
  const parsed = profileSchema.safeParse({
    display_name: form.get("display_name"),
    timezone: form.get("timezone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { supabase, user } = await requireUser();
  try {
    await rateLimit(supabase, "profile");
  } catch {
    return { error: "Chưa thể lưu. Hãy thử lại sau một phút." };
  }
  const { error } = await supabase.from("profiles").update(parsed.data).eq("user_id", user.id);
  if (error) return { error: "Không thể cập nhật hồ sơ. Vui lòng thử lại." };
  revalidatePath("/app", "layout");
  return { success: "Đã lưu thông tin tài khoản." };
}
