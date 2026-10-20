import { HelpCircle, Mail, Shield, Scale, Info, ExternalLink, MessageSquare, Clock } from "lucide-react";
import { BASE_URL } from "../../auth/auth.js";

const LEGAL_ITEMS = [
  {
    id: "contact",
    title: "Contact Support",
    desc: "Have an inquiry, feedback, or need assistance? Reach out to our team directly.",
    icon: Mail,
    color: "#22FF88",
    url: `${BASE_URL}contact-us.html`,
    action: "Open Contact Form"
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    desc: "Read our comprehensive data policy compliant with Indian DPDP Act 2023.",
    icon: Shield,
    color: "#38BDF8",
    url: `${BASE_URL}privacy-policy.html`,
    action: "View Privacy Policy"
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    desc: "Understand our user terms, deal aggregation disclaimers, and platform guidelines.",
    icon: Scale,
    color: "#FFD60A",
    url: `${BASE_URL}terms.html`,
    action: "View Terms"
  },
  {
    id: "affiliate",
    title: "Affiliate Disclosure",
    desc: "Full transparency on how KSAM Deal sustains operations via referral links at ₹0 extra cost.",
    icon: Info,
    color: "#a855f7",
    url: `${BASE_URL}affiliate-disclosure.html`,
    action: "Read Disclosure"
  },
  {
    id: "faq",
    title: "Frequently Asked Questions",
    desc: "Instant answers on coupon validation, deal refreshes, and outbound order fulfillment.",
    icon: HelpCircle,
    color: "#ec4899",
    url: `${BASE_URL}#faq`,
    action: "Browse FAQs"
  }
];

export default function HelpLegalTab() {
  return (
    <div className="ks-tab-panel" role="tabpanel" aria-label="Help & Legal Information">
      <div className="ks-card">
        <div className="ks-card-header">
          <h2 className="ks-card-title">
            <HelpCircle size={20} color="#38BDF8" />
            <span>Help, Support & Legal Documentation</span>
          </h2>
          <p className="ks-card-desc">
            Access our compliance terms, transparency statements, and official customer assistance channels.
          </p>
        </div>

        {/* Support Highlights Banner */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22FF88]/10 text-[#22FF88] border border-[#22FF88]/20 shrink-0">
              <MessageSquare size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Need Dedicated Assistance?</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Our support team typically responds to tickets in under 24 hours.
              </p>
            </div>
          </div>

          <a
            href={`${BASE_URL}contact-us.html`}
            className="shrink-0 rounded-xl bg-gradient-to-r from-[#22FF88] to-[#38BDF8] px-5 py-2.5 text-xs font-black text-black hover:opacity-90 transition"
          >
            Get Help Now
          </a>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {LEGAL_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 transition-all hover:border-white/20"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                        border: `1px solid ${item.color}30`
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#22FF88] transition">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    {item.desc}
                  </p>
                </div>

                <a
                  href={item.url}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#38BDF8] hover:text-white transition"
                >
                  <span>{item.action}</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
