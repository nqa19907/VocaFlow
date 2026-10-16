# VocaFlow

Website học ngôn ngữ dành cho người Việt, với các mục TOPIK (tiếng Hàn), IELTS/SAT (tiếng Anh) và HSK (tiếng Trung). Nền tảng tài khoản/thư viện được xây dựng theo `VOCAFLOW_AGENT_SPEC.md` với Supabase PostgreSQL/Auth. Hướng giao diện và nội dung public được cập nhật theo yêu cầu đa ngôn ngữ; kết nối Supabase hiện tạm gác lại. Chưa hoàn thành toàn bộ P0 hoặc deploy production.

## Đã triển khai ở M1

- Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4, Lucide; UI tiếng Việt, desktop sidebar/mobile bottom navigation.
- Landing có thẻ minh họa tương tác, đăng ký/đăng nhập/đăng xuất, xác nhận email, quên/đổi mật khẩu. Google chỉ hiện khi được cấu hình.
- Auth SSR với cookie refresh qua `proxy.ts`; kiểm tra người dùng lại tại page/data/API bằng `auth.getUser()`.
- Thêm, xem, sửa, xóa từ thủ công; preview editable, tìm kiếm debounce, lọc POS, sắp xếp mới/cũ/A–Z, phân trang 20 từ; xác nhận xóa, empty/loading/error states.
- Dashboard tối thiểu đọc **số từ, số thẻ đến hạn và credit thực từ DB**. Chưa có streak, chart, daily word hoặc thao tác chấm flashcard.
- Hồ sơ, múi giờ; schema 13 bảng sản phẩm, RLS, FK/index/unique, auto review-state trigger; profile/ví/ledger cấp thử một lần khi tạo auth user.
- Origin check, JSON giới hạn 16 KiB, Zod strict chống mass assignment, rate limit mutation chia sẻ trong PostgreSQL; lỗi API có cấu trúc.
- Test validation/RLS bằng PostgreSQL nhúng (PGlite), browser smoke/responsive bằng Playwright, một test CRUD Supabase thật có điều kiện.

**Chưa triển khai:** AI/charge/cache, scheduler/grade transaction, lịch sử ôn, statistics/streak/daily word, wallet history, packs import, admin UI, xuất/xóa tài khoản, PWA, payment, affiliate redirect, ads. Các bảng tương ứng chỉ là nền tảng; không có API giả cho các tính năng này. Xem [kế hoạch](docs/MILESTONES.md) và [báo cáo kiểm tra](docs/M1_REPORT.md).

## Các trang public

Menu website chuyển giữa các URL riêng bằng Next.js Link, có trạng thái mục đang chọn và menu mở/đóng trên điện thoại. Các chức năng tài khoản/thư viện tiếp tục nằm trong `/app` và cần Supabase.

| Trang                         | URL                  |
| ----------------------------- | -------------------- |
| Trang chủ                     | `/`                  |
| TOPIK — tiếng Hàn             | `/topik`             |
| IELTS — tiếng Anh             | `/ielts`             |
| SAT — tiếng Anh học thuật     | `/sat`               |
| HSK — tiếng Trung giản thể    | `/hsk`               |
| Trợ giúp — câu hỏi thường gặp | `/help`              |
| Quyền riêng tư và điều khoản  | `/privacy`, `/terms` |

Menu chính chỉ gồm TOPIK, IELTS, SAT, HSK theo đúng thứ tự; logo dẫn về trang chủ. Mỗi mục mở URL riêng. Các trang hướng dẫn cách học, cẩm nang và giới thiệu tính năng cũ đã được xóa, không còn trong sitemap hoặc liên kết giao diện.

Mỗi chương trình hiện có bộ khởi đầu 6 từ (24 từ tổng cộng), câu ví dụ và bản dịch được biên soạn trong `lib/content/courses.ts`. Mỗi câu ví dụ làm nổi bật từ đang học; bản dịch tiếng Việt chỉ hiện bên dưới sau khi lật thẻ. Người dùng có thể tìm kiếm theo từ/nghĩa/phiên âm, lật thẻ, làm bài trắc nghiệm, xem đáp án và điểm của lượt đang mở, rồi luyện lại. Đây là nội dung học thật, không phải dữ liệu người dùng giả hoặc đề thi chính thức. Chưa có giáo trình luyện thi đầy đủ; kết quả không được lưu lâu dài khi rời/tải lại trang.

Giao diện dùng nền giấy ấm, màu riêng cho từng chương trình, font Be Vietnam Pro tự host và font hệ thống cho tiếng Hàn/Trung. Trang chủ có thẻ chuyển ba ngôn ngữ; header nổi và menu điện thoại. Khi chưa kết nối dịch vụ dữ liệu, form tài khoản hiển thị trạng thái tạm đóng và phần thiết lập thu gọn; các bài học public vẫn hoạt động.

## Phát âm

Phiên âm hiển thị ngay dưới từ ở trang chủ, cả hai mặt thẻ từ và câu hỏi luyện tập: IPA giọng Mỹ cho tiếng Anh, chữ Latin cho tiếng Hàn, pinyin có dấu thanh cho tiếng Trung. Dữ liệu phiên âm nằm cùng từ vựng trong `lib/content/courses.ts`, không tự suy đoán từ chữ viết.

Nút loa trên trang chủ, các thẻ từ, câu ví dụ và phần luyện tập dùng Web Speech API của trình duyệt. Tiếng Anh chọn giọng `en-US` (hoặc giọng tiếng Anh phù hợp có sẵn), tiếng Hàn `ko-KR`, tiếng Trung ưu tiên giọng Quan thoại `zh-CN`. Đọc nguyên bản từ/câu, không đọc phiên âm Latin thay thế. Nhấn lại để dừng; chọn từ khác hoặc chuyển trang sẽ dừng âm thanh trước đó.

Không cần API key, Supabase hoặc dịch vụ TTS trả phí do ứng dụng tích hợp. Ở trang IELTS/SAT, bộ chọn **Giọng tiếng Anh** liệt kê các giọng thực tế của thiết bị và lưu lựa chọn trong trình duyệt; chế độ Tự động ưu tiên giọng nữ Natural/Neural, rồi đến các giọng nữ và giọng tiếng Anh tương thích khác. Tốc độ được hạ nhẹ để trọng âm dễ nghe hơn. Chất lượng và ngôn ngữ khả dụng phụ thuộc giọng được trình duyệt/hệ điều hành cung cấp. Nếu thiếu giọng đúng ngôn ngữ, ứng dụng báo để cài thêm giọng trên thiết bị; không dùng giọng tiếng Anh để đọc tiếng Hàn/Trung. Một số giọng của thiết bị dùng dịch vụ mạng. Tính năng chỉ đọc văn bản, không thu âm hoặc chấm phát âm của người học.

Code chung: `lib/speech/browser.ts`, `components/learning/pronunciation-button.tsx`. Kiểm thử unit và E2E dùng Speech API giả lập **chỉ trong môi trường test** để kiểm tra chọn ngôn ngữ, tải giọng chậm, dừng/chuyển âm thanh và lỗi. Kiểm thử tự động không xác nhận chất lượng âm thanh nghe thực tế trên từng thiết bị.

## Chạy từ máy mới

Yêu cầu: Node.js **22+** (đã kiểm tra với 24.18.1), npm. Chạy tại thư mục repository:

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev
```

Mở **http://localhost:3000**. Trên Linux/macOS dùng `npm` và `cp .env.example .env.local`. Windows đang chặn `npm.ps1` có thể dùng `npm.cmd`, không cần nới Execution Policy.

Chưa điền Supabase: landing/legal/form vẫn chạy, nút Auth bị vô hiệu hóa, `/app` chuyển `/setup`, API dữ liệu trả `503 SETUP_REQUIRED`. Không có đăng nhập demo, localStorage thay DB hoặc số liệu học giả.

## Kiểm tra kết nối Supabase

Điền Project URL và publishable key trong `.env.local`, sau đó chạy:

```powershell
npm.cmd run db:check
```

Lệnh này kiểm tra Auth và khả năng truy cập schema bộ từ VocaFlow bằng request chỉ đọc, giới hạn thời gian 10 giây. Nó không in keys, không tạo tài khoản, không chạy migration và không sửa dữ liệu. Thiếu env, sai key hoặc chưa có migration sẽ trả exit code 1; trạng thái có env không được coi là đã kết nối thành công.

Nếu dùng ứng dụng Supabase để cấp quyền quản lý project, hãy cài và kết nối tài khoản trước. Không cần gửi secret/service-role key trong chat. Publishable key đủ để chạy website, nhưng **không đủ quyền chạy migrations**: bước đó cần Supabase CLI đã đăng nhập/link, SQL Editor hoặc kết nối quản trị project đã được cấp phép.

Xem [bản cập nhật giao diện và trạng thái kết nối](docs/UI_REFRESH.md).

## Thiết lập Supabase Cloud

1. Tạo project **riêng cho VocaFlow**. Chọn region và lưu database password theo quy trình của bạn.
2. Trong SQL Editor, chạy toàn bộ `supabase/migrations/202610160001_foundation.sql` **một lần**, với quyền migration owner. Hoặc dùng Supabase CLI: `supabase login`, `supabase link --project-ref <ref>`, `supabase db push`. Không chạy `db reset` với dữ liệu production.
3. Điền `.env.local`:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

4. Auth → URL Configuration: Site URL `http://localhost:3000`; Redirect URLs gồm `http://localhost:3000/auth/callback` và `http://localhost:3000/auth/callback?next=/app/settings&recovery=1`. Production dùng domain HTTPS tương ứng, không wildcard rộng.
5. Bật email/password, bật confirm email, minimum password length **10**. Cấu hình SMTP trước khi dùng thực tế: SMTP mặc định của Supabase chỉ gửi đến địa chỉ trong team của organization và có hạn mức thấp, nên chưa đủ cho đăng ký/reset công khai. Xem [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp). Dùng CAPTCHA và cấu hình rate limits Auth cho môi trường public; app không tự dựng giới hạn in-memory.
6. Email Templates nên dùng token hash để xác nhận hoạt động cả khi mở email ở trình duyệt khác:
   - Confirm signup: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup`
   - Reset password: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`
   - Callback PKCE `/auth/callback` cũng được hỗ trợ khi dùng link mặc định trong cùng browser.
7. Dừng/khởi động lại dev server sau khi thay env. Production cần **build lại** khi thay biến `NEXT_PUBLIC_*`.
8. Đăng ký → xác nhận email → đăng nhập → thêm từ → kiểm tra library/dashboard; xem test thật bên dưới.

Publishable key (hoặc legacy anon key) được phép xuất hiện ở client; quyền dữ liệu do JWT/RLS quyết định. **Không** dùng service-role/secret key làm `NEXT_PUBLIC_*`. M1 không cần service-role key để vận hành.

Google (tùy chọn): bật provider trong Supabase, cấu hình OAuth consent/redirect của Google theo Supabase, rồi đặt `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`. Chưa xác nhận Google hoạt động trong môi trường bàn giao.

## Supabase local (cần Docker + Supabase CLI)

```powershell
supabase start
supabase db reset
supabase status
```

`db reset` chỉ dùng với local/test; áp migrations và seed. Điền API URL/publishable hoặc anon key local vào `.env.local`. Xem email test qua Mailpit URL do `supabase status` trả về. Port cấu hình trong `supabase/config.toml`.

Seed M1 chỉ tạo **một draft pack không công khai**, chưa có nội dung. Không seed user, review, order hoặc số dư giả. Bộ 20 từ gốc và import là M5.

Trial credits cấu hình trong DB, trước khi tạo tài khoản:

```sql
update private.app_config set value = '15'::jsonb where key = 'trial_credits';
```

Trigger chỉ cấp một lần khi insert `auth.users`; đăng nhập lại không cấp thêm. Ví chưa hỗ trợ tiêu/mua credit. Không sửa số dư bằng tay: khi mở chức năng credit phải dùng transaction và ledger.

Sau migrations có thể tái sinh types với `npm.cmd run db:types` (cần Supabase CLI/local đang chạy). File types hiện tại là contract viết tay cho các bảng đã dùng trong M1, không tuyên bố là toàn bộ schema tự sinh.

## Kiểm thử

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

- Unit/database tests chạy độc lập, không cần Supabase, không truy cập dữ liệu thực. PGlite chạy migration thực với schema `auth` và roles tối thiểu **chỉ dành cho test**; không thay thế tích hợp Supabase Auth/PostgREST.
- E2E public kiểm tra thẻ minh họa, điều hướng đăng ký, private routes/API, setup, không tràn ngang ở **375/768/1440/1920 px** và lỗi JS ở luồng public. Ảnh landing/login/signup sinh tại `.artifacts/screenshots/`.
- Test Supabase CRUD sẽ **skip** khi chưa cấu hình, không được tính là một happy path Auth đã pass. Có sẵn một happy path public đã chạy; tiêu chí happy path đầy đủ P0 vẫn chưa đạt.
- Có Chromium cài sẵn: có thể đặt `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` tới executable tương ứng. Mặc định dùng browser do Playwright cài.
- Playwright tự mở server nếu cần. Nếu Windows chặn dọn cây tiến trình, chạy dev server ở terminal riêng trước, sau đó test sẽ dùng lại server; tự đóng terminal dev khi xong.
- Để kiểm tra giao diện bản production: chạy `npm.cmd run build`, đặt `$env:PLAYWRIGHT_PRODUCTION='true'`, rồi chạy E2E khi chưa có dev server dùng port 3000. Bỏ biến này để quay về chế độ dev.

Test Supabase thật cần **project local/test tách biệt**, đã chạy migrations, và service-role key chỉ trong môi trường test. Playwright không tự đọc `.env.local`; export các biến sau vào terminal (không commit secrets):

```powershell
$env:E2E_SUPABASE='true'
$env:NEXT_PUBLIC_SUPABASE_URL='http://127.0.0.1:54321'
$env:NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='<local-publishable-or-anon-key>'
$env:SUPABASE_SERVICE_ROLE_KEY='<local-service-role-key>'
npm.cmd run test:e2e
```

Remote **test** project cần thêm `E2E_ALLOW_REMOTE_TEST_DB=true` để tránh chạy nhầm production. Test tạo tài khoản xác nhận email bằng Auth Admin để kiểm tra login/CRUD/duplicate/delete/logout, rồi xóa trong `finally`. Nó **không** kiểm tra email delivery, signup confirmation hoặc reset email. Các luồng này cần kiểm tra qua Mailpit/SMTP; chưa được xác nhận trong bàn giao M1.

## API M1

| Endpoint                     | Hợp đồng                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `GET /api/health`            | Liveness + trạng thái có env, **không phải** database readiness                 |
| `GET /api/vocabulary`        | `q`, `pos`, `sort=newest/oldest/word`, `page`; trả `{data,count,page,pageSize}` |
| `POST /api/vocabulary`       | JSON thẻ thủ công, server gắn user; 201                                         |
| `GET /api/vocabulary/:id`    | Dữ liệu thuộc tài khoản; 404 nếu không thấy/không thuộc                         |
| `PATCH /api/vocabulary/:id`  | Một hoặc nhiều trường nội dung; không nhận user/source/role                     |
| `DELETE /api/vocabulary/:id` | Xóa thẻ + cascade review state/events; 204                                      |

Trường JSON: `word`, `part_of_speech`, `ipa`, `definition_vi`, `example_en`, `synonyms_en` (array), `etymology_en`. `word`, POS, nghĩa bắt buộc khi tạo. Chỉ nghĩa bằng tiếng Việt, các trường học còn lại bằng tiếng Anh/IPA; app hướng dẫn quy tắc ngôn ngữ nhưng không thể tự xác minh chính xác ngôn ngữ của mọi câu nhập tay.

Mutation API dùng session cookies và yêu cầu `Origin` trùng `NEXT_PUBLIC_SITE_URL`. Các request kiểm thử bằng curl cần gửi Origin đúng. Không lấy user ID hoặc giá/quyền từ client. Lỗi `{error:{code,message}}`: 400 validation, 401 chưa login, 403 forbidden/origin, 404 không thấy, 409 trùng, 413 quá kích thước, 415 content type, 429 rate limit, 503 chưa cấu hình, 500 lỗi hệ thống.

Giới hạn mutation qua app: 30/phút/user/bucket, lưu trong DB; không phải giới hạn chống DDoS toàn hệ thống. Direct PostgREST vẫn chịu RLS/column grants nhưng không đi qua rate limit Next API. Đặt gateway/WAF/quota theo tải trước public. Không có AI/payment/import endpoint ở M1.

## Kiến trúc và bảo mật

- `app/`: Server Components đọc DB; Route Handlers cho CRUD; Server Actions cho Auth/Profile. Client chỉ chứa state biểu mẫu và thao tác UI.
- `lib/validation/`: input contracts; `lib/auth/`: session/actions/redirect; `lib/supabase/`: typed SSR/browser clients; `lib/api/`: error/origin/body/rate-limit helpers.
- RLS tất cả 13 bảng public; vocabulary insert/update có column grants. Người dùng không được đổi role/owner/source/timestamps, sửa ví/ledger/order/entitlement hoặc tự ghi review state/event.
- Role mặc định `user` và không lấy từ signup metadata. Admin chỉ được cấp qua DB/migration tin cậy; admin UI sẽ có ở M5. Published pack public read, paid pack chỉ preview 5 từ nếu chưa có quyền.
- Cơ sở cho các transaction review/AI/payment nằm ở schema; **chưa có RPC thực hiện các giao dịch này**. Không thể suy ra các tính năng P1 đã hoàn thành từ bảng.

## Deploy và điều kiện trước public

Chưa deploy. Với Vercel: import source, chọn Node 22/24, thêm env của production, chạy migrations qua quy trình release, sửa Supabase Site/Redirect URLs sang domain HTTPS, rồi build. Mỗi thay đổi public env cần redeploy. Không để service-role key trong bundle/log.

Trước public P0 cần hoàn thành M2–M6: tests Auth/ownership trên Supabase thật, review idempotency transaction, AI/credit concurrency, packs/admin, export/delete account, terms/privacy/contact/retention chính thức, SMTP, Auth CAPTCHA/rate limits, WAF/backups/monitoring và kiểm tra accessibility của toàn bộ màn hình. Không nạp AdSense trước approval; thanh toán vẫn tắt khi chưa có credentials và xác nhận.

Chi phí có thể phát sinh: Supabase DB/Auth/SMTP, hosting, domain và AI khi bật provider; P1 có thể có phí payment provider. Bản M1 chưa gọi AI trả phí và chưa xử lý thanh toán.

## Nguồn kỹ thuật

Theo hướng dẫn chính thức [Next.js App Router](https://nextjs.org/docs/app/getting-started/installation) và [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs). Dependency được khóa trong `package-lock.json`; dùng `npm ci` để lặp lại bản đã kiểm tra.
