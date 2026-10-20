import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { fetchFromAllAdapters } from "../_shared/providers/registry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory sliding window rate limiter per client IP (20 requests per minute)
const ipRateLimits = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRateLimits.get(ip);
  if (!record || now > record.resetAt) {
    ipRateLimits.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (record.count >= 20) {
    return false;
  }
  record.count++;
  return true;
}

function cleanQuery(raw: unknown): string {
  if (!raw) return "";
  return String(raw)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // strip control characters
    .replace(/[^\w\s\-\.]/gi, " ") // strip SQL / special punctuation
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80); // max 80 chars
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Rate limit by client IP
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(clientIp)) {
    return new Response(
      JSON.stringify({ success: false, error: "Rate limit exceeded. Please wait a moment." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let body: { query?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const query = cleanQuery(body.query);
  if (!query) {
    return new Response(
      JSON.stringify({ success: true, count: 0, products: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ success: false, error: "Supabase service credentials not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const normalizedQuery = query.toLowerCase();

  // 1. Search existing products table first using full-text and trigram match
  const { data: dbProducts, error: dbErr } = await supabase
    .from("products")
    .select(`
      id,
      name,
      brand,
      category,
      image_url,
      price,
      old_price,
      discount_percent,
      rating,
      reviews,
      availability,
      product_url,
      affiliate_url,
      price_updated_at,
      stores (
        id,
        name,
        logo_url,
        base_url
      )
    `)
    .eq("is_active", true)
    .or(`name.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%`)
    .order("discount_percent", { ascending: false, nullsFirst: false })
    .limit(20);

  let results = (dbProducts || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    image: p.image_url,
    image_url: p.image_url,
    price: Number(p.price || 0),
    old_price: p.old_price ? Number(p.old_price) : undefined,
    oldPrice: p.old_price ? Number(p.old_price) : undefined,
    discount: p.discount_percent ? Number(p.discount_percent) : 0,
    rating: p.rating ? Number(p.rating) : 0,
    reviews: p.reviews || 0,
    availability: p.availability || "In Stock",
    store: p.stores?.name || "KSAM Deal",
    storeLogo: p.stores?.logo_url,
    url: p.affiliate_url || p.product_url || "#",
    product_url: p.product_url,
    affiliate_url: p.affiliate_url,
    price_updated_at: p.price_updated_at
  }));

  // 2. Check search demand and decide whether to fetch live
  const { data: demandRow } = await supabase
    .from("search_demand")
    .select("hits, last_fetched_at")
    .eq("query_normalized", normalizedQuery)
    .single();

  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const needsLiveFetch = results.length < 12 || !demandRow?.last_fetched_at || demandRow.last_fetched_at < thirtyMinsAgo;

  if (needsLiveFetch) {
    try {
      const adapterResults = await fetchFromAllAdapters({
        query,
        limit: 12,
        isSearch: true
      });

      const liveProducts = [];
      for (const res of adapterResults) {
        liveProducts.push(...res.products);
      }

      if (liveProducts.length > 0) {
        // Fetch store map
        const { data: storesList } = await supabase.from("stores").select("id, slug, name, logo_url");
        const storeMap = new Map<string, { id: string; name: string; logo: string }>();
        for (const s of storesList || []) {
          storeMap.set(s.slug, { id: s.id, name: s.name, logo: s.logo_url });
        }

        const upsertRows = liveProducts.map((p) => {
          const storeInfo = storeMap.get(p.store_slug);
          return {
            store_id: storeInfo?.id || null,
            external_id: p.external_id,
            name: p.name,
            title: p.name,
            brand: p.brand || null,
            category: p.category || "Search",
            image_url: p.image_url,
            price: p.price,
            old_price: p.old_price || null,
            currency: p.currency || "INR",
            rating: p.rating || 0,
            reviews: p.reviews || 0,
            availability: p.availability || "In Stock",
            product_url: p.product_url,
            affiliate_url: p.affiliate_url || p.product_url,
            tags: p.tags || [normalizedQuery],
            source: p.store_slug,
            raw: p.raw || {},
            is_active: true,
            last_seen_at: new Date().toISOString(),
            price_updated_at: new Date().toISOString()
          };
        });

        const { data: upsertedItems } = await supabase
          .from("products")
          .upsert(upsertRows, { onConflict: "store_id,external_id" })
          .select(`
            id, name, brand, category, image_url, price, old_price, discount_percent,
            rating, reviews, availability, product_url, affiliate_url, price_updated_at,
            stores ( id, name, logo_url, base_url )
          `);

        if (upsertedItems) {
          const mappedLive = upsertedItems.map((p: any) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category,
            image: p.image_url,
            image_url: p.image_url,
            price: Number(p.price || 0),
            old_price: p.old_price ? Number(p.old_price) : undefined,
            oldPrice: p.old_price ? Number(p.old_price) : undefined,
            discount: p.discount_percent ? Number(p.discount_percent) : 0,
            rating: p.rating ? Number(p.rating) : 0,
            reviews: p.reviews || 0,
            availability: p.availability || "In Stock",
            store: p.stores?.name || "KSAM Deal",
            storeLogo: p.stores?.logo_url,
            url: p.affiliate_url || p.product_url || "#",
            product_url: p.product_url,
            affiliate_url: p.affiliate_url,
            price_updated_at: p.price_updated_at
          }));

          // Merge and deduplicate by external_id / name+store
          const merged = [...results, ...mappedLive];
          const seen = new Set();
          results = [];
          for (const item of merged) {
            const key = `${item.name}-${item.store}`.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              results.push(item);
            }
          }
        }
      }
    } catch (fetchErr) {
      console.error("[search-products] Live adapter fetch error:", fetchErr);
    }

    // Update search demand hits and last_fetched_at
    await supabase.from("search_demand").upsert(
      {
        query_normalized: normalizedQuery,
        hits: (demandRow?.hits || 0) + 1,
        last_searched_at: new Date().toISOString(),
        last_fetched_at: new Date().toISOString()
      },
      { onConflict: "query_normalized" }
    );
  } else {
    // Increment hits count only
    await supabase.from("search_demand").upsert(
      {
        query_normalized: normalizedQuery,
        hits: (demandRow?.hits || 0) + 1,
        last_searched_at: new Date().toISOString()
      },
      { onConflict: "query_normalized" }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      count: results.length,
      products: results
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
