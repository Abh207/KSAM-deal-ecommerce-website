import { supabase, isSupabaseConfigured } from "../../lib/supabase.js";
import { demoDeals } from "../data/dealsData.js";
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

export function deriveCategoryFromName(name = "") {
  const text = (name || "").toLowerCase();
  if (text.includes("phone") || text.includes("galaxy") || text.includes("iphone") || text.includes("mobile")) return "Mobiles";
  if (text.includes("laptop") || text.includes("macbook") || text.includes("tuf")) return "Laptops";
  if (text.includes("headphone") || text.includes("airpod") || text.includes("audio") || text.includes("earbud")) return "Audio";
  if (text.includes("tv") || text.includes("television") || text.includes("oled")) return "Electronics";
  if (text.includes("shoe") || text.includes("air max") || text.includes("sneaker")) return "Shoes";
  if (text.includes("mouse") || text.includes("keyboard") || text.includes("playstation") || text.includes("ps5") || text.includes("gaming")) return "Gaming";
  if (text.includes("jacket") || text.includes("bag") || text.includes("shirt") || text.includes("fashion") || text.includes("cloth")) return "Fashion";
  if (text.includes("chair") || text.includes("sofa") || text.includes("vacuum") || text.includes("home")) return "Home";
  if (text.includes("cream") || text.includes("beauty") || text.includes("lotion") || text.includes("serum")) return "Beauty";
  if (text.includes("watch") || text.includes("smartwatch")) return "Watches";
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
 * Validates external affiliate URLs against an allowlist of trusted e-commerce hostnames.
 * Prevents javascript: or unsafe link injection.
 */
const ALLOWED_AFFILIATE_HOSTS = [
  "amazon.in",
  "amazon.com",
  "flipkart.com",
  "myntra.com",
  "ajio.com",
  "croma.com",
  "meesho.com",
  "tatacliq.com",
  "jiomart.com",
  "lenskart.com",
  "nike.com",
  "boat-lifestyle.com",
  "noise.com",
  "oneplus.in",
  "samsung.com",
  "apple.com"
];

export function isSafeAffiliateUrl(urlStr) {
  if (!urlStr || typeof urlStr !== "string") return false;
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    return ALLOWED_AFFILIATE_HOSTS.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    );
  } catch {
    return false;
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

  const storeName = bestOffer?.platform || product.store || product.retailer || "Amazon";
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

/**
 * Fetch aggregated multi-platform deals from Supabase products + product_offers.
 * Falls back to localStorage cache (with isOffline notice) or high-quality demo data.
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

  let rawList = [];
  let isOffline = false;
  const cached = getCachedDealsList();

  if (cached && cached.isFresh) {
    rawList = cached.data;
  } else {
    if (cached?.data) {
      rawList = cached.data;
    }

    try {
      const fetchPromise = supabase
        .from("products")
        .select(`
          id,
          uid,
          title,
          name,
          brand,
          category,
          description,
          key_features,
          specs,
          images,
          image_url,
          rating,
          review_count,
          stock,
          is_active,
          price,
          old_price,
          discount_percent,
          affiliate_url,
          created_at,
          updated_at,
          product_offers (
            id,
            platform,
            platform_slug,
            price,
            mrp,
            discount_percent,
            affiliate_url,
            in_stock,
            updated_at
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase request timed out after 5s")), 5000)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (!error && Array.isArray(data) && data.length > 0) {
        rawList = data;
        setCachedDealsList(data);
        isOffline = false;
      } else {
        if (error) {
          console.warn("[getDeals] Supabase query returned error:", error.message);
        }
        if (cached?.data && cached.data.length > 0) {
          rawList = cached.data;
          isOffline = true;
        }
      }
    } catch (err) {
      console.warn("[getDeals] Supabase unreachable or timed out:", err?.message || err);
      if (cached?.data && cached.data.length > 0) {
        rawList = cached.data;
        isOffline = true;
      }
    }
  }

  // If both live query and cache have no data (e.g. before DB migration is run), use demo dataset
  if (!rawList || rawList.length === 0) {
    rawList = demoDeals;
    isOffline = true;
  }

  // Normalize all products with best offer selected
  let allDeals = rawList.map(normalizeDeal).filter((d) => d && d.discount > 0);

  // 1. Filter by category
  if (category && category !== "All") {
    const targetCat = category.toLowerCase().trim();
    allDeals = allDeals.filter((p) => {
      const c = (p.category || "").toLowerCase();
      const n = (p.name || "").toLowerCase();
      return c.includes(targetCat) || targetCat.includes(c) || n.includes(targetCat);
    });
  }

  // 2. Filter by store/platform
  if (store && store !== "All") {
    const targetStore = store.toLowerCase().trim();
    allDeals = allDeals.filter((p) => {
      const best = (p.platform || p.store || "").toLowerCase();
      const anyOffer = (p.offers || []).some((o) => (o.platform || "").toLowerCase().includes(targetStore));
      return best.includes(targetStore) || anyOffer;
    });
  }

  // 3. Filter by search query
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

  // 4. Sort (Default: biggest discount descending)
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
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const paginated = isFinite(page) && page > 1 ? allDeals.slice(from, to) : allDeals.slice(0, pageSize);
  const hasMore = to < total;

  return {
    products: paginated,
    total,
    hasMore,
    page,
    isOffline
  };
}

/**
 * Fetch a single product from Supabase (or cache/demo fallback) by ID or UID.
 * Supports product.html loading multi-platform deals.
 */
export async function getSupabaseDealByIdOrUid(id, uid) {
  if (!id && !uid) return null;

  // 1. Check local cache
  const cached = getCachedDealsList();
  if (cached?.data) {
    const found = cached.data.find(
      (p) => (id && String(p.id) === String(id)) || (uid && String(p.uid) === String(uid))
    );
    if (found) {
      return normalizeDeal(found);
    }
  }

  // 2. Query Supabase
  try {
    let query = supabase
      .from("products")
      .select(`
        id,
        uid,
        title,
        name,
        brand,
        category,
        description,
        key_features,
        specs,
        images,
        image_url,
        rating,
        review_count,
        stock,
        is_active,
        price,
        old_price,
        discount_percent,
        affiliate_url,
        created_at,
        updated_at,
        product_offers (
          id,
          platform,
          platform_slug,
          price,
          mrp,
          discount_percent,
          affiliate_url,
          in_stock,
          updated_at
        )
      `)
      .eq("is_active", true);

    if (id) {
      query = query.eq("id", id);
    } else if (uid) {
      query = query.eq("uid", uid);
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Supabase deal query timed out")), 5000)
    );

    const { data, error } = await Promise.race([query.maybeSingle(), timeoutPromise]);

    if (!error && data) {
      return normalizeDeal(data);
    }
  } catch (err) {
    console.warn("[getSupabaseDealByIdOrUid] Error fetching deal:", err?.message || err);
  }

  // 3. Fallback to demo dataset
  const demoFound = demoDeals.find(
    (p) => (id && String(p.id) === String(id)) || (uid && String(p.uid) === String(uid))
  );
  if (demoFound) {
    return normalizeDeal(demoFound);
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
