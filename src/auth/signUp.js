import { supabase } from "../lib/supabase.js";
import { BASE_URL, validateReturnTo, getPendingAction, getSession } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const rawNext = urlParams.get("next");
  const pending = getPendingAction();
  const nextTarget = validateReturnTo(rawNext) || validateReturnTo(pending?.returnTo) || `${BASE_URL}index.html`;

  // Update sign-in link to preserve the next parameter
  const signInLink = document.querySelector('.signUpLoginLink a[href*="login"]');
  if (signInLink) {
    signInLink.href = `./login.html?next=${encodeURIComponent(nextTarget)}`;
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
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const termsCheckbox = document.getElementById("termsAgree");
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

  function formatSignUpError(error) {
    if (!error) return "An unexpected error occurred during sign up.";

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

    // Already registered / exists:
    if (lowerMsg.includes("already registered") || lowerMsg.includes("user already exists")) {
      return "An account with this email already exists. Please sign in.";
    }

    // Password requirements:
    if (lowerMsg.includes("weak password") || lowerMsg.includes("password should be")) {
      return "Password is too weak. Please choose a password with at least 6 characters.";
    }

    // Rate limiting:
    if (lowerMsg.includes("rate limit") || lowerMsg.includes("too many requests") || error.status === 429) {
      return "Too many sign-up attempts. Please wait a few moments before trying again.";
    }

    return message;
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fullName = nameInput?.value?.trim();
      const email = emailInput?.value?.trim();
      const password = passwordInput?.value;
      const termsAccepted = termsCheckbox ? termsCheckbox.checked : true;

      if (!fullName) {
        showMessage("Please enter your full name.", "error");
        return;
      }
      if (!email) {
        showMessage("Please enter your email address.", "error");
        return;
      }
      if (!password || password.length < 6) {
        showMessage("Password should be at least 6 characters long.", "error");
        return;
      }
      if (termsCheckbox && !termsAccepted) {
        showMessage("Please agree to the Terms and Privacy Policy to continue.", "error");
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating Account...";
      }

      try {
        const emailRedirectUrl = new URL(`${BASE_URL}email-verified.html`, window.location.origin).href;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: emailRedirectUrl,
            data: {
              full_name: fullName,
              name: fullName
            }
          }
        });

        if (error) {
          console.error("[Auth] Sign up failed:", error);
          showMessage(formatSignUpError(error), "error");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit";
          }
          return;
        }

        // If user already exists (Supabase sometimes returns empty user/identities with no error)
        if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
          showMessage("An account with this email already exists. Please sign in.", "error");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit";
          }
          return;
        }

        const nowIso = new Date().toISOString();

        // Update profile consent if user is established
        if (data?.user?.id) {
          try {
            await supabase.from("profiles").upsert({
              id: data.user.id,
              email: email,
              full_name: fullName,
              consent_accepted_at: nowIso
            });
          } catch (profileErr) {
            console.warn("[SignUp] profile upsert note:", profileErr);
          }
        }

        // Check if session was granted or confirmation is needed
        if (data?.session) {
          showMessage("Account created successfully! Redirecting...", "success");
          setTimeout(() => {
            window.location.href = nextTarget;
          }, 800);
        } else {
          showMessage("Account created! Redirecting to email verification...", "success");
          setTimeout(() => {
            window.location.href = `${BASE_URL}verify-email.html?email=${encodeURIComponent(email)}&next=${encodeURIComponent(nextTarget)}`;
          }, 600);
        }
      } catch (err) {
        console.error("[Auth] Unexpected sign up error:", err);
        showMessage(formatSignUpError(err), "error");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit";
        }
      }
    });
  }

  // Google OAuth button
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
          showMessage("Google sign-up is not configured yet in Supabase. Please sign up with email and password.", "error");
        }
      } catch (err) {
        showMessage("Google sign-up is not configured yet in Supabase. Please sign up with email and password.", "error");
      }
    });
  }

  // Apple OAuth button
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
          showMessage("Apple sign-up is not configured yet in Supabase. Please sign up with email and password.", "error");
        }
      } catch (err) {
        showMessage("Apple sign-up is not configured yet in Supabase. Please sign up with email and password.", "error");
      }
    });
  }
});
