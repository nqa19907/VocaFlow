import Link from "next/link";
import { ArrowLeft, Database, ExternalLink } from "lucide-react";
import { Brand } from "@/components/brand";
import { supabaseConfig } from "@/lib/env";
export const dynamic = "force-dynamic";
export default function Setup() {
  const configured = Boolean(supabaseConfig());
  return (
    <main id="main" className="setup-page">
      <Brand />
      <div className="mt-12 text-primary">
        <Database size={32} />
      </div>
      <h1>{configured ? "Supabase đã có cấu hình môi trường" : "Thiết lập dịch vụ tài khoản"}</h1>
      <p className="text-sm text-muted">
        {configured
          ? "Hãy bảo đảm migration đã chạy, sau đó đăng nhập để kiểm tra kết nối thực tế."
          : "Giao diện đã sẵn sàng. Cần cấu hình Supabase để bật tài khoản và lưu dữ liệu thật."}
      </p>
      <div className="notice mt-6">
        Không có tài khoản hoặc dữ liệu học giả. Khi chưa kết nối database, các chức năng cần đăng
        nhập sẽ chờ thiết lập.
      </div>
      <div className="setup-step">
        <span className="step-number">1</span>
        <div>
          <strong className="text-sm">Tạo Supabase project hoặc chạy Supabase local</strong>
          <p className="text-xs text-muted mt-1">
            Xem README để thiết lập Auth, URL chuyển hướng và xác nhận email.
          </p>
        </div>
      </div>
      <div className="setup-step">
        <span className="step-number">2</span>
        <div>
          <strong className="text-sm">Chạy database migration</strong>
          <p className="text-xs text-muted mt-1">
            Áp dụng file trong <code>supabase/migrations</code> qua Supabase CLI hoặc SQL Editor.
          </p>
        </div>
      </div>
      <div className="setup-step">
        <span className="step-number">3</span>
        <div>
          <strong className="text-sm">Điền biến môi trường và khởi động lại</strong>
          <p className="text-xs text-muted mt-1">
            Sao chép <code>.env.example</code> thành <code>.env.local</code>, điền URL và
            publishable key, rồi chạy <code>npm run dev</code>.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mt-7">
        <Link href="/" className="button secondary">
          <ArrowLeft size={15} /> Trang chủ
        </Link>
        {configured ? (
          <Link href="/auth/login" className="button">
            Đăng nhập
          </Link>
        ) : (
          <a
            className="button"
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mở Supabase <ExternalLink size={14} />
          </a>
        )}
      </div>
    </main>
  );
}
