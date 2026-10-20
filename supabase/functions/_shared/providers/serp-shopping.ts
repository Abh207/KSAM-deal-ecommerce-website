import { ProviderAdapter, FetchDealsOptions, AdapterResult } from "./types.ts";
import { normalizeAndValidateProduct } from "./normalizer.ts";

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
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(targetUrl.toString(), {
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (response.status === 429 || response.status >= 500) {
          if (attempt === 1) {
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          throw new Error(`SerpApi returned status ${response.status}`);
        }

        if (!response.ok) {
          throw new Error(`SerpApi request failed with status ${response.status}`);
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
              product_url: item.link || item.product_link,
              affiliate_url: item.link || item.product_link,
              raw: { source: item.source }
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
