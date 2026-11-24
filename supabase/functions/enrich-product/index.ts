import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_DAILY_CREDIT_CAP = 20;

function isUrlSsrfSafe(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "0.0.0.0"
    ) {
      return false;
    }

    if (
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".lan") ||
      hostname.endsWith(".home")
    ) {
      return false;
    }

    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const [_, a, b] = ipv4Match.map(Number);
      if (a === 127 || a === 10 || a === 0) return false;
      if (a === 172 && b >= 16 && b <= 31) return false;
      if (a === 192 && b === 168) return false;
      if (a === 169 && b === 254) return false;
    }

    if (hostname.includes("fe80:") || hostname.includes("fc00:") || hostname.includes("fd00:")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function sanitizeText(str: any): string {
  if (!str || typeof str !== "string") return "";
  const clean = str
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.startsWith("Verified hot deal on")) return "";
  return clean;
}

function parsePrice(val: any): number {
  if (typeof val === "number") return val;
  if (!val || typeof val !== "string") return 0;
  const num = val.replace(/[^0-9.]/g, "");
  return parseFloat(num) || 0;
}

interface EnrichedData {
  about_text: string | null;
  key_features: string[];
  specifications: Record<string, string>;
  brand: string | null;
  sku: string | null;
  condition: string | null;
  offers: Array<{
    seller_name: string;
    price: number;
    delivery_text: string | null;
    return_policy_text: string | null;
    offer_text: string | null;
    condition: string;
    url: string | null;
  }>;
  source: string;
  credits_used: number;
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
        JSON.stringify({ success: false, error: "Supabase service credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: { product_id?: string; external_id?: string; url?: string; title?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const productId = body.product_id;
    const externalId = body.external_id;
    const providedUrl = body.url;

    let dbProduct: any = null;
    if (productId || externalId) {
      let query = supabase
        .from("products")
        .select(`
          id, name, title, description, about_text, key_features, specifications,
          brand, sku, condition, product_url, affiliate_url, external_id, enriched_at,
          enrichment_source, price, rating, reviews, store_name, raw
        `);
      if (productId) {
        query = query.eq("id", productId);
      } else if (externalId) {
        query = query.eq("external_id", externalId);
      }
      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        dbProduct = data;
      }
    }

    // 1. CACHE CHECK: If enriched within the last 7 days, return cached data immediately
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = new Date();
    if (dbProduct?.enriched_at) {
      const enrichedTime = new Date(dbProduct.enriched_at).getTime();
      const isRecent = (now.getTime() - enrichedTime) < SEVEN_DAYS_MS;

      if (isRecent) {
        // Fetch cached offers from product_offers
        let cachedOffers: any[] = [];
        try {
          const { data: offersData } = await supabase
            .from("product_offers")
            .select("seller_name, platform, price, delivery_text, return_policy_text, offer_text, condition, affiliate_url, url")
            .eq("product_id", dbProduct.id);
          if (Array.isArray(offersData)) {
            cachedOffers = offersData.map((o) => ({
              seller_name: o.seller_name || o.platform || "Merchant",
              price: Number(o.price || 0),
              delivery_text: o.delivery_text || null,
              return_policy_text: o.return_policy_text || null,
              offer_text: o.offer_text || null,
              condition: o.condition || "New",
              url: o.url || o.affiliate_url || null
            }));
          }
        } catch {}

        return new Response(
          JSON.stringify({
            success: true,
            enriched: false,
            source: dbProduct.enrichment_source || "database_cached",
            credits_used: 0,
            about_text: dbProduct.about_text || dbProduct.description || null,
            key_features: Array.isArray(dbProduct.key_features) ? dbProduct.key_features : [],
            specifications: typeof dbProduct.specifications === "object" && dbProduct.specifications ? dbProduct.specifications : {},
            brand: dbProduct.brand || null,
            sku: dbProduct.sku || null,
            condition: dbProduct.condition || "New",
            offers: cachedOffers,
            enriched_at: dbProduct.enriched_at
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let foundDesc: string | null = dbProduct?.about_text || dbProduct?.description || null;
    let foundFeatures: string[] = Array.isArray(dbProduct?.key_features) && dbProduct.key_features.length > 0 ? dbProduct.key_features : [];
    let foundSpecs: Record<string, string> = typeof dbProduct?.specifications === "object" && dbProduct.specifications ? { ...dbProduct.specifications } : {};
    let foundBrand: string | null = dbProduct?.brand || null;
    let foundSku: string | null = dbProduct?.sku || null;
    let foundCondition: string | null = dbProduct?.condition || "New";
    let foundOffers: any[] = [];
    let enrichmentSource = "none";
    let creditsUsed = 0;

    // 2. SERPAPI GOOGLE PRODUCT ENRICHMENT (Priority 2)
    const apiKey = Deno.env.get("SERPAPI_KEY");
    const serpapiProductId = dbProduct?.raw?.serpapi_product_id ||
      dbProduct?.raw?.product_id ||
      (dbProduct?.external_id?.length >= 10 ? dbProduct.external_id : null);

    // Check daily credit budget cap before making API call
    let canUseSerpApi = Boolean(apiKey && serpapiProductId);
    if (canUseSerpApi) {
      try {
        const rawCap = Deno.env.get("SERPAPI_DAILY_CREDIT_CAP");
        const dailyCap = rawCap ? parseInt(rawCap, 10) : DEFAULT_DAILY_CREDIT_CAP;

        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);

        const { data: logs } = await supabase
          .from("api_credit_logs")
          .select("credits_used")
          .eq("service", "serpapi")
          .gte("created_at", startOfDay.toISOString());

        const creditsToday = Array.isArray(logs) ? logs.reduce((acc, row) => acc + (row.credits_used || 1), 0) : 0;
        if (creditsToday >= dailyCap) {
          console.warn(`[enrich-product] SerpApi daily credit cap reached (${creditsToday}/${dailyCap}). Falling back to store fetch.`);
          canUseSerpApi = false;
        }
      } catch (capErr) {
        console.warn("[enrich-product] Credit cap check warning:", capErr);
      }
    }

    if (canUseSerpApi && serpapiProductId) {
      try {
        const serpUrl = new URL("https://serpapi.com/search.json");
        serpUrl.searchParams.set("engine", "google_product");
        serpUrl.searchParams.set("product_id", serpapiProductId);
        serpUrl.searchParams.set("gl", "in");
        serpUrl.searchParams.set("hl", "en");
        serpUrl.searchParams.set("api_key", apiKey!);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const serpRes = await fetch(serpUrl.toString(), { signal: controller.signal });
        clearTimeout(timeout);

        if (serpRes.ok) {
          creditsUsed = 1; // Google Product API call costs 1 SerpApi credit
          const serpData = await serpRes.json();
          const pRes = serpData.product_results;

          // Log credit audit
          try {
            await supabase.from("api_credit_logs").insert({
              service: "serpapi",
              endpoint: "google_product",
              credits_used: 1,
              product_id: dbProduct?.id || null,
              metadata: { product_id: serpapiProductId, product_name: dbProduct?.name }
            });
          } catch {}

          if (pRes) {
            enrichmentSource = "serpapi_google_product";

            // Description
            const candDesc = pRes.description || (Array.isArray(pRes.snippets) ? pRes.snippets.join(" • ") : null);
            if (candDesc) {
              const cleaned = sanitizeText(candDesc);
              if (cleaned.length >= 20) foundDesc = cleaned;
            }

            // Key Features (bullet array)
            if (Array.isArray(pRes.features) && pRes.features.length > 0) {
              foundFeatures = pRes.features.map(sanitizeText).filter((f) => f.length > 5).slice(0, 12);
            } else if (Array.isArray(pRes.highlights) && pRes.highlights.length > 0) {
              foundFeatures = pRes.highlights.map(sanitizeText).filter((f) => f.length > 5).slice(0, 12);
            }

            // Specifications table
            if (Array.isArray(pRes.specs)) {
              for (const sp of pRes.specs) {
                if (sp.name && sp.value) {
                  foundSpecs[sanitizeText(sp.name)] = sanitizeText(sp.value);
                }
              }
            } else if (typeof pRes.specs === "object" && pRes.specs) {
              for (const [k, v] of Object.entries(pRes.specs)) {
                if (v && typeof v === "string") {
                  foundSpecs[sanitizeText(k)] = sanitizeText(v);
                }
              }
            }

            // Brand
            if (pRes.brand && !foundBrand) {
              foundBrand = sanitizeText(pRes.brand);
            }

            // Sellers / Offers list
            if (Array.isArray(serpData.sellers_results)) {
              foundOffers = serpData.sellers_results.slice(0, 6).map((s: any) => ({
                seller_name: sanitizeText(s.name || s.seller || "Online Merchant"),
                price: parsePrice(s.base_price || s.total_price || s.price),
                delivery_text: s.shipping || s.delivery || s.delivery_time ? sanitizeText(s.shipping || s.delivery || s.delivery_time) : null,
                return_policy_text: s.return_policy ? sanitizeText(s.return_policy) : null,
                offer_text: s.details || s.offers ? sanitizeText(s.details || s.offers) : null,
                condition: sanitizeText(s.condition || "New"),
                url: s.link || s.direct_link || null
              })).filter((o) => o.price > 0);
            }
          }
        }
      } catch (serpErr) {
        console.warn("[enrich-product] SerpApi Google Product fetch error:", serpErr);
      }
    }

    // 3. STORE PAGE FETCH (Priority 3: SSRF-Safe, HTTPS only, 5s timeout)
    const targetUrl = dbProduct?.affiliate_url || dbProduct?.product_url || providedUrl || "";
    const needsMoreData = !foundDesc || foundFeatures.length === 0 || Object.keys(foundSpecs).length === 0;

    if (needsMoreData && targetUrl && isUrlSsrfSafe(targetUrl)) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9"
          }
        });
        clearTimeout(timeout);

        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("text/html") || contentType.includes("application/xhtml")) {
            const reader = res.body?.getReader();
            if (reader) {
              const decoder = new TextDecoder();
              let html = "";
              let bytesRead = 0;
              while (bytesRead < 500_000) {
                const { done, value } = await reader.read();
                if (done) break;
                bytesRead += value.byteLength;
                html += decoder.decode(value, { stream: true });
                if (html.includes("</head>") && (html.includes("og:description") || html.includes("application/ld+json"))) {
                  break;
                }
              }
              reader.cancel().catch(() => {});

              // Parse JSON-LD Product
              const jsonLdRegex = /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
              let match;
              while ((match = jsonLdRegex.exec(html)) !== null) {
                try {
                  const content = match[1].trim();
                  const data = JSON.parse(content);
                  const items = Array.isArray(data) ? data : (data["@graph"] ? data["@graph"] : [data]);
                  for (const item of items) {
                    if (item && (item["@type"] === "Product" || item["@type"]?.includes?.("Product"))) {
                      enrichmentSource = enrichmentSource === "none" ? "store_page_jsonld" : enrichmentSource;

                      if (!foundDesc && item.description && typeof item.description === "string") {
                        const cleaned = sanitizeText(item.description);
                        if (cleaned.length >= 20) foundDesc = cleaned;
                      }

                      if (!foundBrand && (item.brand?.name || typeof item.brand === "string")) {
                        foundBrand = sanitizeText(item.brand?.name || item.brand);
                      }

                      if (!foundSku && (item.sku || item.mpn || item.gtin)) {
                        foundSku = sanitizeText(String(item.sku || item.mpn || item.gtin));
                      }

                      if (item.itemCondition && !foundCondition) {
                        foundCondition = sanitizeText(String(item.itemCondition).replace(/https?:\/\/schema\.org\//i, ""));
                      }

                      // Additional properties -> specifications
                      if (Array.isArray(item.additionalProperty)) {
                        for (const prop of item.additionalProperty) {
                          if (prop.name && prop.value) {
                            foundSpecs[sanitizeText(prop.name)] = sanitizeText(String(prop.value));
                          }
                        }
                      }

                      // Offers extraction
                      if (item.offers && foundOffers.length === 0) {
                        const offersList = Array.isArray(item.offers) ? item.offers : [item.offers];
                        for (const off of offersList) {
                          if (off && (off.price || off.lowPrice)) {
                            foundOffers.push({
                              seller_name: sanitizeText(off.seller?.name || off.seller || dbProduct?.store_name || "Merchant"),
                              price: parsePrice(off.price || off.lowPrice),
                              delivery_text: off.shippingDetails?.shippingRate?.value ? `Delivery: ₹${off.shippingDetails.shippingRate.value}` : null,
                              return_policy_text: off.hasMerchantReturnPolicy ? "Standard merchant return policy applies" : null,
                              offer_text: off.priceValidUntil ? `Valid until ${off.priceValidUntil}` : null,
                              condition: sanitizeText(off.itemCondition ? String(off.itemCondition).replace(/https?:\/\/schema\.org\//i, "") : "New"),
                              url: off.url || targetUrl
                            });
                          }
                        }
                      }
                    }
                  }
                } catch {}
              }

              // OpenGraph Description fallback
              if (!foundDesc) {
                const ogMatch =
                  html.match(/<meta\s+[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                  html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
                if (ogMatch && ogMatch[1]) {
                  const cleaned = sanitizeText(ogMatch[1]);
                  if (cleaned.length >= 20) {
                    foundDesc = cleaned;
                    enrichmentSource = enrichmentSource === "none" ? "store_page_og" : enrichmentSource;
                  }
                }
              }
            }
          }
        }
      } catch (storeErr) {
        console.warn("[enrich-product] Store page fetch skipped/timed out:", storeErr);
      }
    }

    // 4. PERSIST TO DATABASE (only real data, never empty or fake values)
    const enrichedAt = new Date().toISOString();
    if (dbProduct?.id) {
      const updatePayload: Record<string, any> = {
        enriched_at: enrichedAt,
        enrichment_source: enrichmentSource
      };

      if (foundDesc && foundDesc !== dbProduct.about_text) {
        updatePayload.about_text = foundDesc;
        updatePayload.description = foundDesc;
      }
      if (foundFeatures.length > 0) {
        updatePayload.key_features = foundFeatures;
      }
      if (Object.keys(foundSpecs).length > 0) {
        updatePayload.specifications = foundSpecs;
      }
      if (foundBrand && !dbProduct.brand) {
        updatePayload.brand = foundBrand;
      }
      if (foundSku && !dbProduct.sku) {
        updatePayload.sku = foundSku;
      }
      if (foundCondition) {
        updatePayload.condition = foundCondition;
      }

      await supabase.from("products").update(updatePayload).eq("id", dbProduct.id);

      // Upsert into product_offers if real sellers found
      if (foundOffers.length > 0) {
        for (const off of foundOffers) {
          try {
            await supabase.from("product_offers").upsert({
              product_id: dbProduct.id,
              platform: off.seller_name,
              seller_name: off.seller_name,
              platform_slug: off.seller_name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              price: off.price,
              delivery_text: off.delivery_text,
              return_policy_text: off.return_policy_text,
              offer_text: off.offer_text,
              condition: off.condition,
              affiliate_url: off.url || dbProduct.affiliate_url || "#",
              url: off.url || dbProduct.affiliate_url || null,
              in_stock: true,
              fetched_at: enrichedAt,
              updated_at: enrichedAt
            }, { onConflict: "product_id,platform_slug" });
          } catch {}
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        enriched: Boolean(foundDesc || foundFeatures.length > 0 || Object.keys(foundSpecs).length > 0 || foundOffers.length > 0),
        source: enrichmentSource,
        credits_used: creditsUsed,
        about_text: foundDesc,
        key_features: foundFeatures,
        specifications: foundSpecs,
        brand: foundBrand,
        sku: foundSku,
        condition: foundCondition,
        offers: foundOffers,
        enriched_at: enrichedAt
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[enrich-product] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Internal error in enrich-product" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
