import { LogOut, Sprout } from "lucide-react";
import type { Metadata } from "next";
import { Brand } from "@/components/brand";
import { AppNav } from "@/components/app-nav";
import { requireUser } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";
export const metadata: Metadata = {
  title: "Tài khoản VocaFlow",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (error || !profile) throw new Error("PROFILE_NOT_AVAILABLE");
  const name = profile.display_name || "Bạn";
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <p className="nav-label">THƯ VIỆN CỦA BẠN</p>
        <AppNav />
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Sprout size={22} className="mb-3 text-[#9c83c2]" />
            <strong className="text-[#8a72a5] block mb-1">Chậm một chút cũng được.</strong>Mỗi từ
            bạn lưu là một bước tiến trên hành trình.
          </div>
          <form action={signOut}>
            <button className="nav-item w-full" type="submit">
              <LogOut size={17} /> Đăng xuất
            </button>
          </form>
        </div>
      </aside>
      <div className="app-area">
        <header className="app-topbar">
          <span className="text-xs text-[#aba0b9] hidden md:block">
            Không gian của bạn <span className="mx-2 text-[#d7cfdf]">/</span>
            <span className="text-[#84708f]">Học mỗi ngày</span>
          </span>
          <div className="md:hidden">
            <Brand />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#8f7d9c] hidden sm:block">{name}</span>
            <span className="avatar" aria-label={`Tài khoản ${name}`}>
              {name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        </header>
        <main id="main" className="app-main">
          {children}
        </main>
      </div>
      <AppNav mobile />
    </div>
  );
}
