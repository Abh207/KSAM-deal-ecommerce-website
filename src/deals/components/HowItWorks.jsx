import React, { useEffect, useRef, useState } from "react";
import {
    Search,
    GitCompare,
    ExternalLink,
    BellRing,
    BadgePercent,
    Heart
} from "lucide-react";
import "./HowItWorks.css";

const steps = [
    {
        number: "01",
        icon: Search,
        title: "Search",
        text: "Tell KSAM Deal what product you are looking for.",
        chip: "Instant results",
        accent: "emerald"
    },
    {
        number: "02",
        icon: GitCompare,
        title: "Compare",
        text: "Explore available prices and discounts across stores.",
        chip: "Best price",
        accent: "blue"
    },
    {
        number: "03",
        icon: ExternalLink,
        title: "Visit Store",
        text: "Click the deal and continue on the original store.",
        chip: "Direct link",
        accent: "teal"
    },
    {
        number: "04",
        icon: BellRing,
        title: "Price Drop Alerts",
        text: "Set target prices and get notified the moment a deal drops.",
        chip: "Live tracking",
        accent: "amber"
    },
    {
        number: "05",
        icon: BadgePercent,
        title: "Verified Discounts",
        text: "Curated offers checked across top Indian partner stores.",
        chip: "Trusted stores",
        accent: "rose"
    },
    {
        number: "06",
        icon: Heart,
        title: "Smart Wishlist",
        text: "Save favorite products and revisit them anytime in one place.",
        chip: "Synced history",
        accent: "indigo"
    }
];

function HowItWorks() {
    const sectionRef = useRef(null);
    const [isRevealed, setIsRevealed] = useState(false);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        // Respect prefers-reduced-motion
        const prefersReduced =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (prefersReduced) {
            setIsRevealed(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    setIsRevealed(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1
            }
        );

        observer.observe(el);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <section
            id="how-it-works"
            ref={sectionRef}
            className={`hiw-section ${isRevealed ? "is-revealed" : ""}`}
        >
            <div className="hiw-container">
                {/* Header Block */}
                <div className="hiw-header">
                    <div className="hiw-pill-badge">
                        <span className="hiw-pill-dot" aria-hidden="true"></span>
                        HOW IT WORKS &amp; FEATURES
                    </div>

                    <h2 className="hiw-title">
                        Everything you need.{" "}
                        <span className="hiw-title-gradient">To save smarter.</span>
                    </h2>

                    <p className="hiw-subtitle">
                        Find, compare, and track deals across India's top retail stores — completely free.
                    </p>
                </div>

                {/* 6 Feature / Process Boxes */}
                <div className="hiw-grid-wrapper">
                    <div className="hiw-grid">
                        {steps.map((step, index) => {
                            const Icon = step.icon;

                            return (
                                <div
                                    key={step.number}
                                    className={`hiw-card hiw-card-${step.accent}`}
                                    style={{
                                        "--step-delay": `${index * 60}ms`
                                    }}
                                >
                                    {/* Top Row: Tinted Icon Badge & Watermark Step Number */}
                                    <div className="hiw-card-top">
                                        <div className={`hiw-icon-badge hiw-badge-${step.accent}`}>
                                            <Icon
                                                size={22}
                                                className="hiw-icon-svg"
                                                strokeWidth={2.2}
                                            />
                                        </div>

                                        <span
                                            className="hiw-step-number"
                                            aria-hidden="true"
                                        >
                                            {step.number}
                                        </span>
                                    </div>

                                    {/* Card Content */}
                                    <div className="hiw-card-content">
                                        <span className={`hiw-step-label hiw-label-${step.accent}`}>
                                            STEP {step.number}
                                        </span>

                                        <h3 className="hiw-card-title">
                                            {step.title}
                                        </h3>

                                        <p className="hiw-card-desc">
                                            {step.text}
                                        </p>
                                    </div>

                                    {/* Bottom Pill Tag */}
                                    <div className="hiw-card-bottom">
                                        <span className={`hiw-chip hiw-chip-${step.accent}`}>
                                            <span
                                                className="hiw-chip-dot"
                                                aria-hidden="true"
                                            ></span>
                                            {step.chip}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HowItWorks;
