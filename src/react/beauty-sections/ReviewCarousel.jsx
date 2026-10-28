import React, { useState, useEffect, useRef } from "react";
import { Star, ArrowLeft, ArrowRight, Quote, CheckCircle2, MapPin, ShoppingBag } from "lucide-react";

const REVIEWS = [
    {
        id: "rev-1",
        name: "Ananya Sharma",
        initials: "AS",
        bgGradient: "linear-gradient(135deg, #0f9d76, #1de9b6)",
        rating: 5,
        location: "Mumbai",
        product: "Vitamin C Face Serum",
        text: "The Vitamin C Face Serum gave me visible radiance in just 10 days! It absorbs in seconds without any sticky residue, and my stubborn acne marks have noticeably faded."
    },
    {
        id: "rev-2",
        name: "Pooja Patel",
        initials: "PP",
        bgGradient: "linear-gradient(135deg, #0d9488, #2dd4bf)",
        rating: 5,
        location: "Bengaluru",
        product: "Matte Lipstick (Cherry Plum)",
        text: "The Matte Lipstick formula is extraordinary. It stayed smooth all day through multiple coffees without feathering or drying my lips. Truly salon grade quality at great pricing!"
    },
    {
        id: "rev-3",
        name: "Rhea Kapoor",
        initials: "RK",
        bgGradient: "linear-gradient(135deg, #0f9d76, #14b8a6)",
        rating: 5,
        location: "Delhi",
        product: "Luxury Floral Eau de Parfum",
        text: "Super fast 24-hour dispatch and 100% authentic packaging. The perfume lasts easily 12+ hours with delicate floral and warm amber undertones. I've received so many compliments!"
    },
    {
        id: "rev-4",
        name: "Sneha Reddy",
        initials: "SR",
        bgGradient: "linear-gradient(135deg, #10b981, #059669)",
        rating: 5,
        location: "Hyderabad",
        product: "Aloe Vera Face Wash",
        text: "The Aloe Vera Face Wash is my holy grail for sensitive combination skin. Zero tightness after cleansing, just calm, cool, and balanced skin every single morning."
    },
    {
        id: "rev-5",
        name: "Dr. Meera Sen",
        initials: "MS",
        bgGradient: "linear-gradient(135deg, #0f9d76, #1de9b6)",
        rating: 5,
        location: "Kolkata",
        product: "Hydrating Ceramide Cream",
        text: "As a practicing dermatologist, I love the clean and transparent ingredient lists. Formulated without unnecessary fragrances or parabens, and clinically proven hydration."
    }
];

const ReviewCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const total = REVIEWS.length;
    const timerRef = useRef(null);

    const next = () => setActiveIndex((prev) => (prev + 1) % total);
    const prev = () => setActiveIndex((prev) => (prev - 1 + total) % total);

    useEffect(() => {
        if (isPaused) return;
        timerRef.current = setInterval(next, 4500);
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
    };

    const handleTouchEnd = (e) => {
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
                        Real experiences from beauty enthusiasts across India.
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

export default ReviewCarousel;
