export interface NormalizedProduct {
  store_slug: string;
  external_id: string;
  name: string;
  brand?: string;
  category?: string;
  image_url: string;
  additional_images?: string[];
  price: number;
  old_price?: number;
  discount_percent?: number;
  currency: string;
  rating?: number;
  reviews?: number;
  availability?: string;
  product_url: string;
  affiliate_url?: string;
  tags?: string[];
  raw?: Record<string, unknown>;
}

export interface FetchDealsOptions {
  query?: string;
  category?: string;
  limit?: number;
  isSearch?: boolean; // If true, allows discount < 10%
}

export interface AdapterResult {
  store_slug: string;
  configured: boolean;
  fetched: number;
  products: NormalizedProduct[];
  error?: string;
}

export interface ProviderAdapter {
  slug: string;
  name: string;
  isConfigured(): boolean;
  fetchDeals(options: FetchDealsOptions): Promise<AdapterResult>;
}
