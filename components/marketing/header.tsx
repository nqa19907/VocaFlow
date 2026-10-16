"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Brand } from "@/components/brand";
import { publicNavigation } from "@/lib/navigation/public";

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !header.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  return (
    <header
      ref={header}
      className="container-wide marketing-header site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <Brand />
      <nav
        id={menuId}
        className={`marketing-nav${open ? " is-open" : ""}`}
        aria-label="Điều hướng chính"
      >
        {publicNavigation.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          );
        })}
        <Link className="mobile-auth-link" href="/auth/login" onClick={() => setOpen(false)}>
          Đăng nhập
        </Link>
      </nav>
      <div className="header-actions">
        <Link className="button ghost" href="/auth/login">
          Đăng nhập
        </Link>
        <Link className="button" href="/auth/sign-up">
          Bắt đầu miễn phí <ArrowRight size={14} />
        </Link>
        <button
          ref={toggle}
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Đóng menu" : "Mở menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}
