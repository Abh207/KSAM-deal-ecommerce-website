/**
 * KSAM DEAL - SHARED EMAIL OTP AUTH MODULE
 * Clean Email OTP authentication with Supabase JS client.
 * No phone/SMS dependencies, no link-based confirmation tokens.
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
// VALIDATION & VERIFICATION HELPERS
// =============================================================================

export function validateEmail(email) {
  if (!email || typeof email !== "string") return false;
  const clean = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
}

/**
 * Checks if a user has verified their email address (email_confirmed_at).
 */
export function isEmailVerified(user) {
  if (!user) return false;
  return Boolean(user.email_confirmed_at);
}

// =============================================================================
// FRIENDLY AUTH ERROR PARSER
// =============================================================================

export function formatAuthError(error) {
  if (!error) return "An unexpected error occurred. Please try again.";

  // Log raw Supabase error in development only
  if (import.meta.env.DEV) {
    console.error("[Supabase Auth Error]", {
      name: error?.name,
      message: error?.message,
      status: error?.status,
      code: error?.code,
      raw: error
    });
  }

  const message = error.message || String(error);
  const lowerMsg = message.toLowerCase();

  // 1. SMTP Misconfiguration (common HTTP 500 in Supabase when custom SMTP is broken)
  if (
    lowerMsg.includes("error sending confirmation email") ||
    lowerMsg.includes("error sending email") ||
    lowerMsg.includes("error sending recovery email") ||
    lowerMsg.includes("error sending magic link")
  ) {
    return "Error sending confirmation email. Your custom SMTP is misconfigured in Supabase. Please check Project Settings > Authentication > SMTP.";
  }

  // 2. Wrong code
  if (
    lowerMsg.includes("token is invalid") ||
    lowerMsg.includes("invalid token") ||
    lowerMsg.includes("incorrect code") ||
    lowerMsg.includes("token has expired or is invalid") ||
    error.code === "otp_expired"
  ) {
    return "Incorrect code. Please try again.";
  }

  // 3. Expired code
  if (
    lowerMsg.includes("token has expired") ||
    lowerMsg.includes("otp expired") ||
    lowerMsg.includes("code expired")
  ) {
    return "Code expired. Please request a new one.";
  }

  // 4. Rate Limiting
  if (
    lowerMsg.includes("rate limit") ||
    lowerMsg.includes("too many requests") ||
    lowerMsg.includes("over_email_send_rate_limit") ||
    error.status === 429
  ) {
    return "Please wait a minute before requesting another code.";
  }

  // 5. Already registered
  if (
    lowerMsg.includes("already registered") ||
    lowerMsg.includes("user already exists") ||
    lowerMsg.includes("email address already exists")
  ) {
    return "This email is already registered. Please sign in.";
  }

  // 6. Email unconfirmed
  if (
    lowerMsg.includes("email not confirmed") ||
    lowerMsg.includes("unconfirmed") ||
    lowerMsg.includes("email is not confirmed")
  ) {
    return "Email not confirmed. We've sent a verification code to your email.";
  }

  // 7. Invalid credentials
  if (
    lowerMsg.includes("invalid login credentials") ||
    lowerMsg.includes("invalid_grant") ||
    lowerMsg.includes("wrong password") ||
    error.code === "invalid_credentials"
  ) {
    return "Wrong email or password. Please check your credentials.";
  }

  // 8. User not found for OTP login / signups disabled
  if (
    lowerMsg.includes("user not found") ||
    lowerMsg.includes("signups not allowed for otp") ||
    lowerMsg.includes("signups not allowed") ||
    error.code === "otp_disabled"
  ) {
    return "No account found with this email. Please sign up first.";
  }

  // 9. Real Network & Connectivity failures ONLY (status 0, TypeError: Failed to fetch, or pure network drop)
  if (
    lowerMsg.includes("failed to fetch") ||
    lowerMsg.includes("networkerror") ||
    (error.name === "TypeError" && lowerMsg.includes("fetch")) ||
    (error.name === "AuthRetryableFetchError" && (error.status === 0 || !error.status || lowerMsg.includes("failed to fetch")))
  ) {
    return "Unable to connect to the authentication server. Please check your internet connection.";
  }

  // 10. Password requirements
  if (lowerMsg.includes("weak password") || lowerMsg.includes("password should be")) {
    return "Password must be at least 6 characters long.";
  }

  return message;
}

// =============================================================================
// REUSABLE EMAIL OTP AUTH SERVICES
// =============================================================================

/**
 * Sign up with email, password, and full name.
 * Supabase sends a 6-digit verification code to the email address.
 */
export async function signUpWithEmail({ email, password, fullName }) {
  const cleanEmail = (email || "").trim().toLowerCase();

  if (!validateEmail(cleanEmail)) {
    return { data: null, error: { message: "Please enter a valid email address." }, isAlreadyRegistered: false };
  }

  if (!password || password.length < 6) {
    return { data: null, error: { message: "Password must be at least 6 characters long." }, isAlreadyRegistered: false };
  }

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        full_name: fullName || "",
        name: fullName || ""
      }
    }
  });

  // Check if Supabase detected an existing user (often returned as empty identities array without error)
  const isAlreadyRegistered = Boolean(
    (error && (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("already exists"))) ||
    (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0)
  );

  return { data, error, cleanEmail, isAlreadyRegistered };
}

/**
 * Verify 6-digit Email OTP token.
 * Types supported:
 *  - 'signup': for new account registration verification
 *  - 'email': for passwordless email OTP sign-in
 *  - 'recovery': for password reset verification
 */
export async function verifyEmailOtp({ email, token, type = "signup" }) {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanToken = String(token || "").trim();

  if (!cleanEmail) {
    return { data: null, error: { message: "Please enter your email address." } };
  }

  if (cleanToken.length !== 6) {
    return { data: null, error: { message: "Please enter the complete 6-digit verification code." } };
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email: cleanEmail,
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
 * Resend 6-digit signup OTP code.
 */
export async function resendSignupOtp({ email }) {
  const cleanEmail = (email || "").trim().toLowerCase();

  const { data, error } = await supabase.auth.resend({
    type: "signup",
    email: cleanEmail
  });

  return { data, error };
}

/**
 * Sign in with email and password.
 */
export async function signInWithEmailPassword({ email, password }) {
  const cleanEmail = (email || "").trim().toLowerCase();

  if (!validateEmail(cleanEmail)) {
    return { data: null, error: { message: "Please enter a valid email address." } };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password
  });

  if (!error && data?.session) {
    cachedSession = data.session;
    clearProfileCache();
  }

  return { data, error, cleanEmail };
}

/**
 * Passwordless Sign In with Email OTP.
 * shouldCreateUser: false prevents creating an account from the login tab.
 */
export async function signInWithEmailOtp({ email }) {
  const cleanEmail = (email || "").trim().toLowerCase();

  if (!validateEmail(cleanEmail)) {
    return { data: null, error: { message: "Please enter a valid email address." } };
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      shouldCreateUser: false
    }
  });

  return { data, error, cleanEmail };
}

/**
 * Request password recovery OTP code for an email.
 */
export async function sendPasswordResetOtp({ email }) {
  const cleanEmail = (email || "").trim().toLowerCase();

  if (!validateEmail(cleanEmail)) {
    return { data: null, error: { message: "Please enter a valid email address." } };
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
  return { data, error, cleanEmail };
}

/**
 * Update current user's password.
 */
export async function updateUserPassword({ password }) {
  if (!password || password.length < 6) {
    return { data: null, error: { message: "New password must be at least 6 characters long." } };
  }

  const { data, error } = await supabase.auth.updateUser({
    password
  });

  return { data, error };
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
        if (import.meta.env.DEV) console.warn("[Auth] getSession error:", error.message);
        cachedSession = null;
        return null;
      }
      cachedSession = data?.session || null;
      return cachedSession;
    } catch (err) {
      if (import.meta.env.DEV) console.warn("[Auth] getSession unexpected error:", err);
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
            if (import.meta.env.DEV) {
              console.warn("[Auth] Profiles table not available or request failed, using fallback profile:", error.message || error);
            }
          }
          cachedProfile = buildFallback();
          return cachedProfile;
        }

        cachedProfile = data || buildFallback();
        return cachedProfile;
      } catch (err) {
        if (!hasWarnedProfileError) {
          hasWarnedProfileError = true;
          if (import.meta.env.DEV) {
            console.warn("[Auth] getProfile error, using fallback profile:", err?.message || err);
          }
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
 * Requires user to have an active session AND a confirmed email (email_confirmed_at is not null).
 */
export function requireAuth(pendingAction = null) {
  const session = cachedSession || getStoredSessionSync();
  const user = session?.user;

  // Protect routes: verified email required!
  if (session && user && isEmailVerified(user)) {
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
    if (import.meta.env.DEV) console.warn("[Auth] Failed to write pending action to sessionStorage", err);
  }

  // If session exists but unconfirmed email, pass email query param so login can switch directly to OTP
  const emailParam = user?.email ? `&unverified=1&email=${encodeURIComponent(user.email)}` : "";
  const loginUrl = `${BASE_URL}login.html?next=${encodeURIComponent(validatedNext)}${emailParam}`;
  window.location.href = loginUrl;
  return false;
}

/**
 * Signs out the current user and clears all cached tokens and session state.
 */
export async function signOut(redirectTo = null) {
  cachedSession = null;
  clearProfileCache();
  clearPendingAction();

  // Remove any stored supabase auth tokens from localStorage
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("sb-") && key.endsWith("-auth-token"))) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {}

  const { error } = await supabase.auth.signOut();
  if (error && import.meta.env.DEV) {
    console.warn("[Auth] signOut error:", error.message);
  }

  if (redirectTo && typeof window !== "undefined") {
    window.location.href = redirectTo;
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

  if (pending && session && isEmailVerified(session.user) && !isDealsPage) {
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
      const hasVerifiedSession = Boolean(session && isEmailVerified(session.user));

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
