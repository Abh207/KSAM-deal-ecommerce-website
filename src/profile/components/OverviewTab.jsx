import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Bell,
  Clock,
  ArrowRight,
  Package,
  ChevronRight
} from "lucide-react";
import gsap from "gsap";
import { BASE_URL } from "../../auth/auth.js";
import { respectReducedMotion } from "../../lib/motion.js";

export default function OverviewTab({
  profile,
  session,
  addresses = [],
  alerts = [],
  recentlyViewed = [],
  completeness = 0,
  onNavigateTab,
  onOpenAvatarModal
}) {
  const isEmailVerified = !!(session?.user?.email_confirmed_at || session?.user?.confirmed_at);
  const containerRef = useRef(null);
  const progressFillRef = useRef(null);
  const [displayPercent, setDisplayPercent] = useState(() => (respectReducedMotion() ? completeness : 0));
  const [showCompletedSteps, setShowCompletedSteps] = useState(false);

  // 5 discrete steps in priority order
  const steps = useMemo(() => {
    return [
      {
        id: "name",
        stepNum: 1,
        title: "Set Your Full Name",
        desc: "Personalizes your account greeting and invoice identity",
        done: !!profile?.full_name?.trim(),
        targetSection: "profile",
        action: () => onNavigateTab?.("profile"),
        actionLabel: "Do It"
      },
      {
        id: "phone",
        stepNum: 2,
        title: "Add Mobile Number",
        desc: "10-digit Indian phone for urgent price alert notifications",
        done: /^[6-9]\d{9}$/.test(profile?.phone?.trim() || ""),
        targetSection: "profile",
        action: () => onNavigateTab?.("profile"),
        actionLabel: "Do It"
      },
      {
        id: "photo",
        stepNum: 3,
        title: "Add Profile Picture",
        desc: "Upload a clean photo or custom avatar to stand out",
        done: !!profile?.avatar_url,
        targetSection: "profile",
        action: () => onOpenAvatarModal?.(),
        actionLabel: "Do It"
      },
      {
        id: "address",
        stepNum: 4,
        title: "Save Delivery Address",
        desc: "Pin code for instant shipping calculations on deal drops",
        done: addresses.length > 0,
        targetSection: "addresses",
        action: () => onNavigateTab?.("addresses"),
        actionLabel: "Do It"
      },
      {
        id: "email",
        stepNum: 5,
        title: "Verify Email Address",
        desc: "Receives price alerts and security re-authentication codes",
        done: isEmailVerified,
        targetSection: "security",
        action: () => {
          window.location.href = `${BASE_URL}verify-email.html`;
        },
        actionLabel: "Do It"
      }
    ];
  }, [profile, addresses.length, isEmailVerified, onNavigateTab, onOpenAvatarModal]);

  const completedCount = steps.filter((s) => s.done).length;

  // Orchestrated motion on panel mount
  useEffect(() => {
    if (respectReducedMotion()) {
      setDisplayPercent(completeness);
      if (progressFillRef.current) {
        progressFillRef.current.style.width = `${completeness}%`;
      }
      return;
    }

    const ctx = gsap.context(() => {
      const counterObj = { val: 0 };
      gsap.to(counterObj, {
        val: completeness,
        duration: 0.7,
        ease: "power2.out",
        onUpdate: () => {
          setDisplayPercent(Math.round(counterObj.val));
        }
      });

      if (progressFillRef.current) {
        gsap.fromTo(
          progressFillRef.current,
          { width: "0%" },
          {
            width: `${completeness}%`,
            duration: 0.7,
            ease: "power2.out"
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [completeness]);

  // SVG Ring calculations (radius = 34, perimeter = 2 * PI * 34 ≈ 213.6)
  const ringRadius = 34;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (ringCircumference * displayPercent) / 100;

  return (
    <div
      ref={containerRef}
      className="su-canvas-wrap"
      role="tabpanel"
      aria-label="Activity & Setup Dashboard"
    >
      {/* 1. Header Row */}
      <div className="su-overview-header-row">
        <div>
          <h2 className="su-page-title">Activity & Setup Dashboard</h2>
          <p className="su-page-subtitle">
            Welcome back, {profile?.full_name?.trim() || "Deal Hunter"}!
          </p>
        </div>

        {/* Circular completeness ring gauge */}
        <div className="su-gauge-card" aria-label={`Profile Completeness ${displayPercent}%`}>
          <div className="su-gauge-circle-wrap">
            <svg className="su-gauge-svg" viewBox="0 0 84 84">
              <defs>
                <linearGradient id="suGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              {/* Background Track */}
              <circle
                cx="42"
                cy="42"
                r={ringRadius}
                fill="none"
                stroke="#DDE2E9"
                strokeWidth="7"
              />
              {/* Animated Progress Arc */}
              <circle
                cx="42"
                cy="42"
                r={ringRadius}
                fill="none"
                stroke="url(#suGaugeGrad)"
                strokeWidth="7"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.16, 1, 0.3, 1)" }}
              />
            </svg>
            <div className="su-gauge-inner-text">
              <span className="su-gauge-percent-num">{displayPercent}%</span>
            </div>
          </div>

          <div className="su-gauge-meta-col">
            <span className="su-gauge-label">COMPLETENESS</span>
            <span className="su-gauge-task-text">
              {completedCount}/5 Task Complete
            </span>
          </div>
        </div>
      </div>

      {/* 2. Slim Recessed Progress Bar */}
      <div
        className="su-progress-track"
        role="progressbar"
        aria-valuenow={completeness}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Account Completeness Progress"
      >
        <div
          ref={progressFillRef}
          className="su-progress-bar-fill"
          style={{ width: `${completeness}%` }}
        />
      </div>

      {/* 3. Setup Roadmap Card (Full-width card) */}
      <div className="su-card su-card-raised">
        <div className="su-roadmap-header">
          <div>
            <h3 className="su-banner-title" style={{ fontSize: "17px" }}>Setup Roadmap</h3>
            <p className="su-banner-desc">Key milestones to optimize your deal tracking experience</p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="su-recessed-pill su-recessed-pill-green">
              <Check size={14} className="text-[#15803D]" strokeWidth={2.6} />
              <span>{completedCount} of 5 completed</span>
            </div>
            {completedCount === 5 && (
              <button
                type="button"
                onClick={() => setShowCompletedSteps((v) => !v)}
                className="text-xs font-semibold text-[#1F6F12] hover:underline px-1 py-0.5"
              >
                {showCompletedSteps ? "Hide steps" : "Show steps"}
              </button>
            )}
          </div>
        </div>

        {/* If all steps done, compact line with toggle */}
        {completedCount === 5 && !showCompletedSteps ? (
          <div className="su-roadmap-complete-banner">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#15803D]">
              <Check size={16} strokeWidth={2.6} />
              <span>All 5 steps complete</span>
            </div>
            <button
              type="button"
              onClick={() => setShowCompletedSteps(true)}
              className="text-xs font-semibold text-[#1F6F12] hover:underline"
            >
              Show steps
            </button>
          </div>
        ) : (
          <div className="su-roadmap-grid">
            {steps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={step.action}
                className="su-roadmap-step"
                title={`${step.title} - ${step.done ? "Completed" : "Click to complete"}`}
              >
                <div className="su-step-header-row">
                  <span
                    className={`su-step-circle-icon ${
                      step.done ? "su-step-circle-done" : "su-step-circle-pending"
                    }`}
                  >
                    {step.done ? <Check size={11} strokeWidth={3} /> : step.stepNum}
                  </span>
                  <span className="su-step-title">{step.title}</span>
                </div>
                <p className="su-step-desc">{step.desc}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Bottom 3-Column Equal Grid */}
      <div className="su-overview-3col-grid">
        {/* Card 1 — Orders & Live Deliveries */}
        <div className="su-card su-card-raised su-dashboard-col-card">
          <div className="su-col-card-top">
            <h3 className="su-col-card-title">Orders & Live Deliveries</h3>
            <button
              type="button"
              onClick={() => onNavigateTab?.("orders")}
              className="su-btn-pill-raised text-xs py-1.5 px-3"
            >
              <span>Track Orders &gt;</span>
            </button>
          </div>

          <div className="su-col-card-center">
            {/* Green Isometric 3D Package Box Icon */}
            <div className="su-center-badge-tile su-embossed-tile-green">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                {/* Isometric Box Top */}
                <path
                  d="M17 3L30 10.5L17 18L4 10.5L17 3Z"
                  fill="#10B981"
                  stroke="#059669"
                  strokeWidth="1.2"
                />
                {/* Isometric Box Right Face */}
                <path
                  d="M17 18L30 10.5V23.5L17 31V18Z"
                  fill="#059669"
                  stroke="#047857"
                  strokeWidth="1.2"
                />
                {/* Isometric Box Left Face */}
                <path
                  d="M4 10.5L17 18V31L4 23.5V10.5Z"
                  fill="#34D399"
                  stroke="#10B981"
                  strokeWidth="1.2"
                />
                {/* Package Ribbon Accent */}
                <path
                  d="M17 18V31M10.5 6.75L23.5 14.25"
                  stroke="#ECFDF5"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="su-col-card-msg font-medium">Real-time order tracking</p>
          </div>

          <div className="su-col-card-bottom">
            <span className="text-xs font-semibold text-slate-500">Status</span>
            <span className="su-recessed-pill text-xs py-1 px-3">
              3D Delivery
            </span>
          </div>
        </div>

        {/* Card 2 — Active Price Alerts */}
        <div className="su-card su-card-raised su-dashboard-col-card">
          <div className="su-col-card-top">
            <h3 className="su-col-card-title">Active Price Alerts</h3>
            <button
              type="button"
              onClick={() => onNavigateTab?.("alerts")}
              className="su-btn-pill-raised su-btn-slate-blue text-xs py-1.5 px-3"
            >
              <span>+ Add Alert</span>
            </button>
          </div>

          <div className="su-col-card-center">
            {/* Soft Warm-Gold Circular 3D-Style Badge with Bell Icon */}
            <div className="su-center-badge-tile su-embossed-tile-amber rounded-full">
              <Bell size={26} strokeWidth={2.2} />
            </div>
            <p className="su-col-card-msg">
              {alerts.length > 0
                ? `${alerts.length} price alert${alerts.length > 1 ? "s" : ""} active right now`
                : "No price alerts active right now"}
            </p>
          </div>

          <div className="su-col-card-bottom">
            <span className="text-xs font-semibold text-slate-500">Monitors</span>
            <span className="text-xs font-bold text-amber-700">
              {alerts.length} Active
            </span>
          </div>
        </div>

        {/* Card 3 — Recently Viewed */}
        <div className="su-card su-card-raised su-dashboard-col-card">
          <div className="su-col-card-top">
            <h3 className="su-col-card-title">Recently Viewed</h3>
            <button
              type="button"
              onClick={() => onNavigateTab?.("recent")}
              className="su-btn-circle-raised w-8 h-8"
              title="View browsing history"
            >
              <Clock size={15} className="text-[#1E293B]" />
            </button>
          </div>

          <div className="su-col-card-center">
            {/* Soft Circular Raised Badge with Clean Blue Clock Icon */}
            <div className="su-center-badge-tile su-embossed-tile-blue rounded-full">
              <Clock size={26} strokeWidth={2.2} />
            </div>
            <p className="su-col-card-msg">
              {recentlyViewed.length > 0
                ? `${recentlyViewed.length} recently viewed product${recentlyViewed.length > 1 ? "s" : ""}`
                : "No recently viewed products"}
            </p>
          </div>

          <div className="su-col-card-bottom justify-end">
            <a
              href={`${BASE_URL}#deals`}
              className="su-btn-secondary-white text-xs h-8 px-3"
            >
              <span>Browse Deals</span>
              <ArrowRight size={13} strokeWidth={2} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
