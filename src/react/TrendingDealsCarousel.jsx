import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { getAllMasterProducts, slugify } from "../lib/productCatalog.js";
import { getDeals } from "../deals/services/productService.js";
import { ProductCard } from "../deals/components/ProductCard.jsx";

const AUTOPLAY_INTERVAL = 3500; // 3.5 seconds

export default function TrendingDealsCarousel({ currentCategorySlug }) {
  const [trendingList, setTrendingList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const containerRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const isDragging = useRef(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);
    const onChange = (e) => setIsReducedMotion(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Fetch and prepare 10-12 top trending deals from OTHER categories
  useEffect(() => {
    let isMounted = true;
    const currentSlug = String(currentCategorySlug || "").toLowerCase().trim();

    const buildList = (extra = []) => {
      const allMaster = getAllMasterProducts() || [];
      const combined = [...extra, ...allMaster];
      const seenIds = new Set();
      const otherCategoryItems = [];
      const sameCategoryItems = [];

      for (const item of combined) {
        if (!item || item.id === undefined || item.id === null) continue;
        const idKey = String(item.id).toLowerCase();
        if (seenIds.has(idKey)) continue;
        seenIds.add(idKey);

        const itemCat = String(item.category || item.categorySlug || "").toLowerCase();
        const itemSlug = slugify(itemCat);

        // Normalize product with from="list"
        const normalized = {
          ...item,
          from: "list"
        };

        if (itemSlug !== currentSlug && !itemCat.includes(currentSlug)) {
          otherCategoryItems.push(normalized);
        } else {
          sameCategoryItems.push(normalized);
        }
      }

      // Sort by highest discount, then rating
      const sorter = (a, b) => {
        const discA = Number(a.discount) || 0;
        const discB = Number(b.discount) || 0;
        if (discB !== discA) return discB - discA;
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      };

      otherCategoryItems.sort(sorter);
      sameCategoryItems.sort(sorter);

      let selected = otherCategoryItems.slice(0, 12);
      if (selected.length < 6) {
        const needed = 12 - selected.length;
        selected = [...selected, ...sameCategoryItems.slice(0, needed)];
      }

      return selected;
    };

    // Synchronously set initial list from master products
    const initialSelected = buildList();
    setTrendingList(initialSelected);
    setCurrentIndex(0);

    // Concurrently try to augment with live Supabase deals
    getDeals({ pageSize: 20 })
      .then((res) => {
        if (!isMounted) return;
        if (res && Array.isArray(res.products) && res.products.length > 0) {
          const augmented = buildList(res.products);
          setTrendingList(augmented);
        }
      })
      .catch(() => {
        // Fallback silently to master catalog already shown
      });

    return () => {
      isMounted = false;
    };
  }, [currentCategorySlug]);

  const total = trendingList.length;

  const next = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Pause interaction helper (resumes after 2 seconds)
  const handleUserInteraction = () => {
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2000);
  };

  // Visibility change
  useEffect(() => {
    const handleVisibility = () => {
      setTabVisible(document.visibilityState !== "hidden");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // IntersectionObserver to pause off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Autoplay ticker (advance every 3.5s)
  useEffect(() => {
    if (isPaused || !inView || !tabVisible || isReducedMotion || total <= 1) {
      return;
    }

    const timer = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, inView, tabVisible, isReducedMotion, total, next]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handleUserInteraction();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleUserInteraction();
      next();
    }
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    handleUserInteraction();
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    isDragging.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (touchDeltaX.current < -40) {
      next();
    } else if (touchDeltaX.current > 40) {
      prev();
    }
    handleUserInteraction();
  };

  if (!trendingList || trendingList.length === 0) {
    return null;
  }

  // Determine the 3 visible cards: prev, active, next
  const prevIndex = (currentIndex - 1 + total) % total;
  const nextIndex = (currentIndex + 1) % total;

  const visibleCards = [
    { item: trendingList[prevIndex], role: "is-prev", index: prevIndex },
    { item: trendingList[currentIndex], role: "is-active", index: currentIndex },
    { item: trendingList[nextIndex], role: "is-next", index: nextIndex }
  ];

  return (
    <section
      className="trending-deals-section"
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Trending deals"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="trending-deals-container">
        {/* Section Heading Block */}
        <header className="trending-deals-header">
          <div className="trending-deals-eyebrow">
            <Sparkles size={13} className="eyebrow-icon" />
            <span>TRENDING NOW</span>
          </div>

          <h2 className="trending-deals-title">
            Trending Deals <span className="trending-title-gradient">You May Love</span>
          </h2>

          <p className="trending-deals-subtitle">
            Handpicked top-rated offers with biggest discounts across all departments.
          </p>

          <div className="trending-progress-track" aria-hidden="true">
            <div
              key={currentIndex}
              className={`trending-progress-fill ${isPaused || !inView || !tabVisible || isReducedMotion ? "is-paused" : ""}`}
            />
          </div>
        </header>

        {/* Carousel Viewport with Side Arrows */}
        <div
          className="trending-carousel-stage"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Previous Arrow */}
          <button
            type="button"
            className="trending-nav-btn prev"
            onClick={() => {
              handleUserInteraction();
              prev();
            }}
            aria-label="Previous trending deal"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Cards Track */}
          <div className="trending-carousel-track">
            {visibleCards.map(({ item, role, index }) => (
              <div
                key={`${item.uid || item.id}-${role}`}
                className={`trending-slide-card ${role}`}
                onClick={() => {
                  if (role === "is-prev") {
                    handleUserInteraction();
                    prev();
                  } else if (role === "is-next") {
                    handleUserInteraction();
                    next();
                  }
                }}
              >
                <div className="trending-card-wrapper">
                  <ProductCard product={item} />
                </div>
              </div>
            ))}
          </div>

          {/* Next Arrow */}
          <button
            type="button"
            className="trending-nav-btn next"
            onClick={() => {
              handleUserInteraction();
              next();
            }}
            aria-label="Next trending deal"
          >
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Indicator Pill Dots */}
        <div
          className="trending-carousel-dots"
          role="tablist"
          aria-label="Trending slide indicators"
        >
          {trendingList.map((deal, idx) => (
            <button
              key={deal.uid || deal.id || idx}
              type="button"
              role="tab"
              aria-selected={idx === currentIndex}
              className={`trending-dot ${idx === currentIndex ? "is-active" : ""}`}
              onClick={() => {
                handleUserInteraction();
                setCurrentIndex(idx);
              }}
              aria-label={`Slide ${idx + 1}: ${deal.name || "Deal"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

