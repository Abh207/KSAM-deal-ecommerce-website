import { useEffect, useRef, useState, useCallback } from "react";
import {
  LayoutDashboard,
  User,
  MapPin,
  Bell,
  Clock,
  Shield,
  Sliders,
  Palette,
  HelpCircle,
  AlertTriangle,
  ChevronRight
} from "lucide-react";

export const SECTIONS = [
  {
    id: "overview",
    label: "Overview",
    fullLabel: "Overview",
    title: "Activity & Setup Dashboard",
    eyebrow: "Account Overview",
    desc: "Track profile completion milestones, price alert monitors, and recent browsing history.",
    icon: LayoutDashboard
  },
  {
    id: "profile",
    label: "Profile",
    fullLabel: "Edit Profile",
    title: "Edit Your Profile",
    eyebrow: "Personal Info",
    desc: "Manage your verified name, primary login email, contact phone number, and personal details.",
    icon: User
  },
  {
    id: "addresses",
    label: "Addresses",
    fullLabel: "Addresses",
    title: "Delivery Addresses",
    eyebrow: "Saved Locations",
    desc: "Save and manage delivery pin codes to instantly check shipping eligibility and speeds.",
    icon: MapPin,
    countKey: "addresses"
  },
  {
    id: "alerts",
    label: "Alerts",
    fullLabel: "Price Alerts",
    title: "Active Price Drop Alerts",
    eyebrow: "Live Tracking",
    desc: "Live deal monitoring: we track online partner stores and notify you when prices hit your target.",
    icon: Bell,
    countKey: "alerts"
  },
  {
    id: "recent",
    label: "Recent",
    fullLabel: "Recently Viewed",
    title: "Recently Viewed Deals",
    eyebrow: "Browsing History",
    desc: "Quickly revisit gadgets, apparel, and electronic deals you recently explored.",
    icon: Clock,
    countKey: "recent"
  },
  {
    id: "security",
    label: "Security",
    fullLabel: "Security",
    title: "Login Credentials & Security",
    eyebrow: "Account Security",
    desc: "Update your password with live strength verification, revoke remote sessions, and manage sign-in methods.",
    icon: Shield
  },
  {
    id: "notifications",
    label: "Alert Settings",
    fullLabel: "Notifications",
    title: "Notification Preferences",
    eyebrow: "Communication",
    desc: "Fine-tune how and when KSAM Deal reaches out regarding price drops, deal alerts, and newsletters.",
    icon: Sliders
  },
  {
    id: "appearance",
    label: "Theme",
    fullLabel: "Appearance",
    title: "Theme & Color Accents",
    eyebrow: "Display Mode",
    desc: "Personalize your display mode (Dark/Light/Auto) and select your high-contrast brand accent.",
    icon: Palette
  },
  {
    id: "help",
    label: "Help",
    fullLabel: "Help & Legal",
    title: "Help & Legal Documentation",
    eyebrow: "Support & Compliance",
    desc: "Official customer assistance channels, terms of service, and transparent affiliate disclosure statements.",
    icon: HelpCircle
  },
  {
    id: "danger",
    label: "Account",
    fullLabel: "Danger Zone",
    title: "Danger Zone",
    eyebrow: "Irreversible Actions",
    desc: "Permanently delete your KSAM Deal account and erase saved data under DPDP 2023.",
    icon: AlertTriangle,
    isDanger: true
  }
];

export default function SectionNav({ activeSection, onNavigate, counts = {} }) {
  const navContainerRef = useRef(null);
  const trackRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0
  });

  // Update sliding indicator position
  const updateIndicator = useCallback(() => {
    if (!trackRef.current) return;
    const activeBtn = trackRef.current.querySelector(`[data-section-id="${activeSection}"]`);
    if (activeBtn) {
      const isDesktop = window.innerWidth >= 1024;
      const trackRect = trackRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();

      if (isDesktop) {
        setIndicatorStyle({
          left: btnRect.left - trackRect.left,
          top: btnRect.top - trackRect.top,
          width: btnRect.width,
          height: btnRect.height,
          opacity: 1
        });
      } else {
        setIndicatorStyle({
          left: btnRect.left - trackRect.left,
          top: btnRect.top - trackRect.top,
          width: btnRect.width,
          height: btnRect.height,
          opacity: 1
        });

        // Auto-scroll horizontal container so active tab stays centered
        if (navContainerRef.current) {
          const container = navContainerRef.current;
          const scrollLeft =
            btnRect.left - trackRect.left - container.clientWidth / 2 + btnRect.width / 2;
          container.scrollTo({
            left: scrollLeft,
            behavior: "smooth"
          });
        }
      }
    }
  }, [activeSection]);

  useEffect(() => {
    updateIndicator();
    const handleResize = () => updateIndicator();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateIndicator]);

  const handleSelect = (sectionId) => {
    if (onNavigate) {
      onNavigate(sectionId);
    }
  };

  // Keyboard navigation for role="tablist"
  const handleKeyDown = (e, index) => {
    let nextIndex = null;
    const total = SECTIONS.length;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % total;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + total) % total;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = total - 1;
    }

    if (nextIndex !== null) {
      const nextSec = SECTIONS[nextIndex];
      handleSelect(nextSec.id);
      const targetBtn = trackRef.current?.querySelector(`[data-section-id="${nextSec.id}"]`);
      if (targetBtn) {
        targetBtn.focus();
      }
    }
  };

  return (
    <aside className="ks-hub-sidebar" aria-label="Profile navigation">
      <nav
        className="ks-sticky-nav"
        role="tablist"
        aria-label="Account Sections"
      >
        <div className="ks-sticky-nav-inner">
          <div ref={navContainerRef} className="ks-sticky-nav-scroll">
            <div ref={trackRef} className="ks-sticky-nav-track">
              {/* Sliding Active Indicator */}
              <div
                className={`ks-nav-active-pill ${activeSection === "danger" ? "is-danger-pill" : ""}`}
                style={{
                  transform: `translate3d(${indicatorStyle.left}px, ${indicatorStyle.top}px, 0)`,
                  width: `${indicatorStyle.width}px`,
                  height: `${indicatorStyle.height}px`,
                  opacity: indicatorStyle.opacity
                }}
                aria-hidden="true"
              />

              {SECTIONS.map((sec, idx) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                const count = sec.countKey && counts[sec.countKey] !== undefined ? counts[sec.countKey] : null;

                return (
                  <button
                    key={sec.id}
                    id={`tab-${sec.id}`}
                    role="tab"
                    type="button"
                    data-section-id={sec.id}
                    aria-selected={isActive}
                    aria-controls={`panel-${sec.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => handleSelect(sec.id)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className={`ks-nav-pill-btn ${isActive ? "is-active" : ""} ${sec.isDanger ? "is-danger" : ""}`}
                  >
                    <Icon size={20} className="ks-nav-tab-icon shrink-0" />
                    <span className="ks-nav-tab-text">
                      <span className="hidden sm:inline">{sec.fullLabel || sec.label}</span>
                      <span className="sm:hidden">{sec.label}</span>
                    </span>

                    {count !== null && count > 0 && (
                      <span className="ks-nav-count-badge shrink-0" aria-label={`${count} items`}>
                        {count}
                      </span>
                    )}

                    <ChevronRight size={14} className="ks-nav-desktop-chevron shrink-0 ml-auto hidden lg:block opacity-0 group-hover:opacity-60 transition" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
