import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    useMemo
} from "react";

const VALUE_PROPS = [
    "Wireless Earbuds",
    "Studio Headphones",
    "Bass Speakers",
    "Gaming Headsets"
];

const resolveAssetUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
    const base = import.meta.env.BASE_URL || "/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    let clean = path.replace(/^\/+/, "");
    return `${normalizedBase}${clean}`;
};

const getProductUrl = (product) => {
    if (!product) return "#";
    const base = import.meta.env.BASE_URL || "/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const uid = product.uid || `audio-${product.id}`;
    return `${normalizedBase}product.html?id=${encodeURIComponent(product.id)}&category=${encodeURIComponent(product.category || "Audio")}&uid=${encodeURIComponent(uid)}&from=audio`;
};

function AudioHero({
    hero,
    dealProduct,
    onExplore,
    onExploreCategories
}) {
    const heroRef = useRef(null);
    const videoRef = useRef(null);

    const [inView, setInView] = useState(true);
    const [propIndex, setPropIndex] = useState(0);
    const [videoFailed, setVideoFailed] = useState(false);

    // Motion and data saver preference checks
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
        return typeof window !== "undefined" &&
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    });

    const [saveDataActive] = useState(() => {
        if (typeof navigator === "undefined") return false;
        const conn = navigator.connection;
        return Boolean(conn?.saveData || conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g");
    });

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onChange = (e) => setPrefersReducedMotion(e.matches);
        if (mq.addEventListener) mq.addEventListener("change", onChange);
        return () => mq.removeEventListener?.("change", onChange);
    }, []);

    // IntersectionObserver for hero container (pause video when out of viewport)
    useEffect(() => {
        const el = heroRef.current;
        if (!el || typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setInView(entry.isIntersecting);
            },
            { threshold: 0.05 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Video autoplay after first paint & pause lifecycle
    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;

        try {
            vid.defaultMuted = true;
            vid.muted = true;
        } catch {}

        const shouldPlay =
            inView &&
            document.visibilityState !== "hidden" &&
            !prefersReducedMotion &&
            !saveDataActive &&
            !videoFailed;

        if (shouldPlay) {
            vid.play().catch(() => {});
        } else {
            vid.pause();
        }

        const onVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                vid.pause();
            } else if (inView && !prefersReducedMotion && !saveDataActive && !videoFailed) {
                vid.play().catch(() => {});
            }
        };

        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    }, [inView, prefersReducedMotion, saveDataActive, videoFailed]);

    // Value props cycling timer (every 3 seconds)
    useEffect(() => {
        const timer = setInterval(() => {
            setPropIndex((prev) => (prev + 1) % VALUE_PROPS.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const handleExploreCategories = useCallback(() => {
        if (onExploreCategories) {
            onExploreCategories();
        } else {
            const el = document.getElementById("audio-categories");
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [onExploreCategories]);

    const handleExploreProducts = useCallback(() => {
        if (onExplore) {
            onExplore();
        } else {
            const el = document.getElementById("audio-products");
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [onExplore]);

    // Active product for Today's Deal
    const deal = dealProduct || hero?.dealProduct || null;
    const dealUrl = deal ? getProductUrl(deal) : "#";
    const dealPriceFormatted = deal?.price ? `₹${Number(deal.price).toLocaleString("en-IN")}` : "";
    const dealOldPriceFormatted = deal?.oldPrice ? `₹${Number(deal.oldPrice).toLocaleString("en-IN")}` : "";
    const dealDiscount = useMemo(() => {
        if (!deal) return null;
        if (deal.discount) return Number(deal.discount);
        if (deal.oldPrice && deal.price && Number(deal.oldPrice) > Number(deal.price)) {
            return Math.round(((Number(deal.oldPrice) - Number(deal.price)) / Number(deal.oldPrice)) * 100);
        }
        return 50;
    }, [deal]);

    const posterUrl = resolveAssetUrl("assets/videos/audio-hero-poster.webp");
    const mobileWebm = resolveAssetUrl("assets/videos/audio-hero_mobile.webm");
    const mobileMp4 = resolveAssetUrl("assets/videos/audio-hero_mobile.mp4");
    const desktopWebm = resolveAssetUrl("assets/videos/audio-hero.webm");
    const desktopMp4 = resolveAssetUrl("assets/videos/audio-hero.mp4");

    const showVideo = !prefersReducedMotion && !saveDataActive && !videoFailed;

    return (
        <section
            ref={heroRef}
            className="audio-hero-container-outer"
            aria-label="Audio Hero Showcase"
        >
            {/* ── BACKGROUND VIDEO / POSTER FALLBACK ── */}
            <div className="audio-hero-media-wrap" aria-hidden="true">
                {showVideo ? (
                    <video
                        ref={videoRef}
                        className="audio-hero-video"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        poster={posterUrl}
                    >
                        <source
                            media="(max-width: 768px)"
                            src={mobileWebm}
                            type="video/webm"
                        />
                        <source
                            media="(max-width: 768px)"
                            src={mobileMp4}
                            type="video/mp4"
                        />
                        <source
                            src={desktopWebm}
                            type="video/webm"
                        />
                        <source
                            src={desktopMp4}
                            type="video/mp4"
                            onError={() => setVideoFailed(true)}
                        />
                    </video>
                ) : (
                    <img
                        src={posterUrl}
                        alt=""
                        className="audio-hero-poster-fallback"
                        loading="eager"
                        decoding="async"
                    />
                )}
            </div>

            {/* ── DARK GRADIENT OVERLAY (Top 75% -> Mid 30% -> Bottom 85%) ── */}
            <div className="audio-hero-gradient-overlay" aria-hidden="true" />

            {/* ── SOFT NEON-GREEN BOTTOM VIGNETTE GLOW ── */}
            <div className="audio-hero-bottom-glow" aria-hidden="true" />

            {/* ── BOTTOM FADE TO SEAMLESSLY BLEND INTO NEXT SECTION ── */}
            <div className="audio-hero-bottom-fade" aria-hidden="true" />

            {/* ── MAIN CONTENT (SINGLE SLIDE, ZERO CAROUSEL) ── */}
            <div className="audio-hero-content-wrapper">
                <div className="audio-hero-left-col">
                    {/* Eyebrow Pill */}
                    <div className="audio-hero-eyebrow-pill">
                        <span className="audio-hero-live-dot" aria-hidden="true" />
                        <span className="audio-hero-eyebrow-text">
                            NEW ARRIVALS | PREMIUM AUDIO
                        </span>
                    </div>

                    {/* Staggered Word-by-Word Headline */}
                    <h1 className="audio-hero-headline" aria-label="Feel every beat. Hear the difference.">
                        <span className="audio-hero-headline-line line-1" aria-hidden="true">
                            <span className="audio-hero-word" style={{ animationDelay: "0.08s" }}>Feel</span>{" "}
                            <span className="audio-hero-word" style={{ animationDelay: "0.18s" }}>every</span>{" "}
                            <span className="audio-hero-word" style={{ animationDelay: "0.28s" }}>beat.</span>
                        </span>
                        <span className="audio-hero-headline-line line-2" aria-hidden="true">
                            <span className="audio-hero-word hero-lime-highlight" style={{ animationDelay: "0.40s" }}>Hear</span>{" "}
                            <span className="audio-hero-word hero-lime-highlight" style={{ animationDelay: "0.50s" }}>the</span>{" "}
                            <span className="audio-hero-word hero-lime-highlight" style={{ animationDelay: "0.60s" }}>difference.</span>
                        </span>
                    </h1>

                    {/* Rotating Sub-heading (every 3 seconds) */}
                    <div className="audio-hero-rotator" aria-live="polite">
                        <span className="audio-hero-rotator-label">Experience</span>
                        <span
                            key={propIndex}
                            className="audio-hero-rotator-text"
                        >
                            {VALUE_PROPS[propIndex]}
                        </span>
                    </div>

                    {/* Sub-paragraph */}
                    <p className="audio-hero-description">
                        Up to 60% off on top audio brands. Free delivery, easy returns, and 1-year warranty.
                    </p>

                    {/* Action Buttons (>=44px touch targets) */}
                    <div className="audio-hero-actions-row">
                        <button
                            type="button"
                            className="audio-hero-btn-primary"
                            onClick={handleExploreProducts}
                        >
                            <span>Shop collection</span>
                            <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                        </button>

                        <button
                            type="button"
                            className="audio-hero-btn-secondary"
                            onClick={handleExploreCategories}
                        >
                            <span>Explore categories</span>
                        </button>
                    </div>
                </div>

                {/* ── FLOATING GLASS "TODAY'S DEAL" CHIP (Desktop Only) ── */}
                {deal && (
                    <div className="audio-hero-deal-col" aria-label="Today's Deal Featured">
                        <div className="audio-hero-deal-glass">
                            <div className="audio-hero-deal-header">
                                <span className="audio-hero-deal-pill">
                                    <span className="audio-hero-deal-sparkle">⚡</span>
                                    TODAY'S DEAL
                                </span>
                                {dealDiscount && (
                                    <span className="audio-hero-deal-badge">
                                        UP TO {dealDiscount}% OFF
                                    </span>
                                )}
                            </div>

                            <div className="audio-hero-deal-body">
                                <div className="audio-hero-deal-img-wrap">
                                    <img
                                        src={resolveAssetUrl(deal.image)}
                                        alt={deal.name}
                                        className="audio-hero-deal-img"
                                        loading="lazy"
                                        decoding="async"
                                        width="120"
                                        height="120"
                                    />
                                </div>

                                <div className="audio-hero-deal-meta">
                                    <span className="audio-hero-deal-category">
                                        {deal.category || "PREMIUM SOUND"}
                                    </span>
                                    <h3 className="audio-hero-deal-title" title={deal.name}>
                                        {deal.name}
                                    </h3>
                                    <div className="audio-hero-deal-prices">
                                        <span className="audio-hero-deal-now">{dealPriceFormatted}</span>
                                        {dealOldPriceFormatted && (
                                            <span className="audio-hero-deal-was">{dealOldPriceFormatted}</span>
                                        )}
                                    </div>
                                    <a
                                        href={dealUrl}
                                        className="audio-hero-deal-link-btn"
                                        aria-label={`View details for ${deal.name}`}
                                    >
                                        <span>View Product</span>
                                        <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── ANIMATED SCROLL DOWN INDICATOR ── */}
            <button
                type="button"
                className="audio-hero-scroll-prompt"
                onClick={handleExploreProducts}
                aria-label="Scroll down to explore products"
            >
                <div className="audio-hero-mouse-icon">
                    <span className="audio-hero-mouse-wheel" />
                </div>
                <span className="audio-hero-scroll-prompt-text">SCROLL TO EXPLORE</span>
                <i className="fa-solid fa-chevron-down audio-hero-scroll-arrow" aria-hidden="true"></i>
            </button>
        </section>
    );
}

export default AudioHero;
