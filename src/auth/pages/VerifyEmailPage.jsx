import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { MailCheck, ExternalLink, RefreshCw, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { BASE_URL, validateReturnTo } from "../auth.js";
import Navbar from "../../deals/components/Navbar.jsx";
import Newsletter from "../../deals/components/Newsletter.jsx";
import Footer from "../../deals/components/Footer.jsx";
import "../../deals/tailwind-generated.css";
import "../../deals/deals.css";
import "../../styles/kx-tokens.css";
import "../../styles/kx-motion.css";

export function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [nextTarget, setNextTarget] = useState(`${BASE_URL}profile.html`);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    const nextParam = params.get("next");

    if (emailParam) setEmail(emailParam);
    if (nextParam) setNextTarget(validateReturnTo(nextParam) || `${BASE_URL}profile.html`);

    // Also check current session if available
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setEmail(data.user.email);
        if (data.user.email_confirmed_at) {
          window.location.href = validateReturnTo(nextParam) || `${BASE_URL}profile.html`;
        }
      }
    });
  }, []);

  // Cooldown countdown
  useEffect(() => {
    let t;
    if (cooldown > 0) {
      t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [cooldown]);

  // Check email confirmation status (poll every 5s & on tab focus)
  const checkVerification = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email_confirmed_at) {
        window.location.href = nextTarget;
      }
    } catch {
      // ignore
    }
  }, [nextTarget]);

  useEffect(() => {
    const interval = setInterval(checkVerification, 5000);
    const handleFocus = () => checkVerification();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkVerification]);

  const handleResend = async () => {
    if (!email || cooldown > 0 || resending) return;
    setResending(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email
      });

      if (error) {
        setMessage(error.message || "Could not resend email. Please try again later.");
      } else {
        setMessage("Verification email resent successfully! Check your inbox.");
        setCooldown(60);
      }
    } catch (err) {
      setMessage("Failed to resend. Please try again shortly.");
    } finally {
      setResending(false);
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
        <div className="kx-card p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl text-center">
          {/* Animated Mail Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[var(--kx-accent)]/20 to-[var(--kx-cyan)]/20 text-[var(--kx-accent)] mb-6 shadow-[0_0_25px_var(--kx-accent-glow)] border border-[var(--kx-accent)]/20">
            <MailCheck size={32} />
          </div>

          <span className="text-[11px] font-black uppercase tracking-wider text-[var(--kx-cyan)] block mb-1">
            Account Activation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--kx-text)] tracking-tight">
            Check Your Inbox
          </h1>

          <p className="mt-3 text-sm text-[var(--kx-text-muted)] leading-relaxed">
            We have sent a verification link to:
          </p>

          <div className="mt-3 inline-block rounded-xl border border-[var(--kx-accent)]/30 bg-[var(--kx-accent-soft)] px-4 py-2 text-sm font-bold text-[var(--kx-accent)]">
            {email || "your email address"}
          </div>

          <p className="mt-3 text-xs text-[var(--kx-text-dim)] leading-relaxed">
            Click the link in the email to activate your account. This page will automatically update once verified.
          </p>

          {/* Webmail Quick Launch Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--kx-border)] bg-[var(--kx-surface-2)] py-2.5 text-xs font-bold text-[var(--kx-text)] transition hover:border-[var(--kx-accent)] hover:text-[var(--kx-accent)]"
            >
              Open Gmail <ExternalLink size={13} />
            </a>

            <a
              href="https://outlook.live.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--kx-border)] bg-[var(--kx-surface-2)] py-2.5 text-xs font-bold text-[var(--kx-text)] transition hover:border-[var(--kx-cyan)] hover:text-[var(--kx-cyan)]"
            >
              Open Outlook <ExternalLink size={13} />
            </a>
          </div>

          {message && (
            <div className="mt-5 rounded-xl border border-[var(--kx-accent)]/30 bg-[var(--kx-accent-soft)] p-3 text-xs text-[var(--kx-accent)] flex items-center justify-center gap-2">
              <CheckCircle2 size={14} /> {message}
            </div>
          )}

          {/* Action Row */}
          <div className="mt-8 pt-6 border-t border-[var(--kx-border)] flex flex-col gap-3">
            <button
              type="button"
              disabled={cooldown > 0 || resending}
              onClick={handleResend}
              className="flex items-center justify-center gap-2 text-xs font-bold text-[var(--kx-accent)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={13} className={resending ? "animate-spin" : ""} />
              {cooldown > 0 ? `Resend email in ${cooldown}s` : "Didn't receive it? Resend email"}
            </button>

            <a
              href={`${BASE_URL}signUp.html`}
              className="text-xs text-[var(--kx-text-muted)] hover:text-[var(--kx-text)] transition"
            >
              Wrong email address? Change email
            </a>
          </div>
        </div>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
}

const rootEl = document.getElementById("verify-email-root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <VerifyEmailPage />
    </React.StrictMode>
  );
}

export default VerifyEmailPage;
