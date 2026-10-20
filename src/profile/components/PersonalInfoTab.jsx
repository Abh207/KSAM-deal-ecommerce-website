import { useState, useId } from "react";
import { User, Mail, Phone, Calendar, ChevronDown, Sparkles, AlertCircle } from "lucide-react";

export default function PersonalInfoTab({
  formData,
  errors = {},
  onChange
}) {
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const dobId = useId();
  const genderId = useId();

  return (
    <div className="ks-tab-panel" role="tabpanel" aria-label="Personal Information">
      <div className="ks-card">
        <div className="ks-card-header">
          <h2 className="ks-card-title">
            <User size={20} color="#22FF88" />
            <span>Personal Information</span>
          </h2>
          <p className="ks-card-desc">
            Keep your personal details updated for seamless checkout, notifications, and customer support.
          </p>
        </div>

        <div className="ks-form-grid">
          {/* Full Name */}
          <div className="ks-float-group">
            <input
              id={nameId}
              type="text"
              className="ks-float-input"
              placeholder=" "
              value={formData.full_name || ""}
              onChange={(e) => onChange("full_name", e.target.value)}
              autoComplete="name"
            />
            <label htmlFor={nameId} className="ks-float-label">
              Full Name
            </label>
            {errors.full_name && (
              <span className="ks-input-error">
                <AlertCircle size={13} /> {errors.full_name}
              </span>
            )}
          </div>

          {/* Email (Read-only from Supabase Auth) */}
          <div className="ks-float-group">
            <input
              id={emailId}
              type="email"
              className="ks-float-input"
              placeholder=" "
              value={formData.email || ""}
              readOnly
              title="Email address is tied to your login account and cannot be modified directly."
            />
            <label htmlFor={emailId} className="ks-float-label">
              Email Address (Account ID)
            </label>
            <span style={{ fontSize: "11px", color: "#64748b", marginTop: 4 }}>
              Managed by your KSAM Deal login credentials
            </span>
          </div>

          {/* Phone Number (+91 and 10-digit validation) */}
          <div className="ks-float-group">
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  bottom: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#94a3b8",
                  userSelect: "none"
                }}
              >
                +91
              </span>
              <input
                id={phoneId}
                type="tel"
                className="ks-float-input"
                style={{ paddingLeft: 48 }}
                placeholder=" "
                maxLength={10}
                value={formData.phone || ""}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
                  onChange("phone", cleaned);
                }}
                autoComplete="tel"
              />
              <label htmlFor={phoneId} className="ks-float-label">
                Mobile Number (10 digits)
              </label>
            </div>
            {errors.phone && (
              <span className="ks-input-error">
                <AlertCircle size={13} /> {errors.phone}
              </span>
            )}
          </div>

          {/* Date of Birth */}
          <div className="ks-float-group">
            <input
              id={dobId}
              type="date"
              className="ks-float-input"
              placeholder=" "
              max={new Date().toISOString().split("T")[0]}
              value={formData.date_of_birth || ""}
              onChange={(e) => onChange("date_of_birth", e.target.value)}
            />
            <label htmlFor={dobId} className="ks-float-label">
              Date of Birth
            </label>
            {errors.date_of_birth && (
              <span className="ks-input-error">
                <AlertCircle size={13} /> {errors.date_of_birth}
              </span>
            )}
          </div>

          {/* Gender */}
          <div className="ks-float-group ks-form-col-full">
            <div style={{ position: "relative" }}>
              <select
                id={genderId}
                className={`ks-float-select${formData.gender ? " has-value" : ""}`}
                value={formData.gender || ""}
                onChange={(e) => onChange("gender", e.target.value)}
              >
                <option value="" disabled hidden></option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
              <label htmlFor={genderId} className="ks-float-label">
                Gender (Optional)
              </label>
              <ChevronDown size={18} className="ks-select-arrow" />
            </div>
          </div>
        </div>
      </div>

      {/* Marketing Opt-in Switch */}
      <div className="ks-switch-row">
        <div className="ks-switch-info">
          <span className="ks-switch-title">Marketing & Deal Communications</span>
          <span className="ks-switch-desc">
            Receive curated discount alerts, exclusive flash deals, and promotional vouchers via email and SMS.
          </span>
        </div>
        <label className="ks-switch" aria-label="Toggle marketing communications">
          <input
            type="checkbox"
            checked={!!formData.marketing_opt_in}
            onChange={(e) => onChange("marketing_opt_in", e.target.checked)}
          />
          <span className="ks-slider" />
        </label>
      </div>
    </div>
  );
}
