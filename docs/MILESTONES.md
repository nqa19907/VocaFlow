# Kế hoạch triển khai

Đọc toàn bộ `VOCAFLOW_AGENT_SPEC.md` trước khi code. Ưu tiên P0, không triển khai thanh toán thực khi thiếu credentials/xác nhận.

| Mốc     | Phạm vi                                                                                             | Trạng thái                                           |
| ------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| M1      | Toolchain, UI shell, migration/RLS, Auth, profile, manual vocabulary CRUD                           | Đã triển khai; live Supabase Auth/CRUD chưa xác nhận |
| M2      | Scheduler đúng spec, RPC review transaction/idempotency, flashcard, history                         | Chưa làm                                             |
| M3      | Dashboard đầy đủ, streak timezone, 7/30-day stats, deterministic daily word                         | Chỉ có counts DB tối thiểu ở M1                      |
| M4      | AI provider/dev adapter minh bạch, Zod output, cache, wallet ledger, atomic credits/idempotency     | Chỉ có schema + trial grant ở M1                     |
| M5      | Pack miễn phí 20 từ/import chống trùng, admin role boundary/UI, offer config/usage/order monitoring | Chỉ có schema/RLS, draft seed                        |
| M6      | Onboarding, export/delete account, PWA, accessibility, integrated P0 E2E, production docs/policies  | Chưa làm; test/docs M1 có sẵn                        |
| M7 / P1 | SKU/config, payment adapter/webhook, commerce entitlements, approved affiliate/ads                  | Chưa làm; không trì hoãn P0                          |

## Điều kiện chuyển mốc

- M1: build/lint/typecheck/unit/database/browser smoke pass; chạy happy path thật khi có Supabase test. Code dùng dịch vụ thật, không bypass Auth/RLS bằng demo storage.
- M2: test scheduler từng grade và giới hạn ease; cùng requestId chỉ ghi 1 event; transaction update/event; concurrency locking; tài khoản khác không chấm được thẻ.
- M3: chỉ aggregates DB, timezone đúng, streak chỉ tăng khi có review, daily word ổn định theo ngày/user, empty state thật.
- M4: timeout/invalid output không charge; idempotent/concurrent generation không âm ví; key server-only; production không có provider thì thông báo unavailable.
- M5: paid words không lộ ngoài preview, import kiểm entitlement và report inserted/skipped; admin APIs kiểm role trên server, dữ liệu không giả.
- M6: toàn bộ 12 acceptance criteria P0 trong spec, thêm test hồi quy ownership trên Supabase; chính sách/account controls đầy đủ trước public.
- M7: chỉ bắt đầu sau P0; thực hiện adapter, chữ ký, amount server-side, replay/idempotency tests trước khi cân nhắc bật giao dịch thật.
