import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  Heart,
  Trash2,
  ArrowRight,
  X,
  ArrowUp,
  ShoppingBag,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import Navbar from "../deals/components/Navbar.jsx";
import WishlistHeroIllustration from "./WishlistHeroIllustration.jsx";
import {
  getWishlist,
  removeFromWishlist,
  clearWishlist,
  subscribeWishlist,
  showWishlistToast,
  toggleWishlist,
  isInWishlist
} from "../lib/wishlist.js";
import {
  formatPrice,
  resolveImagePath,
  DEFAULT_PLACEHOLDER_IMAGE,
  addProductToCart,
  buildProductUid
} from "../lib/cartHelper.js";
import {
  getAllMasterProducts,
  CATEGORY_PARENT_MAP
} from "../lib/productCatalog.js";

import "./watchwishlist.css";

/**
 * Task 3: New Wishlist Product Card Design (matching image 5)
 * - White card, radius 24px, soft shadow
 * - Top image area: #F8FAFC, height ~240px, centered image contain
 * - Top-left: black pill with white text "50% OFF"
 * - Top-right: round dark-grey translucent heart button
 * - Category in dark green caps, bold black title, slate-grey brand, 2-line grey description
 * - Black weight 900 price, grey struck-through old price, green stock text
 * - Square black cart button + wide light-green "View Product →" button
 */
function WishlistProductCard({
  product,
  isRemoving,
  onRemove,
  onOpen,
  onAddToCart,
  isSaved = true,
  tabIndex = 0
}) {
  const [added, setAdded] = useState(false);
  const cardImage = resolveImagePath(product.image);

  const rawOldPrice =
    product.originalPrice ||
    product.oldPrice ||
    product.actualPrice ||
    product.mrp ||
    0;
  const hasDiscount = Boolean(rawOldPrice && rawOldPrice > product.price);
  const discountPct = product.discount
    ? Number(product.discount)
    : hasDiscount
    ? Math.round(((rawOldPrice - product.price) / rawOldPrice) * 100)
    : 0;

  // Category fallback
  const categoryLabel = (product.category || "GENERAL").toUpperCase();

  // Brand fallback
  const brandName =
    product.brand ||
    product.company ||
    (product.category ? `${product.category} Edition` : "KSAM Exclusive");

  // Description fallback
  const descriptionText =
    product.description ||
    product.shortDesc ||
    product.desc ||
    `Crafted with premium materials for timeless design, supreme durability, and daily comfort.`;

  // Stock fallback
  const stockCount =
    typeof product.stock === "number" && product.stock > 0
      ? product.stock
      : 8;

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(e, product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article
      className={`kx-wish-card${isRemoving ? " is-removing" : ""}`}
      onClick={(e) => onOpen(e, product)}
      tabIndex={tabIndex}
    >
      {/* 1. Top Image Area (#F8FAFC, ~240px) */}
      <div className="kx-wish-media">
        {/* Top-Left Chip: Black pill with white text "50% OFF" */}
        {discountPct > 0 ? (
          <span className="kx-wish-discount-chip">{discountPct}% OFF</span>
        ) : (
          <span className="kx-wish-discount-chip">SPECIAL</span>
        )}

        {/* Top-Right: Round dark-grey translucent heart button */}
        <button
          type="button"
          className={`kx-wish-heart-btn${isSaved ? " is-saved" : ""}`}
          onClick={(e) => onRemove(e, product)}
          aria-label={
            isSaved
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          tabIndex={tabIndex}
        >
          <Heart
            size={18}
            fill={isSaved ? "#ffffff" : "none"}
            color="#ffffff"
            strokeWidth={2.2}
          />
        </button>

        {/* Centered Product Image */}
        <div className="kx-wish-img-wrap">
          <img
            src={cardImage}
            alt={product.name || "Product"}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE;
            }}
          />
        </div>
      </div>

      {/* 2. Text Block */}
      <div className="kx-wish-body">
        <span className="kx-wish-category">{categoryLabel}</span>

        <h3 className="kx-wish-title" title={product.name}>
          {product.name}
        </h3>

        <div className="kx-wish-brand">{brandName}</div>

        <p className="kx-wish-desc" title={descriptionText}>
          {descriptionText}
        </p>

        {/* Price Row: Black weight 900, struck-through old price */}
        <div className="kx-wish-price-row">
          <span className="kx-wish-price">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="kx-wish-oldprice">{formatPrice(rawOldPrice)}</span>
          )}
        </div>

        {/* Stock Text: green "8 items available" */}
        <div className="kx-wish-stock">
          <span className="kx-wish-stock-dot" aria-hidden="true" />
          <span>{stockCount} items available</span>
        </div>

        {/* 3. Bottom Row: Square black button + Wide light-green button */}
        <div className="kx-wish-actions">
          <button
            type="button"
            className={`kx-wish-cart-btn${added ? " is-added" : ""}`}
            onClick={handleCartClick}
            aria-label={`Add ${product.name} to cart`}
            title="Add to Cart"
            tabIndex={tabIndex}
          >
            {added ? (
              <Check size={20} color="#84FF00" strokeWidth={2.8} />
            ) : (
              <ShoppingBag size={20} color="#ffffff" strokeWidth={2.2} />
            )}
          </button>

          <button
            type="button"
            className="kx-wish-view-btn"
            onClick={(e) => onOpen(e, product)}
            aria-label={`View product details for ${product.name}`}
            tabIndex={tabIndex}
          >
            <span>View Product</span>
            <span className="kx-wish-view-arrow" aria-hidden="true">→</span>
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
  const handleRemove = useCallback((e, product) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
  }, []);

  // Toggle wishlist for recommendations
  const handleToggleRecWishlist = useCallback((e, product) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleWishlist(product);
  }, []);

  // Navigate to product details page in the same tab
  const handleOpenProduct = useCallback(
    (e, product) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const id = product.id !== undefined && product.id !== null ? product.id : "";
      const category = product.category || "";
      const uid = product.uid || buildProductUid(category, id);
      window.location.href = `${normalizedBase}product.html?id=${encodeURIComponent(
        id
      )}&category=${encodeURIComponent(category)}&uid=${encodeURIComponent(uid)}`;
    },
    [normalizedBase]
  );

  // Add to cart handler with toast
  const handleAddToCart = useCallback((e, product) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addProductToCart(product, 1);
    showWishlistToast("Added to Cart");
  }, []);

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

  // Task 4: Recommended products list from real catalog (16 products, 2 per distinct category)
  const recommendedProducts = useMemo(() => {
    const all = getAllMasterProducts();
    const targetCats = [
      "watches",
      "shoes",
      "electronics",
      "clothes",
      "beauty",
      "furniture",
      "home-appliances",
      "accessories-lifestyle"
    ];
    const byCat = {};
    for (const c of targetCats) byCat[c] = [];

    for (const p of all) {
      const parent = CATEGORY_PARENT_MAP[p.categorySlug] || p.categorySlug;
      if (byCat[parent] && byCat[parent].length < 2) {
        byCat[parent].push(p);
      }
    }
    return Object.values(byCat).flat().slice(0, 16);
  }, []);

  // Set of wishlist UIDs for fast lookup
  const wishlistUidSet = useMemo(() => {
    return new Set(wishlist.map((w) => w.uid || String(w.id)));
  }, [wishlist]);

  // Marquee duration calculations
  const chipsMarqueeDuration = useMemo(() => {
    const count = Math.max(categories.length, 5);
    return `${Math.round((count * 110) / 40)}s`;
  }, [categories.length]);

  const recMarqueeDuration = useMemo(() => {
    // 16 cards * ~244px width (230px card + 14px gap) / 45px/sec ≈ 87s
    const totalPx = recommendedProducts.length * 244;
    return `${Math.round(totalPx / 45)}s`;
  }, [recommendedProducts.length]);

  const [headerVisible, setHeaderVisible] = useState(false);
  const recHeaderRef = useRef(null);

  const [manualShift, setManualShift] = useState(0);
  const [isRecPaused, setIsRecPaused] = useState(false);
  const pauseTimerRef = useRef(null);

  const handleRecScroll = useCallback((dir) => {
    // Card width 230px + 14px gap = 244px
    setManualShift((prev) => prev + dir * 244);
    setIsRecPaused(true);
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }
    pauseTimerRef.current = setTimeout(() => {
      setIsRecPaused(false);
    }, 3000);
  }, []);

  useEffect(() => {
    const el = recHeaderRef.current;
    if (!el) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setHeaderVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [recommendedProducts.length]);

  // Helper to render individual chips
  const renderChip = (cat, isClone) => {
    const count =
      cat === "All"
        ? wishlist.length
        : wishlist.filter(
            (p) => (p.category || "").toLowerCase() === cat.toLowerCase()
          ).length;
    const isActive = selectedCategory === cat;

    return (
      <button
        key={`${isClone ? "clone" : "orig"}-${cat}`}
        type="button"
        role="tab"
        aria-selected={isActive}
        tabIndex={isClone ? -1 : 0}
        className={`ksam-wishlist-chip${isActive ? " is-active" : ""}`}
        onClick={() => setSelectedCategory(cat)}
      >
        <span className="ksam-wishlist-chip-name">{cat}</span>
        <span className="ksam-wishlist-chip-count">{count}</span>
      </button>
    );
  };

  return (
    <div className="ksam-wishlist-page">
      {/* 1. Global KSAM Navbar */}
      <Navbar />

      <main className="ksam-wishlist-main">
        {/* 2. Page Header Banner Card */}
        <section className="ksam-wishlist-banner-wrapper">
          <div className="ksam-wishlist-banner-card">
            {/* Top row: Two columns (Left: Text, Right: Illustration) */}
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

            {/* Task 2: Filter Bar with Auto-Moving Chips on Mobile (<=768px) and Fixed Clear All */}
            <div className="ksam-wishlist-filter-bar">
              <div
                className="ksam-wishlist-chips-viewport"
                style={{ "--chips-speed": chipsMarqueeDuration }}
              >
                <div className="ksam-wishlist-chips-track">
                  {/* Original chips */}
                  <div
                    className="ksam-wishlist-chips-set"
                    role="tablist"
                    aria-label="Filter by category"
                  >
                    {categories.map((cat) => renderChip(cat, false))}
                  </div>

                  {/* Cloned chips for seamless infinite marquee */}
                  <div
                    className="ksam-wishlist-chips-set ksam-wishlist-chips-clone"
                    aria-hidden="true"
                  >
                    {categories.map((cat) => renderChip(cat, true))}
                  </div>
                </div>
              </div>

              {/* Fixed / Pinned Clear All Button at the right end */}
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
                <Heart
                  size={44}
                  className="ksam-wishlist-empty-icon"
                  fill="#ffffff"
                  color="#ffffff"
                />
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
            /* Responsive Grid (Task 3: 4 cols desktop, 2 tablet, 1 or 2 mobile) */
            <div className="kx-wishlist-grid">
              {filteredProducts.map((product) => (
                <WishlistProductCard
                  key={product.uid || product.id}
                  product={product}
                  isRemoving={removingIds.has(product.uid || String(product.id))}
                  onRemove={handleRemove}
                  onOpen={handleOpenProduct}
                  onAddToCart={handleAddToCart}
                  isSaved={true}
                  tabIndex={0}
                />
              ))}
            </div>
          )}
        </div>

        {/* Task 4: Auto-Moving "You May Also Like" Products Row */}
        {recommendedProducts.length > 0 && (
          <section
            className="kx-rec-section"
            aria-label="Recommended products"
            style={{ "--rec-speed": recMarqueeDuration }}
          >
            <div className="kx-rec-container">
              {/* Header: Proper block with DISCOVER pill + sparkle + blinking dot, gradient title, subtitle, line sweep, and desktop arrows */}
              <div
                className={`kx-rec-header ${headerVisible ? "is-visible" : ""}`}
                ref={recHeaderRef}
              >
                <div className="kx-rec-header-text-block">
                  <div className="kx-rec-tag-pill">
                    <Sparkles size={14} className="kx-rec-sparkle-icon" />
                    <span className="kx-rec-dot" aria-hidden="true" />
                    <span className="kx-rec-tag-text">DISCOVER</span>
                  </div>

                  <h2 className="kx-rec-title">
                    You may <span className="kx-rec-title-gradient">also like</span>
                  </h2>

                  <p className="kx-rec-subtitle">
                    Hand-picked products from every category, just for you.
                  </p>

                  <div className="kx-rec-accent-line" aria-hidden="true">
                    <div className="kx-rec-line-sweep" />
                  </div>
                </div>

                {/* Right side arrow buttons (desktop only, hidden on mobile) */}
                <div className="kx-rec-arrow-controls" aria-label="Recommendation navigation">
                  <button
                    type="button"
                    className="kx-rec-nav-btn prev-btn"
                    onClick={() => handleRecScroll(1)}
                    aria-label="Previous recommendations"
                    title="Previous recommendations"
                  >
                    <ChevronLeft size={22} strokeWidth={2.4} />
                  </button>
                  <button
                    type="button"
                    className="kx-rec-nav-btn next-btn"
                    onClick={() => handleRecScroll(-1)}
                    aria-label="Next recommendations"
                    title="Next recommendations"
                  >
                    <ChevronRight size={22} strokeWidth={2.4} />
                  </button>
                </div>
              </div>

              {/* Auto-moving Row: Continuous LEFT to RIGHT marquee with manual scroll shift support */}
              <div className="kx-rec-marquee-viewport">
                <div
                  className="kx-rec-marquee-shift-wrapper"
                  style={{
                    transform: `translateX(${manualShift}px)`,
                    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                  }}
                >
                  <div
                    className={`kx-rec-marquee-track ${isRecPaused ? "is-manual-paused" : ""}`}
                  >
                    {/* Original row of 16 cards */}
                    <div className="kx-rec-marquee-group">
                      {recommendedProducts.map((prod) => (
                        <div key={`orig-rec-${prod.uid || prod.id}`} className="kx-rec-card-wrap">
                          <WishlistProductCard
                            product={prod}
                            isRemoving={false}
                            onRemove={handleToggleRecWishlist}
                            onOpen={handleOpenProduct}
                            onAddToCart={handleAddToCart}
                            isSaved={wishlistUidSet.has(prod.uid || String(prod.id))}
                            tabIndex={0}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Cloned row for seamless infinite marquee */}
                    <div className="kx-rec-marquee-group kx-rec-marquee-clone" aria-hidden="true">
                      {recommendedProducts.map((prod) => (
                        <div key={`clone-rec-${prod.uid || prod.id}`} className="kx-rec-card-wrap">
                          <WishlistProductCard
                            product={prod}
                            isRemoving={false}
                            onRemove={handleToggleRecWishlist}
                            onOpen={handleOpenProduct}
                            onAddToCart={handleAddToCart}
                            isSaved={wishlistUidSet.has(prod.uid || String(prod.id))}
                            tabIndex={-1}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
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

      {/* Confirmation Modal for Clear All */}
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
            <p>
              Are you sure you want to remove all {wishlist.length} saved products from your wishlist?
            </p>
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
    </div>
  );
}

const rootEl = document.getElementById("watchwishlist-root");
if (rootEl) {
  createRoot(rootEl).render(<WishlistPage />);
}

export default WishlistPage;