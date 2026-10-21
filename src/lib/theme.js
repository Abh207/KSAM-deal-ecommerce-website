/**
 * KSAM Deal - Theme & Accent Preference Manager
 * Supports: Dark (default), Light, Auto (system preference)
 * Accents: Green (#22FF88), Blue (#38BDF8), Yellow (#FFD60A)
 */

export const ACCENT_COLORS = {
  green: {
    name: "Emerald Green",
    value: "#22FF88",
    rgb: "34, 255, 136",
    glow: "rgba(34, 255, 136, 0.25)"
  },
  blue: {
    name: "Sky Blue",
    value: "#38BDF8",
    rgb: "56, 189, 248",
    glow: "rgba(56, 189, 248, 0.25)"
  },
  yellow: {
    name: "Solar Gold",
    value: "#FFD60A",
    rgb: "255, 214, 10",
    glow: "rgba(255, 214, 10, 0.25)"
  }
};

const THEME_STORAGE_KEY = "ksam_theme_pref";
const ACCENT_STORAGE_KEY = "ksam_accent_pref";

export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || "dark";
  } catch {
    return "dark";
  }
}

export function getStoredAccent() {
  try {
    return localStorage.getItem(ACCENT_STORAGE_KEY) || "green";
  } catch {
    return "green";
  }
}

export const getThemePreference = getStoredTheme;
export const setThemePreference = (t) => applyTheme(t, getStoredAccent());
export const getAccentPreference = getStoredAccent;
export const setAccentPreference = (a) => applyTheme(getStoredTheme(), a);

export function resolveEffectiveTheme(themeSetting) {
  if (themeSetting === "auto") {
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  }
  return themeSetting === "light" ? "light" : "dark";
}

export function applyTheme(themeSetting = "dark", accentSetting = "green") {
  if (typeof document === "undefined") return;

  const effectiveTheme = resolveEffectiveTheme(themeSetting);
  const doc = document.documentElement;

  doc.setAttribute("data-theme", effectiveTheme);
  doc.setAttribute("data-accent", accentSetting);
  if (document.body) {
    document.body.setAttribute("data-theme", effectiveTheme);
    document.body.setAttribute("data-accent", accentSetting);
  }

  const accentObj = ACCENT_COLORS[accentSetting] || ACCENT_COLORS.green;
  doc.style.setProperty("--ks-brand-accent", accentObj.value);
  doc.style.setProperty("--ks-brand-accent-rgb", accentObj.rgb);
  doc.style.setProperty("--ks-brand-accent-glow", accentObj.glow);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("ksam-theme-changed", {
        detail: { theme: effectiveTheme, rawTheme: themeSetting, accent: accentSetting }
      })
    );
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeSetting);
    localStorage.setItem(ACCENT_STORAGE_KEY, accentSetting);
  } catch {}
}

// Initialize theme immediately on script load to prevent flash
if (typeof window !== "undefined") {
  const currentTheme = getStoredTheme();
  const currentAccent = getStoredAccent();
  applyTheme(currentTheme, currentAccent);

  // Listen to OS theme changes if set to auto
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
      if (getStoredTheme() === "auto") {
        applyTheme("auto", getStoredAccent());
      }
    });
  }
}
