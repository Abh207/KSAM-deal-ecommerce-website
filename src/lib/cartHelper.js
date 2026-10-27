import audioData from "../api/audio-products.json" with { type: "json" };
import clothesData from "../api/clothesproducts.json" with { type: "json" };
import shoesData from "../api/shoes-products.json" with { type: "json" };
import shopProducts from "../react-shop/shopProducts.json" with { type: "json" };
import headerProducts from "../api/headerproducts.json" with { type: "json" };
import chairProducts from "../api/moreChairProdjn.json" with { type: "json" };
import beautyProducts from "../api/beautyProducts.json" with { type: "json" };
import watchProducts from "../api/watch-products.json" with { type: "json" };
import horizontalData from "../api/horizontalProducts.json" with { type: "json" };
import defaultProducts from "../api/products.json" with { type: "json" };

const greenBeautyProducts = [
  { id: 201, name: "Green Glow Cleanser", category: "Skin Care", price: 399, oldPrice: 599, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80" },
  { id: 202, name: "Vitamin C Serum", category: "Skin Care", price: 499, oldPrice: 799, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80" },
  { id: 203, name: "Hydrating Moisturizer", category: "Skin Care", price: 449, oldPrice: 699, image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=600&q=80" },
  { id: 204, name: "Daily Sunscreen SPF 50", category: "Skin Care", price: 549, oldPrice: 799, image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=80" },
  { id: 205, name: "Natural Face Mask", category: "Skin Care", price: 299, oldPrice: 449, image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=600&q=80" },
  { id: 206, name: "Natural Lip Tint", category: "Makeup", price: 249, oldPrice: 399, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80" },
  { id: 207, name: "Herbal Hair Shampoo", category: "Hair Care", price: 349, oldPrice: 499, image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80" },
  { id: 208, name: "Green Bloom Perfume", category: "Fragrance", price: 699, oldPrice: 999, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80" }
];

const promoProducts = [
  { id: 301, title: "MacBook Air M2", category: "Laptops", price: 999, oldPrice: 1099, image: "/macbook.jpg" },
  { id: 302, title: "Wireless Headphones", category: "Audio", price: 149, oldPrice: 249, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=90" },
  { id: 303, title: "Premium Audio", category: "Audio", price: 199, oldPrice: 299, image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=90" },
  { id: 304, title: "Professional Camera", category: "Cameras", price: 799, oldPrice: 999, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=90" }
];

export const CART_STORAGE_KEY = "cartProductLS";
export const CURRENCY_SYMBOL = "₹";
export const FREE_DELIVERY_THRESHOLD = 999;

export const DEFAULT_PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#1f2937'/><stop offset='1' stop-color='#111827'/></linearGradient></defs><rect width='200' height='200' rx='16' fill='url(#bg)'/><text x='100' y='120' font-size='64' text-anchor='middle'>🛍️</text></svg>`
  );

export function parsePrice(val) {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function formatPrice(num, symbol = CURRENCY_SYMBOL) {
  const n = typeof num === "number" ? num : parsePrice(num);
  return `${symbol}${Math.round(n).toLocaleString("en-IN")}`;
}

/**
 * Resolves any relative or root-relative image path to include the Vite BASE_URL.
 * Prevents double-prefixing and safely handles remote/data URLs and missing values.
 */
export function resolveImagePath(path) {
  if (!path || typeof path !== "string" || path.trim() === "") {
    return DEFAULT_PLACEHOLDER_IMAGE;
  }

  const trimmed = path.trim();

  // Preserved schemes
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  const rawBase =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.BASE_URL) ||
    "/KSAM-deal-ecommerce-website/";

  const normalizedBase = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
  const baseWithoutSlashes = normalizedBase.replace(/^\/+|\/+$/g, "");

  // Strip leading ./ and /
  let clean = trimmed.replace(/^\.\//, "").replace(/^\/+/, "");

  // Strip public/ if present
  clean = clean.replace(/^public\//, "");

  // If already prefixed with base URL
  if (
    clean.startsWith(baseWithoutSlashes + "/") ||
    clean === baseWithoutSlashes
  ) {
    return "/" + clean;
  }

  return `${normalizedBase}${clean}`;
}

// -------------------------------------------------------------
// Catalog Indexing for backward compatibility lookup
// -------------------------------------------------------------
const catalogMap = new Map();

function registerCatalogItem(item) {
  if (!item || item.id === undefined || item.id === null) return;
  const key = String(item.id).trim().toLowerCase();
  if (!catalogMap.has(key)) {
    catalogMap.set(key, item);
  }
}

function registerCatalogList(data) {
  if (!data) return;
  if (Array.isArray(data)) {
    data.forEach(registerCatalogItem);
  } else if (Array.isArray(data.products)) {
    data.products.forEach(registerCatalogItem);
  }
}

registerCatalogList(audioData);
registerCatalogList(clothesData);
registerCatalogList(shoesData);
registerCatalogList(shopProducts);
registerCatalogList(headerProducts);
registerCatalogList(chairProducts);
registerCatalogList(beautyProducts);
registerCatalogList(watchProducts);
registerCatalogList(horizontalData);
registerCatalogList(defaultProducts);
registerCatalogList(greenBeautyProducts);
registerCatalogList(promoProducts);

export {
  slugify,
  buildProductUid,
  findProduct,
  getRelatedProducts,
  migrateWishlistItem,
  getAllMasterProducts,
  CATEGORY_PARENT_MAP
} from "./productCatalog.js";

import {
  findProduct as catalogFindProduct,
  getRelatedProducts as catalogGetRelatedProducts,
  getAllMasterProducts as catalogGetAllMasterProducts
} from "./productCatalog.js";

export function findProductInCatalog(id, category, uid) {
  if (id === undefined || id === null) return null;
  return catalogFindProduct({ id, category, uid }) || catalogMap.get(String(id).trim().toLowerCase()) || null;
}

export function getAllCatalogProducts() {
  const master = catalogGetAllMasterProducts();
  return master.length > 0 ? master : Array.from(catalogMap.values());
}

export function findRelatedProducts(category, currentId, limit = 4) {
  const related = catalogGetRelatedProducts({ category, id: currentId }, limit);
  if (related && related.length > 0) return related;

  // Fallback to strict same-category filtering only
  const all = Array.from(catalogMap.values());
  const currentStr = currentId !== undefined && currentId !== null ? String(currentId).trim().toLowerCase() : "";
  const catStr = (category || "").trim().toLowerCase();

  return all.filter((p) => {
    if (String(p.id).trim().toLowerCase() === currentStr) return false;
    const pCat = (p.category || "").trim().toLowerCase();
    return pCat && (pCat === catStr || pCat.includes(catStr) || catStr.includes(pCat));
  }).slice(0, limit);
}

/**
 * Converts any product representation into a single standard cart item shape:
 * { id, name, price, originalPrice, oldPrice, image, category, qty, quantity, rating, store }
 */
export function normalizeCartItem(product, qty) {
  if (!product) return null;

  const rawId = product.id !== undefined && product.id !== null ? String(product.id) : "";
  const catalogItem = rawId ? findProductInCatalog(rawId) : null;

  const name =
    product.name ||
    product.title ||
    catalogItem?.name ||
    catalogItem?.title ||
    "Product";

  const price = parsePrice(
    product.price !== undefined && product.price !== null
      ? product.price
      : catalogItem?.price ?? 0
  );

  const rawOldPrice =
    product.originalPrice ??
    product.oldPrice ??
    catalogItem?.oldPrice ??
    catalogItem?.originalPrice ??
    price;

  const oldPrice = parsePrice(rawOldPrice);

  const rawImage =
    product.image ||
    product.img ||
    product.src ||
    (Array.isArray(product.images) && product.images[0]) ||
    (Array.isArray(product.heroImages) && product.heroImages[0]) ||
    catalogItem?.image ||
    catalogItem?.img ||
    catalogItem?.src ||
    (Array.isArray(catalogItem?.images) && catalogItem.images[0]) ||
    (Array.isArray(catalogItem?.heroImages) && catalogItem.heroImages[0]) ||
    "";

  const image = resolveImagePath(rawImage);

  const category =
    product.category ||
    catalogItem?.category ||
    "Deals";

  const parsedQty = Math.max(
    1,
    Number(qty || product.quantity || product.qty || 1)
  );

  return {
    id: rawId,
    name: String(name),
    price: price,
    originalPrice: oldPrice,
    oldPrice: oldPrice,
    image: image,
    category: String(category),
    quantity: parsedQty,
    qty: parsedQty,
    rating: Number(product.rating ?? catalogItem?.rating ?? 4.5),
    store: String(product.store || catalogItem?.store || "")
  };
}

/**
 * Reads, validates, and heals cart items from localStorage.
 * Automatically enriches legacy entries and repairs broken image paths.
 */
export function getNormalizedCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    let hasRepaired = false;
    const normalized = parsed
      .map((item) => {
        const norm = normalizeCartItem(item);
        if (!norm) return null;

        // Check if anything was healed
        if (
          !item.name ||
          !item.image ||
          item.image !== norm.image ||
          item.qty === undefined ||
          item.quantity === undefined
        ) {
          hasRepaired = true;
        }
        return norm;
      })
      .filter(Boolean);

    if (hasRepaired) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalized));
      } catch (e) {
        console.warn("Could not save healed cart:", e);
      }
    }

    return normalized;
  } catch (err) {
    console.error("Error reading cart from localStorage:", err);
    return [];
  }
}

/**
 * Universal Add-to-Cart function used across all pages.
 */
export function addProductToCart(product, qty = 1) {
  if (!product) return [];

  const cart = getNormalizedCart();
  const normalized = normalizeCartItem(product, qty);
  if (!normalized || !normalized.id) return cart;

  const existingIndex = cart.findIndex(
    (item) => String(item.id) === String(normalized.id)
  );

  if (existingIndex > -1) {
    const existing = cart[existingIndex];
    const newQty = (existing.quantity || existing.qty || 1) + normalized.quantity;
    cart[existingIndex] = {
      ...existing,
      ...normalized,
      quantity: newQty,
      qty: newQty
    };
  } else {
    cart.unshift(normalized);
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (e) {
      console.error("Error writing cart to localStorage:", e);
    }
  }

  return cart;
}
