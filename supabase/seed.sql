-- Development/test fixture only. Never seed fake users, reviews, orders or balances.
-- Original sample content; unpublished until pack management is implemented in M5.
insert into public.vocabulary_packs(slug, title, description, price_vnd, is_published)
values ('everyday-essentials', 'Everyday Essentials', 'Bộ từ miễn phí do VocaFlow biên soạn. Đang chuẩn bị nội dung.', 0, false)
on conflict (slug) do nothing;
