import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, BookOpen, Repeat2, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";
import { AuthForm } from "@/components/auth/auth-form";
import { PronunciationButton } from "@/components/learning/pronunciation-button";
import { supabaseConfig } from "@/lib/env";
import type { AuthMode } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Tài khoản", robots: { index: false, follow: false } };
export default async function AuthPage({
  params,
  searchParams,
}: {
  params: Promise<{ mode: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { mode } = await params;
  if (!["login", "sign-up", "reset-password", "update-password"].includes(mode)) notFound();
  if (mode === "update-password") await requireUser();
  const { error } = await searchParams;
  return (
    <main id="main" className="auth-layout">
      <aside className="auth-aside">
        <div className="auth-aside-top">
          <Brand />
          <span className="auth-edition">LANGUAGES OPEN DOORS</span>
        </div>
        <div className="auth-aside-content">
          <span className="eyebrow text-primary">TOPIK · IELTS · HSK</span>
          <h2>
            Nhiều ngôn ngữ,
            <br />
            thêm nhiều
            <br />
            <span className="text-primary">cơ hội.</span>
          </h2>
          <p>
            Tiếng Anh, tiếng Hàn và tiếng Trung. Khám phá bài học và từ vựng cho mục tiêu của bạn.
          </p>
          <div className="auth-visual">
            <div className="auth-visual-grid" aria-hidden="true" />
            <div className="auth-word-card">
              <div className="auth-word-card-top">
                <span>
                  <BookOpen size={13} /> <span lang="ko">한국어</span> · TIẾNG HÀN
                </span>
                <PronunciationButton text="가능성" locale="ko" />
              </div>
              <h3>
                <span lang="ko">가능성</span>
                <span>.</span>
              </h3>
              <div className="auth-word-meta">
                <span>ga-neung-seong</span>
                <span>danh từ</span>
              </div>
              <p className="auth-word-meaning">khả năng, tiềm năng</p>
              <div className="auth-word-example" lang="ko">
                “새로운 가능성을 발견했어요.”
              </div>
            </div>
            <span className="auth-visual-label">
              <Sparkles size={13} /> Khám phá một ngôn ngữ mới.
            </span>
          </div>
          <div className="auth-benefits">
            <span>
              <BookOpen size={16} /> Anh · Hàn · Trung
            </span>
            <span>
              <Repeat2 size={16} /> Bài học theo chủ đề
            </span>
          </div>
        </div>
        <div className="auth-aside-footer">
          <Link href="/">
            <ArrowLeft size={14} /> Về trang chủ
          </Link>
          <span>MORE LANGUAGES. MORE POSSIBILITIES.</span>
        </div>
      </aside>
      <section className="auth-main">
        <AuthForm
          mode={mode as AuthMode}
          configured={Boolean(supabaseConfig())}
          googleEnabled={process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true"}
          callbackError={error}
        />
      </section>
    </main>
  );
}
