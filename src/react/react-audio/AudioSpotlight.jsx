import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo
} from "react";
import {
    Heart,
    ShoppingBag,
    Check,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Star
} from "lucide-react";

const SPOTLIGHT_INTERVAL = 9000;

export default function AudioSpotlight({
    products = [],
    spotlightProduct,
    getImagePath,
    addToCart,
    toggleWishlist,
    isInWishlist
}) {
    // Support either products array or single spotlightProduct fallback
    const items = useMemo(() => {
        if (Array.isArray(products) && products.length > 0) return products;
        if (spotlightProduct) return [spotlightProduct];
        return [];
    }, [products, spotlightProduct]);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [addedId, setAddedId] = useState(null);
    const [progressKey, setProgressKey] = useState(0);

    const containerRef = useRef(null);
    const resumeTimerRef = useRef(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);

    const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
        return typeof window !== "undefined" &&
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    });

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onChange = (e) => setPrefersReducedMotion(e.matches);
        if (mq.addEventListener) mq.addEventListener("change", onChange);
        return () => mq.removeEventListener?.("change", onChange);
    }, []);

    const total = items.length;

    // Boundary check if items change
    useEffect(() => {
        if (activeIndex >= total && total > 0) {
            setActiveIndex(0);
        }
    }, [total, activeIndex]);

    const next = useCallback(() => {
        if (total <= 1) return;
        setActiveIndex((prev) => (prev + 1) % total);
        setProgressKey((k) => k + 1);
    }, [total]);

    const prev = useCallback(() => {
        if (total <= 1) return;
        setActiveIndex((prev) => (prev - 1 + total) % total);
        setProgressKey((k) => k + 1);
    }, [total]);

    // IntersectionObserver to pause when off-screen
    const [inView, setInView] = useState(true);
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

    // Tab visibility handling
    const [tabVisible, setTabVisible] = useState(true);
    useEffect(() => {
        const handleVis = () => {
            setTabVisible(document.visibilityState !== "hidden");
        };
        document.addEventListener("visibilitychange", handleVis);
        return () => document.removeEventListener("visibilitychange", handleVis);
    }, []);

    // 9000ms Auto-advance interval
    useEffect(() => {
        if (
            total <= 1 ||
            isPaused ||
            !inView ||
            !tabVisible ||
            prefersReducedMotion
        ) {
            return;
        }

        const timer = setInterval(() => {
            next();
        }, SPOTLIGHT_INTERVAL);

        return () => clearInterval(timer);
    }, [total, isPaused, inView, tabVisible, prefersReducedMotion, next, progressKey]);

    // Resume helper after 3s
    const triggerResumeAfterDelay = () => {
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = setTimeout(() => {
            setIsPaused(false);
        }, 3000);
    };

    const handleMouseEnter = () => {
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
        setIsPaused(true);
    };

    const handleMouseLeave = () => {
        triggerResumeAfterDelay();
    };

    const handleFocus = () => {
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
        setIsPaused(true);
    };

    const handleBlur = () => {
        triggerResumeAfterDelay();
    };

    // Touch swipe handlers
    const handleTouchStart = (e) => {
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
        setIsPaused(true);
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = touchStartX.current - endX;
        const diffY = touchStartY.current - endY;

        // Ensure horizontal swipe is dominant
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                next();
            } else {
                prev();
            }
        }
        triggerResumeAfterDelay();
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            prev();
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            next();
        }
    };

    if (total === 0) return null;

    const currentProduct = items[activeIndex] || items[0];

    const base = import.meta.env.BASE_URL || "/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const uid = currentProduct.uid || `audio-${currentProduct.id}`;
    const productUrl = `${normalizedBase}product.html?id=${encodeURIComponent(currentProduct.id)}&category=${encodeURIComponent(currentProduct.category || "Audio")}&uid=${encodeURIComponent(uid)}&from=audio`;

    const isCurrentWishlisted = isInWishlist
        ? isInWishlist(currentProduct.id) || isInWishlist(uid)
        : false;

    const handleAddToCartClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (addToCart) {
            addToCart(currentProduct);
        }
        setAddedId(currentProduct.id);
        setTimeout(() => setAddedId(null), 1500);
    };

    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (toggleWishlist) {
            toggleWishlist(currentProduct);
        }
    };

    const handleViewProduct = () => {
        window.location.href = productUrl;
    };

    const rawOldPrice = Number(currentProduct.oldPrice || currentProduct.originalPrice || 0);
    const currentPrice = Number(currentProduct.price || 0);
    const hasDiscount = rawOldPrice > currentPrice;
    const discount = hasDiscount
        ? Math.round(((rawOldPrice - currentPrice) / rawOldPrice) * 100)
        : currentProduct.discount || 50;

    return (
        <section
            ref={containerRef}
            className="audio-spotlight"
            id="audio-spotlight"
            aria-label="Featured Audio Spotlight Slider"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {/* ── REDESIGNED SECTION HEADING (Task 3C) ── */}
            <div className="audio-spotlight-header-wrap">
                <div className="audio-spotlight-heading-left">
                    <div className="audio-spotlight-eyebrow-pill">
                        <span className="audio-spotlight-live-dot" aria-hidden="true" />
                        <span className="audio-spotlight-eyebrow-text">
                            FEATURED SPOTLIGHT
                        </span>
                    </div>

                    <h2 className="audio-spotlight-title">
                        Built for your{" "}
                        <span className="audio-lime-gradient-text">sound.</span>
                    </h2>

                    <div className="audio-spotlight-underline" aria-hidden="true" />

                    <p className="audio-spotlight-subtitle">
                        Hand-picked audio gear, loved by thousands.
                    </p>
                </div>

                {/* Desktop controls: Slide Counter + Prev/Next Arrows */}
                {total > 1 && (
                    <div className="audio-spotlight-header-controls" aria-label="Spotlight controls">
                        <span className="audio-spotlight-counter" aria-live="polite">
                            <strong>{String(activeIndex + 1).padStart(2, "0")}</strong>
                            <span className="audio-spotlight-counter-sep">/</span>
                            <span>{String(total).padStart(2, "0")}</span>
                        </span>

                        <div className="audio-spotlight-arrows-group">
                            <button
                                type="button"
                                className="audio-spotlight-nav-btn prev"
                                onClick={prev}
                                aria-label="Previous spotlight product"
                                title="Previous product"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                type="button"
                                className="audio-spotlight-nav-btn next"
                                onClick={next}
                                aria-label="Next spotlight product"
                                title="Next product"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── PROGRESS BAR (9000ms timer) ── */}
            {total > 1 && !prefersReducedMotion && (
                <div className="audio-spotlight-progress-track" aria-hidden="true">
                    <div
                        key={progressKey}
                        className={`audio-spotlight-progress-bar${isPaused || !inView || !tabVisible ? " is-paused" : ""}`}
                        style={{ animationDuration: `${SPOTLIGHT_INTERVAL}ms` }}
                    />
                </div>
            )}

            {/* ── SLIDER CARD (Fixed min-height, Cross-fade/slide) ── */}
            <div className="audio-spotlight-box">
                {/* Product Image Area */}
                <div className="audio-spotlight-image-col">
                    <div className="audio-spotlight-img-inner">
                        <img
                            key={currentProduct.id}
                            src={getImagePath ? getImagePath(currentProduct.image) : currentProduct.image}
                            alt={currentProduct.name}
                            className="audio-spotlight-img"
                            loading="eager"
                            decoding="async"
                            width="400"
                            height="400"
                        />
                        {discount > 0 && (
                            <span className="audio-spotlight-badge">
                                {discount}% OFF
                            </span>
                        )}
                    </div>
                </div>

                {/* Product Info Area */}
                <div className="audio-spotlight-info-col" key={`info-${currentProduct.id}`}>
                    <div className="audio-spotlight-brand-row">
                        <span className="audio-spotlight-brand">
                            {currentProduct.brand || "KSAM Audio"}
                        </span>
                        <span className="audio-spotlight-category-chip">
                            {currentProduct.category || "Audio"}
                        </span>
                    </div>

                    <h3 className="audio-spotlight-product-name">
                        {currentProduct.name}
                    </h3>

                    <p className="audio-spotlight-desc">
                        {currentProduct.description}
                    </p>

                    {/* Star Rating & Reviews */}
                    <div className="audio-spotlight-rating-row">
                        <div className="audio-spotlight-stars">
                            <Star size={14} className="audio-star-icon" fill="#f59e0b" color="#f59e0b" />
                            <strong>{currentProduct.rating || "4.8"}</strong>
                        </div>
                        <span className="audio-rating-dot">•</span>
                        <span className="audio-spotlight-review-count">
                            {currentProduct.reviews || 84} verified reviews
                        </span>
                    </div>

                    {/* Price Row */}
                    <div className="audio-spotlight-price-row">
                        <span className="audio-spotlight-price-now">
                            ₹{currentPrice.toLocaleString("en-IN")}
                        </span>
                        {rawOldPrice > currentPrice && (
                            <del className="audio-spotlight-price-was">
                                ₹{rawOldPrice.toLocaleString("en-IN")}
                            </del>
                        )}
                        <span className="audio-spotlight-save-badge">
                            Save ₹{(rawOldPrice - currentPrice).toLocaleString("en-IN")}
                        </span>
                    </div>

                    {/* Feature Chips */}
                    {Array.isArray(currentProduct.features) && currentProduct.features.length > 0 && (
                        <div className="audio-spotlight-chips-row">
                            {currentProduct.features.slice(0, 4).map((feat, idx) => (
                                <span key={idx} className="audio-spotlight-chip">
                                    <span className="audio-chip-check">✓</span>
                                    {feat}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* ── 3 ACTION BUTTONS (Task 3B): [View Product ->] [heart] [bag] ── */}
                    <div className="audio-spotlight-actions-row">
                        {/* 1. Main Action: View Product -> */}
                        <button
                            type="button"
                            className="audio-spotlight-view-btn"
                            onClick={handleViewProduct}
                            aria-label={`View full details for ${currentProduct.name}`}
                        >
                            <span>View Product</span>
                            <ArrowRight size={18} className="audio-btn-arrow" />
                        </button>

                        {/* 2. Wishlist Heart Button */}
                        <button
                            type="button"
                            className={`audio-spotlight-icon-btn audio-spotlight-heart-btn${isCurrentWishlisted ? " active" : ""}`}
                            onClick={handleWishlistClick}
                            aria-label={isCurrentWishlisted ? `Remove ${currentProduct.name} from wishlist` : `Add ${currentProduct.name} to wishlist`}
                            title={isCurrentWishlisted ? "In Wishlist" : "Add to Wishlist"}
                        >
                            <Heart
                                size={20}
                                fill={isCurrentWishlisted ? "#8cff00" : "none"}
                                color={isCurrentWishlisted ? "#8cff00" : "currentColor"}
                            />
                        </button>

                        {/* 3. Add to Cart Bag Button */}
                        <button
                            type="button"
                            className={`audio-spotlight-icon-btn audio-spotlight-cart-btn${addedId === currentProduct.id ? " added" : ""}`}
                            onClick={handleAddToCartClick}
                            aria-label={`Add ${currentProduct.name} to cart`}
                            title="Add to Cart"
                        >
                            {addedId === currentProduct.id ? (
                                <Check size={20} className="audio-check-anim" />
                            ) : (
                                <ShoppingBag size={20} />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dots & Mini Controls */}
            {total > 1 && (
                <div className="audio-spotlight-mobile-nav" role="tablist" aria-label="Spotlight slide navigation">
                    <button
                        type="button"
                        className="audio-spotlight-mob-arrow prev"
                        onClick={prev}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="audio-spotlight-dots">
                        {items.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                role="tab"
                                aria-selected={activeIndex === idx}
                                className={`audio-spotlight-dot${activeIndex === idx ? " active" : ""}`}
                                onClick={() => {
                                    setActiveIndex(idx);
                                    setProgressKey((k) => k + 1);
                                }}
                                aria-label={`Go to spotlight slide ${idx + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        className="audio-spotlight-mob-arrow next"
                        onClick={next}
                        aria-label="Next slide"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </section>
    );
}
