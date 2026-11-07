import React, { useEffect, useRef, useState } from "react";
import {
    Search,
    GitCompare,
    ExternalLink
} from "lucide-react";
import "./HowItWorks.css";


const steps = [
    {
        number: "01",
        icon: Search,
        title: "Search",
        text: "Tell KSAM Deal what product you are looking for.",
        chip: "Instant results"
    },
    {
        number: "02",
        icon: GitCompare,
        title: "Compare",
        text: "Explore available prices and discounts.",
        chip: "Best price"
    },
    {
        number: "03",
        icon: ExternalLink,
        title: "Visit Store",
        text: "Click the deal and continue on the original store.",
        chip: "Direct link"
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
                threshold: 0.15
            }
        );

        observer.observe(el);

        return () => {
            observer.disconnect();
        };
    }, []);

    const handleCardMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.currentTarget.style.setProperty("--spotlight-x", `${x}px`);
        e.currentTarget.style.setProperty("--spotlight-y", `${y}px`);
    };

    return (
        <section
            id="how-it-works"
            ref={sectionRef}
            className={`hiw-section ${isRevealed ? "is-revealed" : ""}`}
        >
            {/* Full-bleed subtle lime background radial glow */}
            <div className="hiw-bg-glow" aria-hidden="true"></div>

            <div className="hiw-container">
                {/* Header Block */}
                <div className="hiw-header">
                    <div className="hiw-pill-badge">
                        <span className="hiw-pill-dot" aria-hidden="true"></span>
                        SIMPLE PROCESS
                    </div>

                    <h2 className="hiw-title">
                        Three steps.{" "}
                        <span className="hiw-title-gradient">That's it.</span>
                    </h2>

                    <p className="hiw-subtitle">
                        Find, compare and save, all in one place.
                    </p>
                </div>

                {/* Grid Wrapper with Connector Line */}
                <div className="hiw-grid-wrapper">
                    {/* Desktop animated dashed connector line with directional arrows */}
                    <div className="hiw-desktop-connector" aria-hidden="true">
                        <div className="hiw-connector-line"></div>
                        <div className="hiw-connector-arrow hiw-arrow-1">▶</div>
                        <div className="hiw-connector-arrow hiw-arrow-2">▶</div>
                    </div>

                    {/* Mobile vertical line */}
                    <div className="hiw-mobile-connector" aria-hidden="true"></div>

                    {/* 3 Step Cards */}
                    <div className="hiw-grid">
                        {steps.map((step, index) => {
                            const Icon = step.icon;

                            return (
                                <div
                                    key={step.number}
                                    className="hiw-card"
                                    style={{
                                        "--step-delay": `${index * 120}ms`
                                    }}
                                    onMouseMove={handleCardMouseMove}
                                >
                                    {/* Mouse-follow spotlight */}
                                    <div
                                        className="hiw-spotlight"
                                        aria-hidden="true"
                                    ></div>

                                    {/* Top Row: 72px Icon Badge & Outlined Step Number */}
                                    <div className="hiw-card-top">
                                        <div
                                            className={`hiw-icon-badge hiw-icon-badge-${index + 1}`}
                                        >
                                            <Icon
                                                size={32}
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
                                        <span className="hiw-step-label">
                                            STEP {step.number}
                                        </span>

                                        <h3 className="hiw-card-title">
                                            {step.title}
                                        </h3>

                                        <p className="hiw-card-desc">
                                            {step.text}
                                        </p>
                                    </div>

                                    {/* Bottom Lime Pill Chip */}
                                    <div className="hiw-card-bottom">
                                        <span className="hiw-chip">
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
