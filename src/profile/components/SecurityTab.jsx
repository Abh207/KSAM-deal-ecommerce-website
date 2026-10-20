import { useState, useMemo } from "react";
import { Shield, Key, LogOut, Eye, EyeOff, AlertCircle, CheckCircle2, Lock, Smartphone, Mail, Globe } from "lucide-react";
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
    const colors = ["#ef4444", "#f59e0b", "#38BDF8", "#22FF88"];
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
  const identities = session?.user?.identities || [];
  const providers = session?.user?.app_metadata?.providers || ["email"];

  return (
    <div className="ks-tab-panel space-y-6" role="tabpanel" aria-label="Security & Authentication">
      {/* Change Password Card */}
      <div className="ks-card">
        <div className="ks-card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="ks-card-title">
              <Key size={20} color="#22FF88" />
              <span>Change Password</span>
            </h2>
            <p className="ks-card-desc">
              Update your account password with re-authentication security check.
            </p>
          </div>

          <a
            href={`${BASE_URL}forgot-password.html`}
            className="text-xs font-bold text-[#38BDF8] hover:underline"
          >
            Forgot your password?
          </a>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                required
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm text-white focus:border-[#22FF88] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              New Password (min 8 chars, letters & numbers)
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                required
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm text-white focus:border-[#22FF88] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength Meter */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Strength:</span>
                  <span style={{ color: strength.color, fontWeight: 700 }}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${(strength.score / 4) * 100}%`,
                      backgroundColor: strength.color
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm text-white focus:border-[#22FF88] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-[#22FF88]/30 bg-[#22FF88]/10 p-2.5 text-xs text-[#22FF88]">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#22FF88] to-[#38BDF8] text-xs font-black text-black hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? "Verifying & Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Connected Sign-In Methods */}
      <div className="ks-card">
        <div className="ks-card-header">
          <h2 className="ks-card-title text-base">
            <Shield size={18} color="#38BDF8" />
            <span>Connected Sign-in Methods</span>
          </h2>
          <p className="ks-card-desc">
            Authentication providers linked to your KSAM Deal account.
          </p>
        </div>

        <div className="space-y-3">
          {providers.includes("email") && (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#22FF88]/10 text-[#22FF88]">
                  <Mail size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Email & Password</h4>
                  <p className="text-[11px] text-gray-400">{session?.user?.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#22FF88]/15 text-[#22FF88]">
                Active
              </span>
            </div>
          )}

          {providers.filter((p) => p !== "email").map((provider) => (
            <div key={provider} className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#38BDF8]/10 text-[#38BDF8]">
                  <Globe size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white capitalize">{provider} OAuth</h4>
                  <p className="text-[11px] text-gray-400">Third-party social authentication</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8]">
                Linked
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Global Device Sign-out Card */}
      <div className="ks-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <LogOut size={16} className="text-amber-400" />
              Sign Out from All Devices
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Revoke active refresh tokens on all computers, tablets, and phones where you are signed in.
            </p>
          </div>

          <button
            type="button"
            disabled={signingOutAll}
            onClick={handleSignOutAll}
            className="shrink-0 px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-400 transition"
          >
            {signingOutAll ? "Signing out..." : "Sign Out Everywhere"}
          </button>
        </div>
      </div>
    </div>
  );
}
