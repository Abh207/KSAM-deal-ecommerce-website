import { useState, useMemo } from "react";
import { Shield, Key, LogOut, Eye, EyeOff, AlertCircle, CheckCircle2, Lock, Smartphone, Mail, Globe, ArrowRight } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { signOut, BASE_URL } from "../../auth/auth.js";

export default function SecurityTab({ session, onShowToast }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [signingOutAll, setSigningOutAll] = useState(false);

  // Password strength calculation
  const strength = useMemo(() => {
    if (!newPassword) return { score: 0, label: "Enter a password", color: "#64748b" };
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword)) score++;
    if (/[A-Z]/.test(newPassword) && /[^a-zA-Z0-9]/.test(newPassword)) score++;
    if (newPassword.length >= 12) score++;

    const labels = ["Weak", "Fair", "Good", "Strong"];
    const colors = ["#ef4444", "#f59e0b", "#38BDF8", "#8cff00"];
    const idx = Math.min(3, Math.max(0, score - 1));

    return {
      score,
      label: labels[idx],
      color: colors[idx]
    };
  }, [newPassword]);

  // Handle password change with re-auth
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (!(/[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword))) {
      setError("New password must contain at least one letter and one number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const email = session?.user?.email;
      if (!email) throw new Error("No active email found in session.");

      // 1. Re-authenticate with current password
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword
      });

      if (signInErr) {
        throw new Error("Current password is incorrect. Please re-check.");
      }

      // 2. Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setSuccess("Your password has been changed securely!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onShowToast("Password changed successfully!");
    } catch (err) {
      console.error("[Password Update Error]", err);
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  // Sign out from all devices
  const handleSignOutAll = async () => {
    if (!window.confirm("This will log you out from every browser and mobile session. Continue?")) return;
    setSigningOutAll(true);
    try {
      await supabase.auth.signOut({ scope: "global" });
      window.location.href = `${BASE_URL}login.html`;
    } catch (err) {
      console.error("[Sign Out All Error]", err);
      onShowToast("Failed to sign out from all devices.");
    } finally {
      setSigningOutAll(false);
    }
  };

  // Connected Sign-in Methods
  const providers = session?.user?.app_metadata?.providers || ["email"];

  return (
    <div className="space-y-6" role="tabpanel" aria-label="Security & Authentication" id="security">
      {/* Change Password Card */}
      <div className="ks-card su-security-card su-card su-card-raised">
        {/* Header with non-floating Forgot Password link */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="ks-card-title text-base flex items-center gap-2">
              <Key size={18} className="text-[#15803D]" />
              <span>Change Password</span>
            </h2>
            <p className="ks-card-desc">
              Update your account password with re-authentication security check.
            </p>
          </div>

          <a
            href={`${BASE_URL}forgot-password.html`}
            className="su-forgot-link text-xs font-bold hover:underline self-start sm:self-auto shrink-0"
          >
            Forgot your password?
          </a>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          {/* Current Password */}
          <div>
            <label className="su-field-label block text-xs font-semibold mb-1.5">
              Current Password
            </label>
            <div className="ks-password-input-wrap">
              <input
                type={showCurrent ? "text" : "password"}
                required
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="ks-password-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="ks-password-eye-btn"
                aria-label={showCurrent ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="su-field-label block text-xs font-semibold mb-1.5">
              New Password (min 8 chars, letters &amp; numbers)
            </label>
            <div className="ks-password-input-wrap">
              <input
                type={showNew ? "text" : "password"}
                required
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="ks-password-input"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="ks-password-eye-btn"
                aria-label={showNew ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Strength Meter under new password */}
            {newPassword && (
              <div className="mt-2.5 space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#64748B]">Password Strength:</span>
                  <span style={{ color: strength.color === "#8cff00" ? "#15803D" : strength.color, fontWeight: 700 }}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] shadow-[inset_1px_1px_3px_rgba(163,177,198,0.4)] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${(strength.score / 4) * 100}%`,
                      backgroundColor: strength.color === "#8cff00" ? "#16A34A" : strength.color
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="su-field-label block text-xs font-semibold mb-1.5">
              Confirm New Password
            </label>
            <div className="ks-password-input-wrap">
              <input
                type={showConfirm ? "text" : "password"}
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="ks-password-input"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="ks-password-eye-btn"
                aria-label={showConfirm ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-[#16A34A]/30 bg-[#DCFCE7] p-3 text-xs text-[#15803D]">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="su-btn-update-pwd"
            >
              <Key size={14} />
              <span>{loading ? "Verifying & Updating..." : "Update Password"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Connected Sign-In Methods */}
      <div className="ks-card su-security-card su-card su-card-raised">
        <div className="ks-card-header mb-4">
          <h2 className="ks-card-title text-base flex items-center gap-2">
            <Shield size={18} className="text-[#15803D]" />
            <span>Connected Sign-in Methods</span>
          </h2>
          <p className="ks-card-desc">
            Authentication providers linked to your KSAM Deal account.
          </p>
        </div>

        <div className="space-y-3">
          {providers.includes("email") && (
            <div className="ks-connected-row flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] shrink-0">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold">Email &amp; Password</h4>
                  <p className="text-[11px] truncate">{session?.user?.email}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[#15803D]" />
                <span>Active</span>
              </span>
            </div>
          )}

          {providers.filter((p) => p !== "email").map((provider) => (
            <div key={provider} className="ks-connected-row flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] shrink-0">
                  <Globe size={18} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold capitalize">{provider} OAuth</h4>
                  <p className="text-[11px]">Third-party social authentication</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD] shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0369A1]" />
                <span>Linked</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Global Device Sign-out Card */}
      <div className="ks-card su-security-card su-card su-card-raised">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <LogOut size={16} className="text-[#D97706]" />
              <span>Sign Out from All Devices</span>
            </h3>
            <p className="text-xs text-[#475569] mt-1 max-w-lg">
              Revoke active refresh tokens on all computers, tablets, and mobile browsers where you are currently signed in.
            </p>
          </div>

          <button
            type="button"
            disabled={signingOutAll}
            onClick={handleSignOutAll}
            className="shrink-0 px-4 py-2.5 rounded-full border border-[#CBD5E1] bg-[#EDF0F5] hover:bg-[#FEE2E2] hover:text-[#DC2626] hover:border-[#FCA5A5] text-xs font-bold text-[#0F172A] shadow-[-2px_-2px_6px_rgba(255,255,255,0.8),2px_2px_6px_rgba(163,177,198,0.3)] transition cursor-pointer"
          >
            {signingOutAll ? "Signing out..." : "Sign Out Everywhere"}
          </button>
        </div>
      </div>
    </div>
  );
}
