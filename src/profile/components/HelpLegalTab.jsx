import { useEffect, useRef } from "react";
import { Mail, Shield, Scale, Info, MessageSquare, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { BASE_URL } from "../../auth/auth.js";
import { respectReducedMotion } from "../../lib/motion.js";

const LEGAL_CARDS = [
  {
    id: "contact",
    title: "Contact Support",
    desc: "Have an inquiry, feedback, or need assistance? Reach out to our team directly.",
    icon: Mail,
    tone: "green",
    url: `${BASE_URL}contact-us.html`,
    action: "Open Contact Form"
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    desc: "Read our comprehensive data policy compliant with Indian DPDP Act 2023.",
    icon: Shield,
    tone: "blue",
    url: `${BASE_URL}privacy-policy.html`,
    action: "View Privacy Policy"
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    desc: "Understand our user terms, deal aggregation disclaimers, and platform guidelines.",
    icon: Scale,
    tone: "yellow",
    url: `${BASE_URL}terms.html`,
    action: "View Terms"
  },
  {
    id: "affiliate",
    title: "Affiliate Disclosure",
    desc: "Full transparency on how KSAM Deal sustains operations via referral links at ₹0 extra cost.",
    icon: Info,
    tone: "purple",
    url: `${BASE_URL}affiliate-disclosure.html`,
    action: "Read Disclosure"
  }
];

export default function HelpLegalTab() {
  const panelRef = useRef(null);

  useEffect(() => {
    if (respectReducedMotion() || !panelRef.current) return;

    const ctx = gsap.context(() => {
      const banner = panelRef.current.querySelector(".kx-help-featured-banner");
      const cards = panelRef.current.querySelectorAll(".kx-spot");
      const tl = gsap.timeline();

      if (banner) {
        tl.fromTo(
          banner,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
        );
      }
      if (cards.length > 0) {
        tl.fromTo(
          cards,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.32, stagger: 0.05, ease: "power2.out" },
          "-=0.15"
        );
      }
    }, panelRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={panelRef}
      className="ks-tab-panel"
      role="tabpanel"
      aria-label="Help & Legal Information"
    >
      {/* 1. Wide Featured Assistance Banner */}
      <div className="kx-help-featured-banner">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22FF88]/10 text-[#22FF88] border border-[#22FF88]/25 shrink-0">
            <MessageSquare size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-[-0.01em]">
              Need Dedicated Assistance?
            </h3>
            <p className="text-[13.5px] text-[#98A3A0] mt-0.5 leading-[1.55]">
              Our support team typically responds to tickets in under 24 hours.
            </p>
          </div>
        </div>

        <a
          href={`${BASE_URL}contact-us.html`}
          className="shrink-0 rounded-xl bg-gradient-to-r from-[#22FF88] to-[#38BDF8] px-6 py-3 text-xs font-black text-black hover:opacity-90 transition shadow-lg inline-flex items-center justify-center"
        >
          Get Help Now
        </a>
      </div>

      {/* 2. Four Legal Cards in a 2x2 Spotlight Grid */}
      <div className="kx-spot-list">
        <div className="kx-spot-grid-2x2">
          {LEGAL_CARDS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="kx-spot"
                data-tone={item.tone}
                tabIndex={0}
              >
                <div className="flex flex-col justify-between h-full w-full relative z-10">
                  <div>
                    {/* Header with 12px gap to icon tile */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`kx-spot-icon-tile kx-spot-icon-tile--${item.tone}`}
                      >
                        <Icon size={20} />
                      </div>
                      <h4 className="text-[17px] font-[650] text-[#F4F7F5] tracking-[-0.01em] leading-snug">
                        {item.title}
                      </h4>
                    </div>

                    {/* Description max 70ch */}
                    <p className="text-[14px] text-[#98A3A0] leading-[1.55] max-w-[70ch] m-0">
                      {item.desc}
                    </p>
                  </div>

                  {/* Action Link with 6px gap to chevron that nudges 3px on hover */}
                  <a
                    href={item.url}
                    className="kx-card-link"
                    aria-label={`${item.action} for ${item.title}`}
                  >
                    <span>{item.action}</span>
                    <ChevronRight size={14} className="kx-chevron-nudge" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
