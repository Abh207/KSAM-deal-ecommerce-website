import React, { useState, useEffect } from "react";
import { ShoppingBag, Check, Heart, Star, Sparkles } from "lucide-react";
import { isInWishlist, toggleWishlist, subscribeWishlist } from "../../lib/wishlist.js";
import { addProductToCart, buildProductUid, resolveImagePath } from "../../lib/cartHelper.js";
import "./DualMarqueeShowcase.css";

function MarqueeCard({ product }) {
  const [, setWishlistVersion] = useState(0);
  const [added, setAdded] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    const unsub = subscribeWishlist(() => setWishlistVersion((v) => v + 1));
    return unsub;
  }, []);

  if (!product) return null;

  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const uid = product.uid || buildProductUid(product.category, product.id);
  const productUrl = `${normalizedBase}product.html?id=${encodeURIComponent(product.id)}&category=${encodeURIComponent(product.category || "General")}&uid=${encodeURIComponent(uid)}&from=${encodeURIComponent(product.category || "lifestyle")}`;

  const isSaved = isInWishlist(product.uid || product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addProductToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const handleToggleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const discount = product.discount || (
    product.oldPrice && product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0
  );

  const imgSrc = !imgErr && product.image
    ? resolveImagePath(product.image)
    : `${normalizedBase}images/remote/unsplash_1553062407-98eeb64c6a62.webp`;

  return (
    <div
      className="marquee-product-card"
      onClick={() => {
        window.location.href = productUrl;
      }}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") window.location.href = productUrl;
      }}
    >
      {/* Light grey image container */}
      <div className="marquee-card-image-wrap">
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          className="marquee-card-img"
          onError={() => setImgErr(true)}
        />

        {/* Top Tag Chip */}
        {discount > 0 ? (
          <span className="marquee-tag-chip discount-chip">{discount}% OFF</span>
        ) : (
          <span className="marquee-tag-chip ksam-chip">KSAM DEAL</span>
        )}

        {/* Round Wishlist Heart */}
        <button
          type="button"
          className={`marquee-wishlist-btn ${isSaved ? "is-active" : ""}`}
          onClick={handleToggleWish}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={16} fill={isSaved ? "#84FF00" : "none"} stroke={isSaved ? "#84FF00" : "#64748b"} />
        </button>
      </div>

      {/* Card Content Body */}
      <div className="marquee-card-body">
        {/* Category Label in Green Caps */}
        <span className="marquee-card-category">
          {product.category || "Accessories"}
        </span>

        {/* Bold Title */}
        <h4 className="marquee-card-title" title={product.name}>
          {product.name}
        </h4>

        {/* Grey Subtitle / Brand */}
        <p className="marquee-card-subtitle">
          {product.brand || "KSAM Certified Collection"}
        </p>

        {/* Rating Row */}
        <div className="marquee-card-rating">
          <div className="marquee-stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={13}
                fill={s <= Math.round(Number(product.rating || 4.8)) ? "#fbbf24" : "none"}
                stroke="#fbbf24"
              />
            ))}
          </div>
          <span className="marquee-rating-val">{product.rating || 4.8}</span>
          <span className="marquee-reviews-count">({product.reviews || 95})</span>
        </div>

        {/* Bottom Price & Add to Cart Row */}
        <div className="marquee-card-footer">
          <div className="marquee-price-box">
            <span className="marquee-current-price">
              ₹{Number(product.price || 0).toLocaleString("en-IN")}
            </span>
            {product.oldPrice > product.price && (
              <span className="marquee-old-price">
                ₹{Number(product.oldPrice).toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Pill-shaped Add to Cart Button */}
          <button
            type="button"
            className={`marquee-cart-pill-btn ${added ? "is-added" : ""}`}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? (
              <>
                <Check size={15} strokeWidth={3} />
                <span>Added ✓</span>
              </>
            ) : (
              <>
                <ShoppingBag size={15} />
                <span>+</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DualMarqueeShowcase({ products = [], categoryLabel = "Curated Showcase" }) {
  if (!Array.isArray(products) || products.length === 0) return null;

  // Split products into two sets for the two rows
  const half = Math.ceil(products.length / 2);
  const row1Products = products.slice(0, half);
  const row2Products = products.slice(half);

  // Duplicate for seamless infinite loop
  const row1Items = [...row1Products, ...row1Products, ...row1Products];
  const row2Items = [...row2Products, ...row2Products, ...row2Products];

  return (
    <section className="dual-marquee-showcase-section" id="accessories-collection-section">
      <div className="dual-marquee-header">
        <div className="dual-marquee-badge">
          <Sparkles size={14} />
          <span>FEATURED SPOTLIGHT</span>
        </div>
        <h2 className="dual-marquee-heading">Trending {categoryLabel}</h2>
        <p className="dual-marquee-sub">
          Continuous live drops refreshed in real-time. Hover or tap any card to pause.
        </p>
      </div>

      {/* Row 1: LEFT -> RIGHT */}
      <div className="marquee-track-container" aria-label="Row 1 items moving left to right">
        <div className="marquee-track row-left-to-right">
          {row1Items.map((prod, idx) => (
            <MarqueeCard key={`row1-${prod.id}-${idx}`} product={prod} />
          ))}
        </div>
      </div>

      {/* Row 2: RIGHT -> LEFT */}
      <div className="marquee-track-container" aria-label="Row 2 items moving right to left">
        <div className="marquee-track row-right-to-left">
          {row2Items.map((prod, idx) => (
            <MarqueeCard key={`row2-${prod.id}-${idx}`} product={prod} />
          ))}
        </div>
      </div>
    </section>
  );
}

