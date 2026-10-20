import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { User, MapPin, Sliders, Shield, ShieldAlert, Sparkles } from "lucide-react";

import { supabase } from "../lib/supabase";
import { getSession, requireAuth, onAuthChange, BASE_URL } from "../auth/auth.js";
import { useCart } from "../deals/store/cartStore.js";

import Navbar from "../deals/components/Navbar.jsx";
import Newsletter from "../deals/components/Newsletter.jsx";
import Footer from "../deals/components/Footer.jsx";
import Toast from "../deals/components/Toast.jsx";

import HeaderBanner from "./components/HeaderBanner.jsx";
import PersonalInfoTab from "./components/PersonalInfoTab.jsx";
import AddressesTab from "./components/AddressesTab.jsx";
import PreferencesTab from "./components/PreferencesTab.jsx";
import SecurityTab from "./components/SecurityTab.jsx";
import PrivacyTab from "./components/PrivacyTab.jsx";
import SaveBar from "./components/SaveBar.jsx";
import AvatarModal from "./components/AvatarModal.jsx";

import "../deals/tailwind-generated.css";
import "../deals/deals.css";
import "./profile.css";

const TABS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "preferences", label: "Preferences", icon: Sliders },
  { id: "security", label: "Security", icon: Shield },
  { id: "privacy", label: "Privacy", icon: ShieldAlert }
];

export function ProfileApp() {
  const { count: cartCount } = useCart();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [activeTab, setActiveTab] = useState("personal");

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

  // Tab animated underline indicator
  const tabsListRef = useRef(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  // Update underline position when activeTab changes
  useEffect(() => {
    if (!tabsListRef.current) return;
    const activeEl = tabsListRef.current.querySelector(`.ks-tab-btn[data-tab="${activeTab}"]`);
    if (activeEl) {
      setUnderlineStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth
      });
    }
  }, [activeTab, loading]);

  // Load session and profile data
  const loadData = useCallback(async () => {
    try {
      const currentSession = await getSession();
      if (!currentSession?.user?.id) {
        // Enforce sign-in gate
        requireAuth({ returnTo: `${BASE_URL}profile.html` });
        return;
      }

      setSession(currentSession);
      const userId = currentSession.user.id;

      // 1. Fetch Profile
      let { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      // If profile row doesn't exist yet, insert a basic record
      if (!profileData && !profileErr) {
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

      // Form data sync
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
    } catch (err) {
      console.error("[Profile load error]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to auth state changes
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

  // Handle form changes
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    // Clear inline error if field was fixed
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Discard changes
  const handleDiscard = () => {
    if (initialData) {
      setFormData(JSON.parse(JSON.stringify(initialData)));
      setErrors({});
    }
  };

  // Save changes to Supabase
  const handleSaveChanges = async () => {
    if (!session?.user?.id) return;

    // Validate phone if entered
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

      const { data, error } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", session.user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setInitialData(JSON.parse(JSON.stringify(formData)));
      setToast("Profile changes saved successfully!");

      // Update avatar or navbar if name changed
      window.dispatchEvent(
        new CustomEvent("ksam:avatar-updated", { detail: { profile: data } })
      );
    } catch (err) {
      console.error("[Profile save error]", err);
      setToast(err.message || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="ks-profile-page">
      {/* Navbar with brand avatar button */}
      <Navbar />

      {/* Main Profile View */}
      {loading ? (
        <main className="ks-profile-body" style={{ maxWidth: 1200, width: "100%", margin: "0 auto", padding: "60px 24px" }}>
          <div className="ks-skel" style={{ height: 180, marginBottom: 24 }} />
          <div className="ks-skel" style={{ height: 48, width: 340, marginBottom: 24 }} />
          <div className="ks-skel" style={{ height: 320 }} />
        </main>
      ) : (
        <>
          {/* Header Banner */}
          <HeaderBanner
            profile={profile}
            session={session}
            addressesCount={addresses.length}
            cartCount={cartCount}
            completeness={completeness}
            onOpenAvatarModal={() => setAvatarModalOpen(true)}
          />

          {/* Body Section with Tabs */}
          <main className="ks-profile-body">
            {/* Tabs Header */}
            <div className="ks-tabs-wrapper">
              <nav className="ks-tabs-list" ref={tabsListRef} role="tablist" aria-label="Profile Sections">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      type="button"
                      key={tab.id}
                      data-tab={tab.id}
                      className={`ks-tab-btn${isActive ? " is-active" : ""}`}
                      onClick={() => setActiveTab(tab.id)}
                      role="tab"
                      aria-selected={isActive}
                      tabIndex={isActive ? 0 : -1}
                    >
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
              {/* Sliding underline */}
              <div
                className="ks-tab-underline"
                style={{
                  left: underlineStyle.left,
                  width: underlineStyle.width
                }}
                aria-hidden="true"
              />
            </div>

            {/* Active Tab Panel */}
            <div className="ks-tab-container">
              {activeTab === "personal" && (
                <PersonalInfoTab
                  formData={formData}
                  errors={errors}
                  onChange={handleFieldChange}
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

              {activeTab === "preferences" && (
                <PreferencesTab
                  preferences={formData.preferences}
                  onChange={handleFieldChange}
                />
              )}

              {activeTab === "security" && (
                <SecurityTab onShowToast={(msg) => setToast(msg)} />
              )}

              {activeTab === "privacy" && (
                <PrivacyTab
                  profile={profile}
                  userId={session?.user?.id}
                  onShowToast={(msg) => setToast(msg)}
                  onReloadProfile={loadData}
                />
              )}
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

      {/* Deals Page Newsletter & Footer Components */}
      <Newsletter />
      <Footer />

      {/* Toast Notification */}
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
