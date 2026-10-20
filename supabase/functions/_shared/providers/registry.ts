import { ProviderAdapter, FetchDealsOptions, AdapterResult } from "./types.ts";
import { AmazonAdapter } from "./amazon.ts";
import { FlipkartAdapter } from "./flipkart.ts";
import { AffiliateNetworkAdapter } from "./affiliate-network.ts";
import { SerpShoppingAdapter } from "./serp-shopping.ts";

export const ALL_ADAPTERS: ProviderAdapter[] = [
  new AmazonAdapter(),
  new FlipkartAdapter(),
  new AffiliateNetworkAdapter(),
  new SerpShoppingAdapter()
];

export function getRegisteredAdapters(): ProviderAdapter[] {
  return ALL_ADAPTERS;
}

export function getEnabledAdapters(): ProviderAdapter[] {
  return ALL_ADAPTERS.filter((adapter) => adapter.isConfigured());
}

export async function fetchFromAllAdapters(options: FetchDealsOptions): Promise<AdapterResult[]> {
  const adapters = getRegisteredAdapters();

  const settled = await Promise.allSettled(
    adapters.map(async (adapter) => {
      try {
        return await adapter.fetchDeals(options);
      } catch (err: unknown) {
        return {
          store_slug: adapter.slug,
          configured: adapter.isConfigured(),
          fetched: 0,
          products: [],
          error: err instanceof Error ? err.message : String(err)
        };
      }
    })
  );

  return settled.map((res, index) => {
    if (res.status === "fulfilled") {
      return res.value;
    }
    return {
      store_slug: adapters[index].slug,
      configured: adapters[index].isConfigured(),
      fetched: 0,
      products: [],
      error: res.reason?.message || "Unknown error"
    };
  });
}
