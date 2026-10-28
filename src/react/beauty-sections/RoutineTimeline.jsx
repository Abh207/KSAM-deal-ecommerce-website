import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Droplets, Sun, Feather, ShieldCheck, HeartHandshake } from "lucide-react";

const ROUTINE_STEPS = [
    {
        num: "01",
        name: "Cleanse",
        icon: Droplets,
        tip: "Wash away impurities, excess sebum, and makeup residue with a gentle, sulfate-free cleanser.",
        tag: "Morning & Night",
        color: "#38bdf8"
    },
    {
        num: "02",
        name: "Treat",
        icon: Sparkles,
        tip: "Apply targeted active serums—Vitamin C for daytime brightening or Hyaluronic Acid for deep plumping.",
        tag: "Active Care",
        color: "#f59e0b"
    },
    {
        num: "03",
        name: "Moisturize",
        icon: Feather,
        tip: "Seal in essential nourishment and replenish skin barrier lipids with a lightweight ceramide moisturizer.",
        tag: "Barrier Support",
        color: "#10b981"
    },
    {
        num: "04",
        name: "Protect",
        icon: ShieldCheck,
        tip: "Never skip broad-spectrum SPF 50+ to prevent premature photoaging, pigmentation, and UV damage.",
        tag: "Daily Essential",
        color: "#ec4899"
    },
    {
        num: "05",
        name: "Shine",
        icon: HeartHandshake,
        tip: "Add a swipe of nourishing tinted lip oil and lightweight cheek glow for a fresh, dewy radiance.",
        tag: "Finishing Touch",
        color: "#a855f7"
    }
];

const RoutineTimeline = () => {
    const timelineRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = timelineRef.current;
        if (!el || typeof IntersectionObserver === "undefined") {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={timelineRef}
            className={`beauty-section-wrap beauty-routine-section${isVisible ? " is-visible" : ""}`}
            aria-label="Your Daily Glow Routine"
        >
            <div className="beauty-glass-panel">
                <div className="beauty-section-header-centered">
                    <div className="beauty-section-badge">
                        <Sparkles size={14} className="beauty-badge-icon" />
                        <span>EXPERT SKINCARE GUIDE</span>
                    </div>
                    <h2 className="beauty-section-title">Your Daily Glow Routine</h2>
                    <p className="beauty-section-subtitle">
                        Follow these 5 dermatologist-approved steps for timeless, radiant, healthy-looking skin.
                    </p>
                </div>

                <div className="beauty-timeline-container">
                    {/* Connecting line */}
                    <div className="beauty-timeline-line-track">
                        <div className="beauty-timeline-line-fill" />
                    </div>

                    <div className="beauty-timeline-steps">
                        {ROUTINE_STEPS.map((step, idx) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={step.num}
                                    className="beauty-timeline-step-card"
                                    style={{
                                        "--step-index": idx,
                                        "--step-color": step.color
                                    }}
                                >
                                    <div className="beauty-timeline-step-marker">
                                        <div className="beauty-timeline-icon-box">
                                            <Icon size={22} />
                                        </div>
                                        <span className="beauty-timeline-number">{step.num}</span>
                                    </div>

                                    <div className="beauty-timeline-step-content">
                                        <span className="beauty-timeline-tag">{step.tag}</span>
                                        <h3 className="beauty-timeline-step-name">{step.name}</h3>
                                        <p className="beauty-timeline-step-tip">{step.tip}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RoutineTimeline;
