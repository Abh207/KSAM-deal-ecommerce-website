import React, { useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";
import {
  Shield,
  ArrowLeft,
  Clock,
  ArrowRight,
  Mail
} from "lucide-react";
import gsap from "gsap";
import { BASE_URL } from "../auth/auth.js";
import Navbar from "../deals/components/Navbar.jsx";
import Newsletter from "../deals/components/Newsletter.jsx";
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

export function PrivacyPolicyPage() {
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
        id: "intro",
        question: "01 — Overview & Scope",
        tone: "blue-purple",
        answer: (
          <div className="space-y-4">
            <p>
              This Privacy Policy applies to the services offered by <strong>[LEGAL NAME]</strong> ("KSAM Deal", "we", "our", or "us"), located at <strong>[REGISTERED ADDRESS]</strong>.
            </p>
            <p>
              KSAM Deal is an online <strong>deal discovery and shopping aggregation platform</strong>. We collect discounted product listings from multiple verified Indian e-commerce merchants and direct our visitors to the merchant's store to finalize purchases.
            </p>
            <div className="kx-callout-block" data-tone="blue-purple">
              <p className="font-semibold text-[var(--kx-text)]">
                KSAM Deal does not sell products, operate inventory, collect payments for goods, or handle shipping logistics.
              </p>
            </div>
          </div>
        )
      },
      {
        id: "data-collected",
        question: "02 — Personal Data We Collect",
        tone: "green-blue",
        answer: (
          <div className="space-y-4">
            <p>We only collect information necessary to deliver personalized deal tracking and account features:</p>
            <ul className="kx-gradient-bullets" data-tone="green-blue">
              <li><strong>Account Profile:</strong> Full name, verified email address, phone number, date of birth, gender, and custom profile avatar.</li>
              <li><strong>Delivery Addresses:</strong> Street address, city, state, and 6-digit PIN code saved in your address book.</li>
              <li><strong>Shopping Preferences:</strong> Wishlist items, price alert thresholds, recently viewed deals, and theme customizations.</li>
              <li><strong>Communications:</strong> Newsletter subscription emails, contact messages, and customer support inquiries.</li>
              <li><strong>Technical Identifiers:</strong> Browser user agent, device screen dimensions, IP address, and cookie identifiers for session continuity.</li>
            </ul>
          </div>
        )
      },
      {
        id: "purpose",
        question: "03 — How We Use Your Data",
        tone: "yellow-green",
        answer: (
          <div className="space-y-4">
            <p>Your data is processed strictly for legitimate discovery and account operations:</p>
            <ul className="kx-gradient-bullets" data-tone="yellow-green">
              <li>Authenticating your session and safeguarding your account settings.</li>
              <li>Saving your wishlist and recently viewed products across browser sessions.</li>
              <li>Dispatching price drop notifications when an item reaches your target discount.</li>
              <li>Displaying regional availability based on your delivery PIN code.</li>
              <li>Responding to inquiries submitted through our Contact Us form.</li>
            </ul>
          </div>
        )
      },
      {
        id: "storage",
        question: "04 — Data Storage & Security",
        tone: "purple-pink",
        answer: (
          <div className="space-y-4">
            <p>
              Your account profile and wishlist data are securely stored in managed PostgreSQL databases powered by <strong>Supabase</strong> with Row-Level Security (RLS) enforcement.
            </p>
            <p>
              All network communications between your browser and our servers are encrypted in transit using industry-standard TLS 1.3. We implement tokenized authorization headers, brute-force rate limiting, and encrypted password hashing.
            </p>
          </div>
        )
      },
      {
        id: "cookies",
        question: "05 — Cookies & Tracking",
        tone: "blue-purple",
        answer: (
          <div className="space-y-4">
            <p>KSAM Deal utilizes minimal, first-party browser storage essential for core site functionality:</p>
            <div className="overflow-x-auto my-4">
              <table className="w-full text-left text-xs rounded-xl overflow-hidden">
                <thead className="bg-[rgba(255,255,255,0.06)] text-[var(--kx-text)] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Key / Cookie</th>
                    <th className="p-3">Storage Type</th>
                    <th className="p-3">Purpose</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--kx-text-muted)]">
                  <tr>
                    <td className="p-3 font-mono font-bold text-[var(--kx-cyan)]">sb-auth-token</td>
                    <td className="p-3">LocalStorage</td>
                    <td className="p-3">Encrypted user authentication session</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-[var(--kx-cyan)]">theme / accent</td>
                    <td className="p-3">LocalStorage</td>
                    <td className="p-3">Dark/light mode and custom color theme</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-[var(--kx-cyan)]">ksam_recent_searches</td>
                    <td className="p-3">LocalStorage</td>
                    <td className="p-3">Recent search query suggestions</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      },
      {
        id: "third-parties",
        question: "06 — Third-Party Services & Partner Links",
        tone: "green-blue",
        answer: (
          <div className="space-y-4">
            <p>
              When you click on a deal or external store link, you will be redirected to an external retailer's website (such as Amazon India, Flipkart, Myntra, etc.).
            </p>
            <p>
              These third-party platforms govern your transaction under their own privacy policies. For complete details on how affiliate partnerships operate, please review our{" "}
              <a href={`${BASE_URL}affiliate-disclosure.html`} className="text-[var(--kx-accent)] kx-animated-link font-bold">
                Affiliate Disclosure
              </a>.
            </p>
          </div>
        )
      },
      {
        id: "retention",
        question: "07 — Data Retention & Deletion",
        tone: "yellow-green",
        answer: (
          <div className="space-y-4">
            <p>
              We retain your personal data only as long as your account remains active. You may permanently delete your account, saved addresses, and all associated personal records at any time directly through the{" "}
              <a href={`${BASE_URL}profile.html#danger`} className="text-[var(--kx-accent)] kx-animated-link font-bold">
                Danger Zone in your Profile Hub
              </a>.
            </p>
          </div>
        )
      },
      {
        id: "rights",
        question: "08 — Your Privacy Rights Under DPDP Act 2023",
        tone: "blue-purple",
        answer: (
          <div className="space-y-4">
            <p>As a Data Principal under India's Digital Personal Data Protection Act 2023, you are entitled to:</p>
            <ul className="kx-gradient-bullets" data-tone="blue-purple">
              <li><strong>Right to Access:</strong> Request a summary of the personal data we hold about you.</li>
              <li><strong>Right to Correction:</strong> Update or rectify outdated or inaccurate account details.</li>
              <li><strong>Right to Erasure:</strong> Delete your personal data through your Profile or by written request.</li>
              <li><strong>Right of Grievance Redressal:</strong> Submit a complaint regarding data processing to our Grievance Officer.</li>
            </ul>
          </div>
        )
      },
      {
        id: "grievance",
        question: "09 — Grievance Officer & Contact",
        tone: "purple-pink",
        answer: (
          <div className="space-y-4">
            <p>
              In accordance with Rule 3(2) of the Information Technology (Intermediary Guidelines) Rules 2021 and Section 12 of the DPDP Act 2023, the details of our Grievance Officer are:
            </p>
            <div className="kx-callout-block text-xs sm:text-sm space-y-2" data-tone="purple-pink">
              <div><strong>Officer Name:</strong> [GRIEVANCE OFFICER NAME/EMAIL]</div>
              <div><strong>Entity:</strong> [LEGAL NAME]</div>
              <div><strong>Address:</strong> [REGISTERED ADDRESS]</div>
              <div>
                <strong>Support & Grievance Email:</strong>{" "}
                <a href="mailto:[SUPPORT EMAIL]" className="text-[var(--kx-accent)] kx-animated-link font-bold">
                  [SUPPORT EMAIL]
                </a>
              </div>
            </div>
            <p className="text-xs text-[var(--kx-text-dim)] pt-2">
              We respond to all grievance complaints within 24–48 working hours, and resolve matters within 15 days as mandated by applicable law.
            </p>
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
      <LiveBackdrop palette="privacy" />
      <Navbar />

      <div className="kx-main-wrapper relative z-10">
        <main className="kx-legal-single-col py-10 sm:py-14 lg:py-16">
          <LegalHero
            tone="privacy"
            icon={Shield}
            eyebrow="Your privacy matters"
            headingLine1="Your privacy."
            headingKeyPhrase="Our priority."
            description="KSAM Deal respects your digital privacy. This policy explains how we collect, store, and protect your personal information in compliance with the Digital Personal Data Protection Act 2023 (India) and the Information Technology Act 2000."
            readTime="~4 min read"
            effectiveDate="[EFFECTIVE DATE]"
            backUrl={`${BASE_URL}profile.html`}
          />

          {/* Single Centered Column: Legal FAQ Accordion */}
          <KxFaq items={faqItems} defaultOpen="intro" allowMultiple />

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

      <Newsletter variant="kx-dark" />
      <div className="kx-legal-bottom-pad" />
    </div>
  );
}

const rootEl = document.getElementById("privacy-policy-root") || document.getElementById("privacy-root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <PrivacyPolicyPage />
    </React.StrictMode>
  );
}

export default PrivacyPolicyPage;
