import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { KeyRound, Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { BASE_URL } from "../auth.js";
import Navbar from "../../deals/components/Navbar.jsx";
import Newsletter from "../../deals/components/Newsletter.jsx";
import Footer from "../../deals/components/Footer.jsx";
import "../../deals/tailwind-generated.css";
import "../../deals/deals.css";
import "../../styles/kx-tokens.css";
import "../../styles/kx-motion.css";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (cooldown > 0) return;

    setError("");
    setLoading(true);

    try {
      const redirectUrl = new URL(`${BASE_URL}reset-password.html`, window.location.origin).href;
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl
      });
      // Always show uniform success message to prevent account enumeration
      setSubmitted(true);
      setCooldown(60);
    } catch (err) {
      // Even on rate-limits, do not leak user existence; show clean notice
      console.warn("[ForgotPassword]", err);
      setSubmitted(true);
      setCooldown(60);
    } finally {
      setLoading(false);
    }
  };

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

      <main className="mx-auto max-w-lg w-full px-4 py-16 sm:py-24 relative z-10">
        <div className="kx-card p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[var(--kx-accent)]/20 to-[var(--kx-cyan)]/20 text-[var(--kx-accent)] mb-6 border border-[var(--kx-accent)]/20">
            <KeyRound size={26} />
          </div>

          <span className="text-[11px] font-black uppercase tracking-wider text-[var(--kx-cyan)] block mb-1">
            Account Recovery
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--kx-text)] tracking-tight">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-[var(--kx-text-muted)] leading-relaxed">
            Enter the email associated with your KSAM Deal account and we will send you a secure link to reset your password.
          </p>

          {submitted ? (
            <div className="mt-6 rounded-2xl border border-[var(--kx-accent)]/30 bg-[var(--kx-accent-soft)] p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[var(--kx-accent)] shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold text-[var(--kx-text)]">Check your email</p>
                  <p className="mt-1 text-xs text-[var(--kx-text-muted)] leading-relaxed">
                    If an account exists for <strong className="text-[var(--kx-text)]">{email}</strong>, we have sent a password reset link. Please check your inbox and spam folder.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--kx-border)] flex items-center justify-between">
                <button
                  type="button"
                  disabled={cooldown > 0 || loading}
                  onClick={handleSubmit}
                  className="text-xs font-bold text-[var(--kx-accent)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend reset link"}
                </button>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-[var(--kx-text-muted)] hover:text-[var(--kx-text)]"
                >
                  Try another email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-[var(--kx-text-muted)] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail size={18} className="absolute left-4 text-[var(--kx-text-dim)] pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-[var(--kx-border)] bg-[var(--kx-surface-2)] py-3.5 pl-11 pr-4 text-sm text-[var(--kx-text)] outline-none transition focus:border-[var(--kx-accent)] focus:shadow-[0_0_20px_var(--kx-accent-glow)]"
                  />
                </div>
                {error && (
                  <p className="mt-2 text-xs text-[var(--kx-red)] flex items-center gap-1">
                    <AlertCircle size={13} /> {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="kx-btn kx-btn--primary w-full py-3.5 mt-2 flex items-center justify-center font-black"
              >
                {loading ? "Sending link..." : "Send Reset Link"}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-[var(--kx-border)] text-center">
            <a
              href={`${BASE_URL}login.html`}
              className="inline-flex items-center gap-2 text-xs font-bold text-[var(--kx-text-muted)] hover:text-[var(--kx-accent)] transition"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </a>
          </div>
        </div>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
}

const rootEl = document.getElementById("forgot-password-root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <ForgotPasswordPage />
    </React.StrictMode>
  );
}

export default ForgotPasswordPage;
