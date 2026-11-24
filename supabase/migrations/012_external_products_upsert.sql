-- =============================================================================
-- KSAM DEAL - MIGRATION 012: EXTERNAL PRODUCTS UPSERT & LOOKUP INDEXES
-- Optimizes lookup performance on external_id for live search aggregated deals
-- (IDs starting with 'ext-') and establishes a partial unique index.
--
-- NOTE: DO NOT RUN AUTOMATICALLY. You can review and execute this migration
-- in your Supabase Dashboard SQL Editor when ready.
-- =============================================================================

-- 1. Index on external_id for high-speed deal lookup when navigating from search
create index if not exists products_external_id_idx on public.products (external_id);

-- 2. Partial unique index on external_id for stores where external_id is unique
create unique index if not exists products_external_id_unique_idx
  on public.products (external_id)
  where external_id is not null;
