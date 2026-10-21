import { useState, useId, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Camera,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import gsap from "gsap";
import { supabase } from "../../lib/supabase";
import { BASE_URL } from "../../auth/auth.js";
import { respectReducedMotion } from "../../lib/motion.js";

export default function PersonalInfoTab({
  formData,
  errors = {},
  onChange,
  session,
  profile,
  onOpenAvatarModal,
  onRemoveAvatar,
  onShowToast
}) {
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const dobId = useId();
  const genderId = useId();

  const containerRef = useRef(null);
  const avatarRingRef = useRef(null);

  // Focus tracking for smooth floating labels
  const [focusedField, setFocusedField] = useState(null);

  // Change Email Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Check if there is a pending email change from Supabase Auth
  const pendingEmail = session?.user?.new_email;

  // Phase 3: Orchestrated motion on mount
  useEffect(() => {
    if (respectReducedMotion()) return;

    const ctx = gsap.context(() => {
      // 1. Avatar ring draw-in
      if (avatarRingRef.current) {
        gsap.fromTo(
          avatarRingRef.current,
          { scale: 0.88, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.45, ease: "power2.out" }
        );
      }

      // 2. Cards fade up together
      const cards = containerRef.current?.querySelectorAll(".ks-photo-card, .ks-profile-form-card");
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setEmailError("");

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (newEmail.trim().toLowerCase() === (session?.user?.email || "").toLowerCase()) {
      setEmailError("The new email must be different from your current email.");
      return;
    }

    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser(
        { email: newEmail.trim() },
        { emailRedirectTo: `${BASE_URL}email-verified.html` }
      );

      if (error) throw error;

      setEmailSuccess(true);
      onShowToast("Confirmation email sent! Check your new inbox.");
      setTimeout(() => {
        setEmailModalOpen(false);
        setEmailSuccess(false);
        setNewEmail("");
      }, 3000);
    } catch (err) {
      console.error("[Email Change Error]", err);
      setEmailError(err.message || "Failed to update email.");
    } finally {
      setEmailLoading(false);
    }
  };

  const initials = (formData.full_name || session?.user?.email || "U").slice(0, 2).toUpperCase();
  const currentEmail = formData.email || session?.user?.email || "";

  return (
    <div
      ref={containerRef}
      className="ks-profile-edit-grid"
      role="tabpanel"
      aria-label="Edit Profile"
    >
      {/* 1. Left Sticky Photo Card */}
      <aside className="ks-photo-card" aria-label="Profile Avatar">
        <div className="ks-photo-card-avatar-section">
          {/* 112px Avatar with thin green ring and anchored camera button */}
          <div className="ks-avatar-anchor-wrap" ref={avatarRingRef}>
            <div className="ks-avatar-anchor-circle">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={formData.full_name || "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-3xl font-black text-[#22FF88] tracking-wider select-none">
                  {initials}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenAvatarModal}
              className="ks-avatar-anchor-btn"
              title="Upload new profile picture"
              aria-label="Upload new profile picture"
            >
              <Camera size={16} />
            </button>
          </div>

          {/* User Identity Details */}
          <div className="ks-photo-user-meta">
            <h4 className="ks-photo-name">
              {formData.full_name || "Deal Hunter"}
            </h4>
            <p className="ks-photo-email" title={currentEmail}>
              {currentEmail}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ks-photo-actions">
          <button
            type="button"
            onClick={onOpenAvatarModal}
            className="ks-btn-primary ks-photo-primary-btn"
          >
            <Camera size={15} />
            <span>Upload New Photo</span>
          </button>

          {profile?.avatar_url && (
            <button
              type="button"
              onClick={onRemoveAvatar}
              className="ks-photo-ghost-btn"
            >
              <Trash2 size={13} />
              <span>Remove Photo</span>
            </button>
          )}
        </div>

        {/* Muted specs note */}
        <p className="ks-photo-specs-note">
          Square JPG, PNG, or WebP up to 5MB. Automatically cropped to high-res 400x400.
        </p>
      </aside>

      {/* 2. Right Form Card */}
      <section className="ks-profile-form-card" aria-label="Personal Details Form">
        {/* Header Row: Title & Desc on Left, DPDP 2023 Pill on Right (No stray white line) */}
        <div className="ks-form-card-header">
          <div className="ks-form-header-left">
            <h3 className="ks-form-card-title">
              <User size={18} className="text-[#22FF88] shrink-0" />
              <span>Personal Details</span>
            </h3>
            <p className="ks-form-card-desc">
              Your contact and shipping profile details across KSAM Deal.
            </p>
          </div>

          <div className="ks-dpdp-pill" aria-label="DPDP 2023 Protected">
            <ShieldCheck size={14} className="shrink-0 text-[#22FF88]" />
            <span>DPDP 2023 Protected</span>
          </div>
        </div>

        {/* Form Fields: 2-column grid with 16px gaps, align-items: start */}
        <div className="ks-profile-form-grid">
          {/* 1. Full Name (Floating Label) */}
          <div className="ks-field-container">
            <div className={`ks-unified-field ${focusedField === 'name' || formData.full_name ? 'is-floating' : ''} ${errors.full_name ? 'is-error' : ''}`}>
              <input
                id={nameId}
                type="text"
                className="ks-unified-input"
                placeholder=" "
                value={formData.full_name || ""}
                onChange={(e) => onChange("full_name", e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                autoComplete="name"
              />
              <label htmlFor={nameId} className="ks-unified-label">
                Full Name
              </label>
            </div>
            {errors.full_name && (
              <span className="ks-field-error-text">
                <AlertCircle size={13} className="shrink-0" /> {errors.full_name}
              </span>
            )}
          </div>

          {/* 2. Email Address (Floating Label with Non-overlapping Change Button) */}
          <div className="ks-field-container">
            <div className={`ks-unified-field is-readonly ${focusedField === 'email' || currentEmail ? 'is-floating' : ''}`}>
              <input
                id={emailId}
                type="email"
                className="ks-unified-input ks-unified-input--email"
                placeholder=" "
                value={currentEmail}
                title={currentEmail}
                readOnly
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
              <label htmlFor={emailId} className="ks-unified-label ks-unified-label--email">
                Email Address
              </label>
              <button
                type="button"
                onClick={() => setEmailModalOpen(true)}
                className="ks-email-change-btn"
                aria-label="Change email address"
              >
                Change
              </button>
            </div>

            {/* Pending change indicator or standard helper text */}
            {pendingEmail ? (
              <div className="ks-pending-email-badge">
                <Clock size={14} className="shrink-0 text-amber-400" />
                <span>
                  Confirmation link sent to <strong>{pendingEmail}</strong>. Email will update once confirmed.
                </span>
              </div>
            ) : (
              <span className="ks-field-helper-text">
                Primary login & notifications email
              </span>
            )}
          </div>

          {/* 3. Mobile Number (+91 Prefix Inside Same 56px Field with Floating Label) */}
          <div className="ks-field-container">
            <div className={`ks-unified-field ks-unified-field--phone ${focusedField === 'phone' || formData.phone ? 'is-floating' : ''} ${errors.phone ? 'is-error' : ''}`}>
              <div className="ks-phone-prefix-chip" aria-hidden="true">
                +91
              </div>
              <input
                id={phoneId}
                type="tel"
                className="ks-unified-input ks-unified-input--phone"
                placeholder=" "
                maxLength={10}
                value={formData.phone || ""}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
                  onChange("phone", cleaned);
                }}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                autoComplete="tel"
              />
              <label htmlFor={phoneId} className="ks-unified-label ks-unified-label--phone">
                Mobile Number (10 digits)
              </label>
            </div>

            {errors.phone ? (
              <span className="ks-field-error-text">
                <AlertCircle size={13} className="shrink-0" /> {errors.phone}
              </span>
            ) : (
              <span className="ks-field-helper-text">
                Used for instant drop alerts and order dispatch SMS
              </span>
            )}
          </div>

          {/* 4. Date of Birth (Floating Label with Dark Picker Indicator) */}
          <div className="ks-field-container">
            <div className={`ks-unified-field ${focusedField === 'dob' || formData.date_of_birth ? 'is-floating' : ''}`}>
              <input
                id={dobId}
                type="date"
                className="ks-unified-input ks-unified-input--date"
                placeholder=" "
                value={formData.date_of_birth || ""}
                onChange={(e) => onChange("date_of_birth", e.target.value)}
                onFocus={() => setFocusedField('dob')}
                onBlur={() => setFocusedField(null)}
                max={new Date().toISOString().split("T")[0]}
              />
              <label htmlFor={dobId} className="ks-unified-label">
                Date of Birth
              </label>
            </div>
          </div>

          {/* 5. Gender (Floating Label Select Dropdown) */}
          <div className="ks-field-container ks-field-container--full">
            <div className={`ks-unified-field ${focusedField === 'gender' || formData.gender ? 'is-floating' : ''}`}>
              <select
                id={genderId}
                className="ks-unified-select"
                value={formData.gender || ""}
                onChange={(e) => onChange("gender", e.target.value)}
                onFocus={() => setFocusedField('gender')}
                onBlur={() => setFocusedField(null)}
              >
                <option value="" disabled hidden></option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non_binary">Non-binary / Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
              <label htmlFor={genderId} className="ks-unified-label">
                Gender (Optional)
              </label>
              <div className="ks-select-chevron" aria-hidden="true">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Change Email Modal Dialog */}
      {emailModalOpen && (
        <div
          className="ks-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setEmailModalOpen(false)}
        >
          <div
            className="ks-unsaved-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Mail size={18} className="text-[#38BDF8]" />
              <span>Change Email Address</span>
            </h3>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              Enter your new email address. We will send a confirmation link to that inbox. Your login email will update only after you confirm.
            </p>

            {emailSuccess ? (
              <div className="py-4 text-center space-y-2">
                <CheckCircle2 size={36} className="mx-auto text-[#22FF88]" />
                <h4 className="text-sm font-bold text-white">Confirmation Link Sent!</h4>
                <p className="text-xs text-gray-300">
                  Please check <strong>{newEmail}</strong> and click the link to confirm your new email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleChangeEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="ks-password-input"
                  />
                </div>

                {emailError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setEmailModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:bg-white/10 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2DFFB2] to-[#25C9F7] text-xs font-black text-[#05070B] hover:opacity-95 disabled:opacity-50 transition cursor-pointer shadow-md"
                  >
                    {emailLoading ? "Sending Link..." : "Send Confirmation Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
