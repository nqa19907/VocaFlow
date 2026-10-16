# Quyết định M1 — 16/10/2026

1. **Repository rỗng:** chỉ có spec, không có AGENTS.md hoặc code để giữ lại. Dựng app ngay tại `E:\Qlearn`, không tạo thư mục project lồng hoặc chuyển stack.
2. **Phạm vi lần bàn giao:** theo yêu cầu bắt đầu và làm milestone đầu tiên; M1 bao gồm một lát cắt có ích Auth → manual CRUD → database. Chưa tuyên bố toàn bộ P0 xong.
3. **Next.js 16 + Supabase SSR:** cookie refresh ở `proxy.ts`; xác thực lại tại data/API. Không dùng session object chưa xác minh để quyết định quyền.
4. **Thiếu credentials:** không tự tạo Supabase project, không deploy, không gọi AI trả phí; app hiện setup rõ ràng. Không dùng JSON file/localStorage/demo Auth thay dữ liệu thật.
5. **UI primitives:** Tailwind và các component React nhỏ, không thêm trọn bộ shadcn khi M1 chưa cần. Native `dialog` cho focus trap/Escape của xác nhận xóa.
6. **DB tests:** máy chưa có Docker/Supabase CLI/Postgres. Dùng PGlite chạy PostgreSQL/migration/RLS thật cùng auth bootstrap tối thiểu chỉ trong test. Cần kiểm tra Auth/PostgREST thật riêng.
7. **Đơn vị dữ liệu:** word normalize ở DB trigger để cả direct PostgREST cũng chống trùng; duplicate theo user+normalized word+POS. Tạo review state bằng trigger cùng transaction. Chưa có endpoint chấm thẻ.
8. **Bảo vệ các trường có quyền cao:** column grants và RLS, role không lấy từ user metadata; ví/ledger/order/entitlement/review state chỉ read với authenticated user. Dữ liệu thương mại mới là schema, chưa có flow giao dịch.
9. **Trial grant:** cấu hình DB `private.app_config.trial_credits`, mặc định 15, cấp đúng một lần bởi auth insert trigger. Chưa tiêu credit ở M1.
10. **Khả năng truy cập:** system font để build không phụ thuộc tải font, focus styles, labels, skip link, reduced-motion, responsive, phân biệt dữ liệu thật và thẻ minh họa.
11. **Origin:** URL local chuẩn `http://localhost:3000`, mutation kiểm tra Origin với env tin cậy; không tin Host do client gửi để tạo email link/redirect.
12. **Khởi tạo công khai:** private app force-dynamic/noindex; landing có sitemap/robots. Legal là bản phát triển được ghi rõ, chưa đủ để public thương mại.
