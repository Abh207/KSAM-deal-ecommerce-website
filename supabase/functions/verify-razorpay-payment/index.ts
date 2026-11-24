import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { corsHeaders } from "../_shared/cors.ts";

// Timing-safe constant-time string comparison
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

// Computes HMAC SHA-256 hex string
async function computeHmacSha256(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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

    // Verify authenticated user
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or expired session. Please sign in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body: {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      plan_slug?: string;
      billing_cycle?: string;
    } = {};

    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const orderId = body.razorpay_order_id;
    const paymentId = body.razorpay_payment_id;
    const signature = body.razorpay_signature;

    if (!orderId || !paymentId || !signature) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required Razorpay parameters (order_id, payment_id, or signature)"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret) {
      return new Response(
        JSON.stringify({ success: false, error: "RAZORPAY_KEY_SECRET is not configured on the server" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Signature Verification with HMAC SHA-256 (constant-time)
    const expectedMessage = `${orderId}|${paymentId}`;
    const expectedSignature = await computeHmacSha256(expectedMessage, keySecret);

    if (!timingSafeEqualStr(expectedSignature, signature)) {
      console.warn(`[verify-razorpay-payment] Invalid signature for order: ${orderId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Payment verification failed: invalid signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Idempotency Check: if this payment_id is already marked paid and subscription exists, return success
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id, user_id, plan_slug, billing_cycle, amount, status, razorpay_payment_id")
      .eq("razorpay_order_id", orderId)
      .maybeSingle();

    if (existingPayment) {
      // Security: ensure order belongs to this user
      if (existingPayment.user_id !== user.id) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized: payment order does not belong to this account" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (existingPayment.status === "paid" && existingPayment.razorpay_payment_id === paymentId) {
        // Already successfully processed
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("id, plan_slug, status, end_date")
          .eq("razorpay_payment_id", paymentId)
          .maybeSingle();

        return new Response(
          JSON.stringify({
            success: true,
            already_verified: true,
            subscription_id: existingSub?.id,
            plan_slug: existingSub?.plan_slug || existingPayment.plan_slug,
            message: "Payment already verified successfully"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const planSlug = existingPayment?.plan_slug || body.plan_slug || "deal-hunter";
    const billingCycle = existingPayment?.billing_cycle || body.billing_cycle || "monthly";
    const amount = existingPayment?.amount || (planSlug === "pro" ? 199 : 99);

    // 3. Mark payment as paid
    const now = new Date();
    await supabase
      .from("payments")
      .update({
        status: "paid",
        razorpay_payment_id: paymentId,
        updated_at: now.toISOString()
      })
      .eq("razorpay_order_id", orderId);

    // 3b. Log coupon redemption and increment usage count if coupon was used
    if (existingPayment?.coupon_code) {
      try {
        const { data: cRow } = await supabase
          .from("coupons")
          .select("id, used_count")
          .eq("code", existingPayment.coupon_code)
          .maybeSingle();

        if (cRow) {
          await supabase.from("coupon_redemptions").insert({
            coupon_id: cRow.id,
            user_id: user.id,
            payment_id: existingPayment.id,
            plan_slug: planSlug,
            discount_amount: existingPayment.discount_amount || 0,
            order_amount: existingPayment.original_amount || amount,
            final_amount: amount
          });

          await supabase.from("coupons").update({
            used_count: (cRow.used_count || 0) + 1,
            updated_at: now.toISOString()
          }).eq("id", cRow.id);
        }
      } catch (cErr) {
        console.warn("[verify-razorpay-payment] Coupon redemption logging warning:", cErr);
      }
    }

    // 4. Calculate subscription start & expiry date
    const startDate = now;
    const endDate = new Date(startDate);
    if (billingCycle === "yearly") {
      endDate.setDate(endDate.getDate() + 365);
    } else {
      endDate.setDate(endDate.getDate() + 30);
    }

    // 5. Look up plan_id
    let planId: string | null = null;
    let planDisplayName = planSlug === "pro" ? "Pro" : (planSlug === "deal-hunter" ? "Deal Hunter" : "Explorer");
    try {
      const { data: planRow } = await supabase
        .from("plans")
        .select("id, name")
        .eq("slug", planSlug)
        .maybeSingle();
      if (planRow) {
        planId = planRow.id;
        planDisplayName = planRow.name;
      }
    } catch {}

    // 6. Deactivate existing active subscriptions for this user
    await supabase
      .from("subscriptions")
      .update({ status: "cancelled", updated_at: now.toISOString() })
      .eq("user_id", user.id)
      .eq("status", "active");

    // 7. Insert new active subscription
    const { data: newSub, error: subErr } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_id: planId,
        plan_slug: planSlug,
        billing_cycle: billingCycle,
        status: "active",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        amount_paid: amount,
        currency: "INR",
        auto_renew: false
      })
      .select("id, plan_slug, start_date, end_date, status")
      .single();

    if (subErr) {
      console.error("[verify-razorpay-payment] Failed to insert subscription:", subErr);
      throw new Error(`Failed to activate subscription: ${subErr.message}`);
    }

    // 8. Update user profile preferences with current plan
    try {
      await supabase
        .from("profiles")
        .update({
          preferences: { plan: planDisplayName },
          updated_at: now.toISOString()
        })
        .eq("id", user.id);
    } catch (profErr) {
      console.warn("[verify-razorpay-payment] Profile plan update warning:", profErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        subscription_id: newSub.id,
        plan_slug: planSlug,
        plan_name: planDisplayName,
        billing_cycle: billingCycle,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        message: `${planDisplayName} subscription activated successfully!`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[verify-razorpay-payment] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Internal payment verification error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
