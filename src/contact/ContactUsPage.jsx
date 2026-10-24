import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  Mail,
  Send,
  Loader2,
  ArrowRight,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Headphones,
  Zap,
  Lock,
  Cpu,
  Handshake,
  MessageSquare,
  X,
  UserCheck
} from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { BASE_URL } from "../auth/auth.js";
import Navbar from "../deals/components/Navbar.jsx";
import KxFaq from "../components/KxFaq.jsx";
import { ReadingProgressBar, useThemeSync } from "../lib/pageEffects.jsx";
import { applyTheme, getStoredTheme, getStoredAccent } from "../lib/theme.js";

// Page Stylesheets
import "../deals/tailwind-generated.css";
import "../styles/kx-tokens.css";
import "../styles/kx-motion.css";
import "../styles/kx-pages.css";
import "../styles/kx-faq.css";
import "./contact-page.css";

/* ==========================================================================
   CENTRALIZED CONTACT CONFIGURATION
   Edit stats, typing lines, topics, channels, and FAQs in ONE place.
   ========================================================================== */
/* ==========================================================================
   CENTRALIZED STATS CONFIGURATION (One config object for all 4 stats)
   ========================================================================== */
export const STATS_SECTION_CONFIG = {
  header: {
    pill: "Trusted by shoppers",
    titlePrefix: "Support you can ",
    titleGradient: "count on",
    subtitle: "Real metrics from our active deal verification and customer helpdesk."
  },
  bannerImage: {
    enabled: true,
    src: "contact/contact_supp_cropped.png",
    alt: "KSAM Deal customer support specialists assisting shoppers",
    chip: "Real people, real help",
    caption: "Human-verified discounts from trusted retail partners."
  },
  items: [
    {
      id: "support",
      value: 24,
      displayRaw: "24/7",
      prefix: "",
      suffix: "/7",
      label: "Support Coverage",
      caption: "Always online",
      tone: "green",
      isCountUp: false,
      visualType: "dots",
      iconType: "clock"
    },
    {
      id: "reply",
      value: 24,
      displayRaw: "< 24h",
      prefix: "< ",
      suffix: "h",
      label: "Average Reply Time",
      caption: "Fast answers",
      tone: "cyan",
      isCountUp: true,
      visualType: "bar",
      barPercent: 85,
      iconType: "lightning"
    },
    {
      id: "satisfaction",
      value: 98,
      displayRaw: "98%",
      prefix: "",
      suffix: "%",
      label: "Happy Shoppers",
      caption: "Based on feedback",
      tone: "violet",
      isCountUp: true,
      visualType: "gauge",
      gaugePercent: 98,
      iconType: "smile"
    },
    {
      id: "deals",
      value: 10,
      displayRaw: "10K+",
      prefix: "",
      suffix: "K+",
      label: "Deals Verified Daily",
      caption: "Checked every day",
      tone: "blue",
      isCountUp: true,
      visualType: "sparkline",
      iconType: "badge"
    }
  ]
};

// Inline SVG Icon Renderer (Compact, crisp vectors sized for 38-42px tiles)
function renderStatIcon(type) {
  switch (type) {
    case "clock":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "lightning":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "smile":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
          <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
        </svg>
      );
    case "badge":
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
  }
}

export const CONTACT_PAGE_CONFIG = {
  // Configured statistics section
  statsSection: STATS_SECTION_CONFIG,
  stats: STATS_SECTION_CONFIG.items,

  // Animated cycling questions in hero
  typingPhrases: [
    "Questions about a deal?",
    "Need help with your account?",
    "Want to report a wrong price?",
    "Spotted an expired discount?",
    "Looking for merchant partnerships?"
  ],

  // Marquee topic chips (scrolling in opposite directions)
  marqueeRows: {
    row1: [
      "Price Mismatch",
      "Deal Expired",
      "Account & Login Support",
      "Price Alerts & Wishlist",
      "Store Link Issue",
      "Report a Bug"
    ],
    row2: [
      "Affiliate or Business Partnership",
      "Feature Request",
      "Order Tracking Note",
      "Store Integration",
      "Voucher Code Issue",
      "General Feedback"
    ]
  },

  // Support Channels with policies & contact specifics
  channels: [
    {
      id: "general",
      title: "General Inquiries & Email",
      desc: "Fast support for deal questions, store redirections, and account help.",
      value: "support@ksamdeal.in",
      actionText: "Send Email",
      actionUrl: "mailto:support@ksamdeal.in",
      responseTime: "< 24h Response",
      icon: Mail,
      canCopy: true,
      details: {
        contact: "support@ksamdeal.in",
        hours: "Monday – Saturday, 9:00 AM – 7:00 PM IST",
        scope: "Deal verification, store link corrections, and account inquiries.",
        policy: "Emails are answered in the order received. Providing the deal URL or store name ensures faster turnaround."
      }
    },
    {
      id: "technical",
      title: "Technical Support",
      desc: "Assistance with price alert notifications, wishlist sync, and platform bugs.",
      value: "tech@ksamdeal.in", // [PLACEHOLDER - edit if separate tech address is used]
      actionText: "Email Tech Desk",
      actionUrl: "mailto:support@ksamdeal.in?subject=Technical%20Support",
      responseTime: "Same Day",
      icon: Cpu,
      canCopy: true,
      details: {
        contact: "tech@ksamdeal.in (or support@ksamdeal.in)",
        hours: "Monday – Friday, 10:00 AM – 6:00 PM IST",
        scope: "Alert thresholds, website errors, display bugs, and browser issues.",
        policy: "Critical site issues are escalated immediately to on-call engineering."
      }
    },
    {
      id: "partnerships",
      title: "Partnerships & Brands",
      desc: "Merchant feed onboarding, affiliate integration, and verified collaborations.",
      value: "partners@ksamdeal.in", // [PLACEHOLDER - edit if separate partner address is used]
      actionText: "Partner Inquiries",
      actionUrl: "mailto:support@ksamdeal.in?subject=Partnership%20Inquiry",
      responseTime: "1–2 Days",
      icon: Handshake,
      canCopy: true,
      details: {
        contact: "partners@ksamdeal.in (or support@ksamdeal.in)",
        hours: "Monday – Friday, 10:00 AM – 6:00 PM IST",
        scope: "Retail partner feeds, direct coupons, and affiliate partnerships.",
        policy: "We partner strictly with verified retailers offering legitimate consumer savings."
      }
    },
    {
      id: "hours",
      title: "Operating Hours & Helpdesk",
      desc: "Our human support team reviews and replies during standard working hours.",
      value: "Mon–Sat, 9AM–7PM IST",
      actionText: "Send Message Below",
      actionUrl: "#contact-form-section",
      responseTime: "Live IST",
      icon: Clock,
      canCopy: false,
      details: {
        contact: "Operating Hours: Monday – Saturday, 9:00 AM – 7:00 PM IST",
        hours: "Automated alert infrastructure runs 24/7/365 without interruption.",
        scope: "Support operations covering user assistance, deal moderation, and queries.",
        policy: "Inquiries submitted after hours or on Sunday are prioritized first thing next business morning."
      }
    }
  ],

  // FAQ Accordion Data (Numbered headings & highlighted note box matching terms.html Image 2)
  faqs: [
    {
      id: "deal-pricing",
      q: "How accurate are the deal prices shown on KSAM Deal?",
      tone: "green-blue",
      lead: "Our automated scrapers and price verification engines track listings from top retailers (Amazon India, Flipkart, Myntra, etc.) multiple times a day.",
      noteLabel: "Price Accuracy Notice",
      note: "E-commerce stores frequently adjust prices and promotional vouchers. We recommend verifying the final checkout total on the merchant site."
    },
    {
      id: "non-seller-status",
      q: "Does KSAM Deal sell products directly or handle order shipments?",
      tone: "blue-purple",
      lead: "No. KSAM Deal is an independent deal-discovery platform and smart shopping aggregator.",
      noteLabel: "Non-Seller Status",
      note: "When you click 'Buy on Store' or 'View Deal', you are redirected to the external retailer. That retailer handles payment processing, packaging, shipping, warranty, and returns."
    },
    {
      id: "price-alerts",
      q: "How do Price Alerts and Wishlist notifications work?",
      tone: "yellow-green",
      lead: "When you save an item and set a target price in your account, our monitors check that product's current price regularly.",
      noteLabel: "Automated Triggers",
      note: "The moment the verified price dips below your chosen threshold, we trigger an alert notification directly to your account."
    },
    {
      id: "response-times",
      q: "What is the typical response time when I send a message?",
      tone: "purple-pink",
      lead: "Our customer team typically answers within 24 business hours.",
      noteLabel: "Moderation Queue",
      note: "If you submit a report regarding an expired deal or a price mismatch, our moderation queue usually updates the listing same-day."
    },
    {
      id: "account-control",
      q: "How can I update my account information or remove my data?",
      tone: "green-purple",
      lead: "You have full control over your data directly within the platform.",
      noteLabel: "Data Rights & DPDP Act",
      note: "Visit the Profile Hub to update your display name, email, delivery addresses, and alert settings. You can also permanently delete your account and personal records at any time."
    }
  ]
};

// Form Subject Options
const SUBJECTS = [
  "Deal Inquiry or Price Discrepancy",
  "Price Mismatch",
  "Deal Expired",
  "Account & Login Support",
  "Price Alerts & Wishlist",
  "Store Link Issue",
  "Report a Bug",
  "Affiliate or Business Partnership",
  "Feature Request",
  "Other"
];

// Tone rotation for automatic coloring
const TONES_CYCLE = ["green-blue", "blue-purple", "yellow-green", "purple-pink", "green-purple"];

export function ContactUsPage() {
  const [session, setSession] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: SUBJECTS[0],
    message: "",
    website: "" // Hidden honeypot
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({});
  const [toastMsg, setToastMsg] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);

  // Stats Count-Up State (Accessible, fallback to final numbers)
  const [statsVisible, setStatsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({ reply: 24, satisfaction: 98, deals: 10 });
  const statsRef = useRef(null);

  // Typing effect state
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Image load fallback states
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [agentImgFailed, setAgentImgFailed] = useState(false);
  const [teamImgFailed, setTeamImgFailed] = useState(false);
  const [statsBannerFailed, setStatsBannerFailed] = useState(false);
  const [ctaImgFailed, setCtaImgFailed] = useState(false);

  useThemeSync();

  useEffect(() => {
    applyTheme(getStoredTheme(), getStoredAccent());
  }, []);

  // Fetch Supabase session to pre-fill authenticated user info
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        setSession(data.session);
        const u = data.session.user;
        setFormData((prev) => ({
          ...prev,
          name: u.user_metadata?.full_name || u.user_metadata?.name || prev.name,
          email: u.email || prev.email
        }));
      }
    });
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Toast auto-hide
  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(""), 2800);
    return () => clearTimeout(t);
  }, [toastMsg]);

  // Typing effect animation loop
  useEffect(() => {
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReducedMotion) {
      setCurrentText(CONTACT_PAGE_CONFIG.typingPhrases[0]);
      return;
    }

    const fullPhrase = CONTACT_PAGE_CONFIG.typingPhrases[currentPhraseIndex];
    let speed = isDeleting ? 40 : 80;

    if (!isDeleting && currentText === fullPhrase) {
      const pauseTimer = setTimeout(() => setIsDeleting(true), 1800);
      return () => clearTimeout(pauseTimer);
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setCurrentPhraseIndex((prev) => (prev + 1) % CONTACT_PAGE_CONFIG.typingPhrases.length);
      return;
    }

    const typeTimer = setTimeout(() => {
      setCurrentText(
        isDeleting
          ? fullPhrase.substring(0, currentText.length - 1)
          : fullPhrase.substring(0, currentText.length + 1)
      );
    }, speed);

    return () => clearTimeout(typeTimer);
  }, [currentText, isDeleting, currentPhraseIndex]);

  // IntersectionObserver for Stats Strip count-up
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Animate stats numbers once visible (ease-out expo, 1.6s)
  useEffect(() => {
    if (!statsVisible) return;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) {
      setAnimatedStats({ reply: 24, satisfaction: 98, deals: 10 });
      return;
    }

    // Start from 0 on first intersection and smoothly ease up to targets
    setAnimatedStats({ reply: 0, satisfaction: 0, deals: 0 });
    const duration = 1600;
    const startTime = performance.now();

    const frame = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      // Ease out expo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setAnimatedStats({
        reply: Math.round(24 * ease),
        satisfaction: Math.round(98 * ease),
        deals: Math.round(10 * ease)
      });

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  }, [statsVisible]);

  // Build FAQ items for KxFaq matching terms.html Image 2 with auto-generated numbering & callouts
  const faqItems = useMemo(() => {
    return CONTACT_PAGE_CONFIG.faqs.map((faq, idx) => {
      const num = String(idx + 1).padStart(2, "0");
      const questionText = `${num} — ${faq.q.replace(/^\d{1,2}\s*[-—]\s*/, "")}`;
      const tone = faq.tone || TONES_CYCLE[idx % TONES_CYCLE.length];

      return {
        id: faq.id || `faq-${idx + 1}`,
        question: questionText,
        tone: tone,
        answer: (
          <div className="space-y-4">
            <p>{faq.lead || faq.a}</p>
            {faq.note && (
              <div className="kx-callout-block" data-tone={tone}>
                <p className="text-xs sm:text-sm leading-relaxed m-0">
                  <strong className="text-[var(--kx-text,#ffffff)] mr-1.5">
                    {faq.noteLabel || "Notice"}:
                  </strong>
                  {faq.note}
                </p>
              </div>
            )}
          </div>
        )
      };
    });
  }, []);

  // Copy to clipboard helper
  const handleCopy = (text, label) => {
    try {
      navigator.clipboard.writeText(text);
      setToastMsg(`Copied ${label} to clipboard!`);
    } catch (e) {
      setToastMsg(`Copied: ${text}`);
    }
  };

  // Form input change handlers
  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (error) setError("");
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Topic chip click handler: scrolls to form and preselects subject
  const handleTopicSelect = (topic) => {
    const matched = SUBJECTS.find((s) => s.toLowerCase() === topic.toLowerCase()) || topic;
    if (!SUBJECTS.includes(matched)) {
      setFormData((prev) => ({ ...prev, subject: "Other", message: `[Topic: ${topic}]\n${prev.message}` }));
    } else {
      setFormData((prev) => ({ ...prev, subject: matched }));
    }

    const formEl = document.getElementById("contact-form-section");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
    setToastMsg(`Topic selected: ${topic}`);
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Hidden honeypot check
    if (formData.website) {
      setSubmitted(true);
      return;
    }

    if (cooldown > 0) return;

    const name = formData.name.trim();
    const email = formData.email.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (name.length < 2 || name.length > 80) {
      setError("Name must be between 2 and 80 characters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (subject.length < 3 || subject.length > 120) {
      setError("Subject must be between 3 and 120 characters.");
      return;
    }
    if (message.length < 10 || message.length > 2000) {
      setError("Message must be between 10 and 2000 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        name,
        email,
        subject,
        message,
        user_id: session?.user?.id || null
      };

      const { error: insertErr } = await supabase
        .from("contact_messages")
        .insert(payload);

      if (insertErr) {
        console.error("Supabase error inserting message:", insertErr);
        setError("Failed to send message. Please try again shortly.");
      } else {
        setSubmitted(true);
        setCooldown(30);
      }
    } catch (err) {
      console.error("Unexpected error submitting form:", err);
      setError("A network error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const msgLen = formData.message.length;

  return (
    <div className="ct-page kx-page min-h-screen relative flex flex-col justify-between">
      {/* Top Green Reading Progress Bar */}
      <ReadingProgressBar />

      {/* Global Header / Navbar */}
      <Navbar />

      {/* Ambient Moving Gradient Blobs Backdrop */}
      <div className="ct-ambient-backdrop" aria-hidden="true">
        <div className="ct-blob ct-blob-1" />
        <div className="ct-blob ct-blob-2" />
        <div className="ct-blob ct-blob-3" />
        <div className="ct-grid-overlay" />
      </div>

      <main className="ct-container">
        {/* ==================================================================
            1. HERO SECTION (Inspired by Image 4 Layout)
            ================================================================== */}
        <section className="ct-hero-section">
          <div className="ct-hero-grid">
            {/* Left: Illustration with Floating Chips */}
            <div className="ct-hero-visual">
              <div className="ct-hero-blob-stage">
                {!heroImgFailed ? (
                  <img
                    src={`${import.meta.env.BASE_URL}contact/hero-illustration-opt.jpg`}
                    alt="Customer support, messaging, and deal assistance illustration"
                    width="440"
                    height="440"
                    loading="eager"
                    className="ct-hero-img"
                    onError={() => setHeroImgFailed(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-[#0c1b33] to-[#04210f] rounded-3xl border border-white/10">
                    <Headphones size={54} className="text-[#34f5a1] mb-3" />
                    <h3 className="text-xl font-bold text-white mb-1">Direct Support</h3>
                    <p className="text-xs text-[#9ca3af]">We're here to assist you with every deal</p>
                  </div>
                )}

                {/* Floating Satellite Chips */}
                <div className="ct-floating-chip ct-chip-1">
                  <MessageSquare size={14} className="text-[#34f5a1]" />
                  <span>Live Chat</span>
                </div>
                <div className="ct-floating-chip ct-chip-2">
                  <Mail size={14} className="text-[#38bdf8]" />
                  <span>Instant Reply</span>
                </div>
                <div className="ct-floating-chip ct-chip-3">
                  <Clock size={14} className="text-[#a78bfa]" />
                  <span>24/7 Coverage</span>
                </div>
                <div className="ct-floating-chip ct-chip-4">
                  <ShieldCheck size={14} className="text-[#34f5a1]" />
                  <span>Verified Deals</span>
                </div>
              </div>
            </div>

            {/* Right: Hero Messaging & Call to Action */}
            <div className="ct-hero-content">
              <div>
                <span className="ct-pill-badge mb-3">
                  <span className="ct-pulsing-dot" />
                  We're here to help
                </span>
              </div>

              <h1 className="ct-hero-title">
                Let's start a{" "}
                <span className="ct-heading-gradient">conversation.</span>
              </h1>

              {/* Typing Effect Cycling Questions */}
              <div className="ct-typing-wrap" aria-live="polite">
                <span>{currentText}</span>
                <span className="ct-cursor" aria-hidden="true" />
              </div>

              <p className="ct-hero-desc">
                Have an inquiry about a price drop, store redirection, or need help with your account? Our team reviews every request promptly and delivers real assistance.
              </p>

              <div className="ct-hero-actions">
                <a
                  href="#contact-form-section"
                  className="ct-btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("contact-form-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Send size={16} />
                  <span>Send a Message</span>
                </a>
                <a
                  href="#support-channels"
                  className="ct-btn-glass"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("support-channels")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Headphones size={16} />
                  <span>View Support Channels</span>
                </a>
              </div>

              {/* Row of Glass Trust Chips */}
              <div className="ct-hero-trust">
                <span className="ct-trust-chip">
                  <ShieldCheck size={14} /> 24/7 Monitoring
                </span>
                <span className="ct-trust-chip">
                  <Zap size={14} /> Fast Replies
                </span>
                <span className="ct-trust-chip">
                  <Lock size={14} /> Privacy First
                </span>
                <span className="ct-trust-chip">
                  <UserCheck size={14} /> Real Human Team
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            2. LIVE STATS SECTION (Dynamic 4 Glass Cards & Companion Visuals)
            ================================================================== */}
        <section ref={statsRef} className="ct-stats-section" aria-label="Support statistics">
          {/* Ambient Blurred Background Blobs */}
          <div className="ct-stats-ambient" aria-hidden="true">
            <div className="ct-stats-blob ct-stats-blob-green" />
            <div className="ct-stats-blob ct-stats-blob-cyan" />
            <div className="ct-stats-blob ct-stats-blob-violet" />
          </div>

          {/* Section Header: Pill, Title with Gradient Words, Shimmer Line, Subtitle */}
          <div className="ct-stats-header">
            <div className="ct-stats-pill">
              <span className="ct-pulsing-dot" aria-hidden="true" />
              <span>{STATS_SECTION_CONFIG.header.pill}</span>
            </div>
            <h2 className="ct-stats-title">
              {STATS_SECTION_CONFIG.header.titlePrefix}
              <span className="ct-heading-gradient">
                {STATS_SECTION_CONFIG.header.titleGradient}
              </span>
            </h2>
            <div className="ct-stats-line-wrap" aria-hidden="true">
              <div className="ct-stats-gradient-line" />
            </div>
            <p className="ct-stats-subtitle">
              {STATS_SECTION_CONFIG.header.subtitle}
            </p>
          </div>

          {/* 4 Separate Glass Cards in One Row */}
          <div className="ct-stats-grid">
            {STATS_SECTION_CONFIG.items.map((st) => {
              let displayVal = st.value;
              if (st.isCountUp) {
                if (statsVisible) {
                  if (st.id === "reply") displayVal = animatedStats.reply;
                  if (st.id === "satisfaction") displayVal = animatedStats.satisfaction;
                  if (st.id === "deals") displayVal = animatedStats.deals;
                }
              }

              return (
                <div key={st.id} className="ct-stats-card" data-tone={st.tone}>
                  {/* Card Top: Circular Gradient Icon Tile (Clean, debug tag pill removed) */}
                  <div className="ct-stats-card-top">
                    <div className="ct-stats-icon-tile">
                      {renderStatIcon(st.iconType)}
                    </div>
                  </div>

                  {/* Card Body: Number, Label, and Caption */}
                  <div className="ct-stats-card-body">
                    <div className="ct-stats-number">
                      <span className="ct-stats-number-grad">
                        {st.prefix || ""}{displayVal}{st.suffix || ""}
                      </span>
                    </div>
                    <div className="ct-stats-card-label">{st.label}</div>
                    {st.caption && (
                      <div className="ct-stats-card-caption">{st.caption}</div>
                    )}
                  </div>

                  {/* Card Bottom Mini Visual */}
                  <div className="ct-stats-visual-wrap">
                    {st.visualType === "dots" && (
                      <div className="st-dots-row" aria-label="7 days active support">
                        {[...Array(7)].map((_, i) => (
                          <span
                            key={i}
                            className={`st-dot ${statsVisible ? "st-dot-active" : ""}`}
                            style={{ animationDelay: `${i * 150}ms` }}
                          />
                        ))}
                      </div>
                    )}

                    {st.visualType === "bar" && (
                      <div className="st-bar-track" aria-label="Response velocity">
                        <div
                          className="st-bar-fill"
                          style={{ width: statsVisible ? `${st.barPercent || 85}%` : "0%" }}
                        />
                      </div>
                    )}

                    {st.visualType === "gauge" && (
                      <div className="st-gauge-track" aria-label="Satisfaction level">
                        <div
                          className="st-gauge-fill"
                          style={{ width: statsVisible ? `${st.gaugePercent || 98}%` : "0%" }}
                        />
                      </div>
                    )}

                    {st.visualType === "sparkline" && (
                      <svg className="st-sparkline" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
                        <defs>
                          <linearGradient id={`st-spark-grad-${st.id}`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#34f5a1" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 2 18 Q 20 20, 35 11 T 65 14 T 98 4"
                          fill="none"
                          stroke={`url(#st-spark-grad-${st.id})`}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          className={`st-spark-path ${statsVisible ? "st-spark-animated" : ""}`}
                        />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full-Width Responsive Banner: Proportional Scaling, No Cropping */}
          {STATS_SECTION_CONFIG.bannerImage?.enabled && (
            <div className="ct-stats-banner-wrap">
              <div className="ct-stats-banner">
                <div className="ct-stats-banner-stage">
                  {!statsBannerFailed ? (
                    <img
                      src={`${import.meta.env.BASE_URL}${STATS_SECTION_CONFIG.bannerImage.src}`}
                      alt={STATS_SECTION_CONFIG.bannerImage.alt}
                      width="2172"
                      height="374"
                      loading="lazy"
                      className="ct-stats-banner-img"
                      onError={() => setStatsBannerFailed(true)}
                    />
                  ) : (
                    <div className="ct-stats-banner-fallback" />
                  )}
                  <div className="ct-stats-banner-overlay" />
                </div>

                <div className="ct-stats-banner-content">
                  <div className="ct-stats-banner-chip">
                    <Sparkles size={14} className="text-[#34f5a1]" />
                    <span>{STATS_SECTION_CONFIG.bannerImage.chip}</span>
                  </div>
                  <div className="ct-stats-banner-panel">
                    <p className="ct-stats-banner-caption">
                      {STATS_SECTION_CONFIG.bannerImage.caption}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ==================================================================
            3. SUPPORT TOPICS MARQUEE (Continuous Opposite Direction Scroll)
            ================================================================== */}
        <section className="ct-marquee-section" aria-label="Support topics">
          <div className="ct-marquee-box">
            <div className="ct-marquee-fade-left" aria-hidden="true" />
            <div className="ct-marquee-fade-right" aria-hidden="true" />

            {/* Row 1: Left to Right */}
            <div className="ct-marquee-row">
              <div className="ct-marquee-track">
                {[...CONTACT_PAGE_CONFIG.marqueeRows.row1, ...CONTACT_PAGE_CONFIG.marqueeRows.row1].map((topic, idx) => (
                  <button
                    key={`r1-${idx}`}
                    type="button"
                    onClick={() => handleTopicSelect(topic)}
                    className="ct-topic-chip"
                    title={`Click to pre-fill: ${topic}`}
                  >
                    <span>{topic}</span>
                    <ArrowRight size={13} className="text-[#34f5a1] opacity-70" />
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Right to Left (Reverse) */}
            <div className="ct-marquee-row">
              <div className="ct-marquee-track reverse">
                {[...CONTACT_PAGE_CONFIG.marqueeRows.row2, ...CONTACT_PAGE_CONFIG.marqueeRows.row2].map((topic, idx) => (
                  <button
                    key={`r2-${idx}`}
                    type="button"
                    onClick={() => handleTopicSelect(topic)}
                    className="ct-topic-chip"
                    title={`Click to pre-fill: ${topic}`}
                  >
                    <span>{topic}</span>
                    <ArrowRight size={13} className="text-[#38bdf8] opacity-70" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            4. SUPPORT CHANNELS (Grid with Details Modal / Expandable)
            ================================================================== */}
        <section id="support-channels" className="ct-channels-section">
          <div className="ct-section-header">
            <span className="ct-pill-badge mb-2">Direct Contact</span>
            <h2 className="ct-section-title">Support Channels</h2>
            <p className="ct-section-subtitle">
              Click any channel to view contact specifics, operating hours, and response policies.
            </p>
          </div>

          <div className="ct-channels-grid">
            {CONTACT_PAGE_CONFIG.channels.map((ch) => {
              const IconComp = ch.icon;
              return (
                <div
                  key={ch.id}
                  className="ct-channel-card"
                  onClick={() => setSelectedChannel(ch)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedChannel(ch);
                    }
                  }}
                >
                  <div>
                    <div className="ct-channel-card-top mb-4">
                      <div className="ct-channel-icon-tile">
                        <IconComp size={22} />
                      </div>
                      <span className="ct-channel-badge">{ch.responseTime}</span>
                    </div>

                    <div className="ct-channel-info">
                      <h3>{ch.title}</h3>
                      <p>{ch.desc}</p>
                    </div>
                  </div>

                  <div className="ct-channel-actions">
                    <span className="ct-channel-value">{ch.value}</span>
                    {ch.canCopy && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(ch.value, ch.title);
                        }}
                        className="ct-copy-btn"
                        title="Copy to clipboard"
                      >
                        <Copy size={13} />
                        <span>Copy</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==================================================================
            5. CONTACT FORM & HELP AGENT SECTION (IMAGE 2)
            ================================================================== */}
        <section id="contact-form-section" className="ct-form-section">
          <div className="ct-form-grid">
            {/* Left Column: Contact Form */}
            <div className="ct-form-card">
              <div className="ct-form-header">
                <span className="ct-pill-badge mb-2">Send a ticket</span>
                <h2>Direct Message</h2>
                <p>Fill out the form below. We usually review and respond within 24 hours.</p>
              </div>

              {submitted ? (
                <div className="ct-success-card">
                  <div className="ct-success-icon-wrap">
                    <CheckCircle2 size={38} strokeWidth={2.5} />
                  </div>
                  <h3>Message Sent!</h3>
                  <p>
                    Thank you for contacting KSAM Deal. We have received your details and our support team will reply within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData((prev) => ({
                        ...prev,
                        subject: SUBJECTS[0],
                        message: ""
                      }));
                    }}
                    className="ct-btn-primary"
                  >
                    <span>Send Another Message</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {/* Hidden Spam Honeypot */}
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{ display: "none" }}
                  />

                  {/* Full Name */}
                  <div className="ct-field-group">
                    <label htmlFor="ct-name" className="ct-field-label">
                      Full Name <span className="text-[#34f5a1]">*</span>
                    </label>
                    <input
                      id="ct-name"
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      placeholder="e.g. Abhay Chauhan"
                      className="ct-input"
                    />
                    {touched.name && formData.name.trim().length < 2 && (
                      <div className="ct-field-error">
                        Please enter your name (at least 2 characters).
                      </div>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="ct-field-group">
                    <label htmlFor="ct-email" className="ct-field-label">
                      Email Address <span className="text-[#34f5a1]">*</span>
                    </label>
                    <input
                      id="ct-email"
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder="you@example.com"
                      className="ct-input"
                    />
                    {touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                      <div className="ct-field-error">
                        Please enter a valid email address.
                      </div>
                    )}
                  </div>

                  {/* Subject Dropdown */}
                  <div className="ct-field-group">
                    <label htmlFor="ct-subject" className="ct-field-label">
                      Inquiry Topic
                    </label>
                    <select
                      id="ct-subject"
                      name="subject"
                      value={formData.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      className="ct-select"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div className="ct-field-group">
                    <label htmlFor="ct-message" className="ct-field-label">
                      Message <span className="text-[#34f5a1]">*</span>
                    </label>
                    <textarea
                      id="ct-message"
                      name="message"
                      rows={5}
                      maxLength={2000}
                      required
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      onBlur={() => handleBlur("message")}
                      placeholder="Tell us what you need help with (deal link, problem description, or inquiry)..."
                      className="ct-textarea"
                    />
                    <div className="ct-char-row">
                      <span>Minimum 10 characters</span>
                      <span className={msgLen > 1900 ? "text-[#ff8a80] font-bold" : ""}>
                        {msgLen} / 2000
                      </span>
                    </div>
                    {touched.message && formData.message.trim().length < 10 && (
                      <div className="ct-field-error">
                        Message must be at least 10 characters long.
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 mb-4 rounded-xl bg-red-950/40 border border-red-500/30 text-[#ff8a80] text-sm font-semibold">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || cooldown > 0}
                    className="ct-submit-btn"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Sending message...</span>
                      </>
                    ) : cooldown > 0 ? (
                      <span>Please wait ({cooldown}s)</span>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Help Agent Photo (IMAGE 2) with Floating Card */}
            <div className="ct-agent-visual-wrap">
              <div className="ct-agent-frame">
                {!agentImgFailed ? (
                  <img
                    src={`${import.meta.env.BASE_URL}contact/help-agent-opt.jpg`}
                    alt="KSAM Deal customer support specialist assisting shopper"
                    width="600"
                    height="700"
                    loading="lazy"
                    className="ct-agent-img"
                    onError={() => setAgentImgFailed(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-tr from-[#060913] to-[#0e2a38]">
                    <Headphones size={60} className="text-[#34f5a1] mb-4" />
                    <h3 className="text-2xl font-black text-white">Dedicated Support</h3>
                    <p className="text-sm text-[#9ca3af] text-center max-w-sm mt-2">
                      Real people, real help. We make sure every deal is genuine and verified.
                    </p>
                  </div>
                )}

                <div className="ct-agent-overlay" />

                <div className="ct-agent-floating-card">
                  <h4>
                    <Sparkles size={16} className="text-[#34f5a1]" />
                    Real people, real help
                  </h4>
                  <p>
                    Every inquiry is reviewed by our deal research team, not outsourced bots.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            6. OUR TEAM / OUR PROMISE SECTION (IMAGE 3)
            ================================================================== */}
        <section className="ct-team-section">
          <div className="ct-team-banner">
            {!teamImgFailed ? (
              <img
                src={`${import.meta.env.BASE_URL}contact/team-office-opt.jpg`}
                alt="KSAM Deal modern operations and engineering team office"
                width="1600"
                height="800"
                loading="lazy"
                className="ct-team-bg-img"
                onError={() => setTeamImgFailed(true)}
              />
            ) : (
              <div className="w-full h-full absolute inset-0 bg-gradient-to-r from-[#060913] via-[#0b1230] to-[#1a1146]" />
            )}

            <div className="ct-team-scrim" />

            <div className="ct-team-content-card">
              <span className="ct-pill-badge mb-3">Our Core Commitment</span>
              <h2>
                Built by deal hunters,{" "}
                <span className="ct-heading-gradient">for shoppers.</span>
              </h2>
              <p className="lead">
                We scour the Indian e-commerce landscape to bring you authentic discounts without misleading markups or hidden affiliate tricks.
              </p>

              <div className="ct-promise-grid">
                <div className="ct-promise-item">
                  <div className="ct-promise-icon">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h4>Fast response</h4>
                    <p>&lt; 24h average ticket reply time</p>
                  </div>
                </div>

                <div className="ct-promise-item">
                  <div className="ct-promise-icon">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4>Honest help</h4>
                    <p>Transparent deal verification</p>
                  </div>
                </div>

                <div className="ct-promise-item">
                  <div className="ct-promise-icon">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h4>Data stays private</h4>
                    <p>Compliant with DPDP Act 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            7. FAQ ACCORDION SECTION (Matched to terms.html Image 2)
            ================================================================== */}
        <section className="ct-faq-section" aria-label="Frequently Asked Questions">
          <div className="ct-faq-container">
            <div className="ct-section-header text-center mb-8">
              <span className="ct-pill-badge mb-2">Common Inquiries</span>
              <h2 className="ct-section-title">Frequently Asked Questions</h2>
              <p className="ct-section-subtitle mx-auto">
                Quick answers on deal accuracy, store connections, and reaching our desk.
              </p>
            </div>

            {/* Reused accordion component from terms.html with auto-numbering, tone cycle, and note callouts */}
            <KxFaq
              items={faqItems}
              defaultOpen={faqItems[0]?.id}
              allowMultiple={false}
              showControls={true}
            />
          </div>
        </section>

        {/* ==================================================================
            8. FINAL CALL TO ACTION (Illustrated Full-Width Banner with newcontact.png)
            ================================================================== */}
        <section className="ct-cta-section" aria-label="Direct support action">
          <div className="ct-cta-card">
            <div className="ct-cta-stage">
              {!ctaImgFailed ? (
                <img
                  src={`${import.meta.env.BASE_URL}contact/newcontact.png`}
                  alt="KSAM Deal Customer Support"
                  width="2172"
                  height="724"
                  loading="eager"
                  className="ct-cta-img"
                  onError={() => setCtaImgFailed(true)}
                />
              ) : (
                <div className="ct-cta-img-fallback" />
              )}

              {/* Single Content Layer: Overlay on desktop & tablet, flow below on mobile */}
              <div className="ct-cta-content-panel">
                {/* 1. Pill: Contact Support with Headset icon */}
                <div className="ct-cta-pill">
                  <Headphones className="ct-cta-pill-icon" size={14} />
                  <span className="ct-cta-pill-contact">Contact</span>
                  <span className="ct-cta-pill-support">Support</span>
                </div>

                {/* 2. Heading: Line 1 in dark navy, Line 2 in blue-to-green gradient */}
                <h2 className="ct-cta-heading">
                  <span className="ct-cta-heading-line1">Still have a question?</span>
                  <span className="ct-cta-heading-line2">We're all ears.</span>
                </h2>

                {/* 3. Paragraph */}
                <p className="ct-cta-desc">
                  Whether you spotted a broken store link, want to suggest an improvement, or explore a partnership, our team is ready to help.
                </p>

                {/* 4. Button: Reach Out Now */}
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("contact-form-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="ct-cta-btn"
                  aria-label="Reach Out Now"
                >
                  <Send className="ct-cta-btn-icon" size={16} />
                  <span>Reach Out Now</span>
                  <ArrowRight className="ct-cta-btn-icon" size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Detail Modal for Selected Channel */}
      {selectedChannel && (
        <div
          className="ct-modal-backdrop"
          onClick={() => setSelectedChannel(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="ct-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedChannel(null)}
              className="ct-modal-close-btn"
              aria-label="Close details"
            >
              <X size={18} />
            </button>

            <span className="ct-pill-badge mb-3">{selectedChannel.responseTime}</span>
            <h3 className="text-2xl font-black text-white mb-2">{selectedChannel.title}</h3>
            <p className="text-sm text-[#e5e7eb] mb-5 leading-relaxed">{selectedChannel.desc}</p>

            <div className="space-y-3 p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-xs">
              <div>
                <strong className="text-white block mb-0.5">Contact Point:</strong>
                <span className="text-[#34f5a1] font-bold text-sm">{selectedChannel.details.contact}</span>
              </div>
              <div>
                <strong className="text-white block mb-0.5">Operating Hours:</strong>
                <span className="text-[#9ca3af]">{selectedChannel.details.hours}</span>
              </div>
              <div>
                <strong className="text-white block mb-0.5">Coverage Scope:</strong>
                <span className="text-[#9ca3af]">{selectedChannel.details.scope}</span>
              </div>
              <div>
                <strong className="text-white block mb-0.5">Response Policy:</strong>
                <span className="text-[#9ca3af]">{selectedChannel.details.policy}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {selectedChannel.actionUrl.startsWith("#") ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedChannel(null);
                    document.getElementById("contact-form-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="ct-btn-primary w-full text-center"
                >
                  {selectedChannel.actionText}
                </button>
              ) : (
                <a
                  href={selectedChannel.actionUrl}
                  className="ct-btn-primary w-full text-center"
                >
                  {selectedChannel.actionText}
                </a>
              )}
              {selectedChannel.canCopy && (
                <button
                  type="button"
                  onClick={() => handleCopy(selectedChannel.value, selectedChannel.title)}
                  className="ct-btn-glass"
                >
                  <Copy size={16} />
                  <span>Copy</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Copied Toast */}
      {toastMsg && (
        <div className="ct-toast" role="status">
          <Check size={16} />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

const rootEl = document.getElementById("contact-us-root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <ContactUsPage />
    </React.StrictMode>
  );
}

export default ContactUsPage;
