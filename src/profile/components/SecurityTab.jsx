import { useState, useMemo } from "react";
import { Shield, Key, LogOut, Eye, EyeOff, AlertCircle, CheckCircle, Smartphone } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { signOut, BASE_URL } from "../../auth/auth.js";

export default function SecurityTab({ onShowToast }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  // Password strength calculation
  const strength = useMemo(() => {
    if (!newPassword) return { score: 0, label: "Enter a password", level: 0 };
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) score++;
    if (/\d/.test(newPassword)) score++;
    if (/[^a-zA-Z0-9]/.test(newPassword)) score++;

    const labels = ["Weak", "Fair", "Good", "Strong"];
    return {
      score,
      label: labels[score - 1] || "Weak",
      level: score
    };
  }, [newPassword]);

  // Handle password update
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setSuccess("Your password has been updated securely!");
      setNewPassword("");
      setConfirmPassword("");
      onShowToast("Password changed successfully!");
    } catch (err) {
      console.error("[Password Update Error]", err);
      setError(err.message || "Failed to update password. Please re-authenticate.");
    } finally {
      setLoading(false);
    }
  };

  // Sign out single session
  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      window.location.href = `${BASE_URL}index.html`;
    } catch (err) {
      console.error("[Sign Out Error]", err);
      setSigningOut(false);
    }
  };

  // Sign out all devices
  const handleSignOutAll = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut({ scope: "global" });
      window.location.href = `${BASE_URL}login.html`;
    } catch (err) {
      console.error("[Sign Out All Error]", err);
      setSigningOut(false);
    }
  };

  return (
    <div className="ks-tab-panel" role="tabpanel" aria-label="Security & Authentication">
      {/* Change Password Card */}
      <div className="ks-card">
        <div className="ks-card-header">
          <h2 className="ks-card-title">
            <Key size={20} color="#22FF88" />
            <span>Change Password</span>
          </h2>
          <p className="ks-card-desc">
            Ensure your account is protected with a unique, robust password.
          </p>
        </div>

        {error && (
          <div
            className="ks-input-error"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              padding: "10px 14px",
              borderRadius: 10,
              marginBottom: 16
            }}
          >
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              color: "#22FF88",
              background: "rgba(34, 255, 136, 0.1)",
              border: "1px solid rgba(34, 255, 136, 0.3)",
              padding: "10px 14px",
              borderRadius: 10,
              marginBottom: 16,
              fontSize: 13.5,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div className="ks-form-grid">
            {/* New Password */}
            <div className="ks-float-group">
              <div style={{ position: "relative" }}>
                <input
                  type={showNew ? "text" : "password"}
                  className="ks-float-input"
                  style={{ paddingRight: 44 }}
                  placeholder=" "
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <label className="ks-float-label">New Password</label>
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: 4
                  }}
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength Meter Bar */}
              {newPassword && (
                <div style={{ marginTop: 8 }}>
                  <div className="ks-strength-bar">
                    <span className={`ks-strength-seg${strength.level >= 1 ? ` lvl-${strength.level}` : ""}`} />
                    <span className={`ks-strength-seg${strength.level >= 2 ? ` lvl-${strength.level}` : ""}`} />
                    <span className={`ks-strength-seg${strength.level >= 3 ? ` lvl-${strength.level}` : ""}`} />
                    <span className={`ks-strength-seg${strength.level >= 4 ? ` lvl-${strength.level}` : ""}`} />
                  </div>
                  <span className="ks-strength-lbl">Strength: {strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="ks-float-group">
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  className="ks-float-input"
                  style={{ paddingRight: 44 }}
                  placeholder=" "
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <label className="ks-float-label">Confirm New Password</label>
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: 4
                  }}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <button
              type="submit"
              className="ks-btn-primary"
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Session Management Card */}
      <div className="ks-card">
        <div className="ks-card-header">
          <h2 className="ks-card-title">
            <Smartphone size={20} color="#38BDF8" />
            <span>Active Sessions & Sign Out</span>
          </h2>
          <p className="ks-card-desc">
            Manage your active authentication sessions or quickly log out from all browsers.
          </p>
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <button
            type="button"
            className="ks-btn-secondary"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>

          <button
            type="button"
            className="ks-btn-danger"
            onClick={handleSignOutAll}
            disabled={signingOut}
          >
            <Shield size={16} />
            <span>Sign Out from All Devices</span>
          </button>
        </div>
      </div>
    </div>
  );
}
