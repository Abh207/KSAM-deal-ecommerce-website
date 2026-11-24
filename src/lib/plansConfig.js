/**
 * KSAM DEAL - SHARED PLANS CONFIGURATION
 * Single source of truth for membership plans across Pricing, Checkout, and Profile.
 */

export const PLANS = [
  {
    id: "explorer",
    slug: "explorer",
    name: "Explorer",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "For discovering deals.",
    icon: "compass",
    accent: "#38BDF8",
    features: [
      "Deal discovery",
      "Product search",
      "Category filters",
      "External store links"
    ],
    popular: false
  },
  {
    id: "deal-hunter",
    slug: "deal-hunter",
    name: "Deal Hunter",
    monthlyPrice: 99,
    yearlyPrice: 950, // 20% discount: ~₹79/mo billed yearly
    description: "For frequent deal hunters.",
    icon: "flame",
    accent: "#8cff00",
    features: [
      "Everything in Explorer",
      "Deal alerts",
      "Saved products",
      "Price tracking"
    ],
    popular: true
  },
  {
    id: "pro",
    slug: "pro",
    name: "Pro",
    monthlyPrice: 199,
    yearlyPrice: 1910, // 20% discount: ~₹159/mo billed yearly
    description: "For advanced shoppers.",
    icon: "crown",
    accent: "#A855F7",
    features: [
      "Everything in Deal Hunter",
      "Advanced tracking",
      "Personalized recommendations",
      "AI-powered discovery"
    ],
    popular: false
  }
];

export const GST_RATE = 0.18; // 18% GST

/**
 * Normalizes plan slug from various input formats.
 */
export function normalizePlanSlug(input) {
  if (!input || typeof input !== "string") return "explorer";
  const clean = input.trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (clean.includes("pro")) return "pro";
  if (clean.includes("hunter") || clean.includes("deal")) return "deal-hunter";
  return "explorer";
}

/**
 * Retrieves plan definition by slug or name.
 */
export function getPlanBySlug(slugOrName) {
  const norm = normalizePlanSlug(slugOrName);
  return PLANS.find((p) => p.slug === norm) || PLANS[0];
}

/**
 * Calculates plan price, GST, and grand total.
 */
export function calculatePlanPricing(planSlug, billingCycle = "monthly") {
  const plan = getPlanBySlug(planSlug);
  const isYearly = billingCycle === "yearly";
  const basePrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

  if (basePrice === 0) {
    return {
      plan,
      isYearly,
      basePrice: 0,
      subtotal: 0,
      gstAmount: 0,
      totalAmount: 0,
      monthlyEquivalent: 0,
      savingsAmount: 0
    };
  }

  // Prices are inclusive of GST or exclusive: we provide transparent itemization
  // Standard digital goods breakdown: subtotal + 18% GST = totalAmount
  const subtotal = Math.round((basePrice / (1 + GST_RATE)) * 100) / 100;
  const gstAmount = Math.round((basePrice - subtotal) * 100) / 100;
  const totalAmount = basePrice;
  const monthlyEquivalent = isYearly ? Math.round(basePrice / 12) : basePrice;
  const savingsAmount = isYearly ? Math.max(0, (plan.monthlyPrice * 12) - plan.yearlyPrice) : 0;

  return {
    plan,
    isYearly,
    basePrice,
    subtotal,
    gstAmount,
    totalAmount,
    monthlyEquivalent,
    savingsAmount
  };
}

/**
 * Checks tier hierarchy: explorer (0) < deal-hunter (1) < pro (2)
 */
export function getPlanTierLevel(slugOrName) {
  const norm = normalizePlanSlug(slugOrName);
  if (norm === "pro") return 2;
  if (norm === "deal-hunter") return 1;
  return 0;
}

export function isHigherTier(currentSlug, targetSlug) {
  return getPlanTierLevel(targetSlug) > getPlanTierLevel(currentSlug);
}

export function isSameTier(currentSlug, targetSlug) {
  return getPlanTierLevel(currentSlug) === getPlanTierLevel(targetSlug);
}

/**
 * Upgrade rule helper: default rule is "new plan starts today, full price"
 */
export function getUpgradeNotice(activeSub, targetPlanSlug) {
  if (!activeSub || !activeSub.plan_slug) return null;
  const currentSlug = normalizePlanSlug(activeSub.plan_slug);
  const targetSlug = normalizePlanSlug(targetPlanSlug);

  if (currentSlug === targetSlug) {
    return {
      type: "same",
      message: `You are currently on the ${getPlanBySlug(targetSlug).name} plan.`
    };
  }

  if (isHigherTier(currentSlug, targetSlug)) {
    return {
      type: "upgrade",
      currentPlanName: getPlanBySlug(currentSlug).name,
      targetPlanName: getPlanBySlug(targetSlug).name,
      message: `Upgrading from ${getPlanBySlug(currentSlug).name} to ${getPlanBySlug(targetSlug).name}. New billing cycle begins today at standard plan pricing with immediate unlock of all higher tier perks.`
    };
  }

  return null;
}
