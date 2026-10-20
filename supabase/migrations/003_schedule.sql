-- =============================================================================
-- KSAM DEAL - MIGRATION 003: PG_CRON + PG_NET CONTINUOUS INGESTION SCHEDULE
-- =============================================================================
-- INSTRUCTIONS FOR USER:
-- 1. Enable the "pg_cron" and "pg_net" extensions in Supabase Dashboard (Database -> Extensions).
-- 2. Store your INGEST_SECRET in Supabase Vault or substitute below:
--    - Replace <YOUR_PROJECT_REF> with your Supabase Project Reference (e.g. kavvzolevucqleoewlnf)
--    - Replace <YOUR_INGEST_SECRET> with the value set via: supabase secrets set INGEST_SECRET=...
-- 3. Run this file in your Supabase SQL Editor.
-- =============================================================================

create extension if not exists "pg_cron";
create extension if not exists "pg_net";

-- Schedule continuous deal ingestion every 30 minutes
-- Calling the Edge Function ingest-deals
select cron.schedule(
  'ksam-deal-ingest-every-30-mins',
  '*/30 * * * *',
  $$
  select net.http_post(
    url := 'https://kavvzolevucqleoewlnf.supabase.co/functions/v1/ingest-deals',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Ingest-Secret', '<Qmhvj38blYR0cP9Xdy5OFopgU1Tw2n4CzfZWt7NE>' -- REPLACE WITH YOUR INGEST_SECRET
    ),
    body := jsonb_build_object(
      'trigger', 'cron'
    ),
    timeout_milliseconds := 25000
  );
  $$
);

-- Schedule nightly cleanup at 03:00 IST (21:30 UTC)
-- Purges price history older than 180 days and ingest logs older than 30 days
select cron.schedule(
  'ksam-deal-nightly-purge',
  '30 21 * * *',
  $$
  select public.purge_old_deal_data();
  select public.deactivate_stale_products(interval '3 days');
  $$
);
