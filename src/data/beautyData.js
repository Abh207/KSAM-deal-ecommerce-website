import rawBeautyProducts from "../api/beautyProducts.json";
import { buildProductUid, slugify } from "../lib/cartHelper.js";

export const BEAUTY_DETAILS = {
  101: {
    description: "Brightening vitamin C serum for glowing and healthy-looking skin. Infused with 10% pure ascorbic acid, hyaluronic acid, and botanical extracts, this lightweight formula targets hyperpigmentation, uneven skin tone, and dullness to reveal a visibly radiant, youthful complexion.",
    features: [
      "10% Pure Vitamin C (L-Ascorbic Acid) with Ferulic Acid stability",
      "Micro-hyaluronic acid complex delivers 24-hour deep dermal hydration",
      "Fades dark spots, sun damage, and post-acne blemishes",
      "Dermatologist approved, non-comedogenic, and paraben-free",
      "Suitable for daily morning and evening use on all skin types"
    ],
    specs: {
      size: "30 ml (1.0 fl. oz.)",
      skinType: "All Skin Types (Hypoallergenic)",
      shelfLife: "24 Months from Mfd."
    },
    rating: 4.8,
    reviewsCount: 59
  },
  102: {
    description: "Lightweight moisturizing cream for soft and hydrated skin. Formulated with ceramides, squalane, and aloe leaf juice, it replenishes depleted skin barriers and locks in continuous moisture without clogging pores or feeling greasy.",
    features: [
      "Multi-ceramide complex restores and reinforces natural skin barrier",
      "Plant-derived squalane seals in moisture for up to 48 hours",
      "Fast-absorbing whipped texture with a velvety soft matte finish",
      "Free of artificial fragrances, mineral oils, and drying alcohol",
      "Clinically tested safe for sensitive and eczema-prone skin"
    ],
    specs: {
      size: "50 g (1.7 oz.)",
      skinType: "Dry, Normal & Sensitive Skin",
      shelfLife: "24 Months from Mfd."
    },
    rating: 4.9,
    reviewsCount: 64
  },
  103: {
    description: "Long-lasting matte lipstick with a smooth and comfortable finish. Delivering intense pigment in a single swipe, this weightless formula is enriched with vitamin E and jojoba oil to prevent flaking, feathering, or cracking throughout the day.",
    features: [
      "Ultra-pigmented payoff with full opacity in one glide",
      "Up to 12-hour transfer-proof and smudge-resistant wear",
      "Hydrating botanical oils keep lips supple and non-drying",
      "100% cruelty-free, vegan certified formulation",
      "Classic magnetic cap casing with sleek ergonomic grip"
    ],
    specs: {
      size: "3.8 g",
      skinType: "Velvet Matte Finish",
      shelfLife: "36 Months from Mfd."
    },
    rating: 4.7,
    reviewsCount: 52
  },
  104: {
    description: "Elegant floral fragrance with a fresh and long-lasting aroma. Opening with vibrant top notes of mandarin and bergamot, blossoming into a heart of French jasmine and Bulgarian rose, grounded by warm sandalwood and creamy vanilla.",
    features: [
      "Concentrated Eau de Parfum (EDP) with 18% fragrance oil density",
      "Enduring 14+ hour scent profile with graceful sillage",
      "Master-perfumer formulation using sustainably harvested florals",
      "Precision micro-atomizer nozzle for featherlight mist distribution",
      "Packaged in a heavy-base crystal flacon with gold-plated collar"
    ],
    specs: {
      size: "100 ml (3.4 fl. oz.)",
      skinType: "Long-Lasting Eau de Parfum",
      shelfLife: "36 Months from Mfd."
    },
    rating: 4.9,
    reviewsCount: 78
  },
  105: {
    description: "Gentle aloe vera face wash that cleanses without drying the skin. Packed with 99% pure organic aloe leaf juice and green tea antioxidants, it lifts away daily pollution, impurities, and excess oil while calming irritation.",
    features: [
      "pH-balanced 5.5 sulfate-free gel cleanser preserves natural acid mantle",
      "Rich in natural polysaccharides and soothing botanical enzymes",
      "Deep pore purification without stripping natural moisture",
      "Cooling mint and cucumber infusion soothes redness",
      "Hypoallergenic and ophthalmologist-safe for daily cleansing"
    ],
    specs: {
      size: "150 ml (5.1 fl. oz.)",
      skinType: "Sensitive, Oily & Acne-Prone Skin",
      shelfLife: "24 Months from Mfd."
    },
    rating: 4.8,
    reviewsCount: 47
  },
  106: {
    description: "Nourishing shampoo designed to strengthen and smooth damaged hair. Enriched with hydrolyzed plant keratin, argan oil, and biotin, it rebuilds fractured hair cuticles, seals split ends, and leaves tresses remarkably soft, shiny, and tangle-free.",
    features: [
      "Advanced micro-keratin repair technology strengthens hair fiber",
      "100% sulfate-free, silicone-free, and color-safe formula",
      "Restores natural elastic rebound and prevents thermal heat breakage",
      "Rich lather infused with Moroccan cold-pressed argan oil",
      "Safe for chemically straightened, bleached, and permed hair"
    ],
    specs: {
      size: "250 ml (8.4 fl. oz.)",
      skinType: "Damaged, Dry & Color-Treated Hair",
      shelfLife: "24 Months from Mfd."
    },
    rating: 4.7,
    reviewsCount: 53
  },
  107: {
    description: "Professional makeup brush set for smooth and precise application. Includes 10 handcrafted brushes featuring silky synthetic bristles, corrosion-resistant rose gold ferrules, and weighted ergonomic birch handles for seamless blending of powders, liquids, and creams.",
    features: [
      "10 essential face & eye brushes for complete cosmetic routines",
      "Ultra-soft, dense vegan Taklon bristles mimic natural hair",
      "Non-shedding bonded bristle construction with double crimp ferrules",
      "Easy to sanitize and wash with quick drying properties",
      "Includes designer waterproof faux-leather travel roll pouch"
    ],
    specs: {
      size: "10-Piece Professional Brush Set",
      skinType: "Ultra-Soft Synthetic Fibers",
      shelfLife: "Lifetime Manufacturer Guarantee"
    },
    rating: 4.9,
    reviewsCount: 68
  },
  108: {
    description: "Deep moisturizing body lotion for smooth and nourished skin. Formulated with unrefined shea butter, vitamin E, and jojoba seed oil, this quick-absorbing formula melts effortlessly into dry skin to deliver intense 24-hour nourishment with a radiant, healthy sheen.",
    features: [
      "24-hour intense lipid barrier nourishment and moisture retention",
      "Enriched with raw African shea butter and tocopherol vitamin E",
      "Non-greasy, fast-absorbing texture leaves zero residue on clothing",
      "Soothes flakiness, rough patches, and wind-chapped skin",
      "Hypoallergenic and free from harsh parabens or mineral oils"
    ],
    specs: {
      size: "200 ml (6.8 fl. oz.)",
      skinType: "Dry & Sensitive Skin (Quick-Absorbing)",
      shelfLife: "24 Months from Mfd."
    },
    rating: 4.8,
    reviewsCount: 49
  }
};

export const beautyProducts = rawBeautyProducts.map((p) => {
  const details = BEAUTY_DETAILS[p.id] || {};
  const uid = buildProductUid(p.category, p.id);
  return {
    ...p,
    uid,
    description: details.description || p.description,
    features: details.features || [
      "Dermatologically tested and hypoallergenic formulation",
      "Cruelty-free certified formulation (never tested on animals)",
      "Free from parabens, sulfates, phthalates, and synthetic dyes",
      "Enriched with botanical vitamins and active hydration complex",
      "Suitable for all skin types, including sensitive skin"
    ],
    specs: details.specs || {
      size: "Standard Size",
      skinType: "All Skin Types",
      shelfLife: "24 Months from Mfd."
    },
    rating: details.rating || 4.8,
    reviewsCount: details.reviewsCount || 50
  };
});

export function findBeautyProduct({ id, category, uid }) {
  if (uid) {
    const cleanUid = String(uid).trim().toLowerCase();
    const found = beautyProducts.find((p) => String(p.uid).trim().toLowerCase() === cleanUid);
    if (found) return found;
  }

  if (id !== undefined && id !== null) {
    const idStr = String(id).trim().toLowerCase();
    const found = beautyProducts.find((p) => String(p.id).trim().toLowerCase() === idStr);
    if (found) return found;
  }

  if (category) {
    const catSlug = slugify(category);
    const found = beautyProducts.find((p) => slugify(p.category) === catSlug);
    if (found) return found;
  }

  return null;
}

export function getRelatedBeautyProducts(currentProduct, count = 4) {
  if (!currentProduct) return beautyProducts.slice(0, count);

  const currentId = String(currentProduct.id).trim().toLowerCase();
  const currentCatSlug = slugify(currentProduct.category);

  // 1. Same category items (excluding current)
  const sameCat = beautyProducts.filter((p) => {
    return String(p.id).trim().toLowerCase() !== currentId && slugify(p.category) === currentCatSlug;
  });

  // 2. Other categories if need to fill up to count
  const others = beautyProducts.filter((p) => {
    return String(p.id).trim().toLowerCase() !== currentId && slugify(p.category) !== currentCatSlug;
  });

  return [...sameCat, ...others].slice(0, count);
}

export default beautyProducts;
