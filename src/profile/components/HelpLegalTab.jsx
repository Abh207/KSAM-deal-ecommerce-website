import { useEffect, useRef } from "react";
import { Mail, Shield, Scale, Info, MessageSquare, ArrowRight } from "lucide-react";
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7] shrink-0">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111827] tracking-[-0.01em]">
              Need Dedicated Assistance?
            </h3>
            <p className="text-[13.5px] text-[#4B5563] mt-0.5 leading-[1.55]">
              Reach out to our support team for help with your account, orders, or deal tracking.
            </p>
          </div>
        </div>

        <a
          href={`${BASE_URL}contact-us.html`}
          className="kx-btn-primary shrink-0"
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
                tabIndex={0}
              >
                <div className="flex flex-col justify-between h-full w-full relative z-10">
                  <div>
                    {/* Header with small green icon, no coloured square tile */}
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <Icon size={18} className="text-[#15803D] shrink-0" />
                      <h4 className="text-[16px] font-bold text-[#111827] tracking-[-0.01em] leading-snug">
                        {item.title}
                      </h4>
                    </div>

                    {/* Description max 70ch */}
                    <p className="text-[13.5px] text-[#4B5563] leading-[1.55] max-w-[70ch] m-0">
                      {item.desc}
                    </p>
                  </div>

                  {/* Action Link with one link style */}
                  <a
                    href={item.url}
                    className="kx-legal-action-link"
                    aria-label={`${item.action} for ${item.title}`}
                  >
                    <span>{item.action}</span>
                    <ArrowRight size={14} className="kx-arrow-nudge" />
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
