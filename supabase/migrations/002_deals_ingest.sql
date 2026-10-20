-- =============================================================================
-- KSAM DEAL - MIGRATION 002: DEALS INGESTION, STORES, SEARCH & WISHLIST
-- Idempotent migration for deal aggregation, price tracking, search demand,
-- affiliate click logging, and wishlist functionality.
-- =============================================================================

-- Enable required extensions
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

-- -----------------------------------------------------------------------------
-- 1. STORES TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  logo_url text,
  base_url text,
  is_enabled boolean not null default false,
  affiliate_program text,
  created_at timestamptz not null default now()
);

-- Ensure columns exist if table was partially created previously
alter table public.stores add column if not exists slug text;
alter table public.stores add column if not exists logo_url text;
alter table public.stores add column if not exists base_url text;
alter table public.stores add column if not exists is_enabled boolean not null default false;
alter table public.stores add column if not exists affiliate_program text;
alter table public.stores add column if not exists created_at timestamptz not null default now();

-- Ensure unique slug constraint if not present
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'stores_slug_key'
  ) then
    alter table public.stores add constraint stores_slug_key unique (slug);
  end if;
exception
  when others then null;
end $$;

-- Seed the 11 target Indian stores (all disabled by default until credentials are set)
insert into public.stores (name, slug, base_url, logo_url, is_enabled, affiliate_program)
values
  ('Amazon India', 'amazon', 'https://www.amazon.in', 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg', false, 'Amazon Associates (PA-API 5.0)'),
  ('Amazon Store', 'amazon-store', 'https://www.amazon.in', 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg', false, 'Amazon Associates'),
  ('Flipkart', 'flipkart', 'https://www.flipkart.com', 'https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-448295.svg', false, 'Flipkart Affiliate / Network Feed'),
  ('Shopsy', 'shopsy', 'https://www.shopsy.in', 'https://static-assets-web.flixcart.com/shopsy-web/static/images/shopsy_logo.png', false, 'Affiliate Network Feed'),
  ('Myntra', 'myntra', 'https://www.myntra.com', 'https://constant.myntassets.com/web/assets/img/icon.5d340f834141703692e4.png', false, 'Affiliate Network (Cuelinks / vCommission)'),
  ('AJIO', 'ajio', 'https://www.ajio.com', 'https://assets.ajio.com/static/img/favicon.ico', false, 'Affiliate Network (Cuelinks / vCommission)'),
  ('Meesho', 'meesho', 'https://meesho.com', 'https://images.meesho.com/images/pow/meesho_logo_new.svg', false, 'Disabled (No public affiliate API)'),
  ('Lenskart', 'lenskart', 'https://www.lenskart.com', 'https://static.lenskart.com/media/desktop/img/site-images/main_logo.svg', false, 'Affiliate Network (Cuelinks / vCommission)'),
  ('Croma', 'croma', 'https://www.croma.com', 'https://media.croma.com/image/upload/v1704284478/Croma%20Assets/CMS/Brand%20Logo/croma_logo.png', false, 'Affiliate Network (Cuelinks / vCommission)'),
  ('JioMart', 'jiomart', 'https://www.jiomart.com', 'https://www.jiomart.com/assets/ds2web/jds-icons/jiomart-logo.svg', false, 'Affiliate Network (Cuelinks / vCommission)'),
  ('Paytm Mall', 'paytm-mall', 'https://paytmmall.com', 'https://paytmmall.com/favicon.ico', false, 'Disabled (Marketplace program discontinued)')
on conflict (slug) do update set
  name = excluded.name,
  base_url = excluded.base_url,
  logo_url = coalesce(public.stores.logo_url, excluded.logo_url),
  affiliate_program = excluded.affiliate_program;

-- -----------------------------------------------------------------------------
-- 2. PRODUCTS TABLE EXTENSIONS
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Extend products with all required deals fields
alter table public.products add column if not exists store_id uuid references public.stores(id) on delete set null;
alter table public.products add column if not exists external_id text;
alter table public.products add column if not exists title text;
alter table public.products add column if not exists brand text;
alter table public.products add column if not exists category text;
alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists additional_images jsonb default '[]'::jsonb;
alter table public.products add column if not exists price numeric;
alter table public.products add column if not exists old_price numeric;
alter table public.products add column if not exists discount_percent numeric;
alter table public.products add column if not exists currency text default 'INR';
alter table public.products add column if not exists rating numeric default 0;
alter table public.products add column if not exists reviews int default 0;
alter table public.products add column if not exists availability text default 'In Stock';
alter table public.products add column if not exists product_url text;
alter table public.products add column if not exists affiliate_url text;
alter table public.products add column if not exists tags text[] default '{}'::text[];
alter table public.products add column if not exists is_active boolean not null default true;
alter table public.products add column if not exists is_featured boolean not null default false;
alter table public.products add column if not exists first_seen_at timestamptz not null default now();
alter table public.products add column if not exists last_seen_at timestamptz not null default now();
alter table public.products add column if not exists price_updated_at timestamptz not null default now();
alter table public.products add column if not exists source text;
alter table public.products add column if not exists raw jsonb default '{}'::jsonb;
alter table public.products add column if not exists search_vector tsvector;

-- Keep title and name synchronized
update public.products set title = name where title is null and name is not null;
update public.products set name = title where name is null and title is not null;

-- Ensure unique (store_id, external_id)
create unique index if not exists products_store_external_idx
  on public.products (store_id, external_id)
  where store_id is not null and external_id is not null;

-- Performance indexes for deals discovery
create index if not exists products_discount_percent_idx on public.products (discount_percent desc nulls last);
create index if not exists products_last_seen_idx on public.products (last_seen_at desc);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_is_active_idx on public.products (is_active) where is_active = true;
create index if not exists products_is_featured_idx on public.products (is_featured) where is_featured = true;

-- Full-text and Trigram indexes
create index if not exists products_search_vector_idx on public.products using gin (search_vector);
create index if not exists products_name_trgm_idx on public.products using gin (name gin_trgm_ops);

-- Trigger to maintain search_vector and discount_percent
create or replace function public.products_maintain_fields()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Keep name and title consistent
  if new.name is null and new.title is not null then
    new.name := new.title;
  elsif new.title is null and new.name is not null then
    new.title := new.name;
  end if;

  -- Maintain discount_percent (never negative, null if old_price is invalid)
  if new.old_price is not null and new.price is not null and new.old_price > new.price and new.old_price > 0 then
    new.discount_percent := round(((new.old_price - new.price) / new.old_price) * 100);
  else
    new.discount_percent := null;
  end if;

  -- Maintain tsvector for full-text search
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.brand, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.category, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.tags, ' '), '')), 'C');

  return new;
end;
$$;

drop trigger if exists trg_products_maintain_fields on public.products;
create trigger trg_products_maintain_fields
  before insert or update on public.products
  for each row execute function public.products_maintain_fields();

-- Populate fields on existing rows
update public.products
set
  discount_percent = case
    when old_price is not null and price is not null and old_price > price and old_price > 0
    then round(((old_price - price) / old_price) * 100)
    else null
  end,
  search_vector =
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(brand, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(category, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'C')
where search_vector is null or discount_percent is null;

-- -----------------------------------------------------------------------------
-- 3. PRICE HISTORY TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  price numeric not null,
  old_price numeric,
  captured_at timestamptz not null default now()
);

create index if not exists price_history_product_captured_idx
  on public.price_history (product_id, captured_at desc);

-- -----------------------------------------------------------------------------
-- 4. INGEST RUNS LOG TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.ingest_runs (
  id uuid primary key default gen_random_uuid(),
  store_slug text,
  trigger text not null check (trigger in ('cron', 'search', 'manual')),
  query text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  fetched int not null default 0,
  upserted int not null default 0,
  deactivated int not null default 0,
  status text not null default 'running',
  error text
);

create index if not exists ingest_runs_started_at_idx
  on public.ingest_runs (started_at desc);

-- -----------------------------------------------------------------------------
-- 5. SEARCH DEMAND TABLE (Popular queries refresh)
-- -----------------------------------------------------------------------------
create table if not exists public.search_demand (
  query_normalized text primary key,
  hits int not null default 1,
  last_searched_at timestamptz not null default now(),
  last_fetched_at timestamptz
);

create index if not exists search_demand_hits_idx
  on public.search_demand (hits desc, last_searched_at desc);

-- -----------------------------------------------------------------------------
-- 6. WISHLIST TABLE
-- -----------------------------------------------------------------------------
create table if not exists public.wishlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists wishlist_user_idx on public.wishlist (user_id);

-- -----------------------------------------------------------------------------
-- 7. OUTBOUND CLICKS TABLE (Affiliate Click Analytics)
-- -----------------------------------------------------------------------------
create table if not exists public.outbound_clicks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  clicked_at timestamptz not null default now(),
  source text default 'deal_card'
);

create index if not exists outbound_clicks_product_idx on public.outbound_clicks (product_id);
create index if not exists outbound_clicks_clicked_at_idx on public.outbound_clicks (clicked_at desc);

-- -----------------------------------------------------------------------------
-- 8. DEACTIVATE STALE PRODUCTS & CLEANUP FUNCTIONS
-- -----------------------------------------------------------------------------
create or replace function public.deactivate_stale_products(max_age interval default interval '3 days')
returns integer
language plpgsql
security definer
as $$
declare
  updated_count integer;
begin
  update public.products
  set is_active = false
  where is_active = true
    and last_seen_at < (now() - max_age);

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

create or replace function public.purge_old_deal_data()
returns void
language plpgsql
security definer
as $$
begin
  -- Retain price history for 180 days to keep database small on free tier
  delete from public.price_history
  where captured_at < (now() - interval '180 days');

  -- Retain ingest logs for 30 days
  delete from public.ingest_runs
  where started_at < (now() - interval '30 days');

  -- Retain inactive products not seen in 60 days
  delete from public.products
  where is_active = false
    and last_seen_at < (now() - interval '60 days')
    and not exists (select 1 from public.wishlist where product_id = products.id);
end;
$$;

-- -----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.price_history enable row level security;
alter table public.ingest_runs enable row level security;
alter table public.search_demand enable row level security;
alter table public.wishlist enable row level security;
alter table public.outbound_clicks enable row level security;

-- Stores: Public read-only
drop policy if exists "stores_public_select" on public.stores;
create policy "stores_public_select"
  on public.stores for select
  to public
  using (true);

-- Products: Public can only select active deals (or service role for writes)
drop policy if exists "products_public_select" on public.products;
create policy "products_public_select"
  on public.products for select
  to public
  using (is_active = true);

-- Price History: Public read-only
drop policy if exists "price_history_public_select" on public.price_history;
create policy "price_history_public_select"
  on public.price_history for select
  to public
  using (true);

-- Wishlist: Own-rows read/insert/delete for authenticated users
drop policy if exists "wishlist_select_own" on public.wishlist;
create policy "wishlist_select_own"
  on public.wishlist for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "wishlist_insert_own" on public.wishlist;
create policy "wishlist_insert_own"
  on public.wishlist for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "wishlist_delete_own" on public.wishlist;
create policy "wishlist_delete_own"
  on public.wishlist for delete
  to authenticated
  using (auth.uid() = user_id);

-- Outbound clicks: Public insert-only (no public select)
drop policy if exists "outbound_clicks_insert_any" on public.outbound_clicks;
create policy "outbound_clicks_insert_any"
  on public.outbound_clicks for insert
  to anon, authenticated
  with check (true);

-- Ingest runs & Search demand: No public access (service_role only)
-- (No policies created, so anon/authenticated cannot access)

-- -----------------------------------------------------------------------------
-- 10. OBSERVABILITY VIEWS (For Supabase Dashboard)
-- -----------------------------------------------------------------------------
create or replace view public.v_ingest_health as
select
  store_slug,
  count(*) as total_runs,
  count(*) filter (where status = 'completed') as successful_runs,
  count(*) filter (where status = 'error') as failed_runs,
  sum(fetched) as total_fetched,
  sum(upserted) as total_upserted,
  max(finished_at) as last_finished_at,
  (array_agg(error order by started_at desc) filter (where error is not null))[1] as last_error
from public.ingest_runs
group by store_slug
order by last_finished_at desc nulls last;

create or replace view public.v_top_searches as
select
  query_normalized,
  hits,
  last_searched_at,
  last_fetched_at
from public.search_demand
order by hits desc, last_searched_at desc
limit 50;

create or replace view public.v_top_clicked as
select
  p.id as product_id,
  p.name,
  s.name as store_name,
  p.price,
  p.discount_percent,
  count(c.id) as total_clicks,
  max(c.clicked_at) as last_clicked_at
from public.outbound_clicks c
left join public.products p on p.id = c.product_id
left join public.stores s on s.id = p.store_id
group by p.id, p.name, s.name, p.price, p.discount_percent
order by total_clicks desc
limit 50;
