import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ShieldX, Home, MessageSquare, LogIn } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { BASE_URL } from "../auth.js";
import Navbar from "../../deals/components/Navbar.jsx";
import Newsletter from "../../deals/components/Newsletter.jsx";
import Footer from "../../deals/components/Footer.jsx";
import "../../deals/tailwind-generated.css";
import "../../deals/deals.css";
import "../../styles/kx-tokens.css";
import "../../styles/kx-motion.css";

export function AccessDeniedPage() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsSignedIn(Boolean(data?.session?.user));
    });
  }, []);

  return (
    <div className="kx-page min-h-screen flex flex-col justify-between relative overflow-hidden" style={{ background: "var(--kx-base)", color: "var(--kx-text)" }}>
      {/* Dynamic Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="kx-mesh-bg opacity-30" />
        <div className="kx-noise-overlay" />
        <div className="kx-floating-shape w-96 h-96 -top-20 -left-20 bg-[var(--kx-red)] opacity-10 blur-3xl rounded-full" />
        <div className="kx-floating-shape w-80 h-80 top-1/2 -right-20 bg-[var(--kx-cyan)] opacity-10 blur-3xl rounded-full" style={{ animationDelay: "-6s" }} />
      </div>

      <Navbar />

      <main className="mx-auto max-w-lg w-full px-4 py-16 sm:py-24 relative z-10">
        <div className="kx-card p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--kx-red-soft)] text-[var(--kx-red)] mb-6 border border-[var(--kx-red)]/20 shadow-[0_0_25px_var(--kx-red-soft)]">
            <ShieldX size={32} />
          </div>

          <span className="inline-block rounded-full border border-[var(--kx-red)]/30 bg-[var(--kx-red-soft)] px-3 py-1 text-xs font-bold text-[var(--kx-red)] uppercase tracking-widest mb-3">
            Error 403
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-[var(--kx-text)] tracking-tight">
            Access Denied
          </h1>

          <p className="mt-3 text-sm text-[var(--kx-text-muted)] leading-relaxed">
            {isSignedIn
              ? "You do not have permission to view or modify this resource. If you believe this is a mistake, please reach out to customer support."
              : "You need to be signed in to access this page. Please sign in with your account credentials."}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {!isSignedIn && (
              <a
                href={`${BASE_URL}login.html`}
                className="inline-flex w-full items-center justify-center gap-2 kx-btn kx-btn--primary py-4 text-sm font-black"
              >
                <LogIn size={16} /> Sign In
              </a>
            )}

            <a
              href={`${BASE_URL}index.html`}
              className={`inline-flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold transition ${
                isSignedIn
                  ? "kx-btn kx-btn--primary font-black"
                  : "kx-btn kx-btn--secondary"
              }`}
            >
              <Home size={16} /> Go to Home
            </a>

            <a
              href={`${BASE_URL}contact-us.html`}
              className="inline-flex w-full items-center justify-center gap-2 kx-btn kx-btn--outline py-3.5 text-sm font-bold"
            >
              <MessageSquare size={16} /> Contact Support
            </a>
          </div>
        </div>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
}

const rootEl = document.getElementById("access-denied-root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <AccessDeniedPage />
    </React.StrictMode>
  );
}

export default AccessDeniedPage;
