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
          const merchant = (item.source || item.merchant || "").toLowerCase();
          let storeSlug = "serp-shopping";
          if (merchant.includes("amazon")) storeSlug = "amazon";
          else if (merchant.includes("flipkart")) storeSlug = "flipkart";
          else if (merchant.includes("croma")) storeSlug = "croma";
          else if (merchant.includes("myntra")) storeSlug = "myntra";
          else if (merchant.includes("ajio")) storeSlug = "ajio";
          else if (merchant.includes("jiomart")) storeSlug = "jiomart";

          const rawUrl = item.link || item.product_link;
          const directUrl = extractMerchantUrl(rawUrl);

          const product = normalizeAndValidateProduct(
            {
              store_slug: storeSlug,
              external_id: item.product_id || item.docid || item.link,
              name: item.title,
              category: options.category || "Deals",
              image_url: item.thumbnail || item.serpapi_thumbnail,
              price: item.extracted_price || item.price,
              old_price: item.extracted_old_price || item.old_price,
              currency: "INR",
              rating: item.rating,
              reviews: item.reviews,
              product_url: directUrl || rawUrl,
              affiliate_url: directUrl || rawUrl,
              raw: { source: item.source || item.merchant || "Google Shopping" }
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
