import { useState, useEffect } from "react";
import { Moon, Sun, Monitor, Palette, Check } from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
  getThemePreference,
  setThemePreference,
  getAccentPreference,
  setAccentPreference
} from "../../lib/theme.js";

const THEMES = [
  { id: "dark", label: "Dark Theme", desc: "Default sleek contrast with deep blacks", icon: Moon },
  { id: "light", label: "Light Theme", desc: "Clean bright look for daylight browsing", icon: Sun },
  { id: "auto", label: "System Auto", desc: "Synchronize with your OS display mode", icon: Monitor }
];

const ACCENTS = [
  { id: "green", name: "Neon Green", color: "#22FF88", border: "rgba(34, 255, 136, 0.4)" },
  { id: "blue", name: "Sky Cyan", color: "#38BDF8", border: "rgba(56, 189, 248, 0.4)" },
  { id: "yellow", name: "Electric Yellow", color: "#FFD60A", border: "rgba(255, 214, 10, 0.4)" }
];

export default function AppearanceTab({
  preferences = {},
  userId,
  onChangePreference,
  onShowToast
}) {
  const [currentTheme, setCurrentTheme] = useState(getThemePreference());
  const [currentAccent, setCurrentAccent] = useState(getAccentPreference());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCurrentTheme(getThemePreference());
    setCurrentAccent(getAccentPreference());
  }, []);

  const handleSelectTheme = async (themeId) => {
    setCurrentTheme(themeId);
    setThemePreference(themeId);

    const newPreferences = {
      ...preferences,
      theme: themeId
    };
    onChangePreference("preferences", newPreferences);

    if (userId) {
      setSaving(true);
      try {
        await supabase
          .from("profiles")
          .update({ preferences: newPreferences })
          .eq("id", userId);
        onShowToast(`Theme set to ${themeId}`);
      } catch (err) {
        console.error("[Theme update error]", err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSelectAccent = async (accentId) => {
    setCurrentAccent(accentId);
    setAccentPreference(accentId);

    const newPreferences = {
      ...preferences,
      accent: accentId
    };
    onChangePreference("preferences", newPreferences);

    if (userId) {
      setSaving(true);
      try {
        await supabase
          .from("profiles")
          .update({ preferences: newPreferences })
          .eq("id", userId);
        onShowToast(`Accent color updated!`);
      } catch (err) {
        console.error("[Accent update error]", err);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="ks-tab-panel" role="tabpanel" aria-label="Appearance & Display Preferences">
      {/* Theme Mode Card */}
      <div className="ks-card">
        <div className="ks-card-header">
          <h2 className="ks-card-title">
            <Palette size={20} color="#38BDF8" />
            <span>Theme Preferences</span>
          </h2>
          <p className="ks-card-desc">
            Customize your visual experience across KSAM Deal's account hub, legal, and auth pages.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {THEMES.map((t) => {
            const Icon = t.icon;
            const isSelected = currentTheme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTheme(t.id)}
                className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "border-[#22FF88] bg-[#22FF88]/10 shadow-[0_0_20px_rgba(34,255,136,.12)]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <div className="flex w-full items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${isSelected ? "bg-[#22FF88] text-black" : "bg-white/5 text-gray-400"}`}>
                    <Icon size={18} />
                  </div>
                  {isSelected && <Check size={16} className="text-[#22FF88]" />}
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{t.label}</h4>
                <p className="text-xs text-gray-400">{t.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Accent Color Picker */}
        <div>
          <h3 className="text-sm font-bold text-white mb-2">Brand Accent Color</h3>
          <p className="text-xs text-gray-400 mb-4">
            Select the primary highlight color for buttons, active indicators, and focus rings.
          </p>

          <div className="flex flex-wrap gap-4">
            {ACCENTS.map((accent) => {
              const isSelected = currentAccent === accent.id;
              return (
                <button
                  key={accent.id}
                  type="button"
                  onClick={() => handleSelectAccent(accent.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                    isSelected
                      ? "border-white/40 bg-white/10 shadow-lg"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <span
                    className="h-5 w-5 rounded-full flex items-center justify-center border border-white/20"
                    style={{ backgroundColor: accent.color }}
                  >
                    {isSelected && <Check size={12} className="text-black font-black" />}
                  </span>
                  <span className="text-xs font-bold text-white">{accent.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] text-gray-400">
          <strong className="text-white">Note:</strong> Light theme is currently available for Account Hub, Authentication, Contact, and Legal pages. Catalog deals discovery pages maintain the signature dark theme.
        </div>
      </div>
    </div>
  );
}
