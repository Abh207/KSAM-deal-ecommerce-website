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
import "./clothesFeedback.css";

const CLOTHING_REVIEWS = [
  {
    id: "c-rev-1",
    name: "Rahul Verma",
    initials: "RV",
    bgGradient: "linear-gradient(135deg, #366800, #8cff00)",
    city: "Delhi",
    product: "Classic Oversized T-Shirt",
    rating: 5,
    review: "The oversized drop-shoulder drape is spot-on. 100% breathable organic cotton that holds its structure and color even after four machine washes. Unbeatable quality for an everyday streetwear staple."
  },
  {
    id: "c-rev-2",
    name: "Ananya Sen",
    initials: "AS",
    bgGradient: "linear-gradient(135deg, #2b5400, #8cff00)",
    city: "Kolkata",
    product: "Premium Denim Frock",
    rating: 5,
    review: "Fabric weight is just right—substantial denim that doesn't feel stiff or heavy. The silhouette is super flattering, stitching is neat throughout, and it arrived in Delhi within two days."
  },
  {
    id: "c-rev-3",
    name: "Kabir Mehta",
    initials: "KM",
    bgGradient: "linear-gradient(135deg, #448000, #8cff00)",
    city: "Mumbai",
    product: "Urban Bomber Jacket",
    rating: 5,
    review: "The ribbed cuffs and dual-zipper hardware feel premium and heavy-duty. Kept me comfortably warm during Mumbai's breezy evenings. True to size with enough room for a hoodie underneath."
  },
  {
    id: "c-rev-4",
    name: "Rohan Sharma",
    initials: "RS",
    bgGradient: "linear-gradient(135deg, #3f7800, #8cff00)",
    city: "Bengaluru",
    product: "Slim Fit Chino Trousers",
    rating: 4,
    review: "Clean tailored taper through the calves with a comfortable hint of stretch at the waist. Perfect for 9-to-5 office wear and evening dinners. Incredible value compared to mall brands."
  },
  {
    id: "c-rev-5",
    name: "Priya Patel",
    initials: "PP",
    bgGradient: "linear-gradient(135deg, #366800, #8cff00)",
    city: "Ahmedabad",
    product: "Floral Wrap Maxi Dress",
    rating: 5,
    review: "The floral print looks even more radiant in person than in the photos. Breathable rayon blend that flows gracefully without clinging. Sizing chart was 100% accurate."
  },
  {
    id: "c-rev-6",
    name: "Siddharth Rao",
    initials: "SR",
    bgGradient: "linear-gradient(135deg, #2b5400, #8cff00)",
    city: "Hyderabad",
    product: "Linen Blend Casual Shirt",
    rating: 5,
    review: "Living in Hyderabad heat makes pure synthetic shirts unwearable. This linen-cotton blend is a game changer—airy, sweat-resistant, and the mandarin collar stays crisp all day."
  },
  {
    id: "c-rev-7",
    name: "Divya Nambiar",
    initials: "DN",
    bgGradient: "linear-gradient(135deg, #3f7800, #8cff00)",
    city: "Kochi",
    product: "Relaxed Fit Cargo Joggers",
    rating: 4,
    review: "Deep utility pockets with sturdy snap closures that actually hold an iPhone safely. The elastic waistband with drawcord gives a custom relaxed fit for airport travel."
  },
  {
    id: "c-rev-8",
    name: "Arjun Kapoor",
    initials: "AK",
    bgGradient: "linear-gradient(135deg, #448000, #8cff00)",
    city: "Chandigarh",
    product: "Structured Wool Blend Overcoat",
    rating: 5,
    review: "Exquisite lapel tailoring and silky inner lining. Gave a sharp, commanding look at my cousin's winter wedding. Arrived neatly packed in a garment bag with zero creases."
  }
];

export default function ClothesFeedback() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  const sectionRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const total = CLOTHING_REVIEWS.length;

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    return (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e) => setPrefersReducedMotion(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
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

  // Auto-slide every 7s with pause on hover/touch/focus/offscreen
  useEffect(() => {
    if (isPaused || !inView || !tabVisible || prefersReducedMotion) return;
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [isPaused, inView, tabVisible, prefersReducedMotion, next]);

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
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - endX;
    const diffY = touchStartY.current - endY;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) next();
      else prev();
    }
    setTimeout(() => setIsPaused(false), 3000);
  };

  const activeReview = CLOTHING_REVIEWS[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="clothes-feedback-section"
      id="clothes-feedback"
      aria-label="Customer Reviews and Testimonials"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="clothes-feedback-container">
        {/* Header matching Image 8 with neon-green highlight */}
        <div className="clothes-feedback-header-centered">
          <div className="clothes-feedback-badge">
            <Star size={13} className="clothes-feedback-badge-star" fill="currentColor" />
            <span>CUSTOMER EXPERIENCES</span>
          </div>

          <h2 className="clothes-feedback-title">
            What Our <span className="clothes-lime-gradient-text">Customers Say</span>
          </h2>

          <p className="clothes-feedback-subtitle">
            Real experiences from fashion lovers across India.
          </p>
        </div>

        {/* Carousel Wrap with Side Arrows */}
        <div
          className="clothes-feedback-carousel-wrap"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Previous Arrow */}
          <button
            type="button"
            className="clothes-feedback-arrow-btn prev"
            onClick={prev}
            aria-label="Previous customer review"
          >
            <ArrowLeft size={20} strokeWidth={2.4} />
          </button>

          {/* Review Card */}
          <div className="clothes-feedback-card-stage">
            <article
              key={activeReview.id}
              className="clothes-feedback-card"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="clothes-feedback-top-bar">
                <div className="clothes-feedback-user-group">
                  <div
                    className="clothes-feedback-avatar"
                    style={{ background: activeReview.bgGradient }}
                    aria-hidden="true"
                  >
                    {activeReview.initials}
                  </div>
                  <div className="clothes-feedback-user-info">
                    <h3 className="clothes-feedback-user-name">{activeReview.name}</h3>
                    <div className="clothes-feedback-meta-line">
                      <span className="city-tag flex items-center gap-1">
                        <MapPin size={12} />
                        {activeReview.city}
                      </span>
                      <span className="dot-sep" aria-hidden="true">·</span>
                      <span className="clothes-feedback-verified-badge">
                        <CheckCircle2 size={13} />
                        Verified Buyer
                      </span>
                    </div>
                  </div>
                </div>

                <div className="clothes-feedback-quote-row">
                  <div
                    className="clothes-feedback-stars-row"
                    aria-label={`${activeReview.rating} out of 5 stars`}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        fill={i < activeReview.rating ? "#eab308" : "none"}
                        stroke="#eab308"
                        strokeWidth={1.8}
                      />
                    ))}
                  </div>
                  <Quote size={32} className="clothes-feedback-quote-icon" aria-hidden="true" />
                </div>
              </div>

              {/* Purchased Product Chip */}
              <div className="clothes-feedback-product-chip">
                <ShoppingBag size={13} className="clothes-feedback-chip-icon" />
                <span>Purchased: {activeReview.product}</span>
              </div>

              {/* Review Text */}
              <p className="clothes-feedback-text">
                "{activeReview.review}"
              </p>
            </article>
          </div>

          {/* Next Arrow */}
          <button
            type="button"
            className="clothes-feedback-arrow-btn next"
            onClick={next}
            aria-label="Next customer review"
          >
            <ArrowRight size={20} strokeWidth={2.4} />
          </button>
        </div>

        {/* Pill Indicator Dots */}
        <div
          className="clothes-feedback-dots"
          role="tablist"
          aria-label="Review pagination"
        >
          {CLOTHING_REVIEWS.map((rev, idx) => (
            <button
              key={rev.id}
              type="button"
              role="tab"
              aria-selected={activeIndex === idx}
              aria-label={`Go to review ${idx + 1}`}
              className={`clothes-feedback-dot ${activeIndex === idx ? "is-active" : ""}`}
              onClick={() => setActiveIndex(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

