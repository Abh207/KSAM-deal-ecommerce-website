import watchProducts from "../../api/watch-products.json";
import shopProducts from "../../react-shop/shopProducts.json";
import shoesData from "../../api/shoes-products.json";
import generalProducts from "../../api/products.json";
import beautyProducts from "../../api/beautyProducts.json";
import clothesData from "../../api/clothesproducts.json";
import chairsData from "../../api/moreChairProdjn.json";
import audioData from "../../api/audio-products.json";
import homeAppliancesProducts from "../../api/home-appliances-products.json";
import accessoriesLifestyleProducts from "../../api/accessories-lifestyle-products.json";

export { CATEGORIES_CONFIG, USD_TO_INR_RATE, mapCategoryDisplayLabel, getCategoryConfigBySlug, formatCategoryPriceINR } from "./categoryConfig.js";

/**
 * Category Data Map
 * ─────────────────────────────────────────────────────────────
 * Central mapping configuration linking each category ID to its
 * corresponding dataset as used on that category's "View All" page.
 */
export const CATEGORY_DATA_MAP = {
  watches: {
    products: watchProducts,
    bannerImage: null,
  },
  beauty: {
    products: beautyProducts,
    bannerImage: null,
  },
  gadgets: {
    products: Array.isArray(audioData.products) ? audioData.products : audioData,
    bannerImage: null,
  },
  speakers: {
    products: Array.isArray(audioData.products) ? audioData.products : audioData,
    bannerImage: null,
  },
  clothing: {
    products: Array.isArray(clothesData.products) ? clothesData.products : clothesData,
    bannerImage: null,
  },
  cloths: {
    products: Array.isArray(clothesData.products) ? clothesData.products : clothesData,
    bannerImage: null,
  },
  footwear: {
    products: Array.isArray(shoesData.products) ? shoesData.products : shoesData,
    bannerImage: null,
  },
  shoes: {
    products: Array.isArray(shoesData.products) ? shoesData.products : shoesData,
    bannerImage: null,
  },
  electronics: {
    products: shopProducts,
    bannerImage: null,
  },
  chairs: {
    products: chairsData,
    bannerImage: null,
  },
  fashion: {
    products: generalProducts,
    bannerImage: null,
  },
  "home-appliances": {
    products: homeAppliancesProducts,
    bannerImage: "images/categories/home-appliances-hero.webp",
  },
  "accessories-lifestyle": {
    products: accessoriesLifestyleProducts,
    bannerImage: "images/categories/accessories-lifestyle-hero.webp",
  },
};

/**
 * Resolves an image path to work with Vite base path (including GitHub Pages),
 * supporting leading slashes, no leading slashes, and external HTTP/HTTPS URLs.
 */
export function resolveProductImage(imagePath) {
  if (!imagePath || typeof imagePath !== "string") return "";
  const trimmed = imagePath.trim();
  if (!trimmed) return "";

  // External URLs (Unsplash, etc.)
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Local assets: strip leading slash and prepend Vite BASE_URL
  const cleanPath = trimmed.replace(/^\/+/, "");
  const baseUrl = import.meta.env.BASE_URL || "/";
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${cleanPath}`;
}

/**
 * Retrieves the products array for a given category ID (case-insensitive).
 */
export function getCategoryProducts(catId) {
  if (!catId) return [];
  const key = String(catId).toLowerCase().trim();
  const entry = CATEGORY_DATA_MAP[key];
  if (!entry || !entry.products) return [];
  return Array.isArray(entry.products) ? entry.products : [];
}

/**
 * Retrieves the optional banner image override for a given category ID.
 */
export function getCategoryBannerOverride(catId) {
  if (!catId) return null;
  const key = String(catId).toLowerCase().trim();
  const entry = CATEGORY_DATA_MAP[key];
  return entry?.bannerImage || null;
}
