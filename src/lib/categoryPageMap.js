/**
 * Category-to-Page Routing Configuration
 * ─────────────────────────────────────────────────────────────
 * Central mapping linking each category slug or name to its
 * dedicated storefront page in KSAM Deal.
 *
 * Used by:
 *  - "Shop by Category" showcase component (View All button)
 *  - Product detail breadcrumbs and "Back to <Category>" buttons
 *  - Navigation helpers across the project
 */

export const CATEGORY_PAGE_MAP = {
  // Watches
  watches: "watchshop.html",
  watch: "watchshop.html",

  // Beauty & Skin Care
  beauty: "beauty.html",
  skincare: "beauty.html",
  "skin-care": "beauty.html",

  // Shoes & Footwear (renamed Footwear, alias shoes)
  footwear: "shoes.html",
  shoes: "shoes.html",
  shoe: "shoes.html",

  // Chairs & Furniture
  chairs: "moreChairProd.html",
  chair: "moreChairProd.html",
  furniture: "moreChairProd.html",

  // Audio & Gadgets (renamed Gadgets, alias speakers)
  gadgets: "audio.html",
  gadget: "audio.html",
  speakers: "audio.html",
  speaker: "audio.html",
  audio: "audio.html",
  headphones: "audio.html",
  headphone: "audio.html",
  earbuds: "audio.html",
  earbud: "audio.html",
  neckbands: "audio.html",
  neckband: "audio.html",

  // Clothing & Apparel
  clothing: "clothes.html",
  cloths: "clothes.html",
  clothes: "clothes.html",
  apparel: "clothes.html",
  tops: "clothes.html",
  dresses: "clothes.html",
  bottoms: "clothes.html",
  jackets: "clothes.html",

  // Fashion (View All opens product.html list mode)
  fashion: "product.html?view=list&category=fashion",

  // Home Appliances (NEW - opens product.html list mode)
  "home-appliances": "product.html?view=list&category=home-appliances",
  "home-appliance": "product.html?view=list&category=home-appliances",
  appliances: "product.html?view=list&category=home-appliances",
  appliance: "product.html?view=list&category=home-appliances",

  // Accessories & Lifestyle (NEW - opens product.html list mode)
  "accessories-lifestyle": "product.html?view=list&category=accessories-lifestyle",
  accessories: "product.html?view=list&category=accessories-lifestyle",
  lifestyle: "product.html?view=list&category=accessories-lifestyle",

  // Electronics & Devices
  electronics: "electronics.html",
  electronic: "electronics.html",
  smartphones: "electronics.html",
  smartphone: "electronics.html",
  mobiles: "electronics.html",
  mobile: "electronics.html",
  laptops: "electronics.html",
  laptop: "electronics.html",
  computers: "electronics.html",
  computer: "electronics.html",
  cameras: "electronics.html",
  camera: "electronics.html",
  gaming: "electronics.html",
  "smart-home": "electronics.html"
};

/**
 * Resolves the destination page for a given category name or slug.
 * If the category does not have a dedicated storefront page,
 * it safely falls back to "shop.html" (the main shop/products catalog).
 *
 * @param {string} category - Category name, ID, or slug
 * @returns {string} - Relative target HTML page name (e.g. "electronics.html")
 */
export function getCategoryPage(category) {
  if (!category) return "shop.html";
  const slug = String(category)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return CATEGORY_PAGE_MAP[slug] || "shop.html";
}

/**
 * Returns a user-friendly label for back buttons (e.g. "Back to Electronics").
 *
 * @param {string} category - Category name, ID, or slug
 * @returns {string}
 */
export function getCategoryBackLabel(category) {
  if (!category) return "Back to Deals";
  const slug = String(category).trim().toLowerCase();
  if (slug === "cloths" || slug === "clothing" || slug === "clothes") {
    return "Back to Clothing";
  }
  if (slug === "fashion") {
    return "Back to Fashion";
  }
  if (slug === "gadgets") {
    return "Back to Gadgets";
  }
  if (slug === "speakers" || slug === "audio") {
    return "Back to Audio";
  }
  if (slug === "watches" || slug === "watch") {
    return "Back to Watches";
  }
  if (slug === "footwear") {
    return "Back to Footwear";
  }
  if (slug === "shoes") {
    return "Back to Shoes";
  }
  if (slug === "beauty") {
    return "Back to Beauty";
  }
  if (slug === "chairs" || slug === "furniture") {
    return "Back to Furniture";
  }
  if (slug === "home-appliances" || slug === "appliances") {
    return "Back to Home Appliances";
  }
  if (slug === "accessories-lifestyle" || slug === "accessories" || slug === "lifestyle") {
    return "Back to Accessories & Lifestyle";
  }
  if (
    slug === "electronics" ||
    slug === "smartphones" ||
    slug === "laptops" ||
    slug === "cameras" ||
    slug === "gaming" ||
    slug === "smart-home"
  ) {
    return "Back to Electronics";
  }
  return `Back to ${category}`;
}
