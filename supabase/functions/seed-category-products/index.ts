import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function extractMerchantUrl(rawUrl?: string): string {
  if (!rawUrl) return "";
  try {
    const parsed = new URL(rawUrl);
    if (parsed.hostname.includes("google.")) {
      const targetParam = parsed.searchParams.get("url") || parsed.searchParams.get("q");
      if (targetParam && targetParam.startsWith("http")) {
        try {
          return decodeURIComponent(targetParam);
        } catch {
          return targetParam;
        }
      }
    }
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

function deriveStoreFromUrl(urlStr?: string): string {
  if (!urlStr) return "";
  try {
    const host = new URL(urlStr).hostname.replace(/^(www\.|m\.)/i, "").toLowerCase();
    if (host.includes("google.")) return "";
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
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    }
  } catch {}
  return "";
}

function parsePriceNum(val: unknown): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
}

interface SerpItem {
  title?: string;
  link?: string;
  product_link?: string;
  source?: string;
  merchant?: string;
  price?: string | number;
  extracted_price?: number;
  old_price?: string | number;
  extracted_old_price?: number;
  thumbnail?: string;
  serpapi_thumbnail?: string;
  rating?: number;
  reviews?: number;
  snippet?: string;
  brand?: string;
  product_id?: string;
  docid?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Check SerpApi API Key from Supabase secrets
    const apiKey = Deno.env.get("SERPAPI_KEY") || Deno.env.get("SERPAPI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "SERPAPI_KEY secret is not set in Supabase. Please set it using: supabase secrets set SERPAPI_KEY=your_key_here"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Connect to Supabase using service role credentials
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Supabase service credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) not configured"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Preload & ensure stores exist with is_enabled = true
    const { data: existingStores, error: storesErr } = await supabase
      .from("stores")
      .select("id, name, slug, is_enabled");

    if (storesErr) {
      console.warn("Could not query stores:", storesErr);
    }

    const storeCache = new Map<string, { id: string; name: string }>();
    for (const s of existingStores || []) {
      if (s.slug) storeCache.set(s.slug.toLowerCase(), { id: s.id, name: s.name });
      if (s.name) storeCache.set(s.name.toLowerCase(), { id: s.id, name: s.name });
    }

    // Helper to get or create store
    async function getOrCreateStore(merchantName: string, directUrl: string): Promise<{ id: string; name: string }> {
      const lowerMerchant = (merchantName || "").toLowerCase();
      const lowerUrl = (directUrl || "").toLowerCase();

      let targetSlug = "partner-store";
      let displayName = merchantName || "Partner Store";

      if (lowerMerchant.includes("amazon") || lowerUrl.includes("amazon.")) {
        targetSlug = "amazon";
        displayName = "Amazon";
      } else if (lowerMerchant.includes("flipkart") || lowerUrl.includes("flipkart.")) {
        targetSlug = "flipkart";
        displayName = "Flipkart";
      } else if (lowerMerchant.includes("myntra") || lowerUrl.includes("myntra.")) {
        targetSlug = "myntra";
        displayName = "Myntra";
      } else if (lowerMerchant.includes("ajio") || lowerUrl.includes("ajio.")) {
        targetSlug = "ajio";
        displayName = "AJIO";
      } else if (lowerMerchant.includes("croma") || lowerUrl.includes("croma.")) {
        targetSlug = "croma";
        displayName = "Croma";
      } else if (lowerMerchant.includes("meesho") || lowerUrl.includes("meesho.")) {
        targetSlug = "meesho";
        displayName = "Meesho";
      } else if (lowerMerchant.includes("tata") || lowerUrl.includes("tatacliq.")) {
        targetSlug = "tatacliq";
        displayName = "Tata CLiQ";
      } else if (merchantName) {
        targetSlug = merchantName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      }

      if (storeCache.has(targetSlug)) {
        return storeCache.get(targetSlug)!;
      }
      if (storeCache.has(displayName.toLowerCase())) {
        return storeCache.get(displayName.toLowerCase())!;
      }

      // Create new store record with is_enabled = true
      try {
        const { data: newStore, error: insertErr } = await supabase
          .from("stores")
          .insert({
            name: displayName,
            slug: targetSlug,
            is_enabled: true,
            base_url: directUrl ? new URL(directUrl).origin : null
          })
          .select("id, name, slug")
          .single();

        if (!insertErr && newStore) {
          const res = { id: newStore.id, name: newStore.name };
          storeCache.set(targetSlug, res);
          storeCache.set(displayName.toLowerCase(), res);
          return res;
        }
      } catch (e) {
        console.warn("Store creation skipped/failed:", e);
      }

      // Fallback: search any existing store
      const firstStore = Array.from(storeCache.values())[0];
      return firstStore || { id: "00000000-0000-0000-0000-000000000000", name: displayName };
    }

    // 4. Helper to query Google Shopping via SerpApi
    async function queryGoogleShopping(q: string, limit: number): Promise<SerpItem[]> {
      const url = new URL("https://serpapi.com/search.json");
      url.searchParams.set("engine", "google_shopping");
      url.searchParams.set("q", q);
      url.searchParams.set("gl", "in");
      url.searchParams.set("hl", "en");
      url.searchParams.set("api_key", apiKey);
      url.searchParams.set("num", String(Math.max(12, limit * 2)));

      const response = await fetch(url.toString());
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error || `SerpApi returned status ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data?.shopping_results) ? data.shopping_results : [];
    }

    // Helper to sanitize and validate items
    async function processAndCollectItems(
      rawItems: SerpItem[],
      category: string,
      targetCount: number
    ): Promise<any[]> {
      const valid: any[] = [];

      for (const item of rawItems) {
        if (valid.length >= targetCount) break;

        const title = (item.title || "").trim();
        if (!title || title.length < 5 || /^\d+$/.test(title)) continue;

        const price = item.extracted_price ?? parsePriceNum(item.price);
        if (!price || price <= 0) continue;

        const rawImg = item.thumbnail || item.serpapi_thumbnail || "";
        if (!rawImg || !rawImg.startsWith("http")) continue;

        const rawUrl = item.link || item.product_link || "";
        if (!rawUrl) continue;

        const directUrl = extractMerchantUrl(rawUrl);
        if (!directUrl || !directUrl.startsWith("http")) continue;

        let merchant = (item.source || item.merchant || "").trim();
        if (!merchant || merchant.toLowerCase() === "google shopping" || merchant.toLowerCase().includes("serp")) {
          merchant = deriveStoreFromUrl(directUrl || rawUrl);
        }
        if (!merchant) {
          merchant = deriveStoreFromUrl(directUrl || rawUrl) || "Partner Store";
        }

        const storeInfo = await getOrCreateStore(merchant, directUrl);

        const rawOldPrice = item.extracted_old_price ?? parsePriceNum(item.old_price);
        const oldPrice = rawOldPrice > price ? rawOldPrice : null;
        const discountPercent = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : null;

        const externalId = String(
          item.product_id ||
          item.docid ||
          btoa(directUrl.slice(0, 100)).replace(/[^a-zA-Z0-9]/g, "").slice(0, 36)
        );

        let desc = (item.snippet || "").trim();
        if (!desc && Array.isArray((item as any).extensions) && (item as any).extensions.length > 0) {
          desc = (item as any).extensions.join(" • ");
        }
        if (!desc && (item as any).features) {
          desc = Array.isArray((item as any).features) ? (item as any).features.join(" • ") : String((item as any).features);
        }
        if (desc.startsWith("Verified hot deal on") || desc.length < 20) {
          desc = "";
        }

        valid.push({
          store_id: storeInfo.id,
          store_name: storeInfo.name,
          external_id: externalId,
          name: title,
          title: title,
          category: category,
          brand: item.brand || null,
          description: desc || null,
          image_url: rawImg,
          price: price,
          old_price: oldPrice,
          discount_percent: discountPercent,
          currency: "INR",
          rating: item.rating ? Number(item.rating) : null,
          reviews: item.reviews ? Number(item.reviews) : null,
          availability: "In Stock",
          product_url: directUrl,
          affiliate_url: directUrl,
          source: storeInfo.name,
          is_active: true,
          is_featured: true,
          last_seen_at: new Date().toISOString(),
          price_updated_at: new Date().toISOString()
        });
      }

      return valid;
    }

    // 5. Fetch 6 Clothes (3 Men's + 3 Women's)
    const menClothesRaw = await queryGoogleShopping("men cotton shirts t-shirts discount sale", 6);
    const womenClothesRaw = await queryGoogleShopping("women kurti dresses tops discount sale", 6);

    const menClothes = await processAndCollectItems(menClothesRaw, "Clothes", 3);
    const womenClothes = await processAndCollectItems(womenClothesRaw, "Clothes", 3);
    const allClothes = [...menClothes, ...womenClothes];

    // If either sub-query fell short, supplement to reach 6
    if (allClothes.length < 6) {
      const extraClothesRaw = await queryGoogleShopping("branded clothing discount sale india", 6);
      const extra = await processAndCollectItems(extraClothesRaw, "Clothes", 6 - allClothes.length);
      allClothes.push(...extra);
    }

    // 6. Fetch 5 Watches
    const watchesRaw = await queryGoogleShopping("smartwatch analog watches men women discount sale", 8);
    const allWatches = await processAndCollectItems(watchesRaw, "Watches", 5);

    const totalProducts = [...allClothes, ...allWatches];

    if (totalProducts.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No valid products could be extracted from SerpApi results"
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Upsert products into public.products
    let upsertedCount = 0;
    const upsertErrors: string[] = [];

    // Try batch upsert with onConflict: "store_id,external_id"
    const { data: upsertData, error: upsertErr } = await supabase
      .from("products")
      .upsert(totalProducts, { onConflict: "store_id,external_id" })
      .select("id, title, category, price, store_id");

    if (!upsertErr && Array.isArray(upsertData)) {
      upsertedCount = upsertData.length;
    } else {
      // Fallback: per-item atomic upsert if table constraint is pending
      for (const prod of totalProducts) {
        try {
          const { data: existing } = await supabase
            .from("products")
            .select("id")
            .eq("external_id", prod.external_id)
            .maybeSingle();

          if (existing?.id) {
            await supabase.from("products").update(prod).eq("id", existing.id);
          } else {
            await supabase.from("products").insert(prod);
          }
          upsertedCount++;
        } catch (itemErr: any) {
          upsertErrors.push(itemErr?.message || String(itemErr));
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Real products successfully seeded into Supabase products table",
        counts: {
          clothes: allClothes.length,
          watches: allWatches.length,
          total_collected: totalProducts.length,
          total_upserted: upsertedCount
        },
        seeded_products: totalProducts.map((p) => ({
          title: p.title,
          category: p.category,
          price: p.price,
          old_price: p.old_price,
          discount_percent: p.discount_percent,
          store: p.source,
          product_url: p.product_url,
          image_url: p.image_url
        })),
        errors: upsertErrors.length > 0 ? upsertErrors : undefined
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || "An unexpected error occurred while seeding category products"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
