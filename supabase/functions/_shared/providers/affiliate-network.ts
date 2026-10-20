import { ProviderAdapter, FetchDealsOptions, AdapterResult } from "./types.ts";
import { normalizeAndValidateProduct } from "./normalizer.ts";

export class AffiliateNetworkAdapter implements ProviderAdapter {
  slug = "affiliate-network";
  name = "Affiliate Network Feed (Myntra, AJIO, Lenskart, Croma, JioMart)";

  isConfigured(): boolean {
    const apiKey = Deno.env.get("AFFILIATE_NETWORK_API_KEY");
    return Boolean(apiKey);
  }

  async fetchDeals(options: FetchDealsOptions): Promise<AdapterResult> {
    if (!this.isConfigured()) {
      return {
        store_slug: this.slug,
        configured: false,
        fetched: 0,
        products: [],
        error: "Affiliate network credentials not configured (requires AFFILIATE_NETWORK_API_KEY)"
      };
    }

    const apiKey = Deno.env.get("AFFILIATE_NETWORK_API_KEY")!;
    const baseUrl = Deno.env.get("AFFILIATE_NETWORK_BASE_URL") || "https://api.cuelinks.com/v2/feeds.json";
    const query = options.query || options.category || "deals";

    const targetUrl = new URL(baseUrl);
    targetUrl.searchParams.set("keyword", query);
    targetUrl.searchParams.set("limit", String(options.limit || 20));

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(targetUrl.toString(), {
          headers: {
            "Authorization": `Token token=${apiKey}`,
            "Accept": "application/json"
          },
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (response.status === 429 || response.status >= 500) {
          if (attempt === 1) {
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          throw new Error(`Affiliate network returned status ${response.status}`);
        }

        if (!response.ok) {
          throw new Error(`Affiliate network feed returned status ${response.status}`);
        }

        const data = await response.json();
        const feedItems = Array.isArray(data?.offers) ? data.offers : Array.isArray(data?.products) ? data.products : [];
        const normalized = [];

        for (const item of feedItems) {
          const storeName = (item.campaign_name || item.merchant || item.store || "").toLowerCase();
          let storeSlug = "affiliate-network";
          if (storeName.includes("myntra")) storeSlug = "myntra";
          else if (storeName.includes("ajio")) storeSlug = "ajio";
          else if (storeName.includes("lenskart")) storeSlug = "lenskart";
          else if (storeName.includes("croma")) storeSlug = "croma";
          else if (storeName.includes("jiomart")) storeSlug = "jiomart";

          const product = normalizeAndValidateProduct(
            {
              store_slug: storeSlug,
              external_id: item.id || item.offer_id || item.product_id,
              name: item.title || item.name,
              brand: item.brand,
              category: item.category || options.category || "Deals",
              image_url: item.image_url || item.image,
              price: item.sale_price || item.price,
              old_price: item.original_price || item.mrp || item.old_price,
              currency: "INR",
              product_url: item.url || item.product_url,
              affiliate_url: item.affiliate_url || item.url,
              raw: { offer_id: item.id }
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
          fetched: feedItems.length,
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
      error: lastError?.message || "Failed to fetch from affiliate network"
    };
  }
}
