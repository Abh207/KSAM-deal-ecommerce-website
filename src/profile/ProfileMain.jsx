import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createRoot } from "react-dom/client";

import { supabase } from "../lib/supabase";
import { getSession, onAuthChange, BASE_URL, getPendingAction, clearPendingAction, getStoredSessionSync } from "../auth/auth.js";
import { getPriceAlerts, getRecentlyViewed } from "../deals/services/accountActivityService.js";

import Footer from "../deals/components/Footer.jsx";
import Navbar from "../deals/components/Navbar.jsx";
import Newsletter from "../deals/components/Newsletter.jsx";
import Toast from "../deals/components/Toast.jsx";
import Pricing from "../deals/components/Pricing.jsx";

import ProfileHero from "./components/ProfileHero.jsx";
import SectionNav, { SECTIONS } from "./components/SectionNav.jsx";
import SignedOutGate from "./components/SignedOutGate.jsx";
import LiveBackdrop from "./components/LiveBackdrop.jsx";
import ProfileProductStrip from "./components/ProfileProductStrip.jsx";

import OverviewTab from "./components/OverviewTab.jsx";
import PersonalInfoTab from "./components/PersonalInfoTab.jsx";
import AddressesTab from "./components/AddressesTab.jsx";
import PriceAlertsTab from "./components/PriceAlertsTab.jsx";
import RecentlyViewedTab from "./components/RecentlyViewedTab.jsx";
import SecurityTab from "./components/SecurityTab.jsx";
import NotificationsTab from "./components/NotificationsTab.jsx";
import AppearanceTab from "./components/AppearanceTab.jsx";
import HelpLegalTab from "./components/HelpLegalTab.jsx";
import DangerZoneTab from "./components/DangerZoneTab.jsx";
import SaveBar from "./components/SaveBar.jsx";
import AvatarModal from "./components/AvatarModal.jsx";
import UnsavedChangesModal from "./components/UnsavedChangesModal.jsx";

import "../deals/tailwind-generated.css";
import "../deals/deals.css";
import "../deals/responsive-cards.css";
import "./profile.css";
import "./kx-spotlight.css";
import "../styles/kx-tokens.css";
import "../styles/kx-motion.css";

// Extensible list of account & legal routes without global footer
export const PAGES_WITHOUT_FOOTER = [
  "profile.html",
  "/profile",
  "profile",
  "privacy-policy.html",
  "terms.html",
  "affiliate-disclosure.html"
];

const VALID_SECTIONS = [
  "overview", "profile", "addresses", "alerts", "recent",
  "security", "notifications", "appearance", "help", "danger"
];

function SectionArt({ sectionId }) {
  switch (sectionId) {
    case "overview":
      return (
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none" className="ks-art-svg">
          <circle cx="42" cy="42" r="38" stroke="rgba(34, 255, 136, 0.2)" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="42" cy="42" r="26" stroke="#22FF88" strokeWidth="2.5" strokeDasharray="120" strokeDashoffset="30" />
          <path d="M42 22V42L54 50" stroke="#B6FF3B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="42" cy="42" r="5" fill="#22FF88" />
        </svg>
      );
    case "profile":
      return (
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none" className="ks-art-svg">
          <rect x="12" y="14" width="60" height="56" rx="14" stroke="rgba(34, 255, 136, 0.3)" strokeWidth="2" />
          <circle cx="42" cy="34" r="12" stroke="#22FF88" strokeWidth="2.5" />
          <path d="M26 60C26 51.5 33 48 42 48C51 48 58 51.5 58 60" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case "addresses":
      return (
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none" className="ks-art-svg">
          <circle cx="42" cy="42" r="36" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M42 16C31.5 16 23 24.5 23 35C23 49 42 68 42 68C42 68 61 49 61 35C61 24.5 52.5 16 42 16Z" stroke="#38BDF8" strokeWidth="2.5" />
          <circle cx="42" cy="34" r="6" fill="#22FF88" />
        </svg>
      );
    case "alerts":
      return (
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none" className="ks-art-svg">
          <path d="M42 18V22M42 22C33.5 22 28 29 28 39V52L22 58H62L56 52V39C56 29 50.5 22 42 22Z" stroke="#FFD60A" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M37 63C38 65.5 39.8 67 42 67C44.2 67 46 65.5 47 63" stroke="#FFD60A" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="56" cy="24" r="4" fill="#22FF88" />
        </svg>
      );
    case "recent":
      return (
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none" className="ks-art-svg">
          <circle cx="42" cy="42" r="32" stroke="#38BDF8" strokeWidth="2.5" />
          <path d="M42 24V42L54 42" stroke="#22FF88" strokeWidth="3" strokeLinecap="round" />
          <circle cx="42" cy="42" r="4" fill="#FFD60A" />
        </svg>
      );
    case "security":
      return (
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none" className="ks-art-svg">
          <path d="M42 16L62 25V42C62 55 53.5 65.5 42 69C30.5 65.5 22 55 22 42V25L42 16Z" stroke="#22FF88" strokeWidth="2.5" />
          <circle cx="42" cy="39" r="6" stroke="#B6FF3B" strokeWidth="2.5" />
          <path d="M42 45V53" stroke="#B6FF3B" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case "notifications":
      return (
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none" className="ks-art-svg">
          <rect x="18" y="24" width="48" height="12" rx="6" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" />
          <circle cx="54" cy="30" r="8" fill="#22FF88" />
          <rect x="18" y="48" width="48" height="12" rx="6" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" />
          <circle cx="30" cy="54" r="8" fill="#38BDF8" />
        </svg>
      );
    case "appearance":
      return (
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none" className="ks-art-svg">
          <circle cx="42" cy="42" r="32" stroke="#FFD60A" strokeWidth="2.5" />
          <path d="M42 10C24.3 10 10 24.3 10 42C10 59.7 24.3 74 42 74V10Z" fill="rgba(34, 255, 136, 0.15)" />
          <circle cx="42" cy="42" r="14" fill="#22FF88" />
        </svg>
      );
    case "help":
      return (
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none" className="ks-art-svg">
          <circle cx="42" cy="42" r="32" stroke="#38BDF8" strokeWidth="2.5" />
          <circle cx="42" cy="42" r="18" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M35 34C35 30 38 27 42 27C46 27 49 30 49 34C49 38 45 40 42 43V48" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="42" cy="55" r="2" fill="#38BDF8" />
        </svg>
      );
    case "danger":
      return (
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none" className="ks-art-svg">
          <path d="M42 16L68 62H16L42 16Z" stroke="#EF4444" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M42 34V46" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
          <circle cx="42" cy="54" r="2.5" fill="#EF4444" />
        </svg>
      );
    default:
      return null;
  }
}

export function ProfileApp() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Active section tracking with URL hash and sessionStorage support
  const getInitialSection = () => {
    const rawHash = window.location.hash.replace("#", "").toLowerCase();
    const hash = rawHash === "theme" ? "appearance" : rawHash;
    if (VALID_SECTIONS.includes(hash)) {
      return hash;
    }
    const saved = sessionStorage.getItem("ksam_last_profile_section");
    if (saved && VALID_SECTIONS.includes(saved)) {
      return saved;
    }
    return "overview";
  };

  const [activeSection, setActiveSection] = useState(getInitialSection);

  // Form data for dirty state tracking
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    marketing_opt_in: false,
    preferences: {}
  });

  const [initialData, setInitialData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState("");

  // Live Theme & Accent synchronization
  const [effectiveTheme, setEffectiveTheme] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("data-theme") || "dark";
    }
    return "dark";
  });
  const [currentAccent, setCurrentAccent] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("data-accent") || "green";
    }
    return "green";
  });

  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e?.detail) {
        setEffectiveTheme(e.detail.theme);
        setCurrentAccent(e.detail.accent);
      }
    };
    window.addEventListener("ksam-theme-changed", handleThemeChange);
    return () => window.removeEventListener("ksam-theme-changed", handleThemeChange);
  }, []);

  // Handle pending action (e.g. from pricing login redirect)
  useEffect(() => {
    const pending = getPendingAction();
    const hasSession = Boolean(getStoredSessionSync());
    if (pending && hasSession) {
      if (pending.pending?.type === "pricing") {
        const planName = pending.pending.planName || "plan";
        setToast(`Membership ${planName} selected!`);
        try {
          localStorage.setItem("ksam_user_plan", planName);
        } catch (e) {}
      }
      clearPendingAction();
    }
  }, []);

  // Smooth-scroll to #pricing if loaded with that hash
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#pricing") {
      const scrollTimer = setTimeout(() => {
        const el = document.getElementById("pricing");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 400);
      return () => clearTimeout(scrollTimer);
    }
  }, []);

  // Unsaved changes confirmation dialog state
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingSection, setPendingSection] = useState(null);

  // Dirty state calculation
  const isDirty = useMemo(() => {
    if (!initialData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  // Section navigation with hash sync, title update, and unsaved changes guard
  const navigateToSection = useCallback((targetId, options = {}) => {
    const normId = targetId === "theme" ? "appearance" : targetId;
    if (!VALID_SECTIONS.includes(normId)) return;

    // If dirty and switching away, trigger confirmation modal
    if (isDirty && normId !== activeSection && !options.skipDirtyCheck) {
      setPendingSection(normId);
      setShowUnsavedModal(true);
      return;
    }

    setActiveSection(normId);
    sessionStorage.setItem("ksam_last_profile_section", normId);

    // Update URL hash without breaking history
    if (window.location.hash.replace("#", "").toLowerCase() !== normId) {
      if (options.replace) {
        window.history.replaceState(null, "", `#${normId}`);
      } else {
        window.history.pushState(null, "", `#${normId}`);
      }
    }

    // Update document title
    const currentMeta = SECTIONS.find((s) => s.id === normId);
    if (currentMeta) {
      document.title = `${currentMeta.fullLabel || currentMeta.label} | KSAM Deal`;
    }

    // Smooth scroll to top of panel if hero has scrolled out of view
    if (options.scroll !== false) {
      const contentEl = document.getElementById("ks-hub-content-area");
      if (contentEl) {
        const isDesktop = window.innerWidth >= 1024;
        const navbarHeight = isDesktop ? 72 : 64;
        const navOffset = navbarHeight + 24; // Navbar height plus 24px space
        const topPos = contentEl.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({
          top: Math.max(0, topPos),
          behavior: "smooth"
        });
      }
    }
  }, [activeSection, isDirty]);

  // Handle browser back/forward buttons (popstate and hashchange)
  useEffect(() => {
    const handlePopState = () => {
      const rawHash = window.location.hash.replace("#", "").toLowerCase();
      const hash = rawHash === "theme" ? "appearance" : rawHash;
      if (VALID_SECTIONS.includes(hash)) {
        navigateToSection(hash, { skipDirtyCheck: true, replace: true, scroll: false });
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handlePopState);
    };
  }, [navigateToSection]);

  // Sync title on initial mount
  useEffect(() => {
    const currentMeta = SECTIONS.find((s) => s.id === activeSection);
    if (currentMeta) {
      document.title = `${currentMeta.fullLabel || currentMeta.label} | KSAM Deal`;
    }
  }, [activeSection]);

  // Warn before browser window close with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Load session, profile, addresses, alerts, and recently viewed
  const loadData = useCallback(async () => {
    try {
      const currentSession = await getSession();
      if (!currentSession?.user?.id || !currentSession.user.email_confirmed_at) {
        setSession(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setSession(currentSession);
      const userId = currentSession.user.id;

      // 1. Fetch Profile
      let { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!profileData) {
        const newProf = {
          id: userId,
          email: currentSession.user.email,
          full_name: currentSession.user.user_metadata?.full_name || currentSession.user.user_metadata?.name || ""
        };
        const { data: createdProf } = await supabase
          .from("profiles")
          .insert(newProf)
          .select()
          .maybeSingle();
        profileData = createdProf || newProf;
      }

      setProfile(profileData);

      const formPayload = {
        full_name: profileData?.full_name || "",
        email: profileData?.email || currentSession.user.email || "",
        phone: profileData?.phone || "",
        date_of_birth: profileData?.date_of_birth || "",
        gender: profileData?.gender || "",
        marketing_opt_in: !!profileData?.marketing_opt_in,
        preferences: profileData?.preferences || {}
      };

      setFormData(formPayload);
      setInitialData(JSON.parse(JSON.stringify(formPayload)));

      // 2. Fetch Addresses
      const { data: addressesData } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      setAddresses(addressesData || []);

      // 3. Fetch Price Alerts
      const alertsData = await getPriceAlerts(userId);
      setAlerts(alertsData || []);

      // 4. Fetch Recently Viewed
      const recentData = await getRecentlyViewed(userId);
      setRecentlyViewed(recentData || []);
    } catch (err) {
      console.error("[Profile load error]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const sub = onAuthChange((_event, currentSession) => {
      if (!currentSession) {
        setSession(null);
        setProfile(null);
      } else {
        setSession(currentSession);
        loadData();
      }
    });

    return () => {
      if (sub && typeof sub.unsubscribe === "function") sub.unsubscribe();
    };
  }, [loadData]);

  // Profile Completeness Formula (5 distinct criteria x 20% = 100%, 1:1 with checklist)
  const completeness = useMemo(() => {
    let score = 0;
    if (formData.full_name?.trim().length >= 2) score += 20;
    if (/^[6-9]\d{9}$/.test(formData.phone?.trim() || "")) score += 20;
    if (profile?.avatar_url) score += 20;
    if (addresses.length > 0) score += 20;
    const isEmailVerified = !!(session?.user?.email_confirmed_at || session?.user?.confirmed_at);
    if (isEmailVerified) score += 20;
    return Math.min(100, score);
  }, [formData.full_name, formData.phone, profile?.avatar_url, addresses.length, session?.user]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleDiscard = () => {
    if (initialData) {
      setFormData(JSON.parse(JSON.stringify(initialData)));
      setErrors({});
    }
  };

  // Save changes to database and sync auth user
  const handleSaveChanges = async () => {
    if (!session?.user?.id) return false;

    const newErrors = {};
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit mobile number.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setToast("Please fix the validation errors before saving.");
      return false;
    }

    setIsSaving(true);
    try {
      const updatePayload = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        marketing_opt_in: formData.marketing_opt_in,
        preferences: formData.preferences || {}
      };

      // 1. Sync full_name with Supabase Auth metadata
      if (formData.full_name.trim()) {
        await supabase.auth.updateUser({
          data: { full_name: formData.full_name.trim() }
        });
      }

      // 2. Update profiles table
      const { data, error } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", session.user.id)
        .select()
        .single();

      if (error) throw error;

      // 3. Re-read row and update UI
      setProfile(data);
      const syncedPayload = {
        full_name: data.full_name || "",
        email: data.email || session.user.email || "",
        phone: data.phone || "",
        date_of_birth: data.date_of_birth || "",
        gender: data.gender || "",
        marketing_opt_in: !!data.marketing_opt_in,
        preferences: data.preferences || {}
      };
      setFormData(syncedPayload);
      setInitialData(JSON.parse(JSON.stringify(syncedPayload)));

      const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      setToast(`Saved to your account at ${timeStr}`);

      // Dispatch event so Navbar avatar and name update instantly
      window.dispatchEvent(
        new CustomEvent("ksam:avatar-updated", { detail: { profile: data } })
      );
      return true;
    } catch (err) {
      console.error("[Profile save error]", err);
      setToast(err.message || "Failed to save profile changes.");
      if (initialData) {
        setFormData(JSON.parse(JSON.stringify(initialData)));
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Remove photo handler
  const handleRemoveAvatar = async () => {
    if (!session?.user?.id) return;
    try {
      const filePath = `${session.user.id}/avatar.webp`;
      await supabase.storage.from("avatars").remove([filePath]);

      const { data } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", session.user.id)
        .select()
        .single();

      setProfile(data);
      setToast("Photo removed successfully");
      window.dispatchEvent(
        new CustomEvent("ksam:avatar-updated", { detail: { avatar_url: null } })
      );
    } catch (err) {
      console.error("[Remove avatar error]", err);
      setToast("Failed to remove photo.");
    }
  };

  // Modal actions for unsaved edits
  const handleModalSaveAndLeave = async () => {
    const success = await handleSaveChanges();
    if (success) {
      setShowUnsavedModal(false);
      if (pendingSection) {
        navigateToSection(pendingSection, { skipDirtyCheck: true });
        setPendingSection(null);
      }
    }
  };

  const handleModalDiscardAndLeave = () => {
    handleDiscard();
    setShowUnsavedModal(false);
    if (pendingSection) {
      navigateToSection(pendingSection, { skipDirtyCheck: true });
      setPendingSection(null);
    }
  };

  const handleModalStay = () => {
    setShowUnsavedModal(false);
    setPendingSection(null);
  };

  const activeMeta = useMemo(() => {
    return SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0];
  }, [activeSection]);

  const ActiveIcon = activeMeta.icon;
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const shouldRenderFooter = !PAGES_WITHOUT_FOOTER.some((p) => currentPath.includes(p));

  return (
    <div
      className="kx-page ks-profile-page relative"
      data-theme={effectiveTheme}
      data-accent={currentAccent}
    >
      {/* Dynamic Self-Generated Lissajous Canvas Backdrop with Cross-fading */}
      <LiveBackdrop
        palette={
          activeSection === "help"
            ? "help"
            : activeSection === "danger"
            ? "danger"
            : activeSection === "appearance"
            ? "appearance"
            : "default"
        }
        accent={currentAccent}
        isModalOpen={avatarModalOpen || showUnsavedModal || isDeleteModalOpen}
      />

      {/* 1. Shared Global Navbar */}
      <Navbar />

      {loading ? (
        <main className="ks-profile-body relative z-10" style={{ maxWidth: 1200, width: "100%", margin: "0 auto", padding: "80px 24px" }}>
          <div className="ks-skel" style={{ height: 260, marginBottom: 32, borderRadius: 28 }} />
          <div className="ks-skel" style={{ height: 52, width: "100%", marginBottom: 32, borderRadius: 16 }} />
          <div className="ks-skel" style={{ height: 420, borderRadius: 28 }} />
        </main>
      ) : !session ? (
        /* Signed-Out Visitor Gate State */
        <SignedOutGate />
      ) : (
        <>
          {/* 2. HERO (Full-width, avatar progress ring, stat counters) */}
          <ProfileHero
            profile={profile}
            session={session}
            addressesCount={addresses.length}
            alertsCount={alerts.length}
            recentCount={recentlyViewed.length}
            completeness={completeness}
            onOpenAvatarModal={() => setAvatarModalOpen(true)}
            onNavigateSection={navigateToSection}
          />

          {/* 3. ONE SECTION AT A TIME - STICKY NAV + ACTIVE PANEL */}
          <div className="ks-account-hub-layout relative z-10" id="ks-hub-content-area">
            {/* Desktop sticky sidebar / Mobile horizontal sticky pill bar */}
            <SectionNav
              activeSection={activeSection}
              onNavigate={navigateToSection}
              counts={{
                addresses: addresses.length,
                alerts: alerts.length,
                recent: recentlyViewed.length
              }}
            />

            {/* Active Panel Main Area with min-height */}
            <main
              className="ks-hub-content"
              id={`panel-${activeSection}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeSection}`}
              tabIndex={0}
            >
              {/* Open Panel Header: sits directly on section background without heavy card borders */}
              {activeSection !== "overview" && (
                <div className={`kx-panel-header-open ${activeMeta.isDanger ? "is-danger-header" : ""}`}>
                  <div className="kx-panel-header-left">
                    <div className={`kx-section-eyebrow ${activeMeta.isDanger ? "text-red-400" : ""}`}>
                      <ActiveIcon size={14} className="shrink-0" />
                      <span>{activeMeta.eyebrow}</span>
                    </div>
                    <h1 className={`kx-panel-heading ${activeMeta.isDanger ? "text-red-400" : ""}`}>
                      {activeMeta.title}
                    </h1>
                    <p className="kx-panel-desc">{activeMeta.desc}</p>
                  </div>

                  <div className="kx-panel-header-art hidden md:flex" aria-hidden="true">
                    <ActiveIcon size={22} className={activeMeta.isDanger ? "text-red-400" : "text-[#22FF88]"} />
                  </div>
                </div>
              )}

              {/* Active Tab Panel (Unmounts inactive heavy components) */}
              <div key={activeSection} className="ks-tab-transition-in">
                {activeSection === "overview" && (
                  <OverviewTab
                    profile={profile}
                    session={session}
                    addresses={addresses}
                    alerts={alerts}
                    recentlyViewed={recentlyViewed}
                    completeness={completeness}
                    onNavigateTab={navigateToSection}
                    onOpenAvatarModal={() => setAvatarModalOpen(true)}
                  />
                )}

                {activeSection === "profile" && (
                  <PersonalInfoTab
                    formData={formData}
                    errors={errors}
                    onChange={handleFieldChange}
                    session={session}
                    profile={profile}
                    onOpenAvatarModal={() => setAvatarModalOpen(true)}
                    onRemoveAvatar={handleRemoveAvatar}
                    onShowToast={(msg) => setToast(msg)}
                  />
                )}

                {activeSection === "addresses" && (
                  <AddressesTab
                    addresses={addresses}
                    userId={session?.user?.id}
                    onReloadAddresses={loadData}
                    onShowToast={(msg) => setToast(msg)}
                  />
                )}

                {activeSection === "alerts" && (
                  <PriceAlertsTab
                    alerts={alerts}
                    onReloadAlerts={loadData}
                    onShowToast={(msg) => setToast(msg)}
                  />
                )}

                {activeSection === "recent" && (
                  <RecentlyViewedTab
                    items={recentlyViewed}
                    userId={session?.user?.id}
                    onReloadHistory={loadData}
                    onShowToast={(msg) => setToast(msg)}
                  />
                )}

                {activeSection === "security" && (
                  <SecurityTab
                    session={session}
                    onShowToast={(msg) => setToast(msg)}
                  />
                )}

                {activeSection === "notifications" && (
                  <NotificationsTab
                    preferences={formData.preferences}
                    marketingOptIn={formData.marketing_opt_in}
                    userId={session?.user?.id}
                    onChangePreference={handleFieldChange}
                    onShowToast={(msg) => setToast(msg)}
                  />
                )}

                {activeSection === "appearance" && (
                  <AppearanceTab
                    preferences={formData.preferences}
                    userId={session?.user?.id}
                    onChangePreference={handleFieldChange}
                    onShowToast={(msg) => setToast(msg)}
                  />
                )}

                {activeSection === "help" && <HelpLegalTab />}

                {activeSection === "danger" && (
                  <DangerZoneTab
                    session={session}
                    onShowToast={(msg) => setToast(msg)}
                    onModalStateChange={setIsDeleteModalOpen}
                  />
                )}
              </div>
            </main>
          </div>
        </>
      )}

      {/* Dynamic Products Showcase Strip (Dual-row seamless loop) */}
      <ProfileProductStrip />

      {/* Pricing Section (Moved from Deals / Home Page) */}
      <Pricing currentPlan={profile?.preferences?.plan || profile?.plan} />

      {/* Newsletter Section with 48px bottom spacing */}
      <div className="ks-profile-newsletter-wrap relative z-10 pb-12">
        <Newsletter />
      </div>

      {/* Global Footer (omitted on pages listed in PAGES_WITHOUT_FOOTER) */}
      {shouldRenderFooter && <Footer />}

      {/* Floating Save Bar when dirty */}
      <SaveBar
        isVisible={isDirty}
        isSaving={isSaving}
        onSave={handleSaveChanges}
        onDiscard={handleDiscard}
      />

      {/* Unsaved Changes Confirmation Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        isSaving={isSaving}
        onSaveAndLeave={handleModalSaveAndLeave}
        onDiscardAndLeave={handleModalDiscardAndLeave}
        onStay={handleModalStay}
      />

      {/* Avatar Upload Modal */}
      <AvatarModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        userId={session?.user?.id}
        currentAvatarUrl={profile?.avatar_url}
        onAvatarUpdated={(newUrl) => {
          setProfile((prev) => (prev ? { ...prev, avatar_url: newUrl } : prev));
          setToast("Avatar updated successfully!");
        }}
      />

      {/* Floating Status Toast */}
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}

// Mount to DOM
const rootEl = document.getElementById("profile-root");
if (rootEl) {
  createRoot(rootEl).render(<ProfileApp />);
}

export default ProfileApp;
