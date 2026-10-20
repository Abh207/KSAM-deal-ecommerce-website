import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Scale, ArrowLeft, ChevronDown, ShoppingBag, ShieldCheck, ExternalLink, AlertCircle, FileText } from "lucide-react";
import { BASE_URL } from "../auth/auth.js";
import Navbar from "../deals/components/Navbar.jsx";
import Newsletter from "../deals/components/Newsletter.jsx";
import Footer from "../deals/components/Footer.jsx";
import "../deals/tailwind-generated.css";
import "../deals/deals.css";
import "../styles/kx-tokens.css";
import "../styles/kx-motion.css";

const SECTIONS = [
  { id: "platform-nature", title: "1. Nature of Platform & Non-Seller Status" },
  { id: "accounts", title: "2. User Accounts & Registration" },
  { id: "pricing-disclaimer", title: "3. Deals, Pricing & Availability Disclaimer" },
  { id: "affiliate-redirection", title: "4. Outbound Links & External Retailers" },
  { id: "acceptable-use", title: "5. Acceptable Use & Conduct" },
  { id: "ip-trademarks", title: "6. Intellectual Property & Brand Rights" },
  { id: "liability", title: "7. Disclaimer of Warranties & Liability" },
  { id: "termination", title: "8. Account Termination & Deletion" },
  { id: "governing-law", title: "9. Governing Law & Dispute Resolution" },
  { id: "contact-info", title: "10. Contact & Operator Details" }
];

export function TermsPage() {
  const [activeSection, setActiveSection] = useState("platform-nature");
  const [openAccordion, setOpenAccordion] = useState({
    "platform-nature": true,
    accounts: true
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

  const bannerImg = `${BASE_URL}lamplight.png`;

  return (
    <div className="kx-page min-h-screen flex flex-col justify-between relative overflow-hidden" style={{ background: "var(--kx-base)", color: "var(--kx-text)" }}>
      {/* Dynamic Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="kx-mesh-bg opacity-30" />
        <div className="kx-noise-overlay" />
        <div className="kx-floating-shape w-96 h-96 -top-20 -left-20 bg-[var(--kx-cyan)] opacity-10 blur-3xl rounded-full" />
        <div className="kx-floating-shape w-80 h-80 top-1/2 -right-20 bg-[var(--kx-accent)] opacity-10 blur-3xl rounded-full" style={{ animationDelay: "-6s" }} />
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
              alt="Terms & Conditions"
              loading="lazy"
              className="h-full w-full object-cover mix-blend-screen"
            />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--kx-cyan-soft)] text-[var(--kx-cyan)] mb-5 border border-[var(--kx-cyan)]/20 shadow-[0_0_20px_var(--kx-cyan-soft)]">
              <Scale size={24} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[var(--kx-cyan)] block mb-1">
              User Agreement
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[var(--kx-text)] leading-tight tracking-tight">
              Terms & <span className="text-[var(--kx-cyan)]">Conditions</span>
            </h1>
            <p className="mt-4 text-sm text-[var(--kx-text-muted)] leading-relaxed">
              Please review these terms before using KSAM Deal. KSAM Deal is an India-based deal-discovery platform that redirects shoppers to third-party partner stores and does not process payments, fulfill orders, or act as a retailer.
            </p>
          </div>

          {/* Decorative Marquee Strip */}
          <div className="mt-8 pt-4 border-t border-[var(--kx-border)] overflow-hidden relative">
            <div className="kx-marquee-track text-[11px] font-black uppercase tracking-[0.25em] text-[var(--kx-text-dim)] select-none">
              <span className="kx-marquee-content">
                &nbsp;TERMS OF SERVICE • TRANSPARENT DISCOVERY • INDEPENDENT AGGREGATOR • VERIFIED MERCHANTS • TERMS OF SERVICE • TRANSPARENT DISCOVERY • INDEPENDENT AGGREGATOR • VERIFIED MERCHANTS •
              </span>
              <span className="kx-marquee-content" aria-hidden="true">
                &nbsp;TERMS OF SERVICE • TRANSPARENT DISCOVERY • INDEPENDENT AGGREGATOR • VERIFIED MERCHANTS • TERMS OF SERVICE • TRANSPARENT DISCOVERY • INDEPENDENT AGGREGATOR • VERIFIED MERCHANTS •
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
                        ? "bg-[var(--kx-cyan-soft)] text-[var(--kx-cyan)] border-l-2 border-[var(--kx-cyan)]"
                        : "text-[var(--kx-text-muted)] hover:bg-white/[0.04] hover:text-[var(--kx-text)]"
                    }`}
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Legal Content */}
          <article className="space-y-8 lg:col-span-8 text-[var(--kx-text-muted)] leading-relaxed text-sm">
            {/* Section 1 */}
            <section id="platform-nature" className="kx-card p-6 sm:p-8">
              <button
                type="button"
                onClick={() => toggleAccordion("platform-nature")}
                className="flex w-full items-center justify-between text-left lg:pointer-events-none"
              >
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingBag size={20} className="text-[#38BDF8]" />
                  1. Nature of Platform & Non-Seller Status
                </h2>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition lg:hidden ${openAccordion["platform-nature"] ? "rotate-180" : ""}`}
                />
              </button>
              {(openAccordion["platform-nature"] || window.innerWidth >= 1024) && (
                <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
                  <p>
                    <strong>KSAM Deal</strong> (operated by <strong>[LEGAL NAME]</strong>) is an online discovery and shopping aggregation portal designed to help shoppers identify discounts, coupons, and product deals across various Indian e-commerce merchants.
                  </p>
                  <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-300">
                    <strong>Critical Notice:</strong> KSAM Deal is <strong>NOT</strong> an online retailer, merchant of record, or marketplace seller. We do not stock inventory, set retail prices, collect payment for products, package, ship, or process returns. When you click on a deal or offer, you are redirected to the third-party merchant's platform where the actual commercial transaction occurs.
                  </p>
                </div>
              )}
            </section>

            {/* Section 2 */}
            <section id="accounts" className="kx-card p-6 sm:p-8">
              <button
                type="button"
                onClick={() => toggleAccordion("accounts")}
                className="flex w-full items-center justify-between text-left lg:pointer-events-none"
              >
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={20} className="text-[#22FF88]" />
                  2. User Accounts & Registration
                </h2>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition lg:hidden ${openAccordion["accounts"] ? "rotate-180" : ""}`}
                />
              </button>
              {(openAccordion["accounts"] || window.innerWidth >= 1024) && (
                <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
                  <p>
                    You may create an optional personal account to save delivery addresses for quick comparison, track price alerts, monitor recently viewed products, and tailor deal preferences.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-400">
                    <li>You agree to provide true, current, and complete information during registration.</li>
                    <li>You are solely responsible for maintaining the confidentiality of your login credentials and password.</li>
                    <li>You must immediately notify us of any unauthorized use or security compromise of your account.</li>
                    <li>We reserve the right to suspend or terminate accounts that breach these terms or engage in fraudulent activities.</li>
                  </ul>
                </div>
              )}
            </section>

            {/* Section 3 */}
            <section id="pricing-disclaimer" className="kx-card p-6 sm:p-8">
              <button
                type="button"
                onClick={() => toggleAccordion("pricing-disclaimer")}
                className="flex w-full items-center justify-between text-left lg:pointer-events-none"
              >
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <AlertCircle size={20} className="text-[#FFD60A]" />
                  3. Deals, Pricing & Availability Disclaimer
                </h2>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition lg:hidden ${openAccordion["pricing-disclaimer"] ? "rotate-180" : ""}`}
                />
              </button>
              {(openAccordion["pricing-disclaimer"] || window.innerWidth >= 1024) && (
                <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
                  <p>
                    All product descriptions, prices, discounts, coupons, and stock availability displayed on KSAM Deal are aggregated from public data feeds, retail partner APIs, or promotional materials provided by third-party stores.
                  </p>
                  <p>
                    Because prices and inventory fluctuate dynamically and without notice, the price and terms displayed on the <strong>merchant's actual checkout page at the exact moment of purchase</strong> govern the transaction. KSAM Deal cannot guarantee that any deal will remain available or honor price discrepancies resulting from cached data or technical delays.
                  </p>
                </div>
              )}
            </section>

            {/* Section 4 */}
            <section id="affiliate-redirection" className="kx-card p-6 sm:p-8">
              <button
                type="button"
                onClick={() => toggleAccordion("affiliate-redirection")}
                className="flex w-full items-center justify-between text-left lg:pointer-events-none"
              >
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <ExternalLink size={20} className="text-[#38BDF8]" />
                  4. Outbound Links & External Retailers
                </h2>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition lg:hidden ${openAccordion["affiliate-redirection"] ? "rotate-180" : ""}`}
                />
              </button>
              {(openAccordion["affiliate-redirection"] || window.innerWidth >= 1024) && (
                <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
                  <p>
                    Our platform contains outbound links to external merchant platforms (such as Amazon India, Flipkart, Myntra, Tata CLiQ, etc.). These links may include unique affiliate tracking identifiers that permit the partner store to credit KSAM Deal with an affiliate commission at no extra cost to you.
                  </p>
                  <p>
                    We exercise no control over the privacy practices, content, terms of sale, delivery times, warranty fulfillment, or customer service policies of external retailers. Your relationship with those retailers is governed exclusively by their own terms of service.
                  </p>
                </div>
              )}
            </section>

            {/* Section 5 */}
            <section id="acceptable-use" className="kx-card p-6 sm:p-8">
              <button
                type="button"
                onClick={() => toggleAccordion("acceptable-use")}
                className="flex w-full items-center justify-between text-left lg:pointer-events-none"
              >
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <FileText size={20} className="text-purple-400" />
                  5. Acceptable Use & Conduct
                </h2>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition lg:hidden ${openAccordion["acceptable-use"] ? "rotate-180" : ""}`}
                />
              </button>
              {(openAccordion["acceptable-use"] || window.innerWidth >= 1024) && (
                <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
                  <p>By accessing KSAM Deal, you explicitly agree NOT to:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-400">
                    <li>Use automated scripts, crawlers, scrapers, or bot networks to harvest deal data or overwhelm our infrastructure.</li>
                    <li>Attempt to bypass rate limits, probe security perimeters, or inject malicious payloads.</li>
                    <li>Transmit deceptive, abusive, defamatory, or spam messages via our contact forms.</li>
                    <li>Create dummy accounts or exploit price alert systems for denial of service.</li>
                  </ul>
                </div>
              )}
            </section>

            {/* Section 6 */}
            <section id="ip-trademarks" className="kx-card p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white">6. Intellectual Property & Brand Rights</h2>
              <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
                <p>
                  The KSAM Deal software, website layout, graphics, code, and trademarks are the proprietary intellectual property of <strong>[LEGAL NAME]</strong>.
                </p>
                <p>
                  All third-party store names, brand marks, product logos, and merchant trademarks displayed on KSAM Deal are the property of their respective trademark holders. Their inclusion on this website is solely for nominative fair use to identify the source and retailer of the respective discounts.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section id="liability" className="kx-card p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white">7. Disclaimer of Warranties & Limitation of Liability</h2>
              <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
                <p>
                  KSAM DEAL AND ITS CONTENT ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR FREEDOM FROM ERRORS.
                </p>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE INDIAN LAW, [LEGAL NAME], ITS DIRECTORS, EMPLOYEES, AND PARTNERS SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF YOUR USE OF THE PLATFORM OR ANY TRANSACTIONS CONDUCTED WITH THIRD-PARTY MERCHANTS. OUR MAXIMUM AGGREGATE LIABILITY SHALL NOT EXCEED ₹100 INR.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section id="termination" className="kx-card p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white">8. Account Termination & Deletion</h2>
              <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
                <p>
                  You have the absolute right to delete your KSAM Deal account at any time through the Danger Zone section in your <a href={`${BASE_URL}profile.html#danger`} className="text-[#22FF88] underline">Profile Hub</a>. Account deletion permanently removes your profile credentials, saved addresses, wishlist, price alerts, and browsing logs.
                </p>
                <p>
                  We reserve the right to suspend or revoke access to any user who violates these Terms or engages in unauthorized activity.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="governing-law" className="kx-card p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white">9. Governing Law & Dispute Resolution</h2>
              <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
                <p>
                  These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of India, without regard to conflict of law principles.
                </p>
                <p>
                  Any dispute, controversy, or claim arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the competent courts located in <strong>[CITY, STATE, INDIA]</strong>.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section id="contact-info" className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white">10. Contact & Operator Details</h2>
              <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
                <p>If you have any questions or concerns regarding these Terms, please reach out to us:</p>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs space-y-1">
                  <div><strong>Operating Entity:</strong> [LEGAL NAME]</div>
                  <div><strong>Registered Address:</strong> [REGISTERED ADDRESS]</div>
                  <div><strong>Support Email:</strong> <a href="mailto:[SUPPORT EMAIL]" className="text-[#38BDF8]">[SUPPORT EMAIL]</a></div>
                  <div><strong>Grievance Officer:</strong> [GRIEVANCE OFFICER NAME/EMAIL]</div>
                </div>
              </div>
            </section>
          </article>
        </div>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
}

const rootEl = document.getElementById("terms-root");
if (rootEl) {
  createRoot(rootEl).render(<TermsPage />);
}

export default TermsPage;
