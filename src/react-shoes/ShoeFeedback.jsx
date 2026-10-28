import React, { useState, useEffect, useRef } from "react";
import { Star, ArrowLeft, ArrowRight, Quote, CheckCircle2, MapPin, ShoppingBag } from "lucide-react";

const REVIEWS = [
    {
        id: "rev-1",
        name: "Kabir Verma",
        initials: "KV",
        bgGradient: "linear-gradient(135deg, #0f9d76, #1de9b6)",
        city: "Mumbai",
        product: "Urban Street Runner",
        rating: 5,
        review: "The cushioning on these sneakers is unreal! I walk 8,000 steps daily on Mumbai streets and have zero heel fatigue. Delivery took only 2 days, and the packaging was spotless."
    },
    {
        id: "rev-2",
        name: "Priya Nair",
        initials: "PN",
        bgGradient: "linear-gradient(135deg, #0d9488, #2dd4bf)",
        city: "Bengaluru",
        product: "Velocity Pro Runner",
        rating: 5,
        review: "Super lightweight with incredible arch support. Perfect for my morning runs around Cubbon Park. The breathable mesh kept my feet cool even in high humidity."
    },
    {
        id: "rev-3",
        name: "Rohan Mehta",
        initials: "RM",
        bgGradient: "linear-gradient(135deg, #0f9d76, #14b8a6)",
        city: "Delhi",
        product: "Executive Leather Step",
        rating: 5,
        review: "Wore these Oxfords to an all-day client conference. Soft inner lining, no breaking-in blister drama, and the leather shine looks extremely luxurious with suits."
    },
    {
        id: "rev-4",
        name: "Ananya Deshmukh",
        initials: "AD",
        bgGradient: "linear-gradient(135deg, #10b981, #059669)",
        city: "Pune",
        product: "Cloud Walk Comfort",
        rating: 5,
        review: "Hands down the most comfortable slip-on walking shoes I've owned. The cushioning feels like memory foam clouds, and the fit is 100% true to size."
    },
    {
        id: "rev-5",
        name: "Vikram Rathore",
        initials: "VR",
        bgGradient: "linear-gradient(135deg, #0f9d76, #1de9b6)",
        city: "Jaipur",
        product: "Mountain Trek Boot",
        rating: 5,
        review: "Took these boots for a weekend trek in the Aravalis. Incredible grip on loose gravel, sturdy ankle support, and very easy to wipe clean after muddy trails."
    },
    {
        id: "rev-6",
        name: "Shreya Iyer",
        initials: "SI",
        bgGradient: "linear-gradient(135deg, #0d9488, #2dd4bf)",
        city: "Chennai",
        product: "Classic Court Sneaker",
        rating: 5,
        review: "Clean minimalist aesthetic that pairs seamlessly with denim or casual dresses. Outstanding build quality for ₹1,599—feels like a ₹5K international brand pair!"
    },
    {
        id: "rev-7",
        name: "Arjun Singhania",
        initials: "AS",
        bgGradient: "linear-gradient(135deg, #0f9d76, #14b8a6)",
        city: "Chandigarh",
        product: "Active Sprint X",
        rating: 5,
        review: "Great grip for gym workouts and sprint training. The sole absorbs impact remarkably well during box jumps. 10/10 recommend KSAM Shoes to anyone training hard!"
    },
    {
        id: "rev-8",
        name: "Tanvi Kulkarni",
        initials: "TK",
        bgGradient: "linear-gradient(135deg, #10b981, #059669)",
        city: "Hyderabad",
        product: "Everyday Flex Sneaker",
        rating: 5,
        review: "Ordered using KSAM's instant deal price. Packaging was intact, shoes are feather-light, and they've immediately become my daily college go-to pair."
    }
];

function ShoeFeedback() {
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
            className="shoe-feedback-section"
            aria-label="What Our Customers Say"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <div className="shoe-feedback-container">
                {/* Centered Stacked Header */}
                <div className="beauty-reviews-header-centered">
                    <div className="beauty-section-badge">
                        <Star size={13} className="beauty-badge-icon" fill="currentColor" />
                        <span>VERIFIED CUSTOMER LOVE</span>
                    </div>

                    <h2 className="beauty-reviews-title">
                        What Our <span className="beauty-reviews-gradient-text">Customers Say</span>
                    </h2>

                    <p className="beauty-reviews-subtitle">
                        Real experiences from shoe lovers across India.
                    </p>
                </div>

                {/* Review Card Container with Overlapping Side Arrow Buttons */}
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
                                                            {rev.city}
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
                                                aria-label="5 out of 5 stars"
                                            >
                                                {[...Array(5)].map((_, i) => (
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

                                        {/* Purchased Product Chip with bag icon */}
                                        <div className="beauty-review-product-chip">
                                            <ShoppingBag size={13} className="beauty-chip-bag-icon" />
                                            <span>
                                                Purchased: <strong>{rev.product}</strong>
                                            </span>
                                        </div>

                                        {/* Large Quote Mark & Review Text */}
                                        <div className="beauty-review-quote-row">
                                            <Quote size={28} className="beauty-review-quote-mark" />
                                            <p className="beauty-review-text">{rev.review}</p>
                                        </div>
                                    </article>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Dots centered below the card: inactive grey, active longer green pill */}
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
}

export default ShoeFeedback;
