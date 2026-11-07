import React, { useEffect, useState, useRef, useCallback } from "react";
import "./DiscountBanner.css";

const BASE_URL = import.meta.env.BASE_URL || "/";
const getAssetUrl = (path) => `${BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

const SLIDES = [
  {
    id: "fashion-trends",
    benefitIcon: "truck",
    benefitMain: "SPECIAL EDITION",
    benefitSub: "Curated seasonal collection",
    headingLine1: "Trending Fashion",
    headingLine2: "Collections",
    subLine1: "Elevate Your Everyday Style with",
    subLine2: "Premium Wardrobe Picks",
    buttonText: "SHOP NOW →",
    buttonLink: `${BASE_URL}product.html?view=list&category=fashion`,
    imageSrc: getAssetUrl("e-commerce_sitr.webp"),
    imageAlt: "Online shopping scene with cart, laptop, phone and gift boxes - Trending Fashion Collections",
    hasCustomBadge: false, // Image already contains "SALE UP TO 50% OFF" tag
    badgeDiscount: "50%",
  },
  {
    id: "home-living",
    benefitIcon: "truck",
    benefitMain: "FREE DELIVERY",
    benefitSub: "on all orders",
    headingLine1: "Home & Living",
    headingLine2: "Essentials",
    subLine1: "Upgrade Your Space with",
    subLine2: "Top Quality Products",
    buttonText: "SHOP NOW →",
    buttonLink: `${BASE_URL}product.html?view=list&category=home-appliances`,
    imageSrc: getAssetUrl("Bright_Armchair_Living_Room_Sale.webp"),
    imageFallback: getAssetUrl("Bright_Armchair_Living_Room_Sale.png"),
    imageAlt: "Yellow armchair with lamp and plants - Home & Living Essentials",
    hasCustomBadge: false, // Image already contains the dark-green scalloped "UP TO 50% OFF" badge
    badgeDiscount: "50%",
  },
  {
    id: "gadgets-tech",
    benefitIcon: "shield",
    benefitMain: "SECURE PAYMENTS",
    benefitSub: "100% protected checkout",
    headingLine1: "Gadgets & Tech",
    headingLine2: "Savings",
    subLine1: "Smart Gear for",
    subLine2: "Smarter Living",
    buttonText: "SHOP NOW →",
    buttonLink: `${BASE_URL}product.html?view=list&category=electronics`,
    imageSrc: getAssetUrl("Gadget_Deals_on_Green_Podium.webp"),
    imageFallback: getAssetUrl("Gadget_Deals_on_Green_Podium.png"),
    imageAlt: "Smartwatch, laptop, headphones and plant on a green podium - Gadgets & Tech Savings",
    hasCustomBadge: false, // Image already contains the green "UP TO 45% OFF" starburst badge
    badgeDiscount: "45%",
  },
];

function DiscountBanner() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);
  const bannerRef = useRef(null);

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // 5-second auto rotation with pause on hover/touch
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Mobile swipe gestures (touch start/end delta threshold 40px)
  const handleTouchStart = (e) => {
    setIsPaused(true);
    if (e.touches && e.touches[0]) {
      touchStartXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e) => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;
    const endX = e.changedTouches?.[0]?.clientX;
    if (typeof endX === "number") {
      const diff = touchStartXRef.current - endX;
      if (diff > 40) {
        nextSlide();
      } else if (diff < -40) {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextSlide();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveSlide(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveSlide(SLIDES.length - 1);
    }
  };

  const handleShopClick = (e, link) => {
    if (!link) {
      e.preventDefault();
      document.querySelector(".home-products-grid")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="promo-banner-section"
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional Offers"
      tabIndex={0}
      ref={bannerRef}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="promo-banner-card">
        {/* Layered Organic Wave SVG Background */}
        <div className="promo-banner-waves" aria-hidden="true">
          <svg
            className="promo-banner-waves-svg"
            viewBox="0 0 1200 480"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="promoBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5FFE6" />
                <stop offset="45%" stopColor="#E5FDBA" />
                <stop offset="100%" stopColor="#B4F471" />
              </linearGradient>
              <linearGradient id="promoWave1" x1="20%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C9F78F" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#9BEA4F" stopOpacity="0.75" />
              </linearGradient>
              <linearGradient id="promoWave2" x1="10%" y1="20%" x2="90%" y2="100%">
                <stop offset="0%" stopColor="#8BEB40" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#67D828" stopOpacity="0.82" />
              </linearGradient>
              <linearGradient id="promoWave3" x1="30%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#51CB1F" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#1E9C10" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Base gradient background */}
            <rect width="1200" height="480" fill="url(#promoBaseGrad)" />

            {/* Wave 1: broad organic curve */}
            <path
              d="M380,0 C540,50 560,170 660,230 C780,300 940,260 1200,320 L1200,480 L350,480 C440,410 470,300 410,200 C370,130 350,70 380,0 Z"
              fill="url(#promoWave1)"
            />

            {/* Wave 2: sweeping mid curve */}
            <path
              d="M520,480 C580,380 660,310 770,290 C900,260 1040,350 1200,280 L1200,480 Z"
              fill="url(#promoWave2)"
            />

            {/* Wave 3: vibrant deep curve grounded at base */}
            <path
              d="M680,480 C740,430 830,400 930,420 C1030,440 1120,410 1200,380 L1200,480 Z"
              fill="url(#promoWave3)"
            />

            {/* Soft decorative ambient circles */}
            <circle cx="1060" cy="70" r="130" fill="#E2FCAE" opacity="0.45" />
            <circle cx="1140" cy="190" r="85" fill="#8BEA44" opacity="0.25" />
            <circle cx="180" cy="460" r="160" fill="#D2F995" opacity="0.3" />
          </svg>
        </div>

        {/* Carousel Slides */}
        <div className="promo-slides-wrapper">
          {SLIDES.map((slide, index) => {
            const isActive = index === activeSlide;
            return (
              <article
                key={slide.id}
                className={`promo-slide ${isActive ? "active" : ""}`}
                aria-hidden={!isActive}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${SLIDES.length}: ${slide.headingLine1} ${slide.headingLine2}`}
              >
                {/* Left Content */}
                <div className="promo-slide-text">
                  {/* Small Benefit Row - Plain Row with No Pill Border, Dark Green #0B5A12 */}
                  <div className="promo-benefit-row">
                    <div className="promo-benefit-icon">
                      {slide.benefitIcon === "truck" && (
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#0B5A12"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x="1" y="3" width="15" height="13" rx="2" />
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                          <circle cx="5.5" cy="18.5" r="2.5" />
                          <circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                      )}
                      {slide.benefitIcon === "shield" && (
                        <svg
                          width="26"
                          height="26"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#0B5A12"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      )}
                    </div>
                    <div className="promo-benefit-copy">
                      <strong className="promo-benefit-main">{slide.benefitMain}</strong>
                      <span className="promo-benefit-sub">{slide.benefitSub}</span>
                    </div>
                  </div>

                  {/* Main Heading - Balanced on Two Lines */}
                  <h2 className="promo-slide-heading">
                    <span>{slide.headingLine1}</span>
                    <span>{slide.headingLine2}</span>
                  </h2>

                  {/* Subtitle */}
                  <p className="promo-slide-subtitle">
                    {slide.subLine1}
                    <br />
                    {slide.subLine2}
                  </p>

                  {/* CTA Pill Button */}
                  <a
                    href={slide.buttonLink}
                    className="promo-slide-btn"
                    onClick={(e) => handleShopClick(e, slide.buttonLink)}
                  >
                    <span>{slide.buttonText}</span>
                  </a>
                </div>

                {/* Right Visual Image */}
                <div className="promo-slide-visual">
                  {/* Soft floor shadow under cutout */}
                  <div className="promo-floor-shadow" aria-hidden="true" />

                  {/* Separate CSS Starburst Badge (Slide 1 & 3; Slide 2 already has the scalloped badge in the image) */}
                  {slide.hasCustomBadge && (
                    <div className="promo-starburst-badge" aria-hidden="true">
                      <svg viewBox="0 0 120 120" className="promo-starburst-svg">
                        <path
                          d="M60 0 L69 19 L89 10 L92 31 L112 30 L107 50 L120 60 L107 70 L112 90 L92 89 L89 110 L69 101 L60 120 L51 101 L31 110 L28 89 L8 90 L13 70 L0 60 L13 50 L8 30 L28 31 L31 10 L51 19 Z"
                          fill="#075010"
                        />
                      </svg>
                      <div className="promo-starburst-text">
                        <span className="starburst-tag">UP TO</span>
                        <strong className="starburst-val">{slide.badgeDiscount}</strong>
                        <span className="starburst-off">OFF</span>
                      </div>
                    </div>
                  )}

                  <picture>
                    <source srcSet={slide.imageSrc} type="image/webp" />
                    <img
                      src={slide.imageFallback || slide.imageSrc}
                      alt={slide.imageAlt}
                      className="promo-product-image"
                      width="1200"
                      height="950"
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </picture>
                </div>
              </article>
            );
          })}
        </div>

        {/* Progress / Pagination Dots at Bottom-Left */}
        <div
          className="promo-pagination-dots"
          role="tablist"
          aria-label="Slider navigation"
        >
          {SLIDES.map((slide, index) => {
            const isActive = index === activeSlide;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show slide ${index + 1}: ${slide.headingLine1} ${slide.headingLine2}`}
                className={`promo-dot ${isActive ? "active" : ""}`}
                onClick={() => setActiveSlide(index)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default DiscountBanner;
