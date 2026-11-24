-- ============================================================
-- KSAM DEAL - MIGRATION 017: COUPONS & DISCOUNTS
-- Server-side coupon verification, usage limits, and redemption tracking
-- ============================================================

-- 1. Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'flat')),
    discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC DEFAULT 0,
    max_discount_amount NUMERIC,
    valid_from TIMESTAMPTZ DEFAULT now() NOT NULL,
    valid_to TIMESTAMPTZ,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0 NOT NULL,
    applicable_plans TEXT[] DEFAULT ARRAY['explorer', 'deal-hunter', 'pro'] NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Case-insensitive index for fast coupon code lookups
CREATE UNIQUE INDEX IF NOT EXISTS coupons_upper_code_idx ON public.coupons (UPPER(code));

-- 2. Create coupon redemptions audit log
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    plan_slug TEXT NOT NULL,
    discount_amount NUMERIC NOT NULL,
    order_amount NUMERIC NOT NULL,
    final_amount NUMERIC NOT NULL,
    redeemed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS coupon_redemptions_user_idx ON public.coupon_redemptions (user_id);
CREATE INDEX IF NOT EXISTS coupon_redemptions_coupon_idx ON public.coupon_redemptions (coupon_id);

-- 3. Add coupon tracking columns to payments table if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'coupon_code'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN coupon_code TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'discount_amount'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN discount_amount NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'original_amount'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN original_amount NUMERIC;
    END IF;
END $$;

-- 4. Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Read policy: authenticated users can read active coupons to check validity
DROP POLICY IF EXISTS "Public can view active coupons" ON public.coupons;
CREATE POLICY "Public can view active coupons" ON public.coupons
    FOR SELECT TO authenticated, anon
    USING (is_active = true AND (valid_to IS NULL OR valid_to >= now()));

-- Redemptions read policy: users read own redemptions only
DROP POLICY IF EXISTS "Users can view own coupon redemptions" ON public.coupon_redemptions;
CREATE POLICY "Users can view own coupon redemptions" ON public.coupon_redemptions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Restrict inserts and updates to service_role / Edge Functions
DROP POLICY IF EXISTS "Coupons write restricted" ON public.coupons;
CREATE POLICY "Coupons write restricted" ON public.coupons
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Coupon redemptions write restricted" ON public.coupon_redemptions;
CREATE POLICY "Coupon redemptions write restricted" ON public.coupon_redemptions
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- 5. Seed initial test coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, max_uses, applicable_plans, is_active)
VALUES
    ('KSAM20', '20% discount on Deal Hunter and Pro memberships', 'percent', 20, 50, 400, 1000, ARRAY['deal-hunter', 'pro'], true),
    ('WELCOME50', 'Flat Rs 50 off your first paid membership', 'flat', 50, 90, NULL, 500, ARRAY['deal-hunter', 'pro'], true),
    ('HUNTER10', '10% discount on all plans', 'percent', 10, 0, 200, 2000, ARRAY['explorer', 'deal-hunter', 'pro'], true)
ON CONFLICT (code) DO NOTHING;
