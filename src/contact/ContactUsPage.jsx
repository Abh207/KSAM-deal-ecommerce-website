import React, { useState, useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";
import {
  Mail,
  Send,
  Loader2,
  ArrowRight
} from "lucide-react";
import gsap from "gsap";
import { supabase } from "../lib/supabase.js";
import { BASE_URL } from "../auth/auth.js";
import Navbar from "../deals/components/Navbar.jsx";
import Newsletter from "../deals/components/Newsletter.jsx";
import Footer from "../deals/components/Footer.jsx";
import LiveBackdrop from "../profile/components/LiveBackdrop.jsx";
import KxFaq from "../components/KxFaq.jsx";
import { ReadingProgressBar, Aurora, useThemeSync } from "../lib/pageEffects.jsx";
import {
  initScrollParallax,
  initHeroExitDrift
} from "../lib/motion.js";
import { applyTheme, getStoredTheme, getStoredAccent } from "../lib/theme.js";

import "../deals/tailwind-generated.css";
import "../deals/deals.css";
import "../profile/kx-spotlight.css";
import "../styles/kx-tokens.css";
import "../styles/kx-motion.css";
import "../styles/kx-pages.css";
import "../styles/kx-faq.css";

const SUBJECTS = [
  "Deal Inquiry or Price Discrepancy",
  "Feature Request or Platform Feedback",
  "Account & Login Support",
  "Affiliate or Business Partnership",
  "Report an Expired Offer",
  "Other"
];

const MARQUEE_ITEMS = [
  "24/7 Support",
  "Deal Discovery",
  "Instant Assistance",
  "Verified Stores",
  "Privacy First"
];

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

  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const heroContentRef = useRef(null);
  const formSectionRef = useRef(null);

  useThemeSync();

  useEffect(() => {
    applyTheme(getStoredTheme(), getStoredAccent());
  }, []);

  // GSAP Scroll Motion
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroRef.current && heroContentRef.current) {
        initHeroExitDrift(heroRef.current, heroContentRef.current);
      }
      initScrollParallax(".kx-aurora-blob", 50);
    }, containerRef);

    return () => ctx.revert();
  }, []);

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

  // Cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (error) setError("");
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Spam honeypot check
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
  const counterClass =
    msgLen >= 1900
      ? "is-danger"
      : msgLen >= 1600
      ? "is-warning"
      : "is-normal";

  // FAQ Items for Support Details
  const supportFaqItems = useMemo(
    () => [
      {
        id: "general-inquiries",
        question: "General Inquiries",
        tone: "green-blue",
        answer: (
          <div className="space-y-3">
            <p>
              For general questions regarding deal aggregation, store redirections, or website feedback:
            </p>
            <a
              href="mailto:support@ksamdeal.in"
              className="text-base text-[var(--kx-cyan)] kx-animated-link font-bold inline-block"
            >
              support@ksamdeal.in
            </a>
          </div>
        )
      },
      {
        id: "technical-support",
        question: "Technical Support",
        tone: "blue-purple",
        answer: (
          <p>
            Assistance with account alerts, deal notifications, search discovery, and platform bugs.
          </p>
        )
      },
      {
        id: "partnerships",
        question: "Partnerships & Business Opportunities",
        tone: "purple-pink",
        answer: (
          <p>
            Store integrations, merchant feeds, affiliate network connections, and brand collaborations.
          </p>
        )
      },
      {
        id: "response-hours",
        question: "Response Time & Operating Hours",
        tone: "yellow-green",
        answer: (
          <div className="space-y-2">
            <p>
              We typically review and reply to messages within 24 business hours.
            </p>
            <p className="text-xs text-[var(--kx-text-dim)] font-medium">
              Operating Hours: Monday – Saturday, 9:00 AM – 7:00 PM IST
            </p>
          </div>
        )
      },
      {
        id: "quick-faq",
        question: "Quick Answers & FAQs",
        tone: "green-blue",
        answer: (
          <div className="space-y-3">
            <p>
              Looking for instant answers on how deals are ranked or redirected?
            </p>
            <a
              href={`${BASE_URL}index.html#faq`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--kx-accent)] kx-animated-link"
            >
              <span>Browse Frequently Asked Questions</span>
              <ArrowRight size={13} />
            </a>
          </div>
        )
      }
    ],
    []
  );

  return (
    <div
      ref={containerRef}
      className="kx-page min-h-screen flex flex-col justify-between relative"
      style={{ background: "var(--kx-base)", color: "var(--kx-text)" }}
    >
      <ReadingProgressBar />
      <LiveBackdrop palette="contact" />
      <Navbar />

      <div className="kx-main-wrapper relative z-10">
        <main className="kx-container-1200 py-10 sm:py-16 lg:py-20">
          {/* Fluid Open Hero (No card, no border) */}
          <section
            ref={heroRef}
            className="kx-faq-hero"
            data-tone="green-blue"
          >
            <Aurora tone="green-blue" />

            <div ref={heroContentRef} className="relative z-10 max-w-3xl">
              <div className="kx-faq-icon-tile mb-6">
                <Mail size={26} strokeWidth={2.4} />
              </div>
              <span className="kx-eyebrow mb-4">
                We're here to help
              </span>
              <h1 className="kx-hero-heading mb-6">
                Let's start a{" "}
                <span className="kx-gradient-text" data-tone="green-blue">
                  conversation.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-[var(--kx-text-muted)] leading-relaxed max-w-2xl">
                Have questions about a price drop, store partnership, or spotted a bug? We are here to assist you promptly.
              </p>
            </div>

            {/* Seamless Looping Marquee Strip (Pauses on hover and off-screen) */}
            <div className="mt-12 pt-6 overflow-hidden relative">
              <div className="kx-marquee" tabIndex={0}>
                <div className="kx-marquee-track text-[11px] font-black uppercase tracking-[0.25em] text-[var(--kx-text-dim)] select-none">
                  {[...Array(3)].map((_, setIdx) => (
                    <React.Fragment key={setIdx}>
                      {MARQUEE_ITEMS.map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-3 mx-4">
                          <span>{item}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--kx-accent)] opacity-60" />
                        </span>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Two-Column Layout: FAQ Rows Left, Open Form Right (Form first on mobile/tablet) */}
          <div className="grid gap-12 lg:gap-16 lg:grid-cols-12 items-start">
            {/* Support Information as FAQ Rows (Desktop Left) */}
            <div className="lg:col-span-6 order-2 lg:order-1 space-y-6">
              <div className="mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--kx-text)]">
                  Support Channels
                </h2>
                <p className="text-xs text-[var(--kx-text-muted)] mt-1">
                  Click any channel to view contact specifics and response policies.
                </p>
              </div>

              <KxFaq
                items={supportFaqItems}
                defaultOpen="general-inquiries"
                allowMultiple
                showControls={false}
              />

              {/* Merchant notice callout (no border) */}
              <div className="kx-callout-block" data-tone="purple-pink">
                <p className="text-xs sm:text-sm text-[var(--kx-text-muted)] leading-relaxed">
                  <strong className="text-[var(--kx-text)]">Merchant Notice:</strong> KSAM Deal is an independent deal-discovery platform. For inquiries regarding order shipments, returns, or refunds for products purchased on external merchant websites (Amazon, Flipkart, etc.), please contact that retailer directly.
                </p>
              </div>
            </div>

            {/* Open Contact Form (NOT inside a box, Desktop Right, Form first on mobile) */}
            <div
              ref={formSectionRef}
              id="contact-form-section"
              className="lg:col-span-6 order-1 lg:order-2"
            >
              <div className="p-0">
                <div className="mb-8">
                  <span className="kx-eyebrow mb-2">Direct message</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--kx-text)]">
                    Send a Message
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--kx-text-muted)] mt-1.5">
                    Fill out the form below. Our response time is typically within 24 hours.
                  </p>
                </div>

                {submitted ? (
                  <div className="text-center py-12 px-6 rounded-3xl bg-[rgba(255,255,255,0.03)]">
                    {/* SVG Check Draw Animation */}
                    <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center bg-[linear-gradient(135deg,#00F5A0,#22D3EE)] text-[#050505]">
                      <svg
                        className="w-8 h-8 kx-check-circle"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline className="kx-check-path" points="20 6 9 17 4 12" />
                      </svg>
                    </div>

                    <h3 className="text-2xl font-black text-[var(--kx-text)]">
                      Message Delivered!
                    </h3>
                    <p className="text-sm text-[var(--kx-text-muted)] max-w-md mx-auto mt-2 leading-relaxed">
                      Thank you for reaching out. We have logged your request and our support desk will respond shortly.
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
                      className="mt-6 kx-btn-48 kx-btn-secondary-tint"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    {/* Hidden Honeypot Field */}
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

                    {/* Name Field (60px, filled, no border) */}
                    <div className="kx-field-wrapper">
                      <input
                        id="c-name"
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        onBlur={() => handleBlur("name")}
                        placeholder=" "
                        className="kx-field-60"
                      />
                      <label htmlFor="c-name" className="kx-floating-label-60">
                        Full Name
                      </label>
                      <div className="kx-focus-bar" />
                      {touched.name && formData.name.trim().length < 2 && (
                        <div className="kx-field-error-msg">
                          Please enter your full name (at least 2 characters).
                        </div>
                      )}
                    </div>

                    {/* Email Field (60px, filled, no border) */}
                    <div className="kx-field-wrapper">
                      <input
                        id="c-email"
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        onBlur={() => handleBlur("email")}
                        placeholder=" "
                        className="kx-field-60"
                      />
                      <label htmlFor="c-email" className="kx-floating-label-60">
                        Email Address
                      </label>
                      <div className="kx-focus-bar" />
                      {touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                        <div className="kx-field-error-msg">
                          Please enter a valid email address.
                        </div>
                      )}
                    </div>

                    {/* Subject Field (60px, custom chevron, no border) */}
                    <div className="kx-field-wrapper">
                      <select
                        id="c-subject"
                        name="subject"
                        value={formData.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        className="kx-select-borderless"
                      >
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s} className="bg-[#101114] text-[#F8FAFC]">
                            {s}
                          </option>
                        ))}
                      </select>
                      <div className="kx-focus-bar" />
                    </div>

                    {/* Message Field (filled, no border) */}
                    <div className="kx-field-wrapper">
                      <textarea
                        id="c-msg"
                        name="message"
                        required
                        rows={5}
                        maxLength={2000}
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        onBlur={() => handleBlur("message")}
                        placeholder=" "
                        className="kx-textarea-borderless"
                      />
                      <label htmlFor="c-msg" className="kx-floating-label-60">
                        Message
                      </label>
                      <div className="kx-focus-bar" />

                      <div className="flex justify-between items-center mt-2 px-1">
                        <span className="text-[11px] text-[var(--kx-text-dim)]">
                          Minimum 10 characters
                        </span>
                        <span className={`text-[11px] kx-char-counter transition-colors ${counterClass}`}>
                          {msgLen} / 2000
                        </span>
                      </div>
                      {touched.message && formData.message.trim().length < 10 && (
                        <div className="kx-field-error-msg">
                          Message must be at least 10 characters long.
                        </div>
                      )}
                    </div>

                    {error && (
                      <div className="kx-field-error-msg py-2 px-3">
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading || cooldown > 0}
                      className="kx-btn-48 kx-btn-primary-gradient kx-btn-shine w-full text-sm font-black disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Sending...</span>
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
            </div>
          </div>
        </main>
      </div>

      {/* Sticky Mobile Glass Action Bar (no border) */}
      {!submitted && (
        <div className="kx-mobile-action-bar">
          <div>
            <div className="text-xs font-bold text-[var(--kx-text)]">Need Help?</div>
            <div className="text-[11px] text-[var(--kx-text-muted)]">Reply in ~24h</div>
          </div>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("contact-form-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="kx-btn-48 kx-btn-primary-gradient px-5 text-xs font-black"
          >
            <Send size={14} /> Send Message
          </button>
        </div>
      )}

      <Newsletter />
      <Footer />
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
