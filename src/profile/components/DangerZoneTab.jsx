import { useState } from "react";
import { ShieldAlert, Trash2, LogOut, AlertTriangle, X, Check, Lock } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { signOut, BASE_URL } from "../../auth/auth.js";

export default function DangerZoneTab({
  session,
  onShowToast
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      sessionStorage.setItem("ksam_toast", "Your account and all associated data have been permanently deleted. Goodbye!");
      window.location.href = `${BASE_URL}index.html`;
    } catch (err) {
      console.error("[Account deletion error]", err);
      setError(err.message || "Failed to delete account. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ks-tab-panel" role="tabpanel" aria-label="Danger Zone">
      {/* Danger Zone Container */}
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4 text-red-400">
          <ShieldAlert size={24} />
          <h2 className="text-xl font-bold text-white">Danger Zone</h2>
        </div>

        <p className="text-xs text-gray-300 mb-6 leading-relaxed">
          The actions in this section are destructive and permanent. Account deletion cannot be undone. All saved data, addresses, price alert subscriptions, and wishlist records will be immediately erased.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Delete Account Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-500/20 bg-black/40">
            <div>
              <h3 className="text-sm font-bold text-white">Delete Account Permanently</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Permanently purge your account credentials, avatar, addresses, alerts, and activity history.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setConfirmText("");
                setPassword("");
                setError("");
                setModalOpen(true);
              }}
              className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition"
            >
              <Trash2 size={15} />
              <span>Delete My Account</span>
            </button>
          </div>

          {/* Sign Out Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-black/40">
            <div>
              <h3 className="text-sm font-bold text-white">Log Out</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Sign out of this browser session. You can sign back in at any time.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-red-500/40 bg-[#0a0a0a] p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-white">Permanently Delete Account?</h3>
            </div>

            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-200 mb-5 leading-relaxed">
              <p className="font-bold mb-1">What will be permanently deleted:</p>
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
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Type <span className="font-black text-red-400">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  required
                  placeholder="DELETE"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm font-bold text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || confirmText !== "DELETE" || !password}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black text-white disabled:opacity-40 transition"
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
