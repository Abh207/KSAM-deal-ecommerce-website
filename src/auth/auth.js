/**
 * KSAM DEAL - SHARED PHONE OTP AUTH MODULE
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

let cachedProfile = null;
let profilePromise = null;
let hasWarnedProfileError = false;

export function clearProfileCache() {
  cachedProfile = null;
  profilePromise = null;
  hasWarnedProfileError = false;
}

// =============================================================================
// PHONE VALIDATION & FORMATTING (E.164)
// =============================================================================

/**
 * Normalizes input to E.164 format.
 * Default country code is +91 (India).
 * Examples:
 *   "9876543210"    -> "+919876543210"
 *   "09876543210"   -> "+919876543210"
 *   "+91 98765 43210" -> "+919876543210"
 *   "+1 (555) 012-3456" -> "+15550123456"
 */
export function formatToE164(rawPhone, defaultCountryCode = "+91") {
  if (!rawPhone || typeof rawPhone !== "string") return "";

  // Trim whitespace
  let clean = rawPhone.trim();

  // If already starts with '+', remove spaces, dashes, parentheses
  if (clean.startsWith("+")) {
    const digitsOnly = clean.slice(1).replace(/\D/g, "");
    return digitsOnly ? `+${digitsOnly}` : "";
  }

  // Remove any non-digits
  const digits = clean.replace(/\D/g, "");

  // If starts with leading 0 (common in India trunk calls, e.g. 09876543210)
  if (digits.startsWith("0") && digits.length === 11) {
    const normalizedPrefix = defaultCountryCode.startsWith("+") ? defaultCountryCode : `+${defaultCountryCode}`;
    return `${normalizedPrefix}${digits.slice(1)}`;
  }

  // If 10 digits (standard Indian mobile)
  if (digits.length === 10) {
    const normalizedPrefix = defaultCountryCode.startsWith("+") ? defaultCountryCode : `+${defaultCountryCode}`;
    return `${normalizedPrefix}${digits}`;
  }

  // If 12 digits starting with 91
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  // Default fallback
  const prefix = defaultCountryCode.startsWith("+") ? defaultCountryCode : `+${defaultCountryCode}`;
  return `${prefix}${digits}`;
}

/**
 * Validates whether a phone number adheres to E.164 format.
 * Specifically checks for valid 10-15 digit global E.164 and Indian mobile numbers (starts with 6-9).
 */
export function validatePhone(phone, countryCode = "+91") {
  const formatted = formatToE164(phone, countryCode);

  if (!formatted) {
    return { valid: false, error: "Please enter your mobile number." };
  }

  // Global E.164 standard regex: + followed by 8 to 15 digits
  const e164Regex = /^\+[1-9]\d{7,14}$/;
  if (!e164Regex.test(formatted)) {
    return { valid: false, error: "Invalid mobile number format. Please check your country code and digits." };
  }

  // Extra check for India (+91)
  if (formatted.startsWith("+91")) {
    const indianDigits = formatted.slice(3);
    if (!/^[6-9]\d{9}$/.test(indianDigits)) {
      return {
        valid: false,
        error: "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
      };
    }
  }

  return { valid: true, formatted };
}

/**
 * Checks if a user has verified their phone number (phone_confirmed_at).
 */
export function isPhoneVerified(user) {
  if (!user) return false;
  return Boolean(user.phone_confirmed_at || user.confirmed_at);
}

// =============================================================================
// FRIENDLY AUTH ERROR PARSER
// =============================================================================

export function formatAuthError(error) {
  if (!error) return "An unexpected error occurred. Please try again.";

  const message = error.message || String(error);
  const lowerMsg = message.toLowerCase();

  // Network & Connectivity
  if (
    lowerMsg.includes("failed to fetch") ||
    lowerMsg.includes("network") ||
    lowerMsg.includes("fetch failed") ||
    error.status === 0 ||
    error.name === "AuthRetryableFetchError"
  ) {
    return "Unable to connect to the authentication server. Please check your internet connection or verify that your Supabase project is active.";
  }

  // Wrong / Expired OTP
  if (
    lowerMsg.includes("token is invalid") ||
    lowerMsg.includes("token has expired") ||
    lowerMsg.includes("invalid token") ||
    lowerMsg.includes("otp expired") ||
    lowerMsg.includes("invalid otp")
  ) {
    return "The OTP code entered is incorrect or has expired. Please check the code or tap 'Resend OTP'.";
  }

  // User already exists
  if (
    lowerMsg.includes("already registered") ||
    lowerMsg.includes("user already exists") ||
    lowerMsg.includes("phone number already exists")
  ) {
    return "An account with this mobile number already exists. Please sign in.";
  }

  // Unconfirmed / Unverified phone
  if (
    lowerMsg.includes("phone not confirmed") ||
    lowerMsg.includes("unconfirmed") ||
    lowerMsg.includes("phone is not confirmed")
  ) {
    return "Your mobile number is not verified yet. We have sent a verification code to complete verification.";
  }

  // Invalid credentials
  if (
    lowerMsg.includes("invalid login credentials") ||
    lowerMsg.includes("invalid_grant") ||
    lowerMsg.includes("wrong password")
  ) {
    return "Wrong mobile number or password. Please verify your credentials or sign in with OTP.";
  }

  // Rate Limiting
  if (
    lowerMsg.includes("rate limit") ||
    lowerMsg.includes("too many requests") ||
    lowerMsg.includes("sms rate limit") ||
    error.status === 429
  ) {
    return "Too many OTP attempts. Please wait 60 seconds before trying again.";
  }

  // Password requirements
  if (lowerMsg.includes("weak password") || lowerMsg.includes("password should be")) {
    return "Password is too weak. Please choose a password with at least 6 characters.";
  }

  return message;
}

// =============================================================================
// REUSABLE PHONE AUTH SERVICES
// =============================================================================

/**
 * Sign up with mobile number and password
 */
export async function signUpWithPhone({ phone, password, fullName, countryCode = "+91" }) {
  const validation = validatePhone(phone, countryCode);
  if (!validation.valid) {
    return { data: null, error: { message: validation.error } };
  }

  const formattedPhone = validation.formatted;

  const { data, error } = await supabase.auth.signUp({
    phone: formattedPhone,
    password,
    options: {
      data: {
        full_name: fullName || "",
        name: fullName || ""
      }
    }
  });

  return { data, error, formattedPhone };
}

/**
 * Verify 6-digit SMS OTP token
 */
export async function verifyPhoneOtp({ phone, token, type = "sms", countryCode = "+91" }) {
  const validation = validatePhone(phone, countryCode);
  const formattedPhone = validation.formatted || phone;

  const cleanToken = String(token || "").trim();
  if (cleanToken.length !== 6) {
    return { data: null, error: { message: "Please enter the complete 6-digit OTP code." } };
  }

  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token: cleanToken,
    type
  });

  if (!error && data?.session) {
    cachedSession = data.session;
    clearProfileCache();
  }

  return { data, error };
}

/**
 * Resend SMS OTP
 */
export async function resendPhoneOtp({ phone, type = "sms", countryCode = "+91" }) {
  const validation = validatePhone(phone, countryCode);
  const formattedPhone = validation.formatted || phone;

  const { data, error } = await supabase.auth.resend({
    type,
    phone: formattedPhone
  });

  return { data, error };
}

/**
 * Sign in with mobile number and password
 */
export async function signInWithPhonePassword({ phone, password, countryCode = "+91" }) {
  const validation = validatePhone(phone, countryCode);
  if (!validation.valid) {
    return { data: null, error: { message: validation.error } };
  }

  const formattedPhone = validation.formatted;

  const { data, error } = await supabase.auth.signInWithPassword({
    phone: formattedPhone,
    password
  });

  if (!error && data?.session) {
    cachedSession = data.session;
    clearProfileCache();
  }

  return { data, error, formattedPhone };
}

/**
 * Passwordless Sign In with Phone OTP
 */
export async function signInWithPhoneOtp({ phone, countryCode = "+91" }) {
  const validation = validatePhone(phone, countryCode);
  if (!validation.valid) {
    return { data: null, error: { message: validation.error } };
  }

  const formattedPhone = validation.formatted;

  const { data, error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone
  });

  return { data, error, formattedPhone };
}

/**
 * Reset password using phone OTP
 */
export async function resetPasswordWithPhoneOtp({ phone, token, newPassword, countryCode = "+91" }) {
  const validation = validatePhone(phone, countryCode);
  const formattedPhone = validation.formatted || phone;

  // 1. Verify OTP
  const { data: verifyData, error: verifyErr } = await verifyPhoneOtp({
    phone: formattedPhone,
    token,
    type: "sms"
  });

  if (verifyErr) {
    return { data: null, error: verifyErr };
  }

  // 2. Set new password
  const { data: updateData, error: updateErr } = await supabase.auth.updateUser({
    password: newPassword
  });

  return { data: updateData, error: updateErr };
}

// =============================================================================
// SESSION & AUTH STATE LISTENER
// =============================================================================

supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user?.id !== cachedSession?.user?.id || event === "SIGNED_OUT") {
    clearProfileCache();
  }
  cachedSession = session;

  // On protected pages (e.g. profile.html), handle session expiry
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    const isProtected = path.endsWith("profile.html");
    if (isProtected) {
      if (event === "TOKEN_REFRESH_FAILED" || event === "SIGNED_OUT") {
        redirectToSessionExpired(window.location.href);
      }
    }
  }
});

export function redirectToSessionExpired(returnTo = null) {
  const next = validateReturnTo(returnTo || window.location.href) || `${BASE_URL}profile.html`;
  window.location.href = `${BASE_URL}session-expired.html?next=${encodeURIComponent(next)}`;
}

export function redirectToAccessDenied(returnTo = null) {
  const next = validateReturnTo(returnTo || window.location.href) || `${BASE_URL}index.html`;
  window.location.href = `${BASE_URL}access-denied.html?next=${encodeURIComponent(next)}`;
}

/**
 * Validate returnTo / next parameter.
 * Strictly enforces same-origin and inside base path only (no open redirect).
 */
export function validateReturnTo(targetUrl) {
  if (!targetUrl || typeof targetUrl !== "string") return null;

  try {
    const origin = window.location.origin;
    const normalizedBase = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
    const baseHref = new URL(normalizedBase, origin).href;
    const resolved = new URL(targetUrl, baseHref);

    // Same-origin check
    if (resolved.origin !== origin) {
      return null;
    }

    // Must be inside base path
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
export async function getProfile(forceRefresh = false) {
  try {
    const session = cachedSession || (await getSession());
    if (!session?.user?.id) {
      cachedProfile = null;
      return null;
    }

    const user = session.user;
    const buildFallback = () => ({
      id: user.id,
      phone: user.phone || "",
      email: user.email || "",
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
      avatar_url: user.user_metadata?.avatar_url || null,
      created_at: user.created_at || null,
      is_fallback: true
    });

    if (!forceRefresh && cachedProfile && cachedProfile.id === user.id) {
      return cachedProfile;
    }

    if (profilePromise) {
      return profilePromise;
    }

    profilePromise = (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          if (!hasWarnedProfileError) {
            hasWarnedProfileError = true;
            console.warn("[Auth] Profiles table not available or request failed, using fallback profile:", error.message || error);
          }
          cachedProfile = buildFallback();
          return cachedProfile;
        }

        cachedProfile = data || buildFallback();
        return cachedProfile;
      } catch (err) {
        if (!hasWarnedProfileError) {
          hasWarnedProfileError = true;
          console.warn("[Auth] getProfile error, using fallback profile:", err?.message || err);
        }
        cachedProfile = buildFallback();
        return cachedProfile;
      } finally {
        profilePromise = null;
      }
    })();

    return profilePromise;
  } catch (err) {
    return null;
  }
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
 * Strictly protects routes:
 * Requires user to have an active session AND a confirmed phone (phone_confirmed_at is not null).
 */
export function requireAuth(pendingAction = null) {
  const session = cachedSession || getStoredSessionSync();
  const user = session?.user;

  // Protect routes: verified phone required!
  if (session && user && isPhoneVerified(user)) {
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

  // If session exists but unconfirmed phone, add query param so login can switch directly to OTP
  const phoneParam = user?.phone ? `&unverified=1&phone=${encodeURIComponent(user.phone)}` : "";
  const loginUrl = `${BASE_URL}login.html?next=${encodeURIComponent(validatedNext)}${phoneParam}`;
  window.location.href = loginUrl;
  return false;
}

/**
 * Signs out the current user
 */
export async function signOut() {
  cachedSession = null;
  clearProfileCache();
  clearPendingAction();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.warn("[Auth] signOut error:", error.message);
    return false;
  }
  return true;
}

/**
 * Lightweight toast for plain JS pages
 */
export function showAuthToast(message, type = "success", duration = 3500) {
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

  const isError = type === "error";
  toast.style.borderColor = isError ? "rgba(239, 68, 68, 0.6)" : "rgba(34, 255, 136, 0.45)";
  toast.style.boxShadow = isError
    ? "0 12px 36px rgba(0,0,0,0.45), 0 0 20px rgba(239, 68, 68, 0.25)"
    : "0 12px 36px rgba(0,0,0,0.45), 0 0 20px rgba(34, 255, 136, 0.2)";

  const icon = isError ? `<span style="color:#ef4444;font-size:16px;">✕</span>` : `<span style="color:#22FF88;font-size:16px;">✓</span>`;
  toast.innerHTML = `${icon} <span>${message}</span>`;
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

  if (pending && session && isPhoneVerified(session.user) && !isDealsPage) {
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

      const session = cachedSession || getStoredSessionSync();
      const hasVerifiedSession = Boolean(session && isPhoneVerified(session.user));

      if (!hasVerifiedSession) {
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
