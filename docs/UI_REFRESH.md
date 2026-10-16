# Giao diện học đa ngôn ngữ — 16/10/2026

Theo yêu cầu cập nhật sản phẩm: bỏ các phần Cách học, Cẩm nang và Không gian học; chuyển trọng tâm sang nội dung học tiếng Hàn, tiếng Anh và tiếng Trung. Supabase tiếp tục được tạm gác lại.

## Cấu trúc mới

- Menu TOPIK → IELTS → SAT → HSK, mỗi mục là URL riêng: `/topik`, `/ielts`, `/sat`, `/hsk`.
- Trang chủ giới thiệu các chương trình và thẻ tương tác chuyển giữa tiếng Hàn/Anh/Trung.
- Xóa các route hướng dẫn cũ, nội dung bài cẩm nang, hình minh họa và CSS tương ứng. Các URL cũ trả 404 và không còn trong sitemap.
- Footer, tài khoản, trợ giúp và metadata dùng nội dung đa ngôn ngữ; không còn dẫn về các mục đã xóa.

## Nội dung học hiện có

Mỗi chương trình có bộ khởi đầu 6 từ được biên soạn riêng, tổng cộng 24 từ. Mỗi từ có nghĩa tiếng Việt, câu ví dụ, bản dịch và phiên đọc khi phù hợp. Nội dung nằm trong `lib/content/courses.ts`; không phải đề thi chính thức hoặc giáo trình luyện thi đầy đủ.

- Tìm kiếm theo từ, phiên đọc, nghĩa và câu ví dụ.
- Lật thẻ để xem nghĩa và bản dịch tiếng Việt dưới câu ví dụ; từ đang học được làm nổi bật trong câu.
- Bài trắc nghiệm nhận diện nghĩa có phản hồi đúng/sai, đáp án, tiến độ, điểm thực của lượt làm và nút luyện lại.
- Tab hỗ trợ bàn phím; menu điện thoại đóng bằng Escape hoặc chọn trang.

Lượt luyện tập chỉ ở bộ nhớ của trang đang mở. Không có lịch sử hoặc số liệu học được giả lập; chưa lưu kết quả vào tài khoản.

## Kiểm tra và chạy

Chạy `npm.cmd run dev`, mở `http://localhost:3000` hoặc một trong bốn URL chương trình.

Các lệnh kiểm tra đầy đủ và giới hạn phần tài khoản nằm trong [README](../README.md). Ảnh kiểm tra responsive sinh tại `.artifacts/screenshots/`.

Đã xác minh: lint, format, TypeScript và production build đạt; 39 kiểm thử unit/database đạt; 12 kiểm thử trình duyệt production đạt. Kiểm thử kết nối Supabase thật được bỏ qua. Giao diện được kiểm tra ở 375/768/1440/1920 px; bài luyện TOPIK được kiểm tra đủ 6 câu, điểm số và đặt lại lượt làm.

## Phát âm

Nút loa có ở từ vựng, câu ví dụ, phần luyện tập và thẻ trang chủ. Web Speech API đọc nguyên bản tiếng Anh, Hàn hoặc Trung bằng giọng phù hợp do trình duyệt cung cấp. Nhấn lại để dừng, chọn nội dung khác sẽ hủy âm thanh cũ; điều hướng hoặc đổi chế độ cũng dừng đọc. Thiếu giọng đọc hoặc không hỗ trợ sẽ có thông báo, không chuyển sang giọng sai ngôn ngữ.

Không cần Supabase/API key và chưa tích hợp dịch vụ TTS trả phí. Đây là đọc mẫu, chưa thu âm/chấm phát âm. Giọng trên từng máy có thể cần cài thêm và có thể dùng mạng qua nhà cung cấp của trình duyệt/hệ điều hành.

Kiểm tra sau khi thêm phát âm: tổng cộng 63 kiểm thử unit/database và 20 kiểm thử trình duyệt đạt, một kiểm thử Supabase thật được bỏ qua. Speech API chỉ được giả lập trong kiểm thử; chất lượng âm thanh thực tế trên từng thiết bị chưa được xác nhận bằng nghe trực tiếp.
