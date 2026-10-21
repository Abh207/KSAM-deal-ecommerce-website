import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles,
  Check,
  CheckCircle2,
  Bell,
  Clock,
  ChevronRight,
  ArrowRight,
  ExternalLink
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
        action: () => onNavigateTab("profile"),
        actionLabel: "Do It"
      },
      {
        id: "phone",
        stepNum: 2,
        title: "Add Mobile Number",
        desc: "10-digit Indian phone for urgent price alert notifications",
        done: /^[6-9]\d{9}$/.test(profile?.phone?.trim() || ""),
        targetSection: "profile",
        action: () => onNavigateTab("profile"),
        actionLabel: "Do It"
      },
      {
        id: "photo",
        stepNum: 3,
        title: "Add Profile Picture",
        desc: "Upload a clean photo or custom avatar to stand out",
        done: !!profile?.avatar_url,
        targetSection: "profile",
        action: () => onOpenAvatarModal(),
        actionLabel: "Do It"
      },
      {
        id: "address",
        stepNum: 4,
        title: "Save Delivery Address",
        desc: "Pin code for instant shipping calculations on deal drops",
        done: addresses.length > 0,
        targetSection: "addresses",
        action: () => onNavigateTab("addresses"),
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

  // Orchestrated motion on panel mount (Phase 3)
  useEffect(() => {
    if (respectReducedMotion()) {
      setDisplayPercent(completeness);
      if (progressFillRef.current) {
        progressFillRef.current.style.width = `${completeness}%`;
      }
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Counter animation object
      const counterObj = { val: 0 };
      gsap.to(counterObj, {
        val: completeness,
        duration: 0.7,
        ease: "power2.out",
        onUpdate: () => {
          setDisplayPercent(Math.round(counterObj.val));
        }
      });

      // 2. Progress fill animation
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

      // 3. Lower cards fade in together
      const lowerCards = containerRef.current?.querySelectorAll(".ks-overview-lower-card");
      if (lowerCards && lowerCards.length > 0) {
        gsap.fromTo(
          lowerCards,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            delay: 0.3,
            stagger: 0.08,
            ease: "power2.out"
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [completeness]);

  return (
    <div
      ref={containerRef}
      className="ks-overview-panel"
      role="tabpanel"
      aria-label="Account Overview"
    >
      {/* 1. Merged Welcome & Setup Dashboard Card */}
      <section className="ks-overview-welcome-card" aria-label="Welcome and Setup Overview">
        {/* Ambient Corner Glow */}
        <div className="ks-welcome-ambient-glow" aria-hidden="true" />

        <div className="ks-welcome-grid">
          {/* Left Column: Heading, Welcome, and Description */}
          <div className="ks-welcome-left-col">
            <div className="ks-overview-eyebrow">
              <Sparkles size={13} className="shrink-0" />
              <span>Account overview</span>
            </div>

            <h2 className="ks-overview-heading">
              Activity & Setup Dashboard
            </h2>

            <p className="ks-welcome-lead">
              Welcome back, {profile?.full_name || "Deal Hunter"}!
            </p>

            <p className="ks-overview-body-desc">
              Track your profile setup milestones, active price-drop monitors, and recent store browsing history. Complete your account profile to unlock automated price drop alerts, 1-click checkout pin codes, and verified merchant tracking.
            </p>
          </div>

          {/* Right Column: Completeness Figures */}
          <div className="ks-welcome-right-col">
            <div className="ks-completeness-stat-box">
              <span className="ks-completeness-label">Completeness</span>
              <div className="ks-completeness-val-row">
                <span className="ks-completeness-percent">{displayPercent}%</span>
                <span className="ks-completeness-fraction">({completedCount}/5)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 6px Progress Bar Under Both Columns */}
        <div
          className="ks-completeness-progress-track"
          role="progressbar"
          aria-valuenow={completeness}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Account Completeness Progress"
        >
          <div
            ref={progressFillRef}
            className="ks-completeness-progress-fill"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </section>

      {/* 2. Setup Roadmap Checklist Card */}
      <section className="ks-card ks-overview-lower-card ks-checklist-card" aria-label="Account Setup Checklist">
        <div className="ks-checklist-header">
          <div>
            <h3 className="ks-card-section-title">Setup Roadmap</h3>
            <p className="ks-card-section-desc">Key milestones to optimize your deal tracking experience</p>
          </div>
          <span className="ks-checklist-badge">
            {completedCount} of 5 completed
          </span>
        </div>

        <div className="ks-checklist-rows">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`ks-compact-checklist-row ${step.done ? "is-done" : ""}`}
            >
              {/* Column 1: Status Icon */}
              <div className="ks-checklist-col-icon">
                {step.done ? (
                  <div className="ks-check-circle ks-check-circle--done" aria-label="Completed">
                    <Check size={13} strokeWidth={3} />
                  </div>
                ) : (
                  <div className="ks-check-circle ks-check-circle--pending" aria-label={`Step ${step.stepNum}`}>
                    <span>{step.stepNum}</span>
                  </div>
                )}
              </div>

              {/* Column 2: Title and Subtitle */}
              <div className="ks-checklist-col-text">
                <h4 className={`ks-checklist-item-title ${step.done ? "is-crossed" : ""}`}>
                  {step.title}
                </h4>
                <p className="ks-checklist-item-desc">{step.desc}</p>
              </div>

              {/* Column 3: Action */}
              <div className="ks-checklist-col-action">
                {step.done ? (
                  <span className="ks-checklist-done-tag">
                    <CheckCircle2 size={13} />
                    <span>Done</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={step.action}
                    className="ks-checklist-action-btn"
                  >
                    <span>{step.actionLabel}</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Two-Column Row: Active Price Alerts & Recently Viewed */}
      <div className="ks-overview-two-col-grid">
        {/* Active Price Alerts Card */}
        <section className="ks-card ks-overview-lower-card ks-alerts-card" aria-label="Active Price Alerts">
          {/* Card Header as a flex row with 40px icon tile, text column, right link */}
          <div className="ks-overview-card-header">
            <div className="ks-overview-header-icon ks-overview-header-icon--alert">
              <Bell size={18} />
            </div>

            <div className="ks-overview-header-text">
              <h3 className="ks-overview-card-title">Active Price Alerts</h3>
              <p className="ks-overview-card-subtitle">Live background price-drop monitor</p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab("alerts")}
              className="ks-overview-view-all-link"
              aria-label={`View all ${alerts.length} active price alerts`}
            >
              <span>View all ({alerts.length})</span>
              <ChevronRight size={14} className="ks-chevron-nudge" />
            </button>
          </div>

          {/* Card Body */}
          {alerts.length === 0 ? (
            <div className="ks-empty-state-compact">
              <div className="ks-empty-icon-tile ks-empty-icon-tile--yellow">
                <Bell size={22} />
              </div>
              <div className="ks-empty-text-group">
                <h4 className="ks-empty-title">No price alerts active right now</h4>
                <p className="ks-empty-desc">
                  Tap the bell icon on any product in the deals feed to automatically track price drops!
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("alerts")}
                className="ks-outline-pill-btn"
              >
                <span>Go to Price Alerts</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <div className="ks-overview-items-list">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="ks-overview-item-row"
                >
                  <div className="ks-overview-item-left">
                    {alert.product?.image ? (
                      <img
                        src={alert.product.image}
                        alt=""
                        className="ks-overview-item-thumb"
                      />
                    ) : (
                      <div className="ks-overview-item-thumb ks-overview-item-thumb--placeholder">
                        P
                      </div>
                    )}
                    <div className="ks-overview-item-meta">
                      <h5 className="ks-overview-item-name truncate max-w-[200px]">
                        {alert.product?.name}
                      </h5>
                      <div className="ks-overview-item-prices">
                        <span>Target: <strong className="text-[#22FF88]">₹{alert.target_price}</strong></span>
                        <span>·</span>
                        <span>Now: ₹{alert.product?.price}</span>
                      </div>
                    </div>
                  </div>

                  <span className="ks-active-status-badge">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recently Viewed Deals Card */}
        <section className="ks-card ks-overview-lower-card ks-recent-card" aria-label="Recently Viewed Deals">
          {/* Card Header as a flex row with 40px icon tile, text column, right link */}
          <div className="ks-overview-card-header">
            <div className="ks-overview-header-icon ks-overview-header-icon--recent">
              <Clock size={18} />
            </div>

            <div className="ks-overview-header-text">
              <h3 className="ks-overview-card-title">Recently Viewed</h3>
              <p className="ks-overview-card-subtitle">Browsing history across Indian stores</p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab("recent")}
              className="ks-overview-view-all-link"
              aria-label={`View all ${recentlyViewed.length} recently viewed items`}
            >
              <span>View all ({recentlyViewed.length})</span>
              <ChevronRight size={14} className="ks-chevron-nudge" />
            </button>
          </div>

          {/* Card Body */}
          {recentlyViewed.length === 0 ? (
            <div className="ks-empty-state-compact">
              <div className="ks-empty-icon-tile ks-empty-icon-tile--blue">
                <Clock size={22} />
              </div>
              <div className="ks-empty-text-group">
                <h4 className="ks-empty-title">No recently viewed products</h4>
                <p className="ks-empty-desc">
                  Discover trending deals across electronics, footwear, and home living in India today.
                </p>
              </div>
              <a
                href={`${BASE_URL}#deals`}
                className="ks-outline-pill-btn"
              >
                <span>Browse Deals</span>
                <ArrowRight size={13} />
              </a>
            </div>
          ) : (
            <div className="ks-overview-items-list">
              {recentlyViewed.slice(0, 3).map((item) => (
                <a
                  key={item.id}
                  href={`${BASE_URL}deal.html?id=${encodeURIComponent(item.id)}`}
                  className="ks-overview-item-row ks-overview-item-row--link group"
                >
                  <div className="ks-overview-item-left">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="ks-overview-item-thumb"
                      />
                    ) : (
                      <div className="ks-overview-item-thumb ks-overview-item-thumb--placeholder">
                        P
                      </div>
                    )}
                    <div className="ks-overview-item-meta">
                      <h5 className="ks-overview-item-name group-hover:text-[#38BDF8] transition truncate max-w-[200px]">
                        {item.name}
                      </h5>
                      <div className="ks-overview-item-prices">
                        <strong className="text-[#22FF88]">₹{item.price}</strong>
                        {item.store && <span className="text-gray-500">· {item.store}</span>}
                      </div>
                    </div>
                  </div>

                  <ExternalLink size={14} className="text-gray-500 group-hover:text-white transition shrink-0 ml-2" />
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
