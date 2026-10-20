import { useState, useMemo } from "react";
import { Camera, MapPin, ShoppingBag, CheckCircle, Calendar, Sparkles } from "lucide-react";

export default function HeaderBanner({
  profile,
  session,
  addressesCount = 0,
  cartCount = 0,
  completeness = 0,
  onOpenAvatarModal
}) {
  // SVG Circular progress math (radius 50, circumference ~ 314.16)
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completeness / 100) * circumference;

  // Member since date formatting
  const memberSince = useMemo(() => {
    const rawDate = profile?.created_at || session?.user?.created_at;
    if (!rawDate) return "Member";
    try {
      const d = new Date(rawDate);
      return `Member since ${d.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
    } catch {
      return "Member";
    }
  }, [profile?.created_at, session?.user?.created_at]);

  // Initials fallback
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

  return (
    <section className="ks-profile-banner" aria-label="Customer Profile Header">
      {/* Floating Gentle Particles */}
      <div className="ks-banner-particles" aria-hidden="true">
        <span className="ks-particle" style={{ width: 140, height: 140, left: "8%", top: "15%", animationDelay: "0s" }} />
        <span className="ks-particle" style={{ width: 180, height: 180, right: "12%", top: "25%", animationDelay: "2.5s", background: "radial-gradient(circle, rgba(56, 189, 248, 0.7) 0%, transparent 70%)" }} />
        <span className="ks-particle" style={{ width: 100, height: 100, left: "45%", bottom: "10%", animationDelay: "5s", background: "radial-gradient(circle, rgba(255, 214, 10, 0.5) 0%, transparent 70%)" }} />
      </div>

      <div className="ks-banner-container">
        {/* User Identity: Big Avatar + Ring + Info */}
        <div className="ks-banner-identity">
          <div className="ks-avatar-ring-container">
            {/* SVG Completeness Ring */}
            <svg className="ks-completeness-svg" viewBox="0 0 120 120" role="img" aria-label={`Profile ${completeness}% complete`}>
              <defs>
                <linearGradient id="ksCompletenessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22FF88" />
                  <stop offset="70%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#FFD60A" />
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
                <span>Change</span>
              </div>
            </div>

            {/* Completeness Badge */}
            <div className="ks-avatar-badge-pct" title="Profile Completeness">
              {completeness}%
            </div>
          </div>

          <div className="ks-banner-info">
            <h1 className="ks-user-name">
              <span>{profile?.full_name || "Welcome!"}</span>
              <span className="ks-user-badge">Verified Customer</span>
            </h1>
            <p className="ks-user-email">{profile?.email || session?.user?.email}</p>
            <p className="ks-user-member-since">
              <Calendar size={13} />
              <span>{memberSince}</span>
            </p>
          </div>
        </div>

        {/* Stat Chips */}
        <div className="ks-banner-stats">
          <div className="ks-stat-chip" title="Saved Addresses">
            <div className="ks-stat-chip-icon addresses">
              <MapPin size={18} />
            </div>
            <div className="ks-stat-chip-text">
              <span className="ks-stat-chip-val">{addressesCount}</span>
              <span className="ks-stat-chip-lbl">Saved Addresses</span>
            </div>
          </div>

          <div className="ks-stat-chip" title="Items in Shopping Cart">
            <div className="ks-stat-chip-icon cart">
              <ShoppingBag size={18} />
            </div>
            <div className="ks-stat-chip-text">
              <span className="ks-stat-chip-val">{cartCount}</span>
              <span className="ks-stat-chip-lbl">Cart Items</span>
            </div>
          </div>

          <div className="ks-stat-chip" title="Profile Completion Status">
            <div className="ks-stat-chip-icon completeness">
              <Sparkles size={18} />
            </div>
            <div className="ks-stat-chip-text">
              <span className="ks-stat-chip-val">{completeness}%</span>
              <span className="ks-stat-chip-lbl">Profile Complete</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
