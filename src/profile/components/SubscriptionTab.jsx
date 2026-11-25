import React, { useState, useEffect, useMemo } from "react";
import {
  Crown,
  Flame,
  Compass,
  Check,
  Calendar,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Download,
  Printer,
  X,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { supabase } from "../../lib/supabase.js";
import { PLANS, getPlanBySlug, calculatePlanPricing } from "../../lib/plansConfig.js";

const BASE_URL = import.meta.env.BASE_URL || "/";

function PlanIcon({ icon, size = 20, className = "" }) {
  if (icon === "flame") return <Flame size={size} className={className} />;
  if (icon === "crown") return <Crown size={size} className={className} />;
  return <Compass size={size} className={className} />;
}

export default function SubscriptionTab({ session, profile, onShowToast }) {
  const userId = session?.user?.id;
  const [loading, setLoading] = useState(true);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadSubscriptionData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1. Fetch active and past subscriptions
      const { data: subs, error: subsErr } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!subsErr && Array.isArray(subs)) {
        // Find active unexpired subscription
        const active = subs.find(
          (s) => s.status === "active" && new Date(s.end_date).getTime() > Date.now()
        );
        setActiveSubscription(active || null);
      }

      // 2. Fetch payment transactions
      const { data: payments, error: payErr } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!payErr && Array.isArray(payments)) {
        setPaymentHistory(payments);
      }
    } catch (err) {
      console.warn("[SubscriptionTab] Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptionData();
  }, [userId]);

  // Determine current active plan definition
  const currentPlanDef = useMemo(() => {
    if (activeSubscription) {
      return getPlanBySlug(activeSubscription.plan_slug);
    }
    // Check profile preferences fallback
    const prefPlan = profile?.preferences?.plan;
    if (prefPlan) {
      return getPlanBySlug(prefPlan);
    }
    return getPlanBySlug("explorer");
  }, [activeSubscription, profile]);

  // Days remaining calculation
  const expiryInfo = useMemo(() => {
    if (!activeSubscription?.end_date) {
      return { daysLeft: 0, percentLeft: 0, isExpiringSoon: false, isExpired: false };
    }
    const end = new Date(activeSubscription.end_date).getTime();
    const start = new Date(activeSubscription.start_date || activeSubscription.created_at).getTime();
    const now = Date.now();

    const totalDuration = Math.max(1, end - start);
    const timeRemaining = Math.max(0, end - now);
    const daysLeft = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
    const percentLeft = Math.min(100, Math.max(0, Math.round((timeRemaining / totalDuration) * 100)));

    return {
      daysLeft,
      percentLeft,
      isExpiringSoon: daysLeft <= 7 && daysLeft > 0,
      isExpired: timeRemaining <= 0
    };
  }, [activeSubscription]);

  const handlePrintInvoice = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="ks-hub-panel flex items-center justify-center p-12 text-white/50">
        <RefreshCw size={24} className="animate-spin text-[#84FF00] mr-3" />
        <span>Loading subscription details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="subscription">
      {/* 1. CURRENT MEMBERSHIP PLAN CARD */}
      <div className="ks-hub-panel ks-subscription-card relative overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
          <div className="flex items-start gap-4">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border bg-[#F1F5F9] shadow-[-2px_-2px_6px_rgba(255,255,255,0.8),2px_2px_6px_rgba(163,177,198,0.25)]"
              style={{
                borderColor: `${currentPlanDef.accent}40`,
                color: currentPlanDef.accent === "#84FF00" ? "#15803D" : currentPlanDef.accent
              }}
            >
              <PlanIcon icon={currentPlanDef.icon} size={28} />
            </div>

            <div>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <h3 className="su-sub-plan-title text-2xl font-black">{currentPlanDef.name}</h3>
                {activeSubscription ? (
                  expiryInfo.isExpiringSoon ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D]">
                      Expiring Soon
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] flex items-center gap-1">
                      <Check size={12} /> Active
                    </span>
                  )
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
                    Free Tier
                  </span>
                )}
              </div>
              <p className="su-sub-plan-desc text-sm">{currentPlanDef.description}</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {currentPlanDef.slug !== "pro" ? (
              <a
                href={`${BASE_URL}subscribe.html?plan=pro`}
                className="su-btn-upgrade"
              >
                <span>Upgrade to Pro</span>
                <ArrowRight size={15} />
              </a>
            ) : null}

            {expiryInfo.isExpiringSoon || expiryInfo.isExpired ? (
              <a
                href={`${BASE_URL}subscribe.html?plan=${currentPlanDef.slug}&billing=${activeSubscription?.billing_cycle || "monthly"}`}
                className="su-btn-upgrade"
                style={{ background: "#16A34A", borderColor: "#16A34A" }}
              >
                <span>Renew Plan</span>
              </a>
            ) : null}

            <a
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("pricing");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="su-btn-view-plans"
            >
              <span>View All Plans</span>
            </a>
          </div>
        </div>

        {/* Plan Details & Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="space-y-1">
            <span className="su-sub-label">Billing Cycle</span>
            <p className="su-sub-val capitalize">
              {activeSubscription ? `${activeSubscription.billing_cycle}` : "Free Lifetime"}
            </p>
            {activeSubscription && (
              <p className="text-xs text-[#64748B]">
                Amount: ₹{activeSubscription.amount_paid} {activeSubscription.currency}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <span className="su-sub-label">Renewal / Expiry</span>
            <p className="su-sub-val">
              {activeSubscription?.end_date
                ? new Date(activeSubscription.end_date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })
                : "No expiry"}
            </p>
            {activeSubscription && (
              <p className="text-xs text-[#64748B]">
                {expiryInfo.daysLeft > 0 ? `${expiryInfo.daysLeft} days remaining` : "Expired"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="su-sub-label">Cycle Progress</span>
              <span className="su-sub-val" style={{ fontSize: "14px" }}>{expiryInfo.percentLeft}% left</span>
            </div>
            <div className="h-2.5 w-full bg-[#E2E8F0] shadow-[inset_1px_1px_3px_rgba(163,177,198,0.4)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${expiryInfo.percentLeft}%`,
                  background: expiryInfo.isExpiringSoon
                    ? "#D97706"
                    : `linear-gradient(90deg, #16A34A, #2563EB)`
                }}
              />
            </div>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
          <h4 className="su-sub-label mb-3">
            Features Included in Your Tier
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {currentPlanDef.features.map((feat) => (
              <div key={feat} className="flex items-center gap-2 text-xs font-semibold su-feat-text">
                <div
                  className="h-4 w-4 rounded-full flex items-center justify-center shrink-0 su-feat-icon"
                >
                  <Check size={11} />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. PAYMENT & INVOICE HISTORY */}
      <div className="ks-hub-panel ks-billing-card rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
          <div>
            <h3 className="su-billing-title text-xl font-bold">Payment &amp; Billing History</h3>
            <p className="su-billing-desc text-xs">View all past transactions, tax invoices, and payment receipts.</p>
          </div>
          <CreditCard size={22} className="text-[#15803D]" />
        </div>

        {paymentHistory.length === 0 ? (
          <div className="py-8 text-center text-[#64748B] text-sm">
            <p>No billing transactions found. When you subscribe, official receipts will be logged here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="su-billing-thead">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3">Billing</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="su-billing-tbody divide-y divide-[#E2E8F0]">
                {paymentHistory.map((p) => {
                  const isPaid = p.status === "paid";
                  const dateStr = new Date(p.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  });
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-medium text-[#0F172A]">{dateStr}</td>
                      <td className="py-3.5 px-3 capitalize font-bold text-[#0F172A]">
                        {p.plan_slug.replace("-", " ")}
                      </td>
                      <td className="py-3.5 px-3 capitalize text-xs text-[#475569]">{p.billing_cycle}</td>
                      <td className="py-3.5 px-3 font-bold text-[#0F172A]">₹{p.amount}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isPaid
                              ? "bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]"
                              : p.status === "failed"
                              ? "bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]"
                              : "bg-[#E2E8F0] text-[#475569] border border-[#CBD5E1]"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {isPaid && (
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(p)}
                            className="inline-flex items-center gap-1 text-xs text-[#2563EB] hover:underline font-semibold"
                          >
                            <span>Receipt</span>
                            <Download size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. PRINTABLE INVOICE MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#EDF0F5] border border-white rounded-2xl p-6 sm:p-8 shadow-[-10px_-10px_30px_rgba(255,255,255,0.9),10px_10px_30px_rgba(163,177,198,0.45)] text-[#0F172A]">
            <button
              type="button"
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-[#64748B] hover:text-[#0F172A] p-1 rounded-lg"
            >
              <X size={20} />
            </button>

            {/* Invoice Header */}
            <div className="border-b border-[rgba(163,177,198,0.25)] pb-5 mb-5 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
                  <span className="text-[#15803D]">KSAM Deal</span> Tax Receipt
                </h3>
                <p className="text-xs text-[#64748B]">Invoice #{selectedInvoice.razorpay_order_id?.slice(-8) || selectedInvoice.id.slice(0, 8)}</p>
              </div>
              <div className="text-right text-xs text-[#475569]">
                <p>Date: {new Date(selectedInvoice.created_at).toLocaleDateString("en-IN")}</p>
                <p>GSTIN: 27AABCK1234F1Z5</p>
              </div>
            </div>

            {/* Billed To */}
            <div className="text-xs text-[#475569] mb-5">
              <span className="font-bold text-[#0F172A] uppercase tracking-wider block mb-1">Billed To:</span>
              <p className="text-[#0F172A] font-semibold">{profile?.full_name || session?.user?.email}</p>
              <p>{session?.user?.email}</p>
              {profile?.phone && <p>{profile.phone}</p>}
            </div>

            {/* Line Items */}
            <div className="space-y-2 text-sm border-y border-[rgba(163,177,198,0.25)] py-4 mb-4">
              <div className="flex justify-between items-center text-[#0F172A]">
                <span className="font-semibold capitalize">{selectedInvoice.plan_slug.replace("-", " ")} Membership ({selectedInvoice.billing_cycle})</span>
                <span>₹{(selectedInvoice.amount / 1.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-[#64748B]">
                <span>GST (18% IGST)</span>
                <span>₹{(selectedInvoice.amount - selectedInvoice.amount / 1.18).toFixed(2)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline text-base font-bold text-[#0F172A] mb-6">
              <span>Total Paid</span>
              <span className="text-2xl font-black text-[#15803D]">₹{selectedInvoice.amount} INR</span>
            </div>

            <div className="text-xs text-[#64748B] mb-6 space-y-1">
              <p>Payment Reference: {selectedInvoice.razorpay_payment_id || "Online Verification"}</p>
              <p>Status: Payment Confirmed (Captured)</p>
            </div>

            {/* Print & Close */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[rgba(163,177,198,0.25)]">
              <button
                type="button"
                onClick={handlePrintInvoice}
                className="px-4 py-2 rounded-full border border-[rgba(163,177,198,0.3)] bg-[#EDF0F5] text-xs font-bold text-[#0F172A] hover:bg-white shadow-[-2px_-2px_6px_rgba(255,255,255,0.8),2px_2px_6px_rgba(163,177,198,0.3)] flex items-center gap-1.5 transition"
              >
                <Printer size={14} />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 rounded-full bg-[#0F172A] text-white text-xs font-bold shadow-[-2px_-2px_6px_rgba(255,255,255,0.8),2px_4px_10px_rgba(15,23,42,0.3)] hover:bg-[#1E293B] transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
