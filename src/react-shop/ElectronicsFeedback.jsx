import React, { useState, useEffect, useRef } from "react";
import { Star, ArrowLeft, ArrowRight, Quote, CheckCircle2, MapPin, ShoppingBag } from "lucide-react";

const REVIEWS = [
    {
        id: "rev-1",
        name: "Rohan Varma",
        initials: "RV",
        bgGradient: "linear-gradient(135deg, #0f9d76, #1de9b6)",
        rating: 5,
        location: "Bengaluru",
        product: "Modern Laptop",
        text: "The battery easily lasts 14+ hours on a single charge while handling heavy code compilation and multi-tab workflows. Whisper-quiet thermals and lightning-fast boot times!"
    },
    {
        id: "rev-2",
        name: "Aditya Nair",
        initials: "AN",
        bgGradient: "linear-gradient(135deg, #0d9488, #2dd4bf)",
        rating: 5,
        location: "Kochi",
        product: "Wireless Headphones",
        text: "Mind-blowing acoustic depth and deep, resonant bass. The hybrid ANC completely blocks out city traffic and office chatter. Battery backup easily delivers over 30 hours."
    },
    {
        id: "rev-3",
        name: "Vikram Malhotra",
        initials: "VM",
        bgGradient: "linear-gradient(135deg, #0f9d76, #14b8a6)",
        rating: 5,
        location: "Delhi",
        product: "Premium Smartphone",
        text: "Blazing fast octa-core multitasking with zero throttling. The camera produces DSLR-like portraits in low light. Genuine sealed box with authentic manufacturer warranty."
    },
    {
        id: "rev-4",
        name: "Kavita Rao",
        initials: "KR",
        bgGradient: "linear-gradient(135deg, #10b981, #059669)",
        rating: 5,
        location: "Hyderabad",
        product: "iPhone 15 Pro",
        text: "The 120Hz Super Retina OLED display is sensational. Scrolling is silky smooth and HDR playback is razor sharp. Hands down the best tech deal available online."
    },
    {
        id: "rev-5",
        name: "Arjun Sen",
        initials: "AS",
        bgGradient: "linear-gradient(135deg, #0f9d76, #1de9b6)",
        rating: 5,
        location: "Kolkata",
        product: "Smart Home Speaker",
        text: "Ordered on Monday night and delivered by Wednesday noon in tamper-proof cushioned packaging. Syncs seamlessly across my smart ecosystem with crystal clear voice recognition."
    },
    {
        id: "rev-6",
        name: "Priya Deshmukh",
        initials: "PD",
        bgGradient: "linear-gradient(135deg, #0d9488, #2dd4bf)",
        rating: 5,
        location: "Pune",
        product: "Digital Camera",
        text: "Exceptional price-to-performance ratio! The optical zoom and 4K image stabilization make it effortless for travel vlogging. KSAM Deal beat all other retail prices."
    },
    {
        id: "rev-7",
        name: "Sameer Joshi",
        initials: "SJ",
        bgGradient: "linear-gradient(135deg, #10b981, #059669)",
        rating: 5,
        location: "Mumbai",
        product: "Gaming Console",
        text: "Ray tracing realism and instant game loading thanks to the custom SSD. Cooling stays cool and quiet through 4-hour weekend sessions. Unmatched customer experience."
    }
];

const ElectronicsFeedback = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const total = REVIEWS.length;
    const timerRef = useRef(null);

    const next = () => setActiveIndex((prev) => (prev + 1) % total);
    const prev = () => setActiveIndex((prev) => (prev - 1 + total) % total);

    // Auto-slide every 5s with pause on hover/touch
    useEffect(() => {
        if (isPaused) return;
        timerRef.current = setInterval(next, 5000);
        return () => clearInterval(timerRef.current);
    }, [isPaused, total]);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
    };

    // Touch swipe handlers
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        setIsPaused(true);
    };

    const handleTouchEnd = (e) => {
        setIsPaused(false);
        touchEndX.current = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 40) {
            if (diff > 0) next();
            else prev();
        }
    };

    return (
        <section
            className="beauty-section-wrap beauty-reviews-section"
            aria-label="What Our Customers Say"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <div className="beauty-glass-panel">
                {/* a) Centered Stacked Header */}
                <div className="beauty-reviews-header-centered">
                    <div className="beauty-section-badge">
                        <Star size={13} className="beauty-badge-icon" fill="currentColor" />
                        <span>VERIFIED CUSTOMER LOVE</span>
                    </div>

                    <h2 className="beauty-reviews-title">
                        What Our <span className="beauty-reviews-gradient-text">Customers Say</span>
                    </h2>

                    <p className="beauty-reviews-subtitle">
                        Real experiences from tech lovers across India.
                    </p>
                </div>

                {/* b) & c) Review Card Container with Overlapping Side Arrow Buttons */}
                <div
                    className="beauty-reviews-carousel-wrap"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Left Previous Button */}
                    <button
                        type="button"
                        className="beauty-reviews-side-arrow prev"
                        onClick={prev}
                        aria-label="Previous customer review"
                        title="Previous review"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    {/* Right Next Button */}
                    <button
                        type="button"
                        className="beauty-reviews-side-arrow next"
                        onClick={next}
                        aria-label="Next customer review"
                        title="Next review"
                    >
                        <ArrowRight size={20} />
                    </button>

                    {/* Viewport */}
                    <div className="beauty-reviews-viewport">
                        <div
                            className="beauty-reviews-slider"
                            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                        >
                            {REVIEWS.map((rev) => (
                                <div key={rev.id} className="beauty-review-slide">
                                    <article className="beauty-review-card">
                                        {/* Top Row: Profile (left) and 5 Orange Stars (right) */}
                                        <div className="beauty-review-top">
                                            <div className="beauty-reviewer-profile">
                                                <div
                                                    className="beauty-reviewer-avatar"
                                                    style={{ background: rev.bgGradient }}
                                                    aria-hidden="true"
                                                >
                                                    {rev.initials}
                                                </div>

                                                <div className="beauty-reviewer-details">
                                                    <h4 className="beauty-reviewer-name">{rev.name}</h4>
                                                    <div className="beauty-reviewer-meta-row">
                                                        <span className="beauty-reviewer-location">
                                                            <MapPin size={12} className="beauty-meta-icon" />
                                                            {rev.location}
                                                        </span>
                                                        <span className="beauty-meta-divider">•</span>
                                                        <span className="beauty-reviewer-verified">
                                                            <CheckCircle2 size={12} className="beauty-verified-tick" />
                                                            Verified Buyer
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 5 Orange Stars */}
                                            <div
                                                className="beauty-review-rating"
                                                aria-label={`${rev.rating} out of 5 stars`}
                                            >
                                                {[...Array(rev.rating)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={18}
                                                        className="beauty-star-fill"
                                                        fill="#f59e0b"
                                                        color="#f59e0b"
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Purchased Product Chip with tiny bag icon */}
                                        <div className="beauty-review-product-chip">
                                            <ShoppingBag size={13} className="beauty-chip-bag-icon" />
                                            <span>
                                                Purchased: <strong>{rev.product}</strong>
                                            </span>
                                        </div>

                                        {/* Large Quote Mark & Review Text */}
                                        <div className="beauty-review-quote-row">
                                            <Quote size={28} className="beauty-review-quote-mark" />
                                            <p className="beauty-review-text">{rev.text}</p>
                                        </div>
                                    </article>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* c) Dots centered below the card */}
                <div className="beauty-carousel-dots" role="tablist" aria-label="Review slider pagination">
                    {REVIEWS.map((rev, idx) => (
                        <button
                            key={rev.id}
                            type="button"
                            role="tab"
                            aria-selected={activeIndex === idx}
                            className={`beauty-carousel-dot${activeIndex === idx ? " active" : ""}`}
                            onClick={() => setActiveIndex(idx)}
                            aria-label={`Go to customer review ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ElectronicsFeedback;
