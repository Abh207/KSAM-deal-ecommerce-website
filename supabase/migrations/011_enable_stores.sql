-- =============================================================================
-- KSAM DEAL - MIGRATION 003: ENABLE PRIMARY E-COMMERCE STORES
-- Enables Amazon, Flipkart, Myntra, Croma, and Ajio in public.stores
-- without modifying any other columns or records.
-- =============================================================================

-- Enable target partner stores by slug and name
update public.stores
set is_enabled = true
where slug in ('amazon', 'amazon-store', 'flipkart', 'myntra', 'croma', 'ajio')
   or lower(name) in ('amazon', 'amazon india', 'amazon store', 'flipkart', 'myntra', 'croma', 'ajio');

-- Verify the updated status
select id, name, slug, is_enabled, base_url, affiliate_program
from public.stores
where slug in ('amazon', 'amazon-store', 'flipkart', 'myntra', 'croma', 'ajio')
   or lower(name) in ('amazon', 'amazon india', 'amazon store', 'flipkart', 'myntra', 'croma', 'ajio')
order by name asc;
