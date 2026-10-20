import { NormalizedProduct } from "./types.ts";

export function cleanText(val: unknown): string {
  if (!val) return "";
  return String(val)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // strip control characters
    .replace(/\s+/g, " ")
    .trim();
}

export function parsePrice(val: unknown): number {
  if (typeof val === "number") return Number.isFinite(val) ? Math.max(0, val) : 0;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? Math.max(0, num) : 0;
}

export function computeDiscount(price: number, oldPrice?: number): number | undefined {
  if (!oldPrice || oldPrice <= price || price <= 0) {
    return undefined;
  }
  const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
  return discount > 0 ? discount : undefined;
}

export interface RawProductCandidate {
  store_slug: string;
  external_id?: string | number;
  name?: string;
  title?: string;
  brand?: string;
  category?: string;
  image_url?: string;
  image?: string;
  thumbnail?: string;
  additional_images?: string[];
  price?: number | string;
  old_price?: number | string;
  mrp?: number | string;
  currency?: string;
  rating?: number | string;
  reviews?: number | string;
  availability?: string;
  product_url?: string;
  link?: string;
  url?: string;
  affiliate_url?: string;
  tags?: string[];
  raw?: Record<string, unknown>;
}

export function normalizeAndValidateProduct(
  candidate: RawProductCandidate,
  options: { isSearch?: boolean } = {}
): NormalizedProduct | null {
  const name = cleanText(candidate.name || candidate.title);
  const imageUrl = cleanText(candidate.image_url || candidate.image || candidate.thumbnail);
  const productUrl = cleanText(candidate.product_url || candidate.link || candidate.url);

  // Mandatory checks: Must have a valid name, an image, and a destination product URL
  if (!name || !imageUrl || !productUrl) {
    return null;
  }

  const price = parsePrice(candidate.price);
  if (price <= 0) {
    return null;
  }

  let oldPrice = parsePrice(candidate.old_price ?? candidate.mrp);
  if (oldPrice <= price) {
    oldPrice = 0;
  }

  const discountPercent = oldPrice > 0 ? computeDiscount(price, oldPrice) : undefined;

  // In the deals feed, keep only discounts >= 10%. In search, allow all valid items.
  if (!options.isSearch && (!discountPercent || discountPercent < 10)) {
    return null;
  }

  const ratingNum = parsePrice(candidate.rating);
  const reviewsNum = parseInt(String(candidate.reviews || "0"), 10) || 0;

  const externalId = cleanText(candidate.external_id) ||
    btoa(encodeURIComponent(`${candidate.store_slug}-${productUrl}`)).slice(0, 48);

  return {
    store_slug: candidate.store_slug,
    external_id: externalId,
    name,
    brand: cleanText(candidate.brand) || undefined,
    category: cleanText(candidate.category) || undefined,
    image_url: imageUrl,
    additional_images: Array.isArray(candidate.additional_images) ? candidate.additional_images : [],
    price,
    old_price: oldPrice > 0 ? oldPrice : undefined,
    discount_percent: discountPercent,
    currency: cleanText(candidate.currency) || "INR",
    rating: ratingNum > 0 ? ratingNum : undefined,
    reviews: reviewsNum > 0 ? reviewsNum : undefined,
    availability: cleanText(candidate.availability) || "In Stock",
    product_url: productUrl,
    affiliate_url: cleanText(candidate.affiliate_url) || productUrl,
    tags: Array.isArray(candidate.tags) ? candidate.tags.map(cleanText).filter(Boolean) : [],
    raw: candidate.raw
  };
}
