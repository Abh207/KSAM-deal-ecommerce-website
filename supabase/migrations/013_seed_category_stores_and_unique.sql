-- =============================================================================
-- KSAM DEAL - MIGRATION 013: SEED CATEGORY STORES, UNIQUE CONSTRAINT & DEACTIVATE DEMO DEALS
-- Enables partner stores, adds explicit UNIQUE constraint on (store_id, external_id)
-- for atomic upserting, and deactivates initial demo / placeholder records.
--
-- NOTE: DO NOT RUN AUTOMATICALLY. You can review and execute this migration
-- in your Supabase Dashboard SQL Editor when ready.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ENSURE PARTNER STORES EXIST AND ARE ENABLED (Amazon, Flipkart, Myntra, Ajio, Croma, Meesho)
-- -----------------------------------------------------------------------------
insert into public.stores (name, slug, base_url, is_enabled, affiliate_program)
values
  ('Amazon India', 'amazon', 'https://www.amazon.in', true, 'Amazon Associates'),
  ('Flipkart', 'flipkart', 'https://www.flipkart.com', true, 'Flipkart Affiliate / Network Feed'),
  ('Myntra', 'myntra', 'https://www.myntra.com', true, 'Affiliate Network'),
  ('AJIO', 'ajio', 'https://www.ajio.com', true, 'Affiliate Network'),
  ('Croma', 'croma', 'https://www.croma.com', true, 'Affiliate Network'),
  ('Meesho', 'meesho', 'https://meesho.com', true, 'Partner Feed')
on conflict (slug) do update set
  is_enabled = true,
  name = excluded.name,
  base_url = excluded.base_url;

-- Update existing store records to enable them
update public.stores
set is_enabled = true
where slug in ('amazon', 'amazon-store', 'flipkart', 'myntra', 'croma', 'ajio', 'meesho')
   or lower(name) in ('amazon', 'amazon india', 'amazon store', 'flipkart', 'myntra', 'croma', 'ajio', 'meesho');

-- -----------------------------------------------------------------------------
-- 2. ADD UNIQUE CONSTRAINT ON (store_id, external_id)
-- Required by PostgREST / Supabase Client upsert with onConflict: "store_id,external_id"
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_store_id_external_id_key'
  ) then
    alter table public.products
      add constraint products_store_id_external_id_key unique (store_id, external_id);
  end if;
exception
  when others then
    -- If duplicate rows already exist in products, index fallback will be preserved
    raise notice 'Could not create constraint products_store_id_external_id_key: %', sqlerrm;
end $$;

-- -----------------------------------------------------------------------------
-- 3. DEACTIVATE DEMO / PLACEHOLDER PRODUCTS
-- Sets is_active = false for placeholder seed rows so only real ecommerce products appear
-- -----------------------------------------------------------------------------
update public.products
set is_active = false
where id in (
  'a1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000004',
  'a1000000-0000-0000-0000-000000000005',
  'a1000000-0000-0000-0000-000000000006',
  'a1000000-0000-0000-0000-000000000007',
  'a1000000-0000-0000-0000-000000000008',
  'a1000000-0000-0000-0000-000000000009',
  'a1000000-0000-0000-0000-000000000010',
  'a1000000-0000-0000-0000-000000000011',
  'a1000000-0000-0000-0000-000000000012'
)
or id like 'a1000000-%'
or id like 'demo-%'
or id like 'p-%'
or title ilike '%Nike Air Max 270%'
or title ilike '%Sony WH-1000XM5%'
or title ilike '%Samsung 55 Inch TV%';
