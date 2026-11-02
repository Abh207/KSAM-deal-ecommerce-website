/**
 * KSAM Deal - Verified Product Reviews Service
 * ─────────────────────────────────────────────────────────────
 * Associates customer reviews strictly with exact product IDs.
 * Enforces verified-purchase and post-delivery eligibility rules.
 */

import { supabase, isSupabaseConfigured } from "./supabase.js";
import { getLocalOrders, saveLocalOrders } from "./orderService.js";

function callWithTimeout(promise, ms = 2000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase request timeout")), ms))
  ]);
}

const REVIEWS_STORAGE_KEY = "ksamProductReviews";

const reviewListeners = new Set();

export function subscribeReviews(cb) {
  reviewListeners.add(cb);
  return () => reviewListeners.delete(cb);
}

function notifyReviewsChanged(productId) {
  reviewListeners.forEach((cb) => {
    try {
      cb(productId);
    } catch {}
  });
}

/**
 * Reads local reviews from LocalStorage
 */
export function getLocalReviews() {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves reviews to LocalStorage
 */
export function saveLocalReviews(reviews) {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.warn("[reviewService] Failed to save local reviews:", err);
  }
}

/**
 * Checks whether a user is eligible to review an item
 */
export function checkReviewEligibility({ user = null, order = null, item = null }) {
  if (!order || !item) {
    return { eligible: false, reason: "Order or product details missing." };
  }

  // Payment must be successful or confirmed COD
  const isPaid =
    order.payment_status === "Paid" ||
    order.paymentStatus === "Paid" ||
    order.payment_status === "COD" ||
    order.paymentStatus === "COD";

  if (!isPaid) {
    return { eligible: false, reason: "Reviews are only permitted for paid or confirmed orders." };
  }

  // Order must be delivered
  const isDelivered =
    order.order_status === "Successfully Delivered" ||
    order.orderStatus === "Successfully Delivered" ||
    order.shipment_status === "Successfully Delivered";

  if (!isDelivered) {
    return { eligible: false, reason: "Product must be successfully delivered before submitting a review." };
  }

  // Check if already reviewed
  if (item.review_status === "reviewed") {
    return { eligible: false, reason: "You have already reviewed this product." };
  }

  const allReviews = getLocalReviews();
  const alreadyReviewed = allReviews.some(
    (r) =>
      r.order_id === order.id &&
      String(r.product_id) === String(item.product_id || item.id)
  );

  if (alreadyReviewed) {
    return { eligible: false, reason: "You have already reviewed this product for this order." };
  }

  return { eligible: true };
}

/**
 * Submits a new verified review
 */
export async function submitProductReview({
  user = null,
  orderId = null,
  orderItemId = null,
  productId = "",
  rating = 5,
  reviewTitle = "",
  reviewText = "",
  reviewImages = [],
  userDisplayName = ""
}) {
  const cleanRating = Math.max(1, Math.min(5, Number(rating) || 5));
  const cleanText = String(reviewText || "").trim();

  if (!cleanText) {
    throw new Error("Review feedback text cannot be empty.");
  }
  if (!productId) {
    throw new Error("Missing product association for review.");
  }

  const now = new Date();
  const displayName =
    userDisplayName ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Verified Buyer";

  const newReview = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: user?.id || null,
    order_id: orderId,
    order_item_id: orderItemId,
    product_id: String(productId).trim(),
    user_display_name: displayName,
    user_avatar: user?.user_metadata?.avatar_url || null,
    rating: cleanRating,
    review_title: String(reviewTitle || "").trim() || `${cleanRating} Star Experience`,
    review_text: cleanText,
    review_images: Array.isArray(reviewImages) ? reviewImages : [],
    verified_purchase: true,
    is_approved: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  };

  // 1. Save to LocalStorage immediately
  const localList = getLocalReviews();
  localList.unshift(newReview);
  saveLocalReviews(localList);

  // 2. Mark item as reviewed in order
  const orders = getLocalOrders();
  const targetOrder = orders.find((o) => o.id === orderId);
  if (targetOrder && Array.isArray(targetOrder.items)) {
    const it = targetOrder.items.find(
      (i) => i.id === orderItemId || String(i.product_id) === String(productId)
    );
    if (it) {
      it.review_status = "reviewed";
      saveLocalOrders(orders);
    }
  }

  // 3. Supabase persistence
  if (isSupabaseConfigured) {
    try {
      await callWithTimeout(
        supabase.from("product_reviews").insert({
          user_id: user?.id || null,
          order_id: orderId,
          order_item_id: orderItemId,
          product_id: String(productId).trim(),
          user_display_name: displayName,
          user_avatar: user?.user_metadata?.avatar_url || null,
          rating: cleanRating,
          review_title: newReview.review_title,
          review_text: cleanText,
          review_images: newReview.review_images,
          verified_purchase: true,
          is_approved: true
        }),
        1500
      );

      if (orderItemId) {
        await callWithTimeout(
          supabase
            .from("order_items")
            .update({ review_status: "reviewed" })
            .eq("id", orderItemId),
          1500
        );
      }
    } catch (err) {
      console.warn("[reviewService] Supabase insert review fallback:", err);
    }
  }

  notifyReviewsChanged(String(productId).trim());
  return newReview;
}

/**
 * Fetches all reviews and statistical summary for a specific product ID.
 */
export async function fetchProductReviews(productId, fallbackInitialReviews = []) {
  const pId = String(productId || "").trim();
  let reviewsList = [];

  // Try Supabase first
  if (isSupabaseConfigured && pId) {
    try {
      const { data, error } = await callWithTimeout(
        supabase
          .from("product_reviews")
          .select(`
            id,
            user_id,
            order_id,
            order_item_id,
            product_id,
            user_display_name,
            user_avatar,
            rating,
            review_title,
            review_text,
            review_images,
            verified_purchase,
            created_at
          `)
          .eq("product_id", pId)
          .eq("is_approved", true)
          .order("created_at", { ascending: false }),
        1500
      );

      if (!error && Array.isArray(data)) {
        reviewsList = data;
      }
    } catch {}
  }

  // Fallback to / merge with LocalStorage
  const localAll = getLocalReviews();
  const localMatches = localAll.filter((r) => String(r.product_id) === pId);

  const seenIds = new Set(reviewsList.map((r) => r.id));
  for (const lr of localMatches) {
    if (!seenIds.has(lr.id)) {
      reviewsList.push(lr);
      seenIds.add(lr.id);
    }
  }

  // If no user reviews yet, combine with curated initial verified reviews for this product
  if (Array.isArray(fallbackInitialReviews)) {
    for (const initRev of fallbackInitialReviews) {
      if (!seenIds.has(initRev.id)) {
        reviewsList.push({
          ...initRev,
          verified_purchase: true
        });
        seenIds.add(initRev.id);
      }
    }
  }

  // Calculate statistics
  const totalReviews = reviewsList.length;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  for (const r of reviewsList) {
    const star = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
    distribution[star] = (distribution[star] || 0) + 1;
    sum += Number(r.rating) || 5;
  }

  const averageRating = totalReviews > 0 ? Number((sum / totalReviews).toFixed(1)) : 4.8;

  return {
    productId: pId,
    averageRating,
    totalReviews,
    distribution,
    reviews: reviewsList
  };
}
