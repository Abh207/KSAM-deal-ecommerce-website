import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { fetchFromAllAdapters, getRegisteredAdapters } from "../_shared/providers/registry.ts";
import { NormalizedProduct } from "../_shared/providers/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ingest-secret",
};

// Constant time string comparison to prevent timing attacks on INGEST_SECRET
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

const CATEGORIES = [
  "electronics",
  "mobiles",
  "laptops",
  "audio",
  "shoes",
  "fashion",
  "gaming",
  "home",
  "beauty",
  "eyewear"
];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();
  const secretHeader = req.headers.get("x-ingest-secret") || "";
  const expectedSecret = Deno.env.get("INGEST_SECRET") || "";

  // Verify secret header
  if (!expectedSecret || !timingSafeEqualStr(secretHeader, expectedSecret)) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Invalid or missing X-Ingest-Secret header" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: "Supabase service credentials not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let body: { trigger?: string; category?: string; query?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const trigger = (body.trigger === "cron" || body.trigger === "search" || body.trigger === "manual")
    ? body.trigger
    : "manual";

  // Pick category to ingest: either specified or rotated
  const categoryToIngest = body.category || CATEGORIES[Math.floor(Date.now() / (30 * 60 * 1000)) % CATEGORIES.length];
  const queryToIngest = body.query;

  // Pre-load store map (slug -> uuid)
  const { data: storesList } = await supabase.from("stores").select("id, slug");
  const storeMap = new Map<string, string>();
  for (const s of storesList || []) {
    storeMap.set(s.slug, s.id);
  }

  // Fetch deals from all registered adapters
  const adapterResults = await fetchFromAllAdapters({
    category: categoryToIngest,
    query: queryToIngest,
    limit: 20,
    isSearch: false
  });

  let totalFetched = 0;
  let totalUpserted = 0;
  const collectedProducts: NormalizedProduct[] = [];

  for (const res of adapterResults) {
    totalFetched += res.fetched;
    collectedProducts.push(...res.products);

    // Record adapter result in ingest_runs
    await supabase.from("ingest_runs").insert({
      store_slug: res.store_slug,
      trigger,
      query: queryToIngest || categoryToIngest,
      fetched: res.fetched,
      upserted: res.products.length,
      status: res.error ? "error" : "completed",
      error: res.error || null,
      finished_at: new Date().toISOString()
    });
  }

  // Process upserts in batches of up to 200 items
  const batch = collectedProducts.slice(0, 200);

  if (batch.length > 0) {
    // 1. Fetch current prices for existing products to detect price changes
    const externalIds = batch.map((p) => p.external_id);
    const { data: existingProducts } = await supabase
      .from("products")
      .select("id, external_id, price")
      .in("external_id", externalIds);

    const existingMap = new Map<string, { id: string; price: number }>();
    for (const ep of existingProducts || []) {
      existingMap.set(ep.external_id, { id: ep.id, price: Number(ep.price) });
    }

    // 2. Prepare product rows for upsert
    const upsertRows = batch.map((p) => {
      const storeId = storeMap.get(p.store_slug) || null;
      return {
        store_id: storeId,
        external_id: p.external_id,
        name: p.name,
        title: p.name,
        brand: p.brand || null,
        category: p.category || categoryToIngest,
        image_url: p.image_url,
        additional_images: p.additional_images || [],
        price: p.price,
        old_price: p.old_price || null,
        currency: p.currency || "INR",
        rating: p.rating || 0,
        reviews: p.reviews || 0,
        availability: p.availability || "In Stock",
        product_url: p.product_url,
        affiliate_url: p.affiliate_url || p.product_url,
        tags: p.tags || [],
        source: p.store_slug,
        raw: p.raw || {},
        is_active: true,
        last_seen_at: new Date().toISOString(),
        price_updated_at: new Date().toISOString()
      };
    });

    const { data: upsertedData, error: upsertErr } = await supabase
      .from("products")
      .upsert(upsertRows, { onConflict: "store_id,external_id" })
      .select("id, external_id, price, old_price");

    if (!upsertErr && upsertedData) {
      totalUpserted = upsertedData.length;

      // 3. Record price history ONLY when the price actually changed
      const priceHistoryRows = [];
      for (const item of upsertedData) {
        const prev = existingMap.get(item.external_id);
        const newPrice = Number(item.price);
        if (!prev || prev.price !== newPrice) {
          priceHistoryRows.push({
            product_id: item.id,
            price: newPrice,
            old_price: item.old_price ? Number(item.old_price) : null,
            captured_at: new Date().toISOString()
          });
        }
      }

      if (priceHistoryRows.length > 0) {
        await supabase.from("price_history").insert(priceHistoryRows);
      }
    }
  }

  // Deactivate stale products not seen in 3 days
  let deactivatedCount = 0;
  const { data: deactRes } = await supabase.rpc("deactivate_stale_products", { max_age: "3 days" });
  if (typeof deactRes === "number") {
    deactivatedCount = deactRes;
  }

  const durationMs = Date.now() - startTime;

  return new Response(
    JSON.stringify({
      success: true,
      trigger,
      summary: {
        category: categoryToIngest,
        fetched: totalFetched,
        upserted: totalUpserted,
        deactivated: deactivatedCount,
        duration_ms: durationMs,
        adapters: adapterResults.map((r) => ({
          slug: r.store_slug,
          configured: r.configured,
          fetched: r.fetched,
          error: r.error || null
        }))
      }
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
