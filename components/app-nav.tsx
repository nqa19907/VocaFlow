"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
const links = [
  { href: "/app", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/app/vocabulary", label: "Thư viện từ", icon: BookOpen },
  { href: "/app/vocabulary/new", label: "Thêm từ mới", icon: Plus },
  { href: "/app/settings", label: "Cài đặt", icon: Settings },
];
export function AppNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <nav
      className={mobile ? "mobile-nav" : "sidebar-nav"}
      aria-label={mobile ? "Điều hướng di động" : "Quản lý tài khoản"}
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/app" || href.endsWith("/new")
            ? pathname === href
            : href === "/app/vocabulary"
              ? pathname.startsWith(href) && !pathname.endsWith("/new")
              : pathname.startsWith(href);
        return (
          <Link
            href={href}
            key={href}
            aria-current={active ? "page" : undefined}
            className={cn("nav-item", active && "active")}
          >
            <Icon size={18} strokeWidth={1.7} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
