import { useState, useEffect, useRef } from "react";
import { ShieldAlert, Trash2, LogOut, AlertTriangle, X, Lock } from "lucide-react";
import gsap from "gsap";
import { supabase } from "../../lib/supabase";
import { signOut, BASE_URL } from "../../auth/auth.js";
import { respectReducedMotion } from "../../lib/motion.js";

export default function DangerZoneTab({
  session,
  onShowToast,
  onModalStateChange
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const panelRef = useRef(null);

  useEffect(() => {
    if (onModalStateChange) {
      onModalStateChange(modalOpen);
    }
  }, [modalOpen, onModalStateChange]);

  useEffect(() => {
    if (respectReducedMotion() || !panelRef.current) return;

    const ctx = gsap.context(() => {
      const intro = panelRef.current.querySelector(".kx-danger-intro-bar");
      const cards = panelRef.current.querySelectorAll(".kx-spot");
      const tl = gsap.timeline();

      if (intro) {
        tl.fromTo(
          intro,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
        );
      }
      if (cards.length > 0) {
        tl.fromTo(
          cards,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.32, stagger: 0.08, ease: "power2.out" },
          "-=0.15"
        );
      }
    }, panelRef);

    return () => ctx.revert();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = `${BASE_URL}index.html`;
    } catch (err) {
      console.error("[Logout Error]", err);
      onShowToast("Failed to log out.");
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError("");

    if (confirmText.trim() !== "DELETE") {
      setError("Please type DELETE in capital letters to confirm.");
      return;
    }

    if (!password) {
      setError("Please enter your current password.");
      return;
    }

    setLoading(true);
    try {
      const email = session?.user?.email;
      if (!email) throw new Error("No active session found.");

      // 1. Verify password via re-authentication
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInErr) {
        throw new Error("Password incorrect. Please verify your current password.");
      }

      // 2. Invoke delete-account Edge Function
      const { data, error: fnError } = await supabase.functions.invoke("delete-account", {
        method: "POST"
      });

      if (fnError) {
        throw fnError;
      }

      // 3. Clear local session
      await supabase.auth.signOut();
      localStorage.removeItem("ksam_recently_viewed");

      // 4. Redirect with goodbye toast message
      sessionStorage.setItem(
        "ksam_toast",
        "Your account and all associated data have been permanently deleted. Goodbye!"
      );
      window.location.href = `${BASE_URL}index.html`;
    } catch (err) {
      console.error("[Account deletion error]", err);
      setError(err.message || "Failed to delete account. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={panelRef}
      className="ks-tab-panel"
      role="tabpanel"
      aria-label="Danger Zone"
    >
      {/* 1. Open Intro Block with 3px red-amber left accent bar (max 70ch) */}
      <div className="kx-danger-intro-bar">
        The actions in this section are destructive and permanent. Account deletion cannot be undone. All saved delivery addresses, price alert subscriptions, personalized preferences, and activity history will be immediately erased under Indian DPDP Act 2023.
      </div>

      <div className="kx-spot-list flex flex-col gap-6">
        {/* 2. Destructive Spotlight Card (Red Tone) */}
        <div className="kx-spot" data-tone="red" tabIndex={0}>
          <div className="kx-spot-content">
            <div className="kx-spot-icon-tile kx-spot-icon-tile--red">
              <AlertTriangle size={22} />
            </div>
            <div className="kx-spot-text-wrap">
              <h4 className="kx-spot-title text-red-600 font-bold">
                Delete Account Permanently
              </h4>
              <p className="kx-spot-desc text-[#475569]">
                Permanently purge your account credentials, avatar, addresses, alerts, and activity history.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setConfirmText("");
              setPassword("");
              setError("");
              setModalOpen(true);
            }}
            className="su-btn-delete-account"
            aria-haspopup="dialog"
          >
            <Trash2 size={15} />
            <span>Delete My Account</span>
          </button>
        </div>

        {/* 3. Calm Session Management Spotlight Card (Blue Tone, 24px gap) */}
        <div className="kx-spot" data-tone="blue" tabIndex={0}>
          <div className="kx-spot-content">
            <div className="kx-spot-icon-tile kx-spot-icon-tile--blue">
              <LogOut size={20} />
            </div>
            <div className="kx-spot-text-wrap">
              <h4 className="kx-spot-title text-[#0F172A] font-bold">Active Browser Session</h4>
              <p className="kx-spot-desc text-[#475569]">
                Sign out of this browser session. You can sign back in at any time with your credentials.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="su-btn-signout"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Restyled Confirmation Modal with 24px radius & blurred backdrop */}
      {modalOpen && (
        <div
          className="kx-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="kx-modal-card">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute right-5 top-5 text-[#64748B] hover:text-[#0F172A] transition"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle size={24} />
              <h3 id="delete-dialog-title" className="text-lg font-bold text-[#0F172A] tracking-[-0.01em]">
                Permanently Delete Account?
              </h3>
            </div>

            <div className="rounded-2xl border border-red-200 bg-[#FEF2F2] p-4 text-xs text-[#991B1B] mb-5 leading-relaxed">
              <p className="font-bold mb-1.5 text-[#7F1D1D]">What will be permanently deleted:</p>
              <ul className="list-disc pl-4 space-y-1 text-[#991B1B]">
                <li>Your customer profile, name, phone, and birthdate</li>
                <li>All saved delivery addresses</li>
                <li>Your active and past price drop alert subscriptions</li>
                <li>Your recently viewed deal history and saved wishlist</li>
                <li>Your uploaded profile avatars and media files</li>
              </ul>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Type <span className="font-black text-red-600">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  required
                  placeholder="DELETE"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full rounded-xl border border-[rgba(163,177,198,0.25)] bg-[#E6EBF1] shadow-[inset_2px_2px_5px_rgba(163,177,198,0.35),inset_-2px_-2px_5px_rgba(255,255,255,0.85)] px-3.5 py-2.5 text-sm font-bold text-[#0F172A] focus:border-red-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[rgba(163,177,198,0.25)] bg-[#E6EBF1] shadow-[inset_2px_2px_5px_rgba(163,177,198,0.35),inset_-2px_-2px_5px_rgba(255,255,255,0.85)] px-3.5 py-2.5 text-sm text-[#0F172A] focus:border-red-500 focus:outline-none transition"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-300 bg-[#FEE2E2] p-2.5 text-xs text-red-600 font-semibold">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || confirmText !== "DELETE" || !password}
                  className="su-btn-delete-account"
                  style={{ opacity: (loading || confirmText !== "DELETE" || !password) ? 0.45 : 1 }}
                >
                  {loading ? "Deleting Forever..." : "Permanently Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
