import React, { useEffect, useRef, useState } from "react";
import "./ProductsHeroVideo.css";

/**
 * ProductsHeroVideo
 * Full-width video hero section for the Products page (shop.html).
 * Displays a glowing teal circuit camera on a dark background.
 * Seamless looping, off-screen pause, tab visibility pause,
 * watermark concealment, and sr-only H1 for SEO/accessibility.
 */
function ProductsHeroVideo() {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isDipping, setIsDipping] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Check Save-Data, slow connection, or reduced-motion preference
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    const isSaveData = connection?.saveData === true;
    const isSlowConnection =
      connection &&
      ["slow-2g", "2g", "3g"].includes(connection.effectiveType);
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isSaveData || isSlowConnection || prefersReducedMotion) {
      // Do not autoplay on data-saver or reduced motion
      video.pause();
      return;
    }

    // Ensure video is muted for reliable autoplay policy
    video.defaultMuted = true;
    video.muted = true;

    const playVideo = () => {
      try {
        const promise = video.play();
        if (promise !== undefined) {
          promise.catch(() => {
            // Silently fall back
          });
        }
      } catch {
        // Silently fall back
      }
    };

    // IntersectionObserver to pause when section is off screen and play when visible
    let isIntersecting = false;
    let observer = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isIntersecting = entry.isIntersecting;
            if (entry.isIntersecting && !document.hidden) {
              playVideo();
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.05 }
      );
      observer.observe(container);
    } else {
      playVideo();
    }

    // Pause when browser tab is hidden and resume when visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else if (isIntersecting) {
        playVideo();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Loop smoothing: brief 0.3s opacity dip near 10s mark to ensure seamless loop
    const handleTimeUpdate = () => {
      if (!video.duration) return;
      const timeLeft = video.duration - video.currentTime;
      if (timeLeft <= 0.35 && timeLeft > 0) {
        setIsDipping(true);
      } else if (video.currentTime < 0.35) {
        setIsDipping(false);
      }
    };
    const handleSeeked = () => {
      setIsDipping(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("seeked", handleSeeked);

    return () => {
      if (observer) observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, []);

  const baseUrl = import.meta.env.BASE_URL.replace(/\/+$/, "");
  const videoSrc = `${baseUrl}/videos/products/products_hero.mp4`;
  const mobileVideoSrc = `${baseUrl}/videos/products/products_hero_mobile.mp4`;
  const posterSrc = `${baseUrl}/videos/products/products_hero-poster.webp`;

  return (
    <section
      ref={containerRef}
      className="products-hero-section"
      aria-label="Products Hero"
    >
      {/* Visually hidden H1 for SEO and screen-reader accessibility */}
      <h1 className="sr-only">Everything you want. One place.</h1>

      <div className="products-hero-video-wrap">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc}
          aria-hidden="true"
          role="presentation"
          className={`products-hero-video ${isDipping ? "loop-dipping" : ""}`}
        >
          <source media="(max-width: 768px)" src={mobileVideoSrc} type="video/mp4" />
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>

      {/* Subtle animated scroll-down cue at bottom center */}
      <button
        type="button"
        className="products-hero-scroll-cue"
        onClick={() => {
          const target = document.querySelector(".category-section");
          if (target) {
            target.scrollIntoView({ behavior: "smooth" });
          }
        }}
        aria-label="Scroll to categories"
      >
        <span className="scroll-cue-text">EXPLORE</span>
        <svg
          className="scroll-cue-chevron"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </section>
  );
}

export default ProductsHeroVideo;
