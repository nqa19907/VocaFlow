import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/shell";
export const metadata: Metadata = { title: "Quyền riêng tư" };
export default function Privacy() {
  return (
    <MarketingShell>
      <main id="main" className="legal">
        <h1>Chính sách quyền riêng tư</h1>
        <div className="notice">
          Bản dành cho môi trường phát triển, cập nhật 16/10/2026. Thông tin đơn vị vận hành, liên
          hệ và nghĩa vụ pháp lý cần được bổ sung trước khi phát hành công khai.
        </div>
        <h2>Dữ liệu được xử lý</h2>
        <p>
          VocaFlow sử dụng email và thông tin xác thực do Supabase Auth quản lý; tên hiển thị, múi
          giờ, các thẻ từ do bạn lưu và trạng thái học trong PostgreSQL. Ví credit và sổ giao dịch
          lưu các khoản cấp credit thử nghiệm. Milestone hiện tại chưa gọi AI và chưa xử lý thanh
          toán.
        </p>
        <p>
          Bài luyện công khai TOPIK, IELTS và HSK xử lý lựa chọn câu trả lời ngay trong trang.
          Kết quả không được gửi lên máy chủ hoặc lưu vào tài khoản trong phiên bản hiện tại.
        </p>
        <h2>Mục đích và quyền truy cập</h2>
        <p>
          Dữ liệu phục vụ đăng nhập, xây thư viện cá nhân và chuẩn bị lịch ôn. Chính sách Row-Level
          Security giới hạn người dùng ở dữ liệu của chính tài khoản mình. Nhân sự vận hành có quyền
          quản trị hạ tầng vẫn có thể truy cập theo quyền được cấp; không nên lưu thông tin nhạy cảm
          trong nội dung học.
        </p>
        <h2>Cookie và dịch vụ</h2>
        <p>
          Cookie xác thực cần thiết được dùng để duy trì phiên đăng nhập. Bản hiện tại không nạp
          quảng cáo, công cụ theo dõi tiếp thị hoặc analytics bên thứ ba. Supabase là nhà cung cấp
          xác thực và cơ sở dữ liệu; khu vực lưu dữ liệu phụ thuộc project do đơn vị triển khai
          chọn.
        </p>
        <p>
          Khi bạn nhấn nút nghe, tính năng phát âm dùng dịch vụ giọng đọc của trình duyệt hoặc hệ
          điều hành. Một số giọng có thể cần mạng và xử lý văn bản qua nhà cung cấp giọng đọc.
          VocaFlow không ghi âm hoặc yêu cầu quyền microphone cho tính năng này.
        </p>
        <h2>Quyền quản lý dữ liệu</h2>
        <p>
          Bạn có thể chỉnh sửa và xóa từng thẻ từ trong thư viện; lịch ôn và lịch sử liên quan sẽ
          được xóa theo. Chức năng tự xuất dữ liệu và xóa tài khoản chưa có ở milestone 1 và là yêu
          cầu phải hoàn thiện trước khi phát hành P0.
        </p>
        <h2>Lưu giữ và thay đổi</h2>
        <p>
          Bản này chưa tạo giao dịch thanh toán và chưa có chính sách giữ dữ liệu giao dịch độc lập.
          Trước khi triển khai thương mại, đơn vị vận hành cần công bố thời hạn lưu giữ, cách thực
          hiện yêu cầu về dữ liệu, địa chỉ liên hệ và thông tin bên xử lý có liên quan.
        </p>
      </main>
    </MarketingShell>
  );
}
