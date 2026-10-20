import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Check, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { BASE_URL, validateReturnTo } from "../auth.js";
import Navbar from "../../deals/components/Navbar.jsx";
import Newsletter from "../../deals/components/Newsletter.jsx";
import Footer from "../../deals/components/Footer.jsx";
import "../../deals/tailwind-generated.css";
import "../../deals/deals.css";
import "../../styles/kx-tokens.css";
import "../../styles/kx-motion.css";

export function EmailVerifiedPage() {
  const [error, setError] = useState("");
  const [nextTarget, setNextTarget] = useState(`${BASE_URL}profile.html`);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.slice(1);
    const hashParams = new URLSearchParams(hash);

    const err = params.get("error") || hashParams.get("error");
    const errDesc = params.get("error_description") || hashParams.get("error_description");
    const next = params.get("next") || hashParams.get("next");

    if (next) {
      setNextTarget(validateReturnTo(next) || `${BASE_URL}profile.html`);
    }

    if (err) {
      setError(errDesc || "Verification link is invalid or expired.");
    } else {
      // Re-read session to ensure user is established
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session) {
          setReady(true);
        } else {
          setReady(true);
        }
      });
    }
  }, []);

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
        <div className="kx-card p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl text-center">
          {error ? (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--kx-red-soft)] text-[var(--kx-red)] mb-6 border border-[var(--kx-red)]/20">
                <AlertCircle size={32} />
              </div>

              <span className="text-[11px] font-black uppercase tracking-wider text-[var(--kx-red)] block mb-1">
                Verification Issue
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--kx-text)] tracking-tight">
                Verification Failed
              </h1>

              <p className="mt-3 text-sm text-[var(--kx-text-muted)] leading-relaxed">
                {error}
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <a
                  href={`${BASE_URL}verify-email.html`}
                  className="inline-flex items-center justify-center gap-2 kx-btn kx-btn--primary py-3.5 text-sm font-black"
                >
                  <RefreshCw size={15} /> Request new link
                </a>

                <a
                  href={`${BASE_URL}login.html`}
                  className="text-xs text-[var(--kx-text-muted)] hover:text-[var(--kx-text)] transition"
                >
                  Back to Sign In
                </a>
              </div>
            </>
          ) : (
            <>
              {/* Animated check circle using transform & opacity only */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[var(--kx-accent)]/20 to-[var(--kx-cyan)]/20 text-[var(--kx-accent)] mb-6 shadow-[0_0_35px_var(--kx-accent-glow)] border border-[var(--kx-accent)]/30 animate-[scaleIn_0.5s_cubic-bezier(0.16,1,0.3,1)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--kx-accent)] text-[var(--kx-accent-text)]">
                  <Check size={28} strokeWidth={3} />
                </div>
              </div>

              <span className="text-[11px] font-black uppercase tracking-wider text-[var(--kx-accent)] block mb-1">
                Success
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--kx-text)] tracking-tight">
                Email Confirmed!
              </h1>

              <p className="mt-3 text-sm text-[var(--kx-text-muted)] leading-relaxed">
                Your email address has been verified successfully. Your KSAM Deal account is now active and ready.
              </p>

              <div className="mt-8">
                <a
                  href={nextTarget}
                  className="inline-flex w-full items-center justify-center gap-2 kx-btn kx-btn--primary py-4 text-sm font-black"
                >
                  Continue to Your Account <ArrowRight size={16} />
                </a>
              </div>
            </>
          )}
        </div>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
}

const rootEl = document.getElementById("email-verified-root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <EmailVerifiedPage />
    </React.StrictMode>
  );
}

export default EmailVerifiedPage;
