import React, { useEffect, useState, useRef, useMemo } from "react";
import { ArrowRight, Flame } from "lucide-react";
import { resolveImagePath } from "../../lib/cartHelper.js";
import "./flashSaleBanner.css";

const DURATION_MS = 48 * 60 * 60 * 1000; // 48 hours

// Category-specific headline & subtitle drop configuration
export const CATEGORY_DROP_CONFIG = {
  audio: {
    title: "WEEKEND SOUND DROP",
    subtitle: "Premium acoustics. Studio-grade drivers. Strictly limited allocation.",
  },
  "home-appliances": {
    title: "HOME UPGRADE DROP",
    subtitle: "Next-gen smart appliances for modern living. Limited units at flash prices.",
  },
  "accessories-lifestyle": {
    title: "STYLE LIFT DROP",
    subtitle: "Handcrafted leather & everyday essentials. While stocks last.",
  },
  clothing: {
    title: "TRENDSETTER APPAREL DROP",
    subtitle: "Curated seasonal fashion drops at unprecedented discount rates.",
  },
  cloths: {
    title: "TRENDSETTER APPAREL DROP",
    subtitle: "Curated seasonal fashion drops at unprecedented discount rates.",
  },
  watches: {
    title: "HOROLOGY PRECISION DROP",
    subtitle: "Luxury automatics & smart chronographs. Strictly limited allocation.",
  },
  shoes: {
    title: "STREETWEAR SNEAKER DROP",
    subtitle: "Performance comfort meets head-turning urban silhouettes.",
  },
  footwear: {
    title: "STREETWEAR SNEAKER DROP",
    subtitle: "Performance comfort meets head-turning urban silhouettes.",
  },
  beauty: {
    title: "GLOW & GLAMOUR DROP",
    subtitle: "Dermatologist-approved luxury skincare and radiant beauty essentials.",
  },
  chairs: {
    title: "ERGONOMIC COMFORT DROP",
    subtitle: "Masterfully designed executive and lounge seating solutions.",
  },
  electronics: {
    title: "CUTTING-EDGE TECH DROP",
    subtitle: "Flagship processors, stunning displays, and essential everyday gear.",
  },
  gadgets: {
    title: "CUTTING-EDGE TECH DROP",
    subtitle: "Flagship processors, stunning displays, and essential everyday gear.",
  },
  speakers: {
    title: "WEEKEND SOUND DROP",
    subtitle: "Premium acoustics. Studio-grade drivers. Strictly limited allocation.",
  },
  fashion: {
    title: "FASHION RUNWAY DROP",
    subtitle: "Haute couture & daily statements crafted for standout style.",
  }
};

function getOrInitDeadline(categorySlug) {
  const key = `ksam_flash_deadline_${categorySlug || "global"}_v3`;
  try {
    const stored = localStorage.getItem(key);
    const now = Date.now();
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed > now) {
        return parsed;
      }
    }
    const next = now + DURATION_MS;
    localStorage.setItem(key, String(next));
    return next;
  } catch {
    return Date.now() + DURATION_MS;
  }
}

// Stable pseudo-random calculation based on category slug hash
function getStableStats(categorySlug, productsCount = 6) {
  const str = String(categorySlug || "default");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  const claimedPct = 72 + (positiveHash % 19); // 72% to 90%
  const unitsLeft = 6 + (positiveHash % 17); // 6 to 22 units
  return { claimedPct, unitsLeft };
}

export default function FlashSaleBanner({
  categorySlug = "audio",
  categoryLabel = "Audio",
  products = [],
  currentOffer = null,
  onShopOffer = null,
  scrollToProducts = null,
  customTitle = null,
  customSubtitle = null
}) {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: "47",
    minutes: "59",
    seconds: "59",
    progress: 10
  });

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // IntersectionObserver for reveal animation
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Rolling 48-Hour countdown timer
  useEffect(() => {
    let deadline = getOrInitDeadline(categorySlug);

    const calculateTime = () => {
      const now = Date.now();
      let diff = deadline - now;

      if (diff <= 0) {
        deadline = now + DURATION_MS;
        try {
          const key = `ksam_flash_deadline_${categorySlug || "global"}_v3`;
          localStorage.setItem(key, String(deadline));
        } catch {}
        diff = DURATION_MS;
      }

      const totalSec = Math.floor(diff / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      const elapsed = DURATION_MS - diff;
      const progress = Math.max(0, Math.min(100, (elapsed / DURATION_MS) * 100));

      setTimeLeft({
        days,
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
        progress
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [categorySlug]);

  // Desktop Mouse Parallax
  const handleMouseMove = (e) => {
    if (prefersReducedMotion) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    card.style.setProperty("--parallax-x", `${(x * 20).toFixed(2)}px`);
    card.style.setProperty("--parallax-y", `${(y * 20).toFixed(2)}px`);
    card.style.setProperty("--tilt-x", `${(-y * 4).toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${(x * 4).toFixed(2)}deg`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--parallax-x", "0px");
    card.style.setProperty("--parallax-y", "0px");
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  };

  // Derive title & subtitle from config or fallback
  const config = CATEGORY_DROP_CONFIG[categorySlug] || {};
  const bannerTitle =
    customTitle ||
    currentOffer?.title ||
    config.title ||
    `${String(categoryLabel || categorySlug).toUpperCase()} MEGA DROP`;

  const bannerSubtitle =
    customSubtitle ||
    currentOffer?.subtitle ||
    config.subtitle ||
    "Handpicked top-discounted finds. Limited allocation at exclusive flash prices.";

  // Compute max discount for the starburst badge
  const maxDiscount = useMemo(() => {
    if (currentOffer?.discount) return currentOffer.discount;
    if (!products || !products.length) return 60;
    const discounts = products.map((p) => {
      if (p.discount) return Number(p.discount);
      const pr = Number(p.price) || 0;
      const old = Number(p.oldPrice || p.originalPrice || p.Actualprice || p.actualPrice || 0);
      return old > pr && old > 0 ? Math.round(((old - pr) / old) * 100) : 0;
    });
    const max = Math.max(0, ...discounts);
    return max > 0 ? max : 60;
  }, [products, currentOffer]);

  // Stable claimed stats
  const { claimedPct, unitsLeft } = useMemo(
    () => getStableStats(categorySlug, products.length),
    [categorySlug, products.length]
  );

  // Top 3 discounted products for floating showcase
  const floatingProducts = useMemo(() => {
    if (!products || !products.length) return [];
    // Sort by highest discount
    const sorted = [...products].sort((a, b) => {
      const da = Number(a.discount) || 0;
      const db = Number(b.discount) || 0;
      return db - da;
    });
    // Filter items with valid images
    const valid = sorted.filter((p) => Boolean(p.image || p.image_url));
    return valid.slice(0, 3);
  }, [products]);

  const handleCtaClick = (e) => {
    e.preventDefault();
    if (typeof onShopOffer === "function") {
      onShopOffer();
    } else if (typeof scrollToProducts === "function") {
      scrollToProducts();
    } else {
      const grid = document.querySelector(".product-list-grid") || document.querySelector("#products-grid");
      if (grid) {
        grid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`audio-offer-section flash-sale-banner-section ${inView ? "is-in-view" : ""}`}
      id="flash-sale-offer-section"
      aria-label={`${bannerTitle} Flash Sale Offer`}
    >
      {/* Ambient neon radial glow */}
      <div className="audio-offer-ambient-glow" aria-hidden="true" />

      <div
        ref={cardRef}
        className="audio-offer-glass-card flash-sale-glass-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Moving clock-hand conic sweep background */}
        <div className="flash-sale-sweep-clock-hand" aria-hidden="true" />

        {/* Shimmer sweep line */}
        <div className="audio-offer-shimmer" aria-hidden="true" />

        {/* Rotating neon lime border */}
        <div className="audio-offer-border-glow" aria-hidden="true" />

        {/* Starburst N% OFF badge */}
        <div
          className="audio-discount-starburst"
          aria-label={`${maxDiscount}% OFF Limited Discount`}
        >
          <svg
            className="audio-starburst-svg"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 2 L62 16 L80 10 L84 29 L100 33 L93 51 L100 66 L84 76 L83 95 L65 93 L53 100 L38 92 L24 99 L18 82 L2 80 L8 62 L0 49 L12 37 L7 20 L24 21 L31 4 Z"
              fill="url(#flashSaleNeonGrad)"
            />
            <defs>
              <linearGradient
                id="flashSaleNeonGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#8cff00" />
                <stop offset="100%" stopColor="#448000" />
              </linearGradient>
            </defs>
          </svg>
          <div className="audio-starburst-content">
            <strong>{maxDiscount}%</strong>
            <span>OFF</span>
          </div>
        </div>

        <div className="audio-offer-grid-layout">
          {/* LEFT COLUMN: Text, Countdown, Progress, CTA */}
          <div className="audio-offer-content-col">
            {/* Pill with pulsing live dot */}
            <div className="audio-offer-pill-row">
              <span className="audio-live-pill">
                <span className="audio-live-dot" />
                LIMITED TIME DROP
              </span>
              <span className="audio-live-chip">
                <Flame size={13} className="audio-flame-icon" />
                Selling Fast
              </span>
            </div>

            {/* Title */}
            <h2 className="audio-offer-main-title">{bannerTitle}</h2>

            {/* Subtitle */}
            <p className="audio-offer-subtitle">{bannerSubtitle}</p>

            {/* Modern Glass Countdown */}
            <div
              className="audio-countdown-container"
              role="timer"
              aria-label={`Time remaining: ${
                timeLeft.days > 0 ? `${timeLeft.days} days ` : ""
              }${timeLeft.hours} hours ${timeLeft.minutes} minutes ${
                timeLeft.seconds
              } seconds`}
            >
              {timeLeft.days > 0 && (
                <>
                  <div className="audio-glass-tile">
                    <div className="audio-digit-flipper">
                      <span className="audio-digit-value">{timeLeft.days}</span>
                    </div>
                    <span className="audio-tile-label">DAYS</span>
                  </div>
                  <span className="audio-timer-colon">:</span>
                </>
              )}

              <div className="audio-glass-tile">
                <div className="audio-digit-flipper">
                  <span className="audio-digit-value">{timeLeft.hours}</span>
                </div>
                <span className="audio-tile-label">HOURS</span>
              </div>

              <span className="audio-timer-colon">:</span>

              <div className="audio-glass-tile">
                <div className="audio-digit-flipper">
                  <span className="audio-digit-value">{timeLeft.minutes}</span>
                </div>
                <span className="audio-tile-label">MIN</span>
              </div>

              <span className="audio-timer-colon">:</span>

              <div className="audio-glass-tile is-seconds-glow">
                <div className="audio-digit-flipper">
                  <span className="audio-digit-value is-neon-sec">
                    {timeLeft.seconds}
                  </span>
                </div>
                <span className="audio-tile-label">SEC</span>
              </div>
            </div>

            {/* Thin cycle progress bar */}
            <div
              className="audio-countdown-cycle-bar"
              role="progressbar"
              aria-valuenow={Math.round(timeLeft.progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="audio-cycle-fill"
                style={{ width: `${timeLeft.progress}%` }}
              />
            </div>

            {/* Sold Claimed Progress */}
            <div className="audio-claimed-container">
              <div className="audio-claimed-header">
                <span>
                  Sold: <strong>{claimedPct}% claimed</strong>
                </span>
                <span className="audio-claimed-hurry">
                  Only {unitsLeft} units left at this price
                </span>
              </div>
              <div className="audio-claimed-track">
                <div
                  className="audio-claimed-fill"
                  style={{ width: `${claimedPct}%` }}
                />
              </div>
            </div>

            {/* Neon CTA Button */}
            <div className="audio-offer-cta-wrap">
              <button
                type="button"
                className="audio-flash-cta-btn"
                onClick={handleCtaClick}
                aria-label="Shop this offer and scroll to products"
              >
                <span>Shop this offer</span>
                <ArrowRight size={20} className="audio-cta-arrow" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Layered Floating Products with Parallax */}
          <div className="audio-offer-visuals-col">
            <div className="audio-floating-stage">
              {floatingProducts.map((prod, idx) => (
                <div
                  key={prod.uid || prod.id || idx}
                  className={`audio-floating-card float-pos-${idx + 1}`}
                  onClick={handleCtaClick}
                  title={`View ${prod.name || prod.title}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCtaClick(e);
                  }}
                >
                  <div className="audio-float-img-box">
                    <img
                      src={resolveImagePath(prod.image || prod.image_url)}
                      alt={prod.name || prod.title || "Product"}
                      loading="lazy"
                      decoding="async"
                      width="160"
                      height="160"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="audio-float-badge-chip">
                    <span className="audio-chip-title">
                      {prod.name || prod.title}
                    </span>
                    <span className="audio-chip-price">
                      ₹{Number(prod.price).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

