import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/shell";
export const metadata: Metadata = { title: "Điều khoản sử dụng" };
export default function Terms() {
  return (
    <MarketingShell>
      <main id="main" className="legal">
        <h1>Điều khoản sử dụng</h1>
        <div className="notice">
          Bản phát triển ngày 16/10/2026, chưa phải bản điều khoản thương mại hoàn chỉnh. Cần bổ
          sung đơn vị vận hành, liên hệ và chính sách giao dịch trước khi phát hành công khai.
        </div>
        <h2>Phạm vi dịch vụ hiện tại</h2>
        <p>
          VocaFlow có các trang TOPIK, IELTS và HSK với từ vựng, thẻ lật và bài luyện nhận diện
          nghĩa. Kết quả luyện tập hiện chỉ tồn tại trong trang đang mở. Tài khoản và thư viện cá
          nhân cần dịch vụ dữ liệu được cấu hình. Gợi ý AI, lịch ôn được lưu, mua credit và mua bộ
          từ chưa khả dụng. Không có thanh toán thật hoặc giao dịch mô phỏng.
        </p>
        <h2>Tài khoản và nội dung</h2>
        <p>
          Bạn chịu trách nhiệm bảo mật tài khoản, sử dụng email thuộc quyền quản lý của mình và chỉ
          lưu nội dung có quyền sử dụng. Không sử dụng dịch vụ để phát tán nội dung trái pháp luật,
          xâm phạm quyền của người khác, tấn công hệ thống hoặc vượt hạn mức.
        </p>
        <h2>Nội dung học tập và credits</h2>
        <p>
          Nội dung từ vựng và câu ví dụ được VocaFlow biên soạn, không phải đề thi chính thức hoặc
          cam kết điểm số. Thẻ trên trang chủ không phải dữ liệu học cá nhân. Bạn có thể chỉnh sửa
          nội dung mình lưu khi dịch vụ tài khoản hoạt động. Credits thử nghiệm không phải tiền mặt,
          không có giá trị quy đổi và hiện chưa được sử dụng để gọi AI.
        </p>
        <h2>Tính sẵn sàng và thay đổi</h2>
        <p>
          Bản phát triển có thể có gián đoạn hoặc thay đổi schema. Không dùng bản này làm nơi lưu
          trữ duy nhất cho tài liệu quan trọng. Chính sách mua hàng, hoàn tiền và hỗ trợ sẽ được
          công bố trước khi bật giao dịch thương mại.
        </p>
        <h2>Quyền riêng tư và kết thúc sử dụng</h2>
        <p>
          Việc xử lý dữ liệu được mô tả tại trang Quyền riêng tư. Công cụ xóa tài khoản và xuất dữ
          liệu phải được hoàn thiện trước khi mở P0 cho người dùng thực tế.
        </p>
      </main>
    </MarketingShell>
  );
}
