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
  UserCheck,
  User,
  Phone,
  Tag,
  MapPin,
  Users,
  ChevronDown
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
    phone: "",
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

  // Video Background & Fallback States
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(() => typeof window !== "undefined" && window.innerWidth <= 767);
  const [disableVideo, setDisableVideo] = useState(() => {
    if (typeof window === "undefined") return false;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = navigator.connection;
    const isSaveData = Boolean(conn?.saveData);
    const isSlow = Boolean(conn?.effectiveType && (conn.effectiveType === "2g" || conn.effectiveType === "3g" || conn.effectiveType === "slow-2g"));
    return isReduced || isSaveData || isSlow;
  });
  const [agentImgFailed, setAgentImgFailed] = useState(false);
  const [teamImgFailed, setTeamImgFailed] = useState(false);
  const [statsBannerFailed, setStatsBannerFailed] = useState(false);
  const [ctaImgFailed, setCtaImgFailed] = useState(false);
  const [characterImgFailed, setCharacterImgFailed] = useState(false);
  const [plantImgFailed, setPlantImgFailed] = useState(false);

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

  // Screen resize listener for mobile video source selection
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 767);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Video Playback & Viewport/Tab Visibility Observer
  useEffect(() => {
    const heroEl = heroRef.current;
    const vid = videoRef.current;
    if (!heroEl || !vid || disableVideo) return;

    let isHeroInView = true;
    let isPageVisible = !document.hidden;

    const managePlayback = () => {
      if (isHeroInView && isPageVisible && !disableVideo) {
        const playPromise = vid.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            setVideoFailed(true);
          });
        }
      } else {
        vid.pause();
      }
    };

    const handleVisibility = () => {
      isPageVisible = !document.hidden;
      managePlayback();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isHeroInView = entry.isIntersecting;
        managePlayback();
      },
      { threshold: 0.05 }
    );

    observer.observe(heroEl);

    // Initial playback attempt
    managePlayback();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      observer.disconnect();
    };
  }, [disableVideo, isMobileScreen]);

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
    const phone = formData.phone?.trim() || "";
    const subject = formData.subject.trim();
    let message = formData.message.trim();

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

    if (phone) {
      message = `${message}\n\nPhone: ${phone}`;
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

      {/* ==================================================================
          1. HERO SECTION (Full-Hero Background Video Loop)
          ================================================================== */}
      <section className="ct-hero-section" ref={heroRef} id="contact-hero">
        {/* Full-Hero Background Video Layer */}
        <div className="ct-hero-bg-layer" aria-hidden="true">
          {disableVideo || videoFailed ? (
            <img
              src={`${import.meta.env.BASE_URL}videos/contact/hero_bg_poster.webp`}
              alt=""
              className="ct-hero-bg-poster"
              draggable="false"
            />
          ) : (
            <video
              ref={videoRef}
              key={isMobileScreen ? "mobile-bg-vid" : "desktop-bg-vid"}
              className="ct-hero-bg-video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={`${import.meta.env.BASE_URL}videos/contact/hero_bg_poster.webp`}
              aria-hidden="true"
              onError={() => setVideoFailed(true)}
            >
              <source
                src={
                  isMobileScreen
                    ? `${import.meta.env.BASE_URL}videos/contact/hero_bg_mobile.webm`
                    : `${import.meta.env.BASE_URL}videos/contact/hero_bg.webm`
                }
                type="video/webm"
              />
              <source
                src={
                  isMobileScreen
                    ? `${import.meta.env.BASE_URL}videos/contact/hero_bg_mobile.mp4`
                    : `${import.meta.env.BASE_URL}videos/contact/hero_bg.mp4`
                }
                type="video/mp4"
              />
            </video>
          )}

          {/* Edge Fade Radial Mask + Soft Vignette Overlay */}
          <div className="ct-hero-vignette" />

          {/* Text Readability Gradient Overlay */}
          <div className="ct-hero-readability-overlay" />
          <div className="ct-hero-overlay-top" />
          <div className="ct-hero-overlay-bottom" />
        </div>

        {/* Content Container - Hero Text on Left */}
        <div className="ct-hero-container">
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

      <main className="ct-container">

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
            5. DIRECT MESSAGE (REDESIGNED EXACTLY FROM IMAGE 2 - message.png)
            ================================================================== */}
        <section id="contact-form-section" className="ct-direct-message-section">
          <div className="ct-msg-frame">
            {/* LEFT PANEL: Light white & pale-blue gradient, blob shapes, character illustration */}
            <div className="ct-msg-left">
              {/* Subtle background curved wave SVG */}
              <div className="ct-msg-left-backdrop" aria-hidden="true">
                <svg className="ct-msg-wave-svg" viewBox="0 0 500 500" preserveAspectRatio="none">
                  <path d="M0,0 C150,90 350,-40 500,60 L500,500 L0,500 Z" fill="rgba(240, 246, 255, 0.6)" />
                  <path d="M0,120 C200,40 300,240 500,160 L500,500 L0,500 Z" fill="rgba(224, 237, 255, 0.45)" />
                </svg>
              </div>

              {/* Foreground blurred plant in bottom-left corner */}
              {!plantImgFailed && (
                <img
                  src={`${import.meta.env.BASE_URL}contact/message_plant.png`}
                  alt=""
                  width="240"
                  height="247"
                  loading="lazy"
                  className="ct-msg-corner-plant"
                  aria-hidden="true"
                  onError={() => setPlantImgFailed(true)}
                />
              )}

              {/* Character Illustration with Laptop, Mug, Plant, Desk, Bubbles, Paper Plane */}
              {!characterImgFailed ? (
                <div className="ct-msg-character-wrap" aria-hidden="true">
                  <img
                    src={`${import.meta.env.BASE_URL}contact/message_character.png`}
                    alt="Friendly KSAM Deal support specialist assisting shoppers"
                    width="505"
                    height="857"
                    loading="lazy"
                    className="ct-msg-character-img"
                    onError={() => setCharacterImgFailed(true)}
                  />
                </div>
              ) : (
                <div className="ct-msg-character-fallback" aria-hidden="true" />
              )}

              {/* Left Panel Content */}
              <div className="ct-msg-left-content">
                {/* 1. Top-left Pill */}
                <div className="ct-msg-pill">
                  <span className="ct-msg-pill-icon" aria-hidden="true">
                    <MessageSquare size={13} fill="#2563eb" color="#2563eb" />
                  </span>
                  <span>Contact Us</span>
                </div>

                {/* 2. Heading */}
                <h2 className="ct-msg-title">
                  We're Here
                  <br />
                  <span className="ct-msg-title-gradient">to Help!</span>
                  <span className="ct-msg-spark-tick" aria-hidden="true">
                    <span className="ct-tick-ray ct-tick-1" />
                    <span className="ct-tick-ray ct-tick-2" />
                    <span className="ct-tick-ray ct-tick-3" />
                  </span>
                </h2>

                {/* 3. Description Paragraph */}
                <p className="ct-msg-desc">
                  Have a question, suggestion, or partnership idea? Fill out the form and our team will get back to you as soon as possible.
                </p>

                {/* 4. Three Feature Rows */}
                <div className="ct-msg-features">
                  <div className="ct-msg-feature-item">
                    <div className="ct-msg-feat-icon ct-feat-blue">
                      <Send size={18} className="text-white" />
                    </div>
                    <div className="ct-msg-feat-text">
                      <strong className="ct-msg-feat-title">Quick Response</strong>
                      <span className="ct-msg-feat-sub">Usually within 24 hours</span>
                    </div>
                  </div>

                  <div className="ct-msg-feature-item">
                    <div className="ct-msg-feat-icon ct-feat-violet">
                      <ShieldCheck size={18} className="text-white" />
                    </div>
                    <div className="ct-msg-feat-text">
                      <strong className="ct-msg-feat-title">Reliable Support</strong>
                      <span className="ct-msg-feat-sub">Real People, Real Help</span>
                    </div>
                  </div>

                  <div className="ct-msg-feature-item">
                    <div className="ct-msg-feat-icon ct-feat-cyan-blue">
                      <Users size={18} className="text-white" />
                    </div>
                    <div className="ct-msg-feat-text">
                      <strong className="ct-msg-feat-title">Open to Partnerships</strong>
                      <span className="ct-msg-feat-sub">Let's Grow Together</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Dark navy-to-black gradient, glow streaks, glass form card */}
            <div className="ct-msg-right">
              {/* Corner Glow Streaks */}
              <div className="ct-msg-glow-streak ct-glow-tr" aria-hidden="true" />
              <div className="ct-msg-glow-streak ct-glow-bl" aria-hidden="true" />

              {/* Glass Form Card */}
              <div className="ct-msg-glass-card">
                {/* Header Row */}
                <div className="ct-msg-card-header">
                  <div className="ct-msg-envelope-circle" aria-hidden="true">
                    <Mail size={36} className="text-white" />
                  </div>
                  <div className="ct-msg-card-header-text">
                    <h3 className="ct-msg-card-title">
                      Send Us a{" "}
                      <span className="ct-msg-card-title-grad">Message</span>
                      <span className="ct-msg-card-sparks" aria-hidden="true">
                        <span className="ct-card-spark-ray ct-csr-1" />
                        <span className="ct-card-spark-ray ct-csr-2" />
                        <span className="ct-card-spark-ray ct-csr-3" />
                      </span>
                    </h3>
                    <p className="ct-msg-card-sub">
                      We'd love to hear from you. Fill out the form below and we'll get back to you soon.
                    </p>
                  </div>
                </div>

                {submitted ? (
                  <div className="ct-msg-success-box">
                    <div className="ct-msg-success-icon-ring">
                      <CheckCircle2 size={44} strokeWidth={2.4} />
                    </div>
                    <h4 className="ct-msg-success-title">Message Sent!</h4>
                    <p className="ct-msg-success-desc">
                      Thank you for contacting KSAM Deal. We have received your details and our support team will reply within 24 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData((prev) => ({
                          ...prev,
                          phone: "",
                          subject: SUBJECTS[0],
                          message: ""
                        }));
                      }}
                      className="ct-msg-submit-btn"
                    >
                      <span>Send Another Message</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    {/* Hidden Honeypot */}
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

                    {/* 2-Column Fields Grid */}
                    <div className="ct-msg-fields-grid">
                      {/* Full Name */}
                      <div className="ct-msg-field-wrap">
                        <div
                          className={`ct-msg-field-tile ${
                            touched.name && formData.name.trim().length < 2 ? "has-error" : ""
                          }`}
                        >
                          <label htmlFor="ct-msg-name" className="ct-msg-tile-label">
                            <User size={13} className="ct-tile-top-icon" />
                            <span>Full Name</span>
                          </label>
                          <input
                            id="ct-msg-name"
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            onBlur={() => handleBlur("name")}
                            placeholder="Enter your name"
                            className="ct-msg-input"
                            aria-invalid={touched.name && formData.name.trim().length < 2}
                            aria-describedby={
                              touched.name && formData.name.trim().length < 2
                                ? "ct-name-err"
                                : undefined
                            }
                          />
                        </div>
                        {touched.name && formData.name.trim().length < 2 && (
                          <div id="ct-name-err" className="ct-msg-field-err">
                            Please enter your name (at least 2 characters).
                          </div>
                        )}
                      </div>

                      {/* Email Address */}
                      <div className="ct-msg-field-wrap">
                        <div
                          className={`ct-msg-field-tile ${
                            touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                              ? "has-error"
                              : ""
                          }`}
                        >
                          <label htmlFor="ct-msg-email" className="ct-msg-tile-label">
                            <Mail size={13} className="ct-tile-top-icon" />
                            <span>Email Address</span>
                          </label>
                          <input
                            id="ct-msg-email"
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            onBlur={() => handleBlur("email")}
                            placeholder="you@example.com"
                            className="ct-msg-input"
                            aria-invalid={
                              touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                            }
                            aria-describedby={
                              touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                                ? "ct-email-err"
                                : undefined
                            }
                          />
                        </div>
                        {touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                          <div id="ct-email-err" className="ct-msg-field-err">
                            Please enter a valid email address.
                          </div>
                        )}
                      </div>

                      {/* Phone Number (Optional) */}
                      <div className="ct-msg-field-wrap">
                        <div className="ct-msg-field-tile">
                          <label htmlFor="ct-msg-phone" className="ct-msg-tile-label">
                            <Phone size={13} className="ct-tile-top-icon" />
                            <span>Phone Number</span>
                            <span className="ct-msg-optional-chip">(Optional)</span>
                          </label>
                          <input
                            id="ct-msg-phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            placeholder="+91 98765 43210"
                            className="ct-msg-input"
                          />
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="ct-msg-field-wrap">
                        <div className="ct-msg-field-tile ct-msg-select-tile">
                          <label htmlFor="ct-msg-subject" className="ct-msg-tile-label">
                            <Tag size={13} className="ct-tile-top-icon" />
                            <span>Subject</span>
                          </label>
                          <div className="ct-msg-select-wrap">
                            <select
                              id="ct-msg-subject"
                              name="subject"
                              value={formData.subject}
                              onChange={(e) => handleChange("subject", e.target.value)}
                              className="ct-msg-select"
                            >
                              {SUBJECTS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="ct-msg-select-arrow" aria-hidden="true" />
                          </div>
                        </div>
                      </div>

                      {/* Your Message (Full Width) */}
                      <div className="ct-msg-field-wrap ct-msg-msg-wrap">
                        <div
                          className={`ct-msg-field-tile ct-msg-textarea-tile ${
                            touched.message && formData.message.trim().length < 10 ? "has-error" : ""
                          }`}
                        >
                          <label htmlFor="ct-msg-message" className="ct-msg-tile-label">
                            <MessageSquare size={13} className="ct-tile-top-icon" />
                            <span>Your Message</span>
                          </label>
                          <textarea
                            id="ct-msg-message"
                            name="message"
                            rows={3}
                            maxLength={2000}
                            required
                            value={formData.message}
                            onChange={(e) => handleChange("message", e.target.value)}
                            onBlur={() => handleBlur("message")}
                            placeholder="Tell us how we can help..."
                            className="ct-msg-textarea"
                            aria-invalid={touched.message && formData.message.trim().length < 10}
                            aria-describedby={
                              touched.message && formData.message.trim().length < 10
                                ? "ct-msg-err"
                                : undefined
                            }
                          />
                          <div className="ct-msg-counter-row">
                            <span
                              className={`ct-msg-counter ${
                                msgLen > 1900 ? "ct-counter-warn" : ""
                              }`}
                            >
                              {msgLen}/2000
                            </span>
                          </div>
                        </div>
                        {touched.message && formData.message.trim().length < 10 && (
                          <div id="ct-msg-err" className="ct-msg-field-err">
                            Message must be at least 10 characters long.
                          </div>
                        )}
                      </div>
                    </div>

                    {error && (
                      <div className="ct-msg-alert-err" role="alert">
                        {error}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading || cooldown > 0}
                      className="ct-msg-submit-btn"
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
                          <Send size={18} />
                          <span>Send Message</span>
                          <ArrowRight size={18} className="ct-msg-btn-arrow" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Divider Row */}
                <div className="ct-msg-divider" aria-hidden="true">
                  <span className="ct-msg-div-line" />
                  <span className="ct-msg-div-text">OR REACH US DIRECTLY</span>
                  <span className="ct-msg-div-line" />
                </div>

                {/* Three Contact Tiles */}
                <div className="ct-msg-contact-tiles">
                  {/* Email Us */}
                  <a
                    href="mailto:support@ksamdeal.in"
                    className="ct-msg-contact-tile"
                    title="Email our support team directly at support@ksamdeal.in"
                  >
                    <div className="ct-msg-tile-icon ct-tile-blue" aria-hidden="true">
                      <Mail size={16} className="text-white" />
                    </div>
                    <div className="ct-msg-tile-info">
                      <span className="ct-msg-tile-heading">Email Us</span>
                      <span className="ct-msg-tile-val">support@ksamdeal.in</span>
                    </div>
                  </a>

                  {/* Call Us */}
                  <a
                    href="tel:+917906706679"
                    className="ct-msg-contact-tile"
                    title="Call KSAM Deal support desk at +91 7906706679"
                  >
                    <div className="ct-msg-tile-icon ct-tile-green" aria-hidden="true">
                      <Phone size={16} className="text-white" />
                    </div>
                    <div className="ct-msg-tile-info">
                      <span className="ct-msg-tile-heading">Call Us</span>
                      <span className="ct-msg-tile-val">+91 7906706679</span>
                    </div>
                  </a>

                  {/* Our Office */}
                  <div className="ct-msg-contact-tile" title="KSAM Deal Headquarters">
                    <div className="ct-msg-tile-icon ct-tile-purple" aria-hidden="true">
                      <MapPin size={16} className="text-white" />
                    </div>
                    <div className="ct-msg-tile-info">
                      <span className="ct-msg-tile-heading">Our Office</span>
                      <span className="ct-msg-tile-val">India</span>
                    </div>
                  </div>
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
