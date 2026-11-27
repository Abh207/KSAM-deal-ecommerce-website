import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { fetchFromAllAdapters } from "../_shared/providers/registry.ts";
import { classifyProduct } from "../_shared/categories.ts";

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

function isInvalidStore(str: unknown): boolean {
  if (!str || typeof str !== "string") return true;
  const s = str.trim().toLowerCase();
  return (
    !s ||
    s.includes("serp") ||
    s.includes("google") ||
    s.includes("ksam") ||
    s.includes("licensed shopping data") ||
    s === "partner store" ||
    s === "partner-store" ||
    s === "general" ||
    s === "unknown" ||
    s === "undefined" ||
    s === "null" ||
    s === "search" ||
    s === "deal" ||
    s === "deals"
  );
}

function cleanStore(str: string): string {
  if (!str) return "";
  let clean = str.trim().replace(/^on\s+/i, "");
  const lower = clean.toLowerCase();
  if (lower === "flipkart") return "Flipkart";
  if (lower === "amazon" || lower === "amazon.in" || lower === "amazon india") return "Amazon";
  if (lower === "myntra") return "Myntra";
  if (lower === "ajio") return "AJIO";
  if (lower === "croma") return "Croma";
  if (lower === "tatacliq" || lower === "tata cliq") return "Tata CLiQ";
  if (lower === "boat" || lower === "boat lifestyle") return "boAt";
  if (lower === "meesho") return "Meesho";
  if (lower === "nykaa") return "Nykaa";
  if (lower === "reliancedigital" || lower === "reliance digital") return "Reliance Digital";
  if (lower === "vijaysales" || lower === "vijay sales") return "Vijay Sales";
  if (lower === "etoren" || lower === "etoren.com") return "Etoren.com";
  return clean.replace(/\b\w/g, (c) => c.toUpperCase());
}

function deriveMerchantName(p: any): string {
  if (p.store_name && typeof p.store_name === "string" && !isInvalidStore(p.store_name)) {
    return cleanStore(p.store_name);
  }
  if (p.source && typeof p.source === "string" && !isInvalidStore(p.source)) {
    return cleanStore(p.source);
  }
  if (p.store && typeof p.store === "string" && !isInvalidStore(p.store)) {
    return cleanStore(p.store);
  }
  if (p.raw?.source && typeof p.raw.source === "string" && !isInvalidStore(p.raw.source)) {
    return cleanStore(p.raw.source);
  }
  const url = p.product_url || p.affiliate_url || p.url || "";
  if (url) {
    try {
      const host = new URL(url).hostname.replace(/^(www\.|m\.)/i, "").toLowerCase();
      if (host.includes("flipkart.")) return "Flipkart";
      if (host.includes("amazon.")) return "Amazon";
      if (host.includes("myntra.")) return "Myntra";
      if (host.includes("ajio.")) return "AJIO";
      if (host.includes("croma.")) return "Croma";
      if (host.includes("tatacliq.")) return "Tata CLiQ";
      if (host.includes("boat-lifestyle.") || host.includes("boat.")) return "boAt";
      if (host.includes("meesho.")) return "Meesho";
      if (host.includes("nykaa.")) return "Nykaa";
      if (host.includes("reliancedigital.")) return "Reliance Digital";
      if (host.includes("vijaysales.")) return "Vijay Sales";
      if (host.includes("etoren.")) return "Etoren.com";
      if (host.includes("samsung.")) return "Samsung";
      if (host.includes("apple.")) return "Apple";
      const domain = host.replace(/\.(co|com|org|net|gov|edu)\.[a-z]{2,4}$/i, "").replace(/\.[a-z]{2,8}$/i, "").split(".").pop();
      if (domain && domain !== "google" && !domain.includes("ksam") && !domain.includes("serp")) {
        return cleanStore(domain);
      }
    } catch {}
  }
  return "";
}

function extractRealDescription(p: any): string {
  const cand = p.description || p.raw?.snippet || (Array.isArray(p.raw?.extensions) ? p.raw.extensions.join(" • ") : "") || p.features || "";
  if (!cand || typeof cand !== "string") return "";
  const cleaned = cand.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (cleaned.startsWith("Verified hot deal on") || cleaned.length < 20) return "";
  return cleaned;
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Rate limit by client IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ success: false, error: "Rate limit exceeded. Please wait a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }


  let body: { query?: string; action?: string; product?: any } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
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

  // Handle single external product upsert action (persists clicked live search deals securely server-side)
  if (body.action === "upsert" && body.product) {
    const p = body.product;
    const rawExternalId = p.external_id ? String(p.external_id) : (p.id ? String(p.id).replace(/^ext-/, "") : "");
    if (!rawExternalId) {
      return new Response(JSON.stringify({ success: false, error: "Missing external_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const resolvedStoreName = deriveMerchantName(p);
    let storeId: string | null = null;
    if (resolvedStoreName) {
      const storeSlug = resolvedStoreName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      try {
        const { data: storeRow } = await supabase
          .from("stores")
          .select("id")
          .or(`slug.eq.${storeSlug},name.ilike.%${resolvedStoreName}%`)
          .maybeSingle();
        if (storeRow?.id) storeId = storeRow.id;
      } catch {}
    }

    const cleanDesc = extractRealDescription(p);
    const upsertData: Record<string, any> = {
      store_id: storeId,
      store_name: resolvedStoreName || null,
      external_id: rawExternalId,
      name: p.name || p.title || "External Product",
      title: p.title || p.name || "External Product",
      brand: p.brand && !String(p.brand).toLowerCase().includes("ksam") ? p.brand : null,
      category: classifyProduct(p.title || p.name || "", p.category),
      description: cleanDesc || null,
      image_url: p.image_url || p.image || null,
      price: p.price ? Number(p.price) : 0,
      old_price: (p.old_price || p.oldPrice) ? Number(p.old_price || p.oldPrice) : null,
      discount_percent: p.discount ? Number(p.discount) : 0,
      rating: p.rating ? Number(p.rating) : 0,
      reviews: p.reviews ? Number(p.reviews) : 0,
      availability: p.availability || "In Stock",
      store_name: resolvedStoreName || p.store_name || p.store || null,
      product_url: p.product_url || p.productUrl || p.url || null,
      affiliate_url: p.affiliate_url || p.affiliateUrl || p.url || p.product_url || null,
      source: resolvedStoreName || p.source || p.store_name || null,
      is_active: true,
      last_seen_at: new Date().toISOString(),
      price_updated_at: new Date().toISOString()
    };

    let savedId = null;
    try {
      const { data: existing } = await supabase
        .from("products")
        .select("id, description")
        .eq("external_id", rawExternalId)
        .maybeSingle();

      if (existing?.id) {
        // Do not overwrite an existing description with null
        if (!cleanDesc && existing.description) {
          delete upsertData.description;
        }
        await supabase.from("products").update(upsertData).eq("id", existing.id);
        savedId = existing.id;
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from("products")
          .insert(upsertData)
          .select("id")
          .single();
        if (!insertErr && inserted?.id) {
          savedId = inserted.id;
        }
      }
    } catch (e) {
      console.error("[search-products upsert] Error:", e);
    }

    return new Response(JSON.stringify({ success: true, id: savedId, external_id: rawExternalId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const query = cleanQuery(body.query);
  if (!query) {
    return new Response(
      JSON.stringify({ success: true, count: 0, products: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  const normalizedQuery = query.toLowerCase();

  // Ensure existing database products have is_active set to true
  try {
    await supabase.from("products").update({ is_active: true, last_seen_at: new Date().toISOString() }).eq("is_active", false);
  } catch {
    // Non-blocking if table permissions differ
  }

  // 1. Search existing products table first using name, brand, category, and description
  const { data: dbProducts } = await supabase
    .from("products")
    .select(`
      id,
      external_id,
      name,
      description,
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
    .or(`name.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
    .order("discount_percent", { ascending: false, nullsFirst: false })
    .limit(20);

  let results = (dbProducts || []).map((p: any) => ({
    id: p.id,
    external_id: p.external_id || String(p.id),
    name: p.name,
    description: p.description || p.name,
    brand: p.brand || "",
    category: p.category || "General",
    image: p.image_url,
    image_url: p.image_url,
    price: Number(p.price || 0),
    old_price: p.old_price ? Number(p.old_price) : undefined,
    oldPrice: p.old_price ? Number(p.old_price) : undefined,
    discount: p.discount_percent ? Number(p.discount_percent) : 0,
    rating: p.rating ? Number(p.rating) : 0,
    reviews: p.reviews || 0,
    availability: p.availability || "In Stock",
    store: (p.stores?.name && p.stores.name.toLowerCase() !== "ksam deal") ? p.stores.name : (p.source || ""),
    storeLogo: p.stores?.logo_url,
    url: p.affiliate_url || p.product_url || "#",
    product_url: p.product_url,
    affiliate_url: p.affiliate_url,
    price_updated_at: p.price_updated_at
  }));


  let adapterDiagnostics: any[] = [];

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

      adapterDiagnostics = adapterResults.map((r) => ({
        store_slug: r.store_slug,
        configured: r.configured,
        fetched: r.fetched,
        count: r.products?.length || 0,
        error: r.error || null
      }));

      const liveProducts = [];
      for (const res of adapterResults) {
        liveProducts.push(...res.products);
      }

      if (liveProducts.length > 0) {
        // Fetch store map for store naming
        const { data: storesList } = await supabase.from("stores").select("id, slug, name, logo_url");
        const storeMap = new Map<string, { id: string; name: string; logo: string }>();
        for (const s of storesList || []) {
          storeMap.set(s.slug, { id: s.id, name: s.name, logo: s.logo_url });
        }

        // Map live products directly to the response format
        const mappedLive = liveProducts.map((p: any, idx: number) => {
          const storeInfo = storeMap.get(p.store_slug);
          const resolvedStoreName = deriveMerchantName(p) || (storeInfo && !isInvalidStore(storeInfo.name) ? storeInfo.name : "");
          const desc = extractRealDescription(p);
          return {
            id: p.external_id ? `ext-${p.external_id}` : `live-${idx}-${Date.now()}`,
            external_id: p.external_id,
            name: p.name,
            brand: p.brand,
            category: p.category,
            description: desc || "",
            image: p.image_url,
            image_url: p.image_url,
            price: Number(p.price || 0),
            old_price: p.old_price ? Number(p.old_price) : undefined,
            oldPrice: p.old_price ? Number(p.old_price) : undefined,
            discount: p.discount_percent ? Number(p.discount_percent) : 0,
            rating: p.rating ? Number(p.rating) : 0,
            reviews: p.reviews || 0,
            availability: p.availability || "In Stock",
            store: resolvedStoreName,
            store_name: resolvedStoreName,
            storeLogo: storeInfo?.logo,
            url: p.affiliate_url || p.product_url || "#",
            product_url: p.product_url,
            affiliate_url: p.affiliate_url,
            price_updated_at: new Date().toISOString()
          };
        });

        // Merge and deduplicate by URL or name+store
        const merged = [...results, ...mappedLive];
        const seen = new Set();
        results = [];
        for (const item of merged) {
          const key = (item.url && item.url !== "#") ? item.url.toLowerCase() : `${item.name}-${item.store}`.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            results.push(item);
          }
        }

        // Best-effort background DB cache (do not crash if onConflict or RLS fails)
        try {
          const upsertRows = liveProducts
            .filter((p: any) => p.price && p.price > 0 && p.name && p.name.length >= 5 && !/^\d+$/.test(p.name.trim()))
            .map((p: any) => {
              const storeInfo = storeMap.get(p.store_slug);
              const resolvedStoreName = deriveMerchantName(p) || (storeInfo && !isInvalidStore(storeInfo.name) ? storeInfo.name : null);
              const desc = extractRealDescription(p);
              return {
                store_id: storeInfo?.id || null,
                store_name: resolvedStoreName || null,
                external_id: p.external_id,
                name: p.name,
                title: p.name,
                brand: p.brand || null,
                category: p.category || "Search",
                description: desc || null,
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
                store_name: resolvedStoreName || null,
                source: resolvedStoreName || null,
                raw: p.raw || {},
                is_active: true,
                last_seen_at: new Date().toISOString(),
                price_updated_at: new Date().toISOString()
              };
            });

          await supabase.from("products").insert(upsertRows).select("id");
        } catch (dbCacheErr) {
          console.warn("[search-products] Optional DB cache insert skipped:", dbCacheErr);
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

    const serpDiag = adapterDiagnostics.find((d: any) => d.store_slug === "serp-shopping");
    return new Response(
      JSON.stringify({
        success: true,
        count: results.length,
        products: results,
        external_error: serpDiag?.error || null,
        diagnostics: adapterDiagnostics
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("[search-products] Unhandled error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || "Internal server error occurred while searching products.",
        count: 0,
        products: []
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

