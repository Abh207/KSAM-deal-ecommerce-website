import React, { useState, useEffect, useRef } from "react";
import { Star, ArrowLeft, ArrowRight, Quote, CheckCircle2, MapPin, ShoppingBag } from "lucide-react";

const WATCH_REVIEWS = [
    {
        id: "w-rev-1",
        name: "Vikram Singhania",
        initials: "VS",
        bgGradient: "linear-gradient(135deg, #0f9d76, #1de9b6)",
        city: "Mumbai",
        product: "Aqua Pro Diver",
        rating: 5,
        review: "Tested the 50-meter water resistance during weekend scuba sessions in Goa. The screw-down crown and sapphire crystal held up impeccably, and the dial luminosity in deep waters is crystal clear."
    },
    {
        id: "w-rev-2",
        name: "Aditya Nair",
        initials: "AN",
        bgGradient: "linear-gradient(135deg, #0d9488, #2dd4bf)",
        city: "Bengaluru",
        product: "Chrono Black",
        rating: 5,
        review: "The matte black dial and contrasting subdials look unbelievable in person. The stopwatch pushers have a very satisfying tactile click, and the stainless steel case feels solid yet comfortable."
    },
    {
        id: "w-rev-3",
        name: "Rohit Malhotra",
        initials: "RM",
        bgGradient: "linear-gradient(135deg, #0f9d76, #14b8a6)",
        city: "Delhi",
        product: "Heritage Classic",
        rating: 5,
        review: "Bought this for my brother's wedding reception. The champagne sunburst dial paired with the genuine leather strap looks like a luxury Swiss timepiece. Exceptional horology at ₹279."
    },
    {
        id: "w-rev-4",
        name: "Sameer Joshi",
        initials: "SJ",
        bgGradient: "linear-gradient(135deg, #10b981, #059669)",
        city: "Pune",
        product: "Automatic Skeleton",
        rating: 5,
        review: "Seeing the balance wheel oscillate through the open-heart skeleton dial never gets old. The automatic movement keeps impeccable time with zero daily drift. A masterpiece for mechanical watch enthusiasts."
    },
    {
        id: "w-rev-5",
        name: "Kavita Rao",
        initials: "KR",
        bgGradient: "linear-gradient(135deg, #0f9d76, #1de9b6)",
        city: "Hyderabad",
        product: "Minimalist Mesh",
        rating: 5,
        review: "The rose-gold mesh band is whisper-light and adjusts effortlessly to smaller wrists without pinching skin. Pairs gorgeously with everyday work formals as well as evening dresses."
    },
    {
        id: "w-rev-6",
        name: "Manish Agarwal",
        initials: "MA",
        bgGradient: "linear-gradient(135deg, #0d9488, #2dd4bf)",
        city: "Jaipur",
        product: "Forest GMT",
        rating: 5,
        review: "The dual-timezone GMT bezel is a blessing for international client meetings. Ceramic bezel insert has zero scratches after two months of frequent airport travel. Superb craftsmanship."
    },
    {
        id: "w-rev-7",
        name: "Pooja Hegde",
        initials: "PH",
        bgGradient: "linear-gradient(135deg, #10b981, #059669)",
        city: "Chennai",
        product: "Rose Elegance",
        rating: 5,
        review: "Received this as an anniversary gift in premium KSAM packaging. The mother-of-pearl dial has a delicate shimmer under sunlight and the bracelet link finish feels silky smooth."
    },
    {
        id: "w-rev-8",
        name: "Karan Oberoi",
        initials: "KO",
        bgGradient: "linear-gradient(135deg, #0f9d76, #14b8a6)",
        city: "Chandigarh",
        product: "Midnight Chronograph",
        rating: 5,
        review: "Sturdy chronograph built for rugged everyday wear. The anti-reflective coating cuts glare completely under bright afternoon sun. Phenomenal value for money and prompt 2-day delivery."
    }
];

function WatchFeedback() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const total = WATCH_REVIEWS.length;
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
            className="beauty-section-wrap beauty-reviews-section watch-feedback-section"
            aria-label="What Our Customers Say"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <div className="beauty-glass-panel">
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
                        Real experiences from watch lovers across India.
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
                            {WATCH_REVIEWS.map((rev) => (
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
                    {WATCH_REVIEWS.map((rev, idx) => (
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

export default WatchFeedback;
