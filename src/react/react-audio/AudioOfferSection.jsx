import React, { useEffect, useState, useRef, useMemo } from "react";
import { ArrowRight, Flame } from "lucide-react";

const DEADLINE_KEY = "ksam_audio_flash_deadline_v2";
const DURATION_MS = 48 * 60 * 60 * 1000; // 48 hours

function getOrInitDeadline() {
    try {
        const stored = localStorage.getItem(DEADLINE_KEY);
        const now = Date.now();
        if (stored) {
            const parsed = parseInt(stored, 10);
            if (!isNaN(parsed) && parsed > now) {
                return parsed;
            }
        }
        const next = now + DURATION_MS;
        localStorage.setItem(DEADLINE_KEY, String(next));
        return next;
    } catch {
        return Date.now() + DURATION_MS;
    }
}

export default function AudioOfferSection({
    currentOffer,
    products = [],
    scrollToProducts,
    getImagePath
}) {
    const sectionRef = useRef(null);
    const cardRef = useRef(null);
    const [inView, setInView] = useState(false);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: "47",
        minutes: "59",
        seconds: "59",
        progress: 10
    });

    // 1. Intersection Observer for scroll reveal
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                }
            },
            { threshold: 0.15 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // 2. Rolling 48-Hour Timer
    useEffect(() => {
        let deadline = getOrInitDeadline();

        const calculateTime = () => {
            const now = Date.now();
            let diff = deadline - now;

            if (diff <= 0) {
                // Restart rolling 48-hour cycle
                deadline = now + DURATION_MS;
                try {
                    localStorage.setItem(DEADLINE_KEY, String(deadline));
                } catch {}
                diff = DURATION_MS;
            }

            const totalSec = Math.floor(diff / 1000);
            const days = Math.floor(totalSec / 86400);
            const hours = Math.floor((totalSec % 86400) / 3600);
            const minutes = Math.floor((totalSec % 3600) / 60);
            const seconds = totalSec % 60;

            const elapsed = DURATION_MS - diff;
            const progress = Math.max(0, Math.min(100, (elapsed / DURATION_MS) * 100));

            setTimeLeft({
                days,
                hours: String(hours).padStart(2, "0"),
                minutes: String(minutes).padStart(2, "0"),
                seconds: String(seconds).padStart(2, "0"),
                progress
            });
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // 3. Desktop Mouse Parallax
    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        card.style.setProperty("--parallax-x", `${(x * 24).toFixed(2)}px`);
        card.style.setProperty("--parallax-y", `${(y * 24).toFixed(2)}px`);
        card.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (!card) return;
        card.style.setProperty("--parallax-x", "0px");
        card.style.setProperty("--parallax-y", "0px");
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
    };

    // Filter featured products for the visual showcase (headphones, earbuds, speaker)
    const featuredItems = useMemo(() => {
        const preferredIds = currentOffer?.productIds || [
            "audio-003", // SonicPulse ANC Headphones
            "audio-001", // Fire-Boltt Drift TWS
            "audio-006"  // BassCannon Pro Speaker
        ];

        let found = products.filter((p) => preferredIds.includes(p.id));
        if (found.length < 3) {
            // Fallback to first 3 products
            found = products.slice(0, 3);
        }
        return found.slice(0, 3);
    }, [products, currentOffer]);

    return (
        <section
            ref={sectionRef}
            className={`audio-offer-section ${inView ? "is-in-view" : ""}`}
            id="audio-flash-offer"
            aria-label="Flash Audio Sale Offer"
        >
            {/* Soft green ambient radial glow behind card */}
            <div className="audio-offer-ambient-glow" aria-hidden="true" />

            <div
                ref={cardRef}
                className="audio-offer-glass-card"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Light shimmer sweep line */}
                <div className="audio-offer-shimmer" aria-hidden="true" />

                {/* Rotating / glowing neon border */}
                <div className="audio-offer-border-glow" aria-hidden="true" />

                {/* Circular / starburst 60% OFF badge - placed cleanly without text overlap */}
                <div
                    className="audio-discount-starburst"
                    aria-label="60% OFF Limited Discount"
                >
                    <svg
                        className="audio-starburst-svg"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M50 2 L62 16 L80 10 L84 29 L100 33 L93 51 L100 66 L84 76 L83 95 L65 93 L53 100 L38 92 L24 99 L18 82 L2 80 L8 62 L0 49 L12 37 L7 20 L24 21 L31 4 Z"
                            fill="url(#neonGlowGrad)"
                        />
                        <defs>
                            <linearGradient
                                id="neonGlowGrad"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                            >
                                <stop offset="0%" stopColor="#8cff00" />
                                <stop offset="100%" stopColor="#55aa00" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="audio-starburst-content">
                        <strong>60%</strong>
                        <span>OFF</span>
                    </div>
                </div>

                <div className="audio-offer-grid-layout">
                    {/* LEFT COLUMN: Text, Countdown, Progress, CTA */}
                    <div className="audio-offer-content-col">
                        {/* Pill with pulsing live dot */}
                        <div className="audio-offer-pill-row">
                            <span className="audio-live-pill">
                                <span className="audio-live-dot" />
                                LIMITED TIME DROP
                            </span>
                            <span className="audio-live-chip">
                                <Flame size={13} className="audio-flame-icon" />
                                Selling Fast
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className="audio-offer-main-title">
                            {currentOffer?.title || "FLASH AUDIO SALE"}
                        </h2>

                        {/* Subtitle */}
                        <p className="audio-offer-subtitle">
                            {currentOffer?.subtitle || "Premium sound. Limited price."}
                        </p>

                        {/* Modern Glass Countdown */}
                        <div
                            className="audio-countdown-container"
                            role="timer"
                            aria-label={`Time remaining in flash sale: ${
                                timeLeft.days > 0 ? `${timeLeft.days} days ` : ""
                            }${timeLeft.hours} hours ${timeLeft.minutes} minutes ${
                                timeLeft.seconds
                            } seconds`}
                        >
                            {timeLeft.days > 0 && (
                                <div className="audio-glass-tile">
                                    <div className="audio-digit-flipper">
                                        <span
                                            key={timeLeft.days}
                                            className="audio-digit-value"
                                        >
                                            {timeLeft.days}
                                        </span>
                                    </div>
                                    <span className="audio-tile-label">DAYS</span>
                                </div>
                            )}

                            <div className="audio-glass-tile">
                                <div className="audio-digit-flipper">
                                    <span
                                        key={timeLeft.hours}
                                        className="audio-digit-value"
                                    >
                                        {timeLeft.hours}
                                    </span>
                                </div>
                                <span className="audio-tile-label">HOURS</span>
                            </div>

                            <span className="audio-timer-colon">:</span>

                            <div className="audio-glass-tile">
                                <div className="audio-digit-flipper">
                                    <span
                                        key={timeLeft.minutes}
                                        className="audio-digit-value"
                                    >
                                        {timeLeft.minutes}
                                    </span>
                                </div>
                                <span className="audio-tile-label">MIN</span>
                            </div>

                            <span className="audio-timer-colon">:</span>

                            <div className="audio-glass-tile is-seconds-glow">
                                <div className="audio-digit-flipper">
                                    <span
                                        key={timeLeft.seconds}
                                        className="audio-digit-value is-neon-sec"
                                    >
                                        {timeLeft.seconds}
                                    </span>
                                </div>
                                <span className="audio-tile-label">SEC</span>
                            </div>
                        </div>

                        {/* Thin cycle progress bar */}
                        <div
                            className="audio-countdown-cycle-bar"
                            role="progressbar"
                            aria-valuenow={Math.round(timeLeft.progress)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        >
                            <div
                                className="audio-cycle-fill"
                                style={{ width: `${timeLeft.progress}%` }}
                            />
                        </div>

                        {/* Sold: 78% claimed Progress */}
                        <div className="audio-claimed-container">
                            <div className="audio-claimed-header">
                                <span>
                                    Sold: <strong>78% claimed</strong>
                                </span>
                                <span className="audio-claimed-hurry">
                                    Only 14 units left at this price
                                </span>
                            </div>
                            <div className="audio-claimed-track">
                                <div
                                    className="audio-claimed-fill"
                                    style={{ width: "78%" }}
                                />
                            </div>
                        </div>

                        {/* Big Neon CTA Button */}
                        <div className="audio-offer-cta-wrap">
                            <button
                                type="button"
                                className="audio-flash-cta-btn"
                                onClick={scrollToProducts}
                                aria-label="Shop this offer and scroll to products"
                            >
                                <span>Shop this offer</span>
                                <ArrowRight size={20} className="audio-cta-arrow" />
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Layered Floating Products with Parallax */}
                    <div className="audio-offer-visuals-col">
                        <div className="audio-floating-stage">
                            {featuredItems.map((prod, idx) => (
                                <div
                                    key={prod.id}
                                    className={`audio-floating-card float-pos-${idx + 1}`}
                                    onClick={scrollToProducts}
                                    title={`View ${prod.name}`}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") scrollToProducts();
                                    }}
                                >
                                    <div className="audio-float-img-box">
                                        <img
                                            src={getImagePath(prod.image)}
                                            alt={prod.name}
                                            loading="lazy"
                                            decoding="async"
                                            width="160"
                                            height="160"
                                        />
                                    </div>
                                    <div className="audio-float-badge-chip">
                                        <span className="audio-chip-title">
                                            {prod.name}
                                        </span>
                                        <span className="audio-chip-price">
                                            ₹{Number(prod.price).toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scrolling Ticker Line at Bottom of Glass Card */}
                <div className="audio-offer-ticker-bar" aria-hidden="true">
                    <div className="audio-ticker-track">
                        <span>
                            FREE DELIVERY ABOVE ₹999 • 60% OFF FLASH SALE • LIMITED STOCK • 1-YEAR WARRANTY • DISPATCH IN 24H • SECURE CHECKOUT •
                        </span>
                        <span>
                            FREE DELIVERY ABOVE ₹999 • 60% OFF FLASH SALE • LIMITED STOCK • 1-YEAR WARRANTY • DISPATCH IN 24H • SECURE CHECKOUT •
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
