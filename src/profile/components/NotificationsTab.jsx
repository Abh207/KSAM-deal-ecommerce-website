import { useState, useEffect, useRef } from "react";
import { Bell, Lock, Mail, ShieldAlert, Sparkles, Zap } from "lucide-react";
import gsap from "gsap";
import { supabase } from "../../lib/supabase";
import { respectReducedMotion } from "../../lib/motion.js";

export default function NotificationsTab({
  preferences = {},
  marketingOptIn = false,
  userId,
  onChangePreference,
  onShowToast
}) {
  const [saving, setSaving] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (respectReducedMotion() || !panelRef.current) return;
    const ctx = gsap.context(() => {
      const heading = panelRef.current.querySelector(".kx-notifications-heading");
      const rows = panelRef.current.querySelectorAll(".kx-spot");
      const tl = gsap.timeline();
      if (heading) {
        tl.fromTo(
          heading,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
        );
      }
      if (rows.length > 0) {
        tl.fromTo(
          rows,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" },
          "-=0.15"
        );
      }
    }, panelRef);

    return () => ctx.revert();
  }, []);

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
    <div ref={panelRef} className="ks-tab-panel" role="tabpanel" aria-label="Notification Preferences">
      {/* Clean Section Heading (No redundant outer card container) */}
      <div className="kx-notifications-heading mb-6 px-1">
        <h2 className="flex items-center gap-2.5 text-lg font-bold text-white tracking-[-0.01em]">
          <Bell size={20} className="text-[#22FF88]" />
          <span>Notification Channels</span>
        </h2>
        <p className="text-[13.5px] text-[#98A3A0] mt-1 leading-[1.55]">
          Choose what alerts and marketing updates you wish to receive from KSAM Deal.
        </p>
      </div>

      {/* Spotlight List with 12px gap and sibling dimming */}
      <div className="kx-spot-list">
        {/* Row 1: Deal Alerts (Tone: Green) */}
        <div className="kx-spot" data-tone="green">
          <div className="kx-spot-content">
            <div className="kx-spot-icon-tile kx-spot-icon-tile--green">
              <Zap size={20} />
            </div>
            <div className="kx-spot-text-wrap">
              <h4 className="kx-spot-title">Flash Deal & Lightning Drop Alerts</h4>
              <p className="kx-spot-desc">Receive notifications when popular deals hit clearance pricing.</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notifications.deal_alerts}
            onClick={() => handleToggle("deal_alerts", notifications.deal_alerts)}
            aria-label={`Toggle flash deal alerts (${notifications.deal_alerts ? 'enabled' : 'disabled'})`}
            className={`kx-toggle-btn ${notifications.deal_alerts ? "is-active" : ""}`}
          >
            <span className="kx-toggle-thumb" />
          </button>
        </div>

        {/* Row 2: Price-Drop Alerts (Tone: Yellow) */}
        <div className="kx-spot" data-tone="yellow">
          <div className="kx-spot-content">
            <div className="kx-spot-icon-tile kx-spot-icon-tile--yellow">
              <Bell size={20} />
            </div>
            <div className="kx-spot-text-wrap">
              <h4 className="kx-spot-title">Target Price Drops</h4>
              <p className="kx-spot-desc">Notifications when your monitored wishlist or price alert targets are reached.</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notifications.price_drops}
            onClick={() => handleToggle("price_drops", notifications.price_drops)}
            aria-label={`Toggle target price drops (${notifications.price_drops ? 'enabled' : 'disabled'})`}
            className={`kx-toggle-btn ${notifications.price_drops ? "is-active" : ""}`}
          >
            <span className="kx-toggle-thumb" />
          </button>
        </div>

        {/* Row 3: Weekly Newsletter (Tone: Blue) */}
        <div className="kx-spot" data-tone="blue">
          <div className="kx-spot-content">
            <div className="kx-spot-icon-tile kx-spot-icon-tile--blue">
              <Mail size={20} />
            </div>
            <div className="kx-spot-text-wrap">
              <h4 className="kx-spot-title">Weekly Deal Digest & Coupons</h4>
              <p className="kx-spot-desc">Curated weekly highlights of the highest coupon savings in India.</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notifications.weekly_newsletter}
            onClick={() => handleToggle("weekly_newsletter", notifications.weekly_newsletter)}
            aria-label={`Toggle weekly newsletter (${notifications.weekly_newsletter ? 'enabled' : 'disabled'})`}
            className={`kx-toggle-btn ${notifications.weekly_newsletter ? "is-active" : ""}`}
          >
            <span className="kx-toggle-thumb" />
          </button>
        </div>

        {/* Row 4: Product Recommendations (Tone: Purple) */}
        <div className="kx-spot" data-tone="purple">
          <div className="kx-spot-content">
            <div className="kx-spot-icon-tile kx-spot-icon-tile--purple">
              <Sparkles size={20} />
            </div>
            <div className="kx-spot-text-wrap">
              <h4 className="kx-spot-title">Personalized Recommendations</h4>
              <p className="kx-spot-desc">Suggestions tailored to your browsing and category preferences.</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notifications.recommendations}
            onClick={() => handleToggle("recommendations", notifications.recommendations)}
            aria-label={`Toggle recommendations (${notifications.recommendations ? 'enabled' : 'disabled'})`}
            className={`kx-toggle-btn ${notifications.recommendations ? "is-active" : ""}`}
          >
            <span className="kx-toggle-thumb" />
          </button>
        </div>

        {/* Row 5: Account & Security (Locked ON, Tone: Green) */}
        <div className="kx-spot" data-tone="green">
          <div className="kx-spot-content">
            <div className="kx-spot-icon-tile kx-spot-icon-tile--green">
              <ShieldAlert size={20} />
            </div>
            <div className="kx-spot-text-wrap">
              <div className="flex items-center gap-2">
                <h4 className="kx-spot-title">Account & Security Alerts</h4>
                <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-gray-300">
                  <Lock size={10} /> Required
                </span>
              </div>
              <p className="kx-spot-desc">Password changes, email confirmations, and account security notifications.</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked="true"
            disabled
            className="kx-toggle-btn is-locked"
            title="Security alerts are required and cannot be disabled"
            aria-label="Account & Security Alerts (Required, cannot be disabled)"
          >
            <span className="kx-toggle-thumb">
              <Lock size={11} className="text-gray-900" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
