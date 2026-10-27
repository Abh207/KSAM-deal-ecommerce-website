import { resolveImagePath, parsePrice } from "./cartHelper.js";
import {
  slugify,
  buildProductUid,
  findProduct,
  migrateWishlistItem
} from "./productCatalog.js";
import { supabase } from "./supabase.js";

export const WISHLIST_STORAGE_KEY = "ksam_wishlist";

// Legacy keys from across the codebase
const LEGACY_KEYS = [
  "watchWishlist",
  "audioWishlist",
  "clothesWishlist",
  "shoesWishlist",
  "headerProductsWishlist",
  "ksam_guest_wishlist"
];

const listeners = new Set();

/**
 * Creates or shows a modern floating toast notification
 */
export function showWishlistToast(message, type = "success") {
  if (typeof document === "undefined") return;

  let container = document.getElementById("ksam-wishlist-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "ksam-wishlist-toast-container";
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "ksam-wishlist-toast";
  const isRemoved = message.toLowerCase().includes("remove");
  const icon = isRemoved ? "✕" : "♥";
  const accentColor = isRemoved ? "#ffffff" : "#4ade80";

  toast.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    background: rgba(13, 20, 28, 0.95);
    border: 1px solid ${accentColor};
    border-radius: 999px;
    color: #ffffff;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 16px ${accentColor}40;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transform: translateY(20px);
    opacity: 0;
    transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: auto;
  `;

  toast.innerHTML = `
    <span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:${accentColor}25;color:${accentColor};font-size:13px;font-weight:bold;">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";
  });

  setTimeout(() => {
    toast.style.transform = "translateY(10px)";
    toast.style.opacity = "0";
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  }, 2200);
}

export function getProductDetailsLink(product) {
  const base =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.BASE_URL) ||
    "/KSAM-deal-ecommerce-website/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const id = product?.id !== undefined && product?.id !== null ? product.id : "";
  const category = product?.category || "";
  const uid = product?.uid || buildProductUid(category, id);
  return `${normalizedBase}product.html?id=${encodeURIComponent(id)}&category=${encodeURIComponent(category)}&uid=${encodeURIComponent(uid)}`;
}

/**
 * Determines product link URL based on category and properties
 */
export function getProductPageLink(product, catalogItem) {
  const id = product?.id || catalogItem?.id;
  const category = product?.category || catalogItem?.category || "";
  const uid = product?.uid || catalogItem?.uid || buildProductUid(category, id);

  if (id !== undefined && id !== null) {
    return getProductDetailsLink({ id, category, uid });
  }

  if (product?.link && typeof product.link === "string" && product.link !== "#") {
    return product.link;
  }
  if (product?.url && typeof product.url === "string" && product.url !== "#") {
    return product.url;
  }

  const base =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.BASE_URL) ||
    "/KSAM-deal-ecommerce-website/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}shop.html`;
}

/**
 * Normalizes any product or legacy entry into the standard wishlist item shape:
 * { id, uid, name, price, originalPrice, image, category, categorySlug, rating, link }
 */
export function normalizeWishlistItem(raw) {
  if (!raw) return null;

  let rawId = "";
  let rawObj = {};

  if (typeof raw === "string" || typeof raw === "number") {
    rawId = String(raw).trim();
    rawObj = { id: rawId };
  } else if (typeof raw === "object") {
    rawId = raw.id !== undefined && raw.id !== null ? String(raw.id).trim() : "";
    rawObj = raw;
  }

  if (!rawId) return null;

  const catalogItem = findProduct({
    uid: rawObj.uid,
    category: rawObj.category,
    id: rawId
  });

  const name =
    rawObj.name ||
    rawObj.title ||
    catalogItem?.name ||
    catalogItem?.title ||
    "Product";

  const rawPrice =
    rawObj.price !== undefined && rawObj.price !== null
      ? rawObj.price
      : catalogItem?.price ?? 0;
  const price = parsePrice(rawPrice);

  const rawOldPrice =
    rawObj.originalPrice ??
    rawObj.oldPrice ??
    rawObj.actualPrice ??
    rawObj.original_price ??
    rawObj.mrp ??
    catalogItem?.oldPrice ??
    catalogItem?.actualPrice ??
    catalogItem?.original_price ??
    0;
  const originalPrice = parsePrice(rawOldPrice);

  const rawImage =
    rawObj.image ||
    rawObj.image_url ||
    rawObj.thumbnail ||
    catalogItem?.image ||
    "";
  const image = resolveImagePath(rawImage);

  const category =
    rawObj.category ||
    catalogItem?.category ||
    "General";

  const categorySlug = slugify(category);
  const uid = rawObj.uid || catalogItem?.uid || buildProductUid(category, rawId);

  const rating = Number(
    rawObj.rating ??
    catalogItem?.rating ??
    4.5
  );

  const link = getProductDetailsLink({ id: rawId, category, uid });

  return {
    id: rawId,
    uid,
    name,
    price,
    originalPrice,
    image,
    category,
    categorySlug,
    rating,
    link
  };
}

/**
 * Reads the wishlist from localStorage and migrates any legacy storage keys
 */
export function getWishlist() {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  const DEFAULT_INITIAL_WISHLIST = [
    {
      id: 5,
      uid: "sport-watches-5",
      name: "Aqua Pro Diver",
      category: "Sport Watches",
      categorySlug: "sport-watches",
      price: 14999,
      originalPrice: 19999,
      image: "products/watch1.png",
      rating: 4.9
    },
    {
      id: 1002,
      uid: "sport-watches-1002",
      name: "Chrono Black",
      category: "Sport Watches",
      categorySlug: "sport-watches",
      price: 18499,
      originalPrice: 22999,
      image: "products/watch2.png",
      rating: 5.0
    },
    {
      id: 2005,
      uid: "shoes-2005",
      name: "Classic Retro Dunk Sneakers",
      category: "Shoes",
      categorySlug: "shoes",
      price: 8999,
      originalPrice: 11999,
      image: "/KSAM-deal-ecommerce-website/nikedunkshoes.png",
      rating: 4.8
    },
    {
      id: 1,
      uid: "chairs-1",
      name: "Ergonomic Office Chair",
      category: "Chairs",
      categorySlug: "chairs",
      price: 12499,
      originalPrice: 15999,
      image: "/KSAM-deal-ecommerce-website/chair.png",
      rating: 4.7
    },
    {
      id: 101,
      uid: "audio-101",
      name: "Studio Over-Ear ANC Headphones",
      category: "Audio",
      categorySlug: "audio",
      price: 16999,
      originalPrice: 21999,
      image: "/KSAM-deal-ecommerce-website/audio1.png",
      rating: 4.9
    },
    {
      id: 2007,
      uid: "clothes-2007",
      name: "Summer Floral Evening Gown",
      category: "Clothes",
      categorySlug: "clothes",
      price: 6499,
      originalPrice: 8999,
      image: "/KSAM-deal-ecommerce-website/cloths2.png",
      rating: 4.6
    }
  ];

  let list = [];
  let needsMigration = false;
  const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);

  try {
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        list = parsed.map((item) => {
          if (!item.uid || !item.categorySlug) needsMigration = true;
          return normalizeWishlistItem(migrateWishlistItem(item));
        }).filter(Boolean);
      }
    }
  } catch (err) {
    console.warn("Failed to parse ksam_wishlist:", err);
    list = [];
  }

  // Check and merge legacy keys if any exist
  let legacyMigrated = false;
  const existingUids = new Set(list.map((item) => item.uid || String(item.id)));

  LEGACY_KEYS.forEach((key) => {
    try {
      const rawLegacy = localStorage.getItem(key);
      if (!rawLegacy) return;
      const parsedLegacy = JSON.parse(rawLegacy);
      if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
        parsedLegacy.forEach((legacyItem) => {
          const normalized = normalizeWishlistItem(migrateWishlistItem(legacyItem));
          const keyId = normalized ? normalized.uid || String(normalized.id) : "";
          if (normalized && !existingUids.has(keyId)) {
            existingUids.add(keyId);
            list.push(normalized);
            legacyMigrated = true;
          }
        });
      }
    } catch {}
  });

  // If first time visit with no existing storage key and no legacy keys, seed default initial items
  if (raw === null && list.length === 0) {
    list = DEFAULT_INITIAL_WISHLIST.map(normalizeWishlistItem);
    needsMigration = true;
  }

  // If items were migrated or normalized, persist the unified array back
  if (needsMigration || legacyMigrated) {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }

  return list;
}
/**
 * Saves the wishlist array to localStorage and notifies all components
 */
function saveWishlist(items) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Failed to save ksam_wishlist:", err);
  }

  // Dispatch custom and storage events
  try {
    window.dispatchEvent(
      new CustomEvent("wishlist:changed", {
        detail: { count: items.length, items }
      })
    );
    window.dispatchEvent(new Event("storage"));
  } catch {}

  updateWishlistBadge();
}

/**
 * Checks whether an item is in the wishlist
 */
export function isInWishlist(target) {
  if (target === undefined || target === null) return false;
  const list = getWishlist();
  if (typeof target === "object") {
    const targetUid = target.uid || buildProductUid(target.category, target.id);
    const targetId = String(target.id ?? "").trim().toLowerCase();
    const targetCat = slugify(target.category);
    return list.some(
      (item) =>
        (item.uid && item.uid === targetUid) ||
        (String(item.id).trim().toLowerCase() === targetId && item.categorySlug === targetCat) ||
        String(item.id).trim().toLowerCase() === targetId
    );
  }
  const str = String(target).trim().toLowerCase();
  return list.some(
    (item) => item.uid === str || String(item.id).trim().toLowerCase() === str
  );
}

/**
 * Toggles a product in the wishlist (adds if absent, removes if present)
 */
export async function toggleWishlist(product) {
  if (!product) return false;

  const normalized = normalizeWishlistItem(product);
  if (!normalized || !normalized.id) return false;

  const list = getWishlist();
  const targetUid = normalized.uid;
  const targetId = String(normalized.id).trim().toLowerCase();
  const targetCatSlug = normalized.categorySlug;

  const exists = list.some(
    (item) =>
      (item.uid && item.uid === targetUid) ||
      (String(item.id).trim().toLowerCase() === targetId && item.categorySlug === targetCatSlug)
  );

  let nextList;
  let isNowSaved = false;

  if (exists) {
    nextList = list.filter(
      (item) =>
        item.uid !== targetUid &&
        !(String(item.id).trim().toLowerCase() === targetId && item.categorySlug === targetCatSlug)
    );
    isNowSaved = false;
    showWishlistToast("Removed from Wishlist", "info");
  } else {
    nextList = [...list, normalized];
    isNowSaved = true;
    showWishlistToast("Added to Wishlist ❤️", "success");
  }

  saveWishlist(nextList);

  // Sync to Supabase if user is logged in
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (user) {
      if (isNowSaved) {
        await supabase.from("wishlist").upsert({
          user_id: user.id,
          product_id: targetId
        });
      } else {
        await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", targetId);
      }
    }
  } catch (err) {
    console.warn("Supabase wishlist sync non-fatal error:", err);
  }

  return isNowSaved;
}

/**
 * Removes an item from the wishlist by ID or UID
 */
export async function removeFromWishlist(target) {
  if (target === undefined || target === null) return;
  const list = getWishlist();
  let nextList;
  let targetIdStr = "";

  if (typeof target === "object") {
    const targetUid = target.uid || buildProductUid(target.category, target.id);
    targetIdStr = String(target.id ?? "").trim().toLowerCase();
    nextList = list.filter(
      (item) => item.uid !== targetUid && String(item.id).trim().toLowerCase() !== targetIdStr
    );
  } else {
    targetIdStr = String(target).trim().toLowerCase();
    nextList = list.filter(
      (item) => item.uid !== targetIdStr && String(item.id).trim().toLowerCase() !== targetIdStr
    );
  }

  saveWishlist(nextList);
  showWishlistToast("Removed from Wishlist", "info");

  // Sync with Supabase
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (user) {
      await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", targetIdStr);
    }
  } catch {}
}

/**
 * Clears all items from the wishlist
 */
export async function clearWishlist() {
  saveWishlist([]);
  showWishlistToast("Wishlist cleared", "info");

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (user) {
      await supabase.from("wishlist").delete().eq("user_id", user.id);
    }
  } catch {}
}

/**
 * Updates any static or non-React badges found in the DOM
 */
export function updateWishlistBadge() {
  if (typeof document === "undefined") return;
  const list = getWishlist();
  const count = list.length;

  const badges = document.querySelectorAll("[data-wishlist-badge], .kh-nav-wishlist-badge");
  badges.forEach((el) => {
    el.textContent = count > 0 ? String(count) : "";
    if (count > 0) {
      el.removeAttribute("hidden");
      el.style.display = "inline-flex";
    } else {
      el.setAttribute("hidden", "true");
      el.style.display = "none";
    }
  });

  // Call registered listeners
  for (const fn of listeners) {
    try {
      fn(count, list);
    } catch {}
  }
}

/**
 * Subscribe to wishlist updates across tabs and within the same page
 */
export function subscribeWishlist(callback) {
  listeners.add(callback);

  const handleCustomEvent = (e) => {
    const count = e.detail?.count ?? getWishlist().length;
    const items = e.detail?.items ?? getWishlist();
    callback(count, items);
  };

  const handleStorageEvent = (e) => {
    if (!e || e.key === WISHLIST_STORAGE_KEY || !e.key) {
      const items = getWishlist();
      callback(items.length, items);
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("wishlist:changed", handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);
  }

  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("wishlist:changed", handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
}
