# Báo cáo milestone 1 — 16/10/2026

## Phạm vi bàn giao

Source code thực tại repository, không chỉ mockup. M1 gồm scaffold Next.js/TypeScript/Tailwind, Auth Supabase, schema/RLS, hồ sơ, từ vựng thủ công và dashboard counts tối thiểu. **P0 chưa hoàn thành.**

Các phần cần credential dùng Supabase SDK thật. Môi trường bàn giao không có Supabase project/env, Docker hoặc Supabase CLI. Chưa thể xác nhận đăng ký/email/login/CRUD qua Supabase Auth + PostgREST. Không thay bằng mock ở runtime.

## Kết quả kiểm tra

| Kiểm tra                                                                   | Kết quả                                                                |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `npm run lint`                                                             | Pass, không warning                                                    |
| `npm run typecheck`                                                        | Pass                                                                   |
| `npm test`                                                                 | 35 pass: 18 validation, 5 HTTP/security, 12 PostgreSQL/RLS             |
| `npm run build`                                                            | Pass production build; private app routes dynamic                      |
| Playwright suite, không có Supabase config                                 | 6 pass, 1 skip (live Supabase CRUD)                                    |
| Playwright unauthorized, có config **chỉ dành cho test**, không có session | 1 pass bổ sung: `/app` redirect login, vocabulary API GET/POST trả 401 |
| Auth/CRUD với Supabase test thật                                           | Chưa chạy; test có điều kiện đã viết                                   |
| Email signup/reset, Google OAuth                                           | Chưa xác nhận với provider thật                                        |
| Production deployment                                                      | Chưa thực hiện                                                         |

Lượt unauthorized bổ sung dùng URL local và publishable key placeholder **chỉ trong tiến trình test** để chạy đường code không có session. Không chạy Supabase server, không lưu vào `.env.local`, không phải bằng chứng một backend Supabase hoạt động.

PGlite thực thi migration SQL và RLS bằng PostgreSQL nhúng. Auth schema/roles tối thiểu là fixture của test, không phải Supabase Auth giả dùng cho sản phẩm. Các invariant đã kiểm tra:

- Signup trigger tạo role user, ví 15 credits và 1 ledger entry; metadata `role=admin` bị bỏ qua.
- Chuẩn hóa từ, unique word+POS theo user; cùng word khác POS được phép.
- Insert từ và review-state ban đầu trong cùng transaction; duplicate không để state thừa.
- Tài khoản B không đọc/sửa/xóa dữ liệu A; không giả ownership khi insert.
- Không tự sửa role, ví, ledger, order, entitlement, owner hay trạng thái ôn.
- Timezone hợp lệ; shared rate limit; pack draft bị ẩn; non-admin không tạo pack.
- Paid pack chỉ lộ 5 preview words khi chưa có ownership; anon không đọc user data.
- Xóa thẻ cascade state, xóa tài khoản thử nghiệm cascade dữ liệu thuộc user.
- PATCH từng trường không ghi đè các trường không gửi; JSON size/origin/content type được kiểm tra.

## Các màn hình

- **Landing:** sáng, primary indigo, thẻ “serendipity” lật được và gắn nhãn minh họa; CTA tới signup; không chế tác số người học/hiệu quả/doanh thu.
- **Auth:** layout hai cột desktop, form gọn trên mobile, trạng thái chưa thiết lập rõ ràng; không cho submit khi thiếu config.
- **App shell:** sidebar desktop, bottom nav mobile; chỉ điều hướng đến màn hình đã có.
- **Dashboard:** counts lấy từ DB; thẻ đến hạn đã có state nhưng chưa có phiên chấm flashcard.
- **Library:** bảng desktop/cards mobile, search/POS/sort/pagination, duplicate error, confirm delete.
- **Add/edit:** preview nội dung cập nhật khi nhập, giữ đủ trường thẻ; trường etymology không chắc có thể để trống.
- **Settings:** hồ sơ/múi giờ/mật khẩu/đăng xuất; ghi rõ export/delete account chưa khả dụng.

Browser QA thực tế mới xác nhận landing, Auth và setup/private redirect; app cần đăng nhập chưa được QA bằng browser với backend thật. Không nhận screenshots fixture làm bằng chứng integration.

Ảnh thực từ browser, sinh lại bởi test:

- [Landing desktop](../.artifacts/screenshots/landing-1440.png)
- [Landing mobile](../.artifacts/screenshots/landing-375.png)
- [Login desktop](../.artifacts/screenshots/login-1440.png)
- [Login mobile](../.artifacts/screenshots/login-375.png)

Ảnh 768 px cũng có trong cùng thư mục. Ảnh là artifact local được gitignore; người clone repository chạy E2E để sinh lại. Đã xem ảnh desktop/mobile để kiểm tra bố cục, sửa contrast chữ phụ; chưa thực hiện audit accessibility đầy đủ.

## Việc còn lại

Milestone 2 triển khai scheduler/flashcard/atomic grade/idempotency; M3 statistics/streak/daily word; M4 AI/credits; M5 free pack/admin; M6 hoàn tất P0 và kiểm tra trên Supabase thật. Lộ trình chi tiết tại [MILESTONES.md](MILESTONES.md).

Các bảng thương mại **không đồng nghĩa** đã có giao dịch. Chưa tích hợp payment, chưa gọi AI trả phí, chưa nạp quảng cáo, chưa giả số liệu. Chính sách pháp lý đang là bản phát triển, cần hoàn thiện cùng chức năng xuất/xóa tài khoản trước public.

Chi phí khi đưa vào vận hành có thể gồm hosting, database/Auth/SMTP, domain; AI/payment provider chỉ phát sinh khi thực sự tích hợp và bật ở milestone sau.

## Chạy và tiếp tục

Xem [README](../README.md), [.env.example](../.env.example), [migration](../supabase/migrations/202610160001_foundation.sql) và [DECISIONS.md](../DECISIONS.md). Với credential test đã cấu hình, chạy `E2E_SUPABASE=true npm run test:e2e` theo lệnh tương ứng hệ điều hành trong README để xác nhận phần Auth/CRUD thật trước nghiệm thu integration.
