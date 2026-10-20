import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Info, ArrowLeft, ChevronDown, CheckCircle2, DollarSign, Award, HelpCircle } from "lucide-react";
import { BASE_URL } from "../auth/auth.js";
import { ENABLED_AFFILIATES, AFFILIATE_STATEMENTS } from "../config/affiliates.js";
import Navbar from "../deals/components/Navbar.jsx";
import Newsletter from "../deals/components/Newsletter.jsx";
import Footer from "../deals/components/Footer.jsx";
import "../deals/tailwind-generated.css";
import "../deals/deals.css";
import "../styles/kx-tokens.css";
import "../styles/kx-motion.css";

const SECTIONS = [
  { id: "overview", title: "1. Plain-Language Disclosure" },
  { id: "pricing-impact", title: "2. Zero Impact on Your Price" },
  { id: "editorial-independence", title: "3. Editorial Integrity & Independence" },
  { id: "active-programs", title: "4. Enabled Affiliate Programs" },
  { id: "contact-support", title: "5. Questions & Feedback" }
];

export function AffiliateDisclosurePage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [openAccordion, setOpenAccordion] = useState({
    overview: true,
    "pricing-impact": true
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
        <div className="kx-floating-shape w-96 h-96 -top-20 -left-20 bg-[var(--kx-yellow)] opacity-10 blur-3xl rounded-full" />
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
              alt="Affiliate Transparency"
              loading="lazy"
              className="h-full w-full object-cover mix-blend-screen"
            />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--kx-yellow-soft)] text-[var(--kx-yellow)] mb-5 border border-[var(--kx-yellow)]/20 shadow-[0_0_20px_var(--kx-yellow-soft)]">
              <Info size={24} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[var(--kx-yellow)] block mb-1">
              Affiliate Transparency
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[var(--kx-text)] leading-tight tracking-tight">
              Affiliate <span className="text-[var(--kx-yellow)]">Disclosure</span>
            </h1>
            <p className="mt-4 text-sm text-[var(--kx-text-muted)] leading-relaxed">
              We believe in full transparency with our community. When you discover products and click links on KSAM Deal, we may earn an affiliate commission at no extra cost to you.
            </p>
          </div>

          {/* Decorative Marquee Strip */}
          <div className="mt-8 pt-4 border-t border-[var(--kx-border)] overflow-hidden relative">
            <div className="kx-marquee-track text-[11px] font-black uppercase tracking-[0.25em] text-[var(--kx-text-dim)] select-none">
              <span className="kx-marquee-content">
                &nbsp;100% TRANSPARENT • ZERO EXTRA COST • UNBIASED DEALS • VERIFIED RETAILERS • 100% TRANSPARENT • ZERO EXTRA COST • UNBIASED DEALS • VERIFIED RETAILERS •
              </span>
              <span className="kx-marquee-content" aria-hidden="true">
                &nbsp;100% TRANSPARENT • ZERO EXTRA COST • UNBIASED DEALS • VERIFIED RETAILERS • 100% TRANSPARENT • ZERO EXTRA COST • UNBIASED DEALS • VERIFIED RETAILERS •
              </span>
            </div>
          </div>
        </div>

        {/* Two-Column Layout: Sticky Sidebar TOC + Content */}
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Table of Contents (Desktop Sticky) */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 kx-card--glass p-6">
              <h2 className="text-xs font-black uppercase tracking-wider text-[var(--kx-yellow)] mb-4">
                Contents
              </h2>
              <nav className="space-y-1">
                {SECTIONS.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className={`block rounded-lg px-3 py-2 text-xs font-bold transition ${
                      activeSection === sec.id
                        ? "bg-[var(--kx-yellow-soft)] text-[var(--kx-yellow)] border-l-2 border-[var(--kx-yellow)]"
                        : "text-[var(--kx-text-muted)] hover:bg-white/[0.04] hover:text-[var(--kx-text)]"
                    }`}
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Disclosure Content */}
          <article className="space-y-8 lg:col-span-8 text-[var(--kx-text-muted)] leading-relaxed text-sm">
            {/* Section 1 */}
            <section id="overview" className="kx-card p-6 sm:p-8">
              <button
                type="button"
                onClick={() => toggleAccordion("overview")}
                className="flex w-full items-center justify-between text-left lg:pointer-events-none"
              >
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <DollarSign size={20} className="text-[#22FF88]" />
                  1. Plain-Language Disclosure
                </h2>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition lg:hidden ${openAccordion["overview"] ? "rotate-180" : ""}`}
                />
              </button>
              {(openAccordion["overview"] || window.innerWidth >= 1024) && (
                <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
                  <p>
                    <strong>KSAM Deal</strong> is a free consumer service dedicated to tracking Indian e-commerce discounts, clearance drops, and promotional coupons.
                  </p>
                  <p>
                    To fund our server costs, development, and continuous deal tracking algorithms, we participate in affiliate marketing programs. This means that if you click on certain deal links and complete a purchase on a merchant's website, KSAM Deal may receive a small referral commission from that merchant or affiliate network.
                  </p>
                </div>
              )}
            </section>

            {/* Section 2 */}
            <section id="pricing-impact" className="kx-card p-6 sm:p-8">
              <button
                type="button"
                onClick={() => toggleAccordion("pricing-impact")}
                className="flex w-full items-center justify-between text-left lg:pointer-events-none"
              >
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-[#38BDF8]" />
                  2. Zero Impact on Your Price
                </h2>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition lg:hidden ${openAccordion["pricing-impact"] ? "rotate-180" : ""}`}
                />
              </button>
              {(openAccordion["pricing-impact"] || window.innerWidth >= 1024) && (
                <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
                  <div className="rounded-xl border border-[#22FF88]/20 bg-[#22FF88]/5 p-4 text-xs text-[#22FF88]">
                    <strong>Guaranteed Price Neutrality:</strong> Using our affiliate links never adds any fees or surcharges to your purchase. You pay the exact same price (or lower, when utilizing our curated coupons) as any shopper visiting the store directly.
                  </div>
                  <p>
                    Commissions are paid directly out of the merchant's advertising and customer-acquisition budget, not from your wallet.
                  </p>
                </div>
              )}
            </section>

            {/* Section 3 */}
            <section id="editorial-independence" className="kx-card p-6 sm:p-8">
              <button
                type="button"
                onClick={() => toggleAccordion("editorial-independence")}
                className="flex w-full items-center justify-between text-left lg:pointer-events-none"
              >
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Award size={20} className="text-[#FFD60A]" />
                  3. Editorial Integrity & Independence
                </h2>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition lg:hidden ${openAccordion["editorial-independence"] ? "rotate-180" : ""}`}
                />
              </button>
              {(openAccordion["editorial-independence"] || window.innerWidth >= 1024) && (
                <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
                  <p>
                    Our deal discovery engine is driven by discount depth, historical price drops, and product availability.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-400">
                    <li>We do not artificially rank lower discounts above higher discounts simply because a retailer pays a commission.</li>
                    <li>We regularly feature deals and stores from which we receive no affiliate revenue whenever the deal is beneficial to our users.</li>
                    <li>Advertisers or retailers cannot pay to alter product ratings, hide genuine reviews, or bias price alerts.</li>
                  </ul>
                </div>
              )}
            </section>

            {/* Section 4 */}
            <section id="active-programs" className="kx-card p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white">4. Enabled Affiliate Programs</h2>
              <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
                {ENABLED_AFFILIATES.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-gray-400">
                    <p>
                      <strong>Current Status:</strong> No commercial affiliate agreements are currently active in our configuration. Deals currently published on KSAM Deal are curated organically for community discovery.
                    </p>
                    <p className="mt-2 text-gray-500">
                      When commercial affiliate accounts (e.g. Amazon India Associates, Flipkart Affiliate Network) are activated, their statutory statements will automatically appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ENABLED_AFFILIATES.map((key) => {
                      const prog = AFFILIATE_STATEMENTS[key];
                      if (!prog) return null;
                      return (
                        <div key={key} className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <h3 className="text-sm font-bold text-white mb-1">{prog.name}</h3>
                          <p className="text-xs text-gray-400">{prog.statement}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Section 5 */}
            <section id="contact-support" className="kx-card p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle size={20} className="text-[#38BDF8]" />
                5. Questions & Feedback
              </h2>
              <div className="mt-4 space-y-3 pt-3 border-t border-white/5">
                <p>
                  If you have any questions or feedback regarding our affiliate partnerships or how we sustain KSAM Deal, feel free to contact us:
                </p>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs space-y-1">
                  <div><strong>Operating Entity:</strong> [LEGAL NAME]</div>
                  <div><strong>Registered Address:</strong> [REGISTERED ADDRESS]</div>
                  <div><strong>Support Contact:</strong> <a href="mailto:[SUPPORT EMAIL]" className="text-[#38BDF8]">[SUPPORT EMAIL]</a></div>
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

const rootEl = document.getElementById("affiliate-root");
if (rootEl) {
  createRoot(rootEl).render(<AffiliateDisclosurePage />);
}

export default AffiliateDisclosurePage;
