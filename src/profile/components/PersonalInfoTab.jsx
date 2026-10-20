import { useState, useId } from "react";
import { User, Mail, Phone, Calendar, ChevronDown, Camera, Trash2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { BASE_URL } from "../../auth/auth.js";

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

  // Change Email Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Check if there is a pending email change from Supabase Auth
  const pendingEmail = session?.user?.new_email;

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

  return (
    <div className="ks-tab-panel" role="tabpanel" aria-label="Personal Information">
      <div className="ks-card">
        <div className="ks-card-header">
          <h2 className="ks-card-title">
            <User size={20} color="#22FF88" />
            <span>Profile Details</span>
          </h2>
          <p className="ks-card-desc">
            Update your identity, contact information, and account details.
          </p>
        </div>

        {/* Avatar Section Inline */}
        <div className="mb-8 flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="relative">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-black border-2 border-[#22FF88]/40 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={formData.full_name || "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-xl font-black text-[#22FF88]">
                  {(formData.full_name || session?.user?.email || "U").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-white mb-1">Profile Photo</h3>
            <p className="text-xs text-gray-400 mb-3">
              Square JPG, PNG, or WebP up to 5MB. Automatically cropped to 400x400.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <button
                type="button"
                onClick={onOpenAvatarModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition"
              >
                <Camera size={14} /> Upload New
              </button>
              {profile?.avatar_url && (
                <button
                  type="button"
                  onClick={onRemoveAvatar}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
                >
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>
          </div>
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

          {/* Email Address with Change Action */}
          <div className="ks-float-group">
            <div className="relative flex items-center">
              <input
                id={emailId}
                type="email"
                className="ks-float-input"
                style={{ paddingRight: "100px" }}
                placeholder=" "
                value={formData.email || session?.user?.email || ""}
                readOnly
              />
              <label htmlFor={emailId} className="ks-float-label">
                Email Address
              </label>
              <button
                type="button"
                onClick={() => setEmailModalOpen(true)}
                className="absolute right-3 px-2.5 py-1 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] text-xs font-bold hover:bg-[#38BDF8] hover:text-black transition"
              >
                Change
              </button>
            </div>

            {/* Pending change indicator */}
            {pendingEmail ? (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 p-2 rounded-lg">
                <Clock size={13} className="shrink-0" />
                <span>
                  Confirmation link sent to <strong>{pendingEmail}</strong>. Email will update once confirmed.
                </span>
              </div>
            ) : (
              <span className="mt-1 text-[11px] text-gray-500">
                Primary login & notifications email
              </span>
            )}
          </div>

          {/* Fixed Phone Number Input (+91 Prefix without overlapping label) */}
          <div className="ks-float-group">
            <div className="ks-phone-input-group">
              <div className="ks-phone-prefix">
                <span>+91</span>
              </div>
              <div className="ks-phone-field-wrapper">
                <input
                  id={phoneId}
                  type="tel"
                  className="ks-float-input ks-phone-inner-input"
                  placeholder=" "
                  maxLength={10}
                  value={formData.phone || ""}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
                    onChange("phone", cleaned);
                  }}
                  autoComplete="tel"
                />
                <label htmlFor={phoneId} className="ks-float-label ks-phone-float-label">
                  Mobile Number (10 digits)
                </label>
              </div>
            </div>

            {errors.phone ? (
              <span className="ks-input-error">
                <AlertCircle size={13} /> {errors.phone}
              </span>
            ) : (
              <span className="mt-1 text-[11px] text-gray-500">
                Used for instant price-drop alerts and OTP security
              </span>
            )}
          </div>

          {/* Date of Birth */}
          <div className="ks-float-group">
            <input
              id={dobId}
              type="date"
              className="ks-float-input"
              value={formData.date_of_birth || ""}
              onChange={(e) => onChange("date_of_birth", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
            <label htmlFor={dobId} className="ks-float-label" style={{ top: 6, fontSize: 11, color: "#22FF88" }}>
              Date of Birth
            </label>
          </div>

          {/* Gender */}
          <div className="ks-float-group ks-form-col-full">
            <div className="relative">
              <select
                id={genderId}
                className="ks-float-select"
                value={formData.gender || ""}
                onChange={(e) => onChange("gender", e.target.value)}
              >
                <option value="" disabled>Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non_binary">Non-binary / Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
              <label htmlFor={genderId} className="ks-float-label" style={{ top: 6, fontSize: 11, color: "#22FF88" }}>
                Gender (Optional)
              </label>
              <div className="pointer-events-none absolute right-4 top-4 text-gray-400">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Email Modal */}
      {emailModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Mail size={18} className="text-[#38BDF8]" />
              Change Email Address
            </h3>
            <p className="text-xs text-gray-400 mb-4">
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
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm text-white focus:border-[#38BDF8] focus:outline-none"
                  />
                </div>

                {emailError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEmailModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:bg-white/10 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="px-4 py-2 rounded-xl bg-[#38BDF8] text-xs font-black text-black hover:opacity-90 disabled:opacity-50"
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
