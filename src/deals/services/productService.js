import { supabase } from "../../lib/supabase";
import { deals as localFallbackDeals } from "../data/dealsData.js";
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
  if (text.includes("headphone") || text.includes("airpod") || text.includes("audio") || text.includes("earbud")) return "Electronics";
  if (text.includes("tv") || text.includes("television")) return "Electronics";
  if (text.includes("shoe") || text.includes("air max") || text.includes("sneaker")) return "Shoes";
  if (text.includes("mouse") || text.includes("keyboard") || text.includes("playstation") || text.includes("ps5") || text.includes("gaming")) return "Gaming";
  if (text.includes("jacket") || text.includes("bag") || text.includes("shirt") || text.includes("fashion")) return "Fashion";
  if (text.includes("chair") || text.includes("sofa") || text.includes("lamp") || text.includes("coffee") || text.includes("home")) return "Home";
  return "Electronics";
}

export function getCategoryFallbackImage(category = "", name = "") {
  const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const text = `${category || ""} ${name || ""}`.toLowerCase();

  // 1. Audio & Headphones FIRST so "headphones" never triggers "phone"
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

  // 2. Clothing / Jackets / Fashion Apparel (checked before general fashion)
  if (
    text.includes("jacket") ||
    text.includes("cloth") ||
    text.includes("shirt") ||
    text.includes("t-shirt") ||
    text.includes("hoodie") ||
    text.includes("denim") ||
    text.includes("apparel") ||
    text.includes("premium jacket")
  ) {
    return `${normalizedBase}products/clothes/cloth1.png`;
  }

  // 3. Shoes / Sneakers
  if (
    text.includes("shoe") ||
    text.includes("sneaker") ||
    text.includes("footwear") ||
    text.includes("air max")
  ) {
    return `${normalizedBase}products/shoes/shoe1.png`;
  }

  // 4. Mobiles / SmartPhones
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

  // 5. Laptops / Computers
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

  // 6. Watches
  if (text.includes("watch") || text.includes("smartwatch") || text.includes("band")) {
    return `${normalizedBase}watch.png`;
  }

  // 7. TVs & Displays
  if (text.includes("tv") || text.includes("television") || text.includes("monitor") || text.includes("display")) {
    return `${normalizedBase}tv.png`;
  }

  // 8. Speakers & Soundbars
  if (text.includes("speaker") || text.includes("soundbar") || text.includes("jbl")) {
    return `${normalizedBase}speakers.png`;
  }

  // 9. Mice, Keyboards & Gaming Accessories
  if (
    text.includes("mouse") ||
    text.includes("keyboard") ||
    text.includes("accessory") ||
    text.includes("playstation") ||
    text.includes("ps5") ||
    text.includes("gaming")
  ) {
    return `${normalizedBase}mouse.png`;
  }

  // 10. Furniture & Home
  if (
    text.includes("chair") ||
    text.includes("sofa") ||
    text.includes("furniture") ||
    text.includes("table") ||
    text.includes("home")
  ) {
    return `${normalizedBase}3dChair.png`;
  }

  // 11. Appliances
  if (text.includes("microwave") || text.includes("oven")) {
    return `${normalizedBase}Microwave.png`;
  }
  if (text.includes("heater") || text.includes("geyser") || text.includes("ac") || text.includes("appliance")) {
    return `${normalizedBase}Heater.png`;
  }

  return `${normalizedBase}electronics-items.png`;
}

/**
 * Universal safe normalization function for deals
 * Accepts any plausible field names from Supabase, APIs, or local fallback files.
 */
export function normalizeDeal(product) {
  if (!product) return null;

  const price = Number(product.price ?? product.currentPrice ?? product.current_price ?? 0);
  const oldPrice = Number(
    product.old_price ??
    product.oldPrice ??
    product.original_price ??
    product.originalPrice ??
    product.mrp ??
    0
  );

  const calculatedDiscount =
    product.discount_percent ??
    product.discountPercent ??
    product.discount ??
    (oldPrice > price && oldPrice > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0);

  const rawImage = product.image_url ?? product.imageUrl ?? product.image ?? "";
  let resolvedImage = rawImage;
  if (!rawImage || rawImage.includes("placehold.co")) {
    resolvedImage = getCategoryFallbackImage(
      product.category || product.categories?.name,
      product.name || product.title
    );
  } else if (!rawImage.startsWith("http://") && !rawImage.startsWith("https://") && !rawImage.startsWith("data:")) {
    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const clean = rawImage.replace(/^\/+/, "");
    resolvedImage = rawImage.startsWith(normalizedBase) ? rawImage : `${normalizedBase}${clean}`;
  }

  const storeObj = Array.isArray(product.stores) ? product.stores[0] : product.stores;
  const storeName = storeObj?.name || product.store || product.retailer || "Amazon";
  const storeLogo = storeObj?.logo_url || product.storeLogo || null;
  const storeWebsite = storeObj?.base_url || storeObj?.website || product.storeWebsite || "#";

  const categoryObj = Array.isArray(product.categories) ? product.categories[0] : product.categories;
  const categoryName =
    categoryObj?.name ||
    product.category ||
    deriveCategoryFromName(product.name || product.title) ||
    "Electronics";

  const affiliateUrl =
    product.affiliate_url ||
    product.affiliateUrl ||
    product.product_url ||
    product.productUrl ||
    product.url ||
    product.link ||
    "#";

  const description =
    product.description ||
    product.summary ||
    `Verified hot deal on ${product.name || product.title || "this product"}. Aggregated from official Indian retail platforms with verified price drops, genuine merchant warranty, and fast direct shipping.`;

  const highlights =
    Array.isArray(product.highlights) && product.highlights.length > 0
      ? product.highlights
      : [
          "100% Genuine product verified by merchant",
          "Live price tracking across major Indian retailers",
          "Official brand warranty and verified return policy",
          "Fast dispatch and secure store checkout"
        ];

  return {
    id: product.id,
    name: product.name || product.title || "Untitled Deal",
    brand: product.brand || "",
    category: categoryName,
    price,
    oldPrice: oldPrice > 0 ? oldPrice : price,
    discount: Number(calculatedDiscount || 0),
    rating: Number(product.rating || 0),
    reviews: Number(product.reviews || 0),
    availability: product.availability || "In Stock",
    image: resolvedImage,
    additionalImages: Array.isArray(product.additional_images) ? product.additional_images : [],
    store: storeName,
    storeLogo,
    storeWebsite,
    url: affiliateUrl,
    affiliateUrl,
    productUrl: product.product_url || affiliateUrl,
    description,
    highlights,
    priceUpdatedAt: product.price_updated_at || product.last_seen_at || product.created_at,
    priceUpdatedLabel: formatTimeAgo(product.price_updated_at || product.last_seen_at || product.created_at)
  };
}

// Alias for backward compatibility
export const normalizeDatabaseProduct = normalizeDeal;

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
  let queryError = null;

  try {
    // Query Supabase without restricting is_active to true (database products currently have is_active: false)
    const fetchPromise = supabase
      .from("products")
      .select(`
        *,
        stores (
          id,
          name,
          slug,
          logo_url,
          base_url,
          website
        ),
        categories (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Supabase request timed out after 7s")), 7000)
    );

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (error) {
      queryError = error;
      console.warn("[getDeals] Supabase returned error:", error);
    } else if (Array.isArray(data) && data.length > 0) {
      rawList = data;
    }
  } catch (err) {
    queryError = err;
    console.warn("[getDeals] Supabase fetch failed or timed out:", err);
  }

  // Defensive fallback: if Supabase query returned 0 items or errored, load from local dealsData
  if (!rawList || rawList.length === 0) {
    rawList = (localFallbackDeals || []).map((d) => ({
      ...d,
      stores: { name: d.store, website: d.url },
      categories: { name: d.category }
    }));
  }

  // Normalize all raw deals
  let allDeals = rawList.map(normalizeDeal).filter(Boolean);

  // 1. Filter by category
  if (category && category !== "All") {
    const targetCat = category.toLowerCase().trim();
    allDeals = allDeals.filter((p) => {
      const c = (p.category || "").toLowerCase();
      const n = (p.name || "").toLowerCase();
      return c.includes(targetCat) || targetCat.includes(c) || n.includes(targetCat);
    });
  }

  // 2. Filter by store
  if (store && store !== "All") {
    const targetStore = store.toLowerCase().trim();
    allDeals = allDeals.filter((p) => {
      const s = (p.store || "").toLowerCase();
      return s.includes(targetStore) || targetStore.includes(s);
    });
  }

  // 3. Filter by search query if provided
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

  // 4. Sort
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
    page
  };
}

export async function getDealById(id) {
  if (!id) return null;

  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        stores (
          id,
          name,
          slug,
          logo_url,
          base_url,
          website
        ),
        categories (
          id,
          name
        ),
        price_history (
          id,
          price,
          old_price,
          captured_at
        )
      `)
      .eq("id", id)
      .single();

    if (!error && data) {
      const normalized = normalizeDeal(data);
      const priceHistory = (data.price_history || []).sort(
        (a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime()
      );

      return {
        ...normalized,
        priceHistory
      };
    }
  } catch (err) {
    console.warn("[getDealById] Supabase lookup error:", err);
  }

  // Check in fallback deals
  const fallback = (localFallbackDeals || []).find((d) => String(d.id) === String(id));
  if (fallback) {
    return normalizeDeal({
      ...fallback,
      stores: { name: fallback.store, website: fallback.url },
      categories: { name: fallback.category }
    });
  }

  // Check in Hero marquee inline products
  const inline = (INLINE_PRODUCTS || []).find((p) => String(p.id) === String(id));
  if (inline) {
    return normalizeDeal({
      id: inline.id,
      name: inline.name,
      price: inline.price ? String(inline.price).replace(/[^0-9.]/g, "") : 0,
      old_price: inline.oldPrice ? String(inline.oldPrice).replace(/[^0-9.]/g, "") : null,
      rating: inline.rating ? parseFloat(inline.rating) : 4.8,
      rating_count: 120,
      image_url: inline.image,
      category: inline.category || "Electronics",
      store: inline.store || "Amazon",
      stores: { name: inline.store || "Amazon", website: inline.url || "https://www.amazon.in/" },
      affiliate_url: inline.url || inline.affiliateUrl || "https://www.amazon.in/"
    });
  }

  return null;
}

export async function logOutboundClick(productId, source = "deal_card") {
  try {
    const { data: authData } = await supabase.auth.getSession();
    const userId = authData?.session?.user?.id || null;

    await supabase.from("outbound_clicks").insert({
      product_id: productId,
      user_id: userId,
      source
    });
  } catch (err) {
    // Non-blocking telemetry
    console.debug("[outbound_click] Telemetry logged error:", err);
  }
}