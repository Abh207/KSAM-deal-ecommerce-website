import React, { useState, useEffect } from "react";

/**
 * 3px fixed Reading Progress Bar under 72px Navbar
 */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setProgress(0);
        return;
      }
      const scrolled = (window.scrollY / docHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrolled)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="kx-reading-progress-track" aria-hidden="true">
      <div
        className="kx-reading-progress-bar"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/**
 * Reusable .kx-aurora background layer
 */
export function Aurora({ tone = "green-blue" }) {
  return (
    <div className="kx-aurora" data-tone={tone} aria-hidden="true">
      <div className="kx-aurora-blob kx-aurora-blob-1" />
      <div className="kx-aurora-blob kx-aurora-blob-2" />
      <div className="kx-aurora-blob kx-aurora-blob-3" />
    </div>
  );
}

/**
 * Hook to limit animated conic rings to at most 6 visible cards in viewport
 */
export function useGlowObserver(containerRef) {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    const container = containerRef?.current || document;
    const cards = Array.from(container.querySelectorAll(".kx-glow"));
    if (!cards.length) return;

    const visibleCards = new Set();

    const updateAnimatingCards = () => {
      let count = 0;
      cards.forEach((card) => {
        if (visibleCards.has(card) && count < 6) {
          card.classList.add("is-animating");
          count++;
        } else {
          card.classList.remove("is-animating");
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleCards.add(entry.target);
          } else {
            visibleCards.delete(entry.target);
          }
        });
        updateAnimatingCards();
      },
      { threshold: 0.1 }
    );

    cards.forEach((c) => observer.observe(c));

    return () => {
      observer.disconnect();
    };
  }, [containerRef]);
}

/**
 * Hook to synchronize theme & accent in real-time
 */
export function useThemeSync() {
  const [themeState, setThemeState] = useState(() => {
    if (typeof document !== "undefined") {
      return {
        theme: document.documentElement.getAttribute("data-theme") || "dark",
        accent: document.documentElement.getAttribute("data-accent") || "green"
      };
    }
    return { theme: "dark", accent: "green" };
  });

  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e?.detail) {
        setThemeState({
          theme: e.detail.theme,
          accent: e.detail.accent
        });
      }
    };
    window.addEventListener("ksam-theme-changed", handleThemeChange);
    return () => window.removeEventListener("ksam-theme-changed", handleThemeChange);
  }, []);

  return themeState;
}

/**
  * Hook for Scroll-Triggered Transforming Cards:
  * Detects when a card enters the active viewing area and adds subtle visual emphasis.
  */
export function useScrollTransformingCards(containerRef) {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    const container = containerRef?.current || document;
    const cards = Array.from(container.querySelectorAll(".kx-transform-card"));
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            entry.target.classList.add("is-active-view");
          } else {
            entry.target.classList.remove("is-active-view");
          }
        });
      },
      {
        threshold: [0.1, 0.25, 0.6],
        rootMargin: "-6% 0px -10% 0px"
      }
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [containerRef]);
}

