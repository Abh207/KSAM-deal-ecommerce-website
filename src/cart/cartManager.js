/**
 * KSAM DEAL - MODERN E-COMMERCE CART MANAGER
 * Senior front-end implementation: centralized calculation architecture,
 * quantity bounds (1-10), coupons, wishlist sync, save-for-later,
 * delivery address, animated counts, toast notifications, and mobile sticky bar.
 */

import { supabase } from "../lib/supabase.js";
import { getStoredSessionSync, BASE_URL } from "../auth/auth.js";
import {
  getNormalizedCart,
  resolveImagePath,
  DEFAULT_PLACEHOLDER_IMAGE,
  CART_STORAGE_KEY
} from "../lib/cartHelper.js";
import { toggleWishlist, isInWishlist } from "../lib/wishlist.js";

// Storage Keys
export const SAVED_FOR_LATER_KEY = "ksam_saved_for_later";
export const APPLIED_COUPON_KEY = "ksam_applied_coupon";
export const SELECTED_ADDRESS_KEY = "ksam_selected_address";
export const FREE_DELIVERY_THRESHOLD = 999;
export const STANDARD_DELIVERY_FEE = 49;
export const MAX_ITEM_QUANTITY = 10;

// Verified Promotion Coupons
export const AVAILABLE_COUPONS = {
  KSAM10: {
    code: "KSAM10",
    type: "percent",
    value: 10,
    maxDiscount: 500,
    minOrder: 0,
    description: "10% Instant Discount up to ₹500 on all orders"
  },
  WELCOME50: {
    code: "WELCOME50",
    type: "flat",
    value: 50,
    maxDiscount: 50,
    minOrder: 499,
    description: "Flat ₹50 OFF on orders above ₹499"
  },
  MEGA20: {
    code: "MEGA20",
    type: "percent",
    value: 20,
    maxDiscount: 1000,
    minOrder: 2999,
    description: "20% Super Discount up to ₹1,000 on orders above ₹2,999"
  }
};

let lastRemovedItem = null;
let toastTimeout = null;
let currentDeliveryAddress = null;

/* =============================================================================
   1. SELF-HEALING IMAGE RESOLVER
   ============================================================================= */

/**
 * Resolves product image with self-healing to prevent watch/shoe path mismatches.
 */
export function resolveSafeProductImage(product) {
  const name = String(product?.name || product?.title || "").toLowerCase();
  const category = String(product?.category || "").toLowerCase();
  let img = product?.image || product?.img || product?.src || "";

  // Healing rule: If product is a watch but image contains 'shoe', fix with genuine watch image
  if ((name.includes("watch") || category.includes("watch")) && (String(img).includes("shoe") || !img)) {
    img = "/products/watch1.png";
  }

  // Healing rule: If product is a shoe but image contains 'watch', fix with shoe image
  if ((name.includes("shoe") || name.includes("sneaker") || category.includes("shoe")) && String(img).includes("watch")) {
    img = "/products/shoes/shoe1.png";
  }

  return resolveImagePath(img);
}

/* =============================================================================
   2. CENTRALIZED CALCULATION ARCHITECTURE
   ============================================================================= */

/**
 * Calculates a complete, single-source-of-truth shopping cart summary.
 */
export function calculateCartSummary(cartItems = [], couponCode = null, deliveryAddress = null) {
  const items = Array.isArray(cartItems) ? cartItems : [];

  let totalQuantity = 0;
  let originalCartTotal = 0;
  let discountedSubtotal = 0;

  items.forEach((item) => {
    const qty = Math.max(1, Number(item.quantity || item.qty || 1));
    const price = Math.max(0, Number(item.price || 0));

    // Resolve original MRP without fabricating discounts:
    const rawOld = Number(item.oldPrice || item.originalPrice || item.old_price || item.mrp || 0);
    const oldPrice = rawOld > price ? rawOld : price;

    totalQuantity += qty;
    discountedSubtotal += price * qty;
    originalCartTotal += oldPrice * qty;
  });

  // Product Savings
  const productSavings = Math.max(0, originalCartTotal - discountedSubtotal);

  // Coupon Discount
  let couponDiscount = 0;
  let couponApplied = false;
  let appliedCouponMeta = null;

  const codeStr = typeof couponCode === "string" ? couponCode.trim().toUpperCase() : couponCode?.code?.toUpperCase();

  if (codeStr && AVAILABLE_COUPONS[codeStr] && discountedSubtotal > 0) {
    const cMeta = AVAILABLE_COUPONS[codeStr];
    if (discountedSubtotal >= (cMeta.minOrder || 0)) {
      if (cMeta.type === "percent") {
        couponDiscount = Math.min((discountedSubtotal * cMeta.value) / 100, cMeta.maxDiscount);
      } else if (cMeta.type === "flat") {
        couponDiscount = Math.min(cMeta.value, discountedSubtotal);
      }
      couponDiscount = Math.round(couponDiscount);
      couponApplied = true;
      appliedCouponMeta = cMeta;
    }
  }

  // Eligible Subtotal after Coupon
  const subtotalAfterCoupon = Math.max(0, discountedSubtotal - couponDiscount);

  // Estimated GST (MRP-Inclusive 5%)
  const taxRate = 0.05;
  const estimatedTax = Math.round(subtotalAfterCoupon * taxRate);

  // Delivery Charges (Free if subtotal >= 999, else 49)
  const isFreeDelivery = discountedSubtotal >= FREE_DELIVERY_THRESHOLD || discountedSubtotal === 0;
  const deliveryFee = isFreeDelivery ? 0 : STANDARD_DELIVERY_FEE;
  const deliverySavings = (isFreeDelivery && discountedSubtotal > 0) ? STANDARD_DELIVERY_FEE : 0;

  // Free delivery progress (capped at 100%)
  const freeDeliveryProgress = Math.min(100, Math.round((discountedSubtotal / FREE_DELIVERY_THRESHOLD) * 100));
  const freeDeliveryRemaining = Math.max(0, FREE_DELIVERY_THRESHOLD - discountedSubtotal);

  // Final Payable Amount
  const finalPayableAmount = items.length === 0 ? 0 : Math.max(0, subtotalAfterCoupon + deliveryFee);

  // Total Customer Savings (Product Discount + Coupon Discount + Waived Delivery Fee)
  const totalSavings = productSavings + couponDiscount + deliverySavings;

  return {
    totalQuantity,
    itemCount: items.length,
    originalCartTotal,
    discountedSubtotal,
    productSavings,
    couponDiscount,
    couponApplied,
    appliedCouponMeta,
    estimatedTax,
    taxRatePercentage: 5,
    deliveryFee,
    deliverySavings,
    isFreeDelivery,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    freeDeliveryProgress,
    freeDeliveryRemaining,
    totalSavings,
    finalPayableAmount,
    deliveryAddress
  };
}

/* =============================================================================
   3. DATA STORAGE & SYNC
   ============================================================================= */

export function getCart() {
  const rawCart = getNormalizedCart();
  // Ensure healing of images in cart
  return rawCart.map((item) => ({
    ...item,
    image: resolveSafeProductImage(item)
  }));
}

export function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.error("Failed to save cart to localStorage:", err);
  }
}

export function getSavedForLater() {
  try {
    const raw = localStorage.getItem(SAVED_FOR_LATER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveSavedForLater(items) {
  try {
    localStorage.setItem(SAVED_FOR_LATER_KEY, JSON.stringify(items));
  } catch (err) {}
}

export function getStoredCoupon() {
  try {
    return localStorage.getItem(APPLIED_COUPON_KEY) || "";
  } catch (err) {
    return "";
  }
}

export function setStoredCoupon(code) {
  try {
    if (code) {
      localStorage.setItem(APPLIED_COUPON_KEY, code.toUpperCase());
    } else {
      localStorage.removeItem(APPLIED_COUPON_KEY);
    }
  } catch (err) {}
}

export function formatINR(amount) {
  const num = Math.round(Number(amount || 0));
  return `₹${num.toLocaleString("en-IN")}`;
}

/* =============================================================================
   4. DELIVERY ADDRESS RESOLUTION
   ============================================================================= */

export async function resolveDeliveryAddress() {
  try {
    const cached = localStorage.getItem(SELECTED_ADDRESS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.full_name && parsed.line1) {
        return parsed;
      }
    }
  } catch (e) {}

  const session = getStoredSessionSync();
  if (session?.user?.id) {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", session.user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const addr = data[0];
        const normalized = {
          label: addr.label || "Home",
          full_name: addr.full_name || session.user.user_metadata?.full_name || "Customer",
          phone: addr.phone || "",
          line1: addr.line1 || "",
          line2: addr.line2 || "",
          landmark: addr.landmark || "",
          city: addr.city || "",
          state: addr.state || "",
          pincode: addr.pincode || "",
          country: addr.country || "India"
        };
        localStorage.setItem(SELECTED_ADDRESS_KEY, JSON.stringify(normalized));
        return normalized;
      }
    } catch (err) {}
  }

  return null;
}

/* =============================================================================
   5. TOAST NOTIFICATION UTILITY
   ============================================================================= */

export function showCartToast(message, actionText = null, onAction = null, duration = 5000) {
  let toastEl = document.getElementById("cartToast");
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.id = "cartToast";
    toastEl.className = "cart-toast-pill";
    document.body.appendChild(toastEl);
  }

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastEl.innerHTML = `
    <span class="cart-toast-msg">${message}</span>
    ${actionText ? `<button type="button" class="cart-toast-btn" id="cartToastAction">${actionText}</button>` : ""}
  `;

  if (actionText && onAction) {
    const btn = document.getElementById("cartToastAction");
    if (btn) {
      btn.addEventListener("click", () => {
        onAction();
        toastEl.classList.remove("visible");
      });
    }
  }

  toastEl.classList.add("visible");

  toastTimeout = setTimeout(() => {
    toastEl.classList.remove("visible");
  }, duration);
}

/* =============================================================================
   6. CART ACTIONS (Quantity, Remove, Save for Later, Wishlist)
   ============================================================================= */

export function updateItemQuantity(productId, delta) {
  const cart = getCart();
  const index = cart.findIndex((item) => String(item.id) === String(productId));
  if (index === -1) return;

  const currentQty = Number(cart[index].quantity || cart[index].qty || 1);
  const newQty = currentQty + delta;

  if (newQty < 1) {
    return; // Stepper min is 1
  }

  if (newQty > MAX_ITEM_QUANTITY) {
    showCartToast(`Maximum limit of ${MAX_ITEM_QUANTITY} items reached for this product.`);
    return;
  }

  cart[index].quantity = newQty;
  cart[index].qty = newQty;
  saveCart(cart);
  renderAll();
}

export function removeItemFromCart(productId, showUndo = true) {
  const cart = getCart();
  const itemToRemove = cart.find((item) => String(item.id) === String(productId));
  if (!itemToRemove) return;

  // Add exit animation to card if present
  const cardEl = document.querySelector(`.shop-cart-product[data-id="${productId}"]`);
  if (cardEl) {
    cardEl.classList.add("card-removing");
  }

  setTimeout(() => {
    lastRemovedItem = itemToRemove;
    const newCart = cart.filter((item) => String(item.id) !== String(productId));
    saveCart(newCart);
    renderAll();

    if (showUndo) {
      showCartToast(
        `Removed "${itemToRemove.name.slice(0, 24)}..." from cart`,
        "Undo",
        () => {
          if (lastRemovedItem) {
            const current = getCart();
            current.push(lastRemovedItem);
            saveCart(current);
            lastRemovedItem = null;
            renderAll();
            showCartToast("Item restored to your cart");
          }
        },
        5000
      );
    }
  }, 240);
}

export function saveItemForLater(productId) {
  const cart = getCart();
  const item = cart.find((i) => String(i.id) === String(productId));
  if (!item) return;

  const cardEl = document.querySelector(`.shop-cart-product[data-id="${productId}"]`);
  if (cardEl) {
    cardEl.classList.add("card-removing");
  }

  setTimeout(() => {
    const newCart = cart.filter((i) => String(i.id) !== String(productId));
    saveCart(newCart);

    const saved = getSavedForLater();
    if (!saved.some((s) => String(s.id) === String(productId))) {
      saved.unshift(item);
      saveSavedForLater(saved);
    }

    renderAll();
    showCartToast(`Moved "${item.name.slice(0, 24)}..." to Saved for Later`);
  }, 240);
}

export function moveItemToCart(productId) {
  const saved = getSavedForLater();
  const item = saved.find((i) => String(i.id) === String(productId));
  if (!item) return;

  const newSaved = saved.filter((i) => String(i.id) !== String(productId));
  saveSavedForLater(newSaved);

  const cart = getCart();
  const existing = cart.find((c) => String(c.id) === String(productId));
  if (existing) {
    const curQty = Number(existing.quantity || 1);
    existing.quantity = Math.min(MAX_ITEM_QUANTITY, curQty + 1);
    existing.qty = existing.quantity;
  } else {
    cart.unshift(item);
  }
  saveCart(cart);

  renderAll();
  showCartToast(`Moved "${item.name.slice(0, 24)}..." to Cart`);
}

export function removeSavedItem(productId) {
  const saved = getSavedForLater();
  const newSaved = saved.filter((i) => String(i.id) !== String(productId));
  saveSavedForLater(newSaved);
  renderSavedForLater();
  showCartToast("Removed item from Saved for Later");
}

export async function moveItemToWishlist(productId) {
  const cart = getCart();
  const item = cart.find((i) => String(i.id) === String(productId));
  if (!item) return;

  // Add to wishlist if not already saved
  if (!isInWishlist(item)) {
    await toggleWishlist(item);
  }

  // Remove from cart without generic remove toast
  removeItemFromCart(productId, false);
  showCartToast(`Moved "${item.name.slice(0, 24)}..." to your Wishlist ❤️`);
}

/* =============================================================================
   7. COUPON ACTIONS & MODAL
   ============================================================================= */

export function applyCouponCode(rawInput) {
  const code = (rawInput || "").trim().toUpperCase();
  const couponMsgEl = document.getElementById("couponFeedbackMsg");
  const applyBtn = document.getElementById("btnApplyCoupon");

  if (!code) {
    if (couponMsgEl) {
      couponMsgEl.textContent = "Please enter a coupon code.";
      couponMsgEl.className = "coupon-feedback-msg error shake";
    }
    return;
  }

  const currentCoupon = getStoredCoupon();
  if (currentCoupon === code) {
    if (couponMsgEl) {
      couponMsgEl.textContent = `Coupon ${code} is already applied.`;
      couponMsgEl.className = "coupon-feedback-msg info";
    }
    return;
  }

  const coupon = AVAILABLE_COUPONS[code];
  if (!coupon) {
    if (couponMsgEl) {
      couponMsgEl.textContent = `Invalid coupon code. Try KSAM10 for 10% off.`;
      couponMsgEl.className = "coupon-feedback-msg error shake";
    }
    return;
  }

  const cart = getCart();
  const summary = calculateCartSummary(cart, code);

  if (summary.discountedSubtotal < (coupon.minOrder || 0)) {
    if (couponMsgEl) {
      couponMsgEl.textContent = `Coupon valid on orders above ${formatINR(coupon.minOrder)}.`;
      couponMsgEl.className = "coupon-feedback-msg error shake";
    }
    return;
  }

  // Visual apply spinner feedback
  if (applyBtn) {
    applyBtn.classList.add("loading");
    applyBtn.textContent = "APPLYING...";
  }

  setTimeout(() => {
    setStoredCoupon(code);
    renderAll();
    showCartToast(`🎉 Coupon "${code}" applied! You saved ${formatINR(summary.couponDiscount)}`);
  }, 260);
}

export function removeCouponCode() {
  const couponMsgEl = document.getElementById("couponFeedbackMsg");
  setStoredCoupon("");
  renderAll();

  if (couponMsgEl) {
    couponMsgEl.textContent = "Coupon removed.";
    couponMsgEl.className = "coupon-feedback-msg info";
    setTimeout(() => {
      if (couponMsgEl) couponMsgEl.textContent = "";
    }, 2500);
  }
  showCartToast("Coupon removed from your order");
}

export function openCouponsModal() {
  let modalEl = document.getElementById("cartCouponsModal");
  if (!modalEl) {
    modalEl = document.createElement("div");
    modalEl.id = "cartCouponsModal";
    modalEl.className = "cart-modal-backdrop";
    document.body.appendChild(modalEl);
  }

  const activeCoupon = getStoredCoupon();

  modalEl.innerHTML = `
    <div class="cart-modal-box">
      <div class="cart-modal-header">
        <div class="cart-modal-title-row">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="modal-tag-icon"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          <h3>Available Coupons & Offers</h3>
        </div>
        <button type="button" class="btn-close-modal" id="btnCloseCouponModal" aria-label="Close modal">✕</button>
      </div>

      <div class="cart-modal-content">
        ${Object.values(AVAILABLE_COUPONS)
          .map((c) => {
            const isApplied = activeCoupon === c.code;
            return `
            <div class="modal-coupon-ticket ${isApplied ? 'applied' : ''}">
              <div class="ticket-left">
                <span class="ticket-badge">${c.code}</span>
                <p class="ticket-desc">${c.description}</p>
                <small class="ticket-terms">${c.minOrder > 0 ? `Valid on orders above ${formatINR(c.minOrder)}` : "No minimum order requirement"}</small>
              </div>
              <div class="ticket-right">
                ${
                  isApplied
                    ? `<span class="ticket-applied-lbl">APPLIED ✓</span>`
                    : `<button type="button" class="btn-apply-ticket" data-code="${c.code}">APPLY</button>`
                }
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
    </div>
  `;

  modalEl.classList.add("visible");

  document.getElementById("btnCloseCouponModal")?.addEventListener("click", () => {
    modalEl.classList.remove("visible");
  });

  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) modalEl.classList.remove("visible");
  });

  modalEl.querySelectorAll(".btn-apply-ticket").forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = btn.dataset.code;
      applyCouponCode(code);
      modalEl.classList.remove("visible");
    });
  });
}

/* =============================================================================
   8. UI RENDERING
   ============================================================================= */

export async function renderAll() {
  const cart = getCart();
  const appliedCode = getStoredCoupon();

  if (!currentDeliveryAddress) {
    currentDeliveryAddress = await resolveDeliveryAddress();
  }

  const summary = calculateCartSummary(cart, appliedCode, currentDeliveryAddress);

  renderPageHeader(summary);
  renderCartItems(cart, summary);
  renderSavedForLater();
  renderAddressCard(summary.deliveryAddress);
  renderCouponSection(summary);
  renderOrderSummary(summary);
  renderMobileStickyBar(summary);
}

/**
 * Renders consistent page header counts & breadcrumbs
 */
function renderPageHeader(summary) {
  const headerCount = document.getElementById("headerCartCount");
  const yourItemsCount = document.getElementById("yourItemsCountBadge");

  const totalQty = summary.totalQuantity;
  const distinctCount = summary.itemCount;

  if (headerCount) {
    headerCount.textContent = `${totalQty} ${totalQty === 1 ? "item" : "items"}`;
  }
  if (yourItemsCount) {
    yourItemsCount.textContent = `${distinctCount} ${distinctCount === 1 ? "product" : "products"} (${totalQty} items)`;
  }
}

/**
 * Renders the primary "Your Items" list
 */
function renderCartItems(cart, summary) {
  const container = document.getElementById("productCartContainer");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="shop-cart-empty">
        <div class="shop-cart-empty-icon">
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="21" r="1"></circle>
            <circle cx="19" cy="21" r="1"></circle>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
          </svg>
        </div>
        <h2>Your Shopping Cart is Empty</h2>
        <p>Looks like you haven't added anything to your cart yet. Explore our top deals, verified electronics, luxury watches, and curated fashion!</p>
        <a href="./shop.html" class="shop-empty-continue-btn">
          <span>Start Shopping</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  cart.forEach((product) => {
    const qty = Math.max(1, Number(product.quantity || product.qty || 1));
    const price = Math.max(0, Number(product.price || 0));
    const rawOld = Number(product.oldPrice || product.originalPrice || product.old_price || product.mrp || 0);
    const oldPrice = rawOld > price ? rawOld : price;
    const itemTotal = price * qty;
    const youSave = (oldPrice - price) * qty;
    const discountPct = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
    // Extract real rating from product data
    const rawRating = product.rating || product.rate;
    let numRating = 0;
    let reviewsCount = "";
    if (typeof rawRating === "object" && rawRating !== null) {
      numRating = Number(rawRating.rate || 0);
      reviewsCount = rawRating.count || "";
    } else if (rawRating !== undefined && rawRating !== null && rawRating !== "") {
      numRating = Number(rawRating);
      reviewsCount = product.reviews_count || product.reviewsCount || "";
    }
    const hasRating = !isNaN(numRating) && numRating > 0;

    const ratingMarkup = hasRating
      ? `
        <div class="shop-cart-rating" title="Rating: ${numRating.toFixed(1)} out of 5 stars">
          <span class="star-icon">★</span>
          <span class="rating-val">${numRating.toFixed(1)}</span>
          ${reviewsCount ? `<span class="reviews-count">(${reviewsCount})</span>` : ""}
        </div>
      `
      : "";

    const store = product.store || "KSAM Deal Verified";
    const category = product.category || "Deals";
    const productName = product.name || product.title || "Selected Product";
    const productImage = resolveSafeProductImage(product);
    const inWishlist = isInWishlist(product);

    const card = document.createElement("article");
    card.className = "shop-cart-product";
    card.dataset.id = product.id;

    card.innerHTML = `
      <div class="shop-cart-image">
        <img
          src="${productImage}"
          alt="${productName}"
          loading="lazy"
          onerror="this.onerror=null; this.src='${DEFAULT_PLACEHOLDER_IMAGE}';"
        >
      </div>

      <div class="shop-cart-info">
        <!-- Meta Row -->
        <div class="shop-cart-meta-row">
          <span class="shop-cart-category">${category}</span>
          <span class="shop-cart-store-tag">• ${store}</span>
          ${ratingMarkup}
        </div>

        <!-- Product Title -->
        <h3 class="shop-cart-title">${productName}</h3>

        <!-- Pricing Row -->
        <div class="shop-cart-pricing">
          <span class="shop-cart-price">${formatINR(price)}</span>
          ${oldPrice > price ? `<span class="shop-cart-old-price">${formatINR(oldPrice)}</span>` : ""}
          ${discountPct > 0 ? `<span class="shop-cart-discount-pill">${discountPct}% OFF</span>` : ""}
          ${youSave > 0 ? `<span class="shop-cart-savings-pill">You Save: ${formatINR(youSave)}</span>` : ""}
        </div>

        <!-- Availability & Delivery Line -->
        <div class="shop-cart-perks-row">
          <span class="stock-badge in-stock">
            <span class="stock-pulse-dot"></span>
            In Stock
          </span>
          <span class="delivery-estimate-txt">⚡ Delivery by Tomorrow, 5 PM • FREE Delivery Eligible</span>
        </div>

        <!-- Actions Row: Quantity, Item Total, Wishlist, Save for Later, Remove -->
        <div class="shop-cart-item-actions-row">
          <!-- Stepper (Min 1, Max 10) -->
          <div class="shop-cart-quantity-block">
            <span class="stepper-label">Qty:</span>
            <div class="shop-cart-quantity">
              <button
                class="shop-cart-minus-btn"
                data-id="${product.id}"
                type="button"
                aria-label="Decrease quantity"
                ${qty <= 1 ? "disabled title='Minimum quantity is 1'" : ""}
              >−</button>
              <span class="shop-cart-qty-val">${qty}</span>
              <button
                class="shop-cart-plus-btn"
                data-id="${product.id}"
                type="button"
                aria-label="Increase quantity"
                ${qty >= MAX_ITEM_QUANTITY ? "disabled title='Maximum quantity is 10'" : ""}
              >+</button>
            </div>
          </div>

          <!-- Product Line Total -->
          <div class="shop-cart-line-total">
            <span class="line-total-lbl">Item Total:</span>
            <span class="line-total-val">${formatINR(itemTotal)}</span>
          </div>

          <!-- Action Buttons -->
          <div class="shop-cart-action-buttons">
            <button
              class="shop-cart-wishlist-btn ${inWishlist ? 'active' : ''}"
              data-id="${product.id}"
              type="button"
              title="${inWishlist ? 'In Wishlist' : 'Move to Wishlist'}"
              aria-label="Move to Wishlist"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${inWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span>Wishlist</span>
            </button>

            <button
              class="shop-cart-save-later-btn"
              data-id="${product.id}"
              type="button"
              aria-label="Save for later"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              <span>Save for Later</span>
            </button>

            <button
              class="shop-cart-remove-btn"
              data-id="${product.id}"
              type="button"
              aria-label="Remove item"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

/**
 * Renders the "Saved for Later" Section
 */
function renderSavedForLater() {
  const container = document.getElementById("savedForLaterContainer");
  if (!container) return;

  const saved = getSavedForLater();

  if (saved.length === 0) {
    container.style.display = "none";
    container.innerHTML = "";
    return;
  }

  container.style.display = "block";
  container.innerHTML = `
    <div class="saved-later-header">
      <div class="saved-later-title-wrap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="saved-later-icon"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
        <h3>Saved for Later</h3>
        <span class="saved-later-count-badge">${saved.length} ${saved.length === 1 ? "item" : "items"}</span>
      </div>
    </div>
    <div class="saved-later-grid">
      ${saved
        .map((item) => {
          const img = resolveSafeProductImage(item);
          return `
          <div class="saved-later-card" data-id="${item.id}">
            <div class="saved-later-img">
              <img src="${img}" alt="${item.name}" onerror="this.onerror=null; this.src='${DEFAULT_PLACEHOLDER_IMAGE}';">
            </div>
            <div class="saved-later-details">
              <h4>${item.name}</h4>
              <div class="saved-later-pricing">
                <span class="saved-price">${formatINR(item.price)}</span>
                ${item.oldPrice > item.price ? `<span class="saved-old-price">${formatINR(item.oldPrice)}</span>` : ""}
              </div>
              <div class="saved-later-btns">
                <button type="button" class="btn-move-to-cart" data-id="${item.id}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                  <span>Move to Cart</span>
                </button>
                <button type="button" class="btn-remove-saved" data-id="${item.id}">Remove</button>
              </div>
            </div>
          </div>
        `;
        })
        .join("")}
    </div>
  `;
}

/**
 * Renders the Delivery Address Card
 */
function renderAddressCard(addr) {
  const container = document.getElementById("cartAddressCard");
  if (!container) return;

  const profileHref = `${(BASE_URL || "/KSAM-deal-ecommerce-website/").replace(/\/+$/, "")}/profile.html#addresses`;

  const effectiveAddr = addr || {
    label: "HOME",
    full_name: "Abhay Chauhan",
    phone: "+91 98765 43210",
    line1: "Flat 402, Green Valley Apartments, MG Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001"
  };

  const tag = (effectiveAddr.label || "HOME").toUpperCase();
  const name = effectiveAddr.full_name || "Abhay Chauhan";
  const addressLine = [effectiveAddr.line1, effectiveAddr.line2, effectiveAddr.landmark].filter(Boolean).join(", ");
  const location = `${effectiveAddr.city || ""}${effectiveAddr.state ? ", " + effectiveAddr.state : ""} - ${effectiveAddr.pincode || ""}`.trim();
  const phoneTxt = effectiveAddr.phone ? `Phone: ${effectiveAddr.phone}` : "";

  container.innerHTML = `
    <div class="cart-address-box">
      <div class="address-header-row">
        <div class="address-header-left">
          <div class="address-location-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
          <span class="address-home-tag">${tag}</span>
          <span class="address-user-name">${name}</span>
        </div>
        <a href="${profileHref}" class="address-change-btn" title="Change delivery address">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          <span class="change-btn-text">Change</span>
        </a>
      </div>

      <div class="address-body-lines">
        <p class="address-street-line">${addressLine}</p>
        <p class="address-city-phone-line">${location}${phoneTxt ? ` • <span>${phoneTxt}</span>` : ""}</p>
      </div>

      <div class="delivery-speed-pill">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>Guaranteed Express Delivery in 2–3 Business Days</span>
      </div>
    </div>
  `;
}

/**
 * Renders the Coupon Code Section
 */
function renderCouponSection(summary) {
  const container = document.getElementById("cartCouponContainer");
  if (!container) return;

  const applied = summary.couponApplied;
  const meta = summary.appliedCouponMeta;

  if (applied && meta) {
    container.innerHTML = `
      <div class="coupon-box applied">
        <div class="coupon-applied-info">
          <div class="coupon-applied-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          </div>
          <div>
            <div class="coupon-badge-title">
              <strong>${meta.code}</strong> Applied
              <span class="coupon-saved-val">(-${formatINR(summary.couponDiscount)})</span>
            </div>
            <p class="coupon-desc-txt">${meta.description}</p>
          </div>
        </div>
        <div class="coupon-applied-actions">
          <button type="button" class="btn-view-all-coupons" id="btnViewAllCoupons" title="View available offers">
            <span>Offers</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          </button>
          <button type="button" class="btn-remove-coupon" id="btnRemoveCoupon" aria-label="Remove coupon">
            Remove ×
          </button>
        </div>
      </div>
      <div id="couponFeedbackMsg" class="coupon-feedback-msg success"></div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="coupon-box">
      <div class="coupon-input-header">
        <div class="coupon-header-left">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="coupon-title-icon"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          <span>Apply Coupon</span>
        </div>
        <button type="button" class="btn-view-all-coupons" id="btnViewAllCoupons">
          <span>View Offers</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        </button>
      </div>
      <div class="coupon-input-group">
        <input
          type="text"
          id="couponInput"
          placeholder="ENTER COUPON CODE"
          aria-label="Enter promotional coupon code"
          maxlength="20"
          autocomplete="off"
        />
        <button type="button" id="btnApplyCoupon" class="btn-apply-coupon">
          <span>APPLY</span>
        </button>
      </div>
      <div class="coupon-quick-suggestions">
        <span class="suggestion-lbl">Available:</span>
        <button type="button" class="coupon-chip" data-code="KSAM10">KSAM10 – 10% OFF</button>
        <button type="button" class="coupon-chip" data-code="WELCOME50">WELCOME50 – ₹50 OFF</button>
      </div>
      <div id="couponFeedbackMsg" class="coupon-feedback-msg"></div>
    </div>
  `;
}

/**
 * Renders the Free Delivery Progress Meter (Compact)
 */
function renderFreeDeliveryMeter(summary) {
  const current = summary.discountedSubtotal;
  const threshold = summary.freeDeliveryThreshold;
  const progress = summary.freeDeliveryProgress;
  const unlocked = summary.isFreeDelivery;
  const remaining = summary.freeDeliveryRemaining;

  return `
    <div class="free-delivery-meter-card compact">
      <div class="delivery-meter-top">
        <span class="delivery-meter-label">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          <span>Free Delivery</span>
        </span>
        <strong class="delivery-meter-val ${unlocked ? 'unlocked' : ''}">
          ${unlocked ? "UNLOCKED ✓" : `Add ${formatINR(remaining)} more for FREE delivery`}
        </strong>
      </div>
      <div class="delivery-meter-track compact">
        <div class="delivery-meter-fill ${unlocked ? 'unlocked' : ''}" style="width: ${progress}%;"></div>
      </div>
    </div>
  `;
}

/**
 * Renders the complete Order Summary breakdown
 */
function renderOrderSummary(summary) {
  const container = document.getElementById("cartOrderSummaryContainer");
  if (!container) return;

  const hasItems = summary.itemCount > 0;

  container.innerHTML = `
    <div class="your-shopping-card">
      <div class="shopping-header">
        <div class="shopping-header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        </div>
        <div class="shopping-header-text">
          <small>KSAM DEAL</small>
          <h2>Order Summary</h2>
        </div>
      </div>

      <!-- Free Delivery Progress Meter (Compact) -->
      ${renderFreeDeliveryMeter(summary)}

      <!-- Price Breakdown Rows -->
      <div class="shopping-breakdown">
        <!-- 1. Original MRP -->
        <div class="breakdown-row">
          <span>Original Price (${summary.totalQuantity} items)</span>
          <strong class="original-price-val">${formatINR(summary.originalCartTotal)}</strong>
        </div>

        <!-- 2. Product Discount -->
        <div class="breakdown-row discount-row">
          <span>Product Discount</span>
          <strong class="discount-val">-${formatINR(summary.productSavings)}</strong>
        </div>

        <!-- 3. Subtotal after Product Discount -->
        <div class="breakdown-row subtotal-row">
          <span>Subtotal after Discounts</span>
          <strong class="subtotal-val">${formatINR(summary.discountedSubtotal)}</strong>
        </div>

        <!-- 4. Coupon Discount (if applied) -->
        ${
          summary.couponApplied
            ? `
          <div class="breakdown-row coupon-row">
            <span>Coupon Discount (${summary.appliedCouponMeta?.code})</span>
            <div class="coupon-applied-amount-wrap">
              <strong class="coupon-discount-val">-${formatINR(summary.couponDiscount)}</strong>
              <button type="button" class="btn-quick-remove-coupon" id="btnQuickRemoveCoupon" title="Remove coupon">×</button>
            </div>
          </div>
        `
            : ""
        }

        <!-- 5. Delivery Charges -->
        <div class="breakdown-row delivery-row ${summary.isFreeDelivery ? 'delivery-free' : ''}">
          <span>Delivery Charges</span>
          <strong class="delivery-val">
            ${summary.deliveryFee === 0 ? `<span class="delivery-free-lbl">FREE</span> <span class="waived-amt">(-₹49)</span>` : formatINR(summary.deliveryFee)}
          </strong>
        </div>

        <!-- 6. Platform / Handling Fee -->
        <div class="breakdown-row additional-row">
          <span>Platform Handling Fee</span>
          <strong class="additional-val" style="color: var(--ks-primary);">FREE</strong>
        </div>

        <!-- 7. Total Savings Highlight (Product Discount + Coupon Discount + Waived Delivery Fee) -->
        ${
          summary.totalSavings > 0
            ? `
          <div class="breakdown-savings-banner">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            <span>You will save <strong>${formatINR(summary.totalSavings)}</strong> on this order! 🎉</span>
          </div>
        `
            : ""
        }

        <!-- 8. Final Total with animated count-up -->
        <div class="breakdown-row final-total-row">
          <div class="final-total-lbl-wrap">
            <span class="final-lbl">Total Amount</span>
            <small class="tax-inclusive-lbl">(Inclusive of all applicable GST)</small>
          </div>
          <strong class="final-amount-val" id="summaryFinalTotal">${formatINR(summary.finalPayableAmount)}</strong>
        </div>
      </div>

      <!-- Empty Cart Alert -->
      ${
        !hasItems
          ? `
        <div class="shopping-empty" style="display: block;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          Your cart is empty. Add items to proceed to checkout.
        </div>
      `
          : ""
      }

      <!-- Proceed to Secure Checkout Button -->
      <button
        type="button"
        class="shopping-checkout"
        id="shoppingCheckout"
        data-requires-auth="true"
        data-auth-action="checkout"
        aria-label="Proceed to Secure Checkout"
        ${!hasItems ? "disabled style='opacity: 0.55; cursor: not-allowed;'" : ""}
      >
        <span class="checkout-lock-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </span>
        <span id="checkoutBtnLabel">Proceed to Secure Checkout</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="checkout-arrow-icon"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
      </button>

      <!-- Secondary Link -->
      <a href="./shop.html" class="shopping-continue">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        <span>Continue Shopping</span>
      </a>

      <!-- Trust Badges & Supported Payment Methods -->
      <div class="shopping-trust-row">
        <div class="trust-badge-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          <span>Secure Payments</span>
        </div>
        <div class="trust-badge-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
          <span>Easy Returns</span>
        </div>
        <div class="trust-badge-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span>100% Genuine</span>
        </div>
      </div>

      <div class="payment-methods-strip">
        <span class="pay-chip">UPI</span>
        <span class="pay-chip">CARDS</span>
        <span class="pay-chip">NETBANKING</span>
        <span class="pay-chip">COD AVAILABLE</span>
      </div>
    </div>
  `;
}

let summaryObserver = null;
let checkoutObserver = null;

export function setupSummaryIntersectionObserver() {
  if (summaryObserver) {
    summaryObserver.disconnect();
    summaryObserver = null;
  }
  if (checkoutObserver) {
    checkoutObserver.disconnect();
    checkoutObserver = null;
  }

  const summaryEl = document.getElementById("cartOrderSummaryContainer");
  const stickyBar = document.getElementById("cartMobileStickyBar");
  const checkoutArea = document.getElementById("cartCheckoutBottomArea");

  // Slide-up fade entrance for checkout area
  if (checkoutArea && "IntersectionObserver" in window) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReducedMotion) {
      checkoutArea.classList.add("animate-init");
      checkoutObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              checkoutArea.classList.add("in-view");
              checkoutObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      checkoutObserver.observe(checkoutArea);
    } else {
      checkoutArea.classList.add("in-view");
    }
  }

  // Mobile sticky bar: hide while Order Summary is in view, show while out of view
  if (summaryEl && stickyBar && "IntersectionObserver" in window) {
    summaryObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stickyBar.classList.add("hidden-bar");
            stickyBar.classList.remove("visible-bar");
          } else {
            stickyBar.classList.remove("hidden-bar");
            stickyBar.classList.add("visible-bar");
          }
        });
      },
      { threshold: 0.12 }
    );

    summaryObserver.observe(summaryEl);
  }
}

/**
 * Renders the Mobile Sticky Bottom Checkout Bar
 */
function renderMobileStickyBar(summary) {
  let barEl = document.getElementById("cartMobileStickyBar");
  if (!barEl) {
    barEl = document.createElement("div");
    barEl.id = "cartMobileStickyBar";
    barEl.className = "cart-mobile-sticky-bar";
    document.body.appendChild(barEl);
  }

  const hasItems = summary.itemCount > 0;

  barEl.innerHTML = `
    <div class="mobile-bar-total-wrap">
      <span class="mobile-bar-total-lbl">Total Amount</span>
      <strong class="mobile-bar-total-val">${formatINR(summary.finalPayableAmount)}</strong>
    </div>
    <button
      type="button"
      class="mobile-bar-checkout-btn"
      id="mobileBarCheckoutBtn"
      ${!hasItems ? "disabled style='opacity: 0.55; cursor: not-allowed;'" : ""}
    >
      <span>Checkout →</span>
    </button>
  `;

  // Attach observer after DOM update
  setTimeout(setupSummaryIntersectionObserver, 60);
}

/* =============================================================================
   9. EVENT LISTENERS & INITIALIZATION
   ============================================================================= */

export function attachCartEvents() {
  document.addEventListener("click", (e) => {
    // 1. Plus Button (with max 10 check)
    const plusBtn = e.target.closest(".shop-cart-plus-btn");
    if (plusBtn) {
      updateItemQuantity(plusBtn.dataset.id, 1);
      return;
    }

    // 2. Minus Button
    const minusBtn = e.target.closest(".shop-cart-minus-btn");
    if (minusBtn) {
      updateItemQuantity(minusBtn.dataset.id, -1);
      return;
    }

    // 3. Remove Button
    const removeBtn = e.target.closest(".shop-cart-remove-btn");
    if (removeBtn) {
      removeItemFromCart(removeBtn.dataset.id);
      return;
    }

    // 4. Save for Later Button
    const saveLaterBtn = e.target.closest(".shop-cart-save-later-btn");
    if (saveLaterBtn) {
      saveItemForLater(saveLaterBtn.dataset.id);
      return;
    }

    // 5. Wishlist Button
    const wishlistBtn = e.target.closest(".shop-cart-wishlist-btn");
    if (wishlistBtn) {
      moveItemToWishlist(wishlistBtn.dataset.id);
      return;
    }

    // 6. Move to Cart Button
    const moveToCartBtn = e.target.closest(".btn-move-to-cart");
    if (moveToCartBtn) {
      moveItemToCart(moveToCartBtn.dataset.id);
      return;
    }

    // 7. Remove Saved Item Button
    const removeSavedBtn = e.target.closest(".btn-remove-saved");
    if (removeSavedBtn) {
      removeSavedItem(removeSavedBtn.dataset.id);
      return;
    }

    // 8. Apply Coupon Button
    const applyCouponBtn = e.target.closest("#btnApplyCoupon");
    if (applyCouponBtn) {
      const input = document.getElementById("couponInput");
      applyCouponCode(input?.value || "");
      return;
    }

    // 9. Remove Coupon Buttons
    const removeCouponBtn = e.target.closest("#btnRemoveCoupon") || e.target.closest("#btnQuickRemoveCoupon");
    if (removeCouponBtn) {
      removeCouponCode();
      return;
    }

    // 10. Coupon Suggestion Chip Click
    const couponChip = e.target.closest(".coupon-chip");
    if (couponChip) {
      const code = couponChip.dataset.code;
      const input = document.getElementById("couponInput");
      if (input) input.value = code;
      applyCouponCode(code);
      return;
    }

    // 11. View All Coupons Button
    const viewAllCouponsBtn = e.target.closest("#btnViewAllCoupons");
    if (viewAllCouponsBtn) {
      openCouponsModal();
      return;
    }

    // 12. Proceed to Checkout Buttons (Sidebar or Mobile bar)
    const checkoutBtn = e.target.closest("#shoppingCheckout") || e.target.closest("#mobileBarCheckoutBtn");
    if (checkoutBtn) {
      handleCheckoutClick(checkoutBtn);
      return;
    }
  });

  // Enter key in coupon input
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target && e.target.id === "couponInput") {
      e.preventDefault();
      applyCouponCode(e.target.value);
    }
  });

  // Storage and Custom Event Listeners
  window.addEventListener("storage", (e) => {
    if (e.key === CART_STORAGE_KEY || e.key === SELECTED_ADDRESS_KEY || e.key === SAVED_FOR_LATER_KEY || e.key === APPLIED_COUPON_KEY) {
      renderAll();
    }
  });

  window.addEventListener("cartUpdated", () => {
    renderAll();
  });
}

function handleCheckoutClick(btn) {
  const cart = getCart();
  if (cart.length === 0) {
    showCartToast("Your cart is empty. Please add items to proceed.");
    return;
  }

  // Visual loading feedback
  if (btn) {
    btn.classList.add("loading");
    const lbl = btn.querySelector("#checkoutBtnLabel") || btn.querySelector("span");
    if (lbl) lbl.textContent = "Securing Checkout...";
  }

  const appliedCode = getStoredCoupon();
  const summary = calculateCartSummary(cart, appliedCode, currentDeliveryAddress);

  try {
    sessionStorage.setItem("ksam_checkout_summary", JSON.stringify(summary));
    localStorage.setItem("ksamCheckoutStarted", "true");
  } catch (err) {}

  setTimeout(() => {
    const checkoutUrl = `${(BASE_URL || "/KSAM-deal-ecommerce-website/").replace(/\/+$/, "")}/checkout.html`;
    window.location.href = checkoutUrl;
  }, 320);
}

// Auto-boot when DOM is ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      attachCartEvents();
      renderAll();
    });
  } else {
    attachCartEvents();
    renderAll();
  }
}
