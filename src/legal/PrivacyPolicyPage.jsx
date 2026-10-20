import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Shield, ArrowLeft, ChevronDown, Lock, FileText, Database, UserCheck, AlertTriangle } from "lucide-react";
import { BASE_URL } from "../auth/auth.js";
import Navbar from "../deals/components/Navbar.jsx";
import Newsletter from "../deals/components/Newsletter.jsx";
import Footer from "../deals/components/Footer.jsx";
import "../deals/tailwind-generated.css";
import "../deals/deals.css";
import "../styles/kx-tokens.css";
import "../styles/kx-motion.css";

const SECTIONS = [
  { id: "intro", title: "1. Overview & Scope" },
  { id: "data-collected", title: "2. Personal Data We Collect" },
  { id: "purpose", title: "3. How We Use Your Data" },
  { id: "storage", title: "4. Data Storage & Security" },
  { id: "cookies", title: "5. Cookies & Local Storage" },
  { id: "third-parties", title: "6. Partner Stores & Affiliate Links" },
  { id: "retention", title: "7. Data Retention & Deletion" },
  { id: "rights", title: "8. Your Rights Under DPDP Act 2023" },
  { id: "grievance", title: "9. Grievance Officer & Contact" }
];

export function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("intro");
  const [openAccordion, setOpenAccordion] = useState({
    intro: true,
    "data-collected": true
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sec.id);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleAccordion = (id) => {
    setOpenAccordion((p) => ({ ...p, [id]: !p[id] }));
  };

  const bannerImg = `${BASE_URL}laptop-image.png`;

  return (
    <div className="kx-page min-h-screen flex flex-col justify-between relative overflow-hidden" style={{ background: "var(--kx-base)", color: "var(--kx-text)" }}>
      {/* Dynamic Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="kx-mesh-bg opacity-30" />
        <div className="kx-noise-overlay" />
        <div className="kx-floating-shape w-96 h-96 -top-20 -left-20 bg-[var(--kx-accent)] opacity-10 blur-3xl rounded-full" />
        <div className="kx-floating-shape w-80 h-80 top-1/2 -right-20 bg-[var(--kx-cyan)] opacity-10 blur-3xl rounded-full" style={{ animationDelay: "-6s" }} />
      </div>

      <Navbar />

      <main className="mx-auto max-w-7xl w-full px-4 py-12 sm:py-20 relative z-10">
        {/* Top Back Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <a
            href={`${BASE_URL}profile.html`}
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--kx-text-muted)] hover:text-[var(--kx-accent)] transition"
          >
            <ArrowLeft size={14} /> Back to Profile Hub
          </a>
          <span className="text-xs text-[var(--kx-text-dim)] font-medium">
            Effective Date: [EFFECTIVE DATE]
          </span>
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--kx-border)] bg-[var(--kx-surface-1)] p-8 sm:p-14 mb-12 shadow-2xl">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-15 hidden md:block">
            <img
              src={bannerImg}
              alt="Privacy & Data Protection"
              loading="lazy"
              className="h-full w-full object-cover mix-blend-screen"
            />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--kx-accent-soft)] text-[var(--kx-accent)] mb-5 border border-[var(--kx-accent)]/20 shadow-[0_0_20px_var(--kx-accent-glow)]">
              <Shield size={24} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[var(--kx-cyan)] block mb-1">
              Legal & Compliance
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[var(--kx-text)] leading-tight tracking-tight">
              Privacy <span className="text-[var(--kx-accent)]">Policy</span>
            </h1>
            <p className="mt-4 text-sm text-[var(--kx-text-muted)] leading-relaxed">
              KSAM Deal respects your digital privacy. This policy explains how we collect, store, and protect your personal information in compliance with the Digital Personal Data Protection Act 2023 (India) and the Information Technology Act 2000.
            </p>
          </div>

          {/* Decorative Marquee Strip */}
          <div className="mt-8 pt-4 border-t border-[var(--kx-border)] overflow-hidden relative">
            <div className="kx-marquee-track text-[11px] font-black uppercase tracking-[0.25em] text-[var(--kx-text-dim)] select-none">
              <span className="kx-marquee-content">
                &nbsp;DATA PROTECTION • DPDP ACT 2023 • ENCRYPTED STORAGE • PRIVACY FIRST • TRANSPARENT DISCOVERY • DATA PROTECTION • DPDP ACT 2023 • ENCRYPTED STORAGE • PRIVACY FIRST • TRANSPARENT DISCOVERY •
              </span>
              <span className="kx-marquee-content" aria-hidden="true">
                &nbsp;DATA PROTECTION • DPDP ACT 2023 • ENCRYPTED STORAGE • PRIVACY FIRST • TRANSPARENT DISCOVERY • DATA PROTECTION • DPDP ACT 2023 • ENCRYPTED STORAGE • PRIVACY FIRST • TRANSPARENT DISCOVERY •
              </span>
            </div>
          </div>
        </div>

        {/* Two-Column Layout: Sticky Sidebar TOC + Content */}
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Table of Contents (Desktop Sticky) */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 kx-card--glass p-6">
              <h2 className="text-xs font-black uppercase tracking-wider text-[var(--kx-cyan)] mb-4">
                Contents
              </h2>
              <nav className="space-y-1">
                {SECTIONS.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className={`block rounded-lg px-3 py-2 text-xs font-bold transition ${
                      activeSection === sec.id
                        ? "bg-[var(--kx-accent-soft)] text-[var(--kx-accent)] border-l-2 border-[var(--kx-accent)]"
                        : "text-[var(--kx-text-muted)] hover:text-[var(--kx-text)] hover:bg-white/[0.04]"
                    }`}
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Policy Text Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Overview */}
            <section id="intro" className="kx-card p-6 sm:p-8">
              <div
                className="flex items-center justify-between cursor-pointer lg:cursor-default"
                onClick={() => toggleAccordion("intro")}
              >
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <FileText size={18} className="text-[#22FF88]" />
                  1. Overview & Scope
                </h2>
                <ChevronDown size={18} className="text-gray-400 lg:hidden" />
              </div>

              {(openAccordion["intro"] || window.innerWidth >= 1024) && (
                <div className="mt-4 text-sm text-gray-300 leading-relaxed space-y-3 pt-3 border-t border-white/5">
                  <p>
                    This Privacy Policy applies to the services offered by <strong>[LEGAL NAME]</strong> ("KSAM Deal", "we", "our", or "us"), located at <strong>[REGISTERED ADDRESS]</strong>.
                  </p>
                  <p>
                    KSAM Deal is an online <strong>deal discovery and shopping aggregation platform</strong>. We collect discounted product listings from multiple verified Indian e-commerce merchants and direct our visitors to the merchant's store to finalize purchases. <strong>KSAM Deal does not sell products, operate inventory, collect payments for goods, or handle shipping logistics.</strong>
                  </p>
                </div>
              )}
            </section>

            {/* 2. Personal Data We Collect */}
            <section id="data-collected" className="kx-card p-6 sm:p-8">
              <div
                className="flex items-center justify-between cursor-pointer lg:cursor-default"
                onClick={() => toggleAccordion("data-collected")}
              >
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Database size={18} className="text-[#38BDF8]" />
                  2. Personal Data We Collect
                </h2>
                <ChevronDown size={18} className="text-gray-400 lg:hidden" />
              </div>

              {(openAccordion["data-collected"] || window.innerWidth >= 1024) && (
                <div className="mt-4 text-sm text-gray-300 leading-relaxed space-y-3 pt-3 border-t border-white/5">
                  <p>We only collect information necessary to deliver personalized deal tracking and account features:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-400">
                    <li><strong>Account Profile:</strong> Full name, verified email address, phone number, date of birth, gender, and custom profile avatar.</li>
                    <li><strong>Delivery Addresses:</strong> Street address, city, state, and 6-digit PIN code saved in your address book.</li>
                    <li><strong>Shopping Preferences:</strong> Wishlist items, price alert thresholds, recently viewed deals, and theme customizations.</li>
                    <li><strong>Communications:</strong> Newsletter subscription emails, contact messages, and customer support inquiries.</li>
                    <li><strong>Telemetry & Outbound Tracking:</strong> Timestamped outbound clicks on deal links (product ID, user ID if logged in) to monitor deal engagement.</li>
                  </ul>
                </div>
              )}
            </section>

            {/* 3. Purpose */}
            <section id="purpose" className="kx-card p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-3">3. How We Use Your Data</h2>
              <div className="text-sm text-gray-300 leading-relaxed space-y-2">
                <p>We process your data strictly to:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-400">
                  <li>Provide seamless user authentication and secure profile management.</li>
                  <li>Track product price changes and alert you when target prices are reached.</li>
                  <li>Personalize deal discovery feeds based on your chosen categories and stores.</li>
                  <li>Send optional promotional deal digests (only if marketing opt-in is enabled).</li>
                  <li>Comply with applicable legal obligations under Indian cyber laws.</li>
                </ul>
              </div>
            </section>

            {/* 4. Storage & Security */}
            <section id="storage" className="kx-card p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Lock size={18} className="text-[#22FF88]" />
                4. Data Storage & Security
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                All account data, addresses, and wishlist records are stored securely in Supabase PostgreSQL databases with encrypted connections (TLS 1.3) and strict Row-Level Security (RLS) policies. User authentication passwords are encrypted using one-way bcrypt hashing algorithms within Supabase Auth; KSAM Deal never stores or has access to your raw password.
              </p>
            </section>

            {/* 5. Cookies & Local Storage */}
            <section id="cookies" className="kx-card p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-3">5. Cookies & Local Storage</h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                We use browser localStorage and sessionStorage to retain active login tokens, shopping cart values for legacy catalogs, and guest wishlists. No third-party behavioral advertising cookies are deposited on your device by KSAM Deal.
              </p>
            </section>

            {/* 6. Partner Stores */}
            <section id="third-parties" className="kx-card p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-3">6. Partner Stores & Affiliate Links</h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                When you click "Buy on Store" or "View Deal", you are redirected via an affiliate link to the partner retailer's website (e.g. Amazon India, Flipkart, Croma). Once you leave our domain, your interactions and purchases are governed exclusively by that merchant's privacy policy and terms.
              </p>
            </section>

            {/* 7. Retention */}
            <section id="retention" className="kx-card p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-3">7. Data Retention & Deletion</h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                We retain your account profile and addresses for as long as your account remains active. Historical price tracking points older than 180 days and ingest logs older than 30 days are automatically purged. If you choose to delete your account via the Profile Hub, all personal profile records, addresses, wishlist items, price alerts, and uploaded avatars are permanently deleted immediately.
              </p>
            </section>

            {/* 8. User Rights */}
            <section id="rights" className="kx-card p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2">
                <UserCheck size={18} className="text-[#38BDF8]" />
                8. Your Rights Under India's DPDP Act 2023
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                As a digital data principal under the Digital Personal Data Protection Act 2023, you have the right to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-400">
                <li>Access and review all personal data held about you in your Profile Hub.</li>
                <li>Correct inaccurate or incomplete personal information at any time.</li>
                <li>Withdraw consent for marketing communications with a single toggle.</li>
                <li>Request permanent erasure of your account and personal data.</li>
              </ul>
            </section>

            {/* 9. Grievance Officer */}
            <section id="grievance" className="kx-card p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-3">9. Grievance Officer & Contact Details</h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                In accordance with the Information Technology Act 2000 and rules made thereunder, the contact details of the Grievance Officer for KSAM Deal are provided below:
              </p>
              <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs space-y-1.5 text-gray-300">
                <p><strong>Officer Name:</strong> [GRIEVANCE OFFICER NAME/EMAIL]</p>
                <p><strong>Designation:</strong> Data Protection & Grievance Officer</p>
                <p><strong>Company:</strong> [LEGAL NAME]</p>
                <p><strong>Address:</strong> [REGISTERED ADDRESS]</p>
                <p><strong>Email:</strong> <a href="mailto:support@ksamdeal.in" className="text-[#22FF88] hover:underline">[SUPPORT EMAIL]</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
}

const rootEl = document.getElementById("privacy-policy-root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <PrivacyPolicyPage />
    </React.StrictMode>
  );
}

export default PrivacyPolicyPage;
