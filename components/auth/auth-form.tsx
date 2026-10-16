"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Info, LoaderCircle, MoveUpRight } from "lucide-react";
import { authAction, googleSignIn, type AuthMode, type AuthState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/brand";

const titles: Record<AuthMode, [string, string, string]> = {
  login: [
    "Chào mừng bạn trở lại",
    "Tiếp tục với tiếng Anh, tiếng Hàn và tiếng Trung trên VocaFlow.",
    "Đăng nhập",
  ],
  "sign-up": [
    "Bắt đầu câu chuyện mới.",
    "Một tài khoản cho những ngôn ngữ và mục tiêu bạn theo đuổi.",
    "Tạo tài khoản miễn phí",
  ],
  "reset-password": [
    "Đặt lại mật khẩu",
    "Nhập email để nhận liên kết khôi phục tài khoản.",
    "Gửi liên kết khôi phục",
  ],
  "update-password": ["Tạo mật khẩu mới", "Chọn mật khẩu có ít nhất 10 ký tự.", "Lưu mật khẩu mới"],
};
export function AuthForm({
  mode,
  configured,
  googleEnabled,
  callbackError,
}: {
  mode: AuthMode;
  configured: boolean;
  googleEnabled: boolean;
  callbackError?: string;
}) {
  const [state, action, pending] = useActionState(authAction.bind(null, mode), {} as AuthState);
  const [visible, setVisible] = useState(false);
  const [title, subtitle, cta] = titles[mode];
  return (
    <div className="auth-form">
      <div className="auth-topline md:hidden">
        <Brand />
        <Link href="/" className="auth-back-link" aria-label="Quay lại trang chủ">
          <ArrowLeft size={17} />
        </Link>
      </div>
      <div className="auth-form-header">
        <span className="auth-mode-badge">
          {mode === "sign-up" ? "MỘT KHỞI ĐẦU MỚI" : "CHÀO MỪNG ĐẾN VOCAFLOW"}
        </span>
        <h1>{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
      </div>
      {!configured && (
        <div className="auth-availability">
          <div className="auth-system-note" role="status">
            <Info size={17} aria-hidden="true" />
            <div>
              <strong>Tài khoản đang tạm đóng</strong>
              <span>Bạn vẫn có thể học từ vựng và luyện tập theo chủ đề.</span>
            </div>
          </div>
          <details className="auth-setup-details">
            <summary>Thông tin thiết lập</summary>
            <p>
              Cần kết nối Supabase trước khi sử dụng tài khoản.{" "}
              <Link href="/setup">Hướng dẫn thiết lập</Link>
            </p>
          </details>
        </div>
      )}
      {callbackError && (
        <div className="notice error mb-5" role="alert">
          {callbackError === "confirmation"
            ? "Liên kết không hợp lệ hoặc đã hết hạn. Hãy yêu cầu một liên kết mới."
            : "Chưa thể kết nối Google. Hãy dùng email hoặc thử lại sau."}
        </div>
      )}
      <form action={action} className="auth-fields space-y-4">
        {mode === "sign-up" && (
          <div className="field">
            <label htmlFor="display_name">Tên của bạn</label>
            <input
              id="display_name"
              name="display_name"
              className="input"
              placeholder="Bạn muốn được gọi là gì?"
              autoComplete="name"
              maxLength={80}
              required
              disabled={!configured || pending}
            />
          </div>
        )}
        {mode !== "update-password" && (
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              className="input"
              type="email"
              placeholder="ban@example.com"
              autoComplete="email"
              maxLength={254}
              required
              disabled={!configured || pending}
            />
          </div>
        )}
        {mode !== "reset-password" && (
          <div className="field">
            <div className="flex justify-between items-center">
              <label htmlFor="password">
                {mode === "update-password" ? "Mật khẩu mới" : "Mật khẩu"}
              </label>
              {mode === "login" && (
                <Link href="/auth/reset-password" className="text-primary text-[11px]">
                  Quên mật khẩu?
                </Link>
              )}
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                className="input pr-11!"
                placeholder="Ít nhất 10 ký tự"
                type={visible ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={10}
                maxLength={128}
                required
                disabled={!configured || pending}
              />
              <button
                type="button"
                className="absolute right-1 top-1 icon-button"
                onClick={() => setVisible(!visible)}
                aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                aria-pressed={visible}
              >
                {visible ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        )}
        {mode === "update-password" && (
          <div className="field">
            <label htmlFor="confirm_password">Nhập lại mật khẩu mới</label>
            <input
              id="confirm_password"
              name="confirm_password"
              className="input"
              type="password"
              autoComplete="new-password"
              minLength={10}
              maxLength={128}
              required
              disabled={!configured || pending}
            />
          </div>
        )}
        {mode === "sign-up" && (
          <label className="auth-terms flex gap-2 items-start text-xs text-muted">
            <input
              name="accept_terms"
              type="checkbox"
              required
              disabled={!configured || pending}
              className="mt-1 accent-[#5951dc]"
            />
            <span>
              Tôi đồng ý với{" "}
              <Link className="text-primary underline" href="/terms">
                Điều khoản
              </Link>{" "}
              và{" "}
              <Link className="text-primary underline" href="/privacy">
                Chính sách quyền riêng tư
              </Link>
              .
            </span>
          </label>
        )}
        {state.error && (
          <div className="notice error" role="alert">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="notice success" role="status">
            {state.success}
          </div>
        )}
        <Button type="submit" className="w-full mt-2" disabled={!configured || pending}>
          {pending ? <LoaderCircle size={16} className="animate-spin" /> : null}
          {pending ? "Đang xử lý…" : cta}
          {!pending && <ArrowRight size={15} />}
        </Button>
      </form>
      {googleEnabled && (mode === "login" || mode === "sign-up") && (
        <form action={googleSignIn} className="mt-3">
          <Button className="secondary w-full" disabled={!configured || pending}>
            Tiếp tục với Google
          </Button>
        </form>
      )}
      <p className="auth-switch text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            Chưa có tài khoản?{" "}
            <Link href="/auth/sign-up" className="text-primary font-semibold">
              Bắt đầu miễn phí
            </Link>
          </>
        ) : (
          <Link href="/auth/login" className="text-primary">
            Quay lại đăng nhập
          </Link>
        )}
      </p>
      <div className="auth-explore">
        <Link href="/ielts">
          Khám phá bài học <MoveUpRight size={13} />
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/help">Trợ giúp</Link>
      </div>
    </div>
  );
}
