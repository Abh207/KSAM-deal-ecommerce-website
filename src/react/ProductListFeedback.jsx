import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Star,
  ArrowLeft,
  ArrowRight,
  Quote,
  CheckCircle2,
  MapPin,
  ShoppingBag
} from "lucide-react";

export const CATEGORY_REVIEWS = {
  "home-appliances": [
    {
      id: "ha-1",
      name: "Aditi Deshmukh",
      initials: "AD",
      bgGradient: "linear-gradient(135deg, #448000, #8cff00)",
      city: "Mumbai",
      product: "Smart True HEPA Air Purifier",
      rating: 5,
      review: "Living near the Western Express Highway in Mumbai, indoor dust was relentless. This AuraClean True HEPA purifier was delivered within 24 hours. The noise level in night mode is barely a whisper (around 22dB), and the PM2.5 indicator dropped from red (145) to crisp green (18) in under 20 minutes! Excellent energy efficiency too."
    },
    {
      id: "ha-2",
      name: "Rohan Kulkarni",
      initials: "RK",
      bgGradient: "linear-gradient(135deg, #3f7800, #8cff00)",
      city: "Pune",
      product: "Compact 15-Bar Espresso Maker",
      rating: 5,
      review: "True 15-bar Italian extraction with thick golden crema every morning! The steam wand creates velvety microfoam for flat whites effortlessly. The brushed stainless-steel finish looks stunning on my kitchen counter, and KSAM Deal delivered it in two days without a scratch."
    },
    {
      id: "ha-3",
      name: "Sneha Nambiar",
      initials: "SN",
      bgGradient: "linear-gradient(135deg, #366800, #8cff00)",
      city: "Bengaluru",
      product: "Laser-Guided Robotic Vacuum",
      rating: 5,
      review: "The LiDAR 360° mapping navigated around my furniture and carpets with zero collisions. The 3000Pa suction easily picks up pet hair and fine dust, and the electronic mopping leaves spotless tile floors. Scheduled cleaning runs while I'm at the office. Incredible time saver!"
    },
    {
      id: "ha-4",
      name: "Vikramaditya Rathore",
      initials: "VR",
      bgGradient: "linear-gradient(135deg, #2b5400, #8cff00)",
      city: "Jaipur",
      product: "Digital Rapid-Air Convection Air Fryer 5.5L",
      rating: 5,
      review: "Crispy samosas, paneer tikka, and french fries with barely a teaspoon of oil. The touch presets make cooking foolproof, and the non-stick basket rinses clean in seconds. Saved over ₹3,000 on the deal price compared to local retail."
    },
    {
      id: "ha-5",
      name: "Ananya Sen",
      initials: "AS",
      bgGradient: "linear-gradient(135deg, #448000, #8cff00)",
      city: "Kolkata",
      product: "Ultra-Light Handheld Cordless Vacuum",
      rating: 4,
      review: "Weighs under 1.5 kg, making ceiling corners and staircase cleaning effortless. The battery easily lasts for 40 minutes on eco mode, which is plenty for my 3BHK flat. LED headlights reveal dust under the sofa that regular brooms miss."
    },
    {
      id: "ha-6",
      name: "Rajesh Iyer",
      initials: "RI",
      bgGradient: "linear-gradient(135deg, #3f7800, #8cff00)",
      city: "Chennai",
      product: "Electric 8-in-1 Smart Multi-Cooker",
      rating: 5,
      review: "Replaced three bulky pots with this one smart multi-cooker. The pressure release valve is completely safe, and biryanis cook to tender perfection in 18 minutes. It consumes significantly less electricity than our induction cooktop."
    },
    {
      id: "ha-7",
      name: "Pooja Sundaram",
      initials: "PS",
      bgGradient: "linear-gradient(135deg, #366800, #8cff00)",
      city: "Hyderabad",
      product: "Smart True HEPA Air Purifier",
      rating: 5,
      review: "My morning dust allergy sneezing has completely stopped since placing this in the bedroom. Build quality feels very premium with touch controls and companion app Wi-Fi sync. Genuine product verified on the manufacturer portal."
    },
    {
      id: "ha-8",
      name: "Kunal Verma",
      initials: "KV",
      bgGradient: "linear-gradient(135deg, #2b5400, #8cff00)",
      city: "Delhi NCR",
      product: "Compact 15-Bar Espresso Maker",
      rating: 4,
      review: "Heats up in under 45 seconds with rock-solid temperature stability. Compact enough for small kitchen setups yet delivers cafe-quality shots. Solid value for money on KSAM Deal."
    }
  ],
  "accessories-lifestyle": [
    {
      id: "al-1",
      name: "Meera Nambisan",
      initials: "MN",
      bgGradient: "linear-gradient(135deg, #448000, #8cff00)",
      city: "Bengaluru",
      product: "Full-Grain Leather Cardholder",
      rating: 5,
      review: "The vegetable-tanned leather has developed a gorgeous rich patina over weeks of daily use. Edge burnishing and hand-stitching are on par with luxury European brands. Holds 6 cards and folded cash without bulging in fitted trousers."
    },
    {
      id: "al-2",
      name: "Arjun Mehta",
      initials: "AM",
      bgGradient: "linear-gradient(135deg, #3f7800, #8cff00)",
      city: "Mumbai",
      product: "Matte Black UV400 Polarized Sunglasses",
      rating: 5,
      review: "Crystal-clear optical clarity during bright coastal drives. The TAC polarized lenses eliminate road and water glare completely. Extremely lightweight TR90 frame that stays comfortable behind the ears without slipping."
    },
    {
      id: "al-3",
      name: "Devansh Roy",
      initials: "DR",
      bgGradient: "linear-gradient(135deg, #366800, #8cff00)",
      city: "Kolkata",
      product: "Heavy-Duty Waxed Canvas Weekender Duffle",
      rating: 5,
      review: "Rugged 16oz waxed canvas with genuine brass hardware. The separate bottom shoe compartment keeps footwear isolated from clean shirts. Used it for three domestic flights so far—sturdy, water-resistant, and fits airline overhead bins with ease."
    },
    {
      id: "al-4",
      name: "Tanvi Bakshi",
      initials: "TB",
      bgGradient: "linear-gradient(135deg, #2b5400, #8cff00)",
      city: "Delhi",
      product: "Double-Wall Vacuum Insulated Tumbler 750ml",
      rating: 5,
      review: "Keeps cold water ice-chilled for over 20 hours in Delhi heat! Powder-coated exterior provides zero condensation grip. The silicone-sealed sip lid has never leaked a single drop in my tote bag. Premium 18/8 stainless steel build."
    },
    {
      id: "al-5",
      name: "Naveen Reddy",
      initials: "NR",
      bgGradient: "linear-gradient(135deg, #448000, #8cff00)",
      city: "Hyderabad",
      product: "3-in-1 Fast Wireless Magnetic Charging Stand",
      rating: 4,
      review: "Cleans up tangled cables from the nightstand completely. Charges my phone, smartwatch, and earbuds concurrently without heating up. Weighted non-slip base ensures stable one-handed phone removal."
    },
    {
      id: "al-6",
      name: "Priya Srinivasan",
      initials: "PS",
      bgGradient: "linear-gradient(135deg, #3f7800, #8cff00)",
      city: "Chennai",
      product: "Vegan Leather Waterproof Dual-Sided Desk Mat",
      rating: 5,
      review: "Spilled morning coffee wiped right off with a tissue paper—no stain, completely waterproof. Precision optical mouse tracking feels super smooth. Lays completely flat right out of the box with zero curling corners."
    },
    {
      id: "al-7",
      name: "Siddharth Joshi",
      initials: "SJ",
      bgGradient: "linear-gradient(135deg, #366800, #8cff00)",
      city: "Pune",
      product: "Full-Grain Leather Cardholder",
      rating: 5,
      review: "Arrived in a sleek gift box with authentic leather certification. The thumb-slide cutout makes withdrawing your primary card effortless at transit gates and cafes. Truly top-tier craftsmanship."
    },
    {
      id: "al-8",
      name: "Rahul Bhatia",
      initials: "RB",
      bgGradient: "linear-gradient(135deg, #2b5400, #8cff00)",
      city: "Chandigarh",
      product: "Matte Black UV400 Polarized Sunglasses",
      rating: 4,
      review: "Solid scratch-resistant coating and spring hinges that flex comfortably. Excellent UV400 eye protection for sunny afternoon walks and highway driving. Great discount deal from KSAM."
    }
  ],
  default: [
    {
      id: "def-1",
      name: "Aditi Deshmukh",
      initials: "AD",
      bgGradient: "linear-gradient(135deg, #448000, #8cff00)",
      city: "Mumbai",
      product: "Smart True HEPA Air Purifier",
      rating: 5,
      review: "Living in central Mumbai, air quality is a major concern. This smart air purifier was delivered within 24 hours. The real-time AQI display and whisper-quiet night mode are fantastic. The flash deal saved me ₹3,500 compared to other marketplaces!"
    },
    {
      id: "def-2",
      name: "Vikramaditya Rathore",
      initials: "VR",
      bgGradient: "linear-gradient(135deg, #3f7800, #8cff00)",
      city: "Jaipur",
      product: "Digital Rapid-Air Convection Air Fryer 5.5L",
      rating: 5,
      review: "Crispy snacks and roasted vegetables with 90% less oil! The digital presets are spot on and cleaning the non-stick basket takes under a minute. Delivered safely in reinforced packaging. Absolute value for money on KSAM Deal."
    },
    {
      id: "def-3",
      name: "Pooja Sundaram",
      initials: "PS",
      bgGradient: "linear-gradient(135deg, #366800, #8cff00)",
      city: "Chennai",
      product: "Hydrating Facial Glow Serum 50ml",
      rating: 5,
      review: "100% genuine skincare delivered in pristine condition. The lightweight texture absorbs instantly and gave my skin a fresh, healthy glow in less than a week. Getting verified products with authentic batch codes at real discounts keeps me ordering."
    },
    {
      id: "def-4",
      name: "Kunal Sen",
      initials: "KS",
      bgGradient: "linear-gradient(135deg, #2b5400, #8cff00)",
      city: "Kolkata",
      product: "Wireless Noise-Cancelling Headphones",
      rating: 4,
      review: "Top-notch active noise cancellation for Kolkata metro commutes. Deep rich bass and very clear voice calling. Battery easily lasted 38 hours on a single charge. Super quick checkout and timely order tracking updates."
    },
    {
      id: "def-5",
      name: "Meera Nambisan",
      initials: "MN",
      bgGradient: "linear-gradient(135deg, #448000, #8cff00)",
      city: "Bengaluru",
      product: "Handcrafted Full-Grain Leather Cardholder",
      rating: 5,
      review: "The leather grain and edge burnishing feel like a luxury boutique piece. Snug card slots with RFID blocking that fit smoothly in any pocket. Ordered on Monday morning and received it Tuesday evening!"
    },
    {
      id: "def-6",
      name: "Harshvardhan Joshi",
      initials: "HJ",
      bgGradient: "linear-gradient(135deg, #3f7800, #8cff00)",
      city: "Pune",
      product: "Ergonomic Lumbar Support Office Chair",
      rating: 5,
      review: "As a software developer sitting 10+ hours a day, the adjustable lumbar contour and breathable mesh back have eliminated my lower back soreness completely. Easy 15-minute assembly with all tools provided. Best investment for my home setup."
    },
    {
      id: "def-7",
      name: "Tanvi Bakshi",
      initials: "TB",
      bgGradient: "linear-gradient(135deg, #366800, #8cff00)",
      city: "Delhi",
      product: "Classic Automatic Skeleton Watch",
      rating: 5,
      review: "Master horology craftsmanship on the open-heart dial and sweeping movement. The scratch-resistant sapphire glass looks immaculate in all lighting. Arrived with an official manufacturer warranty card and presentation case."
    },
    {
      id: "def-8",
      name: "Naveen Reddy",
      initials: "NR",
      bgGradient: "linear-gradient(135deg, #2b5400, #8cff00)",
      city: "Hyderabad",
      product: "3-in-1 Magnetic Fast Wireless Charging Stand",
      rating: 4,
      review: "Cleaned up all cluttered wires on my work desk. Charges phone, smartwatch, and earbuds concurrently with zero overheating issues. Solid weighted metal base that doesn't tip over. Truly pocket-friendly prices!"
    }
  ]
};

export default function ProductListFeedback({ categorySlug = "default" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const sectionRef = useRef(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const isDragging = useRef(false);

  const reviewsList = CATEGORY_REVIEWS[categorySlug] || CATEGORY_REVIEWS.default;
  const total = reviewsList.length;

  // Reset activeIndex when category changes
  useEffect(() => {
    setActiveIndex(0);
  }, [categorySlug]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const onChange = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // IntersectionObserver to pause off-screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Visibility change
  useEffect(() => {
    const handleVis = () => setTabVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", handleVis);
    return () => document.removeEventListener("visibilitychange", handleVis);
  }, []);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay (7 seconds)
  useEffect(() => {
    if (isPaused || !inView || !tabVisible || prefersReducedMotion || total <= 1) {
      return;
    }
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [isPaused, inView, tabVisible, prefersReducedMotion, next, total]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  };

  // Touch swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    isDragging.current = true;
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (touchDeltaX.current < -40) {
      next();
    } else if (touchDeltaX.current > 40) {
      prev();
    }
    setTimeout(() => setIsPaused(false), 2000);
  };

  const current = reviewsList[activeIndex] || reviewsList[0];

  return (
    <section
      ref={sectionRef}
      className="product-feedback-section"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="What Our Customers Say"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="product-feedback-container">
        {/* Section Header */}
        <header className="product-feedback-header-centered">
          <div className="product-feedback-badge">
            <span className="product-feedback-badge-star" aria-hidden="true">★</span>
            <span>VERIFIED CUSTOMER LOVE</span>
          </div>

          <h2 className="product-feedback-title">
            What Our <span className="product-feedback-gradient-text">Customers Say</span>
          </h2>

          <p className="product-feedback-subtitle">
            Real experiences from shoppers across India.
          </p>
        </header>

        {/* Carousel Wrapper With Side Arrows */}
        <div
          className="product-feedback-carousel-wrap"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Circular Left Arrow */}
          <button
            type="button"
            className="product-feedback-arrow-btn prev"
            onClick={prev}
            aria-label="Previous customer review"
          >
            <ArrowLeft size={22} />
          </button>

          {/* Wide Light Glass Card */}
          <div className="product-feedback-card-stage">
            <article
              key={current.id}
              className="product-feedback-card"
              aria-live="polite"
            >
              {/* Top User Bar */}
              <div className="product-feedback-top-bar">
                <div className="product-feedback-user-group">
                  <div
                    className="product-feedback-avatar"
                    style={{ background: current.bgGradient }}
                    aria-hidden="true"
                  >
                    {current.initials}
                  </div>

                  <div className="product-feedback-user-info">
                    <h3 className="product-feedback-user-name">{current.name}</h3>
                    <div className="product-feedback-meta-line">
                      <span className="city-tag">
                        <MapPin size={12} style={{ display: "inline", marginRight: 2 }} />
                        {current.city}
                      </span>
                      <span className="dot-sep" aria-hidden="true">•</span>
                      <span className="product-feedback-verified-badge">
                        <CheckCircle2 size={13} style={{ display: "inline", marginRight: 2 }} />
                        Verified Buyer
                      </span>
                    </div>
                  </div>
                </div>

                <div className="product-feedback-quote-row">
                  <div className="product-feedback-stars-row" aria-label={`${current.rating} out of 5 stars`}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        fill={i < current.rating ? "#eab308" : "#cbd5e1"}
                        stroke={i < current.rating ? "#eab308" : "#cbd5e1"}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <Quote size={32} className="product-feedback-quote-icon" aria-hidden="true" />
                </div>
              </div>

              {/* Purchased Product Chip */}
              <div className="product-feedback-product-chip">
                <ShoppingBag size={13} className="product-feedback-chip-icon" />
                <span>Purchased: {current.product}</span>
              </div>

              {/* Review Text */}
              <p className="product-feedback-text">
                "{current.review}"
              </p>
            </article>
          </div>

          {/* Circular Right Arrow */}
          <button
            type="button"
            className="product-feedback-arrow-btn next"
            onClick={next}
            aria-label="Next customer review"
          >
            <ArrowRight size={22} />
          </button>
        </div>

        {/* Pill Indicator Dots */}
        <div className="product-feedback-dots" role="tablist" aria-label="Review indicators">
          {reviewsList.map((rev, idx) => (
            <button
              key={rev.id}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              className={`product-feedback-dot ${idx === activeIndex ? "is-active" : ""}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to review by ${rev.name}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
