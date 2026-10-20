import { ProviderAdapter, FetchDealsOptions, AdapterResult } from "./types.ts";
import { normalizeAndValidateProduct } from "./normalizer.ts";

export class FlipkartAdapter implements ProviderAdapter {
  slug = "flipkart";
  name = "Flipkart";

  isConfigured(): boolean {
    const affiliateId = Deno.env.get("FLIPKART_AFFILIATE_ID");
    const affiliateToken = Deno.env.get("FLIPKART_AFFILIATE_TOKEN");
    return Boolean(affiliateId && affiliateToken);
  }

  async fetchDeals(options: FetchDealsOptions): Promise<AdapterResult> {
    if (!this.isConfigured()) {
      return {
        store_slug: this.slug,
        configured: false,
        fetched: 0,
        products: [],
        error: "Flipkart credentials not configured (requires FLIPKART_AFFILIATE_ID, FLIPKART_AFFILIATE_TOKEN)"
      };
    }

    const affiliateId = Deno.env.get("FLIPKART_AFFILIATE_ID")!;
    const affiliateToken = Deno.env.get("FLIPKART_AFFILIATE_TOKEN")!;
    const query = options.query || options.category || "discount";
    const url = `https://affiliate-api.flipkart.net/affiliate/1.0/search.json?query=${encodeURIComponent(query)}&resultCount=${options.limit || 12}`;

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
          headers: {
            "Fk-Affiliate-Id": affiliateId,
            "Fk-Affiliate-Token": affiliateToken,
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
          throw new Error(`Flipkart API returned status ${response.status}`);
        }

        if (!response.ok) {
          throw new Error(`Flipkart API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const rawProducts = data?.products || [];
        const normalized = [];

        for (const item of rawProducts) {
          const baseInfo = item.productBaseInfoV1;
          if (!baseInfo) continue;

          const title = baseInfo.title;
          const imageUrl = baseInfo.imageUrls?.["400x400"] || baseInfo.imageUrls?.["200x200"] || Object.values(baseInfo.imageUrls || {})[0];
          const productUrl = baseInfo.productUrl;
          const price = baseInfo.flipkartSellingPrice?.amount;
          const oldPrice = baseInfo.maximumRetailPrice?.amount;
          const brand = baseInfo.productBrand;

          const product = normalizeAndValidateProduct(
            {
              store_slug: this.slug,
              external_id: baseInfo.productId,
              name: title,
              brand,
              category: options.category || "Deals",
              image_url: String(imageUrl || ""),
              price,
              old_price: oldPrice,
              currency: "INR",
              availability: baseInfo.inStock ? "In Stock" : "Out of Stock",
              product_url: productUrl,
              affiliate_url: productUrl,
              raw: { productId: baseInfo.productId }
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
          fetched: rawProducts.length,
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
      error: lastError?.message || "Failed to fetch Flipkart deals"
    };
  }
}
