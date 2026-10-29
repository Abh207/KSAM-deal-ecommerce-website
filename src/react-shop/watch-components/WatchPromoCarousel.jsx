import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

const WATCH_PROMO_DATA = [
    {
        id: "watch-promo-1",
        title: "Flat 50% OFF Sport Watches",
        subtitle: "Chrono Black Series",
        description: "High-precision chronograph with tactile pushers, stealth black dial and hardened crystal.",
        category: "Sport Watches",
        badge: "LIMITED TIME DEAL",
        discount: "50% OFF",
        image: "products/watch2.png",
        productId: 1002,
        productUid: "sport-watches-1002",
        accent: "#c89b3c"
    },
    {
        id: "watch-promo-2",
        title: "Luxury Dress Watches from ₹279",
        subtitle: "Heritage Classic Editions",
        description: "Hand-finished sunburst dials with supple stitched leather straps crafted for formal excellence.",
        category: "Dress Watches",
        badge: "BEST VALUE",
        discount: "FROM ₹279",
        image: "products/watch3.png",
        productId: 1003,
        productUid: "dress-watches-1003",
        accent: "#d6ad5a"
    },
    {
        id: "watch-promo-3",
        title: "Men's Watches Best Sellers",
        subtitle: "Aqua Pro Diver Collection",
        description: "50-meter water resistance with sealed screw-down caseback and high-intensity luminous dial.",
        category: "Men's Watches",
        badge: "BEST SELLER",
        discount: "50% OFF",
        image: "products/watch1.png",
        productId: 1001,
        productUid: "mens-watches-1001",
        accent: "#16a34a"
    },
    {
        id: "watch-promo-4",
        title: "Automatic Skeleton Horology",
        subtitle: "Master Mechanical Craft",
        description: "Intricately skeletonized dial exposing the rhythmic heartbeat of precision self-winding gears.",
        category: "Men's Watches",
        badge: "NEW ARRIVAL",
        discount: "50% OFF",
        image: "products/watch4.png",
        productId: 1004,
        productUid: "mens-watches-1004",
        accent: "#c89b3c"
    },
    {
        id: "watch-promo-5",
        title: "Free Delivery on Orders Above ₹999",
        subtitle: "Royal Gold Classic Series",
        description: "Lustrous gold-tone electroplating with sapphire-coated crystal and luxury deployment clasp.",
        category: "Dress Watches",
        badge: "PREMIUM DEAL",
        discount: "49% OFF",
        image: "products/watch14.png",
        productId: 1013,
        productUid: "dress-watches-1013",
        accent: "#d6ad5a"
    },
    {
        id: "watch-promo-6",
        title: "Festive Gifting Deals",
        subtitle: "Midnight Chronograph Edit",
        description: "Sleek monochromatic profile paired with high-durability stainless steel and custom gift casing.",
        category: "Sport Watches",
        badge: "FESTIVE EDIT",
        discount: "49% OFF",
        image: "products/watch16.png",
        productId: 1015,
        productUid: "sport-watches-1015",
        accent: "#16a34a"
    },
    {
        id: "watch-promo-7",
        title: "Women's Elegant Minimalist",
        subtitle: "Rose Mesh Collection",
        description: "Ultra-slim profile paired with breathable Milanese mesh for featherlight all-day comfort.",
        category: "Women's Watches",
        badge: "TRENDING NOW",
        discount: "50% OFF",
        image: "products/watch6.png",
        productId: 1006,
        productUid: "womens-watches-1006",
        accent: "#c89b3c"
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

function WatchPromoCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);

    const pointerStartPos = useRef({ x: 0, y: 0 });
    const hasDragged = useRef(false);
    const carouselRef = useRef(null);
    const progressTimerRef = useRef(null);

    const total = WATCH_PROMO_DATA.length;
    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;

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

    // 3D Tilt on Hover for Cards
    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
        const shine = card.querySelector(".beauty-promo-shine");
        if (shine) {
            shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.35) 0%, transparent 60%)`;
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

    // Touch & Pointer interactions: treat as click only if moved less than 6px
    const handlePointerDown = (e) => {
        pointerStartPos.current = { x: e.clientX, y: e.clientY };
        hasDragged.current = false;
    };

    const handlePointerMove = (e) => {
        const dx = Math.abs(e.clientX - pointerStartPos.current.x);
        const dy = Math.abs(e.clientY - pointerStartPos.current.y);
        if (dx > 6 || dy > 6) {
            hasDragged.current = true;
        }
    };

    const handlePointerUp = (e) => {
        const dx = pointerStartPos.current.x - e.clientX;
        if (Math.abs(dx) > 50) {
            if (dx > 0) nextSlide();
            else prevSlide();
        }
    };

    // Card click handler: allow navigation if drag moved < 6px
    const handleCardClick = (e, promo) => {
        if (hasDragged.current) {
            e.preventDefault();
        }
        // If not dragged, natural <a href> navigation proceeds in the same tab!
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
            className="beauty-section-wrap beauty-promo-carousel-section watch-promo-carousel-section"
            ref={carouselRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label="Hot Watch Offers and Promotions Carousel"
        >
            <div className="beauty-glass-panel beauty-promo-panel">
                {/* Centered Heading Block */}
                <div className="beauty-promo-header">
                    <div className="beauty-section-badge watch-promo-badge">
                        <Sparkles size={14} className="beauty-badge-icon" />
                        <span>LIMITED TIME DEALS</span>
                    </div>
                    <h2 className="beauty-promo-main-title">Hot Watch Offers &amp; Promotions</h2>
                    <p className="beauty-promo-sub">
                        Handcrafted timepieces, exclusive horology deals, and precision collections curated for you.
                    </p>
                </div>

                {/* Autoplay Progress Bar */}
                <div className="beauty-carousel-progress-track" aria-hidden="true" style={{ pointerEvents: "none" }}>
                    <div
                        className="beauty-carousel-progress-fill watch-progress-fill"
                        style={{ width: `${progress}%`, pointerEvents: "none" }}
                    />
                </div>

                {/* Carousel Viewport */}
                <div
                    className="beauty-carousel-viewport"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                >
                    <div className="beauty-carousel-track">
                        {WATCH_PROMO_DATA.map((promo, idx) => {
                            let offset = idx - currentIndex;
                            if (offset < -Math.floor(total / 2)) offset += total;
                            if (offset > Math.floor(total / 2)) offset -= total;

                            const isActive = offset === 0;
                            const isPrev = offset === -1;
                            const isNext = offset === 1;
                            const isVisible = Math.abs(offset) <= 2;

                            const productUrl = `${normalizedBase}product.html?id=${encodeURIComponent(promo.productId)}&category=${encodeURIComponent(promo.category)}&uid=${encodeURIComponent(promo.productUid)}&from=watches`;

                            return (
                                <a
                                    key={promo.id}
                                    href={productUrl}
                                    data-product-id={promo.productId}
                                    className={`beauty-promo-card watch-promo-card${isActive ? " active" : ""}${
                                        isPrev ? " is-prev" : ""
                                    }${isNext ? " is-next" : ""}${!isVisible ? " is-hidden" : ""}`}
                                    style={{
                                        "--card-offset": offset,
                                        "--accent-color": promo.accent,
                                        textDecoration: "none",
                                        color: "inherit"
                                    }}
                                    onClick={(e) => handleCardClick(e, promo)}
                                    onMouseMove={isActive ? handleMouseMove : undefined}
                                    onMouseLeave={isActive ? handleMouseLeave : undefined}
                                    aria-label={`Offer: ${promo.title}. Click to view ${promo.subtitle}.`}
                                >
                                    <div className="beauty-promo-image-wrap watch-promo-img-wrap" style={{ background: "#f8f9fa" }}>
                                        <img
                                            src={resolveUrl(promo.image)}
                                            alt={promo.title}
                                            className="beauty-promo-img"
                                            loading="lazy"
                                            style={{ objectFit: "contain", padding: "16px" }}
                                        />
                                        <div className="beauty-promo-image-overlay" style={{ pointerEvents: "none" }} />
                                        <span className="beauty-promo-discount-badge" style={{ background: "#111111" }}>
                                            {promo.discount}
                                        </span>
                                        <span className="beauty-promo-type-pill" style={{ background: "rgba(0,0,0,0.75)", color: promo.accent }}>
                                            {promo.badge}
                                        </span>
                                    </div>

                                    <div className="beauty-promo-content">
                                        <span className="beauty-promo-category-tag" style={{ color: promo.accent }}>
                                            {promo.category.toUpperCase()}
                                        </span>
                                        <h3 className="beauty-promo-title">{promo.title}</h3>
                                        <h4 className="beauty-promo-subheading">{promo.subtitle}</h4>
                                        <p className="beauty-promo-desc">{promo.description}</p>

                                        <span className="beauty-promo-btn watch-promo-btn" style={{ borderColor: promo.accent }}>
                                            <span>Shop Now</span>
                                            <span className="beauty-promo-arrow">→</span>
                                        </span>
                                    </div>

                                    <div className="beauty-promo-shine" style={{ pointerEvents: "none" }} />
                                </a>
                            );
                        })}
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        type="button"
                        className="beauty-carousel-arrow beauty-carousel-prev"
                        onClick={(e) => {
                            e.preventDefault();
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
                            e.preventDefault();
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
                    {WATCH_PROMO_DATA.map((promo, idx) => (
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
}

export default WatchPromoCarousel;
