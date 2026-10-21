import { supabase } from "../lib/supabase.js";
import { BASE_URL, validateReturnTo, getPendingAction, getSession } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const rawNext = urlParams.get("next");
  const pending = getPendingAction();
  const nextTarget = validateReturnTo(rawNext) || validateReturnTo(pending?.returnTo) || `${BASE_URL}index.html`;

  // Update signup link to carry the next parameter
  const signUpLink = document.querySelector('.signUpLoginLink a[href*="signUp"]');
  if (signUpLink) {
    signUpLink.href = `./signUp.html?next=${encodeURIComponent(nextTarget)}`;
  }

  // Show "Back to profile" link when next=profile.html
  if (nextTarget && nextTarget.includes("profile.html")) {
    const header = document.querySelector(".headpara");
    if (header && !document.getElementById("backToProfileLink")) {
      const backLink = document.createElement("a");
      backLink.id = "backToProfileLink";
      backLink.href = nextTarget;
      backLink.textContent = "← Back to Profile";
      backLink.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 0.75rem;
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--kx-accent, #22ff88);
        text-decoration: none;
        transition: opacity 0.2s;
      `;
      header.insertBefore(backLink, header.firstChild);
    }
  }

  // If already logged in, redirect immediately
  const existingSession = await getSession();
  if (existingSession?.user) {
    window.location.href = nextTarget;
    return;
  }

  const form = document.querySelector(".signForm form");
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const submitBtn = document.getElementById("signButton");
  const googleBtn = document.querySelector(".googleLink");
  const appleBtn = document.querySelector(".appleLink");

  // Create message banner element
  let messageBox = document.getElementById("authStatusMessage");
  if (!messageBox && form) {
    messageBox = document.createElement("div");
    messageBox.id = "authStatusMessage";
    messageBox.style.cssText = `
      margin-bottom: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      line-height: 1.4;
      display: none;
      text-align: center;
      transition: all 0.3s ease;
    `;
    form.insertBefore(messageBox, form.firstChild);
  }

  function showMessage(text, type = "error") {
    if (!messageBox) return;
    messageBox.textContent = text;
    messageBox.style.display = "block";
    if (type === "error") {
      messageBox.style.background = "rgba(239, 68, 68, 0.15)";
      messageBox.style.color = "#dc2626";
      messageBox.style.border = "1px solid rgba(239, 68, 68, 0.35)";
    } else {
      messageBox.style.background = "rgba(34, 255, 136, 0.15)";
      messageBox.style.color = "#15803d";
      messageBox.style.border = "1px solid rgba(34, 255, 136, 0.4)";
    }
  }

  function formatAuthError(error) {
    if (!error) return "An unexpected error occurred. Please try again.";

    const message = error.message || String(error);
    const lowerMsg = message.toLowerCase();

    // Distinguish network/connection/DNS/server-down failures:
    if (
      lowerMsg.includes("failed to fetch") ||
      lowerMsg.includes("network") ||
      lowerMsg.includes("fetch failed") ||
      error.status === 0 ||
      error.name === "AuthRetryableFetchError"
    ) {
      return "Unable to connect to the authentication server. Please check your internet connection or verify that your Supabase project is active and not paused.";
    }

    // Invalid credentials:
    if (
      lowerMsg.includes("invalid login credentials") ||
      lowerMsg.includes("invalid_grant") ||
      lowerMsg.includes("wrong password")
    ) {
      return "Wrong email or password. Please check your credentials.";
    }

    // Email unconfirmed:
    if (lowerMsg.includes("email not confirmed") || lowerMsg.includes("unconfirmed")) {
      return "Please check your email to confirm your account first.";
    }

    // Rate limiting:
    if (lowerMsg.includes("rate limit") || lowerMsg.includes("too many requests") || error.status === 429) {
      return "Too many sign-in attempts. Please wait a few moments before trying again.";
    }

    return message;
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = emailInput?.value?.trim();
      const password = passwordInput?.value;

      if (!email || !password) {
        showMessage("Please fill in both email and password.", "error");
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Signing In...";
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          console.error("[Auth] Sign in failed:", error);
          showMessage(formatAuthError(error), "error");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Sign In";
          }
          return;
        }

        if (data?.session) {
          showMessage("Signed in successfully! Redirecting...", "success");
          setTimeout(() => {
            window.location.href = nextTarget;
          }, 600);
        }
      } catch (err) {
        console.error("[Auth] Unexpected sign in error:", err);
        showMessage(formatAuthError(err), "error");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Sign In";
        }
      }
    });
  }

  // Handle Google button
  if (googleBtn) {
    googleBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const fullRedirect = new URL(nextTarget, window.location.origin).href;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: fullRedirect }
        });
        if (error) {
          showMessage("Google sign-in is not configured yet in Supabase. Please sign in with email/password.", "error");
        }
      } catch (err) {
        showMessage("Google sign-in is not configured yet in Supabase. Please sign in with email/password.", "error");
      }
    });
  }

  // Handle Apple button
  if (appleBtn) {
    appleBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const fullRedirect = new URL(nextTarget, window.location.origin).href;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "apple",
          options: { redirectTo: fullRedirect }
        });
        if (error) {
          showMessage("Apple sign-in is not configured yet in Supabase. Please sign in with email/password.", "error");
        }
      } catch (err) {
        showMessage("Apple sign-in is not configured yet in Supabase. Please sign in with email/password.", "error");
      }
    });
  }
});
