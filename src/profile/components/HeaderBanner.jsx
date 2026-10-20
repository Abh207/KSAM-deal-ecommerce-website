import { useState, useEffect, useMemo } from "react";
import { Camera, MapPin, Bell, Clock, Sparkles, Calendar, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { BASE_URL } from "../../auth/auth.js";

function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(target, 10) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }

    const totalSteps = 25;
    const stepTime = duration / totalSteps;
    const increment = end / totalSteps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

const MARQUEE_KEYWORDS = [
  "DEAL DISCOVERY",
  "PRICE ALERTS",
  "WISHLIST",
  "SAVED ADDRESSES",
  "VERIFIED MERCHANTS",
  "REAL-TIME DROPS",
  "SECURITY HUB",
  "INDIA DEALS"
];

export default function HeaderBanner({
  profile,
  session,
  addressesCount = 0,
  alertsCount = 0,
  recentCount = 0,
  completeness = 0,
  onOpenAvatarModal,
  onNavigateTab
}) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completeness / 100) * circumference;

  const animatedCompleteness = useCountUp(completeness);
  const animatedAddresses = useCountUp(addressesCount);
  const animatedAlerts = useCountUp(alertsCount);
  const animatedRecent = useCountUp(recentCount);

  const isEmailVerified = !!(session?.user?.email_confirmed_at || session?.user?.confirmed_at);

  const memberSince = useMemo(() => {
    const rawDate = profile?.created_at || session?.user?.created_at;
    if (!rawDate) return "Member";
    try {
      const d = new Date(rawDate);
      return `Member since ${d.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`;
    } catch {
      return "Member";
    }
  }, [profile?.created_at, session?.user?.created_at]);

  const initials = useMemo(() => {
    if (profile?.full_name?.trim()) {
      const parts = profile.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    const email = profile?.email || session?.user?.email || "";
    return email ? email[0].toUpperCase() : "U";
  }, [profile?.full_name, profile?.email, session?.user?.email]);

  const bannerCoverImg = `${BASE_URL}lamplight.png`;

  return (
    <section className="ks-profile-banner relative overflow-hidden" aria-label="Customer Profile Header">
      {/* 1. Restrained Mesh Background with transform-only keyframes */}
      <div className="kx-mesh-bg" aria-hidden="true">
        <div className="kx-mesh-circle-1" />
        <div className="kx-mesh-circle-2" />
        <div className="kx-mesh-circle-3" />
      </div>

      {/* 2. Micro SVG Grain/Noise Overlay */}
      <div className="kx-noise-overlay" aria-hidden="true" />

      {/* 3. Blended Background Cover from Inventory */}
      <div className="ks-banner-cover-bg" aria-hidden="true">
        <img
          src={bannerCoverImg}
          alt=""
          loading="lazy"
          className="ks-banner-cover-img"
        />
        <div className="ks-banner-cover-overlay" />
      </div>

      <div className="ks-banner-container relative z-10">
        {/* User Identity: Big Avatar + Ring + Details */}
        <div className="ks-banner-identity">
          <div className="ks-avatar-ring-container kx-conic-glow">
            {/* SVG Completeness Ring */}
            <svg className="ks-completeness-svg" viewBox="0 0 120 120" role="img" aria-label={`Profile ${completeness}% complete`}>
              <defs>
                <linearGradient id="ksCompletenessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--kx-accent)" />
                  <stop offset="70%" stopColor="var(--kx-cyan)" />
                  <stop offset="100%" stopColor="var(--kx-yellow)" />
                </linearGradient>
              </defs>
              <circle
                className="ks-completeness-meter-bg"
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                strokeWidth="4"
              />
              <circle
                className="ks-completeness-meter-bar"
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                strokeWidth="4.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>

            {/* Inner Interactive Avatar Circle */}
            <div
              className="ks-avatar-circle"
              onClick={onOpenAvatarModal}
              role="button"
              tabIndex={0}
              aria-label="Change profile picture"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpenAvatarModal();
                }
              }}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || "Profile avatar"}
                  className="ks-avatar-img-big"
                />
              ) : (
                <div className="ks-avatar-initials-big">{initials}</div>
              )}

              {/* Hover Edit Overlay */}
              <div className="ks-avatar-overlay-btn" aria-hidden="true">
                <Camera size={20} />
                <span>Upload</span>
              </div>
            </div>

            {/* Completeness Badge */}
            <div className="ks-avatar-badge-pct" title="Profile Completeness">
              {animatedCompleteness}%
            </div>
          </div>

          <div className="ks-banner-info">
            <div className="kx-eyebrow">
              <Zap size={12} />
              <span>Personal Account Hub</span>
            </div>

            <h1 className="ks-user-name">
              <span>{profile?.full_name || "Add your name"}</span>
              {isEmailVerified ? (
                <span className="ks-user-badge verified" title="Email address confirmed">
                  <CheckCircle2 size={12} /> Verified
                </span>
              ) : (
                <a
                  href={`${BASE_URL}verify-email.html`}
                  className="ks-user-badge unverified"
                  title="Verify your email address"
                >
                  <AlertTriangle size={12} /> Verify Email
                </a>
              )}
            </h1>

            <p className="ks-user-email">{profile?.email || session?.user?.email}</p>

            <div className="ks-user-meta-row">
              <span className="ks-user-member-since">
                <Calendar size={13} />
                <span>{memberSince}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 4 Quick Stat Cards with Glassmorphism & Hover Lift */}
        <div className="ks-banner-stats">
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("addresses")}
            className="ks-stat-chip kx-card--glass"
            title="Manage Saved Addresses"
          >
            <div className="ks-stat-chip-icon addresses">
              <MapPin size={18} />
            </div>
            <div className="ks-stat-chip-text">
              <span className="ks-stat-chip-val">{animatedAddresses}</span>
              <span className="ks-stat-chip-lbl">Addresses</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("alerts")}
            className="ks-stat-chip kx-card--glass"
            title="View Active Price Alerts"
          >
            <div className="ks-stat-chip-icon alerts">
              <Bell size={18} />
            </div>
            <div className="ks-stat-chip-text">
              <span className="ks-stat-chip-val">{animatedAlerts}</span>
              <span className="ks-stat-chip-lbl">Price Alerts</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("recent")}
            className="ks-stat-chip kx-card--glass"
            title="Browse Recently Viewed Products"
          >
            <div className="ks-stat-chip-icon recent">
              <Clock size={18} />
            </div>
            <div className="ks-stat-chip-text">
              <span className="ks-stat-chip-val">{animatedRecent}</span>
              <span className="ks-stat-chip-lbl">Recently Viewed</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab("overview")}
            className="ks-stat-chip kx-card--glass"
            title="Profile Completeness Score"
          >
            <div className="ks-stat-chip-icon completeness">
              <Sparkles size={18} />
            </div>
            <div className="ks-stat-chip-text">
              <span className="ks-stat-chip-val">{animatedCompleteness}%</span>
              <span className="ks-stat-chip-lbl">Completeness</span>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Seamless Horizontal Decorative Marquee Strip */}
      <div className="kx-marquee mt-8 border-t border-white/5 pt-3" aria-hidden="true">
        <div className="kx-marquee-track">
          {[...MARQUEE_KEYWORDS, ...MARQUEE_KEYWORDS, ...MARQUEE_KEYWORDS].map((kw, i) => (
            <span key={i} className="kx-marquee-pill">
              <span className="kx-dot" />
              {kw}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
