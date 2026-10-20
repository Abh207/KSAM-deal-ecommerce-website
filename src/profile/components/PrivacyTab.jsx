import { useState } from "react";
import { ShieldAlert, FileText, CheckCircle, AlertTriangle, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { BASE_URL } from "../../auth/auth.js";

export default function PrivacyTab({
  profile,
  userId,
  onShowToast,
  onReloadProfile
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState("I no longer use this service");
  const [loading, setLoading] = useState(false);

  const preferences = profile?.preferences || {};
  const isDeletionRequested = !!preferences.deletion_requested_at;

  const handleConfirmDeletion = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const updatedPreferences = {
        ...preferences,
        deletion_requested_at: new Date().toISOString(),
        deletion_reason: reason
      };

      const { error } = await supabase
        .from("profiles")
        .update({ preferences: updatedPreferences })
        .eq("id", userId);

      if (error) throw error;

      setModalOpen(false);
      onShowToast("Account deletion request submitted.");
      onReloadProfile();
    } catch (err) {
      console.error("[Deletion Request Error]", err);
      onShowToast("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const updatedPreferences = { ...preferences };
      delete updatedPreferences.deletion_requested_at;
      delete updatedPreferences.deletion_reason;

      const { error } = await supabase
        .from("profiles")
        .update({ preferences: updatedPreferences })
        .eq("id", userId);

      if (error) throw error;

      onShowToast("Account deletion request cancelled.");
      onReloadProfile();
    } catch (err) {
      console.error("[Cancel Deletion Error]", err);
      onShowToast("Failed to cancel request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ks-tab-panel" role="tabpanel" aria-label="Privacy & Data Control">
      {/* Account Deletion Card */}
      <div className="ks-card">
        <div className="ks-card-header">
          <h2 className="ks-card-title">
            <ShieldAlert size={20} color="#f87171" />
            <span>Account Deletion</span>
          </h2>
          <p className="ks-card-desc">
            Request permanent erasure of your account, saved addresses, profile information, and shopping preferences.
          </p>
        </div>

        {isDeletionRequested ? (
          <div
            style={{
              padding: 20,
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              borderRadius: 14,
              display: "flex",
              flexDirection: "column",
              gap: 12
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#f87171", fontWeight: 700 }}>
              <AlertTriangle size={18} />
              <span>Deletion Request Pending</span>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: "#cbd5e1", lineHeight: 1.6 }}>
              You submitted an account deletion request on{" "}
              <strong>
                {new Date(preferences.deletion_requested_at).toLocaleDateString("en-IN", {
                  dateStyle: "long"
                })}
              </strong>
              . In accordance with data privacy regulations, our compliance team is processing your request.
            </p>
            <div>
              <button
                type="button"
                className="ks-btn-secondary"
                onClick={handleCancelDeletion}
                disabled={loading}
              >
                {loading ? "Cancelling..." : "Cancel Deletion Request"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <button
              type="button"
              className="ks-btn-danger"
              onClick={() => setModalOpen(true)}
            >
              <ShieldAlert size={16} />
              <span>Request Account Deletion</span>
            </button>
          </div>
        )}
      </div>

      {/* Privacy Policy and Information */}
      <div className="ks-card">
        <div className="ks-card-header">
          <h2 className="ks-card-title">
            <FileText size={20} color="#38BDF8" />
            <span>Privacy Policy & Legal Terms</span>
          </h2>
          <p className="ks-card-desc">
            We value your personal privacy and comply with global consumer protection regulations.
          </p>
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <a
            href={`${BASE_URL}contact.html`}
            className="ks-btn-secondary"
          >
            <FileText size={16} />
            <span>Contact Privacy Officer</span>
          </a>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div
          className="ks-modal-backdrop"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="ks-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="ks-modal-header">
              <h3 className="ks-modal-title" style={{ color: "#f87171" }}>
                Confirm Account Deletion
              </h3>
              <button
                type="button"
                className="ks-modal-close-btn"
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6 }}>
              Deleting your account is permanent. Once completed, your profile, saved delivery addresses, wishlist history, and personalized deal notifications will be permanently removed.
            </p>

            <div style={{ margin: "20px 0" }}>
              <label style={{ fontSize: 13, color: "#ffffff", fontWeight: 600, display: "block", marginBottom: 8 }}>
                Reason for leaving (Optional)
              </label>
              <select
                className="ks-float-select has-value"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="I no longer use this service">I no longer use this service</option>
                <option value="Privacy concerns">Privacy concerns</option>
                <option value="Too many emails/alerts">Too many emails/alerts</option>
                <option value="Created a duplicate account">Created a duplicate account</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="ks-modal-footer">
              <button
                type="button"
                className="ks-btn-secondary"
                onClick={() => setModalOpen(false)}
                disabled={loading}
              >
                Keep My Account
              </button>
              <button
                type="button"
                className="ks-btn-danger"
                onClick={handleConfirmDeletion}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Yes, Request Deletion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
