import React, { useEffect, useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Heart, Trash2, ArrowRight, X, ArrowUp, ShoppingCart, Star } from "lucide-react";

import Navbar from "../deals/components/Navbar.jsx";
import WishlistHeroIllustration from "./WishlistHeroIllustration.jsx";
import {
  getWishlist,
  removeFromWishlist,
  clearWishlist,
  subscribeWishlist,
  showWishlistToast
} from "../lib/wishlist.js";
import {
  formatPrice,
  resolveImagePath,
  DEFAULT_PLACEHOLDER_IMAGE,
  addProductToCart,
  buildProductUid
} from "../lib/cartHelper.js";

import "./watchwishlist.css";

function WishlistProductCard({
  product,
  isRemoving,
  onRemove,
  onOpen,
  onAddToCart
}) {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [cardImage, setCardImage] = useState(() => resolveImagePath(product.image));

  // Determine colors: product.colors if available (up to 4), else fallback [#15803d, #111111, #a3a3a3]
  const colors = useMemo(() => {
    if (Array.isArray(product.colors) && product.colors.length > 0) {
      return product.colors.slice(0, 4).map((c) => {
        if (typeof c === "string") return { hex: c };
        return { hex: c.hex || c.color || "#15803d", image: c.image };
      });
    }
    return [
      { hex: "#15803d" },
      { hex: "#111111" },
      { hex: "#a3a3a3" }
    ];
  }, [product]);

  const handleColorClick = (e, idx, colorObj) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColorIdx(idx);
    if (colorObj.image) {
      setCardImage(resolveImagePath(colorObj.image));
    }
  };

  const rawOldPrice =
    product.originalPrice ||
    product.oldPrice ||
    product.actualPrice ||
    product.mrp ||
    0;
  const hasDiscount = Boolean(rawOldPrice && rawOldPrice > product.price);
  const discountPct = hasDiscount
    ? Math.round(((rawOldPrice - product.price) / rawOldPrice) * 100)
    : 0;

  const ratingVal = product.rating ? Number(product.rating) : 4.5;

  return (
    <article
      className={`ksam-wishlist-card${isRemoving ? " is-removing" : ""}`}
      onClick={(e) => onOpen(e, product)}
    >
      {/* 2. Top-Left: Discount Pill & Top-Right: Heart Button */}
      <div className="ksam-wishlist-card-top">
        {discountPct > 0 ? (
          <span className="ksam-wishlist-discount-pill">
            -{discountPct}%
          </span>
        ) : (
          <span className="ksam-wishlist-pill-spacer" />
        )}

        <button
          type="button"
          className="ksam-wishlist-heart-btn"
          onClick={(e) => onRemove(e, product)}
          aria-label={`Remove ${product.name} from wishlist`}
          title="Remove from wishlist"
        >
          <Heart size={18} fill="#111111" color="#111111" />
        </button>
      </div>

      {/* 4. Large Centered Product Image */}
      <div className="ksam-wishlist-card-image">
        <img
          src={cardImage}
          alt={product.name || "Product"}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE;
          }}
        />
      </div>

      {/* 5. Text Area */}
      <div className="ksam-wishlist-card-body">
        <h3
          className="ksam-wishlist-card-title"
          title={product.name}
          onClick={(e) => onOpen(e, product)}
        >
          {product.name}
        </h3>

        {/* Rating Row: 5 Gold Stars (16px) + rating text (15px) */}
        <div className="ksam-wishlist-card-rating">
          <div className="ksam-wishlist-stars" aria-hidden="true">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className="ksam-wishlist-star"
                fill="#fbbf24"
                stroke="#fbbf24"
                strokeWidth={0}
              />
            ))}
          </div>
          <span className="ksam-wishlist-rating-val">({ratingVal.toFixed(1)})</span>
        </div>

        {/* Price Row: current price 28px, original price 18px */}
        <div className="ksam-wishlist-card-prices">
          <span className="ksam-wishlist-card-price">
            {formatPrice(product.price)}
          </span>
          {hasDiscount ? (
            <span className="ksam-wishlist-card-oldprice">
              {formatPrice(rawOldPrice)}
            </span>
          ) : null}
        </div>

        {/* 6. Color Swatches Row (24px) */}
        <div className="ksam-wishlist-swatches" role="radiogroup" aria-label="Color options">
          {colors.map((colorObj, idx) => {
            const isSelected = selectedColorIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`ksam-wishlist-swatch${isSelected ? " is-selected" : ""}`}
                style={{ backgroundColor: colorObj.hex }}
                onClick={(e) => handleColorClick(e, idx, colorObj)}
                title={`Color ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* 7. Button Row (bottom, 52px high) */}
        <div className="ksam-wishlist-card-actions">
          <button
            type="button"
            className="ksam-wishlist-cart-btn"
            onClick={(e) => onAddToCart(e, product)}
            aria-label={`Add ${product.name} to cart`}
            title="Add to Cart"
          >
            <ShoppingCart size={22} color="#111111" strokeWidth={2.2} />
          </button>

          <button
            type="button"
            className="ksam-wishlist-view-btn"
            onClick={(e) => onOpen(e, product)}
            aria-label={`View product details for ${product.name}`}
          >
            <span>View Product</span>
            <ArrowRight size={18} className="ksam-wishlist-view-arrow" />
          </button>
        </div>
      </div>
    </article>
  );
}

function WishlistPage() {
  const [wishlist, setWishlist] = useState(() => getWishlist());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [removingIds, setRemovingIds] = useState(new Set());
  const [showClearModal, setShowClearModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const shopUrl = `${normalizedBase}shop.html`;

  // Track scroll position for the back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Subscribe to wishlist updates across all tabs & actions
  useEffect(() => {
    setWishlist(getWishlist());
    const unsubscribe = subscribeWishlist((count, items) => {
      setWishlist(items);
    });
    return unsubscribe;
  }, []);

  // Dynamic category filter chips
  const categories = useMemo(() => {
    const cats = new Set();
    wishlist.forEach((item) => {
      if (item.category && typeof item.category === "string") {
        cats.add(item.category);
      }
    });
    return ["All", ...Array.from(cats)];
  }, [wishlist]);

  // Filtered items
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return wishlist;
    return wishlist.filter(
      (item) => (item.category || "").toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [wishlist, selectedCategory]);

  // Remove handler with smooth animation
  const handleRemove = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const targetKey = product?.uid || String(product?.id || product);
    setRemovingIds((prev) => new Set(prev).add(targetKey));

    setTimeout(() => {
      removeFromWishlist(product);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetKey);
        return next;
      });
    }, 280);
  };

  // Navigate to product details page in the same tab
  const handleOpenProduct = (e, product) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const id = product.id !== undefined && product.id !== null ? product.id : "";
    const category = product.category || "";
    const uid = product.uid || buildProductUid(category, id);
    window.location.href = `${normalizedBase}product.html?id=${encodeURIComponent(id)}&category=${encodeURIComponent(category)}&uid=${encodeURIComponent(uid)}`;
  };

  // Add to cart handler with toast
  const handleAddToCart = (e, product) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addProductToCart(product, 1);
    showWishlistToast("Added to Cart");
  };

  // Clear all handler
  const handleConfirmClear = () => {
    clearWishlist();
    setShowClearModal(false);
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div className="ksam-wishlist-page">
      {/* 1. Global KSAM Navbar */}
      <Navbar />

      <main className="ksam-wishlist-main">
        {/* 2. Page Header: Exact Rounded Banner Card Matching Image 1 */}
        <section className="ksam-wishlist-banner-wrapper">
          <div className="ksam-wishlist-banner-card">
            {/* Top row: Two columns (Left: Text, Right: Illustration ~45%) */}
            <div className="ksam-wishlist-banner-top">
              <div className="ksam-wishlist-banner-text">
                <h1 className="ksam-wishlist-banner-title">
                  My <span className="ksam-wishlist-title-highlight">Wishlist</span>
                </h1>
                <p className="ksam-wishlist-banner-subtitle">
                  {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved across all categories
                </p>
              </div>

              <div className="ksam-wishlist-banner-illustration">
                <WishlistHeroIllustration />
              </div>
            </div>

            {/* Bottom row: Filter Bar inside the banner */}
            <div className="ksam-wishlist-filter-bar">
              <div className="ksam-wishlist-chips" role="tablist" aria-label="Filter by category">
                {categories.map((cat) => {
                  const count =
                    cat === "All"
                      ? wishlist.length
                      : wishlist.filter(
                          (p) => (p.category || "").toLowerCase() === cat.toLowerCase()
                        ).length;
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`ksam-wishlist-chip${isActive ? " is-active" : ""}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <span className="ksam-wishlist-chip-name">{cat}</span>
                      <span className="ksam-wishlist-chip-count">{count}</span>
                    </button>
                  );
                })}
              </div>

              {wishlist.length > 0 && (
                <button
                  type="button"
                  className="ksam-wishlist-clear-btn"
                  onClick={() => setShowClearModal(true)}
                  aria-label="Clear all items from wishlist"
                >
                  <Trash2 size={16} className="ksam-wishlist-trash-icon" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 3. Products Grid or Empty State */}
        <div className="ksam-wishlist-container">
          {wishlist.length === 0 ? (
            /* Empty State */
            <section className="ksam-wishlist-empty">
              <div className="ksam-wishlist-empty-icon-wrap" aria-hidden="true">
                <Heart size={44} className="ksam-wishlist-empty-icon" fill="#ffffff" color="#ffffff" />
              </div>

              <h2>Your wishlist is empty</h2>
              <p>
                Explore our catalog of watches, electronics, clothing, shoes, chairs, and verified deals. Tap the heart icon to save products here!
              </p>

              <a href={shopUrl} className="ksam-wishlist-cta-btn">
                <span>Continue Shopping</span>
                <ArrowRight size={16} />
              </a>
            </section>
          ) : filteredProducts.length === 0 ? (
            <div className="ksam-wishlist-empty-filter">
              <p>No saved items found under "{selectedCategory}".</p>
              <button
                type="button"
                className="ksam-wishlist-reset-btn"
                onClick={() => setSelectedCategory("All")}
              >
                Show All Categories
              </button>
            </div>
          ) : (
            /* Responsive Grid */
            <div className="ksam-wishlist-grid">
              {filteredProducts.map((product) => (
                <WishlistProductCard
                  key={product.uid || product.id}
                  product={product}
                  isRemoving={removingIds.has(product.uid || String(product.id))}
                  onRemove={handleRemove}
                  onOpen={handleOpenProduct}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Scroll to Top Button */}
      <button
        type="button"
        className={`ksam-wishlist-scrolltop-btn${showScrollTop ? " is-visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>

      {/* Confirmation Modal for Clear All - NO RED */}
      {showClearModal && (
        <div className="ksam-wishlist-modal-backdrop" onClick={() => setShowClearModal(false)}>
          <div
            className="ksam-wishlist-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="ksam-wishlist-modal-close"
              onClick={() => setShowClearModal(false)}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
            <div className="ksam-wishlist-modal-icon">
              <Trash2 size={24} style={{ color: "#ffffff" }} />
            </div>
            <h3 id="clear-modal-title">Clear Wishlist?</h3>
            <p>Are you sure you want to remove all {wishlist.length} saved products from your wishlist?</p>
            <div className="ksam-wishlist-modal-btns">
              <button
                type="button"
                className="ksam-wishlist-modal-cancel"
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ksam-wishlist-modal-confirm"
                onClick={handleConfirmClear}
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
      {/* NO FOOTER per requirement */}
    </div>
  );
}

const rootEl = document.getElementById("watchwishlist-root");
if (rootEl) {
  createRoot(rootEl).render(<WishlistPage />);
}