import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, ShieldAlert } from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { BASE_URL } from "../auth.js";
import Navbar from "../../deals/components/Navbar.jsx";
import Newsletter from "../../deals/components/Newsletter.jsx";
import Footer from "../../deals/components/Footer.jsx";
import "../../deals/tailwind-generated.css";
import "../../deals/deals.css";
import "../../styles/kx-tokens.css";
import "../../styles/kx-motion.css";

function calculateStrength(pwd) {
  if (!pwd) return { score: 0, label: "Empty", color: "#64748b", pct: 0 };
  let score = 0;
  if (pwd.length >= 8) score += 25;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 25;
  if (/\d/.test(pwd)) score += 25;
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 25;

  if (score <= 25) return { score, label: "Weak", color: "#ef4444", pct: 25 };
  if (score <= 50) return { score, label: "Fair", color: "#f59e0b", pct: 50 };
  if (score <= 75) return { score, label: "Good", color: "#38bdf8", pct: 75 };
  return { score, label: "Strong", color: "#22ff88", pct: 100 };
}

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setIsRecoveryReady(true);
        setInvalidLink(false);
      }
    });

    // Check if recovery session or hash is present
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        setIsRecoveryReady(true);
      } else {
        // If hash contains type=recovery or access_token
        const hash = window.location.hash;
        if (hash && (hash.includes("type=recovery") || hash.includes("access_token"))) {
          setIsRecoveryReady(true);
        } else {
          // Allow 2s for Supabase client to parse URL hash before marking invalid
          setTimeout(() => {
            supabase.auth.getSession().then(({ data: sess }) => {
              if (sess?.session) {
                setIsRecoveryReady(true);
              } else {
                setInvalidLink(true);
              }
            });
          }, 2000);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const strength = calculateStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      setError("Password must contain at least one letter and one number.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password
      });

      if (updateErr) {
        setError(updateErr.message || "Failed to update password. Link may have expired.");
        return;
      }

      setSuccess(true);
      // Clean sign out so user signs in cleanly with new credentials
      await supabase.auth.signOut();
    } catch (err) {
      setError(err?.message || "An unexpected error occurred.");
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
            <Lock size={26} />
          </div>

          <span className="text-[11px] font-black uppercase tracking-wider text-[var(--kx-cyan)] block mb-1">
            Security & Authentication
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--kx-text)] tracking-tight">
            Set New Password
          </h1>
          <p className="mt-2 text-sm text-[var(--kx-text-muted)] leading-relaxed">
            Choose a strong, unique password with at least 8 characters including letters and numbers.
          </p>

          {invalidLink && !isRecoveryReady ? (
            <div className="mt-6 rounded-2xl border border-[var(--kx-red)]/30 bg-[var(--kx-red-soft)] p-5 text-center">
              <ShieldAlert size={32} className="mx-auto text-[var(--kx-red)] mb-2" />
              <p className="font-bold text-[var(--kx-text)]">Recovery Link Expired or Invalid</p>
              <p className="mt-1 text-xs text-[var(--kx-text-muted)]">
                This password recovery link has already been used or has expired. Please request a new reset link.
              </p>
              <a
                href={`${BASE_URL}forgot-password.html`}
                className="mt-5 inline-flex items-center gap-2 kx-btn kx-btn--primary px-5 py-2.5 text-xs font-bold"
              >
                Request a new link
              </a>
            </div>
          ) : success ? (
            <div className="mt-6 rounded-2xl border border-[var(--kx-accent)]/30 bg-[var(--kx-accent-soft)] p-6 text-center">
              <CheckCircle2 size={36} className="mx-auto text-[var(--kx-accent)] mb-3" />
              <p className="text-lg font-bold text-[var(--kx-text)]">Password Updated!</p>
              <p className="mt-1 text-xs text-[var(--kx-text-muted)]">
                Your account password has been successfully reset. You can now sign in with your new password.
              </p>
              <a
                href={`${BASE_URL}login.html`}
                className="mt-6 inline-flex w-full items-center justify-center kx-btn kx-btn--primary py-3 text-sm font-black"
              >
                Go to Sign In
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-[var(--kx-text-muted)] uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter new password (min. 8 chars)"
                    required
                    className="w-full rounded-xl border border-[var(--kx-border)] bg-[var(--kx-surface-2)] py-3.5 pl-4 pr-11 text-sm text-[var(--kx-text)] outline-none transition focus:border-[var(--kx-accent)] focus:shadow-[0_0_20px_var(--kx-accent-glow)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-[var(--kx-text-dim)] hover:text-[var(--kx-text)]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Strength Meter */}
                {password.length > 0 && (
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[var(--kx-text-muted)]">Password strength:</span>
                      <span style={{ color: strength.color }} className="font-bold">
                        {strength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--kx-border)] rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300 rounded-full"
                        style={{
                          width: `${strength.pct}%`,
                          backgroundColor: strength.color
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-[var(--kx-text-muted)] uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Re-enter new password"
                  required
                  className="w-full rounded-xl border border-[var(--kx-border)] bg-[var(--kx-surface-2)] py-3.5 px-4 text-sm text-[var(--kx-text)] outline-none transition focus:border-[var(--kx-accent)] focus:shadow-[0_0_20px_var(--kx-accent-glow)]"
                />
              </div>

              {error && (
                <p className="text-xs text-[var(--kx-red)] flex items-center gap-1.5">
                  <AlertCircle size={14} className="shrink-0" /> {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="kx-btn kx-btn--primary w-full py-3.5 mt-2 flex items-center justify-center font-black"
              >
                {loading ? "Updating Password..." : "Update Password"}
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

const rootEl = document.getElementById("reset-password-root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <ResetPasswordPage />
    </React.StrictMode>
  );
}

export default ResetPasswordPage;
