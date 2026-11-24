import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

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
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const rawBody = await req.text();
    const webhookSignature = req.headers.get("x-razorpay-signature");
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");

    if (webhookSecret && webhookSignature) {
      const expectedSignature = await computeHmacSha256(rawBody, webhookSecret);
      if (!timingSafeEqualStr(expectedSignature, webhookSignature)) {
        console.warn("[razorpay-webhook] Invalid webhook signature rejected");
        return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
      }
    } else if (webhookSecret && !webhookSignature) {
      console.warn("[razorpay-webhook] Missing x-razorpay-signature header");
      return new Response(JSON.stringify({ error: "Missing signature" }), { status: 400 });
    }

    let event: any = {};
    try {
      event = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON payload", { status: 400 });
    }

    const eventType = event.event;
    console.log(`[razorpay-webhook] Processing event: ${eventType}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[razorpay-webhook] Supabase service credentials missing");
      return new Response("Server configuration error", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (eventType === "payment.captured") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const userId = paymentEntity?.notes?.user_id;
      const planSlug = paymentEntity?.notes?.plan_slug || "deal-hunter";
      const billingCycle = paymentEntity?.notes?.billing_cycle || "monthly";
      const amount = (paymentEntity?.amount ? paymentEntity.amount / 100 : 99);

      if (orderId && paymentId) {
        // Check if already processed
        const { data: existingPayment } = await supabase
          .from("payments")
          .select("id, status, user_id")
          .eq("razorpay_order_id", orderId)
          .maybeSingle();

        const resolvedUserId = existingPayment?.user_id || userId;

        if (existingPayment?.status !== "paid") {
          const now = new Date();
          await supabase
            .from("payments")
            .update({
              status: "paid",
              razorpay_payment_id: paymentId,
              raw_response: event,
              updated_at: now.toISOString()
            })
            .eq("razorpay_order_id", orderId);

          if (resolvedUserId) {
            const startDate = now;
            const endDate = new Date(startDate);
            if (billingCycle === "yearly") {
              endDate.setDate(endDate.getDate() + 365);
            } else {
              endDate.setDate(endDate.getDate() + 30);
            }

            // Deactivate existing active subscriptions
            await supabase
              .from("subscriptions")
              .update({ status: "cancelled", updated_at: now.toISOString() })
              .eq("user_id", resolvedUserId)
              .eq("status", "active");

            // Look up plan
            const { data: planRow } = await supabase
              .from("plans")
              .select("id, name")
              .eq("slug", planSlug)
              .maybeSingle();

            // Insert new subscription
            await supabase.from("subscriptions").insert({
              user_id: resolvedUserId,
              plan_id: planRow?.id || null,
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
            });

            // Update user profile
            try {
              await supabase
                .from("profiles")
                .update({
                  preferences: { plan: planRow?.name || planSlug },
                  updated_at: now.toISOString()
                })
                .eq("id", resolvedUserId);
            } catch {}
          }
        }
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      if (orderId) {
        await supabase
          .from("payments")
          .update({
            status: "failed",
            raw_response: event,
            updated_at: new Date().toISOString()
          })
          .eq("razorpay_order_id", orderId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("[razorpay-webhook] Unexpected error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Webhook processing error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
