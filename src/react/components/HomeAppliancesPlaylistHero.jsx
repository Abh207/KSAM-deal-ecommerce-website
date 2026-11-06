import React, { useEffect, useRef, useState, useCallback } from "react";
import { ArrowDown, Compass, Sparkles, Zap, Coffee } from "lucide-react";
import "./HomeAppliancesPlaylistHero.css";

const ICONS = {
  Sparkles,
  Zap,
  Coffee
};

export default function HomeAppliancesPlaylistHero({
  containerRef: externalContainerRef,
  prefersReducedMotion = false
}) {
  const internalContainerRef = useRef(null);
  const heroRef = externalContainerRef || internalContainerRef;

  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isInView, setIsInView] = useState(true);

  const videoRefs = useRef([]);
  const prevIndexRef = useRef(0);

  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;

  const playlist = [
    {
      id: 0,
      videoSrc: `${normalizedBase}videos/home-hero-1.mp4`,
      posterSrc: `${normalizedBase}videos/home-hero-1-poster.webp`,
      fallbackPoster: `${normalizedBase}videos/home-hero-1-poster.jpg`,
      badge: "PREMIUM KITCHEN",
      iconKey: "Sparkles",
      titleLine1: "Brew Perfection",
      titleLine2: "Every Morning",
      subtitle:
        "Experience café-grade espresso and artisan coffee from the comfort of your kitchen. Precision grinding, PID temperature control, and silky microfoam."
    },
    {
      id: 1,
      videoSrc: `${normalizedBase}videos/home-hero-2.mp4`,
      posterSrc: `${normalizedBase}videos/home-hero-2-poster.webp`,
      fallbackPoster: `${normalizedBase}videos/home-hero-2-poster.jpg`,
      badge: "SMART HOME 2026",
      iconKey: "Zap",
      titleLine1: "Upgrade Your",
      titleLine2: "Living Space",
      subtitle:
        "Next-generation appliances engineered for effortless living. Intelligent cooling, AI-powered cleaning, and quiet performance."
    },
    {
      id: 2,
      videoSrc: `${normalizedBase}videos/home-hero-3.mp4`,
      posterSrc: `${normalizedBase}videos/home-hero-3-poster.webp`,
      fallbackPoster: `${normalizedBase}videos/home-hero-3-poster.jpg`,
      badge: "CHEF'S CHOICE",
      iconKey: "Coffee",
      titleLine1: "Sleek Extraction",
      titleLine2: "Rich Indulgence",
      subtitle:
        "Smart single-serve extraction with 19-bar thermo-block precision. Savor velvety micro-crema and barista-level roast aromatics every morning."
    }
  ];

  // Dynamic sticky header measurement for exact full screen calculation
  useEffect(() => {
    const measureNav = () => {
      const nav = document.querySelector(".kh-nav-header") || document.querySelector("#navbar");
      if (nav) {
        const h = nav.getBoundingClientRect().height;
        if (h > 0) {
          document.documentElement.style.setProperty("--header-height", `${Math.round(h)}px`);
        }
      }
    };
    measureNav();
    window.addEventListener("resize", measureNav, { passive: true });
    return () => window.removeEventListener("resize", measureNav);
  }, []);

  // IntersectionObserver to auto-pause video when scrolled out of view
  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [heroRef]);

  // Handle active video playback lifecycle
  useEffect(() => {
    if (prefersReducedMotion) return;

    const activeVideo = videoRefs.current[activeIndex];
    const prevIndex = prevIndexRef.current;
    const prevVideo = prevIndex !== activeIndex ? videoRefs.current[prevIndex] : null;

    if (isInView && !document.hidden) {
      if (activeVideo) {
        // Reset and play active video
        try {
          activeVideo.currentTime = 0;
          activeVideo.play().catch(() => {});
        } catch (_) {}
      }
    } else {
      if (activeVideo) activeVideo.pause();
    }

    // Pause previous video after 650ms (after the 600ms cross-fade completes)
    let pauseTimer = null;
    if (prevVideo && prevIndex !== activeIndex) {
      pauseTimer = setTimeout(() => {
        try {
          prevVideo.pause();
        } catch (_) {}
      }, 650);
    }

    prevIndexRef.current = activeIndex;

    return () => {
      if (pauseTimer) clearTimeout(pauseTimer);
    };
  }, [activeIndex, isInView, prefersReducedMotion]);

  // Visibility change handling
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleVisibility = () => {
      const activeVideo = videoRefs.current[activeIndex];
      if (!activeVideo) return;

      if (document.hidden) {
        activeVideo.pause();
      } else if (isInView) {
        activeVideo.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [activeIndex, isInView, prefersReducedMotion]);

  // Video ended callback -> advance to next
  const handleVideoEnded = useCallback((endedIndex) => {
    if (endedIndex === activeIndex) {
      setActiveIndex((prev) => (prev + 1) % playlist.length);
    }
  }, [activeIndex, playlist.length]);

  // Jump to specific clip
  const jumpToVideo = useCallback((idx) => {
    if (idx === activeIndex) return;
    setActiveIndex(idx);
  }, [activeIndex]);

  // Parallax scroll tracking
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

  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const progress = Math.min(scrollY / (windowHeight * 0.9), 1);
  const translateY = progress * -100;
  const opacity = Math.max(1 - progress * 1.35, 0);
  const scale = Math.max(1 - progress * 0.06, 0.94);

  // Smooth scroll targets
  const scrollToProducts = () => {
    const target =
      document.getElementById("products-grid") ||
      document.getElementById("category-filter-toolbar-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: windowHeight, behavior: "smooth" });
    }
  };

  const scrollToCollection = () => {
    const target =
      document.getElementById("category-tiles-section") ||
      document.getElementById("accessories-collection-section") ||
      document.getElementById("products-grid");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: windowHeight, behavior: "smooth" });
    }
  };

  const currentItem = playlist[activeIndex];
  const BadgeIcon = ICONS[currentItem.badgeIcon] || Sparkles;

  return (
    <div className="home-playlist-hero" ref={heroRef} aria-label="Home Appliances Hero Showcase">
      {/* Video Playlist Stack */}
      <div className="home-hero-video-stack" aria-hidden="true">
        {!prefersReducedMotion ? (
          playlist.map((item, idx) => (
            <video
              key={item.id}
              ref={(el) => (videoRefs.current[idx] = el)}
              className={`home-hero-video ${idx === activeIndex ? "is-active" : ""}`}
              muted
              playsInline
              preload={idx === 0 ? "auto" : "auto"}
              poster={item.posterSrc}
              src={item.videoSrc}
              onEnded={() => handleVideoEnded(idx)}
            />
          ))
        ) : (
          <img
            src={currentItem.posterSrc}
            alt={currentItem.badge}
            className="home-hero-poster-fallback"
            loading="eager"
            decoding="async"
          />
        )}

        {/* Dark Gradient Overlay for optimal readability */}
        <div className="home-hero-dark-overlay" />
        {/* Soft bottom fade to blend with page content */}
        <div className="home-hero-bottom-fade" />
      </div>

      {/* Left-Aligned Parallax Hero Content */}
      <div
        className="home-hero-content-wrap"
        style={{
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
          opacity: opacity
        }}
      >
        <div className="home-hero-content-inner">
          {/* Dynamic Animated Text Block (Fade + Slide-Up) */}
          <div key={`hero-clip-${activeIndex}`} className="home-hero-text-anim">
            {/* Small Badge */}
            <div className="home-hero-badge">
              <BadgeIcon size={14} className="hero-badge-icon" />
              <span>{currentItem.badge}</span>
            </div>

            {/* Main Heading (2 lines, second line highlighted with lime gradient) */}
            <h1 className="home-hero-heading">
              <span className="hero-heading-l1">{currentItem.titleLine1}</span>
              <br className="hero-heading-break" />
              <span className="hero-heading-l2">{currentItem.titleLine2}</span>
            </h1>

            {/* Subtitle */}
            <p className="home-hero-subtitle">{currentItem.subtitle}</p>
          </div>

          {/* TWO Buttons Stay Permanently Visible */}
          <div className="home-hero-actions">
            <button
              type="button"
              className="home-hero-btn-primary"
              onClick={scrollToProducts}
              aria-label="Shop Now"
            >
              <span>Shop Now</span>
              <ArrowDown size={16} />
            </button>

            <button
              type="button"
              className="home-hero-btn-outline"
              onClick={scrollToCollection}
              aria-label="Explore Collection"
            >
              <Compass size={16} />
              <span>Explore Collection</span>
            </button>
          </div>

          {/* Progress Indicators at Bottom-Left */}
          <div className="home-hero-progress-nav" aria-label="Playlist progress navigation">
            {playlist.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`home-hero-progress-dot ${isActive ? "is-active" : ""}`}
                  onClick={() => jumpToVideo(idx)}
                  aria-label={`Jump to video ${idx + 1}: ${item.badge}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className="progress-dot-num">0{idx + 1}</span>
                  <span className="progress-dot-bar">
                    <span className="progress-dot-fill" />
                  </span>
                  <span className="progress-dot-label">{item.badge}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

