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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] shrink-0 shadow-[-2px_-2px_6px_rgba(255,255,255,0.8),2px_2px_6px_rgba(163,177,198,0.3)]">
            <MessageSquare size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172A] tracking-[-0.01em]">
              Need Dedicated Assistance?
            </h3>
            <p className="text-[13.5px] text-[#475569] mt-0.5 leading-[1.55]">
              Our support team typically responds to tickets in under 24 hours.
            </p>
          </div>
        </div>

        <a
          href={`${BASE_URL}contact-us.html`}
          className="shrink-0 rounded-full bg-[#0F172A] px-6 py-3 text-xs font-bold text-white hover:bg-[#1E293B] transition shadow-[-2px_-2px_6px_rgba(255,255,255,0.8),2px_4px_10px_rgba(15,23,42,0.3)] inline-flex items-center justify-center"
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
                      <h4 className="text-[17px] font-bold text-[#0F172A] tracking-[-0.01em] leading-snug">
                        {item.title}
                      </h4>
                    </div>

                    {/* Description max 70ch */}
                    <p className="text-[14px] text-[#475569] leading-[1.55] max-w-[70ch] m-0">
                      {item.desc}
                    </p>
                  </div>

                  {/* Action Link with 6px gap to chevron that nudges 3px on hover */}
                  <a
                    href={item.url}
                    className="kx-card-link font-bold"
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
