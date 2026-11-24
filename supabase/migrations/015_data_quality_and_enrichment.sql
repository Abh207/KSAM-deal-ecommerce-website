-- =============================================================================
-- KSAM DEAL - MIGRATION 015: DATA QUALITY, REAL STORE NAMES & ENRICHMENT
--
-- 1. Adds `is_suspicious` (boolean) and `enriched_at` (timestamptz) columns to products.
-- 2. Backfills authentic `store_name` from product_url / affiliate_url hostnames
--    for existing rows where store_name or source is "Serp-Shopping" or "Google Shopping".
-- 3. Updates `source` to match the real store_name where source was "serp-shopping".
-- 4. Purges placeholder store names ("Serp-Shopping", "Google Shopping", "KSAM Deal", "Partner Store").
-- 5. Purges fabricated placeholder descriptions starting with "Verified hot deal on...".
-- 6. Flags suspicious rows (price <= 0, title < 5 chars, pure digits, >10x or <0.1x category median).
--
-- NOTE: DO NOT RUN AUTOMATICALLY. Review and execute this in your Supabase SQL Editor.
-- =============================================================================

-- 1. Add is_suspicious column to products if not exists
alter table public.products
  add column if not exists is_suspicious boolean default false;

-- 2. Add enriched_at column to products if not exists
alter table public.products
  add column if not exists enriched_at timestamptz;

-- 3. Create indices for faster queries
create index if not exists products_is_suspicious_idx on public.products (is_suspicious);
create index if not exists products_enriched_at_idx on public.products (enriched_at);

-- 4. Backfill store_name from product_url and affiliate_url hostnames where store_name is null,
--    "Serp-Shopping", "Google Shopping", "KSAM Deal", or "Partner Store"
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
  when product_url ilike '%samsung.%' or affiliate_url ilike '%samsung.%' then 'Samsung'
  when product_url ilike '%apple.%' or affiliate_url ilike '%apple.%' then 'Apple'
  when product_url ilike '%puma.%' or affiliate_url ilike '%puma.%' then 'Puma'
  when product_url ilike '%nike.%' or affiliate_url ilike '%nike.%' then 'Nike'
  when product_url ilike '%adidas.%' or affiliate_url ilike '%adidas.%' then 'Adidas'
  else store_name
end
where store_name is null
   or store_name ilike '%serp%'
   or store_name in ('Google Shopping', 'Serp-Shopping', 'serp-shopping', 'KSAM Deal', 'KSAM', 'Partner Store', 'Licensed Shopping Data (Google Shopping India)')
   or source ilike '%serp%';

-- 5. Backfill source with real store_name if source is currently "serp-shopping" or "Google Shopping"
update public.products
set source = store_name
where store_name is not null
  and store_name not ilike '%serp%'
  and (source ilike '%serp%' or source = 'Google Shopping' or source is null);

-- 6. Purge any residual invalid store names so they are set to NULL
update public.products
set store_name = null
where store_name ilike '%serp%'
   or store_name ilike '%google%'
   or store_name in ('KSAM Deal', 'KSAM', 'Partner Store', 'Licensed Shopping Data (Google Shopping India)');

-- 7. Clean up fabricated descriptions starting with "Verified hot deal on"
update public.products
set description = null
where description like 'Verified hot deal on%';

-- 8. Flag zero or negative price items as suspicious
update public.products
set is_suspicious = true
where price <= 0 or price is null;

-- 9. Flag items with titles shorter than 5 characters or pure numbers as suspicious
update public.products
set is_suspicious = true
where length(trim(name)) < 5 or name ~ '^\d+$';

-- 10. Flag price anomalies (>10x or <0.1x category median) as suspicious
with category_medians as (
  select
    category,
    percentile_cont(0.5) within group (order by price) as median_price
  from public.products
  where price > 0
    and category is not null
    and category not in ('Deals', 'Search', 'General')
  group by category
)
update public.products p
set is_suspicious = true
from category_medians cm
where p.category = cm.category
  and cm.median_price > 0
  and (p.price > (10 * cm.median_price) or p.price < (0.1 * cm.median_price));
