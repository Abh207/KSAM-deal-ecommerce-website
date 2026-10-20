import { ProviderAdapter, FetchDealsOptions, AdapterResult } from "./types.ts";
import { normalizeAndValidateProduct } from "./normalizer.ts";

export class AmazonAdapter implements ProviderAdapter {
  slug = "amazon";
  name = "Amazon India";

  isConfigured(): boolean {
    const accessKey = Deno.env.get("AMAZON_ACCESS_KEY");
    const secretKey = Deno.env.get("AMAZON_SECRET_KEY");
    const associateTag = Deno.env.get("AMAZON_ASSOCIATE_TAG");
    return Boolean(accessKey && secretKey && associateTag);
  }

  async fetchDeals(options: FetchDealsOptions): Promise<AdapterResult> {
    if (!this.isConfigured()) {
      return {
        store_slug: this.slug,
        configured: false,
        fetched: 0,
        products: [],
        error: "Amazon credentials not configured (requires AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_ASSOCIATE_TAG)"
      };
    }

    const accessKey = Deno.env.get("AMAZON_ACCESS_KEY")!;
    const secretKey = Deno.env.get("AMAZON_SECRET_KEY")!;
    const associateTag = Deno.env.get("AMAZON_ASSOCIATE_TAG")!;
    const query = options.query || options.category || "deals";

    const payload = {
      Keywords: query,
      Resources: [
        "Images.Primary.Large",
        "ItemInfo.Title",
        "ItemInfo.ByLineInfo",
        "ItemInfo.Classifications",
        "Offers.Listings.Price",
        "Offers.Listings.SavingBasis"
      ],
      ItemCount: Math.min(options.limit || 12, 10),
      PartnerTag: associateTag,
      PartnerType: "Associates",
      Marketplace: "www.amazon.in"
    };

    // Retry with backoff on 429/5xx
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch("https://webservices.amazon.in/paapi5/searchitems", {
          method: "POST",
          headers: {
            "content-type": "application/json; charset=utf-8",
            "x-amz-target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems"
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (response.status === 429 || response.status >= 500) {
          if (attempt === 1) {
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          throw new Error(`Amazon PA-API returned status ${response.status}`);
        }

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Amazon PA-API error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        const rawItems = data?.SearchResult?.Items || [];
        const normalized = [];

        for (const item of rawItems) {
          const title = item.ItemInfo?.Title?.DisplayValue;
          const img = item.Images?.Primary?.Large?.URL;
          const detailUrl = item.DetailPageURL;
          const listing = item.Offers?.Listings?.[0];
          const price = listing?.Price?.Amount;
          const oldPrice = listing?.SavingBasis?.Amount;
          const brand = item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue;

          const product = normalizeAndValidateProduct(
            {
              store_slug: this.slug,
              external_id: item.ASIN,
              name: title,
              brand,
              category: options.category || "Deals",
              image_url: img,
              price,
              old_price: oldPrice,
              currency: "INR",
              product_url: detailUrl,
              affiliate_url: detailUrl,
              raw: { asin: item.ASIN }
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
          fetched: rawItems.length,
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
      error: lastError?.message || "Failed to fetch from Amazon"
    };
  }
}
