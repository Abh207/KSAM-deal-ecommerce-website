import { supabase, isSupabaseConfigured } from "../../lib/supabase.js";
import { INLINE_PRODUCTS } from "../components/HeroHead/useMarquee.js";

export function formatTimeAgo(dateString) {
  if (!dateString) return "Price updated recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMins < 5) return "Price updated just now";
  if (diffMins < 60) return `Price updated ${diffMins}m ago`;
  if (diffHours < 24) return `Price updated ${diffHours}h ago`;
  if (diffDays === 1) return "Price updated yesterday";
  return `Price updated ${diffDays}d ago`;
}

export function isDemoProduct(item) {
  if (!item) return false;
  const idStr = String(item.id || "");
  const uidStr = String(item.uid || "");
  const titleStr = String(item.name || item.title || "");
  return (
    idStr.startsWith("a1000000-") ||
    idStr.startsWith("demo-") ||
    idStr.startsWith("p-") ||
    uidStr.startsWith("audio_sony_wh1000xm5") ||
    uidStr.startsWith("shoes_nike_air_max_270") ||
    uidStr.startsWith("laptops_macbook_air_m2") ||
    uidStr.startsWith("mobiles_samsung_s24_ultra") ||
    titleStr.includes("Sony WH-1000XM5") ||
    titleStr.includes("Nike Air Max 270")
  );
}

export function deriveCategoryFromName(name = "") {
  const text = (name || "").toLowerCase();
  if (text.includes("watch") || text.includes("timepiece") || text.includes("chronograph") || text.includes("smartwatch")) return "Watches";
  if (text.includes("shirt") || text.includes("t-shirt") || text.includes("pant") || text.includes("trouser") || text.includes("jeans") || text.includes("dress") || text.includes("kurti") || text.includes("saree") || text.includes("suit") || text.includes("cloth") || text.includes("hoodie") || text.includes("jacket") || text.includes("top") || text.includes("kurta")) return "Clothes";
  if (text.includes("phone") || text.includes("galaxy") || text.includes("iphone") || text.includes("mobile")) return "Mobiles";
  if (text.includes("laptop") || text.includes("macbook") || text.includes("tuf")) return "Laptops";
  if (text.includes("headphone") || text.includes("airpod") || text.includes("audio") || text.includes("earbud")) return "Audio";
  if (text.includes("tv") || text.includes("television") || text.includes("oled")) return "Electronics";
  if (text.includes("shoe") || text.includes("air max") || text.includes("sneaker")) return "Shoes";
  if (text.includes("mouse") || text.includes("keyboard") || text.includes("playstation") || text.includes("ps5") || text.includes("gaming")) return "Gaming";
  if (text.includes("fashion") || text.includes("apparel")) return "Fashion";
  if (text.includes("chair") || text.includes("sofa") || text.includes("vacuum") || text.includes("home")) return "Home";
  if (text.includes("cream") || text.includes("beauty") || text.includes("lotion") || text.includes("serum")) return "Beauty";
  return "Electronics";
}

export function getCategoryFallbackImage(category = "", name = "") {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const text = `${category || ""} ${name || ""}`.toLowerCase();

  if (
    text.includes("headphone") ||
    text.includes("earphone") ||
    text.includes("earbud") ||
    text.includes("airpod") ||
    text.includes("audio") ||
    text.includes("tws") ||
    text.includes("sony wh")
  ) {
    return `${normalizedBase}headphone.png`;
  }

  if (
    text.includes("jacket") ||
    text.includes("cloth") ||
    text.includes("shirt") ||
    text.includes("t-shirt") ||
    text.includes("hoodie") ||
    text.includes("denim") ||
    text.includes("apparel")
  ) {
    return `${normalizedBase}products/clothes/cloth1.png`;
  }

  if (
    text.includes("shoe") ||
    text.includes("sneaker") ||
    text.includes("footwear") ||
    text.includes("air max")
  ) {
    return `${normalizedBase}products/shoes/shoe1.png`;
  }

  if (
    text.includes("phone") ||
    text.includes("mobile") ||
    text.includes("iphone") ||
    text.includes("galaxy") ||
    text.includes("oneplus") ||
    text.includes("redmi")
  ) {
    return `${normalizedBase}smartPhone.png`;
  }

  if (
    text.includes("laptop") ||
    text.includes("macbook") ||
    text.includes("dell") ||
    text.includes("thinkpad") ||
    text.includes("asus") ||
    text.includes("tuf") ||
    text.includes("hp")
  ) {
    return `${normalizedBase}laptop-image.png`;
  }

  if (text.includes("watch") || text.includes("smartwatch") || text.includes("band")) {
    return `${normalizedBase}watch.png`;
  }

  if (text.includes("tv") || text.includes("television") || text.includes("monitor") || text.includes("display")) {
    return `${normalizedBase}tv.png`;
  }

  if (text.includes("speaker") || text.includes("soundbar") || text.includes("jbl")) {
    return `${normalizedBase}speakers.png`;
  }

  if (
    text.includes("mouse") ||
    text.includes("keyboard") ||
    text.includes("playstation") ||
    text.includes("ps5") ||
    text.includes("gaming")
  ) {
    return `${normalizedBase}mouse.png`;
  }

  if (
    text.includes("chair") ||
    text.includes("sofa") ||
    text.includes("furniture") ||
    text.includes("table") ||
    text.includes("home")
  ) {
    return `${normalizedBase}3dChair.png`;
  }

  if (text.includes("vacuum") || text.includes("heater") || text.includes("geyser") || text.includes("appliance")) {
    return `${normalizedBase}Heater.png`;
  }

  return `${normalizedBase}electronics-items.png`;
}

/**
 * Blocklist of dangerous URL schemes to prevent script execution or local file access.
 */
const BLOCKED_SCHEMES = [
  "javascript:",
  "data:",
  "vbscript:",
  "file:",
  "blob:",
  "about:",
  "chrome:"
];

/**
 * Validates external affiliate URLs.
 * Requires strict HTTPS protocol and blocks dangerous schemes.
 * Permits all legitimate HTTPS partner stores without restrictive hostname locks.
 */
export function isSafeAffiliateUrl(urlStr) {
  if (!urlStr || typeof urlStr !== "string") return false;
  const trimmed = urlStr.trim();
  if (!trimmed || trimmed === "#") return false;

  const lower = trimmed.toLowerCase();
  for (const scheme of BLOCKED_SCHEMES) {
    if (lower.startsWith(scheme)) return false;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return false;
    if (!parsed.hostname || !parsed.hostname.includes(".")) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Session storage helpers for seamless deal persistence across page views,
 * preventing 'Deal Not Found' for live search results (ext- IDs).
 */
export function getDealFromSession(id) {
  if (typeof window === "undefined" || !id) return null;
  try {
    const cleanId = String(id).trim();
    const cleanNoExt = cleanId.replace(/^ext-/, "");
    const keysToTry = [
      `ksam_deal_${cleanId}`,
      `ksam_deal_ext-${cleanNoExt}`,
      `ksam_deal_${cleanNoExt}`,
      "ksam_last_clicked_deal"
    ];
    for (const key of keysToTry) {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          (String(parsed.id) === cleanId ||
            String(parsed.external_id) === cleanId ||
            String(parsed.external_id) === cleanNoExt ||
            String(parsed.id) === cleanNoExt ||
            key === `ksam_deal_${cleanId}`)
        ) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn("Failed to read deal from sessionStorage:", e);
  }
  return null;
}

export function saveDealToSession(deal) {
  if (typeof window === "undefined" || !deal) return;
  try {
    const id = deal.id || deal.external_id;
    if (id) {
      const cleanId = String(id).trim();
      sessionStorage.setItem(`ksam_deal_${cleanId}`, JSON.stringify(deal));
      if (cleanId.startsWith("ext-")) {
        sessionStorage.setItem(`ksam_deal_${cleanId.replace(/^ext-/, "")}`, JSON.stringify(deal));
      }
    }
    sessionStorage.setItem("ksam_last_clicked_deal", JSON.stringify(deal));
  } catch (e) {
    console.warn("Failed to save deal to sessionStorage:", e);
  }
}

/**
 * Invokes the secure Edge Function to upsert an external live search deal
 * into the Supabase 'products' table using server-side service_role key.
 * Never blocks client navigation.
 */
export async function upsertExternalDeal(product) {
  if (!product) return null;
  try {
    const payload = {
      action: "upsert",
      product: {
        id: product.id,
        external_id: product.external_id || String(product.id || "").replace(/^ext-/, ""),
        name: product.name || product.title,
        title: product.title || product.name,
        brand: product.brand || null,
        category: product.category || "General",
        description: product.description || null,
        image_url: product.image || product.image_url || null,
        price: product.price ? Number(product.price) : 0,
        old_price: (product.old_price || product.oldPrice) ? Number(product.old_price || product.oldPrice) : null,
        discount: product.discount ? Number(product.discount) : 0,
        rating: product.rating ? Number(product.rating) : 0,
        reviews: product.reviews ? Number(product.reviews) : 0,
        availability: product.availability || "In Stock",
        store: product.store || product.platform || product.source || "Partner Store",
        product_url: product.product_url || product.url || null,
        affiliate_url: product.affiliate_url || product.url || product.product_url || null
      }
    };

    // Try search-products edge function with action: 'upsert'
    const res = await supabase.functions.invoke("search-products", {
      body: payload
    });

    if (res.error) {
      // Fallback: try dedicated upsert-deal function if deployed
      await supabase.functions.invoke("upsert-deal", {
        body: { product: payload.product }
      });
    }
    return res.data;
  } catch (err) {
    // Non-blocking background sync
    return null;
  }
}

/**
 * Normalize and pick the BEST offer for a product.
 * Selects in-stock offers with discount > 0, sorts by highest discount (or lowest price),
 * and computes discount from mrp and price if not stored.
 */
export function normalizeDeal(product) {
  if (!product) return null;

  const rawOffers = Array.isArray(product.product_offers) ? product.product_offers : [];

  // Filter in-stock offers and compute discount
  const validOffers = rawOffers
    .filter((off) => off && (off.in_stock === undefined || off.in_stock === true))
    .map((off) => {
      const p = Number(off.price ?? 0);
      const m = Number(off.mrp ?? off.old_price ?? p);
      const computedDiscount =
        off.discount_percent ?? (m > p && m > 0 ? Math.round(((m - p) / m) * 100) : 0);
      return {
        id: off.id,
        platform: off.platform || "Amazon",
        platformSlug: (off.platform_slug || off.platform || "amazon").toLowerCase(),
        price: p,
        mrp: m > p ? m : p,
        discountPercent: Number(computedDiscount || 0),
        affiliateUrl: off.affiliate_url || "#",
        inStock: off.in_stock !== false,
        updatedAt: off.updated_at
      };
    })
    .filter((off) => off.discountPercent > 0);

  // Pick BEST offer: highest discount percentage, or lowest price if discount equal
  let bestOffer = null;
  if (validOffers.length > 0) {
    const sortedOffers = [...validOffers].sort((a, b) => {
      if (b.discountPercent !== a.discountPercent) {
        return b.discountPercent - a.discountPercent;
      }
      return a.price - b.price;
    });
    bestOffer = sortedOffers[0];
  }

  // Fallback price and discount if no multi-offers are present
  const basePrice = bestOffer
    ? bestOffer.price
    : Number(product.price ?? product.currentPrice ?? product.current_price ?? 0);

  const baseOldPrice = bestOffer
    ? bestOffer.mrp
    : Number(product.old_price ?? product.oldPrice ?? product.mrp ?? basePrice);

  const calculatedDiscount = bestOffer
    ? bestOffer.discountPercent
    : Number(
        product.discount_percent ??
        product.discountPercent ??
        product.discount ??
        (baseOldPrice > basePrice && baseOldPrice > 0
          ? Math.round(((baseOldPrice - basePrice) / baseOldPrice) * 100)
          : 0)
      );

  // Image resolution
  const rawImage = product.image_url ?? product.imageUrl ?? product.image ?? "";
  let resolvedImage = rawImage;
  if (!rawImage || rawImage.includes("placehold.co")) {
    resolvedImage = getCategoryFallbackImage(
      product.category || product.categories?.name,
      product.name || product.title
    );
  } else if (!rawImage.startsWith("http://") && !rawImage.startsWith("https://") && !rawImage.startsWith("data:")) {
    const base = import.meta.env.BASE_URL || "/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const clean = rawImage.replace(/^\/+/, "");
    resolvedImage = rawImage.startsWith(normalizedBase) ? rawImage : `${normalizedBase}${clean}`;
  }

  const storeName =
    bestOffer?.platform ||
    product.store ||
    product.stores?.name ||
    product.platform ||
    product.source ||
    product.brand ||
    product.retailer ||
    (product.external_id ? "Partner Store" : "KSAM Deal");
  const categoryName = product.category || deriveCategoryFromName(product.name || product.title);

  const affiliateUrl =
    bestOffer?.affiliateUrl ||
    product.affiliate_url ||
    product.affiliateUrl ||
    product.product_url ||
    "#";

  const description =
    product.description ||
    product.summary ||
    `Verified hot deal on ${product.name || product.title || "this product"}. Aggregated from official Indian retail platforms with verified price drops, genuine merchant warranty, and fast direct shipping.`;

  const keyFeatures =
    Array.isArray(product.key_features) && product.key_features.length > 0
      ? product.key_features
      : Array.isArray(product.highlights) && product.highlights.length > 0
      ? product.highlights
      : [
          "100% Genuine product verified by merchant",
          "Live price tracking across major Indian retailers",
          "Official brand warranty and verified return policy",
          "Fast dispatch and secure checkout"
        ];

  const specs = typeof product.specs === "object" && product.specs !== null ? product.specs : {};

  return {
    id: product.id,
    uid: product.uid || `deal_${product.id}`,
    name: product.name || product.title || "Untitled Deal",
    title: product.title || product.name || "Untitled Deal",
    brand: product.brand || storeName,
    category: categoryName,
    price: basePrice,
    oldPrice: baseOldPrice > basePrice ? baseOldPrice : basePrice,
    discount: Number(calculatedDiscount || 0),
    rating: Number(product.rating || 4.5),
    reviews: Number(product.review_count || product.reviews || 120),
    stock: product.stock !== undefined && product.stock !== null ? Number(product.stock) : null,
    availability: product.availability || "In Stock",
    image: resolvedImage,
    images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [resolvedImage],
    platform: storeName,
    store: storeName,
    affiliateUrl,
    url: affiliateUrl,
    description,
    keyFeatures,
    specs,
    offers: validOffers.length > 0 ? validOffers : [
      {
        id: `off-${product.id}`,
        platform: storeName,
        platformSlug: storeName.toLowerCase(),
        price: basePrice,
        mrp: baseOldPrice,
        discountPercent: calculatedDiscount,
        affiliateUrl,
        inStock: true
      }
    ],
    bestOffer: bestOffer || {
      platform: storeName,
      price: basePrice,
      mrp: baseOldPrice,
      discountPercent: calculatedDiscount,
      affiliateUrl,
      inStock: true
    },
    priceUpdatedAt: product.updated_at || product.price_updated_at || product.created_at,
    priceUpdatedLabel: formatTimeAgo(product.updated_at || product.price_updated_at || product.created_at)
  };
}

export const normalizeDatabaseProduct = normalizeDeal;

// LocalStorage caching with 10-minute TTL (stale-while-revalidate)
const DEALS_CACHE_KEY = "ksam_deals_supabase_cache_v2";
const DEALS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCachedDealsList() {
  try {
    const raw = localStorage.getItem(DEALS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) {
      const isFresh = Date.now() - (parsed.timestamp || 0) < DEALS_CACHE_TTL_MS;
      return { data: parsed.data, isFresh };
    }
  } catch {}
  return null;
}

function setCachedDealsList(data) {
  try {
    localStorage.setItem(
      DEALS_CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch {}
}

// SessionStorage navigation state preservation key
export const DEALS_NAV_STATE_KEY = "ksam_deals_state";
const DEALS_NAV_STATE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function getBaseUrl() {
  const b = (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "/";
  return b.endsWith("/") ? b : `${b}/`;
}

// Search Page navigation state preservation (key: ksam_search_state, 30 min TTL)
export const SEARCH_NAV_STATE_KEY = "ksam_search_state";
export const SEARCH_NAV_STATE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function saveSearchNavigationState(partial = {}) {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return;
    const existing = getSearchNavigationState() || {};
    const payload = {
      ...existing,
      ...partial,
      scrollY: typeof window !== "undefined" ? (partial.scrollY !== undefined ? partial.scrollY : window.scrollY) : 0,
      timestamp: Date.now()
    };
    window.sessionStorage.setItem(SEARCH_NAV_STATE_KEY, JSON.stringify(payload));
  } catch {}
}

export function getSearchNavigationState() {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return null;
    const raw = window.sessionStorage.getItem(SEARCH_NAV_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      if (Date.now() - (parsed.timestamp || 0) < SEARCH_NAV_STATE_TTL_MS) {
        return parsed;
      }
      window.sessionStorage.removeItem(SEARCH_NAV_STATE_KEY);
    }
  } catch {}
  return null;
}

export function clearSearchNavigationState() {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return;
    window.sessionStorage.removeItem(SEARCH_NAV_STATE_KEY);
  } catch {}
}

export function saveDealsNavigationState(partial = {}) {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return;
    const existing = getDealsNavigationState() || {};
    const payload = {
      ...existing,
      ...partial,
      scrollY: typeof window !== "undefined" ? (partial.scrollY !== undefined ? partial.scrollY : window.scrollY) : 0,
      timestamp: Date.now()
    };
    window.sessionStorage.setItem(DEALS_NAV_STATE_KEY, JSON.stringify(payload));
  } catch {}
}

export function getDealsNavigationState() {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return null;
    const raw = window.sessionStorage.getItem(DEALS_NAV_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      if (Date.now() - (parsed.timestamp || 0) < DEALS_NAV_STATE_TTL_MS) {
        return parsed;
      }
      window.sessionStorage.removeItem(DEALS_NAV_STATE_KEY);
    }
  } catch {}
  return null;
}

export function clearDealsNavigationState() {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.removeItem(DEALS_NAV_STATE_KEY);
    }
  } catch {}
}

export function getInstantCachedDeals(options = {}) {
  const cached = getCachedDealsList();
  if (!cached || !Array.isArray(cached.data) || cached.data.length === 0) {
    return null;
  }
  const {
    category = "All",
    store = "All",
    sort = "biggest_discount",
    search = "",
    loadedCount = 12
  } = options;

  let allDeals = cached.data
    .map(normalizeDeal)
    .filter((d) => d && d.name && !isDemoProduct(d) && (d.price > 0 || d.discount > 0));

  if (category && category !== "All") {
    const targetCat = category.toLowerCase().trim();
    allDeals = allDeals.filter((p) => {
      const c = (p.category || "").toLowerCase();
      const n = (p.name || "").toLowerCase();
      if (targetCat === "clothes") {
        return c.includes("cloth") || c.includes("fashion") || c.includes("apparel") ||
          n.includes("shirt") || n.includes("t-shirt") || n.includes("dress") || n.includes("kurti") ||
          n.includes("jeans") || n.includes("pant") || n.includes("trouser") || n.includes("cloth");
      }
      if (targetCat === "watches") {
        return c.includes("watch") || n.includes("watch") || n.includes("chronograph") || n.includes("smartwatch");
      }
      return c.includes(targetCat) || targetCat.includes(c) || n.includes(targetCat);
    });
  }

  if (store && store !== "All") {
    const targetStore = store.toLowerCase().trim();
    allDeals = allDeals.filter((p) => {
      const best = (p.platform || p.store || "").toLowerCase();
      const anyOffer = (p.offers || []).some((o) => (o.platform || "").toLowerCase().includes(targetStore));
      return best.includes(targetStore) || anyOffer;
    });
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    allDeals = allDeals.filter((p) => {
      return (
        p.name?.toLowerCase().includes(q) ||
        p.store?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    });
  }

  switch (sort) {
    case "price_low_high":
      allDeals.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case "price_high_low":
      allDeals.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case "newest":
      allDeals.sort((a, b) => new Date(b.priceUpdatedAt || 0) - new Date(a.priceUpdatedAt || 0));
      break;
    case "biggest_discount":
    default:
      allDeals.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      break;
  }

  const count = Math.max(12, loadedCount || 12);
  return {
    products: allDeals.slice(0, count),
    hasMore: count < allDeals.length,
    total: allDeals.length
  };
}

const PRODUCTS_SELECT_COLUMNS = `
  id,
  name,
  title,
  brand,
  category,
  description,
  image_url,
  additional_images,
  rating,
  reviews,
  price,
  old_price,
  discount,
  discount_percent,
  currency,
  affiliate_url,
  product_url,
  availability,
  is_active,
  is_featured,
  tags,
  created_at,
  updated_at
`;

let hasWarnedDealsQuery = false;
let hasWarnedSingleQuery = false;
let inFlightDealsPromise = null;

// Set to true once the remote Supabase database has executed migration 008_create_product_offers.sql
const SUPABASE_PRODUCT_OFFERS_ENABLED = false;

/**
 * Executes a two-step query (products then product_offers separately)
 * avoiding schema cache relationship requirements.
 */
async function fetchProductsAndOffersSeparately() {
  try {
    let { data: prods, error: prodErr } = await supabase
      .from("products")
      .select(PRODUCTS_SELECT_COLUMNS)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (prodErr || !Array.isArray(prods) || prods.length === 0) {
      // If no active rows, fetch without filter
      const { data: allProds, error: allErr } = await supabase
        .from("products")
        .select(PRODUCTS_SELECT_COLUMNS)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!allErr && Array.isArray(allProds) && allProds.length > 0) {
        prods = allProds;
        prodErr = null;
      }
    }

    if (prodErr || !Array.isArray(prods) || prods.length === 0) {
      return null;
    }

    const ids = prods.map((p) => p.id).filter(Boolean);
    let offersMap = {};

    if (SUPABASE_PRODUCT_OFFERS_ENABLED && ids.length > 0) {
      try {
        const { data: offers, error: offersErr } = await supabase
          .from("product_offers")
          .select(`
            id,
            product_id,
            platform,
            platform_slug,
            price,
            mrp,
            discount_percent,
            affiliate_url,
            in_stock,
            updated_at
          `)
          .in("product_id", ids)
          .eq("in_stock", true);

        if (!offersErr && Array.isArray(offers)) {
          offers.forEach((o) => {
            if (!offersMap[o.product_id]) {
              offersMap[o.product_id] = [];
            }
            offersMap[o.product_id].push(o);
          });
        }
      } catch {
        // Safe if product_offers table doesn't exist
      }
    }

    return prods.map((p) => ({
      ...p,
      product_offers: offersMap[p.id] || []
    }));
  } catch {
    return null;
  }
}

/**
 * Fetch raw deals data from Supabase (or fallback/cache).
 * Debounced / singleton promise so concurrent calls reuse the same network request.
 */
async function fetchRawDealsList() {
  if (inFlightDealsPromise) {
    return inFlightDealsPromise;
  }

  inFlightDealsPromise = (async () => {
    let rawList = [];
    let isOffline = false;
    const cached = getCachedDealsList();

    if (cached && cached.isFresh) {
      return { rawList: cached.data, isOffline: false };
    }

    if (cached?.data) {
      rawList = cached.data;
    }

    try {
      const fetchPromise = fetchProductsAndOffersSeparately();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase request timed out after 5s")), 5000)
      );

      const separateData = await Promise.race([fetchPromise, timeoutPromise]);

      if (Array.isArray(separateData) && separateData.length > 0) {
        rawList = separateData;
        setCachedDealsList(separateData);
        isOffline = false;
      } else if (cached?.data && cached.data.length > 0) {
        rawList = cached.data;
        isOffline = true;
      }
    } catch (err) {
      if (cached?.data && cached.data.length > 0) {
        rawList = cached.data;
        isOffline = true;
      }
    }

    if (!rawList || rawList.length === 0) {
      rawList = [];
      isOffline = false;
    } else {
      // Exclude hardcoded/seeded demo products
      rawList = rawList.filter((item) => !isDemoProduct(item));
    }

    return { rawList, isOffline };
  })().finally(() => {
    inFlightDealsPromise = null;
  });

  return inFlightDealsPromise;
}

/**
 * Fetch aggregated multi-platform deals from Supabase products with server-side pagination.
 * Uses .range(from, to) and count: "exact" for seamless infinite scrolling.
 * Falls back gracefully to cached deals if offline.
 */
export async function getDeals(options = {}) {
  const {
    category = "All",
    store = "All",
    sort = "biggest_discount",
    search = "",
    page = 1,
    pageSize = 12
  } = options;

  const validPage = Math.max(1, parseInt(page, 10) || 1);
  const validPageSize = Math.max(1, parseInt(pageSize, 10) || 12);
  const from = (validPage - 1) * validPageSize;
  const to = from + validPageSize - 1;

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from("products")
        .select(PRODUCTS_SELECT_COLUMNS, { count: "exact" })
        .eq("is_active", true);

      // 1. Filter by category
      if (category && category !== "All") {
        const targetCat = category.toLowerCase().trim();
        if (targetCat === "clothes") {
          query = query.or("category.ilike.%clothes%,category.ilike.%fashion%,category.ilike.%apparel%,name.ilike.%shirt%,name.ilike.%t-shirt%,name.ilike.%kurti%,name.ilike.%dress%,name.ilike.%pant%,name.ilike.%trouser%,title.ilike.%shirt%,title.ilike.%t-shirt%");
        } else if (targetCat === "watches") {
          query = query.or("category.ilike.%watch%,name.ilike.%watch%,title.ilike.%watch%,name.ilike.%chronograph%,name.ilike.%smartwatch%");
        } else {
          query = query.or(`category.ilike.%${targetCat}%,name.ilike.%${targetCat}%,title.ilike.%${targetCat}%`);
        }
      }

      // 2. Filter by store
      if (store && store !== "All") {
        const targetStore = store.toLowerCase().trim();
        query = query.or(`source.ilike.%${targetStore}%,raw->>source.ilike.%${targetStore}%`);
      }

      // 3. Filter by search query
      if (search && search.trim()) {
        const q = search.trim();
        query = query.or(`name.ilike.%${q}%,title.ilike.%${q}%,brand.ilike.%${q}%,category.ilike.%${q}%`);
      }

      // 4. Server-side sort
      switch (sort) {
        case "price_low_high":
          query = query.order("price", { ascending: true, nullsFirst: false });
          break;
        case "price_high_low":
          query = query.order("price", { ascending: false, nullsFirst: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "biggest_discount":
        default:
          query = query
            .order("discount_percent", { ascending: false, nullsLast: true })
            .order("created_at", { ascending: false });
          break;
      }

      // 5. Server-side pagination range
      query = query.range(from, to);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase deals range query timed out")), 6000)
      );

      const { data, count, error } = await Promise.race([query, timeoutPromise]);

      if (!error && Array.isArray(data)) {
        const normalized = data
          .map(normalizeDeal)
          .filter((d) => d && d.name && !isDemoProduct(d));

        const totalCount = count !== null && count !== undefined ? count : normalized.length;
        const hasMore = to + 1 < totalCount && data.length > 0;

        if (validPage === 1 && normalized.length > 0) {
          setCachedDealsList(normalized);
        }

        return {
          products: normalized,
          total: totalCount,
          hasMore,
          page: validPage,
          isOffline: false
        };
      }
    } catch (err) {
      console.warn("[getDeals] Server-side range query error, falling back to cached deals:", err);
    }
  }

  // Fallback to cache / memory
  const { rawList, isOffline } = await fetchRawDealsList();
  let allDeals = rawList
    .map(normalizeDeal)
    .filter((d) => d && d.name && !isDemoProduct(d) && (d.price > 0 || d.discount > 0));

  if (category && category !== "All") {
    const targetCat = category.toLowerCase().trim();
    allDeals = allDeals.filter((p) => {
      const c = (p.category || "").toLowerCase();
      const n = (p.name || "").toLowerCase();
      if (targetCat === "clothes") {
        return c.includes("cloth") || c.includes("fashion") || c.includes("apparel") ||
          n.includes("shirt") || n.includes("t-shirt") || n.includes("dress") || n.includes("kurti") ||
          n.includes("jeans") || n.includes("pant") || n.includes("trouser") || n.includes("cloth");
      }
      if (targetCat === "watches") {
        return c.includes("watch") || n.includes("watch") || n.includes("chronograph") || n.includes("smartwatch");
      }
      return c.includes(targetCat) || targetCat.includes(c) || n.includes(targetCat);
    });
  }

  if (store && store !== "All") {
    const targetStore = store.toLowerCase().trim();
    allDeals = allDeals.filter((p) => {
      const best = (p.platform || p.store || "").toLowerCase();
      const anyOffer = (p.offers || []).some((o) => (o.platform || "").toLowerCase().includes(targetStore));
      return best.includes(targetStore) || anyOffer;
    });
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    allDeals = allDeals.filter((p) => {
      return (
        p.name?.toLowerCase().includes(q) ||
        p.store?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    });
  }

  switch (sort) {
    case "price_low_high":
      allDeals.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case "price_high_low":
      allDeals.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case "newest":
      allDeals.sort((a, b) => new Date(b.priceUpdatedAt || 0) - new Date(a.priceUpdatedAt || 0));
      break;
    case "biggest_discount":
    default:
      allDeals.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      break;
  }

  const total = allDeals.length;
  const paginated = allDeals.slice(from, to + 1);
  const hasMore = to + 1 < total;

  return {
    products: paginated,
    total,
    hasMore,
    page: validPage,
    isOffline: true
  };
}

/**
 * Fetch a single product from Supabase (or cache/demo fallback) by ID or UID.
 * Supports product.html loading multi-platform deals.
 */
export async function getSupabaseDealByIdOrUid(id, uid) {
  if (!id && !uid) return null;

  // 1. Check local in-memory/localStorage cache
  const cached = getCachedDealsList();
  if (cached?.data) {
    const found = cached.data.find(
      (p) => (id && String(p.id) === String(id)) || (uid && String(p.uid) === String(uid))
    );
    if (found) {
      return normalizeDeal(found);
    }
  }

  // 2. Query Supabase (supports UUID primary keys and external_id string lookups)
  try {
    let query = supabase
      .from("products")
      .select(PRODUCTS_SELECT_COLUMNS);

    const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id));

    if (isUuid) {
      query = query.eq("id", id);
    } else if (id) {
      const cleanId = String(id).replace(/^ext-/, "");
      query = query.or(`external_id.eq.${id},external_id.eq.${cleanId}`);
    } else if (uid) {
      const isUidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(uid));
      if (isUidUuid) {
        query = query.eq("id", uid);
      } else {
        const cleanUid = String(uid).replace(/^ext-/, "");
        query = query.or(`external_id.eq.${uid},external_id.eq.${cleanUid}`);
      }
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Supabase deal query timed out")), 4000)
    );

    const { data: singleProd, error } = await Promise.race([query.maybeSingle(), timeoutPromise]);

    if (!error && singleProd) {
      let offers = [];
      if (SUPABASE_PRODUCT_OFFERS_ENABLED) {
        try {
          const { data: offersData } = await supabase
            .from("product_offers")
            .select(`
              id,
              platform,
              platform_slug,
              price,
              mrp,
              discount_percent,
              affiliate_url,
              in_stock,
              updated_at
            `)
            .eq("product_id", singleProd.id)
            .eq("in_stock", true);

          if (Array.isArray(offersData)) {
            offers = offersData;
          }
        } catch {
          // Safe if product_offers table doesn't exist
        }
      }

      return normalizeDeal({
        ...singleProd,
        product_offers: offers
      });
    }
  } catch (err) {
    // Non-blocking query failure
  }

  // 3. Fallback to sessionStorage (for live search results with ext- IDs)
  const sessionItem = getDealFromSession(id || uid);
  if (sessionItem) {
    // Non-blocking background sync to persist into Supabase
    upsertExternalDeal(sessionItem).catch(() => {});
    return normalizeDeal(sessionItem);
  }

  return null;
}

export const getDealById = (id) => getSupabaseDealByIdOrUid(id, null);

/**
 * Log outbound platform clicks to click_events / outbound_clicks table.
 * Silent failure to never block the customer's navigation.
 */
export async function logPlatformClick(productId, platform, affiliateUrl) {
  try {
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : null;
    await supabase.from("click_events").insert({
      product_id: productId,
      platform,
      affiliate_url: affiliateUrl,
      user_agent: userAgent
    });
  } catch (err) {
    // Also try outbound_clicks fallback
    try {
      await supabase.from("outbound_clicks").insert({
        product_id: productId,
        source: platform || "deal_card"
      });
    } catch {}
  }
}

export const logOutboundClick = logPlatformClick;

/**
 * Realtime subscription to product_offers updates.
 * Safely refreshes deals on external price drops.
 */
export function subscribeDealsRealtime(onUpdate) {
  if (!isSupabaseConfigured || typeof supabase?.channel !== "function") {
    return () => {};
  }

  try {
    const channel = supabase
      .channel("public:product_offers_deals")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "product_offers" },
        (payload) => {
          if (onUpdate) onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.debug("[subscribeDealsRealtime] Channel error:", err);
    return () => {};
  }
}
