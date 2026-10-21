import { useState, useEffect, useMemo, useRef } from "react";
import {
  Camera,
  MapPin,
  Bell,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  ShoppingBag,
  UserCheck
} from "lucide-react";
import gsap from "gsap";
import { BASE_URL } from "../../auth/auth.js";
import { respectReducedMotion, magnetic } from "../../lib/motion.js";

function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (respectReducedMotion()) {
      setCount(parseInt(target, 10) || 0);
      return;
    }

    const end = parseInt(target, 10) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }

    const totalSteps = 24;
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

export default function ProfileHero({
  profile,
  session,
  addressesCount = 0,
  alertsCount = 0,
  recentCount = 0,
  completeness = 0,
  onOpenAvatarModal,
  onNavigateSection
}) {
  const heroRef = useRef(null);
  const primaryBtnRef = useRef(null);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completeness / 100) * circumference;

  const animatedCompleteness = useCountUp(completeness, 900);
  const animatedAddresses = useCountUp(addressesCount, 750);
  const animatedAlerts = useCountUp(alertsCount, 750);
  const animatedRecent = useCountUp(recentCount, 750);

  // GSAP Hero Entrance & Magnetic Pull
  useEffect(() => {
    if (!heroRef.current || respectReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Staggered reveal for user identity and meta row
      gsap.from(".ks-hero-meta-col > *", {
        y: 20,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: "power3.out"
      });

      // Stat cards entrance
      gsap.from(".ks-hero-stat-card", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: "power3.out",
        delay: 0.15
      });

      // SVG Ring Draw-in
      gsap.fromTo(
        ".ks-completeness-meter-bar",
        { strokeDashoffset: circumference },
        { strokeDashoffset, duration: 1.1, ease: "power2.out", delay: 0.1 }
      );
    }, heroRef);

    // Magnetic pull on desktop pointer only
    const cleanupMagnetic = primaryBtnRef.current ? magnetic(primaryBtnRef.current, 6) : null;

    return () => {
      ctx.revert();
      if (typeof cleanupMagnetic === "function") cleanupMagnetic();
    };
  }, [circumference, strokeDashoffset]);

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
    <section ref={heroRef} className="ks-hero-section relative overflow-hidden" aria-label="Account Hub Hero">
      {/* 1. Animated Ambient Gradient Mesh */}
      <div className="kx-mesh-bg" aria-hidden="true">
        <div className="kx-mesh-circle-1" />
        <div className="kx-mesh-circle-2" />
        <div className="kx-mesh-circle-3" />
      </div>

      {/* 2. Micro Noise / Grain Layer */}
      <div className="kx-noise-overlay" aria-hidden="true" />

      {/* 3. Blended Background Cover (lamplight.png) */}
      <div className="ks-hero-cover-bg" aria-hidden="true">
        <img
          src={bannerCoverImg}
          alt=""
          loading="lazy"
          className="ks-hero-cover-img"
        />
        <div className="ks-hero-cover-overlay" />
      </div>

      {/* Main Hero Content Container */}
      <div className="ks-hero-content-wrapper relative z-10">
        <div className="ks-hero-main-row">
          {/* Left Column: Big Interactive Avatar + Completeness Ring */}
          <div className="ks-hero-avatar-col">
            <div className="ks-avatar-ring-container kx-conic-glow">
              <svg
                className="ks-completeness-svg"
                viewBox="0 0 130 130"
                role="img"
                aria-label={`Profile setup ${completeness}% completed`}
              >
                <defs>
                  <linearGradient id="ksHeroCompletenessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2DFFB2" />
                    <stop offset="50%" stopColor="#26D9F8" />
                    <stop offset="100%" stopColor="#8B7CFF" />
                  </linearGradient>
                </defs>
                <circle
                  className="ks-completeness-meter-bg"
                  cx="65"
                  cy="65"
                  r={radius}
                  fill="none"
                  strokeWidth="4"
                />
                <circle
                  className="ks-completeness-meter-bar"
                  cx="65"
                  cy="65"
                  r={radius}
                  fill="none"
                  strokeWidth="4.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  stroke="url(#ksHeroCompletenessGrad)"
                />
              </svg>

              {/* Clickable Avatar Circle */}
              <div
                className="ks-avatar-circle"
                onClick={onOpenAvatarModal}
                role="button"
                tabIndex={0}
                aria-label="Upload or update profile photo"
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

                <div className="ks-avatar-overlay-btn" aria-hidden="true">
                  <Camera size={20} />
                  <span>Upload</span>
                </div>
              </div>

              {/* Completeness Badge Pill */}
              <div
                className="ks-avatar-badge-pct"
                title={`${completeness}% profile completeness`}
              >
                <Sparkles size={11} className="text-[#2DFFB2] inline mr-1" />
                {animatedCompleteness}%
              </div>
            </div>
          </div>

          {/* Center Column: Greeting, Name, Meta & Quick Action Buttons */}
          <div className="ks-hero-meta-col">
            <div className="kx-eyebrow">
              <Zap size={12} className="text-[#2DFFB2]" />
              <span>Personal Account Hub</span>
            </div>

            <h1 className="ks-hero-title">
              {profile?.full_name ? (
                <>Welcome back, <span className="ks-hero-name-highlight">{profile.full_name}</span></>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigateSection && onNavigateSection("profile")}
                  className="ks-hero-prompt-btn hover:text-[#22FF88] transition text-left"
                >
                  Welcome! <span className="underline decoration-dotted decoration-[#22FF88]/60">Add your name</span> →
                </button>
              )}
            </h1>

            <div className="ks-hero-meta-strip">
              <span className="ks-hero-email">{profile?.email || session?.user?.email}</span>

              {isEmailVerified ? (
                <span className="ks-badge-pill verified" title="Email verified with KSAM Deal">
                  <CheckCircle2 size={12} />
                  <span>Verified Member</span>
                </span>
              ) : (
                <a
                  href={`${BASE_URL}verify-email.html`}
                  className="ks-badge-pill unverified hover:bg-amber-400/20 transition"
                  title="Click to verify your email"
                >
                  <AlertTriangle size={12} />
                  <span>Verify Email</span>
                </a>
              )}

              <span className="ks-badge-pill member-since">
                <Calendar size={12} />
                <span>{memberSince}</span>
              </span>
            </div>

            {/* Action Buttons: "Edit profile" (scrolls to #profile) and "Explore deals" (Deals home) */}
            <div className="ks-hero-actions-row">
              <button
                ref={primaryBtnRef}
                type="button"
                onClick={() => onNavigateSection && onNavigateSection("profile")}
                className="ks-btn-primary kx-magnetic-btn"
              >
                <UserCheck size={16} />
                <span>Edit Profile</span>
              </button>

              <a
                href={`${BASE_URL}#deals`}
                className="ks-btn-secondary"
              >
                <ShoppingBag size={16} />
                <span>Explore Deals</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* Right Column: 4 Animated Stat Counters */}
          <div className="ks-hero-stats-col">
            <button
              type="button"
              onClick={() => onNavigateSection && onNavigateSection("addresses")}
              className="ks-hero-stat-card kx-card--glass"
              title="Jump to saved delivery addresses"
            >
              <div className="ks-stat-icon-wrap icon-addresses">
                <MapPin size={20} />
              </div>
              <div className="ks-stat-body">
                <span className="ks-stat-num">{animatedAddresses}</span>
                <span className="ks-stat-tag">Saved Addresses</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateSection && onNavigateSection("alerts")}
              className="ks-hero-stat-card kx-card--glass"
              title="Jump to active price drop alerts"
            >
              <div className="ks-stat-icon-wrap icon-alerts">
                <Bell size={20} />
              </div>
              <div className="ks-stat-body">
                <span className="ks-stat-num">{animatedAlerts}</span>
                <span className="ks-stat-tag">Price Alerts</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateSection && onNavigateSection("recent")}
              className="ks-hero-stat-card kx-card--glass"
              title="Jump to recently viewed items"
            >
              <div className="ks-stat-icon-wrap icon-recent">
                <Clock size={20} />
              </div>
              <div className="ks-stat-body">
                <span className="ks-stat-num">{animatedRecent}</span>
                <span className="ks-stat-tag">Recently Viewed</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigateSection && onNavigateSection("overview")}
              className="ks-hero-stat-card kx-card--glass"
              title="Jump to completeness checklist"
            >
              <div className="ks-stat-icon-wrap icon-completeness">
                <Sparkles size={20} />
              </div>
              <div className="ks-stat-body">
                <span className="ks-stat-num">{animatedCompleteness}%</span>
                <span className="ks-stat-tag">Completeness</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
