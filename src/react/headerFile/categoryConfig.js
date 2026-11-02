/**
 * Master Shop Category Configuration
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for the "Shop by Category" section on shop.html,
 * sidebars, panel views, mobile lists, breadcrumbs, and filters.
 *
 * Ordered list:
 *  1. Watches
 *  2. Beauty
 *  3. Gadgets (renamed from Speakers, aliases: speakers, audio)
 *  4. Clothing (cloths)
 *  5. Footwear (renamed from Shoes, aliases: shoes)
 *  6. Electronics
 *  7. Chairs
 *  8. Fashion
 *  9. Home Appliances (NEW)
 * 10. Accessories & Lifestyle (NEW)
 */

export const USD_TO_INR_RATE = 83;

export const CATEGORIES_CONFIG = [
  {
    key: "watches",
    slug: "watches",
    aliases: ["watch"],
    label: "Watches",
    description: "Classic & smart watches",
    iconKey: "watches",
    iconEmoji: "⌚",
    color: "#edf9f8",
    searchPlaceholder: "Search watches...",
    heroImage: "assets/videos/watches-banner-poster.webp",
    viewAllTarget: "watchshop.html",
    video: [
      { src: "assets/videos/watches-banner_mobile.mp4", type: "video/mp4", media: "(max-width: 768px)" },
      { src: "assets/videos/watches-banner.webm", type: "video/webm" },
      { src: "assets/videos/watches-banner.mp4", type: "video/mp4" }
    ],
    poster: "assets/videos/watches-banner-poster.webp",
    objectPosition: "72% 50%",
    fit: "cover",
    scale: 1
  },
  {
    key: "beauty",
    slug: "beauty",
    aliases: ["skincare", "skin-care"],
    label: "Beauty",
    description: "Beauty & personal care",
    iconKey: "beauty",
    iconEmoji: "✨",
    color: "#fff5e8",
    searchPlaceholder: "Search beauty & skincare...",
    heroImage: "images/remote/unsplash_1620916566398-39f1143ab7be.webp",
    viewAllTarget: "beauty.html",
    video: [
      { src: "assets/videos/Skincare_bottle_product_animation_20261027193838_mobile.mp4", type: "video/mp4", media: "(max-width: 768px)" },
      { src: "assets/videos/Skincare_bottle_product_animation_20261027193838.mp4", type: "video/mp4" }
    ],
    poster: "images/remote/unsplash_1620916566398-39f1143ab7be.webp",
    objectPosition: "72% 50%",
    fit: "cover",
    scale: 1
  },
  {
    key: "gadgets",
    slug: "gadgets",
    aliases: ["speakers", "speaker", "audio"],
    label: "Gadgets",
    description: "High-quality sound systems & audio gadgets",
    iconKey: "gadgets",
    iconEmoji: "🔊",
    color: "#f0f8ff",
    searchPlaceholder: "Search gadgets & sound systems...",
    heroImage: "assets/videos/speakers-category-poster.webp",
    viewAllTarget: "audio.html",
    video: [
      { src: "assets/videos/speakers-category_mobile.webm", type: "video/webm", media: "(max-width: 768px)" },
      { src: "assets/videos/speakers-category_mobile.mp4", type: "video/mp4", media: "(max-width: 768px)" },
      { src: "assets/videos/speakers-category.webm", type: "video/webm" },
      { src: "assets/videos/speakers-category.mp4", type: "video/mp4" }
    ],
    poster: "assets/videos/speakers-category-poster.webp",
    objectPosition: "80% 50%",
    fit: "cover",
    scale: 1
  },
  {
    key: "clothing",
    slug: "clothing",
    aliases: ["cloths", "clothes", "apparel"],
    label: "Clothing",
    description: "Stylish clothing for every occasion",
    iconKey: "clothing",
    iconEmoji: "👕",
    color: "#eefbea",
    searchPlaceholder: "Search clothing & apparel...",
    heroImage: "products/clothes/fbg1.png",
    viewAllTarget: "clothes.html",
    video: null,
    poster: "",
    objectPosition: "72% 50%",
    fit: "cover",
    scale: 1
  },
  {
    key: "footwear",
    slug: "footwear",
    aliases: ["shoes", "shoe"],
    label: "Footwear",
    description: "Stylish footwear for every occasion",
    iconKey: "footwear",
    iconEmoji: "👟",
    color: "#f0f8ff",
    searchPlaceholder: "Search footwear & sneakers...",
    heroImage: "assets/videos/shoes-banner-poster.webp",
    viewAllTarget: "shoes.html",
    video: [
      { src: "assets/videos/shoes-banner_mobile.mp4", type: "video/mp4", media: "(max-width: 768px)" },
      { src: "assets/videos/shoes-banner.webm", type: "video/webm" },
      { src: "assets/videos/shoes-banner.mp4", type: "video/mp4" }
    ],
    poster: "assets/videos/shoes-banner-poster.webp",
    objectPosition: "72% 50%",
    fit: "cover",
    scale: 1
  },
  {
    key: "electronics",
    slug: "electronics",
    aliases: ["electronic"],
    label: "Electronics",
    description: "Smart gadgets & digital devices",
    iconKey: "electronics",
    iconEmoji: "⚡",
    color: "#e8f1ff",
    searchPlaceholder: "Search electronics...",
    heroImage: "images/remote/unsplash_1511707171634-5f897ff02aa9.webp",
    viewAllTarget: "electronics.html",
    video: [
      { src: "assets/videos/Gaming_mouse_exploded_view_eb900f91.mp4", type: "video/mp4" },
      { src: "videos/electronics-category-bg.mp4", type: "video/mp4" }
    ],
    poster: "images/remote/unsplash_1511707171634-5f897ff02aa9.webp",
    objectPosition: "center",
    fit: "cover",
    scale: 1
  },
  {
    key: "chairs",
    slug: "chairs",
    aliases: ["chair", "furniture"],
    label: "Chairs",
    description: "Comfortable ergonomic & stylish chairs",
    iconKey: "chairs",
    iconEmoji: "🪑",
    color: "#f3edff",
    searchPlaceholder: "Search chairs & ergonomic furniture...",
    heroImage: "assets/videos/chairs-bed-poster.webp",
    viewAllTarget: "moreChairProd.html",
    video: [
      { src: "assets/videos/chairs-bed_mobile.mp4", type: "video/mp4", media: "(max-width: 768px)" },
      { src: "assets/videos/chairs-bed.mp4", type: "video/mp4" }
    ],
    poster: "assets/videos/chairs-bed-poster.webp",
    objectPosition: "70% 55%",
    fit: "cover",
    scale: 1,
    fadeLoop: true
  },
  {
    key: "fashion",
    slug: "fashion",
    aliases: ["trending-fashion"],
    label: "Fashion",
    description: "Trending styles & products",
    iconKey: "fashion",
    iconEmoji: "✨",
    color: "#fff0f5",
    searchPlaceholder: "Search fashion & lifestyle...",
    heroImage: "images/categories/accessories-lifestyle-hero.webp",
    viewAllTarget: "product.html?view=list&category=fashion",
    video: null,
    poster: "",
    objectPosition: "72% 50%",
    fit: "cover",
    scale: 1
  },
  {
    key: "home-appliances",
    slug: "home-appliances",
    aliases: ["home-appliance", "appliances", "appliance", "home"],
    label: "Home Appliances",
    description: "Smart kitchen & home essentials",
    iconKey: "home-appliances",
    iconEmoji: "🍳",
    color: "#f0faf5",
    searchPlaceholder: "Search smart home appliances...",
    heroImage: "images/categories/home-appliances-hero.webp",
    viewAllTarget: "product.html?view=list&category=home-appliances",
    video: null,
    poster: "",
    objectPosition: "center",
    fit: "cover",
    scale: 1
  },
  {
    key: "accessories-lifestyle",
    slug: "accessories-lifestyle",
    aliases: ["accessories", "lifestyle"],
    label: "Accessories & Lifestyle",
    description: "Everyday carry & lifestyle gear",
    iconKey: "accessories-lifestyle",
    iconEmoji: "🕶️",
    color: "#fbf6ec",
    searchPlaceholder: "Search accessories & lifestyle...",
    heroImage: "images/categories/accessories-lifestyle-hero.webp",
    viewAllTarget: "product.html?view=list&category=accessories-lifestyle",
    video: null,
    poster: "",
    objectPosition: "center",
    fit: "cover",
    scale: 1
  }
];

/**
 * Resolves a category config object by slug, key, or alias.
 */
export function getCategoryConfigBySlug(slug) {
  if (!slug) return null;
  const clean = String(slug).toLowerCase().trim();
  return (
    CATEGORIES_CONFIG.find(
      (c) =>
        c.slug === clean ||
        c.key === clean ||
        (Array.isArray(c.aliases) && c.aliases.includes(clean))
    ) || null
  );
}

/**
 * Maps any internal or legacy category slug/name to its official display label.
 * Leaves DB untouched while formatting UI names consistently.
 */
export function mapCategoryDisplayLabel(category) {
  if (!category) return "";
  const config = getCategoryConfigBySlug(category);
  return config ? config.label : category;
}

/**
 * Normalizes a price into Indian Rupees (INR).
 * If the product is from generalProducts (where prices are in USD),
 * converts with USD_TO_INR_RATE.
 */
export function formatCategoryPriceINR(rawPrice, isUsdSource = false) {
  if (rawPrice === undefined || rawPrice === null || rawPrice === "") return "";
  const num = typeof rawPrice === "number"
    ? rawPrice
    : parseFloat(String(rawPrice).replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return String(rawPrice);

  const finalInr = isUsdSource ? Math.round(num * USD_TO_INR_RATE) : Math.round(num);
  return `₹${finalInr.toLocaleString("en-IN")}`;
}

