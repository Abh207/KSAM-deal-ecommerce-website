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

/**
 * Unwraps redirect parameters (e.g. Google Shopping redirects) to reach the real destination URL.
 */
export function unwrapRedirectUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  const trimmed = rawUrl.trim();
  try {
    if (trimmed.includes("google.") && (trimmed.includes("/url?") || trimmed.includes("/shopping/product/"))) {
      const parsed = new URL(trimmed.startsWith("//") ? `https:${trimmed}` : trimmed);
      const targetParam =
        parsed.searchParams.get("url") ||
        parsed.searchParams.get("q") ||
        parsed.searchParams.get("u") ||
        parsed.searchParams.get("dest") ||
        parsed.searchParams.get("target");
      if (targetParam && targetParam.startsWith("http")) {
        try {
          return decodeURIComponent(targetParam);
        } catch {
          return targetParam;
        }
      }
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

/**
 * Derives the original merchant / store name for a product following the strict priority order:
 * 1. Joined stores.name from store_id
 * 2. product.store_name / seller / source / merchant / store field from search/database
 * 3. A readable name derived from hostname of affiliate_url or product_url (e.g. www.flipkart.com -> Flipkart)
 * 4. If none work, returns "" (empty string). NEVER returns "KSAM Deal", "Partner Store", "Serp-Shopping", or "Google Shopping".
 */
export function getStoreName(product) {
  if (!product) return "";

  const isInvalid = (name) => {
    if (!name || typeof name !== "string") return true;
    const clean = name.trim().toLowerCase();
    return (
      !clean ||
      clean.includes("serp") ||
      clean.includes("google") ||
      clean.includes("ksam") ||
      clean.includes("licensed shopping data") ||
      clean === "partner store" ||
      clean === "partner-store" ||
      clean === "general" ||
      clean === "unknown" ||
      clean === "default" ||
      clean === "undefined" ||
      clean === "null" ||
      clean === "deal" ||
      clean === "deals" ||
      clean === "search" ||
      clean === "shopping"
    );
  };

  // 1. Joined stores.name from store_id
  if (product.stores && typeof product.stores === "object") {
    const joinedName = product.stores.name;
    if (!isInvalid(joinedName)) {
      return cleanStoreName(joinedName);
    }
  }

  // 2. Direct product fields & raw metadata candidates
  const candidates = [
    product.store_name,
    product.seller,
    product.source,
    product.merchant,
    product.store,
    product.platform,
    product.bestOffer?.platform,
    product.retailer,
    product.raw?.merchant,
    product.raw?.source,
    product.raw?.seller,
    product.raw?.seller_name,
    product.raw?.store_name
  ];

  for (const cand of candidates) {
    if (!isInvalid(cand)) {
      if (!cand.includes("/") && !cand.includes(".com") && !cand.includes(".in")) {
        const cleaned = cleanStoreName(cand);
        if (!isInvalid(cleaned)) return cleaned;
      }
      const derived = deriveStoreFromHostname(cand);
      if (derived && !isInvalid(derived)) return derived;
    }
  }

  // 2b. Check raw extensions array (e.g. ["Free delivery", "JioMart"])
  if (Array.isArray(product.raw?.extensions)) {
    for (const ext of product.raw.extensions) {
      if (typeof ext === "string" && ext.length > 2 && ext.length < 35) {
        const cleanExt = cleanStoreName(ext);
        if (!isInvalid(cleanExt)) {
          return cleanExt;
        }
      }
    }
  }

  // 3. Readable name derived from hostname of affiliate_url or product_url
  const urlCandidates = [
    product.affiliate_url,
    product.affiliateUrl,
    product.product_url,
    product.productUrl,
    product.bestOffer?.affiliateUrl,
    product.url,
    product.link,
    product.raw?.link,
    product.raw?.product_link
  ];

  for (const rawUrl of urlCandidates) {
    if (rawUrl && typeof rawUrl === "string" && rawUrl !== "#") {
      const derived = deriveStoreFromHostname(rawUrl);
      if (derived && !isInvalid(derived)) return derived;
    }
  }

  // 4. If none work, return empty string (hide the pill and store line)
  return "";
}

/**
 * Cleans, sanitizes and formats product description for card display.
 * - Strips raw HTML tags and decodes entities
 * - Removes ugly whitespace and control characters
 * - Returns "" if starting with generic "Verified hot deal on..."
 * - Returns "" if < 20 chars
 * - Returns "" if repeating the product title
 * - Truncates at word boundary around 130 characters with "..."
 */
export function cleanCardDescription(description, title = "") {
  if (!description || typeof description !== "string") return "";
  let clean = description
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.startsWith("Verified hot deal on") || clean.length < 20) {
    return "";
  }

  if (title && typeof title === "string") {
    const normT = title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normD = clean.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normD === normT || normT.startsWith(normD) || (normD.startsWith(normT) && normD.length - normT.length < 15)) {
      return "";
    }
  }

  if (clean.length > 135) {
    const cut = clean.slice(0, 130);
    const lastSpace = cut.lastIndexOf(" ");
    clean = (lastSpace > 100 ? cut.slice(0, lastSpace) : cut).trim() + "...";
  }

  return clean;
}

function cleanStoreName(name) {
  if (!name) return "";
  let clean = String(name).trim();
  clean = clean.replace(/^(on|by|from|sold by)\s+/i, "").trim();
  const lower = clean.toLowerCase();
  if (lower === "flipkart") return "Flipkart";
  if (lower === "amazon" || lower === "amazon india" || lower === "amazon.in") return "Amazon";
  if (lower === "myntra") return "Myntra";
  if (lower === "ajio") return "AJIO";
  if (lower === "croma") return "Croma";
  if (lower === "tatacliq" || lower === "tata cliq") return "Tata CLiQ";
  if (lower === "boat" || lower === "boat lifestyle") return "boAt";
  if (lower === "meesho") return "Meesho";
  if (lower === "nykaa") return "Nykaa";
  if (lower === "reliancedigital" || lower === "reliance digital") return "Reliance Digital";
  if (lower === "vijaysales" || lower === "vijay sales") return "Vijay Sales";
  if (lower === "jiomart" || lower === "jio mart") return "JioMart";
  if (lower === "mdcomputers" || lower === "md computers") return "MD Computers";
  if (lower === "primeabgb" || lower === "prime abgb") return "PrimeABGB";
  if (lower === "vedantcomputers" || lower === "vedant computers") return "Vedant Computers";
  if (lower === "robu" || lower === "robu.in") return "Robu.in";
  if (lower === "electronicscomp" || lower === "electronics comp") return "ElectronicsComp";
  if (lower === "dnatechindia" || lower === "dna technology") return "DNA Technology";
  if (lower === "bajaao") return "Bajaao";
  if (lower === "casioindiashop" || lower === "casio india shop") return "Casio India Shop";
  if (lower === "furtados" || lower === "furtadosonline") return "Furtados";
  if (lower === "tanotis") return "Tanotis";
  if (lower === "etoren" || lower === "etoren.com") return "Etoren.com";
  return clean.replace(/\b\w/g, (c) => c.toUpperCase());
}

function deriveStoreFromHostname(urlOrHost) {
  if (!urlOrHost || typeof urlOrHost !== "string") return "";
  try {
    const unwrapped = unwrapRedirectUrl(urlOrHost);
    let host = unwrapped.trim();
    if (host.includes("://") || host.startsWith("//")) {
      const parsed = new URL(host.startsWith("//") ? `https:${host}` : host);
      host = parsed.hostname;
    }
    host = host.split(":")[0];
    host = host.replace(/^(www\.|m\.)/i, "");
    const lower = host.toLowerCase();

    if (lower.includes("flipkart.")) return "Flipkart";
    if (lower.includes("amazon.")) return "Amazon";
    if (lower.includes("myntra.")) return "Myntra";
    if (lower.includes("ajio.")) return "AJIO";
    if (lower.includes("croma.")) return "Croma";
    if (lower.includes("tatacliq.")) return "Tata CLiQ";
    if (lower.includes("boat-lifestyle.") || lower.includes("boat.")) return "boAt";
    if (lower.includes("meesho.")) return "Meesho";
    if (lower.includes("nykaa.")) return "Nykaa";
    if (lower.includes("reliancedigital.")) return "Reliance Digital";
    if (lower.includes("vijaysales.")) return "Vijay Sales";
    if (lower.includes("jiomart.")) return "JioMart";
    if (lower.includes("mdcomputers.")) return "MD Computers";
    if (lower.includes("primeabgb.")) return "PrimeABGB";
    if (lower.includes("vedantcomputers.")) return "Vedant Computers";
    if (lower.includes("robu.")) return "Robu.in";
    if (lower.includes("electronicscomp.")) return "ElectronicsComp";
    if (lower.includes("dnatechindia.")) return "DNA Technology";
    if (lower.includes("bajaao.")) return "Bajaao";
    if (lower.includes("casioindiashop.")) return "Casio India Shop";
    if (lower.includes("furtadosonline.")) return "Furtados";
    if (lower.includes("tanotis.")) return "Tanotis";
    if (lower.includes("flyrobotics.")) return "FlyRobotics";
    if (lower.includes("industrybuying.")) return "Industrybuying";
    if (lower.includes("moglix.")) return "Moglix";
    if (lower.includes("etoren.")) return "Etoren.com";
    if (lower.includes("samsung.")) return "Samsung";
    if (lower.includes("apple.")) return "Apple";
    if (lower.includes("puma.")) return "Puma";
    if (lower.includes("nike.")) return "Nike";
    if (lower.includes("adidas.")) return "Adidas";
    if (lower.includes("google.")) return "";

    let namePart = host.replace(/\.(co|com|org|net|gov|edu)\.[a-z]{2,4}$/i, "");
    namePart = namePart.replace(/\.[a-z]{2,8}$/i, "");
    const segments = namePart.split(".");
    const primary = segments[segments.length - 1];
    if (
      !primary ||
      primary.toLowerCase() === "ksamdeal" ||
      primary.toLowerCase() === "ksam" ||
      primary.toLowerCase().includes("serp") ||
      primary.toLowerCase() === "google"
    ) {
      return "";
    }

    return primary
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    return "";
  }
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
  if (text.includes("phone") || text.includes("galaxy") || text.includes("iphone") || text.includes("mobile") || text.includes("oneplus") || text.includes("redmi") || text.includes("pixel")) return "Mobiles";
  if (text.includes("laptop") || text.includes("macbook") || text.includes("tuf") || text.includes("thinkpad") || text.includes("notebook")) return "Laptops";
  if (text.includes("headphone") || text.includes("airpod") || text.includes("audio") || text.includes("earbud") || text.includes("earphone") || text.includes("speaker") || text.includes("soundbar")) return "Audio";
  if (text.includes("shoe") || text.includes("air max") || text.includes("sneaker") || text.includes("footwear") || text.includes("boot") || text.includes("sandal")) return "Shoes";
  if (text.includes("mouse") || text.includes("keyboard") || text.includes("playstation") || text.includes("ps5") || text.includes("xbox") || text.includes("gaming") || text.includes("controller")) return "Gaming";
  if (text.includes("cream") || text.includes("beauty") || text.includes("lotion") || text.includes("serum") || text.includes("perfume") || text.includes("lipstick") || text.includes("makeup") || text.includes("skincare")) return "Beauty";
  if (text.includes("chair") || text.includes("sofa") || text.includes("vacuum") || text.includes("mattress") || text.includes("bedsheet") || text.includes("curtain")) return "Home";
  if (text.includes("sunglass") || text.includes("glasses") || text.includes("eyewear") || text.includes("spectacle")) return "Eyewear";
  if (text.includes("tv") || text.includes("television") || text.includes("oled") || text.includes("qled") || text.includes("refrigerator") || text.includes("microwave") || text.includes("camera") || text.includes("monitor")) return "Electronics";
  if (text.includes("fashion") || text.includes("apparel") || text.includes("wear")) return "Fashion";
  return "General";
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
    const storeName = getStoreName(product);
    const rawDesc = (product.description || "").trim();
    const cleanDesc = rawDesc.startsWith("Verified hot deal on") ? null : (rawDesc || null);

    const payload = {
      action: "upsert",
      product: {
        id: product.id,
        external_id: product.external_id || String(product.id || "").replace(/^ext-/, ""),
        name: product.name || product.title,
        title: product.title || product.name,
        brand: product.brand && !product.brand.toLowerCase().includes("ksam") ? product.brand : null,
        category: product.category || "General",
        description: cleanDesc,
        image_url: product.image || product.image_url || null,
        price: product.price ? Number(product.price) : 0,
        old_price: (product.old_price || product.oldPrice) ? Number(product.old_price || product.oldPrice) : null,
        discount: product.discount ? Number(product.discount) : 0,
        rating: product.rating ? Number(product.rating) : 0,
        reviews: product.reviews ? Number(product.reviews) : 0,
        availability: product.availability || "In Stock",
        store: storeName || null,
        store_name: storeName || null,
        source: storeName || null,
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
        platform: off.seller_name || off.platform || "Amazon",
        sellerName: off.seller_name || off.platform || "Merchant",
        platformSlug: (off.platform_slug || off.platform || "amazon").toLowerCase(),
        price: p,
        mrp: m > p ? m : p,
        discountPercent: Number(computedDiscount || 0),
        affiliateUrl: off.url || off.affiliate_url || "#",
        deliveryText: off.delivery_text || null,
        returnPolicyText: off.return_policy_text || null,
        offerText: off.offer_text || null,
        condition: off.condition || "New",
        inStock: off.in_stock !== false,
        updatedAt: off.updated_at || off.fetched_at
      };
    })
    .filter((off) => off.price > 0);

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

  const storeName = getStoreName(product);
  let categoryName = (product.category || "").trim();
  if (!categoryName || categoryName.toLowerCase() === "deals" || categoryName.toLowerCase() === "deal" || categoryName.toLowerCase() === "search") {
    categoryName = deriveCategoryFromName(product.name || product.title);
  }

  const affiliateUrl =
    bestOffer?.affiliateUrl ||
    product.affiliate_url ||
    product.affiliateUrl ||
    product.product_url ||
    "#";

  const rawDesc = (product.description || product.summary || product.desc || "").trim();
  const description = cleanCardDescription(rawDesc, product.name || product.title);

  const keyFeatures =
    Array.isArray(product.key_features) && product.key_features.length > 0
      ? product.key_features.filter(
          (f) =>
            typeof f === "string" &&
            f.trim().length > 0 &&
            !f.includes("100% Genuine product verified") &&
            !f.includes("Live price tracking across") &&
            !f.includes("Official brand warranty") &&
            !f.includes("Fast dispatch and secure checkout")
        )
      : Array.isArray(product.highlights) && product.highlights.length > 0
      ? product.highlights.filter(
          (f) =>
            typeof f === "string" &&
            f.trim().length > 0 &&
            !f.includes("100% Genuine product verified") &&
            !f.includes("Live price tracking across") &&
            !f.includes("Official brand warranty") &&
            !f.includes("Fast dispatch and secure checkout")
        )
      : [];

  const specs = typeof product.specs === "object" && product.specs !== null ? product.specs : {};
  const realBrand = product.brand && !product.brand.toLowerCase().includes("ksam") ? product.brand.trim() : "";

  return {
    id: product.id,
    uid: product.uid || `deal_${product.id}`,
    name: product.name || product.title || "Untitled Deal",
    title: product.title || product.name || "Untitled Deal",
    brand: realBrand || storeName || "",
    category: categoryName,
    price: basePrice,
    oldPrice: baseOldPrice > basePrice ? baseOldPrice : basePrice,
    discount: Number(calculatedDiscount || 0),
    rating: product.rating !== null && product.rating !== undefined && Number(product.rating) > 0 ? Number(product.rating) : null,
    reviews: product.review_count !== null && product.review_count !== undefined && Number(product.review_count) > 0 ? Number(product.review_count) : (product.reviews !== null && product.reviews !== undefined && Number(product.reviews) > 0 ? Number(product.reviews) : null),
    stock: product.stock !== undefined && product.stock !== null ? Number(product.stock) : null,
    availability: product.availability || "In Stock",
    about_text: product.about_text || null,
    key_features: keyFeatures,
    specifications: Object.keys(specs).length > 0 ? specs : (product.specifications || null),
    sku: product.sku || product.model || null,
    condition: product.condition || "New",
    enriched_at: product.enriched_at || null,
    enrichment_source: product.enrichment_source || null,
    store_name: storeName,
    raw: product.raw || null,
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
// Versioned to v3 to immediately invalidate any legacy single-product corrupted cache
const DEALS_CACHE_KEY = "ksam_deals_supabase_cache_v3";
const DEALS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCachedDealsList() {
  try {
    // Purge broken legacy cache keys
    localStorage.removeItem("ksam_deals_supabase_cache_v2");
    localStorage.removeItem("ksam_deals_supabase_cache");

    const raw = localStorage.getItem(DEALS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Ignore caches with fewer than 12 items to prevent single-card fallback
    if (parsed && Array.isArray(parsed.data) && parsed.data.length >= 12) {
      const isFresh = Date.now() - (parsed.timestamp || 0) < DEALS_CACHE_TTL_MS;
      return { data: parsed.data, isFresh };
    }
  } catch {}
  return null;
}

function setCachedDealsList(data) {
  try {
    if (!Array.isArray(data) || data.length < 12) return;
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

export const SEARCH_CACHE_PREFIX = "ksam_search_cache_";
export const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache to save SerpApi credits & make back instant

export function getCachedSearchResults(query) {
  try {
    if (!query || typeof window === "undefined" || !window.sessionStorage) return null;
    const key = `${SEARCH_CACHE_PREFIX}${query.toLowerCase().trim()}`;
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.products)) {
      if (Date.now() - (parsed.timestamp || 0) < SEARCH_CACHE_TTL_MS) {
        return parsed.products;
      }
      window.sessionStorage.removeItem(key);
    }
  } catch {}
  return null;
}

export function setCachedSearchResults(query, products) {
  try {
    if (!query || !Array.isArray(products) || typeof window === "undefined" || !window.sessionStorage) return;
    const key = `${SEARCH_CACHE_PREFIX}${query.toLowerCase().trim()}`;
    const payload = {
      products,
      timestamp: Date.now()
    };
    window.sessionStorage.setItem(key, JSON.stringify(payload));
  } catch {}
}

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
  if (!cached || !Array.isArray(cached.data) || cached.data.length < 12) {
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

  if (allDeals.length < 12) {
    return null;
  }

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
    hasMore: allDeals.length > count || allDeals.length >= 12,
    total: allDeals.length >= 290 ? allDeals.length : 290
  };
}

// Base columns that definitely exist in the initial schema (002_deals_ingest.sql)
export const BASE_PRODUCTS_COLUMNS = `
  id,
  name,
  title,
  brand,
  category,
  image_url,
  additional_images,
  price,
  old_price,
  discount_percent,
  currency,
  rating,
  reviews,
  availability,
  product_url,
  affiliate_url,
  tags,
  is_active,
  is_featured,
  store_id,
  source,
  raw,
  created_at
`;

// Extended columns including newer migrations (014, 015, 018)
// NOTE: "discount" is omitted because the real column is "discount_percent".
export const EXTENDED_PRODUCTS_COLUMNS = `
  id,
  name,
  title,
  brand,
  category,
  description,
  about_text,
  key_features,
  specifications,
  sku,
  condition,
  store_name,
  enriched_at,
  enrichment_source,
  image_url,
  additional_images,
  rating,
  reviews,
  price,
  old_price,
  discount_percent,
  currency,
  affiliate_url,
  product_url,
  availability,
  is_active,
  is_featured,
  tags,
  store_id,
  source,
  raw,
  created_at
`;

export const PRODUCTS_SELECT_COLUMNS = BASE_PRODUCTS_COLUMNS;

// SessionStorage key to store whether extended migration columns exist
const HAS_EXTENDED_COLUMNS_KEY = "ksam_supabase_has_extended_columns";

export function checkHasExtendedColumns() {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const val = window.sessionStorage.getItem(HAS_EXTENDED_COLUMNS_KEY);
      if (val === "true") return true;
      if (val === "false") return false;
    }
  } catch {}
  return false; // Default to base columns to guarantee ZERO 400 Bad Request errors on load!
}

let fallbackToBaseColumns = !checkHasExtendedColumns();
let hasLoggedMigrationWarning = false;
let inFlightDealsPromise = null;

// Set to true once the remote Supabase database has executed migration 008_create_product_offers.sql
const SUPABASE_PRODUCT_OFFERS_ENABLED = false;

/**
 * Executes a two-step query (products then product_offers separately)
 * avoiding schema cache relationship requirements.
 */
async function fetchProductsAndOffersSeparately() {
  try {
    const cols = fallbackToBaseColumns ? BASE_PRODUCTS_COLUMNS : EXTENDED_PRODUCTS_COLUMNS;
    let { data: prods, error: prodErr } = await supabase
      .from("products")
      .select(cols)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(0, 19);

    if (prodErr && !fallbackToBaseColumns) {
      fallbackToBaseColumns = true;
      if (!hasLoggedMigrationWarning) {
        console.warn(
          "[KsamDeal] Database is missing migration columns (e.g. store_name, about_text, specifications). Retrying with base schema columns. To enable full enrichment and store_name columns, please execute migrations 014_add_store_name_to_products.sql and 018_product_enrichment_and_offers.sql in your Supabase SQL Editor."
        );
        hasLoggedMigrationWarning = true;
      }
      const retryRes = await supabase
        .from("products")
        .select(BASE_PRODUCTS_COLUMNS)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(0, 19);
      prods = retryRes.data;
      prodErr = retryRes.error;
    }

    if (prodErr || !Array.isArray(prods) || prods.length === 0) {
      // If no active rows, fetch without filter
      const { data: allProds, error: allErr } = await supabase
        .from("products")
        .select(BASE_PRODUCTS_COLUMNS)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(0, 19);

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
  const from = options.from !== undefined ? Math.max(0, parseInt(options.from, 10)) : (validPage - 1) * validPageSize;
  const to = options.to !== undefined ? Math.max(from, parseInt(options.to, 10)) : from + validPageSize - 1;

  if (isSupabaseConfigured && supabase) {
    try {
      const isFirstPage = from === 0;

      const buildDealsQuery = (cols) => {
        let q = supabase.from("products").select(cols, { count: "exact" });

        q = q.eq("is_active", true);

        // 1. Filter by category
        if (category && category !== "All") {
          const targetCat = category.toLowerCase().trim();
          if (targetCat === "clothes") {
            q = q.or("category.ilike.%clothes%,category.ilike.%fashion%,category.ilike.%apparel%,name.ilike.%shirt%,name.ilike.%t-shirt%,name.ilike.%kurti%,name.ilike.%dress%,name.ilike.%pant%,name.ilike.%trouser%,title.ilike.%shirt%,title.ilike.%t-shirt%");
          } else if (targetCat === "watches") {
            q = q.or("category.ilike.%watch%,name.ilike.%watch%,title.ilike.%watch%,name.ilike.%chronograph%,name.ilike.%smartwatch%");
          } else {
            q = q.or(`category.ilike.%${targetCat}%,name.ilike.%${targetCat}%,title.ilike.%${targetCat}%`);
          }
        }

        // 2. Filter by store
        if (store && store !== "All") {
          const targetStore = store.toLowerCase().trim();
          q = q.or(`source.ilike.%${targetStore}%,product_url.ilike.%${targetStore}%,affiliate_url.ilike.%${targetStore}%`);
        }

        // 3. Filter by search query
        if (search && search.trim()) {
          const searchClean = search.trim();
          q = q.or(`name.ilike.%${searchClean}%,title.ilike.%${searchClean}%,brand.ilike.%${searchClean}%,category.ilike.%${searchClean}%`);
        }

        // 4. Stable sort: .order("created_at", { ascending: false }).order("id", { ascending: false })
        switch (sort) {
          case "price_low_high":
            q = q
              .order("price", { ascending: true, nullsFirst: false })
              .order("created_at", { ascending: false })
              .order("id", { ascending: false });
            break;
          case "price_high_low":
            q = q
              .order("price", { ascending: false, nullsFirst: false })
              .order("created_at", { ascending: false })
              .order("id", { ascending: false });
            break;
          case "newest":
            q = q
              .order("created_at", { ascending: false })
              .order("id", { ascending: false });
            break;
          case "biggest_discount":
          default:
            q = q
              .order("discount_percent", { ascending: false, nullsLast: true })
              .order("created_at", { ascending: false })
              .order("id", { ascending: false });
            break;
        }

        // 5. Server-side pagination range
        return q.range(from, to);
      };

      const initialCols = fallbackToBaseColumns ? BASE_PRODUCTS_COLUMNS : EXTENDED_PRODUCTS_COLUMNS;
      let query = buildDealsQuery(initialCols);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase deals range query timed out")), 6000)
      );

      let { data, count, error } = await Promise.race([query, timeoutPromise]);

      // If query fails due to missing migration columns, automatically fallback to base schema
      if (error && !fallbackToBaseColumns) {
        const errMsg = String(error.message || error.details || "").toLowerCase();
        const errCode = String(error.code || "");
        if (
          errCode === "PGRST204" ||
          error.status === 400 ||
          errMsg.includes("column") ||
          errMsg.includes("schema cache") ||
          errMsg.includes("does not exist") ||
          errMsg.includes("relationship")
        ) {
          fallbackToBaseColumns = true;
          try {
            if (typeof window !== "undefined" && window.sessionStorage) {
              window.sessionStorage.setItem(HAS_EXTENDED_COLUMNS_KEY, "false");
            }
          } catch {}
          if (!hasLoggedMigrationWarning) {
            console.warn(
              "[KsamDeal] Database is missing migration columns (e.g. store_name, about_text, specifications). Retrying with base schema columns. To enable full enrichment and store_name columns, please execute migrations 014_add_store_name_to_products.sql and 018_product_enrichment_and_offers.sql in your Supabase SQL Editor."
            );
            hasLoggedMigrationWarning = true;
          }
          let retryQuery = buildDealsQuery(BASE_PRODUCTS_COLUMNS);
          const retryRes = await Promise.race([retryQuery, timeoutPromise]);
          data = retryRes.data;
          count = retryRes.count;
          error = retryRes.error;
        }
      }

      if (!error && Array.isArray(data)) {
        const normalized = data
          .map(normalizeDeal)
          .filter((d) => {
            if (!d || !d.name) return false;
            if (isDemoProduct(d)) return false;
            if (d.is_suspicious) return false;
            if (!d.price || d.price <= 0 || !Number.isFinite(d.price)) return false;
            if (d.name.trim().length < 5 || /^\d+$/.test(d.name.trim())) return false;
            const link = d.affiliate_url || d.affiliateUrl || d.url || d.product_url;
            if (!link || link === "#") return false;
            return true;
          });

        const totalCount =
          count !== null && count !== undefined
            ? count
            : options.total !== undefined
            ? options.total
            : options.totalCount !== undefined
            ? options.totalCount
            : (normalized.length >= 12 ? 290 : normalized.length);
        const hasMore = to + 1 < totalCount && (data.length > 0 || normalized.length > 0);

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
    .filter((d) => {
      if (!d || !d.name) return false;
      if (isDemoProduct(d)) return false;
      if (d.is_suspicious) return false;
      if (!d.price || d.price <= 0 || !Number.isFinite(d.price)) return false;
      if (d.name.trim().length < 5 || /^\d+$/.test(d.name.trim())) return false;
      const link = d.affiliate_url || d.affiliateUrl || d.url || d.product_url;
      if (!link || link === "#") return false;
      return true;
    });

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
    const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id));

    const buildSingleQuery = (cols) => {
      let q = supabase.from("products").select(cols);
      if (isUuid) {
        q = q.eq("id", id);
      } else if (id) {
        const cleanId = String(id).replace(/^ext-/, "");
        q = q.or(`external_id.eq.${id},external_id.eq.${cleanId}`);
      } else if (uid) {
        const isUidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(uid));
        if (isUidUuid) {
          q = q.eq("id", uid);
        } else {
          const cleanUid = String(uid).replace(/^ext-/, "");
          q = q.or(`external_id.eq.${uid},external_id.eq.${cleanUid}`);
        }
      }
      return q;
    };

    const targetCols = fallbackToBaseColumns ? BASE_PRODUCTS_COLUMNS : EXTENDED_PRODUCTS_COLUMNS;
    let query = buildSingleQuery(targetCols);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Supabase deal query timed out")), 4000)
    );

    let { data: singleProd, error } = await Promise.race([query.maybeSingle(), timeoutPromise]);

    if (error && !fallbackToBaseColumns) {
      fallbackToBaseColumns = true;
      const retryQuery = buildSingleQuery(BASE_PRODUCTS_COLUMNS);
      const retryRes = await Promise.race([retryQuery.maybeSingle(), timeoutPromise]);
      singleProd = retryRes.data;
      error = retryRes.error;
    }

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
