# VOCAFLOW — PRODUCT REQUIREMENTS & IMPLEMENTATION SPECIFICATION

> **Đọc trước khi code:** Đây là bản đặc tả yêu cầu (PRD) và chỉ dẫn thực thi cho một AI coding agent. Nhiệm vụ là **xây website chạy được**, không chỉ dựng giao diện tĩnh hay viết một bản kế hoạch. Mọi giá, giới hạn, tên sản phẩm dưới đây là **giả định để phát triển MVP**, phải có thể cấu hình thay đổi. Không được giả lập giao dịch thật hoặc tuyên bố kiếm được thu nhập.

## 0. Tóm tắt yêu cầu

- **Tên tạm thời:** VocaFlow (có thể đổi trong cấu hình).
- **Loại sản phẩm:** Website học từ vựng tiếng Anh cho người Việt; responsive (desktop, mobile), hỗ trợ PWA ở mức cơ bản.
- **Đối tượng chính:** Học sinh, sinh viên và người tự học tiếng Anh/TOEIC/IELTS.
- **Điểm khác biệt:** Người học nhập một từ tiếng Anh, hệ thống gợi ý thẻ từ đầy đủ bằng AI, người dùng chỉnh sửa trước khi lưu; ôn theo *spaced repetition*; theo dõi tiến độ.
- **Ngôn ngữ giao diện:** Tiếng Việt mặc định. **Trường Definition là nghĩa tiếng Việt, tất cả nội dung học từ còn lại là tiếng Anh** (word, example, synonyms, etymology, part of speech, IPA).
- **Mục tiêu kinh doanh:** Thu nhập từ (1) gói tín dụng AI mua một lần, (2) bộ từ vựng trả tiền, (3) quảng cáo cho tài khoản miễn phí khi có phê duyệt, (4) affiliate minh bạch. Subscription chỉ là phương án mở rộng sau này; MVP không bắt buộc subscription.
- **Ưu tiên:** Sản phẩm thực sự hữu dụng, rẻ để vận hành, có cơ chế hạn mức chống spam AI, dễ triển khai và kiểm thử.

## 1. Phạm vi và các mốc triển khai

### P0 — MVP bắt buộc: phải xong, chạy được end-to-end

1. Landing page giải thích giá trị + CTA đăng ký / dùng thử.
2. Đăng ký, đăng nhập, đăng xuất (Supabase Auth, ưu tiên email/password + Google nếu có cấu hình).
3. Dashboard: số từ đã lưu, số từ đến hạn ôn, streak theo ngày, nút “Ôn tập ngay”, thêm từ nhanh.
4. Thêm/sửa/xóa từ vựng thủ công; thêm bằng AI có preview và nút chấp nhận/chỉnh sửa.
5. Thư viện từ vựng: tìm kiếm, lọc theo loại từ, trạng thái học, sắp xếp theo mới thêm/đến hạn.
6. Flashcards, chế độ ôn và thuật toán lặp lại ngắt quãng có lưu trạng thái bền vững.
7. Trang thống kê: tổng từ, lượt ôn 7/30 ngày, số từ thuộc/đến hạn; không chế tác số liệu.
8. Ví credit AI: số dư, lịch sử dùng, trừ credit đúng quy tắc, mock AI an toàn ở môi trường dev khi chưa có khóa API.
9. Trang “Bộ từ vựng”: xem bộ mẫu miễn phí; thiết kế cấu trúc hỗ trợ bộ trả phí sau này.
10. Trang cài đặt, quyền riêng tư, điều khoản, xóa tài khoản và dữ liệu liên quan.
11. Admin cơ bản có phân quyền: tạo/chỉnh bộ từ, chỉnh thông tin affiliate, xem trạng thái đơn và giám sát AI usage.
12. Migrations SQL, seed demo, README, file .env.example, unit tests và e2e tối thiểu.

### P1 — Kiếm tiền (triển khai sau P0 nhưng kiến trúc phải sẵn sàng)

- Bán gói credit AI theo hình thức mua một lần.
- Bán bộ từ vựng chuyên đề (TOEIC 600, IELTS Academic Vocabulary, Business English...); hệ thống cấp quyền sở hữu sau thanh toán thành công.
- Kết nối cổng thanh toán qua adapter (ví dụ payOS) khi có credentials thật, tạo đơn phía server, xác thực callback/webhook bằng chữ ký, idempotency và kiểm tra amount.
- Hiển thị affiliate offers có nhãn **“Liên kết tiếp thị”**; ghi nhận click ẩn danh/phù hợp chính sách bảo mật, không tự tạo lượt nhấp.
- Chuẩn bị vị trí đặt quảng cáo nhưng **chỉ nạp AdSense khi đã được xét duyệt** và đủ điều kiện; tránh quảng cáo trên màn hình ôn tập làm mất tập trung.

### P2 — Sau khi có người dùng thật

- Import CSV, xuất CSV; chế độ quiz chọn đáp án / điền từ.
- TTS phát âm (browser SpeechSynthesis hoặc dịch vụ phù hợp, không bắt buộc trả phí).
- Bộ từ do giáo viên tạo, tài khoản giáo viên, nhóm lớp, B2B.
- Extension trình duyệt để lưu từ từ một trang web.
- Subscription premium nếu retention và willingness-to-pay phù hợp.
- Analytics chuyên sâu, thử nghiệm A/B sau khi có mẫu người dùng.

**Quy tắc:** Không để P1/P2 làm trì hoãn P0. Không tự phát minh thêm tính năng social/feed/chatbot phức tạp.

## 2. Luồng người dùng (User Flows)

### A. Lần đầu sử dụng

1. Mở `/` → hiểu lợi ích trong 5–10 giây.
2. Nhấn “Bắt đầu miễn phí” → `/auth/sign-up` → tạo tài khoản.
3. Vào `/app` → onboarding 3 bước ngắn (mục tiêu học, múi giờ, thêm từ đầu tiên); có thể bỏ qua.
4. Nhập `hurricane` → nhấn “Tạo thẻ bằng AI” hoặc “Tự nhập”.
5. Hệ thống hiển thị **preview**; người dùng kiểm tra/chỉnh và xác nhận lưu.
6. Từ xuất hiện trong thư viện; thẻ từ có lần ôn đầu tiên ngay khi thêm.

### B. Ôn tập hằng ngày

1. Dashboard hiển thị “Hôm nay cần ôn N từ” tính từ `due_at <= now()` theo timezone người dùng.
2. Nhấn “Ôn tập ngay” → xem mặt trước (word + pronunciation tùy thiết lập).
3. Nhấn “Lật thẻ” → xem definition, example, synonyms, etymology.
4. Chọn một trong 4 mức: `Again` / `Hard` / `Good` / `Easy` (hiển thị mô tả tiếng Việt).
5. Backend ghi lịch sử và cập nhật lịch ôn; UI chuyển từ kế tiếp.
6. Kết thúc phiên → hiện số từ đã ôn, đánh giá theo mức và thời điểm ôn tiếp dự kiến.

### C. Mua bộ từ / mua credit

1. `/packs` hoặc `/app/wallet` → chọn sản phẩm.
2. Backend tạo order ở trạng thái `pending`, ghi chính xác loại sản phẩm, giá và currency VND.
3. Người dùng chuyển sang trang thanh toán của provider nếu đã cấu hình; nếu chưa, chỉ có **Chế độ Demo / Thanh toán chưa khả dụng**, không tạo giao dịch giả.
4. Webhook được xác thực → order `paid` → cấp credit hoặc quyền sở hữu pack **đúng một lần**.
5. Giao dịch lỗi/hủy → không cấp sản phẩm; hiện trạng thái rõ ràng.

## 3. Giao diện & thiết kế (UI/UX)

### Phong cách

- Hiện đại, tối giản, sáng, nhiều khoảng trắng; cảm giác app học tập chứ không phải landing page bán hàng.
- Palette gợi ý: nền `#F8FAFC`, chữ chính `#0F172A`, primary `#4F46E5`, success `#059669`, neutral `#64748B`.
- Font dễ đọc (Inter hoặc font tương đương), bo góc khoảng 12–16 px, shadows nhẹ.
- Có dark mode nếu không làm chậm MVP; mọi nút/input có trạng thái hover, focus, loading, disabled, empty và error.
- Trên desktop: sidebar và content; mobile: bottom nav hoặc header gọn, thẻ full width.
- Ưu tiên truy cập: keyboard navigation, nhãn form, contrast hợp lý, thông báo lỗi dễ hiểu.

### Sitemap / Routes

| Route | Mục đích |
|---|---|
| `/` | Landing page: hero, lợi ích, minh họa 1 thẻ, cách hoạt động, CTA |
| `/auth/sign-up`, `/auth/login`, `/auth/reset-password` | Xác thực |
| `/app` | Dashboard |
| `/app/vocabulary` | Danh sách từ: search/filter/sort |
| `/app/vocabulary/new` | Tạo thẻ thủ công hoặc AI |
| `/app/vocabulary/[id]` | Xem/sửa thẻ |
| `/app/review` | Phiên ôn flashcard |
| `/app/statistics` | Thống kê học tập |
| `/app/wallet` | Credits + lịch sử + CTA mua thêm (P1) |
| `/packs`, `/packs/[slug]` | Cửa hàng bộ từ: miễn phí và trả tiền |
| `/app/settings` | Tài khoản, timezone, xóa tài khoản |
| `/privacy`, `/terms` | Chính sách |
| `/admin`, `/admin/packs`, `/admin/orders`, `/admin/offers` | Quản trị, chỉ role admin truy cập |

### Phân biệt widget web và widget màn hình điện thoại

- **Bắt buộc P0:** widget **“Từ hôm nay” nằm trên Dashboard**, mỗi ngày chọn một từ đã lưu để hiện `Word / IPA / Reveal meaning`, nút nghe phát âm nếu trình duyệt hỗ trợ, nút “Ôn ngay”. Cùng một user, cùng một ngày theo timezone sẽ thấy cùng một từ (chọn deterministic, không random mỗi lần refresh). Nếu chưa có từ, hiện CTA “Thêm từ đầu tiên”.
- **P0:** website responsive và có thể cài dạng PWA shortcut nếu khả thi, nhưng shortcut PWA **không phải** widget hệ điều hành.
- **P2, không giả vờ đã làm ở MVP:** widget thật trên **màn hình chính Android/iOS**, vì nó có thể cần native app hoặc native companion. Nếu triển khai, cần nghiên cứu hạn chế nền tảng riêng; không hứa một website thuần Next.js tạo được native home-screen widget.

### 5 màn hình cần chỉnh chu nhất

1. **Landing:** tiêu đề “Ghi nhớ từ vựng lâu hơn, không chỉ học thuộc hôm nay”; mô tả 3 bước `Thêm từ → AI gợi ý thẻ → Ôn đúng lúc`; một thẻ demo tương tác; CTA nổi bật.
2. **Dashboard:** greeting, thống kê 3–4 chỉ số, hành động thêm từ, số thẻ đến hạn; biểu đồ học tập 7 ngày; ô affiliate nếu có dữ liệu và người dùng đồng ý/không bị làm phiền.
3. **Add Word:** nhập từ, tùy chọn part of speech, nút AI; preview editable 6 trường; lỗi rõ khi AI hết credit; nút lưu chỉ bật khi dữ liệu hợp lệ.
4. **Library:** search tức thì, tags/status, bảng trên desktop và cards mobile; modal xác nhận xóa; empty state có nút thêm từ.
5. **Review:** flashcard lớn, tiến trình `3/12`, lật bằng click/Space, chấm bằng nút hoặc phím 1–4, animation nhẹ, không quảng cáo chen giữa.

### Format thẻ từ bắt buộc

Ví dụ dữ liệu và cách hiển thị:

```
Hurricane (n.) – /ˈhɝː.ɪ.keɪn/
Definition: Bão lớn, bão nhiệt đới
Example: The hurricane damaged several houses along the coast.
Synonyms: tropical cyclone, storm
Etymology: From Spanish huracán, borrowed from a Caribbean language.
```

Quy tắc:
- `word`: English; chuẩn hóa chữ thường để tìm trùng nhưng hiển thị giữ form hợp lý.
- `part_of_speech`: tiếng Anh dạng viết tắt (`n.`, `v.`, `adj.`, `adv.`, v.v.).
- `ipa`: IPA chuẩn, có thể để trống nếu không chắc chắn.
- `definition_vi`: chỉ trường này bằng **tiếng Việt**.
- `example_en`, `synonyms_en`, `etymology_en`: tiếng Anh.
- Không tự bịa nguồn gốc từ nếu thiếu độ tin cậy; trường etymology được phép để trống hoặc gắn “Needs verification”.
- Mỗi user có thể sửa mọi trường do AI đề xuất; tránh ghi đè thẻ đã được người dùng sửa.

## 4. Luật ôn lặp lại ngắt quãng (Spaced Repetition)

MVP dùng một thuật toán đơn giản, **quy tắc cố định để kiểm thử** (không cần tuyên bố là thuật toán tối ưu). Mỗi thẻ có `interval_days`, `ease_factor`, `repetitions`, `due_at`, `last_reviewed_at`.

- Thẻ mới: `interval_days=0`, `ease_factor=2.5`, `repetitions=0`, `due_at=now()`.
- `Again`: `repetitions=0`, `interval_days=0`, `ease_factor=max(1.3, ease_factor-0.2)`, `due_at=now()+10 minutes`.
- `Hard`: `repetitions += 1`, `interval_days=1` nếu trước đó bằng 0, ngược lại `max(1, ceil(old_interval*1.2))`; `ease_factor=max(1.3, ease_factor-0.15)`, `due_at=now()+interval_days days`.
- `Good`: `repetitions += 1`, `interval_days=1` nếu cũ bằng 0, ngược lại `max(2, ceil(old_interval*ease_factor))`; ease giữ nguyên; cộng số ngày tương ứng.
- `Easy`: `repetitions += 1`, `interval_days=4` nếu cũ bằng 0, ngược lại `max(4, ceil(old_interval*(ease_factor+0.5)))`; `ease_factor=min(3.0, ease_factor+0.15)`; cộng số ngày tương ứng.
- Review API ghi `review_events` và cập nhật `review_state` trong **cùng transaction**. Chống submit double-click bằng `request_id` duy nhất.
- Streak: số ngày lịch **liên tiếp** có ít nhất một review, tính theo timezone profile; không cộng streak cho việc chỉ đăng nhập.
- “Đã thuộc” chỉ là số từ có `interval_days >= 21` (ghi rõ đây là định nghĩa hiển thị trong sản phẩm, không khẳng định trí nhớ thật).

## 5. AI generation và credits

### API gợi ý từ

`POST /api/ai/generate-word` với `{ word, partOfSpeech? }`, trả về JSON hợp lệ có các trường `word`, `partOfSpeech`, `ipa`, `definitionVi`, `exampleEn`, `synonymsEn[]`, `etymologyEn`.

- Dùng nhà cung cấp AI thông qua adapter; cấu hình `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY` bằng environment variables ở **server**, không bao giờ gửi khóa tới client.
- Prompt yêu cầu ngữ cảnh từ thông dụng, một nghĩa phổ biến nhất; **không giải thích toàn bộ các nghĩa chưa yêu cầu**.
- Parse/validate bằng Zod; chống prompt injection từ chuỗi word; giới hạn độ dài input, lọc nội dung rác.
- Có cache theo từ chuẩn hóa + loại từ + phiên bản prompt để giảm tiền API; cache chỉ dùng cho gợi ý chung, không lưu dữ liệu riêng tư trong khóa cache.
- Không trừ credit khi provider timeout/không có output hợp lệ. Thực hiện kiểm soát số dư, ghi charge và log có idempotency; chống chạy song song khiến số dư âm.
- Free user được **15 credits thử nghiệm khi tạo tài khoản** (mức thử nghiệm, cấu hình được). Mỗi lần tạo gợi ý AI thành công tốn **1 credit**. Nhập thủ công hoàn toàn miễn phí.
- Không có khóa API ở môi trường local: hiển thị chế độ demo rõ ràng và trả 3 ví dụ hardcoded phục vụ test; không gọi đó là kết quả AI thật. Production thiếu API: ẩn nút hoặc thông báo đang tạm ngưng, vẫn thêm thủ công được.
- Có rate limit cho auth, AI, thanh toán, review và import. Không đưa PII vào AI request ngoài dữ liệu cần thiết.

### Ví dụ JSON

```json
{
  "word": "hurricane",
  "partOfSpeech": "n.",
  "ipa": "/ˈhɝː.ɪ.keɪn/",
  "definitionVi": "bão lớn, bão nhiệt đới",
  "exampleEn": "The hurricane damaged several houses along the coast.",
  "synonymsEn": ["tropical cyclone", "storm"],
  "etymologyEn": "From Spanish huracán, borrowed from a Caribbean language."
}
```

## 6. Kế hoạch doanh thu — Không bắt buộc subscription

### A. Credit packs (P1)

| SKU | Nội dung | Giá thử nghiệm |
|---|---|---|
| `credits_30` | 30 lượt AI | 19.000 VND |
| `credits_100` | 100 lượt AI | 49.000 VND |
| `credits_250` | 250 lượt AI | 99.000 VND |

Các mức giá **chỉ là giả định để test**; admin có thể sửa hoặc tắt. Không tự định nghĩa credits như tiền mặt. Có ledger để audit mọi cộng/trừ.

### B. Vocabulary packs (P1)

- Có ít nhất 1 pack mẫu miễn phí (20 từ mẫu tự tạo hợp lệ).
- Pack trả tiền ví dụ TOEIC: 49.000 VND/bộ; pack có preview 5 từ, chi tiết, số từ, mô tả, giá và nút mua.
- Khi mua thành công, user được “Thêm bộ này vào thư viện” (copy thẻ từ vào sở hữu cá nhân, tránh bản gốc thay đổi làm mất chỉnh sửa).
- Ngăn nhập trùng `normalized_word + part_of_speech` và báo đã thêm bao nhiêu / bỏ qua bao nhiêu.
- Tài liệu/từ phải tự tạo hoặc có quyền sử dụng; không scrape hoặc sao chép nội dung độc quyền.

### C. Ads (P1 hoặc sau khi đủ traffic)

- Thiết kế component `AdSlot` dùng cho homepage/dashboard/library; disabled mặc định.
- Chỉ bật nếu có AdSense client ID, được chấp thuận và phù hợp với policy. Không khẳng định RPM/doanh thu cố định.
- Không gắn ads vào nút ôn tập, không đặt làm giả nội dung hoặc vô tình khiến user click.

### D. Affiliate (P1)

- Quản trị danh sách offer: title, description, link, disclosure, category, active date, `is_active`.
- Render khuyến nghị liên quan sau phiên ôn hoặc ở trang tài nguyên; hiển thị nhãn rõ “Liên kết tiếp thị”.
- Dùng redirect server `/go/[slug]` với URL được allowlist/validate, logging tối thiểu, không open redirect.
- Không giả số click/sale/commission, không tự tạo fake reviews.

### E. Subscription / B2B (P2)

- Chỉ thiết kế hệ thống entitlement mở rộng; **không cần tích hợp subscription ở MVP**.
- Khi triển khai thêm, có thể mở không giới hạn AI, classroom, thống kê cho giáo viên; phải tính unit economics trước.

## 7. Công nghệ yêu cầu

Sử dụng **một stack nhất quán** để giảm thời gian phát triển:

- Next.js (App Router), TypeScript, React.
- Tailwind CSS và shadcn/ui (nếu phù hợp), Lucide icons.
- Supabase: PostgreSQL, Authentication, Row-Level Security (RLS), migrations SQL.
- TanStack Query (tùy chọn) hoặc server actions + revalidation thống nhất; không trộn nhiều kiểu fetch không cần thiết.
- Zod validation cho forms và API.
- Vitest để unit-test business logic; Playwright cho các luồng E2E chủ đạo.
- Triển khai gợi ý: Vercel + Supabase; README ghi rõ các bước setup, không tự tuyên bố đã deploy nếu chưa có credentials.
- Nếu cần email giao dịch, xây interface provider; production cần credentials; development dùng log adapter an toàn.
- Có logging server-side và giới hạn request. Không đưa Supabase service-role key vào bundle phía client.

**Điều quan trọng:** Dữ liệu nhạy cảm và quyền sở hữu do server xác nhận; client UI không phải là lớp kiểm soát bảo mật.

## 8. Sơ đồ dữ liệu (PostgreSQL)

Tạo migration cho ít nhất các bảng sau. Mọi PK là UUID trừ khi có lý do khác; mọi FK/index/unique constraint phải được tạo rõ:

| Table | Trường cốt lõi | Yêu cầu |
|---|---|---|
| `profiles` | `user_id`, `display_name`, `timezone`, `role`, `created_at` | gắn với auth user; role mặc định user |
| `vocabulary_items` | `id`, `user_id`, `word`, `normalized_word`, `part_of_speech`, `ipa`, `definition_vi`, `example_en`, `synonyms_en` (text[]), `etymology_en`, `source`, `created_at`, `updated_at` | unique `(user_id, normalized_word, part_of_speech)` |
| `review_states` | `vocabulary_item_id`, `user_id`, `interval_days`, `ease_factor`, `repetitions`, `due_at`, `last_reviewed_at` | 1:1 word; indexed `(user_id, due_at)` |
| `review_events` | `id`, `request_id`, `user_id`, `vocabulary_item_id`, `grade`, `reviewed_at`, `old_due_at`, `new_due_at` | unique `request_id` để tránh double charge/log |
| `credit_wallets` | `user_id`, `balance`, `updated_at` | balance >= 0 |
| `credit_transactions` | `id`, `user_id`, `delta`, `reason`, `reference_key`, `created_at` | unique `reference_key`; immutable ledger |
| `ai_requests` | `id`, `user_id`, `normalized_word`, `status`, `provider`, `model`, `credits_charged`, `created_at` | log lỗi không chứa API key |
| `vocabulary_packs` | `id`, `slug`, `title`, `description`, `price_vnd`, `is_published`, `created_at` | free nếu price=0 |
| `pack_words` | `id`, `pack_id`, `word`, `part_of_speech`, `ipa`, `definition_vi`, `example_en`, `synonyms_en`, `etymology_en`, `position` | nội dung pack thuộc quyền quản trị |
| `orders` | `id`, `user_id`, `kind`, `product_ref`, `amount_vnd`, `status`, `provider_ref`, `created_at`, `paid_at` | trạng thái `pending/paid/failed/canceled/refunded`; không tin client amount |
| `owned_packs` | `user_id`, `pack_id`, `order_id`, `created_at` | unique `(user_id, pack_id)` |
| `affiliate_offers` | `id`, `slug`, `title`, `description`, `url`, `is_active`, `created_at` | admin only |
| `affiliate_clicks` | `id`, `offer_id`, `user_id` nullable, `clicked_at` | ghi tối thiểu, tuân thủ privacy |

RLS bắt buộc trên bảng user-data: người dùng chỉ đọc/ghi hàng thuộc `auth.uid()`; truy cập admin và payment mutations chỉ ở server qua kiểm tra role/service boundary. Dữ liệu pack published có thể public read. Không cấp quyền người dùng tự sửa role, ví credit, trạng thái order hoặc pack ownership.

## 9. API / Server-side behavior

Danh sách endpoint gợi ý (có thể implement bằng Next.js Route Handlers hoặc Server Actions, nhưng phải rõ hợp đồng):

- `GET/POST /api/vocabulary`: list/create, phân trang cursor hoặc offset, tìm kiếm, validate và unique conflict.
- `GET/PATCH/DELETE /api/vocabulary/[id]`: chi tiết, sửa, xóa, kiểm tra ownership.
- `POST /api/ai/generate-word`: xác thực, rate-limit, credit, AI adapter, JSON schema.
- `GET /api/reviews/due`: trả danh sách đến hạn giới hạn mỗi phiên; không trả toàn bộ dữ liệu nếu không cần.
- `POST /api/reviews/grade`: body `{ wordId, grade, requestId }`, transaction và idempotent.
- `GET /api/statistics`: aggregate bằng server query, timezone đúng.
- `GET /api/wallet`: số dư + 20 giao dịch gần nhất.
- `GET /api/packs`, `GET /api/packs/[slug]`: danh sách và preview; kiểm quyền để lấy nội dung full.
- `POST /api/packs/[slug]/import`: chỉ user có quyền sở hữu/free pack.
- `POST /api/orders`: P1; đọc giá/SKU từ DB/server, không tin `amount` client.
- `POST /api/webhooks/payment`: P1; verify signature, replay guard, event idempotency.
- `GET /go/[slug]`: chỉ redirect offer được admin duyệt.

Trả lỗi chuẩn `{ error: { code, message } }`; 401 khi chưa đăng nhập, 403 khi không có quyền, 409 khi duplicate, 429 khi rate-limit, 500 khi lỗi server. Hạn chế đưa stack trace ra client.

## 10. Quy tắc sản phẩm & bảo mật

- Người dùng không bắt buộc dùng AI; chức năng học cốt lõi chạy khi AI lỗi hoặc hết credits.
- Tạo profile và 15 credits lần đầu **một lần duy nhất**, không cấp lại khi reload/relogin.
- Một từ có thể có nhiều loại từ và được xem là hai mục từ khác nhau; cùng từ + cùng POS trong một tài khoản thì không tạo trùng.
- Server kiểm soát toàn bộ permissions. Chặn SQL injection, XSS, CSRF phù hợp framework, mass assignment và open redirect.
- Người dùng có thể export và xóa thông tin học tập của chính mình; nêu chính xác loại dữ liệu giữ lại vì lý do giao dịch/pháp lý nếu có.
- Không trả thông tin email/user khác trong API. Không hardcode secrets.
- Thông báo rõ “Nội dung do AI gợi ý có thể sai. Hãy kiểm tra trước khi lưu.”
- Trước khi public production phải hoàn thiện privacy, terms, consent quảng cáo/cookies phù hợp khu vực áp dụng.
- SEO: metadata cho landing/pack public, sitemap, robots; private app pages không index.

## 11. Cấu trúc thư mục gợi ý

```text
vocaflow/
├── app/
│   ├── (marketing)/
│   ├── (auth)/auth/
│   ├── (app)/app/
│   │   ├── vocabulary/
│   │   ├── review/
│   │   ├── statistics/
│   │   ├── wallet/
│   │   └── settings/
│   ├── admin/
│   └── api/
├── components/
│   ├── ui/
│   ├── vocabulary/
│   ├── review/
│   ├── dashboard/
│   └── monetization/
├── lib/
│   ├── supabase/
│   ├── ai/
│   ├── billing/
│   ├── reviews/
│   ├── validation/
│   └── auth/
├── supabase/migrations/
├── tests/unit/
├── tests/e2e/
├── public/
├── .env.example
└── README.md
```

Có thể thay đổi layout khi có lý do kỹ thuật, nhưng giữ **business logic tách UI** để unit test được.

## 12. Kiểm thử & tiêu chí nghiệm thu (Acceptance Criteria)

Định nghĩa “xong P0” chỉ khi:

1. Một người chưa có tài khoản đăng ký → thêm từ thủ công → vào library → ôn thẻ → thấy lịch ôn mới trong DB → xem thống kê, không lỗi.
2. Thử thêm từ AI với mock/dev adapter → có preview editable → lưu → bị trừ đúng 1 credit; nếu AI giả lập lỗi thì không bị trừ.
3. Login/logout, password reset, route protection hoạt động; tài khoản A không đọc/sửa được từ của B kể cả sửa trực tiếp API/ID.
4. Thêm trùng cùng word+POS có thông báo rõ; không phát sinh hai state cho cùng word.
5. Chấm thẻ 2 lần với cùng `requestId` không tạo hai review event hoặc thay lịch lần thứ hai.
6. Thuật toán review có unit tests cho Again/Hard/Good/Easy, thời gian đến hạn, giới hạn ease.
7. Dashboard/statistics đọc dữ liệu thật (DB) chứ không hiển thị số giả.
8. Luồng free pack import hoạt động, chặn trùng; pack trả tiền không nhập được nếu chưa có entitlement.
9. Admin route bị cấm với tài khoản thường; quản trị bộ từ/offer hoạt động với role admin.
10. Có loading/empty/error states, UI usable ở 375 px, 768 px, 1440 px; không lỗi hydration rõ ràng.
11. Chạy `lint`, `typecheck`, `test`, `build` thành công; Playwright có ít nhất 1 happy path và 1 unauthorized test.
12. README có hướng dẫn tạo Supabase project, chạy migrations, cấu hình env, seed, setup local, run test, hướng deploy, bước production checklist.

### Thử nghiệm P1 cần có thêm

- Webhook sai signature → reject; webhook hợp lệ gửi lặp → không cộng credit/pack hai lần.
- Thay `amount_vnd` ở client → không đổi số tiền order do server tính.
- Sau thanh toán thành công, user được đúng entitlement; khi thất bại không được cấp.
- Affiliate link có disclosure và không redirect ra host trái phép.
- AdSlot không được bật khi thiếu cấu hình/approval.

## 13. Đầu ra cuối cùng agent phải bàn giao

1. Full source code trong repo; ứng dụng chạy local.
2. SQL migrations + RLS policies + test seeds.
3. `.env.example` có giải thích từng key, không có giá trị thật.
4. README ngắn gọn nhưng đủ chạy từ máy mới.
5. Ảnh chụp hoặc bản mô tả kết quả các màn hình chính; không chỉ đưa mockup.
6. Kết quả lint/typecheck/test/build và danh sách lỗi nếu còn.
7. Danh sách P0 đã hoàn thành, P1/P2 chưa làm, chi phí vận hành có thể phát sinh (AI, hosting, database, domain, payment fee).
8. Chỉ báo “deployed” nếu thực tế deploy xong và có URL kiểm chứng.

## 14. Hướng dẫn thực hiện cho coding agent

- **Bắt đầu bằng** (a) rà soát repo hiện tại, (b) xác nhận stack/toolchain, (c) tạo kế hoạch 5–8 bước theo thứ tự ưu tiên, (d) thực hiện code ngay.
- Nếu repo trống, scaffold Next.js + TS + Tailwind, tạo `.env.example`, SQL migration và Supabase utilities trước.
- Làm theo thứ tự: Auth/RLS → CRUD vocabulary → review state + scheduler → dashboard/stats → AI adapter + wallet → free packs → admin → tests/docs. Sau P0 mới làm payment và ads.
- Với bất kỳ dịch vụ nào chưa có credential: tạo adapter và demo mode **minh bạch**, không tự khẳng định integration production hoạt động.
- Kiểm tra build/test sau mỗi giai đoạn; tự sửa lỗi cho tới khi luồng chủ đạo chạy được.
- Khi gặp điểm chưa xác định, dùng mặc định hợp lý và ghi trong README/`DECISIONS.md` thay vì dừng quá sớm hỏi nhiều câu. **Riêng chi tiền thật, dùng API bên thứ ba mất phí hoặc deploy production**: yêu cầu xác nhận và credential hợp lệ trước.
- Không kết thúc với câu “đây là ý tưởng”; hãy bàn giao code, cách chạy và bảng trạng thái tính năng.

---

**Bản chất sản phẩm:** VocaFlow là **công cụ học từ vựng có giá trị miễn phí**, có thể kiếm tiền từ các tiện ích mua một lần và sản phẩm bổ sung. Chỉ số thành công đầu tiên không phải doanh thu giả định mà là tỷ lệ người dùng quay lại ôn từ mỗi tuần.
