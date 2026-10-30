import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env?.VITE_SUPABASE_URL
  ? String(import.meta.env.VITE_SUPABASE_URL).trim()
  : "";
const rawKey = import.meta.env?.VITE_SUPABASE_ANON_KEY
  ? String(import.meta.env.VITE_SUPABASE_ANON_KEY).trim()
  : "";

// Remove trailing slash if present
export const SUPABASE_URL = rawUrl.replace(/\/+$/, "");
export const SUPABASE_ANON_KEY = rawKey;

// Validation helper
const isPlaceholder = (val) =>
  !val ||
  val.includes("your-project") ||
  val.includes("YOUR_SUPABASE") ||
  val.includes("placeholder") ||
  val.includes("your-anon-key");

export const isSupabaseConfigured =
  Boolean(SUPABASE_URL) &&
  Boolean(SUPABASE_ANON_KEY) &&
  !isPlaceholder(SUPABASE_URL) &&
  !isPlaceholder(SUPABASE_ANON_KEY);

if (!isSupabaseConfigured) {
  const missingMsg =
    "[Supabase] Supabase URL or anon key is missing or still contains placeholder values. Check .env in the project root and restart the dev server (npm run dev).";
  console.error(missingMsg);

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      const banner = document.getElementById("authStatusMessage");
      if (banner) {
        banner.textContent =
          "Supabase configuration missing in .env. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and restart your Vite server.";
        banner.style.display = "block";
        banner.style.background = "rgba(239, 68, 68, 0.2)";
        banner.style.color = "#ef4444";
        banner.style.border = "1px solid rgba(239, 68, 68, 0.4)";
      }
    });
  }
}

// Single, shared Supabase client instance
export const supabase = createClient(
  SUPABASE_URL || "https://kavvzolevucqleoewlnf.supabase.co",
  SUPABASE_ANON_KEY || "placeholder"
);

/**
 * Dev-only connection diagnostic test.
 * Pings /auth/v1/health using the configured anon key.
 */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured) {
    console.warn(
      "[Supabase Connection Test] Skipped: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing or invalid in .env."
    );
    return false;
  }

  try {
    const healthUrl = `${SUPABASE_URL}/auth/v1/health`;
    const response = await fetch(healthUrl, {
      method: "GET",
      headers: {
        apikey: SUPABASE_ANON_KEY
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(
        "%c[Supabase Connection Test] Connected successfully to auth server!",
        "color: #22ff88; font-weight: bold;",
        {
          projectUrl: SUPABASE_URL,
          version: data.version,
          name: data.name
        }
      );
      return true;
    } else {
      const errText = await response.text();
      console.error(
        "%c[Supabase Connection Test] Server responded with error status:",
        "color: #ef4444; font-weight: bold;",
        response.status,
        errText
      );
      return false;
    }
  } catch (netErr) {
    console.error(
      "%c[Supabase Connection Test] Network unreachable:",
      "color: #ef4444; font-weight: bold;",
      netErr
    );
    return false;
  }
}

// Auto-run connection test once strictly in Vite dev mode
if (typeof window !== "undefined" && Boolean(import.meta.env?.DEV)) {
  testSupabaseConnection();
}