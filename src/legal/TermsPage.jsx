import React, { useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";
import {
  FileText,
  ArrowLeft,
  Clock,
  ArrowRight,
  Mail
} from "lucide-react";
import gsap from "gsap";
import { BASE_URL } from "../auth/auth.js";
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

export function TermsPage() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const heroContentRef = useRef(null);

  useThemeSync();

  useEffect(() => {
    applyTheme(getStoredTheme(), getStoredAccent());
  }, []);

  // GSAP Scroll Motion (Pin-free, reverted on unmount via gsap.context)
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
        id: "platform-nature",
        question: "01 — Nature of Platform & Non-Seller Status",
        tone: "yellow-green",
        answer: (
          <div className="space-y-4">
            <p>
              <strong>KSAM Deal</strong> (operated by <strong>[LEGAL NAME]</strong>) is an online discovery and shopping aggregation portal designed to help shoppers identify discounts, coupons, and product deals across various Indian e-commerce merchants.
            </p>
            <div className="kx-callout-block" data-tone="yellow-green">
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-[var(--kx-text)]">Critical Notice:</strong> KSAM Deal is <strong>NOT</strong> an online retailer, merchant of record, or marketplace seller. We do not stock inventory, set retail prices, collect payment for products, package, ship, or process returns. When you click on a deal or offer, you are redirected to the third-party merchant's platform where the actual commercial transaction occurs.
              </p>
            </div>
          </div>
        )
      },
      {
        id: "accounts",
        question: "02 — User Accounts & Registration",
        tone: "green-blue",
        answer: (
          <div className="space-y-4">
            <p>
              You may create an optional personal account to save delivery addresses for quick comparison, track price alerts, monitor recently viewed products, and tailor deal preferences.
            </p>
            <ul className="kx-gradient-bullets" data-tone="green-blue">
              <li>You agree to provide true, current, and complete information during registration.</li>
              <li>You are solely responsible for maintaining the confidentiality of your login credentials and password.</li>
              <li>You must immediately notify us of any unauthorized use or security compromise of your account.</li>
              <li>We reserve the right to suspend or terminate accounts that breach these terms or engage in fraudulent activities.</li>
            </ul>
          </div>
        )
      },
      {
        id: "pricing-disclaimer",
        question: "03 — Deals, Pricing & Availability Disclaimer",
        tone: "blue-purple",
        answer: (
          <div className="space-y-4">
            <p>
              All product descriptions, prices, discounts, coupons, and stock availability displayed on KSAM Deal are aggregated from public data feeds, retail partner APIs, or promotional materials provided by third-party stores.
            </p>
            <p>
              Because prices and inventory fluctuate dynamically and without notice, the price and terms displayed on the <strong>merchant's actual checkout page at the exact moment of purchase</strong> govern the transaction. KSAM Deal cannot guarantee that any deal will remain available or honor price discrepancies resulting from cached data or technical delays.
            </p>
          </div>
        )
      },
      {
        id: "affiliate-redirection",
        question: "04 — Outbound Links & External Retailers",
        tone: "purple-pink",
        answer: (
          <div className="space-y-4">
            <p>
              Our platform contains outbound links to external merchant platforms (such as Amazon India, Flipkart, Myntra, Tata CLiQ, etc.). These links may include unique affiliate tracking identifiers that permit the partner store to credit KSAM Deal with an affiliate commission at no extra cost to you.
            </p>
            <p>
              We exercise no control over the privacy practices, content, terms of sale, delivery times, warranty fulfillment, or customer service policies of external retailers. Your relationship with those retailers is governed exclusively by their own terms of service.
            </p>
          </div>
        )
      },
      {
        id: "acceptable-use",
        question: "05 — Acceptable Use & Conduct",
        tone: "yellow-green",
        answer: (
          <div className="space-y-4">
            <p>By accessing KSAM Deal, you explicitly agree NOT to:</p>
            <ul className="kx-gradient-bullets" data-tone="yellow-green">
              <li>Use automated scripts, crawlers, scrapers, or bot networks to harvest deal data or overwhelm our infrastructure.</li>
              <li>Attempt to bypass rate limits, probe security perimeters, or inject malicious payloads.</li>
              <li>Transmit deceptive, abusive, defamatory, or spam messages via our contact forms.</li>
              <li>Create dummy accounts or exploit price alert systems for denial of service.</li>
            </ul>
          </div>
        )
      },
      {
        id: "ip-trademarks",
        question: "06 — Intellectual Property & Brand Rights",
        tone: "green-blue",
        answer: (
          <div className="space-y-4">
            <p>
              The KSAM Deal software, website layout, graphics, code, and trademarks are the proprietary intellectual property of <strong>[LEGAL NAME]</strong>.
            </p>
            <p>
              All third-party store names, brand marks, product logos, and merchant trademarks displayed on KSAM Deal are the property of their respective trademark holders. Their inclusion on this website is solely for nominative fair use to identify the source and retailer of the respective discounts.
            </p>
          </div>
        )
      },
      {
        id: "liability",
        question: "07 — Disclaimer of Warranties & Limitation of Liability",
        tone: "blue-purple",
        answer: (
          <div className="space-y-4">
            <p>
              KSAM DEAL AND ITS CONTENT ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR FREEDOM FROM ERRORS.
            </p>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE INDIAN LAW, [LEGAL NAME], ITS DIRECTORS, EMPLOYEES, AND PARTNERS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF YOUR USE OF THE PLATFORM OR ANY TRANSACTIONS CONDUCTED WITH THIRD-PARTY MERCHANTS. OUR MAXIMUM AGGREGATE LIABILITY SHALL NOT EXCEED ₹100 INR.
            </p>
          </div>
        )
      },
      {
        id: "termination",
        question: "08 — Account Termination & Deletion",
        tone: "purple-pink",
        answer: (
          <div className="space-y-4">
            <p>
              You have the absolute right to delete your KSAM Deal account at any time through the Danger Zone section in your <a href={`${BASE_URL}profile.html#danger`} className="text-[var(--kx-accent)] kx-animated-link font-bold">Profile Hub</a>. Account deletion permanently removes your profile credentials, saved addresses, wishlist, price alerts, and browsing logs.
            </p>
            <p>
              We reserve the right to suspend or revoke access to any user who violates these Terms or engages in unauthorized activity.
            </p>
          </div>
        )
      },
      {
        id: "governing-law",
        question: "09 — Governing Law & Dispute Resolution",
        tone: "yellow-green",
        answer: (
          <div className="space-y-4">
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of India, without regard to conflict of law principles.
            </p>
            <p>
              Any dispute, controversy, or claim arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the competent courts located in <strong>[CITY, STATE, INDIA]</strong>.
            </p>
          </div>
        )
      },
      {
        id: "contact-info",
        question: "10 — Contact & Operator Details",
        tone: "green-blue",
        answer: (
          <div className="space-y-4">
            <p>If you have any questions or concerns regarding these Terms, please reach out to us:</p>
            <div className="kx-callout-block text-xs sm:text-sm space-y-2" data-tone="green-blue">
              <div><strong>Operating Entity:</strong> [LEGAL NAME]</div>
              <div><strong>Registered Address:</strong> [REGISTERED ADDRESS]</div>
              <div>
                <strong>Support Email:</strong>{" "}
                <a href="mailto:[SUPPORT EMAIL]" className="text-[var(--kx-accent)] kx-animated-link font-bold">
                  [SUPPORT EMAIL]
                </a>
              </div>
              <div><strong>Grievance Officer:</strong> [GRIEVANCE OFFICER NAME/EMAIL]</div>
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
      <LiveBackdrop palette="terms" />
      <Navbar />

      <div className="kx-main-wrapper relative z-10">
        <main className="kx-legal-single-col py-10 sm:py-14 lg:py-16">
          <LegalHero
            tone="terms"
            icon={FileText}
            eyebrow="Terms of service"
            headingLine1="Clear terms."
            headingKeyPhrase="Better experiences."
            description="Please review these Terms & Conditions carefully before using KSAM Deal. By accessing our platform, you agree to these legal obligations and service terms."
            readTime="~5 min read"
            effectiveDate="[EFFECTIVE DATE]"
            backUrl={`${BASE_URL}profile.html`}
          />

          {/* Single Centered Column: Legal FAQ Accordion */}
          <KxFaq items={faqItems} defaultOpen="platform-nature" allowMultiple />

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

const rootEl = document.getElementById("terms-root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <TermsPage />
    </React.StrictMode>
  );
}

export default TermsPage;
