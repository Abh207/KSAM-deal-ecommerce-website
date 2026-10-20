import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  Mail,
  User,
  MessageSquare,
  Send,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { BASE_URL } from "../auth/auth.js";
import Navbar from "../deals/components/Navbar.jsx";
import Newsletter from "../deals/components/Newsletter.jsx";
import Footer from "../deals/components/Footer.jsx";
import "../deals/tailwind-generated.css";
import "../deals/deals.css";
import "../styles/kx-tokens.css";
import "../styles/kx-motion.css";

const SUBJECTS = [
  "Deal question / Expired deal report",
  "Account & Profile assistance",
  "Partner store / Affiliate inquiry",
  "Bug report / Technical feedback",
  "Other general inquiry"
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Spam honeypot check
    if (formData.website) {
      // Quietly simulate submission for bots
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
        throw insertErr;
      }

      setSubmitted(true);
      setCooldown(30);
    } catch (err) {
      console.error("[ContactUs]", err);
      setError(err?.message || "Failed to send message. Please try again or email support directly.");
    } finally {
      setLoading(false);
    }
  };

  const bannerImg = `${BASE_URL}lamplight.png`;

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
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--kx-border)] bg-[var(--kx-surface-1)] p-8 sm:p-14 mb-12 shadow-2xl">
          {/* Ambient Glow & Cover image blend */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-20 hidden md:block">
            <img
              src={bannerImg}
              alt="KSAM Deal Support"
              loading="lazy"
              className="h-full w-full object-cover mix-blend-screen"
            />
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="inline-block rounded-full border border-[var(--kx-accent)]/30 bg-[var(--kx-accent-soft)] px-3.5 py-1 text-xs font-bold text-[var(--kx-accent)] uppercase tracking-widest mb-4">
              Customer Support & Inquiries
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[var(--kx-text)] leading-tight tracking-tight">
              We're here to <span className="text-[var(--kx-cyan)]">help you.</span>
            </h1>
            <p className="mt-4 text-base text-[var(--kx-text-muted)] leading-relaxed">
              Have questions about a deal, need account help, or want to suggest a new store integration? Drop us a note below.
            </p>
          </div>

          {/* Decorative Marquee Strip */}
          <div className="mt-8 pt-4 border-t border-[var(--kx-border)] overflow-hidden relative">
            <div className="kx-marquee-track text-[11px] font-black uppercase tracking-[0.25em] text-[var(--kx-text-dim)] select-none">
              <span className="kx-marquee-content">
                &nbsp;24/7 SUPPORT • DEAL DISCOVERY • INSTANT ASSISTANCE • VERIFIED STORES • PRIVACY FIRST • 24/7 SUPPORT • DEAL DISCOVERY • INSTANT ASSISTANCE • VERIFIED STORES • PRIVACY FIRST •
              </span>
              <span className="kx-marquee-content" aria-hidden="true">
                &nbsp;24/7 SUPPORT • DEAL DISCOVERY • INSTANT ASSISTANCE • VERIFIED STORES • PRIVACY FIRST • 24/7 SUPPORT • DEAL DISCOVERY • INSTANT ASSISTANCE • VERIFIED STORES • PRIVACY FIRST •
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-12">
          {/* Contact Form Column */}
          <div className="lg:col-span-7">
            <div className="kx-card p-6 sm:p-10 shadow-2xl">
              <h2 className="text-xl font-bold text-[var(--kx-text)] mb-2">Send us a message</h2>
              <p className="text-xs text-[var(--kx-text-muted)] mb-6">
                Fill out the form below. We typically reply within 24 hours.
              </p>

              {submitted ? (
                <div className="rounded-2xl border border-[var(--kx-accent)]/30 bg-[var(--kx-accent-soft)] p-8 text-center animate-[scaleIn_0.4s_ease]">
                  <CheckCircle2 size={44} className="mx-auto text-[var(--kx-accent)] mb-3" />
                  <h3 className="text-xl font-bold text-[var(--kx-text)]">Message Delivered!</h3>
                  <p className="mt-2 text-xs text-[var(--kx-text-muted)] leading-relaxed max-w-md mx-auto">
                    Thank you for reaching out. We have received your inquiry and our support team will get back to you shortly.
                  </p>

                  <button
                    type="button"
                    disabled={cooldown > 0}
                    onClick={() => {
                      setSubmitted(false);
                      setFormData((p) => ({ ...p, message: "" }));
                    }}
                    className="mt-6 inline-flex items-center gap-2 kx-btn kx-btn--secondary px-5 py-2.5 text-xs font-bold disabled:opacity-50"
                  >
                    {cooldown > 0 ? `Send another message in ${cooldown}s` : "Send another message"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot hidden input */}
                  <div style={{ display: "none" }}>
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                    />
                  </div>

                  {/* Name Input */}
                  <div>
                    <label htmlFor="c-name" className="block text-xs font-bold text-[var(--kx-text-muted)] uppercase tracking-wider mb-2">
                      Your Name
                    </label>
                    <div className="relative flex items-center">
                      <User size={16} className="absolute left-4 text-[var(--kx-text-dim)] pointer-events-none" />
                      <input
                        id="c-name"
                        type="text"
                        required
                        minLength={2}
                        maxLength={80}
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-[var(--kx-border)] bg-[var(--kx-surface-2)] py-3 pl-11 pr-4 text-sm text-[var(--kx-text)] outline-none transition focus:border-[var(--kx-accent)] focus:shadow-[0_0_20px_var(--kx-accent-glow)]"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label htmlFor="c-email" className="block text-xs font-bold text-[var(--kx-text-muted)] uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail size={16} className="absolute left-4 text-[var(--kx-text-dim)] pointer-events-none" />
                      <input
                        id="c-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="john@example.com"
                        className="w-full rounded-xl border border-[var(--kx-border)] bg-[var(--kx-surface-2)] py-3 pl-11 pr-4 text-sm text-[var(--kx-text)] outline-none transition focus:border-[var(--kx-accent)] focus:shadow-[0_0_20px_var(--kx-accent-glow)]"
                      />
                    </div>
                  </div>

                  {/* Subject Dropdown */}
                  <div>
                    <label htmlFor="c-sub" className="block text-xs font-bold text-[var(--kx-text-muted)] uppercase tracking-wider mb-2">
                      Topic / Subject
                    </label>
                    <select
                      id="c-sub"
                      value={formData.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      className="w-full rounded-xl border border-[var(--kx-border)] bg-[var(--kx-surface-2)] py-3 px-4 text-sm text-[var(--kx-text)] outline-none transition focus:border-[var(--kx-accent)]"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s} className="bg-[var(--kx-surface-1)] text-[var(--kx-text)]">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message Area with Character Counter */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="c-msg" className="block text-xs font-bold text-[var(--kx-text-muted)] uppercase tracking-wider">
                        Message
                      </label>
                      <span className="text-[11px] text-[var(--kx-text-dim)]">
                        {formData.message.length} / 2000
                      </span>
                    </div>
                    <textarea
                      id="c-msg"
                      rows={5}
                      required
                      minLength={10}
                      maxLength={2000}
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Please describe your question or issue in detail..."
                      className="w-full rounded-xl border border-[var(--kx-border)] bg-[var(--kx-surface-2)] p-4 text-sm text-[var(--kx-text)] outline-none transition focus:border-[var(--kx-accent)] focus:shadow-[0_0_20px_var(--kx-accent-glow)]"
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl border border-[var(--kx-red)]/30 bg-[var(--kx-red-soft)] p-3 text-xs text-[var(--kx-red)] flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0" /> {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || cooldown > 0}
                    className="kx-btn kx-btn--primary w-full py-4 text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send size={16} />
                    {loading ? "Sending..." : cooldown > 0 ? `Please wait (${cooldown}s)` : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Info Cards Column */}
          <div className="lg:col-span-5 space-y-4">
            {/* Email Support Card */}
            <div className="kx-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--kx-accent-soft)] text-[var(--kx-accent)] border border-[var(--kx-accent)]/20">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--kx-text)]">Direct Support Email</h3>
                  <a
                    href="mailto:support@ksamdeal.in"
                    className="text-xs text-[var(--kx-cyan)] hover:underline"
                  >
                    support@ksamdeal.in
                  </a>
                </div>
              </div>
            </div>

            {/* Response Time & Hours */}
            <div className="kx-card p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--kx-cyan-soft)] text-[var(--kx-cyan)] border border-[var(--kx-cyan)]/20 shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--kx-text)]">Response Time</h3>
                  <p className="text-xs text-[var(--kx-text-muted)] mt-0.5">
                    We review messages in order of arrival and aim to respond within 24 business hours.
                  </p>
                  <p className="text-xs text-[var(--kx-text-dim)] mt-1">
                    Hours: Monday – Saturday, 9:00 AM – 7:00 PM IST
                  </p>
                </div>
              </div>
            </div>

            {/* Quick FAQ Card */}
            <div className="kx-card p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--kx-yellow-soft)] text-[var(--kx-yellow)] border border-[var(--kx-yellow)]/20 shrink-0">
                  <HelpCircle size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--kx-text)]">Quick Answers</h3>
                  <p className="text-xs text-[var(--kx-text-muted)] mt-0.5">
                    Have questions about how KSAM Deal tracks prices or redirects purchases?
                  </p>
                  <a
                    href={`${BASE_URL}index.html#faq`}
                    className="mt-3 inline-block text-xs font-bold text-[var(--kx-accent)] hover:underline"
                  >
                    Read Frequently Asked Questions →
                  </a>
                </div>
              </div>
            </div>

            {/* Legal Notice Card */}
            <div className="rounded-3xl border border-[var(--kx-border)] bg-[var(--kx-surface-2)] p-5 text-xs text-[var(--kx-text-muted)] leading-relaxed">
              <p>
                <strong className="text-[var(--kx-text)]">Note:</strong> KSAM Deal is an independent deals aggregator. If you have questions regarding order shipping, returns, or refunds for an item bought on Amazon, Flipkart, or another partner store, please contact that retailer directly.
              </p>
            </div>
          </div>
        </div>
      </main>

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
