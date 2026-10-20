/**
 * KSAM DEAL - SHARED AUTH MODULE
 * Works from both React pages and vanilla JS pages.
 * No React dependencies.
 */

import { supabase } from "../lib/supabase.js";

export const BASE_URL = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
export const PENDING_ACTION_KEY = "ksam_pending_auth_action";

let cachedSession = null;
let sessionPromise = null;

// Synchronously check localStorage for any Supabase auth token
export function getStoredSessionSync() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("sb-") && key.endsWith("-auth-token"))) {
        const val = localStorage.getItem(key);
        if (val) {
          const parsed = JSON.parse(val);
          if (parsed && (parsed.access_token || parsed.user)) {
            return parsed;
          }
        }
      }
    }
  } catch (err) {
    // ignore json/storage errors
  }
  return null;
}

// Initialise memory cache from storage if present
cachedSession = getStoredSessionSync();

// Listen to Supabase auth events to keep cache updated
supabase.auth.onAuthStateChange((_event, session) => {
  cachedSession = session;
});

/**
 * Validate returnTo / next parameter.
 * Strictly enforces same-origin and inside base path only (no open redirect).
 */
export function validateReturnTo(targetUrl) {
  if (!targetUrl || typeof targetUrl !== "string") return null;

  try {
    const origin = window.location.origin;
    const resolved = new URL(targetUrl, origin);

    // Same-origin check
    if (resolved.origin !== origin) {
      return null;
    }

    // Must be inside base path
    const normalizedBase = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
    const cleanPath = resolved.pathname;

    if (!cleanPath.startsWith(normalizedBase) && cleanPath !== normalizedBase.slice(0, -1)) {
      return null;
    }

    // Do not redirect back to login or signup
    if (cleanPath.endsWith("login.html") || cleanPath.endsWith("signUp.html")) {
      return `${normalizedBase}index.html`;
    }

    return resolved.pathname + resolved.search + resolved.hash;
  } catch (e) {
    return null;
  }
}

/**
 * Returns the current session or null
 */
export async function getSession() {
  if (sessionPromise) {
    return sessionPromise;
  }

  sessionPromise = (async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn("[Auth] getSession error:", error.message);
        cachedSession = null;
        return null;
      }
      cachedSession = data?.session || null;
      return cachedSession;
    } catch (err) {
      console.warn("[Auth] getSession unexpected error:", err);
      return cachedSession;
    } finally {
      sessionPromise = null;
    }
  })();

  return sessionPromise;
}

/**
 * Subscribes to auth state changes
 */
export function onAuthChange(cb) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    cachedSession = session;
    if (typeof cb === "function") {
      cb(event, session);
    }
  });
  return data?.subscription || null;
}

/**
 * Fetches user profile from public.profiles
 */
export async function getProfile() {
  const session = cachedSession || (await getSession());
  if (!session?.user?.id) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) {
    console.warn("[Auth] getProfile error:", error.message);
    return null;
  }

  return data;
}

/**
 * Get stored pending action
 */
export function getPendingAction() {
  try {
    const raw = sessionStorage.getItem(PENDING_ACTION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Clear stored pending action
 */
export function clearPendingAction() {
  try {
    sessionStorage.removeItem(PENDING_ACTION_KEY);
  } catch (e) {}
}

/**
 * requireAuth(pendingAction?)
 * If there is a session, returns true.
 * If not, saves { returnTo, pending: pendingAction } in sessionStorage,
 * navigates to `${BASE_URL}login.html?next=...` and returns false.
 */
export function requireAuth(pendingAction = null) {
  const session = cachedSession || getStoredSessionSync();
  if (session) {
    return true;
  }

  const targetHref = (pendingAction && typeof pendingAction === "object" && pendingAction.returnTo)
    ? pendingAction.returnTo
    : window.location.href;
  const validatedNext = validateReturnTo(targetHref) || `${BASE_URL}index.html`;

  const pendingPayload = {
    returnTo: validatedNext,
    pending: pendingAction || null,
    timestamp: Date.now()
  };

  try {
    sessionStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(pendingPayload));
  } catch (err) {
    console.warn("[Auth] Failed to write pending action to sessionStorage", err);
  }

  const loginUrl = `${BASE_URL}login.html?next=${encodeURIComponent(validatedNext)}`;
  window.location.href = loginUrl;
  return false;
}

/**
 * Signs out the current user
 */
export async function signOut() {
  cachedSession = null;
  clearPendingAction();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn("[Auth] signOut error:", error.message);
    return false;
  }
  return true;
}

/**
 * Lightweight toast for legacy plain JS pages
 */
export function showAuthToast(message, duration = 3500) {
  if (typeof document === "undefined") return;

  let toast = document.getElementById("ksam-auth-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "ksam-auth-toast";
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 22px;
      border-radius: 14px;
      border: 1px solid rgba(34, 255, 136, 0.45);
      box-shadow: 0 12px 36px rgba(0,0,0,0.45), 0 0 20px rgba(34, 255, 136, 0.2);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: opacity 0.3s ease, transform 0.3s ease;
      opacity: 0;
      transform: translateY(12px);
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span style="color:#22FF88;font-size:16px;">✓</span> <span>${message}</span>`;
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(12px)";
  }, duration);
}

/**
 * Selectors for buy-related gated actions on plain JS / legacy pages
 */
const GATED_SELECTOR = [
  '[data-requires-auth="true"]',
  '.add-to-cart-button',
  '.add-cart-btn',
  '.gb-add-cart',
  '.wishlist-btn',
  '#shoppingCheckout',
  '.shopping-checkout',
  '.shop-proceed-to-buy',
  '.process-payment-button',
  '.shoe-btn-cart',
  '.shoe-btn-buy',
  '.shoe-wishlist',
  '.clothes-btn-cart',
  '.clothes-btn-buy',
  '.clothes-wishlist',
  '.audio-btn-cart',
  '.audio-btn-buy',
  '.audio-wishlist',
  '.popup-wishlist-button',
  '.popup-cart-btn',
  '.checkout-process-btn'
].join(", ");

/**
 * Initializes document-level capture-phase listener for legacy plain JS pages.
 */
export function initAuthGate() {
  if (typeof document === "undefined" || window.__ksamAuthGateInitialized) return;
  window.__ksamAuthGateInitialized = true;

  // On legacy pages, check if returning after sign-in with pending action
  const isDealsPage = window.location.pathname.endsWith("index.html") || window.location.pathname === BASE_URL;
  const pending = getPendingAction();
  const session = cachedSession || getStoredSessionSync();

  if (pending && session && !isDealsPage) {
    showAuthToast("Signed in. Tap the button again.");
    clearPendingAction();
  }

  // Document-level capture-phase click listener
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;

      const gatedEl = target.closest(GATED_SELECTOR);
      if (!gatedEl) return;

      // Allow elements explicitly marked as not needing auth
      if (gatedEl.getAttribute("data-requires-auth") === "false") return;

      const hasSession = Boolean(cachedSession || getStoredSessionSync());
      if (!hasSession) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const actionType = gatedEl.getAttribute("data-auth-action") || "buy_action";
        requireAuth({
          type: actionType,
          id: gatedEl.id || null,
          className: gatedEl.className || null,
          text: (gatedEl.textContent || "").trim().slice(0, 50)
        });
      }
    },
    true // CAPTURE PHASE: fires before any other click listener
  );
}

// Automatically initialize auth gate on script import
if (typeof window !== "undefined") {
  initAuthGate();
}
