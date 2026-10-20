import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createRoot } from "react-dom/client";
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
  AlertTriangle
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { getSession, requireAuth, onAuthChange, BASE_URL } from "../auth/auth.js";
import { getPriceAlerts, getRecentlyViewed } from "../deals/services/accountActivityService.js";

import Navbar from "../deals/components/Navbar.jsx";
import Newsletter from "../deals/components/Newsletter.jsx";
import Footer from "../deals/components/Footer.jsx";
import Toast from "../deals/components/Toast.jsx";

import HeaderBanner from "./components/HeaderBanner.jsx";
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

import "../deals/tailwind-generated.css";
import "../deals/deals.css";
import "./profile.css";
import "../styles/kx-tokens.css";
import "../styles/kx-motion.css";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "Edit Profile", icon: User },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "alerts", label: "Price Alerts", icon: Bell },
  { id: "recent", label: "Recently Viewed", icon: Clock },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Sliders },
  { id: "theme", label: "Appearance", icon: Palette },
  { id: "help", label: "Help & Legal", icon: HelpCircle },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle, isDanger: true }
];

export function ProfileApp() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Active tab with URL hash support
  const getInitialTab = () => {
    const hash = window.location.hash.replace("#", "").toLowerCase();
    const valid = TABS.find((t) => t.id === hash);
    return valid ? valid.id : "overview";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

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
  const [toast, setToast] = useState("");

  // Sync tab with URL hash
  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    window.history.replaceState(null, "", `#${tabId}`);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "").toLowerCase();
      const match = TABS.find((t) => t.id === hash);
      if (match) setActiveTab(match.id);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Load session, profile, addresses, alerts, and recently viewed
  const loadData = useCallback(async () => {
    try {
      const currentSession = await getSession();
      if (!currentSession?.user?.id) {
        requireAuth({ returnTo: `${BASE_URL}profile.html` });
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
        requireAuth({ returnTo: `${BASE_URL}profile.html` });
      } else {
        setSession(currentSession);
      }
    });

    return () => {
      if (sub && typeof sub.unsubscribe === "function") sub.unsubscribe();
    };
  }, [loadData]);

  // Dirty state calculation
  const isDirty = useMemo(() => {
    if (!initialData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  // Warn before leaving with unsaved changes
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

  // Profile Completeness (%) Formula
  const completeness = useMemo(() => {
    let score = 0;
    if (formData.full_name?.trim().length >= 2) score += 20;
    if (/^[6-9]\d{9}$/.test(formData.phone?.trim() || "")) score += 20;
    if (profile?.avatar_url) score += 20;
    if (formData.date_of_birth) score += 15;
    if (formData.gender) score += 10;
    if (addresses.length > 0) score += 15;
    return Math.min(100, score);
  }, [formData, profile?.avatar_url, addresses.length]);

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
    if (!session?.user?.id) return;

    const newErrors = {};
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit mobile number.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setToast("Please fix the validation errors before saving.");
      return;
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
    } catch (err) {
      console.error("[Profile save error]", err);
      setToast(err.message || "Failed to save profile changes.");
      // Rollback to initialData on error
      if (initialData) {
        setFormData(JSON.parse(JSON.stringify(initialData)));
      }
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

  return (
    <div className="kx-page ks-profile-page">
      <Navbar />

      {loading ? (
        <main className="ks-profile-body" style={{ maxWidth: 1200, width: "100%", margin: "0 auto", padding: "60px 24px" }}>
          <div className="ks-skel" style={{ height: 180, marginBottom: 24, borderRadius: 24 }} />
          <div className="ks-skel" style={{ height: 48, width: 340, marginBottom: 24, borderRadius: 12 }} />
          <div className="ks-skel" style={{ height: 380, borderRadius: 24 }} />
        </main>
      ) : (
        <>
          {/* Header Banner */}
          <HeaderBanner
            profile={profile}
            session={session}
            addressesCount={addresses.length}
            alertsCount={alerts.length}
            recentCount={recentlyViewed.length}
            completeness={completeness}
            onOpenAvatarModal={() => setAvatarModalOpen(true)}
            onNavigateTab={handleSelectTab}
          />

          {/* Main Layout: Sticky Desktop Sidebar + Responsive Content */}
          <main className="ks-profile-body">
            {/* Mobile Horizontal Pill Tabs Bar (< 1024px) */}
            <div className="ks-mobile-tabs-bar">
              <div className="ks-mobile-pill-list" role="tablist" aria-label="Profile Sections">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => handleSelectTab(tab.id)}
                      className={`ks-mobile-pill-btn${isActive ? " is-active" : ""}`}
                      role="tab"
                      aria-selected={isActive}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="ks-profile-layout">
              {/* Desktop Sticky Left Sidebar (>= 1024px) */}
              <aside className="ks-profile-sidebar" aria-label="Account Hub Navigation">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => handleSelectTab(tab.id)}
                      className={`ks-sidebar-btn${isActive ? " is-active" : ""}${tab.isDanger ? " is-danger" : ""}`}
                    >
                      <Icon size={17} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </aside>

              {/* Active Tab Panel Content */}
              <div className="ks-tab-container flex-1 min-w-0">
                {activeTab === "overview" && (
                  <OverviewTab
                    profile={profile}
                    session={session}
                    addresses={addresses}
                    alerts={alerts}
                    recentlyViewed={recentlyViewed}
                    completeness={completeness}
                    onNavigateTab={handleSelectTab}
                    onOpenAvatarModal={() => setAvatarModalOpen(true)}
                  />
                )}

                {activeTab === "profile" && (
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

                {activeTab === "addresses" && (
                  <AddressesTab
                    addresses={addresses}
                    userId={session?.user?.id}
                    onReloadAddresses={loadData}
                    onShowToast={(msg) => setToast(msg)}
                  />
                )}

                {activeTab === "alerts" && (
                  <PriceAlertsTab
                    alerts={alerts}
                    onReloadAlerts={loadData}
                    onShowToast={(msg) => setToast(msg)}
                  />
                )}

                {activeTab === "recent" && (
                  <RecentlyViewedTab
                    items={recentlyViewed}
                    userId={session?.user?.id}
                    onReloadHistory={loadData}
                    onShowToast={(msg) => setToast(msg)}
                  />
                )}

                {activeTab === "security" && (
                  <SecurityTab
                    session={session}
                    onShowToast={(msg) => setToast(msg)}
                  />
                )}

                {activeTab === "notifications" && (
                  <NotificationsTab
                    preferences={formData.preferences}
                    marketingOptIn={formData.marketing_opt_in}
                    userId={session?.user?.id}
                    onChangePreference={handleFieldChange}
                    onShowToast={(msg) => setToast(msg)}
                  />
                )}

                {activeTab === "theme" && (
                  <AppearanceTab
                    preferences={formData.preferences}
                    userId={session?.user?.id}
                    onChangePreference={handleFieldChange}
                    onShowToast={(msg) => setToast(msg)}
                  />
                )}

                {activeTab === "help" && <HelpLegalTab />}

                {activeTab === "danger" && (
                  <DangerZoneTab
                    session={session}
                    onShowToast={(msg) => setToast(msg)}
                  />
                )}
              </div>
            </div>
          </main>
        </>
      )}

      {/* Floating Save Bar when dirty */}
      <SaveBar
        isVisible={isDirty}
        isSaving={isSaving}
        onSave={handleSaveChanges}
        onDiscard={handleDiscard}
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

      <Newsletter />
      <Footer />
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
