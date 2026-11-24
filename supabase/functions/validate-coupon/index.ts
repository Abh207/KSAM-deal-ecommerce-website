import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SERVER_PLANS: Record<string, { name: string; monthly: number; yearly: number }> = {
  "explorer": { name: "Explorer", monthly: 0, yearly: 0 },
  "deal-hunter": { name: "Deal Hunter", monthly: 99, yearly: 950 },
  "pro": { name: "Pro", monthly: 199, yearly: 1910 }
};

function normalizePlanSlug(input?: string): string {
  if (!input) return "explorer";
  const clean = input.trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (clean.includes("pro")) return "pro";
  if (clean.includes("hunter") || clean.includes("deal")) return "deal-hunter";
  return "explorer";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ valid: false, error: "Server credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: { coupon_code?: string; plan_slug?: string; billing_cycle?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const rawCode = String(body.coupon_code || "").trim();
    if (!rawCode) {
      return new Response(
        JSON.stringify({ valid: false, error: "Please enter a coupon code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const planSlug = normalizePlanSlug(body.plan_slug);
    const billingCycle = body.billing_cycle === "yearly" ? "yearly" : "monthly";

    // 1. Determine plan base price server-side
    let basePrice = billingCycle === "yearly" ? SERVER_PLANS[planSlug]?.yearly || 0 : SERVER_PLANS[planSlug]?.monthly || 0;
    try {
      const { data: planRow } = await supabase
        .from("plans")
        .select("id, name, slug, monthly_price, yearly_price, is_active")
        .eq("slug", planSlug)
        .maybeSingle();

      if (planRow && planRow.is_active) {
        basePrice = billingCycle === "yearly" ? Number(planRow.yearly_price) : Number(planRow.monthly_price);
      }
    } catch (e) {
      console.warn("[validate-coupon] Plan price lookup fallback:", e);
    }

    if (basePrice === 0) {
      return new Response(
        JSON.stringify({ valid: false, error: "Coupons cannot be applied to free Explorer plans." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Query coupon by uppercase code
    const cleanCode = rawCode.toUpperCase();
    const { data: coupon, error: couponErr } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", cleanCode)
      .maybeSingle();

    if (couponErr || !coupon) {
      // Fallback in-memory coupons if migration hasn't been executed in database yet
      const FALLBACK_COUPONS: Record<string, { type: "percent" | "flat"; val: number; desc: string }> = {
        "KSAM20": { type: "percent", val: 20, desc: "20% off Deal Hunter & Pro" },
        "WELCOME50": { type: "flat", val: 50, desc: "Flat ₹50 off" },
        "HUNTER10": { type: "percent", val: 10, desc: "10% off" }
      };

      if (FALLBACK_COUPONS[cleanCode]) {
        const fb = FALLBACK_COUPONS[cleanCode];
        const discountAmount = fb.type === "percent"
          ? Math.round((basePrice * fb.val) / 100)
          : Math.min(fb.val, basePrice);
        const finalAmount = Math.max(0, basePrice - discountAmount);
        return new Response(
          JSON.stringify({
            valid: true,
            code: cleanCode,
            description: fb.desc,
            discount_type: fb.type,
            discount_value: fb.val,
            discount_amount: discountAmount,
            original_amount: basePrice,
            final_amount: finalAmount,
            message: `Coupon "${cleanCode}" applied! You save ₹${discountAmount}.`
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ valid: false, error: `Coupon "${rawCode}" is invalid.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Validation checks
    if (!coupon.is_active) {
      return new Response(
        JSON.stringify({ valid: false, error: `Coupon "${cleanCode}" is no longer active.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return new Response(
        JSON.stringify({ valid: false, error: `Coupon "${cleanCode}" is not yet active.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (coupon.valid_to && new Date(coupon.valid_to) < now) {
      return new Response(
        JSON.stringify({ valid: false, error: `Coupon "${cleanCode}" has expired.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
      return new Response(
        JSON.stringify({ valid: false, error: `Coupon "${cleanCode}" has reached its maximum redemptions.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (Array.isArray(coupon.applicable_plans) && coupon.applicable_plans.length > 0) {
      if (!coupon.applicable_plans.includes(planSlug)) {
        return new Response(
          JSON.stringify({ valid: false, error: `Coupon "${cleanCode}" is not applicable to the ${SERVER_PLANS[planSlug]?.name || planSlug} plan.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const minAmount = Number(coupon.min_order_amount || 0);
    if (basePrice < minAmount) {
      return new Response(
        JSON.stringify({ valid: false, error: `Coupon "${cleanCode}" requires a minimum purchase of ₹${minAmount}.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Calculate discount amount
    let discountAmount = 0;
    if (coupon.discount_type === "percent") {
      discountAmount = Math.round((basePrice * Number(coupon.discount_value)) / 100);
      if (coupon.max_discount_amount != null) {
        discountAmount = Math.min(discountAmount, Number(coupon.max_discount_amount));
      }
    } else {
      discountAmount = Math.min(Number(coupon.discount_value), basePrice);
    }

    const finalAmount = Math.max(0, basePrice - discountAmount);

    return new Response(
      JSON.stringify({
        valid: true,
        code: coupon.code,
        description: coupon.description || "",
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
        discount_amount: discountAmount,
        original_amount: basePrice,
        final_amount: finalAmount,
        message: `Coupon "${coupon.code}" applied! You save ₹${discountAmount}.`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ valid: false, error: err?.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
