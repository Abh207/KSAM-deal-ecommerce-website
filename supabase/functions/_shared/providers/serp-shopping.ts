import { ProviderAdapter, FetchDealsOptions, AdapterResult } from "./types.ts";
import { normalizeAndValidateProduct } from "./normalizer.ts";

function extractMerchantUrl(rawUrl?: string): string {
  if (!rawUrl) return "";
  try {
    const parsed = new URL(rawUrl);
    // If it's a google redirect (e.g. google.com/url?url=https://merchant.com or ?q=https://...)
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
    if (host.includes("amazon.")) return "Amazon India";
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

export class SerpShoppingAdapter implements ProviderAdapter {
  slug = "serp-shopping";
  name = "Licensed Shopping Data (Google Shopping India)";

  isConfigured(): boolean {
    const apiKey = Deno.env.get("SERPAPI_KEY");
    return Boolean(apiKey);
  }

  async fetchDeals(options: FetchDealsOptions): Promise<AdapterResult> {
    if (!this.isConfigured()) {
      return {
        store_slug: this.slug,
        configured: false,
        fetched: 0,
        products: [],
        error: "SERPAPI_KEY not configured"
      };
    }

    const apiKey = Deno.env.get("SERPAPI_KEY")!;
    const query = options.query || (options.category ? `${options.category} discount deals` : "deals of the day");

    const targetUrl = new URL("https://serpapi.com/search.json");
    targetUrl.searchParams.set("engine", "google_shopping");
    targetUrl.searchParams.set("q", query);
    targetUrl.searchParams.set("gl", "in");
    targetUrl.searchParams.set("hl", "en");
    targetUrl.searchParams.set("api_key", apiKey);
    targetUrl.searchParams.set("num", String(options.limit || 20));



    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6500);

        const response = await fetch(targetUrl.toString(), {
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (response.status === 429) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData?.error || "External search quota exceeded or rate limited (HTTP 429)";
          return {
            store_slug: this.slug,
            configured: true,
            fetched: 0,
            products: [],
            error: errMsg
          };
        }

        if (response.status === 401 || response.status === 403) {
          const errData = await response.json().catch(() => ({}));
          return {
            store_slug: this.slug,
            configured: false,
            fetched: 0,
            products: [],
            error: errData?.error || "Invalid or unauthorized SERPAPI_KEY"
          };
        }

        if (response.status >= 500) {
          if (attempt === 1) {
            await new Promise((r) => setTimeout(r, 400));
            continue;
          }
          throw new Error(`External search provider temporarily unavailable (HTTP ${response.status})`);
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData?.error || `External search failed with HTTP ${response.status}`;
          return {
            store_slug: this.slug,
            configured: true,
            fetched: 0,
            products: [],
            error: errMsg
          };
        }



        const data = await response.json();
        const shoppingResults = Array.isArray(data?.shopping_results) ? data.shopping_results : [];
        const normalized = [];

        for (const item of shoppingResults) {
          const rawMerchant = String(item.source || item.merchant || "").trim();
          const rawUrl = item.link || item.product_link;
          const directUrl = extractMerchantUrl(rawUrl);

          let merchantName = rawMerchant;
          if (!merchantName || merchantName.toLowerCase() === "google shopping" || merchantName.toLowerCase().includes("serp")) {
            merchantName = deriveStoreFromUrl(directUrl || rawUrl);
          }

          const storeSlug = merchantName
            ? merchantName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")
            : "partner-store";

          let description = item.snippet || "";
          if (!description && Array.isArray(item.extensions) && item.extensions.length > 0) {
            description = item.extensions.join(" • ");
          }
          if (!description && item.features) {
            description = Array.isArray(item.features) ? item.features.join(" • ") : String(item.features);
          }

          const product = normalizeAndValidateProduct(
            {
              store_slug: storeSlug,
              store_name: merchantName || undefined,
              external_id: item.product_id || item.docid || item.link,
              name: item.title,
              category: options.category || "Deals",
              description: description || undefined,
              image_url: item.thumbnail || item.serpapi_thumbnail,
              price: item.extracted_price || item.price,
              old_price: item.extracted_old_price || item.old_price,
              currency: "INR",
              rating: item.rating,
              reviews: item.reviews,
              product_url: directUrl || rawUrl,
              affiliate_url: directUrl || rawUrl,
              raw: {
                source: merchantName,
                snippet: item.snippet,
                extensions: item.extensions,
                serpapi_product_id: item.product_id,
                immersive_token: item.immersive_token
              }
            },
            { isSearch: options.isSearch }
          );

          if (product) {
            normalized.push(product);
          }
        }

        return {
          store_slug: this.slug,
          configured: true,
          fetched: shoppingResults.length,
          products: normalized
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt === 1) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }

    return {
      store_slug: this.slug,
      configured: true,
      fetched: 0,
      products: [],
      error: lastError?.message || "Failed to fetch from SerpShopping"
    };
  }
}
