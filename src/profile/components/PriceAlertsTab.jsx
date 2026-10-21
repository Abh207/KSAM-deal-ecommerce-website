import { useState } from "react";
import { Bell, Trash2, Edit3, ArrowUpRight, CheckCircle2, TrendingDown, AlertCircle, ShoppingBag, X } from "lucide-react";
import { BASE_URL } from "../../auth/auth.js";
import { togglePriceAlert, updateAlertTarget, deletePriceAlert } from "../../deals/services/accountActivityService.js";

export default function PriceAlertsTab({
  alerts = [],
  onReloadAlerts,
  onShowToast
}) {
  const [editingAlert, setEditingAlert] = useState(null);
  const [newTarget, setNewTarget] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Toggle active state
  const handleToggle = async (alert) => {
    const nextState = !alert.is_active;
    const ok = await togglePriceAlert(alert.id, nextState);
    if (ok) {
      onShowToast(nextState ? "Alert activated" : "Alert paused");
      onReloadAlerts();
    } else {
      onShowToast("Failed to update alert status");
    }
  };

  // Open edit modal
  const handleOpenEdit = (alert) => {
    setEditingAlert(alert);
    setNewTarget(alert.target_price.toString());
  };

  // Save new target
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingAlert) return;

    const val = Number(newTarget);
    if (!val || val <= 0) {
      onShowToast("Target price must be greater than 0");
      return;
    }

    setActionLoading(true);
    try {
      const ok = await updateAlertTarget(editingAlert.id, val);
      if (ok) {
        onShowToast("Target price updated!");
        setEditingAlert(null);
        onReloadAlerts();
      } else {
        onShowToast("Failed to update target price");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Delete alert
  const handleDelete = async (alertId) => {
    if (!window.confirm("Are you sure you want to remove this price alert?")) return;
    const ok = await deletePriceAlert(alertId);
    if (ok) {
      onShowToast("Price alert removed");
      onReloadAlerts();
    } else {
      onShowToast("Failed to delete price alert");
    }
  };

  return (
    <div className="ks-tab-panel" role="tabpanel" aria-label="Price Alerts">
      <div className="ks-card">
        <div className="ks-card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="ks-card-title">
              <Bell size={20} color="#FFD60A" />
              <span>Active Price Alerts</span>
            </h2>
            <p className="ks-card-desc">
              Track products and get notified immediately when prices drop to your target.
            </p>
          </div>

          <div className="rounded-xl border border-[#38BDF8]/20 bg-[#38BDF8]/5 px-3 py-2 text-xs text-[#38BDF8]">
            We'll notify you by email when this is available.
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="ks-empty-state-stack">
            {/* Friendly CSS/SVG Illustration */}
            <div className="relative flex items-center justify-center w-24 h-24 mb-2">
              <div className="absolute inset-0 rounded-full bg-[#FFD60A]/10 animate-ping opacity-30" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD60A]/20 to-black border border-[#FFD60A]/30 text-[#FFD60A] shadow-[0_0_25px_rgba(255,214,10,0.2)]">
                <Bell size={32} />
              </div>
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-white">No Price Drop Monitors Active</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Hunting for the lowest price in India? Tap the bell icon on any deal or product to set a target drop price and receive instant notifications.
              </p>
            </div>
            <a
              href={`${BASE_URL}#deals`}
              className="ks-btn-primary ks-empty-state-btn inline-flex items-center gap-2"
            >
              <ShoppingBag size={15} />
              <span>Explore Trending Deals</span>
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const currentPrice = Number(alert.product?.price || 0);
              const targetPrice = Number(alert.target_price || 0);

              // Drop progress toward target
              // 100% means current price has met or passed the target
              const progressPct = currentPrice <= targetPrice
                ? 100
                : Math.max(0, Math.min(99, Math.round((1 - (currentPrice - targetPrice) / currentPrice) * 100)));

              const detailUrl = `${BASE_URL}deal.html?id=${encodeURIComponent(alert.product_id)}`;

              return (
                <div
                  key={alert.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    alert.is_active
                      ? "border-white/10 bg-[#0d1524] hover:border-white/20"
                      : "border-white/5 bg-white/[0.02] opacity-60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Product Info */}
                    <div className="flex items-center gap-4">
                      {alert.product?.image ? (
                        <img
                          src={alert.product.image}
                          alt=""
                          className="h-16 w-16 rounded-xl object-cover bg-black shrink-0"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-white/5 flex items-center justify-center font-bold text-gray-400 shrink-0">
                          P
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-gray-400">
                            {alert.product?.store || "Partner Store"}
                          </span>
                          {!alert.is_active && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Paused
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">
                          <a href={detailUrl} className="hover:text-[#22FF88] transition">
                            {alert.product?.name}
                          </a>
                        </h4>
                        <div className="mt-1 flex items-center gap-3 text-xs">
                          <span className="text-gray-400">
                            Current: <strong className="text-white">₹{currentPrice.toLocaleString("en-IN")}</strong>
                          </span>
                          <span className="text-gray-600">·</span>
                          <span className="text-[#22FF88]">
                            Target: <strong className="font-black">₹{targetPrice.toLocaleString("en-IN")}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Controls: Switch, Edit, Delete */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {/* On/Off Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggle(alert)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          alert.is_active ? "bg-[#22FF88]" : "bg-gray-700"
                        }`}
                        aria-label="Toggle price alert active"
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                            alert.is_active ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(alert)}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-400 hover:text-white hover:border-white/20 transition"
                        title="Edit target price"
                      >
                        <Edit3 size={15} />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(alert.id)}
                        className="rounded-xl border border-red-500/20 bg-red-500/5 p-2 text-red-400 hover:bg-red-500/10 transition"
                        title="Remove alert"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Toward Target */}
                  <div className="mt-4 pt-1 flex items-center justify-between gap-4 text-xs">
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                        <span>Drop Progress</span>
                        <span>{progressPct}% towards target</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#38BDF8] to-[#22FF88]"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <a
                      href={detailUrl}
                      className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-[#38BDF8] hover:underline"
                    >
                      <span>View Deal</span>
                      <ArrowUpRight size={13} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Target Price Modal */}
      {editingAlert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm rounded-2xl border border-[rgba(148,163,184,0.18)] bg-[#0D1420] p-6 shadow-2xl">
            <button
              onClick={() => setEditingAlert(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-[#F1F5F9] mb-1">Edit Target Price</h3>
            <p className="text-xs text-[#98A6BA] mb-4 line-clamp-1">
              {editingAlert.product?.name}
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A8B5C7] mb-1">
                  Target Price (₹ INR)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full rounded-xl border border-[rgba(148,163,184,0.20)] bg-[#080D15] px-3.5 py-2.5 text-sm font-bold text-[#E2E8F0] focus:border-[#2DFFB2] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAlert(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#98A6BA] hover:text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2DFFB2] to-[#25C9F7] text-xs font-black text-[#05070B] hover:opacity-95 disabled:opacity-50 cursor-pointer shadow-md transition"
                >
                  {actionLoading ? "Saving..." : "Save Target"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
