/**
 * Supabase Edge Functions Shared Category Definitions & Classifier
 * -------------------------------------------------------------
 * Canonical category rules for Deno runtime in Supabase Edge Functions.
 */

export interface CategoryTab {
  id: string;
  label: string;
  icon: string;
  canonical: string;
  keywords: string[];
  aliases?: string[];
}

export const CATEGORIES: CategoryTab[] = [
  {
    id: "all",
    label: "All",
    icon: "⚡",
    canonical: "All",
    keywords: []
  },
  {
    id: "clothes",
    label: "Clothes",
    icon: "👕",
    canonical: "Clothes",
    keywords: ["dress", "kurta", "shirt", "t-shirt", "jeans", "saree", "hoodie", "jacket", "top"],
    aliases: ["clothes", "clothing", "cloths", "apparel", "wear", "shirt", "kurti"]
  },
  {
    id: "watches",
    label: "Watches",
    icon: "⌚",
    canonical: "Watches",
    keywords: ["watch", "smartwatch"],
    aliases: ["watches", "watch", "smartwatch", "smartwatches"]
  },
  {
    id: "mobiles",
    label: "Mobiles",
    icon: "📱",
    canonical: "Mobiles",
    keywords: ["phone", "smartphone", "iphone", "galaxy", "redmi"],
    aliases: ["mobiles", "mobile", "smartphones", "smartphone", "phone", "phones"]
  },
  {
    id: "laptops",
    label: "Laptops",
    icon: "💻",
    canonical: "Laptops",
    keywords: ["laptop", "notebook", "macbook", "vivobook"],
    aliases: ["laptops", "laptop", "notebook", "notebooks", "macbook", "macbooks"]
  },
  {
    id: "audio",
    label: "Audio",
    icon: "🎧",
    canonical: "Audio",
    keywords: ["headphone", "earbuds", "speaker", "neckband", "soundbar"],
    aliases: ["audio", "headphones", "headphone", "earbuds", "speakers", "speaker", "soundbar"]
  },
  {
    id: "shoes",
    label: "Shoes",
    icon: "👟",
    canonical: "Shoes",
    keywords: ["shoe", "sneaker", "sandals", "slipper", "boots"],
    aliases: ["shoes", "shoe", "footwear", "sneakers", "sneaker", "boots"]
  },
  {
    id: "fashion",
    label: "Fashion",
    icon: "👗",
    canonical: "Fashion",
    keywords: ["bag", "wallet", "sunglasses", "belt", "jewellery"],
    aliases: ["fashion", "accessories"]
  },
  {
    id: "home",
    label: "Home",
    icon: "🏠",
    canonical: "Home",
    keywords: ["kitchen", "furniture", "lamp", "mixer", "bedsheet"],
    aliases: ["home", "home-appliances", "appliances", "kitchen", "furniture"]
  },
  {
    id: "gaming",
    label: "Gaming",
    icon: "🎮",
    canonical: "Gaming",
    keywords: ["gaming", "console", "controller", "keyboard", "mouse"],
    aliases: ["gaming", "games", "game"]
  },
  {
    id: "electronics",
    label: "Electronics",
    icon: "🔌",
    canonical: "Electronics",
    keywords: ["tv", "camera", "charger", "power bank", "router"],
    aliases: ["electronics", "electronic", "gadgets"]
  },
  {
    id: "beauty",
    label: "Beauty",
    icon: "💄",
    canonical: "Beauty",
    keywords: ["lipstick", "cream", "serum", "shampoo", "perfume", "makeup"],
    aliases: ["beauty", "skincare", "skin-care", "cosmetics"]
  }
];

function buildWordBoundaryPattern(patternStr: string): RegExp {
  return new RegExp(`(?<=^|[^\\w])${patternStr}(?=[^\\w]|$)`, "i");
}

export const CATEGORY_CLASSIFICATION_RULES = [
  {
    canonical: "Mobiles",
    patterns: [
      buildWordBoundaryPattern("smart\\s*phones?"),
      buildWordBoundaryPattern("iphones?"),
      buildWordBoundaryPattern("galaxy\\s+[asmoz]\\d+"),
      buildWordBoundaryPattern("redmi(\\s+note)?"),
      buildWordBoundaryPattern("oneplus"),
      buildWordBoundaryPattern("phones?")
    ]
  },
  {
    canonical: "Laptops",
    patterns: [
      buildWordBoundaryPattern("laptops?"),
      buildWordBoundaryPattern("macbooks?(\\s+(air|pro))?"),
      buildWordBoundaryPattern("notebooks?"),
      buildWordBoundaryPattern("vivobooks?"),
      buildWordBoundaryPattern("thinkpads?"),
      buildWordBoundaryPattern("chromebooks?")
    ]
  },
  {
    canonical: "Gaming",
    patterns: [
      buildWordBoundaryPattern("gam(ing|er)"),
      buildWordBoundaryPattern("consoles?"),
      buildWordBoundaryPattern("playstation|ps[45]|xbox"),
      buildWordBoundaryPattern("gamepad|controllers?"),
      buildWordBoundaryPattern("gaming\\s+(mouse|keyboard|headset)")
    ]
  },
  {
    canonical: "Watches",
    patterns: [
      buildWordBoundaryPattern("smart\\s*watch(es)?"),
      buildWordBoundaryPattern("chronographs?"),
      buildWordBoundaryPattern("analog\\s+watch(es)?"),
      buildWordBoundaryPattern("wrist\\s*watch(es)?"),
      buildWordBoundaryPattern("watch(es)?")
    ]
  },
  {
    canonical: "Audio",
    patterns: [
      buildWordBoundaryPattern("headphones?"),
      buildWordBoundaryPattern("earbuds?"),
      buildWordBoundaryPattern("earphones?"),
      buildWordBoundaryPattern("airpods?"),
      buildWordBoundaryPattern("neckbands?"),
      buildWordBoundaryPattern("soundbars?"),
      buildWordBoundaryPattern("speakers?")
    ]
  },
  {
    canonical: "Electronics",
    patterns: [
      buildWordBoundaryPattern("power\\s*banks?"),
      buildWordBoundaryPattern("chargers?"),
      buildWordBoundaryPattern("routers?"),
      buildWordBoundaryPattern("cameras?"),
      buildWordBoundaryPattern("smart\\s*tvs?"),
      buildWordBoundaryPattern("tvs?|televisions?")
    ]
  },
  {
    canonical: "Shoes",
    patterns: [
      buildWordBoundaryPattern("sneakers?"),
      buildWordBoundaryPattern("sandals?"),
      buildWordBoundaryPattern("slippers?"),
      buildWordBoundaryPattern("boots?"),
      buildWordBoundaryPattern("loafers?"),
      buildWordBoundaryPattern("shoes?")
    ]
  },
  {
    canonical: "Clothes",
    patterns: [
      buildWordBoundaryPattern("t-?shirts?"),
      buildWordBoundaryPattern("shirts?"),
      buildWordBoundaryPattern("kurt[ai]s?"),
      buildWordBoundaryPattern("dress(es)?"),
      buildWordBoundaryPattern("jeans?"),
      buildWordBoundaryPattern("sar[ei](es)?"),
      buildWordBoundaryPattern("hoodies?"),
      buildWordBoundaryPattern("jackets?"),
      buildWordBoundaryPattern("trousers?"),
      buildWordBoundaryPattern("pants?"),
      buildWordBoundaryPattern("tops?")
    ]
  },
  {
    canonical: "Fashion",
    patterns: [
      buildWordBoundaryPattern("sunglass(es)?"),
      buildWordBoundaryPattern("wallets?"),
      buildWordBoundaryPattern("handbags?|backpacks?|bags?"),
      buildWordBoundaryPattern("belts?"),
      buildWordBoundaryPattern("jeweller?y"),
      buildWordBoundaryPattern("necklace|earrings|bangle")
    ]
  },
  {
    canonical: "Beauty",
    patterns: [
      buildWordBoundaryPattern("lipsticks?"),
      buildWordBoundaryPattern("serums?"),
      buildWordBoundaryPattern("shampoos?"),
      buildWordBoundaryPattern("perfumes?|fragrance"),
      buildWordBoundaryPattern("make-?up"),
      buildWordBoundaryPattern("face\\s+cream|body\\s+lotion|creams?")
    ]
  },
  {
    canonical: "Home",
    patterns: [
      buildWordBoundaryPattern("kitchen"),
      buildWordBoundaryPattern("furniture"),
      buildWordBoundaryPattern("lamps?"),
      buildWordBoundaryPattern("mixers?|grinders?"),
      buildWordBoundaryPattern("bed\\s*sheets?"),
      buildWordBoundaryPattern("curtains?|cushions?"),
      buildWordBoundaryPattern("cookware|pan|cooker")
    ]
  }
];

export function normalizeCategoryName(raw?: unknown): string | null {
  if (!raw || typeof raw !== "string") return null;
  const clean = raw.trim().toLowerCase();
  if (!clean || clean === "general" || clean === "deals" || clean === "search" || clean === "all") {
    return null;
  }

  for (const tab of CATEGORIES) {
    if (tab.canonical === "All") continue;
    if (tab.canonical.toLowerCase() === clean) return tab.canonical;
    if (tab.id.toLowerCase() === clean) return tab.canonical;
    if (tab.aliases && tab.aliases.some((a) => a.toLowerCase() === clean)) {
      return tab.canonical;
    }
  }

  return null;
}

export function classifyProduct(titleOrText: unknown, existingCategory?: unknown): string {
  if (existingCategory && typeof existingCategory === "string") {
    const norm = normalizeCategoryName(existingCategory);
    if (norm) return norm;
  }

  const text = String(titleOrText || "").trim();
  if (!text) return "General";

  for (const rule of CATEGORY_CLASSIFICATION_RULES) {
    for (const pat of rule.patterns) {
      if (pat.test(text)) {
        return rule.canonical;
      }
    }
  }

  return "General";
}
