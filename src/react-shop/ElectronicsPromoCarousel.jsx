import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

const PROMO_CARDS = [
    {
        id: "promo-1",
        productId: 303,
        productCategory: "Audio",
        productUid: "audio-303",
        badge: "HEADPHONES SPECIAL",
        discount: "40% OFF",
        title: "Flat 40% OFF Headphones",
        description: "Deep bass acoustic drivers, memory foam cushioning and 30-hour wireless playtime.",
        image: "images/remote/unsplash_1505740420928-5e560c06d30e.webp",
        accent: "#1de9b6"
    },
    {
        id: "promo-2",
        productId: 302,
        productCategory: "Laptops",
        productUid: "laptops-302",
        badge: "POWER PRODUCTIVITY",
        discount: "FROM ₹799",
        title: "Modern Laptops from ₹799",
        description: "Sleek aluminum chassis, blazing fast SSD storage, and crisp anti-glare display.",
        image: "images/remote/unsplash_1496181133206-80ce9b88a853.webp",
        accent: "#2dd4bf"
    },
    {
        id: "promo-3",
        productId: 307,
        productCategory: "Smartphones",
        productUid: "smartphones-307",
        badge: "FLAGSHIP SAVINGS",
        discount: "10% OFF",
        title: "Smartphone Deals & Flagships",
        description: "Pro camera system, vibrant 120Hz Super Retina display and next-generation A17 Pro chip.",
        image: "images/remote/unsplash_1511707171634-5f897ff02aa9.webp",
        accent: "#14b8a6"
    },
    {
        id: "promo-4",
        productId: 306,
        productCategory: "Smart Home",
        productUid: "smart-home-306",
        badge: "INTELLIGENT LIVING",
        discount: "23% OFF",
        title: "Smart Home & Voice Gadgets",
        description: "Hands-free voice assistant with 360° room-filling acoustic audio and smart ecosystem hub.",
        image: "images/remote/unsplash_1589492477829-5e65395b66cc.webp",
        accent: "#10b981"
    },
    {
        id: "promo-5",
        productId: 305,
        productCategory: "Gaming",
        productUid: "gaming-305",
        badge: "NEXT-GEN POWER",
        discount: "HOT DEAL",
        title: "Next-Gen Gaming Consoles",
        description: "Ultra-high frame rates, hardware-accelerated ray tracing and lightning-fast custom SSD.",
        image: "images/remote/unsplash_1606813907291-d86efa9b94db.webp",
        accent: "#1de9b6"
    },
    {
        id: "promo-6",
        productId: 304,
        productCategory: "Cameras",
        productUid: "cameras-304",
        badge: "CREATOR STUDIO",
        discount: "14% OFF",
        title: "Pro 4K Digital Cameras",
        description: "Versatile optical zoom lens, high-definition video capture and rapid intelligent tracking.",
        image: "images/remote/unsplash_1516035069371-29a1b244cc32.webp",
        accent: "#0f9d76"
    },
    {
        id: "promo-7",
        productId: 317,
        productCategory: "Audio",
        productUid: "audio-317",
        badge: "EXCLUSIVE PERK",
        discount: "FREE SHIPPING",
        title: "Free Delivery Above ₹999",
        description: "Enjoy zero delivery fees on orders above ₹999 with insured tamper-proof packaging.",
        image: "images/remote/unsplash_1590658268037-6bf12165a8df.webp",
        accent: "#2dd4bf"
    },
    {
        id: "promo-8",
        productId: 308,
        productCategory: "Smartphones",
        productUid: "smartphones-308",
        badge: "JUST LAUNCHED",
        discount: "NEW ARRIVAL",
        title: "New Flagship Arrivals",
        description: "Discover the Samsung Galaxy S24 series with AI productivity and all-day endurance.",
        image: "images/remote/unsplash_1580910051074-3eb694886505.webp",
        accent: "#10b981"
    }
];

const AUTOPLAY_DELAY = 4000;

const ElectronicsPromoCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);

    const total = PROMO_CARDS.length;
    const progressTimerRef = useRef(null);
    const pointerStart = useRef({ x: 0, y: 0 });
    const draggedDist = useRef(0);

    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;

    const getProductUrl = (card) => {
        return `${normalizedBase}product.html?id=${encodeURIComponent(card.productId)}&category=${encodeURIComponent(card.productCategory)}&uid=${encodeURIComponent(card.productUid)}&from=electronics`;
    };

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % total);
        setProgress(0);
    }, [total]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + total) % total);
        setProgress(0);
    }, [total]);

    // Autoplay & progress bar
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

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === "ArrowLeft") prevSlide();
        if (e.key === "ArrowRight") nextSlide();
    };

    // 3D Tilt & Shine on Mouse Move
    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        const shine = card.querySelector(".electronics-promo-shine");
        if (shine) {
            shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.3) 0%, transparent 60%)`;
        }
    };

    const handleMouseLeave = (e) => {
        const card = e.currentTarget;
        card.style.transform = "";
        const shine = card.querySelector(".electronics-promo-shine");
        if (shine) {
            shine.style.background = "none";
        }
    };

    // Pointer Drag Tracking - ONLY prevent link if moved >= 6px
    const handlePointerDown = (e) => {
        pointerStart.current = { x: e.clientX, y: e.clientY };
        draggedDist.current = 0;
    };

    const handlePointerMove = (e) => {
        if (e.buttons === 1) {
            const dist = Math.hypot(e.clientX - pointerStart.current.x, e.clientY - pointerStart.current.y);
            draggedDist.current = dist;
        }
    };

    const handlePointerUp = (e) => {
        const diffX = pointerStart.current.x - e.clientX;
        if (Math.abs(diffX) > 40) {
            if (diffX > 0) nextSlide();
            else prevSlide();
        }
    };

    const handleCardClick = (e) => {
        if (draggedDist.current >= 6) {
            e.preventDefault();
        }
    };

    return (
        <section
            id="promotions"
            className="beauty-section-wrap electronics-promo-section"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label="Hot Electronics Offers & Promotions"
        >
            <div className="beauty-glass-panel electronics-promo-panel">
                {/* Centered Header */}
                <div className="beauty-section-header-centered">
                    <div className="beauty-section-badge">
                        <Sparkles size={14} className="beauty-badge-icon" />
                        <span>LIMITED TIME DEALS</span>
                    </div>
                    <h2 className="beauty-section-title">
                        Hot Electronics <span className="beauty-reviews-gradient-text">Offers &amp; Promotions</span>
                    </h2>
                    <p className="beauty-section-subtitle">
                        Handcrafted tech steals, limited-time price drops, and bundles on premium verified gear.
                    </p>
                </div>

                {/* Carousel Wrap */}
                <div
                    className="electronics-promo-carousel-wrap"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                >
                    {/* Left Previous Button */}
                    <button
                        type="button"
                        className="beauty-reviews-side-arrow prev"
                        onClick={prevSlide}
                        aria-label="Previous offer"
                        title="Previous offer"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    {/* Right Next Button */}
                    <button
                        type="button"
                        className="beauty-reviews-side-arrow next"
                        onClick={nextSlide}
                        aria-label="Next offer"
                        title="Next offer"
                    >
                        <ArrowRight size={20} />
                    </button>

                    {/* Viewport */}
                    <div className="electronics-promo-viewport">
                        <div
                            className="electronics-promo-track"
                            style={{
                                transform: `translateX(calc(-${currentIndex} * (100% / var(--cards-visible, 3))))`
                            }}
                        >
                            {PROMO_CARDS.map((card, idx) => {
                                const isActive = idx === currentIndex;
                                return (
                                    <div
                                        key={card.id}
                                        className={`electronics-promo-slide${isActive ? " is-active" : ""}`}
                                    >
                                        <a
                                            href={getProductUrl(card)}
                                            data-product-id={card.productId}
                                            className="electronics-promo-card"
                                            onMouseMove={handleMouseMove}
                                            onMouseLeave={handleMouseLeave}
                                            onClick={handleCardClick}
                                            aria-label={`Shop deal: ${card.title}`}
                                        >
                                            {/* Image */}
                                            <div className="electronics-promo-media">
                                                <img
                                                    src={card.image}
                                                    alt={card.title}
                                                    loading="lazy"
                                                    className="electronics-promo-img"
                                                />
                                                <div className="electronics-promo-overlay" />
                                                <div className="electronics-promo-shine" />

                                                {/* Top Badge & Discount */}
                                                <span className="electronics-promo-badge">
                                                    {card.badge}
                                                </span>
                                                <span className="electronics-promo-discount">
                                                    {card.discount}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="electronics-promo-info">
                                                <h3 className="electronics-promo-card-title">{card.title}</h3>
                                                <p className="electronics-promo-card-desc">{card.description}</p>
                                                <span className="electronics-promo-btn">
                                                    Shop Now →
                                                </span>
                                            </div>
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="electronics-promo-progress-bar" aria-hidden="true">
                        <div
                            className="electronics-promo-progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Clickable Dots */}
                <div className="beauty-carousel-dots" role="tablist" aria-label="Promo carousel pagination">
                    {PROMO_CARDS.map((card, idx) => (
                        <button
                            key={card.id}
                            type="button"
                            role="tab"
                            aria-selected={currentIndex === idx}
                            className={`beauty-carousel-dot${currentIndex === idx ? " active" : ""}`}
                            onClick={() => {
                                setCurrentIndex(idx);
                                setProgress(0);
                            }}
                            aria-label={`Go to promotion ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ElectronicsPromoCarousel;
