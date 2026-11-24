-- =============================================================================
-- KSAM DEAL - MIGRATION 018: PRODUCT ENRICHMENT, REAL OFFERS & CREDIT AUDIT
--
-- 1. Adds enrichment columns to `products` table (about_text, key_features, specifications, brand, sku, condition, enrichment_source).
-- 2. Extends `product_offers` table with seller_name, delivery_text, return_policy_text, offer_text, valid_until, and fetched_at.
-- 3. Creates `api_credit_logs` table for tracking SerpApi credit usage and enforcing daily credit caps.
--
-- NOTE: DO NOT RUN AUTOMATICALLY. Review and execute this in your Supabase SQL Editor.
-- =============================================================================

-- 1. Add enrichment columns to products table if not exists
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS about_text text,
  ADD COLUMN IF NOT EXISTS key_features jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS specifications jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS condition text DEFAULT 'New',
  ADD COLUMN IF NOT EXISTS enriched_at timestamptz,
  ADD COLUMN IF NOT EXISTS enrichment_source text;

-- Indices for faster lookups
CREATE INDEX IF NOT EXISTS products_brand_idx ON public.products (brand);
CREATE INDEX IF NOT EXISTS products_enriched_at_idx ON public.products (enriched_at);

-- 2. Extend product_offers table with rich seller details
ALTER TABLE public.product_offers
  ADD COLUMN IF NOT EXISTS seller_name text,
  ADD COLUMN IF NOT EXISTS delivery_text text,
  ADD COLUMN IF NOT EXISTS return_policy_text text,
  ADD COLUMN IF NOT EXISTS offer_text text,
  ADD COLUMN IF NOT EXISTS condition text DEFAULT 'New',
  ADD COLUMN IF NOT EXISTS valid_until timestamptz,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS url text,
  ADD COLUMN IF NOT EXISTS fetched_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS product_offers_fetched_at_idx ON public.product_offers (fetched_at);

-- 3. Create api_credit_logs table for SerpApi usage tracking and daily budget protection
CREATE TABLE IF NOT EXISTS public.api_credit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text NOT NULL DEFAULT 'serpapi',
  endpoint text NOT NULL,
  credits_used integer NOT NULL DEFAULT 1,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'success',
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS api_credit_logs_service_date_idx ON public.api_credit_logs (service, created_at);

-- 4. Enable RLS on api_credit_logs
ALTER TABLE public.api_credit_logs ENABLE ROW LEVEL SECURITY;

-- Allow Edge Functions (service_role) to read and write credit logs
DROP POLICY IF EXISTS "Service role manages credit logs" ON public.api_credit_logs;
CREATE POLICY "Service role manages credit logs"
  ON public.api_credit_logs
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to view only their own credit logs
DROP POLICY IF EXISTS "Users can view own credit logs" ON public.api_credit_logs;
CREATE POLICY "Users can view own credit logs"
  ON public.api_credit_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 5. Helper function to check today's credit count
CREATE OR REPLACE FUNCTION public.get_today_serpapi_credits()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT coalesce(sum(credits_used), 0)::integer
  FROM public.api_credit_logs
  WHERE service = 'serpapi'
    AND created_at >= (now() AT TIME ZONE 'UTC')::date;
$$;
