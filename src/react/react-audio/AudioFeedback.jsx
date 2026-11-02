import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Star,
    ArrowLeft,
    ArrowRight,
    Quote,
    CheckCircle2,
    MapPin,
    ShoppingBag
} from "lucide-react";

const AUDIO_REVIEWS = [
    {
        id: "a-rev-1",
        name: "Vikram Rathore",
        initials: "VR",
        bgGradient: "linear-gradient(135deg, #366800, #8cff00)",
        city: "Mumbai",
        product: "SonicPulse ANC Headphones",
        rating: 5,
        review: "The hybrid Active Noise Cancellation cuts out Mumbai local train noise completely. Deep sub-bass with zero distortion even at 80% volume, and the memory foam ear cushions stay cool for 6+ hour work sessions."
    },
    {
        id: "a-rev-2",
        name: "Ananya Sen",
        initials: "AS",
        bgGradient: "linear-gradient(135deg, #2b5400, #8cff00)",
        city: "Bengaluru",
        product: "AirMax Pro Wireless Headphones",
        rating: 5,
        review: "Spatial audio on these headphones is surreal for acoustic playlists and movies. The 40-hour battery life easily survived a full week of office commutes and Zoom calls on a single fast charge."
    },
    {
        id: "a-rev-3",
        name: "Rohit Deshmukh",
        initials: "RD",
        bgGradient: "linear-gradient(135deg, #448000, #8cff00)",
        city: "Pune",
        product: "TRIGGR Wireless Earbuds",
        rating: 5,
        review: "Gaming latency is virtually zero with the 40ms low-latency beast mode. Quad ENC microphones pick up my voice crystal-clear during team discord sessions even with a ceiling fan at full speed."
    },
    {
        id: "a-rev-4",
        name: "Sameer Khan",
        initials: "SK",
        bgGradient: "linear-gradient(135deg, #3f7800, #8cff00)",
        city: "Delhi",
        product: "BassCannon Pro Speaker",
        rating: 5,
        review: "Brought this rugged IPX7 waterproof speaker to our Rishikesh riverside camping trip. The twin passive radiators punch out thumping bass that filled our entire campsite for 14 hours straight."
    },
    {
        id: "a-rev-5",
        name: "Priya Nair",
        initials: "PN",
        bgGradient: "linear-gradient(135deg, #366800, #8cff00)",
        city: "Kochi",
        product: "Fire-Boltt Drift TWS",
        rating: 5,
        review: "Snug ergonomic in-ear fit that never loosens during intense morning sprints. Touch controls are super responsive, and the instant Bluetooth 5.3 auto-pairing connects the second I open the magnetic case."
    },
    {
        id: "a-rev-6",
        name: "Manav Mehta",
        initials: "MM",
        bgGradient: "linear-gradient(135deg, #2b5400, #8cff00)",
        city: "Ahmedabad",
        product: "T30 Noise Cancelling Earbuds",
        rating: 5,
        review: "Astonishing ANC quality at this price point. Transparency mode lets me have quick conversations without pulling the earbuds out. Type-C fast charge gave 3 hours of playtime in just 10 minutes."
    },
    {
        id: "a-rev-7",
        name: "Sneha Kulkarni",
        initials: "SK",
        bgGradient: "linear-gradient(135deg, #3f7800, #8cff00)",
        city: "Hyderabad",
        product: "EchoBeats Wireless Earbuds",
        rating: 5,
        review: "Crystal clear call quality with zero wind interference. The compact charging case slips into my pocket without bulk, and the audio profile is rich with crisp highs and balanced mids."
    },
    {
        id: "a-rev-8",
        name: "Kabir Oberoi",
        initials: "KO",
        bgGradient: "linear-gradient(135deg, #448000, #8cff00)",
        city: "Chandigarh",
        product: "StudioSound Pro Headset",
        rating: 5,
        review: "Studio-grade 50mm dynamic drivers deliver exceptional instrumental separation. Detachable boom microphone is broadcast-quality, and KSAM Deal delivered it in pristine packaging within 24 hours."
    }
];

export default function AudioFeedback() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [inView, setInView] = useState(true);
    const [tabVisible, setTabVisible] = useState(true);

    const sectionRef = useRef(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const total = AUDIO_REVIEWS.length;

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

    // IntersectionObserver to pause off-screen
    useEffect(() => {
        const el = sectionRef.current;
        if (!el || typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Visibility change
    useEffect(() => {
        const handleVis = () => setTabVisible(document.visibilityState !== "hidden");
        document.addEventListener("visibilitychange", handleVis);
        return () => document.removeEventListener("visibilitychange", handleVis);
    }, []);

    const next = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % total);
    }, [total]);

    const prev = useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + total) % total);
    }, [total]);

    // Auto-slide every 7s with pause on hover/touch/focus/offscreen
    useEffect(() => {
        if (isPaused || !inView || !tabVisible || prefersReducedMotion) return;
        const timer = setInterval(next, 7000);
        return () => clearInterval(timer);
    }, [isPaused, inView, tabVisible, prefersReducedMotion, next]);

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

    // Touch swipe handlers
    const handleTouchStart = (e) => {
        setIsPaused(true);
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = touchStartX.current - endX;
        const diffY = touchStartY.current - endY;

        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) next();
            else prev();
        }
        setTimeout(() => setIsPaused(false), 3000);
    };

    return (
        <section
            ref={sectionRef}
            className="audio-feedback-section"
            id="audio-feedback"
            aria-label="Customer Reviews and Testimonials"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <div className="audio-feedback-container">
                {/* ── Section Header (Black & Neon-Green Theme) ── */}
                <div className="audio-feedback-header-centered">
                    <div className="audio-feedback-badge">
                        <Star size={13} className="audio-feedback-badge-star" fill="currentColor" />
                        <span>VERIFIED CUSTOMER LOVE</span>
                    </div>

                    <h2 className="audio-feedback-title">
                        What Our <span className="audio-lime-gradient-text">Customers Say</span>
                    </h2>

                    <div className="audio-spotlight-underline" aria-hidden="true" />

                    <p className="audio-feedback-subtitle">
                        Real experiences from audio lovers across India.
                    </p>
                </div>

                {/* ── Carousel Wrap with Side Arrows ── */}
                <div
                    className="audio-feedback-carousel-wrap"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onFocus={() => setIsPaused(true)}
                    onBlur={() => setIsPaused(false)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    aria-live="polite"
                >
                    {/* Previous Button */}
                    <button
                        type="button"
                        className="audio-feedback-side-arrow prev"
                        onClick={prev}
                        aria-label="Previous customer review"
                        title="Previous review"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    {/* Next Button */}
                    <button
                        type="button"
                        className="audio-feedback-side-arrow next"
                        onClick={next}
                        aria-label="Next customer review"
                        title="Next review"
                    >
                        <ArrowRight size={20} />
                    </button>

                    {/* Viewport */}
                    <div className="audio-feedback-viewport">
                        <div
                            className="audio-feedback-slider"
                            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                        >
                            {AUDIO_REVIEWS.map((rev) => (
                                <div key={rev.id} className="audio-feedback-slide">
                                    <article className="audio-feedback-card">
                                        {/* Top Row: Avatar & Profile (left) and 5 Stars (right) */}
                                        <div className="audio-feedback-top">
                                            <div className="audio-feedback-profile">
                                                <div
                                                    className="audio-feedback-avatar"
                                                    style={{ background: rev.bgGradient }}
                                                    aria-hidden="true"
                                                >
                                                    {rev.initials}
                                                </div>

                                                <div className="audio-feedback-details">
                                                    <h4 className="audio-feedback-name">{rev.name}</h4>
                                                    <div className="audio-feedback-meta-row">
                                                        <span className="audio-feedback-location">
                                                            <MapPin size={12} className="audio-meta-pin-icon" />
                                                            {rev.city}
                                                        </span>
                                                        <span className="audio-meta-dot">•</span>
                                                        <span className="audio-feedback-verified">
                                                            <CheckCircle2 size={12} className="audio-verified-tick" />
                                                            Verified Buyer
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 5 Stars */}
                                            <div
                                                className="audio-feedback-rating"
                                                aria-label="5 out of 5 stars"
                                            >
                                                {[...Array(rev.rating)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={18}
                                                        className="audio-star-fill"
                                                        fill="#f59e0b"
                                                        color="#f59e0b"
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Purchased Product Chip */}
                                        <div className="audio-feedback-product-chip">
                                            <ShoppingBag size={13} className="audio-chip-bag-icon" />
                                            <span>
                                                Purchased: <strong>{rev.product}</strong>
                                            </span>
                                        </div>

                                        {/* Quote & Review Text */}
                                        <div className="audio-feedback-quote-row">
                                            <Quote size={28} className="audio-feedback-quote-icon" />
                                            <p className="audio-feedback-text">{rev.review}</p>
                                        </div>
                                    </article>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Pill Dots Pagination ── */}
                <div
                    className="audio-feedback-dots"
                    role="tablist"
                    aria-label="Customer review pagination"
                >
                    {AUDIO_REVIEWS.map((rev, idx) => (
                        <button
                            key={rev.id}
                            type="button"
                            role="tab"
                            aria-selected={activeIndex === idx}
                            className={`audio-feedback-dot${activeIndex === idx ? " active" : ""}`}
                            onClick={() => setActiveIndex(idx)}
                            aria-label={`Go to customer review ${idx + 1} from ${rev.name}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

