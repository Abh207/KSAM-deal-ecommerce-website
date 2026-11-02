-- =============================================================================
-- KSAM DEAL - MIGRATION 20261102: FIX DEALS & OFFERS FOREIGN KEY RELATIONSHIP
-- Non-destructive, idempotent migration to ensure:
-- 1. Foreign key product_offers.product_id -> products(id) exists with explicit constraint name.
-- 2. Performance index on product_offers(product_id).
-- 3. Row Level Security (RLS) public SELECT policies are active.
-- 4. PostgREST schema cache is reloaded via NOTIFY pgrst.
--
-- Instructions: Run this script in your Supabase Dashboard -> SQL Editor.
-- =============================================================================

-- 1. Ensure foreign key constraint exists with explicit name 'product_offers_product_id_fkey'
do $$
begin
  -- If constraint does not exist, check column types and add foreign key
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
    -- Drop any duplicate/partial constraint if misnamed
    alter table public.product_offers
      drop constraint if exists product_offers_product_id_fkey;

    -- Add the clean cascading foreign key
    alter table public.product_offers
      add constraint product_offers_product_id_fkey
      foreign key (product_id)
      references public.products(id)
      on delete cascade;
  end if;
end $$;

-- 2. Performance index on product_offers(product_id)
create index if not exists product_offers_product_id_idx
  on public.product_offers (product_id);

-- 3. Ensure Row Level Security (RLS) is enabled and public read policies are in place
alter table public.products enable row level security;
alter table public.product_offers enable row level security;

-- Drop and recreate public read policies to guarantee active & in-stock items are readable
drop policy if exists "products_public_read_active" on public.products;
create policy "products_public_read_active"
  on public.products
  for select
  using (is_active = true);

drop policy if exists "product_offers_public_read_instock" on public.product_offers;
create policy "product_offers_public_read_instock"
  on public.product_offers
  for select
  using (in_stock = true);

-- 4. Refresh PostgREST schema cache immediately
notify pgrst, 'reload schema';

