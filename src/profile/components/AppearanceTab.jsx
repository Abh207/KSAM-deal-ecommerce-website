import { useState, useEffect, useRef } from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import gsap from "gsap";
import { supabase } from "../../lib/supabase";
import {
  getThemePreference,
  setThemePreference,
  getAccentPreference,
  setAccentPreference
} from "../../lib/theme.js";
import { respectReducedMotion } from "../../lib/motion.js";

const THEMES = [
  {
    id: "dark",
    label: "Dark Theme",
    desc: "Default sleek contrast with deep blacks",
    icon: Moon,
    previewClass: "kx-mini-preview--dark"
  },
  {
    id: "light",
    label: "Light Theme",
    desc: "Clean bright look for daylight browsing",
    icon: Sun,
    previewClass: "kx-mini-preview--light"
  },
  {
    id: "auto",
    label: "System Auto",
    desc: "Synchronize with your OS display mode",
    icon: Monitor,
    previewClass: "kx-mini-preview--auto"
  }
];

const ACCENTS = [
  { id: "green", name: "Neon Green", color: "#22FF88" },
  { id: "blue", name: "Sky Cyan", color: "#38BDF8" },
  { id: "yellow", name: "Electric Yellow", color: "#FFD60A" }
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
  const panelRef = useRef(null);

  useEffect(() => {
    setCurrentTheme(getThemePreference());
    setCurrentAccent(getAccentPreference());
  }, []);

  useEffect(() => {
    if (respectReducedMotion() || !panelRef.current) return;

    const ctx = gsap.context(() => {
      const themeCards = panelRef.current.querySelectorAll(".kx-theme-card");
      const accentBlock = panelRef.current.querySelector(".kx-accent-section");
      const tl = gsap.timeline();

      if (themeCards.length > 0) {
        tl.fromTo(
          themeCards,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.32, stagger: 0.06, ease: "power2.out" }
        );
      }
      if (accentBlock) {
        tl.fromTo(
          accentBlock,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
          "-=0.15"
        );
      }
    }, panelRef);

    return () => ctx.revert();
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

  // Keyboard arrow navigation for role="radiogroup"
  const handleThemeKeyDown = (e, index) => {
    let nextIndex = null;
    const total = THEMES.length;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % total;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + total) % total;
    }

    if (nextIndex !== null) {
      const nextTheme = THEMES[nextIndex];
      handleSelectTheme(nextTheme.id);
      const nextBtn = panelRef.current?.querySelector(
        `[data-theme-option="${nextTheme.id}"]`
      );
      if (nextBtn) nextBtn.focus();
    }
  };

  return (
    <div
      ref={panelRef}
      className="ks-tab-panel"
      role="tabpanel"
      aria-label="Appearance & Display Preferences"
    >
      {/* 1. Theme Mode Options (3-col selectable cards with CSS mini preview) */}
      <div
        className="kx-theme-grid"
        role="radiogroup"
        aria-label="Theme Selection"
      >
        {THEMES.map((t, idx) => {
          const Icon = t.icon;
          const isSelected = currentTheme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              data-theme-option={t.id}
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => handleSelectTheme(t.id)}
              onKeyDown={(e) => handleThemeKeyDown(e, idx)}
              className={`kx-theme-card ${isSelected ? "is-selected" : ""}`}
            >
              {/* Top: CSS Mini Layout Preview */}
              <div className={`kx-mini-preview ${t.previewClass}`} aria-hidden="true">
                <div className="kx-mini-side" />
                <div className="kx-mini-body">
                  <div className="kx-mini-line" />
                  <div className="kx-mini-block" />
                </div>
              </div>

              {/* Bottom: Typography and Selection Indicator */}
              <div className="flex items-center justify-between gap-2 w-full mt-auto">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Icon size={14} className={isSelected ? "text-[#22FF88]" : "text-gray-400"} />
                    <h4 className="text-sm font-bold text-white tracking-[-0.01em]">
                      {t.label}
                    </h4>
                  </div>
                  <p className="text-[11.5px] text-[#98A3A0] mt-0.5 line-clamp-1">
                    {t.desc}
                  </p>
                </div>

                {isSelected && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#22FF88] text-black shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Brand Accent Color Section (24px space from theme grid) */}
      <div className="kx-accent-section mt-6">
        <h3 className="text-sm font-bold text-white tracking-[-0.01em] mb-1">
          Brand Accent Color
        </h3>
        <p className="text-[13.5px] text-[#98A3A0] leading-[1.55] mb-3">
          Select the primary highlight color for buttons, active indicators, and focus rings.
        </p>

        <div className="kx-swatch-list">
          {ACCENTS.map((accent) => {
            const isSelected = currentAccent === accent.id;
            return (
              <button
                key={accent.id}
                type="button"
                onClick={() => handleSelectAccent(accent.id)}
                className={`kx-swatch-chip ${isSelected ? "is-selected" : ""}`}
                aria-label={`Select ${accent.name} accent`}
                aria-pressed={isSelected}
              >
                <div
                  className="kx-swatch-circle"
                  style={{ backgroundColor: accent.color }}
                >
                  {isSelected && (
                    <Check size={18} className="text-black font-black" strokeWidth={3} />
                  )}
                </div>
                <span>{accent.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Information Note Block */}
      <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs text-[#98A3A0] leading-[1.55]">
        <strong className="text-white">Note:</strong> Light theme is currently available for Account Hub, Authentication, Contact, and Legal pages. Catalog deals discovery pages maintain the signature dark theme.
      </div>
    </div>
  );
}
