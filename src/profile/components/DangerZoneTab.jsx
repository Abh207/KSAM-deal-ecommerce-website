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
              <h4 className="kx-spot-title text-red-400">
                Delete Account Permanently
              </h4>
              <p className="kx-spot-desc">
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
            className="kx-btn-danger-outline"
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
              <h4 className="kx-spot-title">Active Browser Session</h4>
              <p className="kx-spot-desc">
                Sign out of this browser session. You can sign back in at any time with your credentials.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="ks-btn-secondary shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition"
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
              className="absolute right-5 top-5 text-gray-400 hover:text-white transition"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle size={24} />
              <h3 id="delete-dialog-title" className="text-lg font-bold text-white tracking-[-0.01em]">
                Permanently Delete Account?
              </h3>
            </div>

            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-xs text-red-200 mb-5 leading-relaxed">
              <p className="font-bold mb-1.5 text-white">What will be permanently deleted:</p>
              <ul className="list-disc pl-4 space-y-1 text-red-300">
                <li>Your customer profile, name, phone, and birthdate</li>
                <li>All saved delivery addresses</li>
                <li>Your active and past price drop alert subscriptions</li>
                <li>Your recently viewed deal history and saved wishlist</li>
                <li>Your uploaded profile avatars and media files</li>
              </ul>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Type <span className="font-black text-red-400">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  required
                  placeholder="DELETE"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full rounded-xl border border-[rgba(148,163,184,0.20)] bg-[#080D15] px-3.5 py-2.5 text-sm font-bold text-[#E2E8F0] focus:border-red-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[rgba(148,163,184,0.20)] bg-[#080D15] px-3.5 py-2.5 text-sm text-[#E2E8F0] focus:border-red-500 focus:outline-none transition"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || confirmText !== "DELETE" || !password}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black text-white disabled:opacity-40 transition shadow-lg"
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
