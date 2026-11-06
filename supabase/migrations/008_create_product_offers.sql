-- =============================================================================
-- Migration 008: Create and Configure product_offers Table & Fix PostgREST Schema
-- =============================================================================

-- 1. Create table public.product_offers if not exists
create table if not exists public.product_offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  platform text not null default 'Amazon',
  platform_slug text not null default 'amazon',
  price numeric(12,2) not null default 0,
  mrp numeric(12,2) not null default 0,
  discount_percent integer default 0,
  affiliate_url text default '#',
  in_stock boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Ensure explicit foreign key constraint named 'product_offers_product_id_fkey'
do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints tc
    join information_schema.constraint_column_usage ccu
      on tc.constraint_name = ccu.constraint_name
      and tc.table_schema = ccu.table_schema
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.table_schema = 'public'
      and tc.table_name = 'product_offers'
      and ccu.table_name = 'products'
  ) then
    alter table public.product_offers
      add constraint product_offers_product_id_fkey
      foreign key (product_id)
      references public.products(id)
      on delete cascade;
  end if;
end $$;

-- 3. Create indexes
create index if not exists product_offers_product_id_idx on public.product_offers (product_id);
create index if not exists product_offers_platform_idx on public.product_offers (platform_slug);
create index if not exists product_offers_in_stock_idx on public.product_offers (in_stock);

-- 4. Enable Row Level Security and allow public read
alter table public.product_offers enable row level security;

drop policy if exists "product_offers_public_read_all" on public.product_offers;
create policy "product_offers_public_read_all"
  on public.product_offers
  for select
  using (true);

-- 5. Activate products if inactive
update public.products
set is_active = true
where is_active is null or is_active = false;

-- 6. Reload PostgREST schema cache
notify pgrst, 'reload schema';

