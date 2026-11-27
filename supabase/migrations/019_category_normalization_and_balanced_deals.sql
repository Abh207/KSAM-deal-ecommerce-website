-- =============================================================================
-- KSAM DEAL - MIGRATION 019: CATEGORY NORMALIZATION & BALANCED DEALS RPC
--
-- 0. SELECT PREVIEW QUERY: Run this first in Supabase SQL Editor to preview
--    the classification (title, old category, new category) without changing data.
-- 1. Normalizes category variants (mobiles, Mobile, laptop, Laptops, etc.) to canonical names.
-- 2. Backfills products.category from product title/name using prioritized keyword rules
--    (only where category is NULL, 'General', 'Deals', 'Search', or empty).
-- 3. Adds performance indices on public.products (category, is_active).
-- 4. Creates `get_category_counts(p_store)` RPC for cheap, cached tab count queries.
-- 5. Creates `get_balanced_deals` RPC for round-robin category interleaving on "All" tab.
--
-- NOTE: DO NOT RUN AUTOMATICALLY. You can review and execute this migration
-- in your Supabase Dashboard SQL Editor when ready.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. SELECT PREVIEW (RUN THIS FIRST TO PREVIEW WITHOUT MODIFYING DATA)
-- -----------------------------------------------------------------------------
/*
SELECT 
  id,
  coalesce(title, name) AS product_title,
  category AS old_category,
  CASE
    -- Normalized variants
    WHEN lower(trim(category)) IN ('mobile', 'mobiles', 'smartphone', 'smartphones', 'phone', 'phones') THEN 'Mobiles'
    WHEN lower(trim(category)) IN ('laptop', 'laptops', 'notebook', 'notebooks', 'macbook', 'macbooks') THEN 'Laptops'
    WHEN lower(trim(category)) IN ('watch', 'watches', 'smartwatch', 'smartwatches') THEN 'Watches'
    WHEN lower(trim(category)) IN ('audio', 'headphone', 'headphones', 'earbuds', 'speaker', 'speakers', 'soundbar', 'soundbars', 'gadgets') THEN 'Audio'
    WHEN lower(trim(category)) IN ('shoe', 'shoes', 'footwear', 'sneakers', 'sneaker', 'boots') THEN 'Shoes'
    WHEN lower(trim(category)) IN ('clothing', 'cloths', 'clothes', 'apparel', 'wear', 'shirt', 'kurti') THEN 'Clothes'
    WHEN lower(trim(category)) IN ('fashion', 'accessories') THEN 'Fashion'
    WHEN lower(trim(category)) IN ('home', 'home-appliances', 'home appliances', 'appliances', 'kitchen', 'furniture', 'chairs') THEN 'Home'
    WHEN lower(trim(category)) IN ('gaming', 'games', 'game') THEN 'Gaming'
    WHEN lower(trim(category)) IN ('electronics', 'electronic') THEN 'Electronics'
    WHEN lower(trim(category)) IN ('beauty', 'skincare', 'skin-care', 'cosmetics') THEN 'Beauty'

    -- Classified from title / name
    WHEN coalesce(title, name, '') ~* '\y(smart\s*phones?|iphones?|galaxy\s+[asmoz]\d+|redmi|oneplus|phones?)\y' THEN 'Mobiles'
    WHEN coalesce(title, name, '') ~* '\y(laptops?|macbooks?|notebooks?|vivobooks?|thinkpads?|chromebooks?)\y' THEN 'Laptops'
    WHEN coalesce(title, name, '') ~* '\y(gam(ing|er)|consoles?|playstation|ps[45]|xbox|gamepad|controllers?)\y' THEN 'Gaming'
    WHEN coalesce(title, name, '') ~* '\y(smart\s*watch(es)?|chronographs?|analog\s+watch(es)?|wrist\s*watch(es)?|watch(es)?)\y' THEN 'Watches'
    WHEN coalesce(title, name, '') ~* '\y(headphones?|earbuds?|earphones?|airpods?|neckbands?|soundbars?|speakers?)\y' THEN 'Audio'
    WHEN coalesce(title, name, '') ~* '\y(power\s*banks?|chargers?|routers?|cameras?|smart\s*tvs?|tvs?|televisions?)\y' THEN 'Electronics'
    WHEN coalesce(title, name, '') ~* '\y(sneakers?|sandals?|slippers?|boots?|loafers?|shoes?)\y' THEN 'Shoes'
    WHEN coalesce(title, name, '') ~* '\y(t-?shirts?|shirts?|kurt[ai]s?|dress(es)?|jeans?|sar[ei](es)?|hoodies?|jackets?|trousers?|pants?|tops?)\y' THEN 'Clothes'
    WHEN coalesce(title, name, '') ~* '\y(sunglass(es)?|wallets?|handbags?|backpacks?|belts?|jeweller?y|necklace|earrings|bangles?)\y' THEN 'Fashion'
    WHEN coalesce(title, name, '') ~* '\y(lipsticks?|serums?|shampoos?|perfumes?|fragrance|make-?up|face\s+cream|body\s+lotion|creams?)\y' THEN 'Beauty'
    WHEN coalesce(title, name, '') ~* '\y(kitchen|furniture|lamps?|mixers?|grinders?|bed\s*sheets?|curtains?|cushions?|cookware|pan|cooker)\y' THEN 'Home'
    ELSE 'Other'
  END AS new_category
FROM public.products
WHERE is_active = true
ORDER BY new_category, product_title;
*/

-- -----------------------------------------------------------------------------
-- 1. NORMALIZE EXISTING CATEGORY VARIANTS TO CANONICAL NAMES
-- -----------------------------------------------------------------------------
UPDATE public.products
SET category = CASE
  WHEN lower(trim(category)) IN ('mobile', 'mobiles', 'smartphone', 'smartphones', 'phone', 'phones') THEN 'Mobiles'
  WHEN lower(trim(category)) IN ('laptop', 'laptops', 'notebook', 'notebooks', 'macbook', 'macbooks') THEN 'Laptops'
  WHEN lower(trim(category)) IN ('watch', 'watches', 'smartwatch', 'smartwatches') THEN 'Watches'
  WHEN lower(trim(category)) IN ('audio', 'headphone', 'headphones', 'earbuds', 'speaker', 'speakers', 'soundbar', 'soundbars', 'gadgets') THEN 'Audio'
  WHEN lower(trim(category)) IN ('shoe', 'shoes', 'footwear', 'sneakers', 'sneaker', 'boots') THEN 'Shoes'
  WHEN lower(trim(category)) IN ('clothing', 'cloths', 'clothes', 'apparel', 'wear', 'shirt', 'kurti') THEN 'Clothes'
  WHEN lower(trim(category)) IN ('fashion', 'accessories') THEN 'Fashion'
  WHEN lower(trim(category)) IN ('home', 'home-appliances', 'home appliances', 'appliances', 'kitchen', 'furniture', 'chairs') THEN 'Home'
  WHEN lower(trim(category)) IN ('gaming', 'games', 'game') THEN 'Gaming'
  WHEN lower(trim(category)) IN ('electronics', 'electronic') THEN 'Electronics'
  WHEN lower(trim(category)) IN ('beauty', 'skincare', 'skin-care', 'cosmetics') THEN 'Beauty'
  ELSE trim(category)
END
WHERE category IS NOT NULL
  AND lower(trim(category)) NOT IN ('general', 'deals', 'search', '');

-- -----------------------------------------------------------------------------
-- 2. BACKFILL UNCATEGORIZED ROWS FROM TITLE / NAME (PRIORITIZED RULES)
-- Only updates rows where category IS NULL, 'General', 'Deals', 'Search', or empty string.
-- -----------------------------------------------------------------------------
UPDATE public.products
SET category = CASE
  -- 1. Mobiles
  WHEN coalesce(title, name, '') ~* '\y(smart\s*phones?|iphones?|galaxy\s+[asmoz]\d+|redmi|oneplus|phones?)\y' THEN 'Mobiles'

  -- 2. Laptops
  WHEN coalesce(title, name, '') ~* '\y(laptops?|macbooks?|notebooks?|vivobooks?|thinkpads?|chromebooks?)\y' THEN 'Laptops'

  -- 3. Gaming
  WHEN coalesce(title, name, '') ~* '\y(gam(ing|er)|consoles?|playstation|ps[45]|xbox|gamepad|controllers?)\y' THEN 'Gaming'

  -- 4. Watches
  WHEN coalesce(title, name, '') ~* '\y(smart\s*watch(es)?|chronographs?|analog\s+watch(es)?|wrist\s*watch(es)?|watch(es)?)\y' THEN 'Watches'

  -- 5. Audio
  WHEN coalesce(title, name, '') ~* '\y(headphones?|earbuds?|earphones?|airpods?|neckbands?|soundbars?|speakers?)\y' THEN 'Audio'

  -- 6. Electronics
  WHEN coalesce(title, name, '') ~* '\y(power\s*banks?|chargers?|routers?|cameras?|smart\s*tvs?|tvs?|televisions?)\y' THEN 'Electronics'

  -- 7. Shoes
  WHEN coalesce(title, name, '') ~* '\y(sneakers?|sandals?|slippers?|boots?|loafers?|shoes?)\y' THEN 'Shoes'

  -- 8. Clothes
  WHEN coalesce(title, name, '') ~* '\y(t-?shirts?|shirts?|kurt[ai]s?|dress(es)?|jeans?|sar[ei](es)?|hoodies?|jackets?|trousers?|pants?|tops?)\y' THEN 'Clothes'

  -- 9. Fashion
  WHEN coalesce(title, name, '') ~* '\y(sunglass(es)?|wallets?|handbags?|backpacks?|belts?|jeweller?y|necklace|earrings|bangles?)\y' THEN 'Fashion'

  -- 10. Beauty
  WHEN coalesce(title, name, '') ~* '\y(lipsticks?|serums?|shampoos?|perfumes?|fragrance|make-?up|face\s+cream|body\s+lotion|creams?)\y' THEN 'Beauty'

  -- 11. Home
  WHEN coalesce(title, name, '') ~* '\y(kitchen|furniture|lamps?|mixers?|grinders?|bed\s*sheets?|curtains?|cushions?|cookware|pan|cooker)\y' THEN 'Home'

  ELSE 'General'
END
WHERE category IS NULL
   OR lower(trim(category)) IN ('general', 'deals', 'search', '');

-- -----------------------------------------------------------------------------
-- 3. PERFORMANCE INDICES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category);
CREATE INDEX IF NOT EXISTS products_active_category_idx ON public.products (is_active, category);

-- -----------------------------------------------------------------------------
-- 4. RPC: GET_CATEGORY_COUNTS
-- Efficiently returns active product counts grouped by category for tab chips.
-- Supports store filtering, maps to the 11 canonical categories, and buckets
-- unclassified items into 'Other' so tab counts + Other strictly add up to All total.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_category_counts(p_store text DEFAULT 'All')
RETURNS TABLE (
  category text,
  count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE
      WHEN trim(category) IN ('Clothes', 'Watches', 'Mobiles', 'Laptops', 'Audio', 'Shoes', 'Fashion', 'Home', 'Gaming', 'Electronics', 'Beauty') THEN trim(category)
      ELSE 'Other'
    END AS category,
    count(*)::bigint AS count
  FROM public.products
  WHERE is_active = true
    AND (
      p_store = 'All' 
      OR source ILIKE '%' || p_store || '%' 
      OR product_url ILIKE '%' || p_store || '%' 
      OR affiliate_url ILIKE '%' || p_store || '%'
      OR (store_name IS NOT NULL AND store_name ILIKE '%' || p_store || '%')
    )
  GROUP BY 
    CASE
      WHEN trim(category) IN ('Clothes', 'Watches', 'Mobiles', 'Laptops', 'Audio', 'Shoes', 'Fashion', 'Home', 'Gaming', 'Electronics', 'Beauty') THEN trim(category)
      ELSE 'Other'
    END;
$$;

-- -----------------------------------------------------------------------------
-- 5. RPC: GET_BALANCED_DEALS
-- Round-robin interleaves products partitioned by category for the "All" tab.
-- Guarantees that Clothes do not dominate; every category gets equal initial slots.
-- Supports store filter, sort order, and offset/limit pagination.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_balanced_deals(
  p_store text DEFAULT 'All',
  p_sort text DEFAULT 'biggest_discount',
  p_from integer DEFAULT 0,
  p_to integer DEFAULT 65
)
RETURNS TABLE (
  id uuid,
  name text,
  title text,
  brand text,
  category text,
  image_url text,
  price numeric,
  old_price numeric,
  discount_percent numeric,
  currency text,
  rating numeric,
  reviews integer,
  availability text,
  product_url text,
  affiliate_url text,
  store_name text,
  source text,
  is_active boolean,
  is_featured boolean,
  created_at timestamptz,
  price_updated_at timestamptz,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_total bigint;
BEGIN
  -- Count total active matching deals
  SELECT count(*) INTO v_total
  FROM public.products p
  WHERE p.is_active = true
    AND (
      p_store = 'All' 
      OR p.source ILIKE '%' || p_store || '%' 
      OR p.product_url ILIKE '%' || p_store || '%' 
      OR p.affiliate_url ILIKE '%' || p_store || '%'
      OR (p.store_name IS NOT NULL AND p.store_name ILIKE '%' || p_store || '%')
    );

  RETURN QUERY
  WITH filtered AS (
    SELECT 
      p.*,
      ROW_NUMBER() OVER (
        PARTITION BY coalesce(nullif(trim(p.category), ''), 'General')
        ORDER BY 
          CASE WHEN p_sort = 'price_low_high' THEN p.price END ASC NULLS LAST,
          CASE WHEN p_sort = 'price_high_low' THEN p.price END DESC NULLS LAST,
          CASE WHEN p_sort = 'newest' THEN p.created_at END DESC,
          CASE WHEN p_sort NOT IN ('price_low_high', 'price_high_low', 'newest') THEN p.discount_percent END DESC NULLS LAST,
          p.created_at DESC,
          p.id DESC
      ) as cat_rank
    FROM public.products p
    WHERE p.is_active = true
      AND (
        p_store = 'All' 
        OR p.source ILIKE '%' || p_store || '%' 
        OR p.product_url ILIKE '%' || p_store || '%' 
        OR p.affiliate_url ILIKE '%' || p_store || '%'
        OR (p.store_name IS NOT NULL AND p.store_name ILIKE '%' || p_store || '%')
      )
  )
  SELECT 
    f.id,
    f.name,
    f.title,
    f.brand,
    f.category,
    f.image_url,
    f.price,
    f.old_price,
    f.discount_percent,
    f.currency,
    f.rating,
    f.reviews,
    f.availability,
    f.product_url,
    f.affiliate_url,
    f.store_name,
    f.source,
    f.is_active,
    f.is_featured,
    f.created_at,
    f.price_updated_at,
    v_total as total_count
  FROM filtered f
  ORDER BY 
    f.cat_rank ASC,
    CASE WHEN p_sort = 'price_low_high' THEN f.price END ASC NULLS LAST,
    CASE WHEN p_sort = 'price_high_low' THEN f.price END DESC NULLS LAST,
    CASE WHEN p_sort = 'newest' THEN f.created_at END DESC,
    CASE WHEN p_sort NOT IN ('price_low_high', 'price_high_low', 'newest') THEN f.discount_percent END DESC NULLS LAST,
    f.id DESC
  OFFSET p_from
  LIMIT (p_to - p_from + 1);
END;
$$;
