import Link from "next/link";
import { Brand } from "@/components/brand";
import { MarketingHeader } from "./header";
import { cn } from "@/lib/utils";

export function MarketingShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("marketing-page public-shell", className)}>
      <MarketingHeader />
      {children}
      <footer className="container-wide marketing-footer site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <Brand />
            <p>
              Nhiều ngôn ngữ.
              <br />
              Một thế giới rộng mở.
            </p>
          </div>
          <nav aria-label="Liên kết cuối trang">
            <div className="footer-group">
              <span>CHƯƠNG TRÌNH</span>
              <Link href="/ielts">IELTS · Tiếng Anh</Link>
              <Link href="/hsk">HSK · Tiếng Trung</Link>
              <Link href="/topik">TOPIK · Tiếng Hàn</Link>
            </div>
            <div className="footer-group">
              <span>TÀI KHOẢN</span>
              <Link href="/auth/login">Đăng nhập</Link>
              <Link href="/auth/sign-up">Tạo tài khoản</Link>
              <Link href="/help">Trợ giúp</Link>
            </div>
            <div className="footer-group">
              <span>THÔNG TIN</span>
              <Link href="/privacy">Quyền riêng tư</Link>
              <Link href="/terms">Điều khoản</Link>
            </div>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} VocaFlow</span>
          <span>More languages. More possibilities.</span>
        </div>
      </footer>
    </div>
  );
}
