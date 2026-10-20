import { useState, useEffect } from "react";
import { Bell, X, CheckCircle2, AlertCircle, TrendingDown } from "lucide-react";
import { savePriceAlert } from "../services/accountActivityService.js";
import { getSession, requireAuth } from "../../auth/auth.js";

export default function PriceAlertModal({ product, isOpen, onClose, onSuccess }) {
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      // Suggest 10% discount from current price
      const suggested = Math.max(1, Math.floor(Number(product.price || 0) * 0.9));
      setTargetPrice(suggested.toString());
      setError("");
      setSuccess(false);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const currentPrice = Number(product.price || 0);
  const targetNum = Number(targetPrice || 0);
  const diffPercent = currentPrice > 0 && targetNum < currentPrice
    ? Math.round(((currentPrice - targetNum) / currentPrice) * 100)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const session = await getSession();
    if (!session?.user?.id) {
      requireAuth({ returnTo: window.location.href });
      return;
    }

    if (!targetNum || targetNum <= 0) {
      setError("Please enter a valid price greater than ₹0.");
      return;
    }

    if (targetNum >= currentPrice) {
      setError("Target price should be lower than the current price (₹" + currentPrice.toLocaleString("en-IN") + ").");
      return;
    }

    setLoading(true);
    try {
      const res = await savePriceAlert(product.id, targetNum);
      if (res.error) {
        if (res.error === "AUTH_REQUIRED") return;
        setError(res.error);
        return;
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess(targetNum);
      }
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || "Failed to set price alert.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl shadow-black/80">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 rounded-xl p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {success ? (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#22FF88]/15 text-[#22FF88] border border-[#22FF88]/30">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">Price Alert Set!</h3>
            <p className="text-xs text-gray-300">
              We are monitoring <strong>{product.name}</strong> for when it drops below ₹{targetNum.toLocaleString("en-IN")}.
            </p>
            <p className="text-[11px] text-gray-500 rounded-lg bg-white/5 p-2">
              We'll notify you by email when this is available.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/20">
                <Bell size={20} />
              </div>
              <div>
                <h3 id="alert-modal-title" className="text-base font-bold text-white">
                  Set Price Alert
                </h3>
                <p className="text-xs text-gray-400 line-clamp-1">{product.name}</p>
              </div>
            </div>

            {/* Current vs Target Price Card */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span>Current Price:</span>
                <span className="font-bold text-white">
                  ₹{currentPrice.toLocaleString("en-IN")}
                </span>
              </div>
              {diffPercent > 0 && (
                <div className="flex items-center justify-between text-[#22FF88]">
                  <span className="flex items-center gap-1">
                    <TrendingDown size={13} /> Desired Drop:
                  </span>
                  <span className="font-bold">
                    {diffPercent}% OFF current
                  </span>
                </div>
              )}
            </div>

            {/* Target Price Input */}
            <div>
              <label htmlFor="target-price-input" className="block text-xs font-semibold text-gray-300 mb-1.5">
                Notify me when price drops to (₹ INR)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-sm font-bold text-gray-400">₹</span>
                <input
                  id="target-price-input"
                  type="number"
                  min="1"
                  max={currentPrice - 1}
                  step="1"
                  required
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/60 pl-8 pr-4 py-2.5 text-sm font-bold text-white placeholder-gray-500 focus:border-[#22FF88] focus:outline-none focus:ring-1 focus:ring-[#22FF88]"
                  placeholder={`e.g. ${Math.floor(currentPrice * 0.9)}`}
                />
              </div>
            </div>

            {/* In-scope Note */}
            <div className="rounded-xl border border-[#38BDF8]/20 bg-[#38BDF8]/5 p-2.5 text-[11px] text-[#38BDF8]">
              <strong>Note:</strong> We'll notify you by email when this is available. Alerts can be managed anytime in your Profile Hub.
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-400 hover:bg-white/10 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#22FF88] to-[#38BDF8] px-5 py-2 text-xs font-black text-black hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Set Alert"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
