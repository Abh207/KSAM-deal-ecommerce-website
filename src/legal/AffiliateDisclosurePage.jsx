import React, { useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";
import {
  DollarSign,
  ArrowLeft,
  Clock,
  ArrowRight,
  Mail
} from "lucide-react";
import gsap from "gsap";
import { BASE_URL } from "../auth/auth.js";
import { ENABLED_AFFILIATES, AFFILIATE_STATEMENTS } from "../config/affiliates.js";
import Navbar from "../deals/components/Navbar.jsx";
import LiveBackdrop from "../profile/components/LiveBackdrop.jsx";
import KxFaq from "../components/KxFaq.jsx";
import { ReadingProgressBar, Aurora, useThemeSync } from "../lib/pageEffects.jsx";
import {
  initScrollParallax,
  initHeroExitDrift
} from "../lib/motion.js";
import { applyTheme, getStoredTheme, getStoredAccent } from "../lib/theme.js";
import LegalHero from "./LegalHero.jsx";

import "../deals/tailwind-generated.css";
import "../deals/deals.css";
import "../profile/kx-spotlight.css";
import "../styles/kx-tokens.css";
import "../styles/kx-motion.css";
import "../styles/kx-pages.css";
import "../styles/kx-faq.css";

export function AffiliateDisclosurePage() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const heroContentRef = useRef(null);

  useThemeSync();

  useEffect(() => {
    applyTheme(getStoredTheme(), getStoredAccent());
  }, []);

  // GSAP Scroll Motion
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroRef.current && heroContentRef.current) {
        initHeroExitDrift(heroRef.current, heroContentRef.current);
      }
      initScrollParallax(".kx-aurora-blob", 50);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const faqItems = useMemo(
    () => [
      {
        id: "overview",
        question: "01 — Plain-Language Disclosure",
        tone: "green-purple",
        answer: (
          <div className="space-y-4">
            <p>
              <strong>KSAM Deal</strong> is a free consumer service dedicated to tracking Indian e-commerce discounts, clearance drops, and promotional coupons.
            </p>
            <p>
              To fund our server costs, development, and continuous deal tracking algorithms, we participate in affiliate marketing programs. This means that if you click on certain deal links and complete a purchase on a merchant's website, KSAM Deal may receive a small referral commission from that merchant or affiliate network.
            </p>
          </div>
        )
      },
      {
        id: "pricing-impact",
        question: "02 — Zero Impact on Your Price",
        tone: "green-blue",
        answer: (
          <div className="space-y-4">
            <div className="kx-callout-block" data-tone="green-blue">
              <p className="font-semibold text-[var(--kx-text)]">
                <strong>Guaranteed Price Neutrality:</strong> Using our affiliate links never adds any fees or surcharges to your purchase. You pay the exact same price (or lower, when utilizing our curated coupons) as any shopper visiting the store directly.
              </p>
            </div>
            <p>
              Commissions are paid directly out of the merchant's advertising and customer-acquisition budget, not from your wallet.
            </p>
          </div>
        )
      },
      {
        id: "editorial-independence",
        question: "03 — Editorial Integrity & Independence",
        tone: "yellow-green",
        answer: (
          <div className="space-y-4">
            <p>
              Our deal discovery engine is driven by discount depth, historical price drops, and product availability.
            </p>
            <ul className="kx-gradient-bullets" data-tone="yellow-green">
              <li>We do not artificially rank lower discounts above higher discounts simply because a retailer pays a commission.</li>
              <li>We regularly feature deals and stores from which we receive no affiliate revenue whenever the deal is beneficial to our users.</li>
              <li>Advertisers or retailers cannot pay to alter product ratings, hide genuine reviews, or bias price alerts.</li>
            </ul>
          </div>
        )
      },
      {
        id: "active-programs",
        question: "04 — Enabled Affiliate Programs",
        tone: "blue-purple",
        answer: (
          <div className="space-y-4">
            {ENABLED_AFFILIATES.length === 0 ? (
              <div className="kx-callout-block text-xs sm:text-sm space-y-2" data-tone="blue-purple">
                <p>
                  <strong className="text-[var(--kx-text)]">Current Status:</strong> No commercial affiliate agreements are currently active in our configuration. Deals currently published on KSAM Deal are curated organically for community discovery.
                </p>
                <p className="text-[var(--kx-text-muted)]">
                  When commercial affiliate accounts (e.g. Amazon India Associates, Flipkart Affiliate Network) are activated, their statutory statements will automatically appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {ENABLED_AFFILIATES.map((key) => {
                  const prog = AFFILIATE_STATEMENTS[key];
                  if (!prog) return null;
                  return (
                    <div
                      key={key}
                      className="p-4 rounded-2xl bg-[rgba(255,255,255,0.04)]"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase bg-[linear-gradient(135deg,#00F5A0,#22D3EE)] text-[#050505]">
                          {prog.name.slice(0, 2)}
                        </div>
                        <h3 className="text-sm font-bold text-[var(--kx-text)]">
                          {prog.name}
                        </h3>
                      </div>
                      <p className="text-xs text-[var(--kx-text-muted)] leading-relaxed">
                        {prog.statement}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )
      },
      {
        id: "contact-support",
        question: "05 — Questions & Feedback",
        tone: "purple-pink",
        answer: (
          <div className="space-y-4">
            <p>
              If you have any questions or feedback regarding our affiliate partnerships or how we sustain KSAM Deal, feel free to contact us:
            </p>
            <div className="kx-callout-block text-xs sm:text-sm space-y-2" data-tone="purple-pink">
              <div><strong>Operating Entity:</strong> [LEGAL NAME]</div>
              <div><strong>Registered Address:</strong> [REGISTERED ADDRESS]</div>
              <div>
                <strong>Support Contact:</strong>{" "}
                <a href="mailto:[SUPPORT EMAIL]" className="text-[var(--kx-accent)] kx-animated-link font-bold">
                  [SUPPORT EMAIL]
                </a>
              </div>
            </div>
          </div>
        )
      }
    ],
    []
  );

  return (
    <div
      ref={containerRef}
      className="kx-page min-h-screen flex flex-col justify-between relative"
      style={{ background: "var(--kx-base)", color: "var(--kx-text)" }}
    >
      <ReadingProgressBar />
      <LiveBackdrop palette="affiliate" />
      <Navbar />

      <div className="kx-main-wrapper relative z-10">
        <main className="kx-legal-single-col py-10 sm:py-14 lg:py-16">
          <LegalHero
            tone="affiliate"
            icon={DollarSign}
            eyebrow="Transparency first"
            headingLine1="Honest deals."
            headingKeyPhrase="Clear disclosures."
            description="We believe in full transparency with our community. When you discover products and click links on KSAM Deal, we may earn an affiliate commission at no extra cost to you."
            readTime="~3 min read"
            effectiveDate="[EFFECTIVE DATE]"
            backUrl={`${BASE_URL}profile.html`}
          />

          {/* Single Centered Column: Legal FAQ Accordion */}
          <KxFaq items={faqItems} defaultOpen="overview" allowMultiple />

          {/* End of Page Navigation CTAs */}
          <div className="kx-legal-actions">
            <a
              href={`${BASE_URL}profile.html`}
              className="kx-legal-btn-primary kx-btn-shine"
            >
              <span>Back to Profile Hub</span>
              <ArrowRight size={16} />
            </a>
            <a
              href={`${BASE_URL}contact-us.html`}
              className="kx-legal-btn-secondary"
            >
              <Mail size={16} />
              <span>Contact Us</span>
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}

const rootEl = document.getElementById("affiliate-root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <AffiliateDisclosurePage />
    </React.StrictMode>
  );
}

export default AffiliateDisclosurePage;
