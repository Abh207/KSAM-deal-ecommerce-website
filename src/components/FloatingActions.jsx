import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import "./FloatingActions.css";

export default function FloatingActions() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // SVG circular progress calculation
  // Radius = 24 -> Circumference = 2 * PI * 24 ≈ 150.796
  const RADIUS = 24;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * scrollProgress) / 100;

  // Track window scroll for progress ring & visibility
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = totalHeight > 0 ? Math.min(Math.max((currentY / totalHeight) * 100, 0), 100) : 0;

          setScrollProgress(progress);
          setShowScrollTop(currentY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="ks-floating-actions-container" aria-label="Quick Actions">
      {/* 56px Circular Scroll to Top Button with SVG Progress Ring */}
      <button
        type="button"
        className={`ks-scroll-top-btn ${showScrollTop ? "is-visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Scroll back to top"
        tabIndex={showScrollTop ? 0 : -1}
      >
        <svg className="ks-scroll-top-svg" viewBox="0 0 56 56" aria-hidden="true">
          {/* Background Track Ring */}
          <circle
            className="ks-scroll-ring-bg"
            cx="28"
            cy="28"
            r={RADIUS}
            strokeWidth="2.5"
            fill="none"
          />
          {/* Animated Lime Progress Ring */}
          <circle
            className="ks-scroll-ring-fill"
            cx="28"
            cy="28"
            r={RADIUS}
            strokeWidth="2.5"
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <ArrowUp size={20} className="ks-scroll-icon" strokeWidth={2.4} />
      </button>
    </div>
  );
}
