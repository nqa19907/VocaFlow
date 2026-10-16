import Link from "next/link";
import { Brand } from "@/components/brand";
export default function NotFound() {
  return (
    <main id="main" className="setup-page">
      <Brand />
      <h1>Không tìm thấy trang này</h1>
      <p className="text-sm text-muted mb-6">
        Liên kết có thể đã thay đổi hoặc nội dung không còn tồn tại.
      </p>
      <Link className="button" href="/">
        Về trang chủ
      </Link>
    </main>
  );
}
