-- VocaFlow M1. Run as the migration owner (Supabase postgres role).
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.app_config (
  key text primary key,
  value jsonb not null
);
insert into private.app_config values ('trial_credits', '15');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  timezone text not null default 'Asia/Ho_Chi_Minh',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin');
$$;
-- Schema is not exposed through PostgREST; policies may execute this helper.
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create table public.vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  word text not null check (char_length(word) between 1 and 100),
  normalized_word text not null default '',
  part_of_speech text not null check (part_of_speech in ('n.', 'v.', 'adj.', 'adv.', 'pron.', 'prep.', 'conj.', 'interj.', 'phr.')),
  ipa text not null default '' check (char_length(ipa) <= 200),
  definition_vi text not null check (char_length(definition_vi) between 1 and 2000),
  example_en text not null default '' check (char_length(example_en) <= 2000),
  synonyms_en text[] not null default '{}' check (cardinality(synonyms_en) <= 20),
  etymology_en text not null default '' check (char_length(etymology_en) <= 2000),
  source text not null default 'manual' check (source in ('manual', 'ai', 'pack')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, normalized_word, part_of_speech),
  unique (id, user_id)
);
create index vocabulary_user_created_idx on public.vocabulary_items(user_id, created_at desc);

create table public.review_states (
  vocabulary_item_id uuid primary key,
  user_id uuid not null,
  interval_days integer not null default 0 check (interval_days >= 0),
  ease_factor numeric(4,2) not null default 2.5 check (ease_factor between 1.3 and 3.0),
  repetitions integer not null default 0 check (repetitions >= 0),
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  foreign key (vocabulary_item_id, user_id) references public.vocabulary_items(id, user_id) on delete cascade
);
create index review_user_due_idx on public.review_states(user_id, due_at);

create table public.review_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  user_id uuid not null,
  vocabulary_item_id uuid not null,
  grade text not null check (grade in ('again', 'hard', 'good', 'easy')),
  reviewed_at timestamptz not null default now(),
  old_due_at timestamptz not null,
  new_due_at timestamptz not null,
  foreign key (vocabulary_item_id, user_id) references public.vocabulary_items(id, user_id) on delete cascade
);
create index review_events_user_time_idx on public.review_events(user_id, reviewed_at desc);

create table public.credit_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);
create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null check (delta <> 0),
  reason text not null,
  reference_key text not null unique,
  created_at timestamptz not null default now()
);
create index credit_transactions_user_time_idx on public.credit_transactions(user_id, created_at desc);

create table public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null unique,
  normalized_word text not null,
  status text not null check (status in ('pending', 'succeeded', 'failed')),
  provider text not null,
  model text not null,
  credits_charged integer not null default 0 check (credits_charged >= 0),
  created_at timestamptz not null default now()
);
create index ai_requests_user_time_idx on public.ai_requests(user_id, created_at desc);

create table public.vocabulary_packs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  description text not null default '',
  price_vnd integer not null default 0 check (price_vnd >= 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.pack_words (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.vocabulary_packs(id) on delete cascade,
  word text not null,
  part_of_speech text not null,
  ipa text not null default '',
  definition_vi text not null,
  example_en text not null default '',
  synonyms_en text[] not null default '{}',
  etymology_en text not null default '',
  position integer not null check (position >= 0),
  unique (pack_id, position)
);
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('credits', 'pack')),
  product_ref text not null,
  amount_vnd integer not null check (amount_vnd >= 0),
  currency text not null default 'VND' check (currency = 'VND'),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'canceled', 'refunded')),
  provider_ref text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index orders_user_time_idx on public.orders(user_id, created_at desc);
create table public.owned_packs (
  user_id uuid not null references auth.users(id) on delete cascade,
  pack_id uuid not null references public.vocabulary_packs(id) on delete cascade,
  order_id uuid references public.orders(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (user_id, pack_id)
);
create index owned_packs_pack_idx on public.owned_packs(pack_id);

create table public.affiliate_offers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  url text not null check (url ~ '^https://'),
  disclosure text not null default 'Liên kết tiếp thị',
  category text not null default '',
  is_active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create table public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.affiliate_offers(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  clicked_at timestamptz not null default now()
);
create index affiliate_clicks_offer_time_idx on public.affiliate_clicks(offer_id, clicked_at);

create function private.prepare_vocabulary() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.word := btrim(regexp_replace(new.word, '\s+', ' ', 'g'));
  new.normalized_word := lower(new.word);
  if new.word = '' or new.word !~ '^[a-zA-Z][a-zA-Z ''’.-]*$' then
    raise exception 'Invalid English word' using errcode = '23514';
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger prepare_vocabulary before insert or update on public.vocabulary_items
for each row execute function private.prepare_vocabulary();

create function private.initialize_review() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.review_states(vocabulary_item_id, user_id) values (new.id, new.user_id);
  return new;
end;
$$;
create trigger initialize_review after insert on public.vocabulary_items
for each row execute function private.initialize_review();

create function private.validate_timezone() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not exists(select 1 from pg_timezone_names where name = new.timezone) then
    raise exception 'Invalid timezone' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger validate_timezone before insert or update on public.profiles
for each row execute function private.validate_timezone();

create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare trial integer;
begin
  select (value #>> '{}')::integer into trial from private.app_config where key = 'trial_credits';
  trial := greatest(0, coalesce(trial, 15));
  insert into public.profiles(user_id, display_name)
    values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 80));
  insert into public.credit_wallets(user_id, balance) values (new.id, trial);
  if trial > 0 then
    insert into public.credit_transactions(user_id, delta, reason, reference_key)
    values (new.id, trial, 'trial_grant', 'trial:' || new.id::text);
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function private.handle_new_user();

-- Atomic, shared rate limits. No process-local counters in a serverless deployment.
create table private.rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null,
  window_start timestamptz not null,
  hits integer not null,
  primary key (user_id, bucket)
);
create function public.consume_rate_limit(bucket_name text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); current_hits integer;
begin
  if actor is null or bucket_name not in ('vocabulary', 'profile') then return false; end if;
  insert into private.rate_limits as limits(user_id, bucket, window_start, hits)
  values (actor, bucket_name, date_trunc('minute', now()), 1)
  on conflict (user_id, bucket) do update set
    hits = case when limits.window_start = excluded.window_start then limits.hits + 1 else 1 end,
    window_start = excluded.window_start
  returning hits into current_hits;
  return current_hits <= 30;
end;
$$;
revoke all on function public.consume_rate_limit(text) from public, anon;
grant execute on function public.consume_rate_limit(text) to authenticated;

-- Start closed. Explicit column grants prevent role/owner/source/timestamp assignment.
revoke all on public.profiles, public.vocabulary_items, public.review_states,
  public.review_events, public.credit_wallets, public.credit_transactions,
  public.ai_requests, public.vocabulary_packs, public.pack_words, public.orders,
  public.owned_packs, public.affiliate_offers, public.affiliate_clicks from anon, authenticated;
alter table public.profiles enable row level security;
create policy own_profile_read on public.profiles for select to authenticated using (user_id = (select auth.uid()));
create policy own_profile_update on public.profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select on public.profiles to authenticated;
grant update (display_name, timezone) on public.profiles to authenticated;

alter table public.vocabulary_items enable row level security;
create policy own_vocabulary on public.vocabulary_items for all to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select, delete on public.vocabulary_items to authenticated;
grant insert (user_id, word, part_of_speech, ipa, definition_vi, example_en, synonyms_en, etymology_en) on public.vocabulary_items to authenticated;
grant update (word, part_of_speech, ipa, definition_vi, example_en, synonyms_en, etymology_en) on public.vocabulary_items to authenticated;

alter table public.review_states enable row level security;
alter table public.review_events enable row level security;
alter table public.credit_wallets enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.ai_requests enable row level security;
alter table public.orders enable row level security;
alter table public.owned_packs enable row level security;
create policy own_review_states on public.review_states for select to authenticated using (user_id = (select auth.uid()));
create policy own_review_events on public.review_events for select to authenticated using (user_id = (select auth.uid()));
create policy own_wallet on public.credit_wallets for select to authenticated using (user_id = (select auth.uid()));
create policy own_ledger on public.credit_transactions for select to authenticated using (user_id = (select auth.uid()));
create policy own_ai_requests on public.ai_requests for select to authenticated using (user_id = (select auth.uid()));
create policy own_orders on public.orders for select to authenticated using (user_id = (select auth.uid()) or private.is_admin());
create policy own_packs on public.owned_packs for select to authenticated using (user_id = (select auth.uid()));
grant select on public.review_states, public.review_events, public.credit_wallets, public.credit_transactions, public.ai_requests, public.orders, public.owned_packs to authenticated;

alter table public.vocabulary_packs enable row level security;
create policy published_packs on public.vocabulary_packs for select to anon, authenticated using (is_published);
create policy admin_packs on public.vocabulary_packs for all to authenticated using (private.is_admin()) with check (private.is_admin());
grant select on public.vocabulary_packs to anon, authenticated;
grant insert, update, delete on public.vocabulary_packs to authenticated;

alter table public.pack_words enable row level security;
create policy visible_pack_words on public.pack_words for select to anon, authenticated using (
  exists(select 1 from public.vocabulary_packs p where p.id = pack_id and p.is_published and (p.price_vnd = 0 or position < 5))
);
create policy owned_pack_words on public.pack_words for select to authenticated using (
  exists(select 1 from public.owned_packs o where o.pack_id = pack_words.pack_id and o.user_id = (select auth.uid()))
);
create policy admin_pack_words on public.pack_words for all to authenticated using (private.is_admin()) with check (private.is_admin());
grant select on public.pack_words to anon, authenticated;
grant insert, update, delete on public.pack_words to authenticated;

alter table public.affiliate_offers enable row level security;
alter table public.affiliate_clicks enable row level security;
create policy admin_offers on public.affiliate_offers for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy admin_clicks on public.affiliate_clicks for select to authenticated using (private.is_admin());
grant select, insert, update, delete on public.affiliate_offers to authenticated;
grant select on public.affiliate_clicks to authenticated;

-- Trigger helpers must not be callable through RPC.
revoke all on function private.handle_new_user(), private.prepare_vocabulary(), private.initialize_review(), private.validate_timezone() from public, anon, authenticated;
revoke all on function private.is_admin() from public, anon;
