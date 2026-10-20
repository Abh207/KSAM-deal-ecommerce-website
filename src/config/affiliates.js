/**
 * KSAM Deal - Enabled Affiliate Programs Configuration
 * Add program identifiers (e.g. "amazon", "flipkart", "cuelinks") here once approved.
 * Empty by default as requested.
 */
export const ENABLED_AFFILIATES = [];

export const AFFILIATE_STATEMENTS = {
  amazon: {
    name: "Amazon India Associates Program",
    statement: "As an Amazon Associate, KSAM Deal earns from qualifying purchases made through affiliate links on this site."
  },
  flipkart: {
    name: "Flipkart Affiliate Program",
    statement: "KSAM Deal participates in the Flipkart Affiliate Program, an affiliate marketing program designed to provide a means for sites to earn advertising fees by linking to Flipkart.com."
  },
  cuelinks: {
    name: "Cuelinks / Affiliate Network",
    statement: "KSAM Deal partners with verified affiliate networks to direct users to partner retailers (including Myntra, AJIO, Croma, and others) and may earn commissions on qualifying purchases."
  }
};
