import React, { useEffect, useRef } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import gsap from "gsap";
import { respectReducedMotion, initHeroExitDrift } from "../lib/motion.js";

/**
 * Unified LegalHero component for Privacy Policy, Terms & Conditions, and Affiliate Disclosure.
 * Features:
 * - Meta row with animated back button and solid pills (fill rgba(255,255,255,.10), text #F4F7F5)
 * - Hero panel with 32px radius, solid base #0F1519, no border
 * - 3 large blurred radial gradients drifting slowly (transforms only) + 3 small floating orbs
 * - Solid 60% scrim ensuring text background is never lighter than #1A2328
 * - 96px gradient icon tile with soft glow and gentle float
 * - Solid tinted eyebrow pill
 * - Two-line heading with slow shimmer on key phrase
 * - Description in #E3EAE6 at 18px / 1.7 (max 62ch)
 * - Orchestrated GSAP entrance with 1.2s safety fallback
 */
export default function LegalHero({
  tone = "privacy", // "privacy", "terms", "affiliate"
  icon: Icon,
  eyebrow,
  headingLine1,
  headingKeyPhrase,
  description,
  readTime,
  effectiveDate = "[EFFECTIVE DATE]",
  backUrl = "#"
}) {
  const heroRef = useRef(null);
  const heroContentRef = useRef(null);
  const iconRef = useRef(null);
  const eyebrowRef = useRef(null);
  const titleLine1Ref = useRef(null);
  const titleLine2Ref = useRef(null);
  const descRef = useRef(null);

  useEffect(() => {
    // Safety fallback: ensure all text and hero elements are at 100% opacity after 1.2s
    const safetyTimer = setTimeout(() => {
      [iconRef, eyebrowRef, titleLine1Ref, titleLine2Ref, descRef].forEach((r) => {
        if (r.current) {
          r.current.style.opacity = "1";
          r.current.style.transform = "none";
        }
      });
    }, 1200);

    if (heroRef.current && heroContentRef.current) {
      initHeroExitDrift(heroRef.current, heroContentRef.current);
    }

    if (respectReducedMotion()) {
      return () => clearTimeout(safetyTimer);
    }

    // Orchestrated GSAP Entrance
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          [iconRef, eyebrowRef, titleLine1Ref, titleLine2Ref, descRef].forEach((r) => {
            if (r.current) {
              gsap.set(r.current, { clearProps: "willChange,transform" });
              r.current.style.opacity = "1";
              r.current.style.transform = "none";
            }
          });
        }
      });

      if (iconRef.current) {
        tl.fromTo(
          iconRef.current,
          { opacity: 0, scale: 0.8, y: 16 },
          { opacity: 1, scale: 1, y: 0, duration: 0.55 }
        );
      }

      if (eyebrowRef.current) {
        tl.fromTo(
          eyebrowRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.45 },
          "-=0.35"
        );
      }

      const headings = [titleLine1Ref.current, titleLine2Ref.current].filter(Boolean);
      if (headings.length) {
        tl.fromTo(
          headings,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.09 },
          "-=0.3"
        );
      }

      if (descRef.current) {
        tl.fromTo(
          descRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.55 },
          "-=0.35"
        );
      }
    }, heroRef);

    return () => {
      clearTimeout(safetyTimer);
      ctx.revert();
    };
  }, []);

  return (
    <>
      {/* Meta Row: Back to Profile Hub (left) and solid pills (right) */}
      <div className="kx-legal-meta-row">
        <a href={backUrl} className="kx-legal-back-btn">
          <ArrowLeft size={16} />
          <span>Back to Profile Hub</span>
        </a>

        <div className="kx-legal-meta-pills">
          <span className="kx-legal-meta-pill">
            <Clock size={14} />
            <span>{readTime}</span>
          </span>
          <span className="kx-legal-meta-pill">
            <span>Effective Date: {effectiveDate}</span>
          </span>
        </div>
      </div>

      {/* Hero Panel (32px radius, solid #0F1519, no border, animated mesh + scrim) */}
      <section
        ref={heroRef}
        className="kx-legal-hero-panel"
        data-tone={tone}
      >
        {/* Animated Gradient Mesh (transforms only, 14-26s drift) */}
        <div className="kx-hero-mesh" aria-hidden="true">
          <div className="kx-hero-mesh-blob kx-hero-mesh-1" />
          <div className="kx-hero-mesh-blob kx-hero-mesh-2" />
          <div className="kx-hero-mesh-blob kx-hero-mesh-3" />
          <div className="kx-hero-orb kx-hero-orb-1" />
          <div className="kx-hero-orb kx-hero-orb-2" />
          <div className="kx-hero-orb kx-hero-orb-3" />
        </div>

        {/* Solid 60% Scrim */}
        <div className="kx-hero-scrim" aria-hidden="true" />

        {/* Content */}
        <div ref={heroContentRef} className="kx-hero-content">
          <div ref={iconRef} className="kx-legal-icon-tile-96">
            {Icon && <Icon size={38} strokeWidth={2.4} />}
          </div>

          <span ref={eyebrowRef} className="kx-legal-eyebrow">
            {eyebrow}
          </span>

          <h1 className="kx-legal-hero-title">
            <span ref={titleLine1Ref} className="kx-title-line-1">
              {headingLine1}
            </span>{" "}
            <span ref={titleLine2Ref} className="kx-title-line-2 kx-gradient-shimmer">
              {headingKeyPhrase}
            </span>
          </h1>

          <p ref={descRef} className="kx-legal-hero-desc">
            {description}
          </p>
        </div>
      </section>
    </>
  );
}
