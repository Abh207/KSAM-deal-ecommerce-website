import React from "react";
import "./heroHead.css";
import { BASE, resolveAsset, useHeroHead } from "./useHeroHead.js";

const LINE_1 = "Big Deals.";
const LINE_2 = "Bigger Savings.";

export function HeroHead({ paused = false }) {
  const {
    heroRef,
    heroContentRef,
    hugeTextRef,
    videoRef,
    ambientVideoRef,
    ambientCanvasRef,
    rotatingWordRef,
    headlineRef,
    heroData,
    countdown,
    videoFailed,
    setVideoFailed,
    isMobile,
    isSaveDataOrReducedMotion
  } = useHeroHead({ paused });

  const posterUrl = resolveAsset("videos/hero/hero_bg_new_poster.webp");
  const videoWebm = resolveAsset("videos/hero/hero_bg_new.webm");
  const videoMp4 = resolveAsset("videos/hero/hero_bg_new.mp4");
  const videoMobileWebm = resolveAsset("videos/hero/hero_bg_new_mobile.webm");
  const videoMobileMp4 = resolveAsset("videos/hero/hero_bg_new_mobile.mp4");

  const scrollToShowcase = (e) => {
    e.preventDefault();
    const target = document.getElementById("showcase");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="kh-root">
      <section className="hero" id="home" ref={heroRef}>
        {/* Layer 0: Page-Level Ambient Elements (Moved inside hero as absolute) */}
        <div className="ambient-glows" aria-hidden="true">
          <div className="ambient-orb orb-green" />
          <div className="ambient-orb orb-blue" />
          <div className="ambient-orb orb-yellow" />
        </div>

        <div className="bg-grid-overlay" aria-hidden="true" />
        <div className="bg-noise" aria-hidden="true" />

        <div className="bg-huge-text-container" aria-hidden="true">
          <div className="bg-huge-text" ref={hugeTextRef}>
            KSAM DEAL • MEGA SAVINGS • FLAGSHIP DROPS • KSAM DEAL
          </div>
        </div>

        {/* Layer 1: Background Video Layer */}
        <div className="hero-bg-layer" aria-hidden="true">
          <div className="hero-floor-glow" />

          {/* Video Container positioned on the right */}
          <div className="hero-video-wrapper">
            {/* Strictly ONE visual element: video OR poster fallback */}
            {!isSaveDataOrReducedMotion && !videoFailed ? (
              <video
                ref={videoRef}
                className="hero-video"
                autoPlay
                muted
                playsInline
                loop
                preload="metadata"
                poster={posterUrl}
                aria-hidden="true"
                onPlaying={() => setVideoFailed(false)}
              >
                <source src={videoMobileWebm} type="video/webm" media="(max-width: 767px)" />
                <source src={videoWebm} type="video/webm" media="(min-width: 768px)" />
                <source src={videoWebm} type="video/webm" />
                <source src={videoMobileMp4} type="video/mp4" media="(max-width: 767px)" />
                <source src={videoMp4} type="video/mp4" media="(min-width: 768px)" />
                <source
                  src={videoMp4}
                  type="video/mp4"
                  onError={(e) => {
                    // Only fail if video really cannot play
                    if (videoRef.current && videoRef.current.readyState === 0) {
                      setVideoFailed(true);
                    }
                  }}
                />
              </video>
            ) : (
              <img
                src={posterUrl}
                alt="KSAM Deal Phone Showcase"
                className="hero-poster-fallback"
                draggable="false"
              />
            )}

            {/* Readability Overlay between video and text */}
            <div className="hero-readability-overlay" />
          </div>

          <div className="hero-overlay hero-overlay-left" />
          <div className="hero-overlay hero-overlay-top" />
          <div className="hero-overlay hero-overlay-bottom" />
        </div>

        {/* Layer 2: Hero Content Block */}
        <div className="hero-content-wrap">
          <div className="hero-content" ref={heroContentRef}>
            <div className="hero-accent-line" aria-hidden="true" />
            <div className="hero-headline-glow" aria-hidden="true" />

            {/* Badge Pill with Countdown */}
            <div className="hero-badge-pill">
              <span className="badge-shimmer-sweep" aria-hidden="true" />
              <span className="pulse-dot" />
              <span className="badge-title">TODAY'S MEGA DEALS</span>
              <span className="badge-divider">•</span>
              <span className="badge-countdown">Ends in {countdown}</span>
            </div>

            {/* Two-line Headline with Char Spans & Underline */}
            <h1 className="hero-title" ref={headlineRef}>
              <span className="title-line title-line-1">
                {LINE_1.split("").map((ch, idx) =>
                  ch === " " ? (
                    " "
                  ) : (
                    <span className="char-wrap" key={`l1-${idx}`}>
                      <span className="char-letter">{ch}</span>
                    </span>
                  )
                )}
              </span>
              <span className="title-line title-line-2 title-line-gradient">
                {LINE_2.split("").map((ch, idx) =>
                  ch === " " ? (
                    " "
                  ) : (
                    <span className="char-wrap" key={`l2-${idx}`}>
                      <span className="char-letter">{ch}</span>
                    </span>
                  )
                )}
              </span>
              <span className="hero-underline-wrapper" aria-hidden="true">
                <svg
                  className="hero-hand-underline"
                  viewBox="0 0 310 14"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="heroUnderlineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22ff88" />
                      <stop offset="50%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#ffd60a" />
                    </linearGradient>
                  </defs>
                  <path
                    id="heroUnderlinePath"
                    d="M 4 8 C 65 3, 140 12, 220 7 C 255 5, 285 9, 306 8"
                    stroke="url(#heroUnderlineGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Rotating Slot-Machine Line */}
            <div className="hero-rotating-line">
              <span className="rotating-prefix">Deals on</span>
              <div className="rotating-slot-box">
                <span className="slot-word" ref={rotatingWordRef}>
                  Titanium Pro
                </span>
              </div>
              <span className="blinking-cursor-bar" aria-hidden="true">
                |
              </span>
            </div>

            {/* Subtitle with Word Spans and Marker Highlights */}
            <p className="hero-subtitle">
              <span className="sub-word">Handpicked</span>{" "}
              <span className="sub-word">flagship</span>{" "}
              <span className="sub-word">electronics</span>{" "}
              <span className="sub-word">&amp;</span>{" "}
              <span className="sub-word">daily</span>{" "}
              <span className="sub-word">essentials</span>{" "}
              <span className="sub-word">at</span>{" "}
              <span className="sub-word">guaranteed</span>{" "}
              <span className="sub-word marker-highlight">lowest prices</span>{" "}
              <span className="sub-word">with</span>{" "}
              <span className="sub-word">fast</span>{" "}
              <span className="sub-word marker-highlight">express delivery</span>.
            </p>

            {/* Button Group */}
            <div className="hero-btn-group">
              <a
                href="#showcase"
                onClick={scrollToShowcase}
                className="btn btn-primary-gradient"
                id="btnShopDeals"
              >
                <span>Shop Deals</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>

              <a
                href={`${import.meta.env.BASE_URL}shop.html`}
                className="btn btn-our-products"
                id="heroOurProductsBtn"
                aria-label="Explore our full product showcase"
              >
                <div className="btn-conic-border" aria-hidden="true" />
                <div className="btn-shine-sweep" aria-hidden="true" />
                <div className="btn-inner-content">
                  <span className="btn-morph-icon" aria-hidden="true">
                    <svg
                      className="icon-grid"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    </svg>
                    <svg
                      className="icon-arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                  <span>Our Products</span>
                  <span className="prod-count-pill">22+</span>
                </div>
              </a>

              <a
                href="#showcase"
                onClick={scrollToShowcase}
                className="btn btn-ghost-glass"
                id="btnViewOffers"
              >
                <span>View Offers</span>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <a
          href="#showcase"
          onClick={scrollToShowcase}
          className="hero-scroll-indicator"
          aria-label="Scroll to explore deals"
        >
          <div className="scroll-line-box">
            <div className="scroll-line-runner" />
          </div>
          <span>SCROLL TO EXPLORE</span>
        </a>
      </section>
    </div>
  );
}

export default HeroHead;
