import audioData from "../api/audio-products.json" with { type: "json" };
import clothesData from "../api/clothesproducts.json" with { type: "json" };
import shoesData from "../api/shoes-products.json" with { type: "json" };
import featuredShoesData from "../api/featured-shoes.json" with { type: "json" };
import shopProducts from "../react-shop/shopProducts.json" with { type: "json" };
import headerProducts from "../api/headerproducts.json" with { type: "json" };
import chairProducts from "../api/moreChairProdjn.json" with { type: "json" };
import beautyProducts from "../api/beautyProducts.json" with { type: "json" };
import watchProducts from "../api/watch-products.json" with { type: "json" };
import defaultProducts from "../api/products.json" with { type: "json" };
import productsBox2 from "../api/productsBox2.json" with { type: "json" };
import horizScrollProd from "../api/horizScrollProd.json" with { type: "json" };

const greenBeautyProducts = [
  { id: 201, name: "Green Glow Cleanser", category: "Skin Care", price: 399, oldPrice: 599, image: "images/remote/unsplash_1556228720-195a672e8a03.webp" },
  { id: 202, name: "Vitamin C Serum", category: "Skin Care", price: 499, oldPrice: 799, image: "images/remote/unsplash_1620916566398-39f1143ab7be.webp" },
  { id: 203, name: "Hydrating Moisturizer", category: "Skin Care", price: 449, oldPrice: 699, image: "images/remote/unsplash_1611930022073-b7a4ba5fcccd.webp" },
  { id: 204, name: "Daily Sunscreen SPF 50", category: "Skin Care", price: 549, oldPrice: 799, image: "images/remote/unsplash_1556228578-8c89e6adf883.webp" },
  { id: 205, name: "Natural Face Mask", category: "Skin Care", price: 299, oldPrice: 449, image: "images/remote/unsplash_1620916566398-39f1143ab7be.webp" },
  { id: 206, name: "Natural Lip Tint", category: "Makeup", price: 249, oldPrice: 399, image: "images/remote/unsplash_1586495777744-4413f21062fa.webp" },
  { id: 207, name: "Herbal Hair Shampoo", category: "Hair Care", price: 349, oldPrice: 499, image: "images/remote/unsplash_1535585209827-a15fcdbc4c2d.webp" },
  { id: 208, name: "Green Bloom Perfume", category: "Fragrance", price: 699, oldPrice: 999, image: "images/remote/unsplash_1541643600914-78b084683601.webp" }
];

const promoProducts = [
  { id: 301, title: "MacBook Air M2", category: "Laptops", price: 999, oldPrice: 1099, image: "/macbook.jpg" },
  { id: 302, title: "Wireless Headphones", category: "Audio", price: 149, oldPrice: 249, image: "images/remote/unsplash_1505740420928-5e560c06d30e.webp" },
  { id: 303, title: "Premium Audio", category: "Audio", price: 199, oldPrice: 299, image: "images/remote/unsplash_1546435770-a3e426bf472b.webp" },
  { id: 304, title: "Professional Camera", category: "Cameras", price: 799, oldPrice: 999, image: "images/remote/unsplash_1516035069371-29a1b244cc32.webp" }
];

/**
 * Normalizes any category string into a URL and lookup safe slug.
 * Example: "Sport Watches" -> "sport-watches", "Men's Watches" -> "mens-watches"
 */
export function slugify(str) {
  if (!str || typeof str !== "string") return "general";
  return str
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "general";
}

/**
 * Builds a deterministic unique product identifier combining category slug and ID.
 * Example: "sport-watches-1002", "furniture-5"
 */
export function buildProductUid(category, id) {
  const catSlug = slugify(category);
  const cleanId = String(id ?? "").trim().toLowerCase();
  return `${catSlug}-${cleanId}`;
}

export const CATEGORY_PARENT_MAP = {
  // Watches
  "sport-watches": "watches",
  "mens-watches": "watches",
  "dress-watches": "watches",
  "womens-watches": "watches",
  "watches": "watches",
  "wearables": "watches",

  // Shoes
  "sneakers": "shoes",
  "running": "shoes",
  "walking": "shoes",
  "sports": "shoes",
  "shoes": "shoes",
  "boots": "shoes",
  "men": "shoes",

  // Audio and Gadgets (headphones/speakers/gadgets = audio and gadgets)
  "earbuds": "audio-gadgets",
  "headphones": "audio-gadgets",
  "audio": "audio-gadgets",
  "speakers": "audio-gadgets",
  "neckbands": "audio-gadgets",
  "gadgets": "audio-gadgets",
  "laptops": "audio-gadgets",
  "mobiles": "audio-gadgets",
  "smartphones": "audio-gadgets",
  "computers": "audio-gadgets",
  "cameras": "audio-gadgets",
  "gaming": "audio-gadgets",
  "smart-home": "audio-gadgets",

  // Clothes
  "tops": "clothes",
  "dresses": "clothes",
  "clothes": "clothes",
  "shirts": "clothes",
  "apparel": "clothes",
  "bottoms": "clothes",
  "jackets": "clothes",

  // Furniture
  "chair": "furniture",
  "furniture": "furniture",
  "nightstand": "furniture",
  "table": "furniture",
  "new": "furniture",
  "special": "furniture",
  "featured": "furniture",

  // Beauty
  "skin-care": "beauty",
  "makeup": "beauty",
  "hair-care": "beauty",
  "fragrance": "beauty",
  "body-care": "beauty",
  "beauty": "beauty"
};

// -------------------------------------------------------------
// Master Catalog Registry
// -------------------------------------------------------------
const masterCatalogList = [];
const catalogByUid = new Map();
const catalogByCategoryAndId = new Map();
const catalogByIdList = new Map();

function registerRawItem(item, defaultCategory = "General") {
  if (!item || item.id === undefined || item.id === null) return;

  const rawCat = item.category || defaultCategory;
  const categorySlug = slugify(rawCat);
  const idStr = String(item.id).trim();
  const uid = item.uid || buildProductUid(rawCat, idStr);

  const normalized = {
    ...item,
    id: item.id,
    uid,
    category: rawCat,
    categorySlug,
    name: item.name || item.title || "Product",
    price: Number(item.price) || 0,
    oldPrice: Number(item.oldPrice || item.originalPrice || item.Actualprice || item.actualPrice || item.mrp || 0),
    image: item.image || item.image_url || item.thumbnail || "",
    rating: Number(item.rating) || 4.5,
    reviews: item.reviews || 64,
    discount: Number(item.discount) || 0,
    badge: item.badge || ""
  };

  if (!catalogByUid.has(uid)) {
    catalogByUid.set(uid, normalized);
    masterCatalogList.push(normalized);
  }

  const catIdKey = `${categorySlug}::${idStr.toLowerCase()}`;
  if (!catalogByCategoryAndId.has(catIdKey)) {
    catalogByCategoryAndId.set(catIdKey, normalized);
  }

  const idKey = idStr.toLowerCase();
  if (!catalogByIdList.has(idKey)) {
    catalogByIdList.set(idKey, []);
  }
  catalogByIdList.get(idKey).push(normalized);
}

function registerRawList(data, defaultCategory) {
  if (!data) return;
  const list = Array.isArray(data) ? data : data.products || [];
  list.forEach((item) => registerRawItem(item, defaultCategory));
}

// Ingest in logical priority order
registerRawList(watchProducts, "Watches");
registerRawList(shoesData, "Shoes");
registerRawList(featuredShoesData, "Shoes");
registerRawList(audioData, "Audio");
registerRawList(clothesData, "Clothes");
registerRawList(beautyProducts, "Beauty");
registerRawList(greenBeautyProducts, "Skin Care");
registerRawList(headerProducts, "General");
registerRawList(chairProducts, "Furniture");
registerRawList(productsBox2, "Furniture");
registerRawList(horizScrollProd, "Furniture");
registerRawList(shopProducts, "General");
registerRawList(defaultProducts, "General");
registerRawList(promoProducts, "Gadgets");

/**
 * Returns all registered catalog products.
 */
export function getAllMasterProducts() {
  return masterCatalogList;
}

/**
 * Universal product lookup.
 * Finds product by:
 * 1. uid (e.g. "sport-watches-1002")
 * 2. category + id
 * 3. saved wishlist item in localStorage matching uid or category + id
 * 4. unique ID if and only if that ID exists in a single category.
 * NEVER falls back to a different category when a collision exists!
 */
export function findProduct(arg1, arg2, arg3) {
  let uid = "";
  let category = "";
  let id = "";

  if (typeof arg1 === "object" && arg1 !== null) {
    uid = arg1.uid || "";
    category = arg1.category || arg1.categorySlug || "";
    id = arg1.id !== undefined && arg1.id !== null ? String(arg1.id).trim() : "";
  } else if (typeof arg1 === "string" && arg2 !== undefined) {
    category = arg1;
    id = String(arg2).trim();
    uid = arg3 || "";
  } else if (arg1 !== undefined && arg1 !== null) {
    id = String(arg1).trim();
  }

  // 1. Look up by UID
  if (uid && typeof uid === "string") {
    const cleanUid = uid.trim().toLowerCase();
    if (catalogByUid.has(cleanUid)) {
      return catalogByUid.get(cleanUid);
    }
  }

  // 2. Look up by Category + ID
  const catSlug = slugify(category);
  const idStr = String(id).trim().toLowerCase();

  if (idStr) {
    if (catSlug && catSlug !== "general") {
      const catIdKey = `${catSlug}::${idStr}`;
      if (catalogByCategoryAndId.has(catIdKey)) {
        return catalogByCategoryAndId.get(catIdKey);
      }
    }

    // 3. Check saved wishlist in localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const rawWishlist = localStorage.getItem("ksam_wishlist");
        if (rawWishlist) {
          const parsed = JSON.parse(rawWishlist);
          if (Array.isArray(parsed)) {
            // Match by uid
            if (uid) {
              const matchedByUid = parsed.find((p) => p.uid === uid);
              if (matchedByUid) return matchedByUid;
            }
            // Match by category and id
            const matchedByCatAndId = parsed.find(
              (p) =>
                String(p.id).trim().toLowerCase() === idStr &&
                slugify(p.category) === catSlug
            );
            if (matchedByCatAndId) return matchedByCatAndId;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // 4. If category was not provided, check if ID is globally unique
    if (!catSlug || catSlug === "general") {
      const list = catalogByIdList.get(idStr);
      if (list && list.length === 1) {
        return list[0];
      }
      // If multiple products have this id (e.g. 5), never arbitrarily guess!
      return null;
    }
  }

  return null;
}

function isProductMatch(p, currentProduct, currentUid, currentName, currentPrice) {
  if (!p) return true;
  if (p.uid === currentUid) return true;
  if (
    currentName &&
    p.name &&
    p.name.toLowerCase().trim() === currentName &&
    Math.abs((Number(p.price) || 0) - currentPrice) < 2
  ) {
    return true;
  }
  return false;
}

/**
 * Returns related products of the SAME category / type.
 * Priority 1: Exact category matches (matching by categorySlug).
 * Priority 2: Same parent group matches (e.g. Sport Watches -> Watches, Earbuds -> Audio and Gadgets).
 * Never returns unrelated categories (e.g. watches -> beds/chairs).
 * De-duplicates by uid and by name + image.
 * Sorts by closest price.
 */
export function getRelatedProducts(product, limit = 6) {
  if (!product) return [];

  const currentUid = product.uid || buildProductUid(product.category, product.id);
  const currentName = (product.name || product.title || "").toLowerCase().trim();
  const currentPrice = Number(product.price) || 0;
  const catSlug = slugify(product.category);
  const parentGroup = CATEGORY_PARENT_MAP[catSlug] || (catSlug !== "general" ? catSlug : "");

  const seenUids = new Set();
  const seenNameImages = new Set();

  function canInclude(item) {
    if (!item) return false;
    if (isProductMatch(item, product, currentUid, currentName, currentPrice)) return false;
    const uid = item.uid || buildProductUid(item.category, item.id);
    if (seenUids.has(uid)) return false;
    const nameImageKey = `${(item.name || "").toLowerCase().trim()}::${(item.image || "").toLowerCase().trim()}`;
    if (seenNameImages.has(nameImageKey)) return false;
    return true;
  }

  function markIncluded(item) {
    const uid = item.uid || buildProductUid(item.category, item.id);
    seenUids.add(uid);
    const nameImageKey = `${(item.name || "").toLowerCase().trim()}::${(item.image || "").toLowerCase().trim()}`;
    seenNameImages.add(nameImageKey);
  }

  // 1. Exact Category Matches
  let exactCandidates = [];
  if (catSlug && catSlug !== "general") {
    exactCandidates = masterCatalogList.filter(
      (p) => p.categorySlug === catSlug && canInclude(p)
    );
  }

  // Sort exact matches by price proximity to the current product
  exactCandidates.sort(
    (a, b) => Math.abs((Number(a.price) || 0) - currentPrice) - Math.abs((Number(b.price) || 0) - currentPrice)
  );

  const results = [];
  for (const item of exactCandidates) {
    if (canInclude(item)) {
      markIncluded(item);
      results.push(item);
      if (results.length >= limit) {
        return results;
      }
    }
  }

  // 2. Parent Group Matches (if fewer than limit)
  if (results.length < limit && parentGroup) {
    const parentCandidates = masterCatalogList.filter((p) => {
      if (p.categorySlug === catSlug) return false; // already checked
      const pGroup = CATEGORY_PARENT_MAP[p.categorySlug] || p.categorySlug;
      return pGroup === parentGroup && canInclude(p);
    });

    parentCandidates.sort(
      (a, b) => Math.abs((Number(a.price) || 0) - currentPrice) - Math.abs((Number(b.price) || 0) - currentPrice)
    );

    for (const item of parentCandidates) {
      if (canInclude(item)) {
        markIncluded(item);
        results.push(item);
        if (results.length >= limit) {
          break;
        }
      }
    }
  }

  return results;
}

/**
 * Migrates wishlist items ensuring each has a valid `uid` and `categorySlug`.
 */
export function migrateWishlistItem(item) {
  if (!item) return null;

  let category = item.category || "General";
  let categorySlug = slugify(category);
  let id = item.id !== undefined && item.id !== null ? item.id : "";
  let uid = item.uid || "";

  // If item lacked uid or had general category, try finding in master catalog
  if (!uid || categorySlug === "general") {
    // Try matching by id and category
    let found = findProduct({ category, id });
    if (!found && item.name) {
      // Try matching by name and price
      found = masterCatalogList.find(
        (p) =>
          p.name.toLowerCase() === item.name.toLowerCase() &&
          Math.abs(p.price - (Number(item.price) || 0)) < 2
      );
    }

    if (found) {
      category = found.category || category;
      categorySlug = found.categorySlug || slugify(category);
      uid = found.uid;
      id = found.id;
    } else {
      uid = buildProductUid(category, id);
    }
  }

  return {
    ...item,
    id,
    uid,
    category,
    categorySlug
  };
}
