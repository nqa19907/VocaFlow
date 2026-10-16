import type { Metadata } from "next";
import Link from "next/link";
import { CircleHelp, LockKeyhole, Settings2 } from "lucide-react";
import { MarketingShell } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: "Trợ giúp VocaFlow",
  description: "Thông tin hỗ trợ tài khoản, truy cập và dữ liệu cá nhân trên VocaFlow.",
};

const questionClass =
  "cursor-pointer py-5 pr-4 text-sm font-semibold marker:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";
const answerClass = "pb-5 text-sm leading-7 text-muted";

export default function HelpPage() {
  return (
    <MarketingShell>
      <main id="main" className="container-wide subpage help-page">
        <header className="subpage-heading">
          <span className="eyebrow text-primary">
            <CircleHelp size={14} aria-hidden="true" /> TRỢ GIÚP
          </span>
          <h1>Chúng tôi có thể giúp gì cho bạn?</h1>
          <p>Câu trả lời về tài khoản, quyền truy cập và dữ liệu cá nhân của bạn.</p>
        </header>

        <div className="content-grid items-start">
          <section className="panel content-card" aria-labelledby="account-heading">
            <div className="feature-icon">
              <LockKeyhole size={21} aria-hidden="true" />
            </div>
            <h2 id="account-heading" className="mb-2 text-xl font-semibold tracking-tight">
              Tài khoản & truy cập
            </h2>
            <div className="divide-y divide-[#e9e2f0]">
              <details>
                <summary className={questionClass}>
                  Vì sao tôi chưa thể đăng ký hoặc đăng nhập?
                </summary>
                <p className={answerClass}>
                  Dịch vụ tài khoản cần được cấu hình trước khi sử dụng. Nếu trang đăng nhập hiển
                  thị “Tài khoản đang tạm đóng”, bạn vẫn có thể mở các bài học công khai; dữ liệu
                  học chưa được lưu vào tài khoản.
                </p>
              </details>
              <details>
                <summary className={questionClass}>Tôi quên mật khẩu thì làm gì?</summary>
                <p className={answerClass}>
                  Khi dịch vụ tài khoản hoạt động, bạn có thể yêu cầu liên kết tại trang{" "}
                  <Link className="text-primary underline" href="/auth/reset-password">
                    khôi phục mật khẩu
                  </Link>
                  . Sử dụng email đã đăng ký và kiểm tra cả thư mục spam.
                </p>
              </details>
              <details>
                <summary className={questionClass}>Tôi đổi tên và múi giờ ở đâu?</summary>
                <p className={answerClass}>
                  Sau khi đăng nhập, mở{" "}
                  <Link className="text-primary underline" href="/app/settings">
                    Cài đặt tài khoản
                  </Link>{" "}
                  để cập nhật tên hiển thị và múi giờ.
                </p>
              </details>
            </div>
          </section>

          <section className="panel content-card" aria-labelledby="data-heading">
            <div className="feature-icon green">
              <Settings2 size={21} aria-hidden="true" />
            </div>
            <h2 id="data-heading" className="mb-2 text-xl font-semibold tracking-tight">
              Dữ liệu & quyền riêng tư
            </h2>
            <div className="divide-y divide-[#e9e2f0]">
              <details>
                <summary className={questionClass}>
                  Bài học công khai có cần tài khoản không?
                </summary>
                <p className={answerClass}>
                  Không. Bạn có thể truy cập các chủ đề TOPIK, IELTS và HSK trực tiếp từ menu.
                  Những chức năng lưu dữ liệu cá nhân yêu cầu dịch vụ tài khoản hoạt động và đăng
                  nhập.
                </p>
              </details>
              <details>
                <summary className={questionClass}>Ai có thể xem dữ liệu cá nhân của tôi?</summary>
                <p className={answerClass}>
                  Thư viện cá nhân được giới hạn theo tài khoản bằng chính sách truy cập cơ sở dữ
                  liệu. Người quản trị hạ tầng có thể truy cập theo quyền được cấp. Chi tiết tại{" "}
                  <Link className="text-primary underline" href="/privacy">
                    Chính sách quyền riêng tư
                  </Link>
                  .
                </p>
              </details>
              <details>
                <summary className={questionClass}>Tôi có thể xóa dữ liệu của mình không?</summary>
                <p className={answerClass}>
                  Sau khi đăng nhập, bạn có thể xóa từng thẻ từ trong thư viện. Công cụ tự xóa tài
                  khoản và xuất toàn bộ dữ liệu hiện chưa có; tình trạng dịch vụ được nêu tại{" "}
                  <Link className="text-primary underline" href="/terms">
                    Điều khoản sử dụng
                  </Link>
                  .
                </p>
              </details>
            </div>
          </section>
        </div>
      </main>
    </MarketingShell>
  );
}
