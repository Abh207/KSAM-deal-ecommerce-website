-- ============================================================================
-- MANUAL BACKFILL SCRIPT: Backfill store_name from product link / URL hostname
-- NOTE: Do NOT run this automatically. Run manually in Supabase SQL Editor if desired.
-- ============================================================================

-- Step 1: Update well-known retailers from product_url, affiliate_url, or raw JSON
UPDATE public.products
SET store_name = CASE
  WHEN (product_url ILIKE '%jiomart.%' OR affiliate_url ILIKE '%jiomart.%' OR raw->>'source' ILIKE '%jiomart%') THEN 'JioMart'
  WHEN (product_url ILIKE '%mdcomputers.%' OR affiliate_url ILIKE '%mdcomputers.%' OR raw->>'source' ILIKE '%md computers%') THEN 'MD Computers'
  WHEN (product_url ILIKE '%primeabgb.%' OR affiliate_url ILIKE '%primeabgb.%') THEN 'PrimeABGB'
  WHEN (product_url ILIKE '%vedantcomputers.%' OR affiliate_url ILIKE '%vedantcomputers.%') THEN 'Vedant Computers'
  WHEN (product_url ILIKE '%robu.%' OR affiliate_url ILIKE '%robu.%' OR raw->>'source' ILIKE '%robu%') THEN 'Robu.in'
  WHEN (product_url ILIKE '%electronicscomp.%' OR affiliate_url ILIKE '%electronicscomp.%') THEN 'ElectronicsComp'
  WHEN (product_url ILIKE '%dnatechindia.%' OR affiliate_url ILIKE '%dnatechindia.%') THEN 'DNA Technology'
  WHEN (product_url ILIKE '%bajaao.%' OR affiliate_url ILIKE '%bajaao.%' OR raw->>'source' ILIKE '%bajaao%') THEN 'Bajaao'
  WHEN (product_url ILIKE '%casioindiashop.%' OR affiliate_url ILIKE '%casioindiashop.%' OR raw->>'source' ILIKE '%casio%') THEN 'Casio India Shop'
  WHEN (product_url ILIKE '%furtadosonline.%' OR affiliate_url ILIKE '%furtadosonline.%' OR raw->>'source' ILIKE '%furtados%') THEN 'Furtados'
  WHEN (product_url ILIKE '%tanotis.%' OR affiliate_url ILIKE '%tanotis.%') THEN 'Tanotis'
  WHEN (product_url ILIKE '%flyrobotics.%' OR affiliate_url ILIKE '%flyrobotics.%') THEN 'FlyRobotics'
  WHEN (product_url ILIKE '%industrybuying.%' OR affiliate_url ILIKE '%industrybuying.%') THEN 'Industrybuying'
  WHEN (product_url ILIKE '%moglix.%' OR affiliate_url ILIKE '%moglix.%') THEN 'Moglix'
  WHEN (product_url ILIKE '%tatacliq.%' OR affiliate_url ILIKE '%tatacliq.%') THEN 'Tata CLiQ'
  WHEN (product_url ILIKE '%boat-lifestyle.%' OR product_url ILIKE '%boat.%') THEN 'boAt'
  WHEN (product_url ILIKE '%reliancedigital.%' OR affiliate_url ILIKE '%reliancedigital.%') THEN 'Reliance Digital'
  WHEN (product_url ILIKE '%vijaysales.%' OR affiliate_url ILIKE '%vijaysales.%') THEN 'Vijay Sales'
  WHEN (product_url ILIKE '%croma.%' OR affiliate_url ILIKE '%croma.%') THEN 'Croma'
  WHEN (product_url ILIKE '%myntra.%' OR affiliate_url ILIKE '%myntra.%') THEN 'Myntra'
  WHEN (product_url ILIKE '%ajio.%' OR affiliate_url ILIKE '%ajio.%') THEN 'AJIO'
  WHEN (product_url ILIKE '%meesho.%' OR affiliate_url ILIKE '%meesho.%') THEN 'Meesho'
  WHEN (product_url ILIKE '%nykaa.%' OR affiliate_url ILIKE '%nykaa.%') THEN 'Nykaa'
  WHEN (product_url ILIKE '%amazon.%' OR affiliate_url ILIKE '%amazon.%') THEN 'Amazon'
  WHEN (product_url ILIKE '%flipkart.%' OR affiliate_url ILIKE '%flipkart.%') THEN 'Flipkart'
  WHEN (product_url ILIKE '%etoren.%' OR affiliate_url ILIKE '%etoren.%') THEN 'Etoren.com'
  WHEN (product_url ILIKE '%samsung.%' OR affiliate_url ILIKE '%samsung.%') THEN 'Samsung'
  WHEN (product_url ILIKE '%apple.%' OR affiliate_url ILIKE '%apple.%') THEN 'Apple'
  WHEN (product_url ILIKE '%puma.%' OR affiliate_url ILIKE '%puma.%') THEN 'Puma'
  WHEN (product_url ILIKE '%nike.%' OR affiliate_url ILIKE '%nike.%') THEN 'Nike'
  WHEN (product_url ILIKE '%adidas.%' OR affiliate_url ILIKE '%adidas.%') THEN 'Adidas'
  -- Step 2: Use merchant or source from raw JSON if valid
  WHEN (raw->>'merchant' IS NOT NULL AND raw->>'merchant' !~* '(serp|google|ksam|partner|general|unknown)') THEN TRIM(raw->>'merchant')
  WHEN (raw->>'source' IS NOT NULL AND raw->>'source' !~* '(serp|google|ksam|partner|general|unknown)') THEN TRIM(raw->>'source')
  ELSE store_name
END
WHERE
  store_name IS NULL
  OR TRIM(store_name) = ''
  OR store_name ILIKE '%serp%'
  OR store_name ILIKE '%google%'
  OR store_name ILIKE '%ksam%'
  OR store_name ILIKE '%partner%store%'
  OR store_name ILIKE '%licensed shopping%';
