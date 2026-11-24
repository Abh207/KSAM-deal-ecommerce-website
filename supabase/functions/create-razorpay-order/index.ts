import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fallback plan pricing lookup if migration not yet applied
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header. Please sign in." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Supabase service credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user identity securely via JWT
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or expired session. Please sign in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body: { plan_slug?: string; billing_cycle?: string; coupon_code?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const planSlug = normalizePlanSlug(body.plan_slug);
    const billingCycle = body.billing_cycle === "yearly" ? "yearly" : "monthly";

    // SERVER-SIDE price lookup: never trust amount from browser!
    let planName = SERVER_PLANS[planSlug]?.name || "Explorer";
    let planId: string | null = null;
    let baseAmount = billingCycle === "yearly" ? SERVER_PLANS[planSlug]?.yearly || 0 : SERVER_PLANS[planSlug]?.monthly || 0;

    try {
      const { data: planRow } = await supabase
        .from("plans")
        .select("id, name, slug, monthly_price, yearly_price, is_active")
        .eq("slug", planSlug)
        .maybeSingle();

      if (planRow && planRow.is_active) {
        planId = planRow.id;
        planName = planRow.name;
        baseAmount = billingCycle === "yearly" ? Number(planRow.yearly_price) : Number(planRow.monthly_price);
      }
    } catch (e) {
      console.warn("[create-razorpay-order] Plans table query fallback:", e);
    }

    // SERVER-SIDE coupon verification
    let discountAmount = 0;
    let appliedCouponCode: string | null = null;
    const rawCoupon = String(body.coupon_code || "").trim().toUpperCase();

    if (rawCoupon && baseAmount > 0) {
      try {
        const { data: couponRow } = await supabase
          .from("coupons")
          .select("*")
          .eq("code", rawCoupon)
          .maybeSingle();

        const FALLBACK_COUPONS: Record<string, { type: "percent" | "flat"; val: number }> = {
          "KSAM20": { type: "percent", val: 20 },
          "WELCOME50": { type: "flat", val: 50 },
          "HUNTER10": { type: "percent", val: 10 }
        };

        if (couponRow && couponRow.is_active) {
          const now = new Date();
          const isValidTime = (!couponRow.valid_from || new Date(couponRow.valid_from) <= now) &&
                              (!couponRow.valid_to || new Date(couponRow.valid_to) >= now);
          const hasRemainingUses = couponRow.max_uses == null || couponRow.used_count < couponRow.max_uses;
          const isPlanApplicable = !Array.isArray(couponRow.applicable_plans) || couponRow.applicable_plans.includes(planSlug);
          const meetsMinOrder = baseAmount >= Number(couponRow.min_order_amount || 0);

          if (isValidTime && hasRemainingUses && isPlanApplicable && meetsMinOrder) {
            appliedCouponCode = couponRow.code;
            if (couponRow.discount_type === "percent") {
              discountAmount = Math.round((baseAmount * Number(couponRow.discount_value)) / 100);
              if (couponRow.max_discount_amount != null) {
                discountAmount = Math.min(discountAmount, Number(couponRow.max_discount_amount));
              }
            } else {
              discountAmount = Math.min(Number(couponRow.discount_value), baseAmount);
            }
          }
        } else if (FALLBACK_COUPONS[rawCoupon]) {
          const fb = FALLBACK_COUPONS[rawCoupon];
          appliedCouponCode = rawCoupon;
          discountAmount = fb.type === "percent"
            ? Math.round((baseAmount * fb.val) / 100)
            : Math.min(fb.val, baseAmount);
        }
      } catch (cErr) {
        console.warn("[create-razorpay-order] Coupon validation error:", cErr);
      }
    }

    const finalAmount = Math.max(0, baseAmount - discountAmount);

    // 1. FREE PLAN OR 100% DISCOUNT: Activate directly without payment gateway
    if (finalAmount === 0 || planSlug === "explorer") {
      const now = new Date();
      const isFreeExplorer = planSlug === "explorer";
      const endDate = new Date(now.getTime() + (isFreeExplorer ? 10 * 365 : (billingCycle === "yearly" ? 365 : 30)) * 24 * 60 * 60 * 1000);

      // Deactivate any currently active subscriptions for this user
      await supabase
        .from("subscriptions")
        .update({ status: "cancelled", updated_at: now.toISOString() })
        .eq("user_id", user.id)
        .eq("status", "active");

      // Insert new active subscription
      const { data: subData, error: subErr } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan_id: planId,
          plan_slug: planSlug,
          billing_cycle: isFreeExplorer ? "lifetime" : billingCycle,
          status: "active",
          start_date: now.toISOString(),
          end_date: endDate.toISOString(),
          amount_paid: 0,
          currency: "INR",
          auto_renew: false
        })
        .select("id")
        .single();

      if (subErr) {
        throw new Error(`Failed to activate subscription: ${subErr.message}`);
      }

      // Record coupon redemption if coupon resulted in 100% discount
      if (appliedCouponCode) {
        try {
          const { data: cRow } = await supabase.from("coupons").select("id, used_count").eq("code", appliedCouponCode).maybeSingle();
          if (cRow) {
            await supabase.from("coupon_redemptions").insert({
              coupon_id: cRow.id,
              user_id: user.id,
              plan_slug: planSlug,
              discount_amount: discountAmount,
              order_amount: baseAmount,
              final_amount: 0
            });
            await supabase.from("coupons").update({ used_count: (cRow.used_count || 0) + 1 }).eq("id", cRow.id);
          }
        } catch {}
      }

      // Update user preferences
      try {
        await supabase
          .from("profiles")
          .update({
            preferences: { plan: planName },
            updated_at: now.toISOString()
          })
          .eq("id", user.id);
      } catch {}

      return new Response(
        JSON.stringify({
          success: true,
          free: true,
          plan: planSlug,
          plan_name: planName,
          subscription_id: subData?.id,
          message: `${planName} plan activated successfully!`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. PAID PLANS: Create order with Razorpay
    const keyId = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_test_TbQFNEdiyvVwDt";
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keySecret) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "RAZORPAY_KEY_SECRET secret is not configured in Supabase. Please set it using: supabase secrets set RAZORPAY_KEY_SECRET=your_secret"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const amountInPaise = Math.round(finalAmount * 100);
    const receiptId = `rcpt_${user.id.slice(0, 6)}_${Date.now()}`.slice(0, 40);

    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${keyId}:${keySecret}`)}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId,
        notes: {
          user_id: user.id,
          plan_slug: planSlug,
          billing_cycle: billingCycle,
          plan_name: planName,
          coupon_code: appliedCouponCode || "",
          discount_amount: String(discountAmount),
          original_amount: String(baseAmount)
        }
      })
    });

    if (!rzpResponse.ok) {
      const errBody = await rzpResponse.json().catch(() => ({}));
      const errMsg = errBody?.error?.description || `Razorpay order creation failed (HTTP ${rzpResponse.status})`;
      return new Response(
        JSON.stringify({ success: false, error: errMsg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orderData = await rzpResponse.json();

    // Record pending payment in payments table with coupon tracking
    try {
      await supabase.from("payments").insert({
        user_id: user.id,
        plan_slug: planSlug,
        billing_cycle: billingCycle,
        amount: finalAmount,
        currency: "INR",
        razorpay_order_id: orderData.id,
        status: "created",
        coupon_code: appliedCouponCode,
        discount_amount: discountAmount,
        original_amount: baseAmount,
        raw_response: orderData
      });
    } catch (payErr) {
      console.warn("[create-razorpay-order] Payment log insert warning:", payErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: orderData.id,
        amount: orderData.amount,
        currency: "INR",
        key_id: keyId,
        plan_slug: planSlug,
        plan_name: planName,
        billing_cycle: billingCycle,
        discount_amount: discountAmount,
        coupon_code: appliedCouponCode
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[create-razorpay-order] Unexpected error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
