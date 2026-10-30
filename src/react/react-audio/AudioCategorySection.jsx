import React, { useEffect, useRef, useState, memo } from "react";

// Helper component for count-up animation on scroll
const AnimatedCount = memo(function AnimatedCount({ target, trigger }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!trigger) return;

        // If prefers-reduced-motion, set instantly
        if (
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            setCount(target);
            return;
        }

        let startTimestamp = null;
        const duration = 800; // ms
        let rafId;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease-out quad
            const ease = 1 - (1 - progress) * (1 - progress);
            setCount(Math.round(ease * target));
            if (progress < 1) {
                rafId = requestAnimationFrame(step);
            }
        };

        rafId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafId);
    }, [target, trigger]);

    return <span>{trigger ? count : target}</span>;
});

export default function AudioCategorySection({
    categories = [],
    products = [],
    selectedCategory = "All",
    onSelectCategory
}) {
    const sectionRef = useRef(null);
    const [inView, setInView] = useState(false);

    // IntersectionObserver for staggered reveal and count-up trigger
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

    // 3D Tilt handlers for desktop
    const handleTileMouseMove = (e) => {
        if (
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            return;
        }
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -9;
        const rotateY = ((x - centerX) / centerX) * 9;

        card.style.setProperty("--cat-mx", `${x}px`);
        card.style.setProperty("--cat-my", `${y}px`);
        card.style.transform = `perspective(700px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    };

    const handleTileMouseLeave = (e) => {
        const card = e.currentTarget;
        card.style.transform = "";
        card.style.removeProperty("--cat-mx");
        card.style.removeProperty("--cat-my");
    };

    // Full list of tiles starting with "All Audio"
    const allTiles = [
        {
            id: "cat-all",
            name: "All",
            displayName: "All Audio",
            icon: "fa-solid fa-layer-group",
            count: products.length
        },
        ...categories.map((c) => ({
            id: c.id,
            name: c.name,
            displayName: c.name,
            icon: c.icon,
            count: products.filter((p) => p.category === c.name).length
        }))
    ];

    return (
        <section
            ref={sectionRef}
            className={`audio-categories-section ${inView ? "is-in-view" : ""}`}
            id="audio-categories"
            aria-label="Explore Audio Categories"
        >
            {/* Heading with Letter-spaced green eyebrow, Glowing title, Subtitle */}
            <div className="audio-categories-heading">
                <span className="audio-cat-eyebrow">EXPLORE AUDIO</span>
                <h2 className="audio-cat-title">Find your sound.</h2>
                <p className="audio-cat-subtitle">
                    Choose the audio experience that matches your lifestyle.
                </p>
            </div>

            {/* Mobile Scroll Wrap with subtle edge-fade and scroll-snap */}
            <div className="audio-cat-scroll-wrap">
                <div
                    className="audio-cat-grid"
                    role="tablist"
                    aria-label="Audio categories"
                >
                    {allTiles.map((tile, index) => {
                        const isActive =
                            tile.name === "All"
                                ? selectedCategory === "All"
                                : selectedCategory === tile.name;

                        return (
                            <button
                                key={tile.id}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                aria-pressed={isActive}
                                className={`audio-cat-card ${isActive ? "is-active" : ""}`}
                                style={{ "--stagger-idx": index }}
                                onClick={() => onSelectCategory(tile.name)}
                                onMouseMove={handleTileMouseMove}
                                onMouseLeave={handleTileMouseLeave}
                            >
                                {/* Mouse spotlight gradient */}
                                <span className="audio-cat-spotlight" aria-hidden="true" />

                                {/* Category Neon Icon */}
                                <span className="audio-cat-icon-wrap" aria-hidden="true">
                                    <i className={tile.icon} />
                                </span>

                                {/* Category Title */}
                                <span className="audio-cat-name">{tile.displayName}</span>

                                {/* Live product count badge with animated count-up */}
                                <span
                                    className="audio-cat-pill"
                                    aria-label={`${tile.count} products`}
                                >
                                    <AnimatedCount
                                        target={tile.count}
                                        trigger={inView}
                                    />
                                </span>

                                {/* Sliding active indicator */}
                                {isActive && (
                                    <span
                                        className="audio-cat-active-indicator"
                                        aria-hidden="true"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

