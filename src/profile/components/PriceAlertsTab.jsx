import { useState } from "react";
import {
  Bell,
  Trash2,
  Edit3,
  ArrowUpRight,
  ArrowLeft,
  TrendingDown,
  Mail,
  Tag,
  X
} from "lucide-react";
import { BASE_URL } from "../../auth/auth.js";
import { togglePriceAlert, updateAlertTarget, deletePriceAlert } from "../../deals/services/accountActivityService.js";

export default function PriceAlertsTab({
  alerts = [],
  onReloadAlerts,
  onShowToast,
  onNavigateTab
}) {
  const [editingAlert, setEditingAlert] = useState(null);
  const [newTarget, setNewTarget] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Toggle active state
  const handleToggle = async (alert) => {
    const nextState = !alert.is_active;
    const ok = await togglePriceAlert(alert.id, nextState);
    if (ok) {
      onShowToast?.(nextState ? "Alert activated" : "Alert paused");
      onReloadAlerts?.();
    } else {
      onShowToast?.("Failed to update alert status");
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
      onShowToast?.("Target price must be greater than 0");
      return;
    }

    setActionLoading(true);
    try {
      const ok = await updateAlertTarget(editingAlert.id, val);
      if (ok) {
        onShowToast?.("Target price updated!");
        setEditingAlert(null);
        onReloadAlerts?.();
      } else {
        onShowToast?.("Failed to update target price");
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
      onShowToast?.("Price alert removed");
      onReloadAlerts?.();
    } else {
      onShowToast?.("Failed to delete price alert");
    }
  };

  const handleBack = () => {
    if (onNavigateTab) {
      onNavigateTab("overview");
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <div className="su-canvas-wrap" role="tabpanel" aria-label="Price Alerts">
      {/* 1. Header Row */}
      <div className="su-alerts-header-row">
        <div className="su-alerts-header-left">
          <button
            type="button"
            onClick={handleBack}
            className="su-btn-circle-raised"
            title="Go back to Overview"
            aria-label="Back to Overview"
          >
            <ArrowLeft size={18} className="text-[#1E293B]" strokeWidth={2.4} />
          </button>
          <div>
            <h2 className="su-page-title">Active Price Drop Alerts</h2>
            <p className="su-page-subtitle">
              Live deal monitoring: we track online partner stores and notify you when prices hit your target.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (alerts.length > 0) {
              onShowToast?.("Manage mode active — click edit or pause switch below");
            } else {
              onShowToast?.("No alerts yet. Add an alert from any deal card!");
            }
          }}
          className="su-btn-pill-raised"
        >
          <Bell size={16} className="text-[#1E293B]" strokeWidth={2.2} />
          <span>Manage Alerts</span>
        </button>
      </div>

      {/* 2. Top Info Banner Card */}
      <div className="su-card su-card-raised su-banner-card">
        <div className="su-banner-left-group">
          <div className="su-embossed-circle su-embossed-green" aria-hidden="true">
            <TrendingDown size={22} strokeWidth={2.4} />
          </div>
          <div>
            <h3 className="su-banner-title">Active Price Alerts</h3>
            <p className="su-banner-desc">
              Track products and get notified immediately when prices drop to your target.
            </p>
          </div>
        </div>

        <div className="su-banner-divider" aria-hidden="true" />

        <div className="su-recessed-pill su-recessed-pill-green">
          <Mail size={16} className="text-[#059669] shrink-0" strokeWidth={2.2} />
          <span>We'll notify you by email</span>
        </div>
      </div>

      {/* 3. Empty State or Alerts List */}
      {alerts.length === 0 ? (
        <div className="su-card su-card-raised su-empty-card">
          {/* Mint-green organic rounded badge with bell and tag accent */}
          <div className="su-organic-badge-wrap">
            <div className="su-organic-badge">
              <div className="relative">
                <Bell size={36} className="text-[#1E293B]" strokeWidth={2} />
                <span className="su-tag-accent">
                  <Tag size={12} className="text-[#059669]" strokeWidth={2.4} />
                </span>
              </div>
            </div>
          </div>

          <h3 className="su-empty-title">No Price Drop Monitors Active</h3>
          <p className="su-empty-subtitle">
            Start tracking your favourite products and get instant alerts when their price drops.
          </p>

          <a
            href={`${BASE_URL}#deals`}
            className="su-btn-mint-cta"
          >
            <span>+ Explore Trending Deals</span>
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const currentPrice = Number(alert.product?.price || 0);
            const targetPrice = Number(alert.target_price || 0);
            const progressPct = currentPrice <= targetPrice
              ? 100
              : Math.max(0, Math.min(99, Math.round((1 - (currentPrice - targetPrice) / currentPrice) * 100)));

            const detailUrl = `${BASE_URL}deal.html?id=${encodeURIComponent(alert.product_id)}`;

            return (
              <div
                key={alert.id}
                className="su-alert-item"
                style={{ opacity: alert.is_active ? 1 : 0.72 }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Product Info */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {alert.product?.image ? (
                      <img
                        src={alert.product.image}
                        alt=""
                        className="h-16 w-16 rounded-xl object-cover bg-white shrink-0 border border-slate-200"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-500 shrink-0">
                        P
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="su-recessed-pill text-[10px] py-0.5 px-2.5">
                          {alert.product?.store || "Partner Store"}
                        </span>
                        {!alert.is_active && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                            Paused
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-[#1E293B] truncate">
                        <a href={detailUrl} className="hover:text-emerald-600 transition">
                          {alert.product?.name}
                        </a>
                      </h4>
                      <div className="mt-1 flex items-center gap-3 text-xs">
                        <span className="text-slate-500">
                          Current: <strong className="text-[#1E293B]">₹{currentPrice.toLocaleString("en-IN")}</strong>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-emerald-700">
                          Target: <strong className="font-extrabold">₹{targetPrice.toLocaleString("en-IN")}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Controls: Switch, Edit, Delete */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {/* On/Off Neumorphic Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggle(alert)}
                      className={`su-switch-soft ${alert.is_active ? "is-active" : ""}`}
                      aria-label="Toggle price alert active"
                      title={alert.is_active ? "Pause alert" : "Activate alert"}
                    >
                      <span className="su-switch-knob" />
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(alert)}
                      className="su-btn-circle-raised w-9 h-9"
                      title="Edit target price"
                    >
                      <Edit3 size={15} className="text-[#475569]" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(alert.id)}
                      className="su-btn-circle-raised w-9 h-9 hover:text-red-600"
                      title="Remove alert"
                    >
                      <Trash2 size={15} className="text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Drop Progress Track */}
                <div className="mt-4 pt-2 flex items-center justify-between gap-4 text-xs">
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium mb-1.5">
                      <span>Drop Progress</span>
                      <span>{progressPct}% towards target</span>
                    </div>
                    <div className="su-progress-track h-2 mb-0">
                      <div
                        className="su-progress-bar-fill"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <a
                    href={detailUrl}
                    className="shrink-0 flex items-center gap-1 text-[11.5px] font-bold text-emerald-700 hover:text-emerald-800 transition pl-2"
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

      {/* Edit Target Price Modal */}
      {editingAlert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="su-card su-card-raised relative w-full max-w-sm p-6 bg-[#EDF0F5] shadow-2xl">
            <button
              onClick={() => setEditingAlert(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-[#1E293B] mb-1">Edit Target Price</h3>
            <p className="text-xs text-slate-500 mb-4 truncate">
              {editingAlert.product?.name}
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Target Price (₹ INR)
                </label>
                <div className="su-inset px-3 py-2 rounded-xl">
                  <input
                    type="number"
                    min="1"
                    required
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-[#1E293B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAlert(null)}
                  className="su-btn-pill-raised text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="su-btn-mint-cta text-xs py-2 px-5"
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
