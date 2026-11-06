import React, { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  ArrowLeft,
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  Rows,
  ChevronDown,
  Sparkles,
  Tag,
  Truck
} from "lucide-react";
import { CATEGORIES_CONFIG } from "./headerFile/categoryConfig.js";

export default function ProductListVideoHeader({
  categorySlug,
  categoryLabel,
  categoryConfig,
  totalProductsCount,
  maxDiscount,
  onSelectCategory,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewLayout,
  setViewLayout,
  filteredCount
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const homeUrl = `${normalizedBase}index.html`;
  const shopUrl = `${normalizedBase}shop.html`;

  const [isChipsPaused, setIsChipsPaused] = useState(false);

  const desktopMp4 = `${normalizedBase}assets/videos/product-header.mp4`;
  const mobileMp4 = `${normalizedBase}assets/videos/product-header_mobile.mp4`;
  const desktopWebm = `${normalizedBase}assets/videos/product-header.webm`;
  const mobileWebm = `${normalizedBase}assets/videos/product-header_mobile.webm`;
  const posterSrc = `${normalizedBase}assets/videos/product-header-poster.webp`;

  // Detect reduced motion, saveData, or slow network
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const conn =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    const isSlowOrSave =
      conn?.saveData ||
      (conn?.effectiveType &&
        ["slow-2g", "2g", "3g"].includes(conn.effectiveType));

    if (mq.matches || isSlowOrSave) {
      setIsReducedMotion(true);
      return;
    }

    const handleMotionChange = (e) => setIsReducedMotion(e.matches);
    mq.addEventListener?.("change", handleMotionChange);

    // Play after first paint
    const playVideo = () => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(playVideo, { timeout: 1500 });
    } else {
      setTimeout(playVideo, 150);
    }

    // Visibility change handling
    const handleVisibility = () => {
      if (document.hidden) {
        videoRef.current?.pause();
      } else if (!isReducedMotion) {
        videoRef.current?.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Pause when off-screen
    let observer = null;
    if (containerRef.current && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!isReducedMotion && !document.hidden) {
              videoRef.current?.play().catch(() => {});
            }
          } else {
            videoRef.current?.pause();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(containerRef.current);
    }

    return () => {
      mq.removeEventListener?.("change", handleMotionChange);
      document.removeEventListener("visibilitychange", handleVisibility);
      observer?.disconnect();
    };
  }, [isReducedMotion]);

  const isAccessories = categorySlug === "accessories-lifestyle";
  const isMovedToolbar = categorySlug === "accessories-lifestyle" || categorySlug === "home-appliances";

  return (
    <div className={`product-list-hero-band ${isMovedToolbar ? "is-accessories-band is-filter-toolbar-band" : ""}`} ref={containerRef}>
      {/* Background Video Wrap (Suppressed on categories where toolbar is moved below deals) */}
      {!isMovedToolbar && (
        <div className="product-list-hero-video-wrap" aria-hidden="true">
          {!isReducedMotion ? (
            <video
              ref={videoRef}
              className="product-list-hero-video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={posterSrc}
            >
              <source
                media="(max-width: 768px)"
                src={mobileWebm}
                type="video/webm"
              />
              <source
                media="(max-width: 768px)"
                src={mobileMp4}
                type="video/mp4"
              />
              <source src={desktopWebm} type="video/webm" />
              <source src={desktopMp4} type="video/mp4" />
            </video>
          ) : (
            <img
              src={posterSrc}
              alt=""
              className="product-list-hero-poster"
              loading="eager"
              decoding="async"
            />
          )}
          {/* Dark Gradient Overlay */}
          <div className="product-list-hero-overlay" />
          {/* Soft Bottom Fade */}
          <div className="product-list-hero-bottom-fade" />
        </div>
      )}

      {/* Content Container */}
      <div className="product-list-hero-inner">
        {/* Top Row: Breadcrumb & Back to Shop */}
        <div className="product-list-hero-top-row">
          <nav className="product-list-hero-breadcrumb" aria-label="Breadcrumb">
            <a href={homeUrl}>Home</a>
            <ChevronRight size={13} className="hero-bc-sep" />
            <a href={shopUrl}>Shop</a>
            <ChevronRight size={13} className="hero-bc-sep" />
            <span className="hero-bc-curr">{categoryLabel}</span>
          </nav>

          <a
            href={shopUrl}
            className="product-list-hero-back-btn"
            aria-label="Back to Shop"
          >
            <ArrowLeft size={16} />
            <span>Back to Shop</span>
          </a>
        </div>

        {/* Hero Title Block (Suppressed on categories where toolbar is moved below deals) */}
        {!isMovedToolbar && (
          <div className="product-list-hero-title-block">
            <div className="product-list-hero-pill">
              <span className="hero-pill-icon">
                {categoryConfig?.iconEmoji || "✨"}
              </span>
              <span>{categoryLabel}</span>
            </div>

            <h1 className="product-list-hero-title">
              <span className="hero-title-gradient">{categoryLabel}</span> Collection
            </h1>

            <p className="product-list-hero-sub">
              {categoryConfig?.description ||
                "Handpicked deals from top stores, updated daily."}
            </p>

            {/* Stats Chips */}
            <div className="product-list-hero-stats">
              <div className="hero-stat-chip">
                <Sparkles size={14} className="hero-chip-icon text-green" />
                <span>{totalProductsCount} Products</span>
              </div>
              {maxDiscount > 0 && (
                <div className="hero-stat-chip">
                  <Tag size={14} className="hero-chip-icon text-amber" />
                  <span>Up to {maxDiscount}% Off</span>
                </div>
              )}
              <div className="hero-stat-chip">
                <Truck size={14} className="hero-chip-icon text-blue" />
                <span>Free delivery above ₹999</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Category Switcher */}
        <div
          className={`product-list-hero-switcher-wrap ${isChipsPaused ? "is-paused" : ""}`}
          onTouchStart={() => setIsChipsPaused(true)}
          onTouchEnd={() => setIsChipsPaused(false)}
          onTouchCancel={() => setIsChipsPaused(false)}
        >
          <div
            className="product-list-hero-switcher"
            role="tablist"
            aria-label="Category switcher"
          >
            <div className="hero-switcher-track">
              {/* Set 1: Standard Chips */}
              <div className="hero-switcher-group">
                {CATEGORIES_CONFIG.map((cat) => {
                  const isActive = cat.slug === categorySlug;
                  const chipHref = `${normalizedBase}product.html?view=list&category=${encodeURIComponent(cat.slug)}`;
                  return (
                    <a
                      key={cat.key}
                      href={chipHref}
                      role="tab"
                      aria-selected={isActive}
                      className={`hero-cat-chip ${isActive ? "is-active" : ""}`}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                        e.preventDefault();
                        onSelectCategory(cat.slug);
                      }}
                    >
                      <span className="hero-cat-chip-icon">{cat.iconEmoji}</span>
                      <span className="hero-cat-chip-label">{cat.label}</span>
                    </a>
                  );
                })}
              </div>

              {/* Set 2: Duplicate Chips for Seamless Mobile Infinite Marquee */}
              <div className="hero-switcher-group is-clone" aria-hidden="true">
                {CATEGORIES_CONFIG.map((cat) => {
                  const isActive = cat.slug === categorySlug;
                  const chipHref = `${normalizedBase}product.html?view=list&category=${encodeURIComponent(cat.slug)}`;
                  return (
                    <a
                      key={`${cat.key}-clone`}
                      href={chipHref}
                      role="tab"
                      tabIndex={-1}
                      aria-selected={isActive}
                      className={`hero-cat-chip ${isActive ? "is-active" : ""}`}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                        e.preventDefault();
                        onSelectCategory(cat.slug);
                      }}
                    >
                      <span className="hero-cat-chip-icon">{cat.iconEmoji}</span>
                      <span className="hero-cat-chip-label">{cat.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar Glass Card */}
        <div className="product-list-hero-toolbar">
          <div className="hero-toolbar-search-wrap">
            <Search size={18} className="hero-toolbar-search-icon" />
            <input
              type="text"
              className="hero-toolbar-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${categoryLabel}...`}
              aria-label={`Search in ${categoryLabel}`}
            />
            {searchQuery && (
              <button
                type="button"
                className="hero-toolbar-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="hero-toolbar-controls">
            {/* Sort Dropdown */}
            <div className="hero-toolbar-sort-wrap">
              <SlidersHorizontal size={16} className="hero-toolbar-sort-icon" />
              <select
                className="hero-toolbar-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount-desc">Biggest Discount</option>
                <option value="rating-desc">Top Rated</option>
              </select>
              <ChevronDown size={15} className="hero-toolbar-sort-chevron" />
            </div>

            {/* Grid / List View Toggle */}
            <div
              className="hero-toolbar-view-toggle"
              role="group"
              aria-label="View mode toggle"
            >
              <button
                type="button"
                className={`view-toggle-btn ${viewLayout === "grid" ? "is-active" : ""}`}
                onClick={() => setViewLayout("grid")}
                aria-label="Grid view"
                title="Grid view"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewLayout === "list" ? "is-active" : ""}`}
                onClick={() => setViewLayout("list")}
                aria-label="List view"
                title="List view"
              >
                <Rows size={18} />
              </button>
            </div>
          </div>

          {/* Showing Count */}
          <div className="hero-toolbar-count-wrap">
            <span>
              Showing <strong>{filteredCount}</strong> of {totalProductsCount} products
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

