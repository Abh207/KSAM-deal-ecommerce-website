import { useState } from "react";
import { Bell, Lock, Mail, ShieldAlert, Sparkles, Check, Zap } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function NotificationsTab({
  preferences = {},
  marketingOptIn = false,
  userId,
  onChangePreference,
  onShowToast
}) {
  const [saving, setSaving] = useState(false);

  const notifications = preferences?.notifications || {
    deal_alerts: true,
    price_drops: true,
    weekly_newsletter: marketingOptIn,
    recommendations: true
  };

  const handleToggle = async (key, currentValue) => {
    if (key === "security") return; // locked on

    const updated = {
      ...notifications,
      [key]: !currentValue
    };

    // If weekly newsletter toggled, sync marketing_opt_in
    const newMarketingOptIn = key === "weekly_newsletter" ? !currentValue : marketingOptIn;

    const newPreferences = {
      ...preferences,
      notifications: updated
    };

    onChangePreference("preferences", newPreferences);
    if (key === "weekly_newsletter") {
      onChangePreference("marketing_opt_in", newMarketingOptIn);
    }

    if (userId) {
      setSaving(true);
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            preferences: newPreferences,
            marketing_opt_in: newMarketingOptIn
          })
          .eq("id", userId);

        if (error) throw error;
        onShowToast("Notification preferences updated!");
      } catch (err) {
        console.error("[Notification update error]", err);
        onShowToast("Failed to save notification settings.");
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="ks-tab-panel" role="tabpanel" aria-label="Notification Preferences">
      <div className="ks-card">
        <div className="ks-card-header">
          <h2 className="ks-card-title">
            <Bell size={20} color="#22FF88" />
            <span>Notification Channels</span>
          </h2>
          <p className="ks-card-desc">
            Choose what alerts and marketing updates you wish to receive from KSAM Deal.
          </p>
        </div>

        <div className="space-y-4">
          {/* Deal Alerts */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22FF88]/10 text-[#22FF88] border border-[#22FF88]/20">
                <Zap size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Flash Deal & Lightning Drop Alerts</h4>
                <p className="text-xs text-gray-400">Receive notifications when popular deals hit clearance pricing.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("deal_alerts", notifications.deal_alerts)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                notifications.deal_alerts ? "bg-[#22FF88]" : "bg-gray-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-lg transition duration-200 ease-in-out ${
                  notifications.deal_alerts ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Price-Drop Alerts */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFD60A]/10 text-[#FFD60A] border border-[#FFD60A]/20">
                <Bell size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Target Price Drops</h4>
                <p className="text-xs text-gray-400">Notifications when your monitored wishlist or price alert targets are reached.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("price_drops", notifications.price_drops)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                notifications.price_drops ? "bg-[#22FF88]" : "bg-gray-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-lg transition duration-200 ease-in-out ${
                  notifications.price_drops ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Weekly Newsletter */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
                <Mail size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Weekly Deal Digest & Coupons</h4>
                <p className="text-xs text-gray-400">Curated weekly highlights of the highest coupon savings in India.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("weekly_newsletter", notifications.weekly_newsletter)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                notifications.weekly_newsletter ? "bg-[#22FF88]" : "bg-gray-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-lg transition duration-200 ease-in-out ${
                  notifications.weekly_newsletter ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Product Recommendations */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Personalized Recommendations</h4>
                <p className="text-xs text-gray-400">Suggestions tailored to your browsing and category preferences.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("recommendations", notifications.recommendations)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                notifications.recommendations ? "bg-[#22FF88]" : "bg-gray-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-lg transition duration-200 ease-in-out ${
                  notifications.recommendations ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Account & Security (Locked ON) */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldAlert size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Account & Security Alerts</h4>
                  <span className="flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-gray-300">
                    <Lock size={10} /> Required
                  </span>
                </div>
                <p className="text-xs text-gray-400">Password changes, email confirmations, and account security notifications.</p>
              </div>
            </div>
            <div
              className="relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed rounded-full bg-[#22FF88]/40 border-2 border-transparent"
              title="Security alerts cannot be disabled"
            >
              <span className="inline-block h-5 w-5 transform rounded-full bg-black translate-x-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
