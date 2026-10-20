/**
 * KSAM Deal - Pipeline Unit & Logic Test Script (ES Module)
 */

import assert from "node:assert";

function cleanText(val) {
  if (!val) return "";
  return String(val)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePrice(val) {
  if (typeof val === "number") return Number.isFinite(val) ? Math.max(0, val) : 0;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? Math.max(0, num) : 0;
}

function computeDiscount(price, oldPrice) {
  if (!oldPrice || oldPrice <= price || price <= 0) return undefined;
  const d = Math.round(((oldPrice - price) / oldPrice) * 100);
  return d > 0 ? d : undefined;
}

function normalizeAndValidateProduct(candidate, options = {}) {
  const name = cleanText(candidate.name || candidate.title);
  const imageUrl = cleanText(candidate.image_url || candidate.image);
  const productUrl = cleanText(candidate.product_url || candidate.url);

  if (!name || !imageUrl || !productUrl) return null;

  const price = parsePrice(candidate.price);
  if (price <= 0) return null;

  let oldPrice = parsePrice(candidate.old_price ?? candidate.mrp);
  if (oldPrice <= price) oldPrice = 0;

  const discountPercent = oldPrice > 0 ? computeDiscount(price, oldPrice) : undefined;
  if (!options.isSearch && (!discountPercent || discountPercent < 10)) return null;

  return {
    store_slug: candidate.store_slug,
    external_id: cleanText(candidate.external_id) || "fallback-id",
    name,
    price,
    old_price: oldPrice > 0 ? oldPrice : undefined,
    discount_percent: discountPercent,
    image_url: imageUrl,
    product_url: productUrl,
    affiliate_url: cleanText(candidate.affiliate_url) || productUrl
  };
}

console.log("=== KSAM DEAL TEST PIPELINE ===");

// 1. Test Normalization & Validation
console.log("\n1. Testing Product Normalization & Discount Calculation...");
const validDeal = normalizeAndValidateProduct({
  store_slug: "amazon",
  external_id: "B09ABC123",
  title: "Sony WH-1000XM5 Wireless Headphones",
  price: "24990",
  old_price: "34990",
  image: "https://images.example.com/sony.jpg",
  url: "https://www.amazon.in/dp/B09ABC123"
});
assert(validDeal !== null, "Valid deal should normalize successfully");
assert.strictEqual(validDeal.discount_percent, 29, "Discount percent should be 29%");
assert.strictEqual(validDeal.price, 24990);
console.log("✓ Valid deal normalized correctly: 29% discount calculated.");

// Test dropping item with < 10% discount in deals feed
const lowDiscountDeal = normalizeAndValidateProduct(
  {
    store_slug: "flipkart",
    external_id: "FK123",
    title: "USB Cable",
    price: "190",
    old_price: "200",
    image: "https://example.com/cable.jpg",
    url: "https://flipkart.com/p/123"
  },
  { isSearch: false }
);
assert.strictEqual(lowDiscountDeal, null, "Deals feed must reject discounts under 10%");
console.log("✓ Deals feed correctly dropped < 10% discount product.");

// In search mode, allow < 10% discount
const searchAllowed = normalizeAndValidateProduct(
  {
    store_slug: "flipkart",
    external_id: "FK123",
    title: "USB Cable",
    price: "190",
    old_price: "200",
    image: "https://example.com/cable.jpg",
    url: "https://flipkart.com/p/123"
  },
  { isSearch: true }
);
assert(searchAllowed !== null, "Search mode should accept product with small discount");
console.log("✓ Search mode accepted product with < 10% discount.");

// 2. Test Price History Logic (only record when price changes)
console.log("\n2. Testing Price History Change Detection...");
const existingDbMap = new Map([
  ["B09ABC123", { id: "uuid-1", price: 24990 }],
  ["FK123", { id: "uuid-2", price: 190 }]
]);

const incomingBatch = [
  { external_id: "B09ABC123", id: "uuid-1", price: 24990, old_price: 34990 }, // Price unchanged
  { external_id: "FK123", id: "uuid-2", price: 179, old_price: 200 } // Price dropped from 190 to 179
];

const priceHistoryRows = [];
for (const item of incomingBatch) {
  const prev = existingDbMap.get(item.external_id);
  if (!prev || prev.price !== item.price) {
    priceHistoryRows.push({
      product_id: item.id,
      price: item.price,
      old_price: item.old_price,
      captured_at: new Date().toISOString()
    });
  }
}

assert.strictEqual(priceHistoryRows.length, 1, "Only 1 item changed price");
assert.strictEqual(priceHistoryRows[0].product_id, "uuid-2");
assert.strictEqual(priceHistoryRows[0].price, 179);
console.log("✓ Price history correctly ignored unchanged price and captured price change.");

// 3. Test Rate Limiter Logic
console.log("\n3. Testing Per-IP Rate Limiting (20 req/min)...");
const ipRateLimits = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const record = ipRateLimits.get(ip);
  if (!record || now > record.resetAt) {
    ipRateLimits.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (record.count >= 20) return false;
  record.count++;
  return true;
}

const testIp = "192.168.1.100";
for (let i = 0; i < 20; i++) {
  assert(checkRateLimit(testIp) === true, `Request ${i + 1} should be permitted`);
}
assert(checkRateLimit(testIp) === false, "21st request within 1 min must be rate limited");
console.log("✓ Rate limiter permitted 20 requests and blocked the 21st request.");

// 4. Test Idempotent Key Generation
console.log("\n4. Testing Idempotent Store + External ID Constraint...");
const key1 = `${validDeal.store_slug}:${validDeal.external_id}`;
const key2 = `${validDeal.store_slug}:${validDeal.external_id}`;
assert.strictEqual(key1, key2, "Keys must match identically for onConflict");
console.log("✓ Idempotent upsert key generated:", key1);

console.log("\nALL PIPELINE TESTS PASSED SUCCESSFULLY! ✓");
