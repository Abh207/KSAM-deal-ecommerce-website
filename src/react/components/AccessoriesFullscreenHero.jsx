import React, { useEffect, useState, useRef } from "react";
import { ArrowDown, Sparkles, Compass } from "lucide-react";
import "./AccessoriesFullscreenHero.css";

export default function AccessoriesFullscreenHero() {
  const [scrollY, setScrollY] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const heroRef = useRef(null);

  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const primaryVideo = `${normalizedBase}videos/video1.mp4`;
  const fallbackVideo = `${normalizedBase}videos/hero/hero_bg_new.mp4`;
  const posterImg = `${normalizedBase}videos/hero/hero_bg_new-poster.webp`;

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Parallax calculations
  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const progress = Math.min(scrollY / (windowHeight * 0.9), 1);
  const translateY = progress * -120; // translates upward
  const opacity = Math.max(1 - progress * 1.35, 0); // fades out
  const scale = Math.max(1 - progress * 0.1, 0.9); // scales down slightly

  const scrollToContent = () => {
    const target = document.getElementById("accessories-collection-section") || document.getElementById("products-grid");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: windowHeight, behavior: "smooth" });
    }
  };

  return (
    <div className="accessories-fullscreen-hero" ref={heroRef}>
      {/* Background Video */}
      <div className="accessories-hero-video-wrap" aria-hidden="true">
        <video
          className="accessories-hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={posterImg}
          src={videoError ? fallbackVideo : primaryVideo}
          onError={() => {
            if (!videoError) setVideoError(true);
          }}
        />
        {/* Dark Gradient Overlay for optimal readability */}
        <div className="accessories-hero-dark-overlay" />
        <div className="accessories-hero-vignette" />
      </div>

      {/* Parallax Content Container */}
      <div
        className="accessories-hero-content"
        style={{
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
          opacity: opacity
        }}
      >
        {/* Small Badge */}
        <div className="accessories-hero-badge">
          <Sparkles size={14} className="hero-badge-sparkle" />
          <span>TRENDING COLLECTION 2026</span>
        </div>

        {/* Big Heading */}
        <h1 className="accessories-hero-heading">
          Elevate Your <span className="hero-highlight">Everyday Style</span>
        </h1>

        {/* Short Subtitle */}
        <p className="accessories-hero-subtitle">
          Curated lifestyle essentials, artisan leather goods, and modern EDC accessories
          crafted for timeless utility and distinct character.
        </p>

        {/* Action Buttons */}
        <div className="accessories-hero-actions">
          <button
            type="button"
            className="accessories-btn-primary"
            onClick={scrollToContent}
            aria-label="Shop Accessories Now"
          >
            <span>Shop Now</span>
            <ArrowDown size={16} />
          </button>

          <button
            type="button"
            className="accessories-btn-outline"
            onClick={scrollToContent}
            aria-label="Explore Collection"
          >
            <Compass size={16} />
            <span>Explore Collection</span>
          </button>
        </div>
      </div>

      {/* Floating Scroll Indicator */}
      <div className="accessories-hero-scroll-indicator" onClick={scrollToContent} aria-label="Scroll down">
        <span className="scroll-indicator-mouse">
          <span className="scroll-indicator-wheel" />
        </span>
        <span className="scroll-indicator-text">SCROLL TO DISCOVER</span>
      </div>
    </div>
  );
}

