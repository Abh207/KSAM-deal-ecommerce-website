import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

const PROMO_DATA = [
    {
        id: "promo-1",
        title: "Flat 40% OFF Skin Care",
        subtitle: "Hydrating Serums & Daily Moisturisers",
        description: "Revitalize your skin with clinical-grade hyaluronic acid and brightening serums.",
        category: "Skin Care",
        badge: "LIMITED TIME DEAL",
        discount: "-40% OFF",
        image: "assets/images/beauty/promo-1.jpg",
        accent: "#1de9b6"
    },
    {
        id: "promo-2",
        title: "Buy 2 Get 1 Free Makeup",
        subtitle: "Velvet Lipsticks & Glam Palettes",
        description: "Stock up on long-wear pigments, high-definition foundations, and satin finishes.",
        category: "Makeup",
        badge: "SPECIAL BUNDLE",
        discount: "BUY 2 GET 1",
        image: "assets/images/beauty/promo-2.jpg",
        accent: "#10b981"
    },
    {
        id: "promo-3",
        title: "New Fragrance Arrivals",
        subtitle: "Luxury Eau de Parfum & Body Mists",
        description: "Enchanting bouquets of vanilla orchid, amber musk, and sparkling citrus notes.",
        category: "Fragrance",
        badge: "NEW IN STOCK",
        discount: "UP TO 35% OFF",
        image: "assets/images/beauty/promo-3.jpg",
        accent: "#0ea5e9"
    },
    {
        id: "promo-4",
        title: "Hair Care Essentials from ₹199",
        subtitle: "Nourishing Shampoos & Organic Oils",
        description: "Restore strength, mirror shine, and root vitality with clean botanicals.",
        category: "Hair Care",
        badge: "BEST VALUE",
        discount: "STARTING ₹199",
        image: "assets/images/beauty/promo-4.jpg",
        accent: "#10b981"
    },
    {
        id: "promo-5",
        title: "Body Care Combo Deals",
        subtitle: "Whipped Lotions & Exfoliating Scrubs",
        description: "Indulge your skin with cocoa butter, rosehip oils, and 48-hour moisture therapy.",
        category: "Body Care",
        badge: "PAMPER PACK",
        discount: "FLAT 30% OFF",
        image: "assets/images/beauty/promo-5.jpg",
        accent: "#f59e0b"
    },
    {
        id: "promo-6",
        title: "Festive Glow Sale",
        subtitle: "Complete Beauty & Radiance Kits",
        description: "Glow effortlessly from day to night with curated festival skincare sets.",
        category: "All",
        badge: "FESTIVE EDIT",
        discount: "EXTRA 25% OFF",
        image: "assets/images/beauty/promo-6.jpg",
        accent: "#0f9d76"
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

const AUTOPLAY_DELAY = 4000;

const PromoCarousel = ({ onSelectCategory }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);

    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const isDragging = useRef(false);
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

    const goToSlide = (index) => {
        setCurrentIndex(index);
        setProgress(0);
    };

    // Autoplay & progress animation
    useEffect(() => {
        if (isPaused) return;

        const startTime = Date.now();
        const interval = 50;

        progressTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const pct = Math.min(100, (elapsed / AUTOPLAY_DELAY) * 100);
            setProgress(pct);

            if (elapsed >= AUTOPLAY_DELAY) {
                nextSlide();
            }
        }, interval);

        return () => {
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        };
    }, [currentIndex, isPaused, nextSlide]);

    // Handle Card Click -> Filter & Scroll to products
    const handleCardClick = (category) => {
        if (onSelectCategory) {
            onSelectCategory(category || "All");
        }
        const productsEl = document.getElementById("products");
        if (productsEl) {
            productsEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // 3D Tilt on Hover for Cards
    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -7;
        const rotateY = ((x - centerX) / centerX) * 7;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
        const shine = card.querySelector(".beauty-promo-shine");
        if (shine) {
            shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.4) 0%, transparent 60%)`;
        }
    };

    const handleMouseLeave = (e) => {
        const card = e.currentTarget;
        card.style.transform = "";
        const shine = card.querySelector(".beauty-promo-shine");
        if (shine) {
            shine.style.background = "none";
        }
    };

    // Touch & Swipe handlers
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        setIsPaused(true);
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        setIsPaused(false);
        const distance = touchStartX.current - touchEndX.current;
        if (Math.abs(distance) > 50) {
            if (distance > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    };

    // Mouse drag support
    const handleMouseDown = (e) => {
        touchStartX.current = e.clientX;
        isDragging.current = true;
    };

    const handleMouseUp = (e) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        const distance = touchStartX.current - e.clientX;
        if (Math.abs(distance) > 60) {
            if (distance > 0) nextSlide();
            else prevSlide();
        }
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === "ArrowLeft") {
            prevSlide();
        } else if (e.key === "ArrowRight") {
            nextSlide();
        }
    };

    return (
        <section
            id="promotions"
            className="beauty-section-wrap beauty-promo-carousel-section"
            ref={carouselRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label="Hot Offers and Promotions Carousel"
        >
            <div className="beauty-glass-panel beauty-promo-panel">
                {/* Header */}
                <div className="beauty-promo-header">
                    <div className="beauty-section-badge">
                        <Sparkles size={14} className="beauty-badge-icon" />
                        <span>LIMITED TIME EXTRAVAGANZA</span>
                    </div>
                    <h2 className="beauty-promo-main-title">Hot Offers & Promotions</h2>
                    <p className="beauty-promo-sub">
                        Handcrafted beauty deals, curated gift sets, and seasonal steals designed to make you glow.
                    </p>
                </div>

                {/* Autoplay Progress Bar */}
                <div className="beauty-carousel-progress-track" aria-hidden="true">
                    <div
                        className="beauty-carousel-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Carousel Viewport */}
                <div
                    className="beauty-carousel-viewport"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                >
                    <div className="beauty-carousel-track">
                        {PROMO_DATA.map((promo, idx) => {
                            // Relative position for 3D centered active card layout
                            let offset = idx - currentIndex;
                            if (offset < -Math.floor(total / 2)) offset += total;
                            if (offset > Math.floor(total / 2)) offset -= total;

                            const isActive = offset === 0;
                            const isPrev = offset === -1;
                            const isNext = offset === 1;
                            const isVisible = Math.abs(offset) <= 2;

                            return (
                                <article
                                    key={promo.id}
                                    className={`beauty-promo-card${isActive ? " active" : ""}${
                                        isPrev ? " is-prev" : ""
                                    }${isNext ? " is-next" : ""}${!isVisible ? " is-hidden" : ""}`}
                                    style={{
                                        "--card-offset": offset,
                                        "--accent-color": promo.accent
                                    }}
                                    onClick={() => handleCardClick(promo.category)}
                                    onMouseMove={isActive ? handleMouseMove : undefined}
                                    onMouseLeave={isActive ? handleMouseLeave : undefined}
                                    role="button"
                                    tabIndex={isActive ? 0 : -1}
                                    aria-label={`Offer: ${promo.title}. Click to view ${promo.category} products.`}
                                >
                                    <div className="beauty-promo-image-wrap">
                                        <img
                                            src={resolveUrl(promo.image)}
                                            alt={promo.title}
                                            className="beauty-promo-img"
                                            loading="lazy"
                                        />
                                        <div className="beauty-promo-image-overlay" />
                                        <span className="beauty-promo-discount-badge">
                                            {promo.discount}
                                        </span>
                                        <span className="beauty-promo-type-pill">
                                            {promo.badge}
                                        </span>
                                    </div>

                                    <div className="beauty-promo-content">
                                        <span className="beauty-promo-category-tag">
                                            {promo.category.toUpperCase()}
                                        </span>
                                        <h3 className="beauty-promo-title">{promo.title}</h3>
                                        <h4 className="beauty-promo-subheading">{promo.subtitle}</h4>
                                        <p className="beauty-promo-desc">{promo.description}</p>

                                        <button
                                            type="button"
                                            className="beauty-promo-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCardClick(promo.category);
                                            }}
                                        >
                                            <span>Shop {promo.category}</span>
                                            <span className="beauty-promo-arrow">→</span>
                                        </button>
                                    </div>

                                    <div className="beauty-promo-shine" />
                                </article>
                            );
                        })}
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        type="button"
                        className="beauty-carousel-arrow beauty-carousel-prev"
                        onClick={(e) => {
                            e.stopPropagation();
                            prevSlide();
                        }}
                        aria-label="Previous promotional offer"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <button
                        type="button"
                        className="beauty-carousel-arrow beauty-carousel-next"
                        onClick={(e) => {
                            e.stopPropagation();
                            nextSlide();
                        }}
                        aria-label="Next promotional offer"
                    >
                        <ArrowRight size={20} />
                    </button>
                </div>

                {/* Dot Indicators */}
                <div className="beauty-carousel-dots" role="tablist" aria-label="Promotions slider dots">
                    {PROMO_DATA.map((promo, idx) => (
                        <button
                            key={promo.id}
                            type="button"
                            role="tab"
                            aria-selected={currentIndex === idx}
                            className={`beauty-carousel-dot${currentIndex === idx ? " active" : ""}`}
                            onClick={() => goToSlide(idx)}
                            aria-label={`Go to slide ${idx + 1}: ${promo.title}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PromoCarousel;
