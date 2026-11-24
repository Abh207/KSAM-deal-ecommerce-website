import React, { useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";
import {
  FileText,
  RotateCcw,
  ShieldAlert,
  HelpCircle,
  Mail,
  ArrowRight
} from "lucide-react";
import gsap from "gsap";
import { BASE_URL } from "../auth/auth.js";
import Navbar from "../deals/components/Navbar.jsx";
import Footer from "../deals/components/Footer.jsx";
import LiveBackdrop from "../profile/components/LiveBackdrop.jsx";
import KxFaq from "../components/KxFaq.jsx";
import { ReadingProgressBar, Aurora, useThemeSync } from "../lib/pageEffects.jsx";
import { initScrollParallax, initHeroExitDrift } from "../lib/motion.js";
import { applyTheme, getStoredTheme, getStoredAccent } from "../lib/theme.js";
import LegalHero from "./LegalHero.jsx";

import "../deals/tailwind-generated.css";
import "../deals/deals.css";
import "../profile/kx-spotlight.css";
import "../styles/kx-tokens.css";
import "../styles/kx-motion.css";
import "../styles/kx-pages.css";
import "../styles/kx-faq.css";

export function RefundPolicyPage() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const heroContentRef = useRef(null);

  useThemeSync();

  useEffect(() => {
    applyTheme(getStoredTheme(), getStoredAccent());
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroRef.current && heroContentRef.current) {
        initHeroExitDrift(heroRef.current, heroContentRef.current);
      }
      initScrollParallax(".kx-aurora-blob", 50);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const refundFaqs = useMemo(
    () => [
      {
        id: "membership-refunds",
        question: "01 — Digital Membership Refund Window",
        tone: "yellow-green",
        badge: "Membership",
        answer: (
          <div className="space-y-3">
            <p className="text-white/80 leading-relaxed">
              [DECISION NEEDED: Add your refund terms here — specify whether memberships offer a 7-day money-back guarantee, 14-day cooling-off period, or are strictly non-refundable once digital perks/alerts are accessed.]
            </p>
            <div className="p-4 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-200 text-xs">
              <strong>Note for Admin:</strong> Review and customize this refund duration before taking the subscription plan live to comply with local consumer protection guidelines.
            </div>
          </div>
        )
      },
      {
        id: "cancellation-terms",
        question: "02 — How Subscription Cancellation Works",
        tone: "sky",
        badge: "Cancellation",
        answer: (
          <div className="space-y-3">
            <p className="text-white/80 leading-relaxed">
              You can cancel your recurring membership at any time directly from your <strong>Account Hub &gt; Subscription</strong> tab. When you cancel:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-white/70 text-sm">
              <li>Your membership benefits remain active until the end of your current paid billing period.</li>
              <li>You will not be billed for subsequent renewal cycles.</li>
              <li>[DECISION NEEDED: Add your policy regarding mid-cycle proration or credit notes here.]</li>
            </ul>
          </div>
        )
      },
      {
        id: "ecommerce-orders",
        question: "03 — Third-Party Product Orders & External Stores",
        tone: "yellow-green",
        badge: "External Deals",
        answer: (
          <div className="space-y-3">
            <p className="text-white/80 leading-relaxed">
              For products purchased on external merchant websites (such as Amazon India, Flipkart, Croma, etc.) discovered via KSAM Deal, all returns, exchanges, refunds, and order cancellations are handled directly by the respective merchant platform under their return policies.
            </p>
            <p className="text-white/70 text-xs">
              KSAM Deal acts as a deal discovery and price comparison service and does not fulfill, pack, or ship merchant inventory.
            </p>
          </div>
        )
      },
      {
        id: "chargebacks-disputes",
        question: "04 — Payment Processing & Disputed Charges",
        tone: "amber",
        badge: "Razorpay",
        answer: (
          <div className="space-y-3">
            <p className="text-white/80 leading-relaxed">
              All digital membership payments are processed securely via Razorpay. If you notice an unauthorized transaction or billing discrepancy, please contact our support desk immediately at <strong>support@ksamdeal.com</strong> with your Razorpay Payment ID.
            </p>
            <p className="text-white/70 text-xs">
              [DECISION NEEDED: Add your chargeback handling policy and estimated refund processing turnaround time, e.g. 5–7 business days to original payment method.]
            </p>
          </div>
        )
      }
    ],
    []
  );

  return (
    <div ref={containerRef} className="kx-page relative overflow-hidden min-h-screen bg-[#050a02] text-white">
      <ReadingProgressBar />
      <LiveBackdrop accent="green" />
      <Navbar />

      <main className="relative z-10 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <LegalHero
            ref={heroRef}
            contentRef={heroContentRef}
            icon={RotateCcw}
            badgeText="Policies & Guarantees"
            title="Refund & Cancellation Policy"
            lastUpdated="November 2026"
            subtitle="Transparent guidelines for KSAM Deal digital memberships, renewals, cancellations, and payment disputes."
          />

          <div className="mt-12 space-y-8">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <FileText size={18} className="text-[#84FF00]" />
                Summary of Terms
              </h2>
              <p className="text-sm text-white/70 leading-relaxed">
                We believe in straightforward, honest service without tricky lock-ins. You are always in control of your membership status. Please review the specific terms below.
              </p>
            </div>

            <section className="mt-8">
              <h3 className="text-xl font-black text-white mb-6">Frequently Asked Questions &amp; Detailed Terms</h3>
              <KxFaq items={refundFaqs} />
            </section>

            {/* Contact / Help Section */}
            <div className="mt-12 p-6 sm:p-8 rounded-2xl border border-[#84FF00]/30 bg-[#84FF00]/[0.05] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-bold text-white">Have questions about a refund?</h4>
                <p className="text-sm text-white/60 mt-1">Our support team is here to assist with billing and plan inquiries.</p>
              </div>
              <a
                href={`${BASE_URL}contact-us.html`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-black bg-[#84FF00] hover:bg-[#84FF00]/90 transition shadow-[0_0_20px_rgba(132,255,0,0.3)] shrink-0"
              >
                <Mail size={16} />
                <span>Contact Support</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const rootEl = document.getElementById("refund-root");
if (rootEl) {
  createRoot(rootEl).render(<RefundPolicyPage />);
}
