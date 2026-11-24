-- =============================================================================
-- KSAM DEAL - MIGRATION 014: ADD STORE_NAME COLUMN & BACKFILL REAL MERCHANT NAMES
--
-- Adds the `store_name` text column to the `products` table and backfills existing
-- products with their original merchant / retailer name derived from the joined
-- stores table or URL hostname (Flipkart, Amazon, Myntra, Croma, boAt, etc.).
--
-- Cleans up any placeholder "KSAM Deal" stores or invented "Verified hot deal on"
-- descriptions so the UI presents authentic retailer data.
--
-- NOTE: DO NOT RUN AUTOMATICALLY. Review and execute this in your Supabase SQL Editor.
-- =============================================================================

-- 1. Add store_name column to products table if it doesn't already exist
alter table public.products add column if not exists store_name text;

-- 2. Index on store_name for filtering and search performance
create index if not exists products_store_name_idx on public.products (store_name);

-- 3. Backfill store_name from joined stores table where store is a real merchant
update public.products p
set store_name = s.name
from public.stores s
where p.store_id = s.id
  and s.name is not null
  and s.name != 'KSAM Deal'
  and s.name != 'Partner Store'
  and (p.store_name is null or p.store_name = 'KSAM Deal' or p.store_name = 'Partner Store');

-- 4. Backfill store_name from product_url and affiliate_url hostnames for existing rows
update public.products
set store_name = case
  when product_url ilike '%flipkart.%' or affiliate_url ilike '%flipkart.%' then 'Flipkart'
  when product_url ilike '%amazon.%' or affiliate_url ilike '%amazon.%' then 'Amazon'
  when product_url ilike '%myntra.%' or affiliate_url ilike '%myntra.%' then 'Myntra'
  when product_url ilike '%ajio.%' or affiliate_url ilike '%ajio.%' then 'AJIO'
  when product_url ilike '%croma.%' or affiliate_url ilike '%croma.%' then 'Croma'
  when product_url ilike '%tatacliq.%' or affiliate_url ilike '%tatacliq.%' then 'Tata CLiQ'
  when product_url ilike '%boat-lifestyle.%' or product_url ilike '%boat.%' or affiliate_url ilike '%boat-lifestyle.%' or affiliate_url ilike '%boat.%' then 'boAt'
  when product_url ilike '%meesho.%' or affiliate_url ilike '%meesho.%' then 'Meesho'
  when product_url ilike '%nykaa.%' or affiliate_url ilike '%nykaa.%' then 'Nykaa'
  when product_url ilike '%reliancedigital.%' or affiliate_url ilike '%reliancedigital.%' then 'Reliance Digital'
  when product_url ilike '%vijaysales.%' or affiliate_url ilike '%vijaysales.%' then 'Vijay Sales'
  when product_url ilike '%etoren.%' or affiliate_url ilike '%etoren.%' then 'Etoren.com'
  else store_name
end
where store_name is null or store_name = 'KSAM Deal' or store_name = 'Partner Store';

-- 5. Backfill store_name from source column if still null and not KSAM Deal
update public.products
set store_name = case
  when source ilike '%flipkart%' then 'Flipkart'
  when source ilike '%amazon%' then 'Amazon'
  when source ilike '%myntra%' then 'Myntra'
  when source ilike '%ajio%' then 'AJIO'
  when source ilike '%croma%' then 'Croma'
  when source ilike '%boat%' then 'boAt'
  when source ilike '%tatacliq%' then 'Tata CLiQ'
  when source ilike '%meesho%' then 'Meesho'
  when source ilike '%nykaa%' then 'Nykaa'
  when source is not null and source != 'KSAM Deal' and source != 'Partner Store' and source != 'deals' and source != 'search' then initcap(source)
  else null
end
where store_name is null or store_name = 'KSAM Deal' or store_name = 'Partner Store';

-- 6. Ensure store_name is set to NULL where it is currently 'KSAM Deal' or 'Partner Store'
update public.products
set store_name = null
where store_name in ('KSAM Deal', 'KSAM', 'Partner Store');

-- 7. Clean up invented descriptions starting with "Verified hot deal on"
update public.products
set description = null
where description like 'Verified hot deal on%';

-- 8. Clean up brand where it was mistakenly set to 'KSAM Deal'
update public.products
set brand = null
where brand in ('KSAM Deal', 'KSAM', 'Partner Store');
