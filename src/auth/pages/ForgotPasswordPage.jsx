import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { KeyRound, Mail, ArrowLeft, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import {
  BASE_URL,
  validateEmail,
  sendPasswordResetOtp,
  verifyEmailOtp,
  updateUserPassword,
  formatAuthError
} from "../auth.js";
import Navbar from "../../deals/components/Navbar.jsx";
import Newsletter from "../../deals/components/Newsletter.jsx";
import Footer from "../../deals/components/Footer.jsx";
import "../../deals/tailwind-generated.css";
import "../../deals/deals.css";
import "../../styles/kx-tokens.css";
import "../../styles/kx-motion.css";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter 6-digit OTP, 3: Set New Password, 4: Success
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [targetEmail, setTargetEmail] = useState("");

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Step 1: Send Password Reset Code
  const handleSendResetCode = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!validateEmail(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (cooldown > 0) return;

    setError("");
    setLoading(true);

    try {
      const { error: resetErr } = await sendPasswordResetOtp({ email: cleanEmail });

      if (resetErr) {
        setError(formatAuthError(resetErr));
        return;
      }

      setTargetEmail(cleanEmail);
      setStep(2);
      setCooldown(60);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Recovery OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const token = otp.join("");
    if (token.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { error: verifyErr } = await verifyEmailOtp({
        email: targetEmail,
        token,
        type: "recovery"
      });

      if (verifyErr) {
        setError(formatAuthError(verifyErr));
        return;
      }

      // Session established via recovery OTP! Proceed to set new password.
      setStep(3);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { error: updateErr } = await updateUserPassword({ password: newPassword });

      if (updateErr) {
        setError(formatAuthError(updateErr));
        return;
      }

      setStep(4);
      setTimeout(() => {
        window.location.href = `${BASE_URL}login.html`;
      }, 2000);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // Resend Recovery Code
  const handleResendCode = async () => {
    if (cooldown > 0 || !targetEmail) return;
    setError("");
    try {
      const { error: resendErr } = await sendPasswordResetOtp({ email: targetEmail });
      if (resendErr) {
        setError(formatAuthError(resendErr));
      } else {
        setCooldown(60);
      }
    } catch (err) {
      setError(formatAuthError(err));
    }
  };

  // OTP box input handling
  const handleOtpChange = (index, value) => {
    const clean = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);

    if (clean && index < 5) {
      const nextInput = document.getElementById(`pwd-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const prevInput = document.getElementById(`pwd-otp-${index - 1}`);
        prevInput?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text");
    const digits = pasted.replace(/\D/g, "").slice(0, 6);
    if (!digits) return;

    const newOtp = [...otp];
    digits.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);

    const focusIdx = Math.min(digits.length, 5);
    document.getElementById(`pwd-otp-${focusIdx}`)?.focus();
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
            {step === 1 && "Enter the email associated with your KSAM Deal account to receive a 6-digit recovery code."}
            {step === 2 && `Enter the 6-digit code sent to ${targetEmail}.`}
            {step === 3 && "Enter your new account password below."}
            {step === 4 && "Your password has been successfully updated."}
          </p>

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="mt-6 rounded-2xl border border-[var(--kx-accent)]/30 bg-[var(--kx-accent-soft)] p-6 text-center">
              <CheckCircle2 size={36} className="mx-auto text-[var(--kx-accent)] mb-3" />
              <p className="text-lg font-bold text-[var(--kx-text)]">Password Reset Successful!</p>
              <p className="mt-1 text-xs text-[var(--kx-text-muted)]">
                Your account password has been updated. Redirecting to sign in...
              </p>
              <a
                href={`${BASE_URL}login.html`}
                className="mt-6 inline-flex w-full items-center justify-center kx-btn kx-btn--primary py-3 text-sm font-black"
              >
                Go to Sign In
              </a>
            </div>
          )}

          {/* STEP 1: EMAIL INPUT */}
          {step === 1 && (
            <form onSubmit={handleSendResetCode} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--kx-text-muted)] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail size={18} className="absolute left-4 text-[var(--kx-text-dim)] pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="name@example.com"
                    required
                    autoComplete="email"
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
                {loading ? "Sending Recovery Code..." : "Send Verification Code"}
              </button>
            </form>
          )}

          {/* STEP 2: 6-DIGIT OTP INPUT */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[var(--kx-text-muted)] uppercase tracking-wider">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError("");
                    }}
                    className="text-xs font-bold text-[var(--kx-cyan)] hover:underline"
                  >
                    Change Email
                  </button>
                </div>

                <div className="grid grid-cols-6 gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`pwd-otp-${idx}`}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="h-12 w-full text-center text-xl font-bold rounded-xl border border-[var(--kx-border)] bg-[var(--kx-surface-2)] text-[var(--kx-text)] outline-none transition focus:border-[var(--kx-accent)] focus:shadow-[0_0_15px_var(--kx-accent-glow)]"
                    />
                  ))}
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
                {loading ? "Verifying Code..." : "Verify Code"}
              </button>

              <div className="pt-2 flex items-center justify-between text-xs text-[var(--kx-text-muted)]">
                <span>Didn't get the code?</span>
                <button
                  type="button"
                  disabled={cooldown > 0}
                  onClick={handleResendCode}
                  className="font-bold text-[var(--kx-accent)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 3 && (
            <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--kx-text-muted)] uppercase tracking-wider mb-2">
                  New Password (min. 6 characters)
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-4 text-[var(--kx-text-dim)] pointer-events-none" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[var(--kx-border)] bg-[var(--kx-surface-2)] py-3.5 pl-11 pr-4 text-sm text-[var(--kx-text)] outline-none transition focus:border-[var(--kx-accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--kx-text-muted)] uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-4 text-[var(--kx-text-dim)] pointer-events-none" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Re-enter new password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[var(--kx-border)] bg-[var(--kx-surface-2)] py-3.5 pl-11 pr-4 text-sm text-[var(--kx-text)] outline-none transition focus:border-[var(--kx-accent)]"
                  />
                </div>
              </div>

              {error && (
                <p className="mt-2 text-xs text-[var(--kx-red)] flex items-center gap-1">
                  <AlertCircle size={13} /> {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="kx-btn kx-btn--primary w-full py-3.5 mt-2 flex items-center justify-center font-black"
              >
                {loading ? "Updating Password..." : "Update Password & Sign In"}
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
