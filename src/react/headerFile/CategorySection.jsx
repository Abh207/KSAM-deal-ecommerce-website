import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import categoryData from "../../api/categorySection.json";
import {
  getCategoryProducts,
  getCategoryBannerOverride,
  resolveProductImage,
} from "./categoryDataMap.js";
import "./CategorySection.css";

/* =========================================================
   CATEGORY SECTION – design.png exact rebuild
   ─────────────────────────────────────────────
   • Dark emerald frame (radius 32 px, glowing border)
   • Header: "Shop by Category" (green gradient on "Category")
   • Left panel: glass vertical list (tablist / tab roles)
   • Right panel: featured banner + thumbnail carousel
   • Mobile: horizontal chip row instead of list
   • Empty categories: gradient placeholder, "Coming soon" pill
   • Click on list row → activate only (no navigation)
   • "View All" on banner → navigate via category.link
   • Keyboard: ArrowUp / ArrowDown on list, ArrowLeft / ArrowRight on thumbs
   • prefers-reduced-motion: no pulse, no crossfade
   ========================================================= */

/* ---------- SVG line-icons for each category ---------- */
const CATEGORY_ICONS = {
  watches: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <circle cx="12" cy="12" r="7" /><path d="M12 9v3l2 1" /><path d="M9 2h6" /><path d="M9 22h6" />
    </svg>
  ),
  electronics: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" />
    </svg>
  ),
  shoes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M3 18h18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1Z" /><path d="M3 18c0-4 1-7 4-9l2-1.5c1-.7 2-2 2-3.5V3a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v1c0 1 .5 2 1.5 2.5L17 8c2 1.2 4 4 4 10" />
    </svg>
  ),
  fashion: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M15.5 2H8.5L5 7l7 15 7-15-4.5-5Z" /><path d="M5 7h14" /><path d="M8.5 2L12 7l3.5-5" />
    </svg>
  ),
  beauty: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M12 2a5 5 0 0 1 5 5v4a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5Z" /><path d="M10 22h4" /><path d="M12 16v6" />
    </svg>
  ),
  cloths: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M15 2H9l-4 4 3 3 1-1v12a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V8l1 1 3-3-4-4Z" />
    </svg>
  ),
  chairs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M5 11a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /><path d="M6 17v4" /><path d="M18 17v4" />
    </svg>
  ),
  speakers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <rect x="4" y="2" width="16" height="20" rx="2" /><circle cx="12" cy="14" r="4" /><circle cx="12" cy="14" r="1" /><line x1="12" y1="6" x2="12.01" y2="6" />
    </svg>
  ),
};

function getIconForCategory(id) {
  const key = String(id).toLowerCase();
  return CATEGORY_ICONS[key] || (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 3v18" />
    </svg>
  );
}

/* ---------- Redesigned Vertical Category Product Card ---------- */
function CategoryProductCard({ product, category }) {
  const [imgError, setImgError] = useState(false);
  const resolvedImg = resolveProductImage(product.image);

  const title = product.name && String(product.name).trim() !== ""
    ? product.name
    : `${category.name || "Featured"} Item`;

  const subtext = (() => {
    if (product.price !== undefined && product.price !== null && product.price !== "") {
      const num = typeof product.price === "number"
        ? product.price
        : parseFloat(String(product.price).replace(/[^0-9.]/g, ""));
      if (!isNaN(num)) {
        const isRupee = ["shoes", "cloths", "beauty", "speakers"].includes(String(category.id).toLowerCase());
        return `${isRupee ? "₹" : "$"}${num.toLocaleString("en-IN")}`;
      }
      return String(product.price);
    }
    return product.category || category.name || "Special Offer";
  })();

  const handleCardClick = () => {
    const target = product.link || category.link;
    if (target) window.location.href = target;
  };

  return (
    <div
      className="cs-product-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`${title} - ${subtext}`}
    >
      {/* 1. IMAGE AREA at the top */}
      <div className="cs-card-img-wrap">
        {resolvedImg && !imgError ? (
          <img
            src={resolvedImg}
            alt={title}
            className="cs-card-img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="cs-card-img-placeholder" aria-hidden="true">
            <span className="cs-card-placeholder-icon">
              {getIconForCategory(category.id)}
            </span>
          </div>
        )}
      </div>

      {/* 2. TEXT AREA below image */}
      <div className="cs-card-content">
        <div className="cs-card-text">
          <h4 className="cs-card-title" title={title}>
            {title}
          </h4>
          <p className="cs-card-subtext">
            {subtext}
          </p>
        </div>

        {/* 3. FOOTER ROW: Explore Now link + Circular Arrow Button */}
        <div className="cs-card-footer">
          <span className="cs-card-explore">
            Explore Now <span aria-hidden="true" className="cs-card-explore-arrow">→</span>
          </span>
          <button
            type="button"
            className="cs-card-arrow-btn"
            aria-label={`Explore ${title}`}
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}


function CategorySection({ onViewAllClick, onCategorySelect }) {
  /* ======================================================
     BUILD CATEGORIES using each category page's own dataset
  ====================================================== */
  const categories = useMemo(() => {
    return categoryData.categories.map((cat) => {
      // 1. Fetch real products from category page dataset via mapping config
      const allCatProducts = getCategoryProducts(cat.id);

      // 2. Banner image priority:
      //    a. Explicit bannerImage in categorySection.json
      //    b. Explicit bannerImage override in CATEGORY_DATA_MAP
      //    c. First product's image in the category dataset
      //    d. Fallback to null (gradient background + icon)
      let bannerRaw = null;
      if (cat.bannerImage && typeof cat.bannerImage === "string" && cat.bannerImage.trim() !== "") {
        bannerRaw = cat.bannerImage.trim();
      } else {
        const configBanner = getCategoryBannerOverride(cat.id);
        if (configBanner && typeof configBanner === "string" && configBanner.trim() !== "") {
          bannerRaw = configBanner.trim();
        } else if (allCatProducts.length > 0) {
          const firstWithImg = allCatProducts.find((p) => Boolean(p.image));
          if (firstWithImg) {
            bannerRaw = firstWithImg.image;
          }
        }
      }

      const bannerImg = bannerRaw ? resolveProductImage(bannerRaw) : null;

      // 3. Thumbnails: real product images up to 16
      const thumbProducts = allCatProducts.slice(0, 16);

      return {
        ...cat,
        productCount: allCatProducts.length,
        bannerImage: bannerImg,
        products: thumbProducts,
      };
    });
  }, []);


  /* ======================================================
     ACTIVE CATEGORY STATE
  ====================================================== */
  // Default to first category in categorySection.json ("watches")
  const initialCatId = categories[0]?.id || "watches";

  const [activeCatId, setActiveCatId] = useState(initialCatId);
  const [bannerFailed, setBannerFailed] = useState(false);

  // Sync initialCatId on first render
  useEffect(() => {
    if (initialCatId && !activeCatId) setActiveCatId(initialCatId);
  }, [initialCatId, activeCatId]);

  const activeCategory = categories.find((c) => c.id === activeCatId) || categories[0] || {};
  const isEmpty = activeCategory.productCount === 0;

  // Crossfade key – triggers CSS transition
  const [fadeKey, setFadeKey] = useState(activeCatId);
  const [fading, setFading] = useState(false);

  // Category selection only updates internal section state (NO window scroll, NO grid filter side-effects)
  const handleSelect = useCallback(
    (catId) => {
      if (catId === activeCatId) return;
      setFading(true);
      setTimeout(() => {
        setActiveCatId(catId);
        setFadeKey(catId);
        setBannerFailed(false);
        setFading(false);
      }, 180); // matches CSS transition
    },
    [activeCatId]
  );


  /* ======================================================
     THUMBNAIL CAROUSEL SCROLL
  ====================================================== */
  const thumbRef = useRef(null);
  const [canThumbLeft, setCanThumbLeft] = useState(false);
  const [canThumbRight, setCanThumbRight] = useState(false);

  const updateThumbScroll = useCallback(() => {
    const el = thumbRef.current;
    if (!el) { setCanThumbLeft(false); setCanThumbRight(false); return; }
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanThumbLeft(scrollLeft > 5);
    setCanThumbRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = thumbRef.current;
    if (!el) return;
    // Reset scroll position when category changes
    el.scrollLeft = 0;
    updateThumbScroll();
    const onScroll = () => updateThumbScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateThumbScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateThumbScroll);
    };
  }, [fadeKey, updateThumbScroll]);

  const scrollThumbs = (dir) => {
    const el = thumbRef.current;
    if (!el) return;
    const card = el.querySelector(".cs-product-card");
    const step = card ? card.offsetWidth + 12 : 217;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };


  /* ======================================================
     MOBILE CHIP SCROLL – container-only horizontal scroll (never scrolls the window)
  ====================================================== */
  const chipRowRef = useRef(null);
  useEffect(() => {
    const row = chipRowRef.current;
    if (!row) return;
    const activeChip = row.querySelector(".cs-chip.active");
    if (activeChip) {
      const chipLeft = activeChip.offsetLeft;
      const chipWidth = activeChip.offsetWidth;
      const rowWidth = row.offsetWidth;
      const targetScroll = chipLeft - rowWidth / 2 + chipWidth / 2;
      row.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  }, [activeCatId]);


  /* ======================================================
     KEYBOARD NAVIGATION on list (ArrowUp / ArrowDown / Enter / Space)
  ====================================================== */
  const handleListKeyDown = useCallback(
    (e) => {
      const idx = categories.findIndex((c) => c.id === activeCatId);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = (idx + 1) % categories.length;
        const nextId = categories[next].id;
        handleSelect(nextId);
        const nextBtn = document.getElementById(tabId(nextId));
        nextBtn?.focus({ preventScroll: true });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = (idx - 1 + categories.length) % categories.length;
        const prevId = categories[prev].id;
        handleSelect(prevId);
        const prevBtn = document.getElementById(tabId(prevId));
        prevBtn?.focus({ preventScroll: true });
      }
    },
    [categories, activeCatId, handleSelect]
  );


  /* ======================================================
     RENDER
  ====================================================== */
  const panelId = `cs-panel-${activeCatId}`;
  const tabId = (id) => `cs-tab-${id}`;

  return (
    <section className="cs-section" aria-label="Shop by Category">
      {/* ──── HEADER ──── */}
      <div className="cs-header">
        <div className="cs-header-text">
          <h2 className="cs-title">
            Shop by <span className="cs-title-accent">Category</span>
          </h2>
          <p className="cs-subtitle">Smart choices for a better tomorrow.</p>
        </div>

        {categoryData.section.showViewAll && (
          <button
            type="button"
            className="cs-header-pill"
            onClick={(e) => {
              e.preventDefault();
              if (onViewAllClick) {
                onViewAllClick();
              } else if (onCategorySelect) {
                onCategorySelect(null);
              }
            }}
            aria-label="View all categories"
          >
            View All <span aria-hidden="true">→</span>
          </button>
        )}
      </div>

      {/* ──── DARK EMERALD FRAME ──── */}
      <div className="cs-frame">
        {/* ── LEFT: vertical glass list (desktop / tablet) ── */}
        <nav
          className="cs-list-panel"
          role="tablist"
          aria-label="Category list"
          aria-orientation="vertical"
          onKeyDown={handleListKeyDown}
        >
          {categories.map((cat) => {
            const isActive = cat.id === activeCatId;
            return (
              <button
                key={cat.id}
                id={tabId(cat.id)}
                role="tab"
                type="button"
                tabIndex={isActive ? 0 : -1}
                aria-selected={isActive}
                aria-controls={panelId}
                className={`cs-list-item${isActive ? " active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(cat.id);
                }}
              >
                <span className="cs-list-icon" aria-hidden="true">
                  {getIconForCategory(cat.id)}
                </span>
                <span className="cs-list-name">{cat.name}</span>
                <ChevronRight className="cs-list-chevron" size={16} />
              </button>
            );
          })}
        </nav>

        {/* ── MOBILE: horizontal chip row ── */}
        <div className="cs-chip-row" ref={chipRowRef} role="tablist" aria-label="Category list" aria-orientation="horizontal">
          {categories.map((cat) => {
            const isActive = cat.id === activeCatId;
            return (
              <button
                key={cat.id}
                role="tab"
                type="button"
                tabIndex={isActive ? 0 : -1}
                aria-selected={isActive}
                aria-controls={panelId}
                className={`cs-chip${isActive ? " active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(cat.id);
                }}
              >
                <span className="cs-chip-icon" aria-hidden="true">
                  {getIconForCategory(cat.id)}
                </span>
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* ── RIGHT: banner + thumbnails (tabpanel) ── */}
        <div
          className="cs-detail-panel"
          id={panelId}
          role="tabpanel"
          aria-labelledby={tabId(activeCatId)}
        >
          {/* FEATURED BANNER */}
          <div className={`cs-banner${fading ? " cs-fade-out" : " cs-fade-in"}${isEmpty ? " cs-banner-empty" : ""}`} key={fadeKey}>
            {/* Background: product image or gradient */}
            {activeCategory.bannerImage && !isEmpty && !bannerFailed ? (
              <div className="cs-banner-img-wrap">
                <img
                  src={activeCategory.bannerImage}
                  alt={activeCategory.name}
                  className="cs-banner-img"
                  loading="eager"
                  width="400"
                  height="300"
                  onError={() => setBannerFailed(true)}
                />
              </div>
            ) : (
              <div className="cs-banner-icon-placeholder" aria-hidden="true">
                <span className="cs-banner-big-icon">{activeCategory.icon}</span>
              </div>
            )}

            {/* Text overlay */}
            <div className="cs-banner-overlay">
              <h3 className="cs-banner-title">{activeCategory.name}</h3>
              <p className="cs-banner-count">
                <strong>{activeCategory.productCount}</strong>{" "}
                {activeCategory.productCount === 1 ? "Product" : "Products"}
                {isEmpty && <span className="cs-coming-soon">Coming soon</span>}
              </p>
              {isEmpty && (
                <p className="cs-banner-empty-msg">New products arriving soon</p>
              )}

              {!isEmpty ? (
                <button
                  type="button"
                  className="cs-banner-btn"
                  onClick={() => {
                    if (activeCategory.link) window.location.href = activeCategory.link;
                  }}
                >
                  View All <span aria-hidden="true">→</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="cs-banner-btn cs-banner-btn-disabled"
                  aria-disabled="true"
                  tabIndex={-1}
                >
                  View All <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          </div>

          {/* THUMBNAIL ROW – only when products exist */}
          {!isEmpty && (
            <div className={`cs-thumb-wrap${fading ? " cs-fade-out" : " cs-fade-in"}`}>
              <button
                type="button"
                className="cs-thumb-arrow prev"
                onClick={() => scrollThumbs(-1)}
                disabled={!canThumbLeft}
                aria-label="Scroll thumbnails left"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="cs-thumb-row" ref={thumbRef}>
                {activeCategory.products.map((p, idx) => (
                  <CategoryProductCard
                    key={p.id || idx}
                    product={p}
                    category={activeCategory}
                  />
                ))}
              </div>

              <button
                type="button"
                className="cs-thumb-arrow next"
                onClick={() => scrollThumbs(1)}
                disabled={!canThumbRight}
                aria-label="Scroll thumbnails right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CategorySection;