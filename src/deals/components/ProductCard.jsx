import React, { useState, useEffect } from "react";
import { ShoppingBag, Check, ArrowRight } from "lucide-react";
import { isInWishlist, toggleWishlist, subscribeWishlist } from "../../lib/wishlist.js";
import { addProductToCart, buildProductUid, resolveImagePath } from "../../lib/cartHelper.js";
import {
  getCategoryFallbackImage,
  saveDealToSession,
  upsertExternalDeal,
  saveDealsNavigationState,
  getStoreName,
  deriveCategoryFromName,
  cleanCardDescription
} from "../services/productService.js";
import "./dealCardV2.css";

/**
 * ProductCard renders in Screenshot 3 ("Chrono Black" card) style:
 * - White rounded card, product image on a light background
 * - Discount badge top-left (e.g. "50% OFF"), only when a real discount exists
 * - Heart (wishlist) button top-right, reusing the existing wishlist logic
 * - Small uppercase category label, bold product title (max 2 lines), brand/store name in grey
 * - Short description (max 2 lines, hidden if missing)
 * - Current price in bold INR, struck-through old price (only if it exists)
 * - Small availability text (hidden if unknown)
 * - Bottom row: a cart/bag icon button and a full-width "View Product ->" button
 * - Store name (Flipkart, Amazon, etc.) shown as a small label on the card
 * - Saves product to sessionStorage on click & initiates background upsert so detail page never shows Deal Not Found
 */
export function ProductCard({ product, p, index, onOpenDetails, onClick }) {
  const item = product || p;
  const [, setWishlistVersion] = useState(0);
  const [addedQuick, setAddedQuick] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const unsub = subscribeWishlist(() => {
      setWishlistVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  if (!item) return null;

  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const uid = item.uid || item.external_id || buildProductUid(item.category, item.id);
  const fromParam = item.from || "deals";
  const productUrl = `${normalizedBase}product.html?id=${encodeURIComponent(item.id)}&category=${encodeURIComponent(item.category || "General")}&uid=${encodeURIComponent(uid)}&from=${encodeURIComponent(fromParam)}`;

  const isSaved = isInWishlist(item.uid || item.id || item.external_id);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(item);
  };

  const storeName = getStoreName(item);

  const handleQuickAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addProductToCart({
      ...item,
      store: storeName || "",
      platform: storeName || "",
      store_name: storeName || "",
      product_url: item.product_url || item.affiliate_url || item.url || item.link || "",
      affiliate_url: item.affiliate_url || item.product_url || item.url || item.link || "",
      is_external: Boolean(item.product_url || item.affiliate_url || item.external_id || storeName)
    }, 1);
    setAddedQuick(true);
    setTimeout(() => setAddedQuick(false), 1200);
  };

  const handleCardClick = (e) => {
    // Save full product to sessionStorage so detail view never shows Deal Not Found
    saveDealToSession(item);
    // Background upsert via Edge Function
    upsertExternalDeal(item).catch(() => {});
    // Persist navigation click state
    saveDealsNavigationState({
      clickedProductId: item.id,
      scrollY: typeof window !== "undefined" ? window.scrollY : 0
    });

    if (onClick) {
      onClick(item);
    } else if (onOpenDetails) {
      onOpenDetails(item);
    }
  };

  const rawImage = !imgFailed && (item.image_url || item.image || item.thumbnail)
    ? resolveImagePath(item.image_url || item.image || item.thumbnail)
    : getCategoryFallbackImage(item.category, item.name);

  const discountNum = Number(item.discount || item.discount_percent || 0);
  const hasDiscount = Boolean(discountNum > 0);

  const rawOldPrice = Number(item.oldPrice || item.old_price || item.mrp || item.originalPrice || 0);
  const priceNum = Number(item.price || 0);
  const hasOldPrice = Boolean(rawOldPrice && rawOldPrice > priceNum);

  const availabilityText =
    (item.availability && item.availability !== "Unknown" && item.availability) ||
    (item.stock !== null && item.stock !== undefined
      ? (item.stock > 0 ? `${item.stock} items available` : "Out of stock")
      : null);

  const rawDesc = (item.description || item.desc || item.summary || "").trim();
  const descText = cleanCardDescription(rawDesc, item.name || item.title);

  let categoryLabel = (item.category || "").trim();
  if (!categoryLabel || categoryLabel.toLowerCase() === "deals" || categoryLabel.toLowerCase() === "deal" || categoryLabel.toLowerCase() === "search") {
    categoryLabel = deriveCategoryFromName(item.name || item.title);
  }

  const realBrand = item.brand && !item.brand.toLowerCase().includes("ksam") ? item.brand.trim() : "";
  const displayBrandOrStore = realBrand || storeName || "";

  return (
    <article
      className="deal-card-v2"
      data-product-id={item.id}
      data-id={item.id}
      data-category={categoryLabel || item.category}
    >
      {/* 1. TOP IMAGE AREA */}
      <div className={`deal-card-img-wrap ${!imgLoaded && !imgFailed ? "is-skeleton" : ""}`}>
        <a
          href={productUrl}
          className="deal-card-img-link"
          aria-label={`View details for ${item.name}`}
          onClick={handleCardClick}
        >
          <img
            src={rawImage}
            alt={item.name}
            loading={index !== undefined && index < 4 ? "eager" : "lazy"}
            decoding="async"
            referrerPolicy="no-referrer"
            className={`deal-card-img ${imgLoaded ? "is-loaded" : ""}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgFailed(true);
              setImgLoaded(true);
            }}
          />
        </a>

        {/* Discount badge top-left (e.g. "50% OFF") - only when real discount exists */}
        {hasDiscount && (
          <span className="deal-card-discount-pill">
            {discountNum}% OFF
          </span>
        )}

        {/* Round wishlist heart top-right */}
        <button
          type="button"
          className={`deal-card-heart-btn ${isSaved ? "is-active" : ""}`}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleToggleWishlist}
        >
          <span className="deal-heart-icon">{isSaved ? "♥" : "♡"}</span>
        </button>
      </div>

      {/* 2. CARD CONTENT BODY */}
      <div className="deal-card-content">
        {/* Meta row: category + platform chip */}
        <div className="deal-card-meta-row">
          {categoryLabel ? (
            <span className="deal-card-cat-label">{categoryLabel}</span>
          ) : null}
          {storeName ? (
            <span className="deal-platform-chip" title={`Available on ${storeName}`}>
              on {storeName}
            </span>
          ) : null}
        </div>

        {/* Bold clickable product name (max 2 lines with ellipsis) */}
        <h3 className="deal-card-name">
          <a
            href={productUrl}
            className="deal-card-name-link"
            onClick={handleCardClick}
          >
            {item.name}
          </a>
        </h3>

        {/* Real store name in grey under title (hidden if none exists) */}
        {storeName ? (
          <p className="deal-card-brand">
            {storeName}
          </p>
        ) : null}

        {/* Short description (max 2 lines, hidden if missing) */}
        {descText ? (
          <p className="deal-card-desc">
            {descText}
          </p>
        ) : null}

        {/* Price row */}
        <div className="deal-card-price-row">
          <span className="deal-current-price">
            ₹{priceNum.toLocaleString("en-IN")}
          </span>
          {hasOldPrice && (
            <span className="deal-original-price">
              ₹{rawOldPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Small availability text (hidden if unknown) */}
        {availabilityText ? (
          <p className="deal-stock-line">
            {availabilityText}
          </p>
        ) : null}

        {/* 3. FOOTER ROW: cart icon button + full-width View Product button */}
        <div className="deal-card-actions">
          {/* Black square cart button */}
          <button
            type="button"
            className={`deal-cart-btn ${addedQuick ? "is-added" : ""}`}
            onClick={handleQuickAddToCart}
            aria-label={`Add ${item.name} to Cart`}
            title="Add to Cart"
          >
            {addedQuick ? (
              <Check size={20} strokeWidth={2.5} />
            ) : (
              <ShoppingBag size={20} strokeWidth={2} />
            )}
          </button>

          {/* Full-width View Product button */}
          <a
            href={productUrl}
            className="deal-view-btn"
            aria-label={`View details for ${item.name}`}
            onClick={handleCardClick}
          >
            <span className="deal-view-btn-full">View Product</span>
            <span className="deal-view-btn-short">View</span>
            <ArrowRight size={16} className="deal-view-btn-arrow" />
          </a>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
