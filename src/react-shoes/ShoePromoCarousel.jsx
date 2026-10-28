import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { buildProductUid } from "../lib/cartHelper.js";

const PROMO_DATA = [
    {
        id: "promo-1",
        productId: "shoe-001",
        title: "Flat 40% OFF Sneakers",
        subtitle: "Urban Streetwear & Court Classics",
        description: "Engineered with breathable mesh, vulcanized grip, and lightweight agility for everyday street styling.",
        category: "Sneakers",
        badge: "HOT DEAL",
        discount: "40% OFF",
        image: "products/shoes/shoe1.png"
    },
    {
        id: "promo-2",
        productId: "shoe-002",
        title: "Running Essentials from ₹999",
        subtitle: "Marathon & Daily Pacing",
        description: "Responsive cushioning and carbon-tuned rebound outsoles built to support every stride.",
        category: "Running",
        badge: "TOP PICK",
        discount: "FROM ₹999",
        image: "products/shoes/shoe2.png"
    },
    {
        id: "promo-3",
        productId: "shoe-005",
        title: "Buy 2 Get 1 Free Sports Shoes",
        subtitle: "High-Grip Cross Trainers",
        description: "Maximum lateral stability and impact foam engineered for intense sprints, turf and gym workouts.",
        category: "Sports",
        badge: "SPECIAL BUNDLE",
        discount: "BUY 2 GET 1",
        image: "products/shoes/shoe5.png"
    },
    {
        id: "promo-4",
        productId: "shoe-006",
        title: "Formal Collection Sale",
        subtitle: "Executive Oxfords & Brogues",
        description: "Hand-burnished premium leather with soft insole padding crafted for boardroom confidence.",
        category: "Formal",
        badge: "UP TO 45% OFF",
        discount: "UP TO 45% OFF",
        image: "products/shoes/shoe6.png"
    },
    {
        id: "promo-5",
        productId: "shoe-008",
        title: "Boots Season Deals",
        subtitle: "Rugged Mountain & Ankle Trekkers",
        description: "All-terrain weather-resistant nubuck boots with reinforced toe caps and deep lugged grip.",
        category: "Boots",
        badge: "OUTDOOR READY",
        discount: "36% OFF",
        image: "products/shoes/shoe8.png"
    },
    {
        id: "promo-6",
        productId: "shoe-004",
        title: "Casual Comfort Under ₹1,499",
        subtitle: "Court Classics & Daily Slip-Ons",
        description: "Relaxed minimalist silhouettes with plush memory foam footbeds for effortless daily wear.",
        category: "Casual",
        badge: "UNDER ₹1,499",
        discount: "UNDER ₹1,499",
        image: "products/shoes/shoe4.png"
    },
    {
        id: "promo-7",
        productId: "shoe-003",
        title: "Walking & Daily Comfort",
        subtitle: "Ultra-Soft Cloud Step Technology",
        description: "Featherlight airflow mesh soles scientifically designed to eliminate foot fatigue all day.",
        category: "Walking",
        badge: "EXTRA COMFORT",
        discount: "FLAT 35% OFF",
        image: "products/shoes/shoe3.png"
    },
    {
        id: "promo-8",
        productId: "shoe-007",
        title: "Free Delivery Above ₹999",
        subtitle: "On All Verified Shoe Orders",
        description: "Shop direct from top e-commerce brand stores with hassle-free 30-day exchange and quick delivery.",
        category: "Sneakers",
        badge: "ALL ORDERS",
        discount: "FREE SHIPPING",
        image: "products/shoes/shoe7.png"
    }
];

const resolveUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const clean = path.replace(/^\/+/, "");
    if (path.startsWith(normalizedBase)) return path;
    return `${normalizedBase}${clean}`;
};

const getProductUrl = (productId, category) => {
    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const uid = buildProductUid(category || "Shoes", productId);
    return `${normalizedBase}Product.html?id=${encodeURIComponent(productId)}&category=${encodeURIComponent(category || "Shoes")}&uid=${encodeURIComponent(uid)}`;
};

const AUTOPLAY_DELAY = 4000;

function ShoePromoCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);

    const isPointerDown = useRef(false);
    const dragStartX = useRef(0);
    const dragStartY = useRef(0);
    const dragDistance = useRef(0);
    const carouselRef = useRef(null);
    const progressTimerRef = useRef(null);

    const total = PROMO_DATA.length;

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % total);
        setProgress(0);
    }, [total]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + total) % total);
        setProgress(0);
    }, [total]);

    // Autoplay & progress ticker
    useEffect(() => {
        if (isPaused) return;

        const interval = 50;
        const step = (interval / AUTOPLAY_DELAY) * 100;

        progressTimerRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    nextSlide();
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => {
            if (progressTimerRef.current) {
                clearInterval(progressTimerRef.current);
            }
        };
    }, [isPaused, nextSlide]);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            prevSlide();
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            nextSlide();
        }
    };

    // Pointer / mouse drag tracking
    const handleMouseDown = (e) => {
        dragStartX.current = e.clientX;
        dragStartY.current = e.clientY;
        dragDistance.current = 0;
        isPointerDown.current = true;
        setIsPaused(true);
    };

    const handleMouseMove = (e) => {
        if (!isPointerDown.current) return;
        const dx = e.clientX - dragStartX.current;
        const dy = e.clientY - dragStartY.current;
        dragDistance.current = Math.hypot(dx, dy);
    };

    const handleMouseUp = (e) => {
        if (!isPointerDown.current) return;
        isPointerDown.current = false;
        setIsPaused(false);
        const distanceX = dragStartX.current - e.clientX;
        if (Math.abs(distanceX) > 50) {
            if (distanceX > 0) nextSlide();
            else prevSlide();
        }
    };

    // Touch swipe support
    const handleTouchStart = (e) => {
        const t = e.touches[0];
        dragStartX.current = t.clientX;
        dragStartY.current = t.clientY;
        dragDistance.current = 0;
        isPointerDown.current = true;
        setIsPaused(true);
    };

    const handleTouchMove = (e) => {
        if (!isPointerDown.current) return;
        const t = e.touches[0];
        const dx = t.clientX - dragStartX.current;
        const dy = t.clientY - dragStartY.current;
        dragDistance.current = Math.hypot(dx, dy);
    };

    const handleTouchEnd = (e) => {
        if (!isPointerDown.current) return;
        isPointerDown.current = false;
        setIsPaused(false);
        const endX = e.changedTouches[0]?.clientX ?? dragStartX.current;
        const distanceX = dragStartX.current - endX;
        if (Math.abs(distanceX) > 40) {
            if (distanceX > 0) nextSlide();
            else prevSlide();
        }
    };

    // Card click navigation handler
    const handleCardClick = (e, url) => {
        // If pointer moved more than 6px, treat as drag and do not navigate
        if (dragDistance.current > 6) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        // Native <a> navigation proceeds normally
    };

    // 3 visible slides calculation (-1, 0, +1)
    const getVisibleIndices = () => {
        const prev = (currentIndex - 1 + total) % total;
        const next = (currentIndex + 1) % total;
        return [prev, currentIndex, next];
    };

    const visibleIndices = getVisibleIndices();

    return (
        <section
            className="shoe-promo-section"
            aria-label="Hot Shoe Offers and Promotions"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Centered Heading Block matching site style */}
            <div className="shoe-section-header-centered">
                <span className="shoe-pill-badge">
                    <Sparkles size={13} className="inline-block mr-1 text-[#16c965]" />
                    LIMITED TIME DEALS
                </span>
                <h2 className="shoe-section-title">
                    Hot Shoe Offers &amp; <span>Promotions</span>
                </h2>
                <p className="shoe-section-subtitle">
                    Exclusive footwear drops, bundle discounts and verified deals for every category.
                </p>
            </div>

            {/* Carousel Container */}
            <div
                className="shoe-promo-carousel-wrapper"
                ref={carouselRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                {/* Arrow Controls */}
                <button
                    type="button"
                    className="shoe-promo-nav-btn prev"
                    onClick={(e) => {
                        e.stopPropagation();
                        prevSlide();
                    }}
                    aria-label="Previous Offer"
                >
                    <ArrowLeft size={20} />
                </button>

                <button
                    type="button"
                    className="shoe-promo-nav-btn next"
                    onClick={(e) => {
                        e.stopPropagation();
                        nextSlide();
                    }}
                    aria-label="Next Offer"
                >
                    <ArrowRight size={20} />
                </button>

                {/* Slides Track */}
                <div className="shoe-promo-track">
                    {visibleIndices.map((slideIndex, pos) => {
                        const promo = PROMO_DATA[slideIndex];
                        const positionClass = pos === 0 ? "is-prev" : pos === 1 ? "is-active" : "is-next";
                        const productUrl = getProductUrl(promo.productId, promo.category);

                        return (
                            <a
                                key={`${promo.id}-${pos}`}
                                href={productUrl}
                                data-product-id={promo.productId}
                                data-category={promo.category}
                                className={`shoe-promo-card ${positionClass}`}
                                onClick={(e) => handleCardClick(e, productUrl)}
                                aria-label={`Shop ${promo.title}`}
                            >
                                <div className="shoe-promo-card-inner">
                                    {/* Discount & Category Pill */}
                                    <div className="shoe-promo-badges">
                                        <span className="shoe-promo-badge-tag">
                                            {promo.badge}
                                        </span>
                                        <span className="shoe-promo-discount-tag">
                                            {promo.discount}
                                        </span>
                                    </div>

                                    {/* Image Container with shine sweep */}
                                    <div className="shoe-promo-image-box">
                                        <div className="shoe-promo-shine" />
                                        <img
                                            src={resolveUrl(promo.image)}
                                            alt={promo.title}
                                            className="shoe-promo-image"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* Text Content */}
                                    <div className="shoe-promo-text-wrap">
                                        <span className="shoe-promo-subhead">
                                            {promo.subtitle}
                                        </span>
                                        <h3 className="shoe-promo-title">
                                            {promo.title}
                                        </h3>
                                        <p className="shoe-promo-desc">
                                            {promo.description}
                                        </p>

                                        {/* Shop Now Button */}
                                        <div className="shoe-promo-action">
                                            <span className="shoe-promo-btn">
                                                <span>Shop Now</span>
                                                <ArrowRight size={16} className="shoe-promo-btn-arrow" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>

            {/* Pagination Dots + Autoplay Progress Bar */}
            <div className="shoe-promo-footer">
                <div className="shoe-promo-dots" role="tablist" aria-label="Slide indicators">
                    {PROMO_DATA.map((item, idx) => (
                        <button
                            key={item.id}
                            type="button"
                            role="tab"
                            aria-selected={idx === currentIndex}
                            aria-label={`Go to slide ${idx + 1}: ${item.title}`}
                            className={`shoe-promo-dot ${idx === currentIndex ? "active" : ""}`}
                            onClick={() => {
                                setCurrentIndex(idx);
                                setProgress(0);
                            }}
                        />
                    ))}
                </div>

                {/* Progress bar */}
                <div
                    className="shoe-promo-progress-bar-bg"
                    title={`Autoplay: ${Math.round(progress)}%`}
                    aria-hidden="true"
                >
                    <div
                        className="shoe-promo-progress-bar-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </section>
    );
}

export default ShoePromoCarousel;
