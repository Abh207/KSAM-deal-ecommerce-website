import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Clock, LogIn, ArrowLeft, ShieldCheck } from "lucide-react";
import { BASE_URL, validateReturnTo } from "../auth.js";
import Navbar from "../../deals/components/Navbar.jsx";
import Newsletter from "../../deals/components/Newsletter.jsx";
import Footer from "../../deals/components/Footer.jsx";
import "../../deals/tailwind-generated.css";
import "../../deals/deals.css";
import "../../styles/kx-tokens.css";
import "../../styles/kx-motion.css";

export function SessionExpiredPage() {
  const [nextTarget, setNextTarget] = useState(`${BASE_URL}profile.html`);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    if (next) {
      setNextTarget(validateReturnTo(next) || `${BASE_URL}profile.html`);
    }
  }, []);

  const loginUrl = `${BASE_URL}login.html?next=${encodeURIComponent(nextTarget)}`;

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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--kx-yellow-soft)] text-[var(--kx-yellow)] mb-6 border border-[var(--kx-yellow)]/20 shadow-[0_0_25px_var(--kx-yellow-soft)]">
            <Clock size={32} />
          </div>

          <span className="text-[11px] font-black uppercase tracking-wider text-[var(--kx-yellow)] block mb-1">
            Session Timed Out
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--kx-text)] tracking-tight">
            Session Expired
          </h1>

          <p className="mt-3 text-sm text-[var(--kx-text-muted)] leading-relaxed">
            Your login session has ended due to inactivity or token expiration. Please sign in again to continue where you left off.
          </p>

          <div className="mt-5 rounded-2xl border border-[var(--kx-border)] bg-[var(--kx-surface-2)] p-4 text-xs text-[var(--kx-text-muted)] flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-[var(--kx-accent)] shrink-0" />
            <span>Don't worry, your saved addresses, wishlist, and alerts remain safe.</span>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <a
              href={loginUrl}
              className="inline-flex w-full items-center justify-center gap-2 kx-btn kx-btn--primary py-4 text-sm font-black"
            >
              <LogIn size={16} /> Sign In Again
            </a>

            <a
              href={`${BASE_URL}index.html`}
              className="inline-flex items-center justify-center gap-2 text-xs text-[var(--kx-text-muted)] hover:text-[var(--kx-text)] transition py-2"
            >
              <ArrowLeft size={14} /> Return to Home
            </a>
          </div>
        </div>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
}

const rootEl = document.getElementById("session-expired-root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <SessionExpiredPage />
    </React.StrictMode>
  );
}

export default SessionExpiredPage;
