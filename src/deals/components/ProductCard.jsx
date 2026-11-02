import React, { useState, useEffect } from "react";
import { ShoppingBag, Check, ArrowRight } from "lucide-react";
import { isInWishlist, toggleWishlist, subscribeWishlist } from "../../lib/wishlist.js";
import { addProductToCart, buildProductUid, resolveImagePath } from "../../lib/cartHelper.js";
import { getCategoryFallbackImage } from "../services/productService.js";
import "./dealCardV2.css";

/**
 * ProductCard renders in Image 2 ("Best Sellers" / Watches card) style:
 * - White card, rounded 20-24px, soft shadow
 * - Light grey image area (#f8f8f8) with centered contain image
 * - Black "N% OFF" pill top-left
 * - Round wishlist heart top-right (green filled #8cff00 when active)
 * - Small platform chip (e.g. "on Amazon")
 * - Small uppercase green category label
 * - Bold product name (max 2 lines with ellipsis)
 * - Grey brand/store name
 * - 2-line short description
 * - Large bold ₹ price with struck-through old price
 * - Green "N items available" line (hidden if stock is unknown)
 * - Footer: square black cart button + wide light-green outlined "View Product ->" button
 * - Opens product.html?id=<id>&category=<category>&uid=<uid>&from=deals in SAME tab
 */
export function ProductCard({ product, onOpenDetails }) {
  const [, setWishlistVersion] = useState(0);
  const [addedQuick, setAddedQuick] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    const unsub = subscribeWishlist(() => {
      setWishlistVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  if (!product) return null;

  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const uid = product.uid || buildProductUid(product.category, product.id);
  const fromParam = product.from || "deals";
  const productUrl = `${normalizedBase}product.html?id=${encodeURIComponent(product.id)}&category=${encodeURIComponent(product.category || "General")}&uid=${encodeURIComponent(uid)}&from=${encodeURIComponent(fromParam)}`;

  const isSaved = isInWishlist(product.uid || product.id);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addProductToCart(product, 1);
    setAddedQuick(true);
    setTimeout(() => setAddedQuick(false), 1200);
  };

  const platformName = product.platform || product.bestOffer?.platform || product.store || "Amazon";
  const rawImage = !imgFailed && (product.image || product.image_url)
    ? resolveImagePath(product.image || product.image_url)
    : getCategoryFallbackImage(product.category, product.name);

  const hasDiscount = Boolean(product.discount && product.discount > 0);
  const showStock = product.stock !== null && product.stock !== undefined;

  return (
    <article
      className="deal-card-v2"
      data-id={product.id}
      data-category={product.category}
    >
      {/* 1. TOP IMAGE AREA */}
      <div className="deal-card-img-wrap">
        <a
          href={productUrl}
          className="deal-card-img-link"
          aria-label={`View details for ${product.name}`}
        >
          <img
            src={rawImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="deal-card-img"
            onError={() => setImgFailed(true)}
          />
        </a>

        {/* Black "N% OFF" pill top-left */}
        {hasDiscount && (
          <span className="deal-card-discount-pill">
            {product.discount}% OFF
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
          <span className="deal-card-cat-label">{product.category || "Deals"}</span>
          {platformName && (
            <span className="deal-platform-chip" title={`Best offer from ${platformName}`}>
              on {platformName}
            </span>
          )}
        </div>

        {/* Bold clickable product name */}
        <h3 className="deal-card-name">
          <a href={productUrl} className="deal-card-name-link">
            {product.name}
          </a>
        </h3>

        {/* Grey brand name */}
        <p className="deal-card-brand">
          {product.brand || platformName || "KSAM Certified"}
        </p>

        {/* 2-line short description */}
        <p className="deal-card-desc">
          {product.description}
        </p>

        {/* Price row */}
        <div className="deal-card-price-row">
          <span className="deal-current-price">
            ₹{Number(product.price || 0).toLocaleString("en-IN")}
          </span>
          {product.oldPrice > product.price && (
            <span className="deal-original-price">
              ₹{Number(product.oldPrice).toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Green stock line */}
        {showStock && (
          <p className="deal-stock-line">
            {product.stock > 0 ? `${product.stock} items available` : "Out of stock"}
          </p>
        )}

        {/* 3. FOOTER ROW */}
        <div className="deal-card-actions">
          {/* Black square cart button */}
          <button
            type="button"
            className={`deal-cart-btn ${addedQuick ? "is-added" : ""}`}
            onClick={handleQuickAddToCart}
            aria-label={`Add ${product.name} to Cart`}
            title="Add to Cart"
            disabled={showStock && product.stock <= 0}
          >
            {addedQuick ? (
              <Check size={20} strokeWidth={2.5} />
            ) : (
              <ShoppingBag size={20} strokeWidth={2} />
            )}
          </button>

          {/* Light-green outlined View Product button */}
          <a
            href={productUrl}
            className="deal-view-btn"
            aria-label={`View details for ${product.name}`}
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
