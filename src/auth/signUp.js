import {
  BASE_URL,
  validateReturnTo,
  getPendingAction,
  getSession,
  isEmailVerified,
  validateEmail,
  signUpWithEmail,
  verifyEmailOtp,
  resendSignupOtp,
  formatAuthError,
  showAuthToast
} from "./auth.js";

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

  // If already logged in with verified email, redirect immediately
  const existingSession = await getSession();
  if (existingSession?.user && isEmailVerified(existingSession.user)) {
    window.location.href = nextTarget;
    return;
  }

  // UI Elements
  const authTitle = document.getElementById("authTitle");
  const authSubtitle = document.getElementById("authSubtitle");
  const messageBox = document.getElementById("authStatusMessage");

  // Step 1 Form Elements
  const step1Form = document.getElementById("step1RegistrationForm");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const termsCheckbox = document.getElementById("termsAgree");
  const signButton = document.getElementById("signButton");
  const googleBtn = document.querySelector(".googleLink");
  const appleBtn = document.querySelector(".appleLink");

  // Step 2 Form Elements
  const step2Form = document.getElementById("step2OtpForm");
  const otpContainer = document.getElementById("otpContainer");
  const otpDigits = Array.from(document.querySelectorAll(".kx-otp-digit"));
  const verifyOtpButton = document.getElementById("verifyOtpButton");
  const changeEmailLink = document.getElementById("changeEmailLink");
  const resendOtpBtn = document.getElementById("resendOtpBtn");
  const resendTimerEl = document.getElementById("resendTimer");

  // State
  let registeredEmail = "";
  let resendCooldown = 60;
  let cooldownInterval = null;

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

  function hideMessage() {
    if (messageBox) {
      messageBox.style.display = "none";
      messageBox.textContent = "";
    }
  }

  function startCooldownTimer() {
    if (cooldownInterval) clearInterval(cooldownInterval);
    resendCooldown = 60;
    if (resendOtpBtn) {
      resendOtpBtn.disabled = true;
      resendOtpBtn.innerHTML = `Resend Code (<span id="resendTimer">${resendCooldown}</span>s)`;
    }

    cooldownInterval = setInterval(() => {
      resendCooldown -= 1;
      const timerSpan = document.getElementById("resendTimer");
      if (timerSpan) timerSpan.textContent = String(resendCooldown);

      if (resendCooldown <= 0) {
        clearInterval(cooldownInterval);
        cooldownInterval = null;
        if (resendOtpBtn) {
          resendOtpBtn.disabled = false;
          resendOtpBtn.textContent = "Resend Code";
        }
      }
    }, 1000);
  }

  // ===========================================================================
  // STEP 1: SUBMIT REGISTRATION (Send Email OTP)
  // ===========================================================================
  if (step1Form) {
    step1Form.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideMessage();

      const fullName = nameInput?.value?.trim() || "";
      const email = emailInput?.value?.trim().toLowerCase() || "";
      const password = passwordInput?.value || "";
      const confirmPassword = confirmPasswordInput?.value || "";
      const termsAccepted = termsCheckbox ? termsCheckbox.checked : true;

      // Validation
      if (!fullName) {
        showMessage("Please enter your full name.", "error");
        nameInput?.focus();
        return;
      }

      if (!validateEmail(email)) {
        showMessage("Please enter a valid email address.", "error");
        emailInput?.focus();
        return;
      }

      if (!password || password.length < 6) {
        showMessage("Password must be at least 6 characters long.", "error");
        passwordInput?.focus();
        return;
      }

      if (password !== confirmPassword) {
        showMessage("Passwords do not match. Please re-enter your password.", "error");
        confirmPasswordInput?.focus();
        return;
      }

      if (termsCheckbox && !termsAccepted) {
        showMessage("Please agree to the Terms and Privacy Policy to continue.", "error");
        return;
      }

      // Submit
      if (signButton) {
        signButton.disabled = true;
        signButton.textContent = "Sending Verification Code...";
      }

      try {
        const { data, error, cleanEmail, isAlreadyRegistered } = await signUpWithEmail({
          email,
          password,
          fullName
        });

        if (isAlreadyRegistered) {
          showMessage("This email is already registered. Please sign in.", "error");
          if (signButton) {
            signButton.disabled = false;
            signButton.textContent = "Send Verification Code";
          }
          return;
        }

        if (error) {
          showMessage(formatAuthError(error), "error");
          if (signButton) {
            signButton.disabled = false;
            signButton.textContent = "Send Verification Code";
          }
          return;
        }

        // Successfully sent OTP
        registeredEmail = cleanEmail;

        // Switch UI to Step 2 without navigating away
        step1Form.style.display = "none";
        step2Form.style.display = "block";

        if (authTitle) authTitle.textContent = "Verify Your Email";
        if (authSubtitle) {
          authSubtitle.innerHTML = `We sent a 6-digit verification code to <strong style="color:var(--kx-text);">${registeredEmail}</strong>`;
        }

        showMessage("Verification code sent! Please check your email inbox or spam folder.", "success");

        // Focus first OTP box
        setTimeout(() => {
          otpDigits[0]?.focus();
        }, 150);

        // Start Resend OTP Cooldown
        startCooldownTimer();
      } catch (err) {
        showMessage(formatAuthError(err), "error");
        if (signButton) {
          signButton.disabled = false;
          signButton.textContent = "Send Verification Code";
        }
      }
    });
  }

  // ===========================================================================
  // STEP 2: OTP INPUT NAVIGATION & AUTO-ADVANCE
  // ===========================================================================
  function getOtpValue() {
    return otpDigits.map((input) => input.value.trim()).join("");
  }

  function clearOtpInputs() {
    otpDigits.forEach((input) => {
      input.value = "";
      input.classList.remove("filled");
    });
    otpDigits[0]?.focus();
  }

  otpDigits.forEach((input, index) => {
    // Only permit digits
    input.addEventListener("input", (e) => {
      const val = e.target.value.replace(/\D/g, "");
      e.target.value = val ? val.slice(-1) : "";

      if (e.target.value) {
        input.classList.add("filled");
        if (index < otpDigits.length - 1) {
          otpDigits[index + 1].focus();
        }
      } else {
        input.classList.remove("filled");
      }

      // Check if all filled -> Auto trigger or clear message
      if (getOtpValue().length === 6) {
        hideMessage();
      }
    });

    // Handle Backspace and Arrow navigation
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace") {
        if (!input.value && index > 0) {
          otpDigits[index - 1].focus();
          otpDigits[index - 1].value = "";
          otpDigits[index - 1].classList.remove("filled");
        } else {
          input.value = "";
          input.classList.remove("filled");
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        otpDigits[index - 1].focus();
      } else if (e.key === "ArrowRight" && index < otpDigits.length - 1) {
        otpDigits[index + 1].focus();
      }
    });

    // Handle Paste of full 6-digit code
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pastedData = (e.clipboardData || window.clipboardData).getData("text");
      const digits = pastedData.replace(/\D/g, "").slice(0, 6);

      if (!digits) return;

      digits.split("").forEach((char, i) => {
        if (otpDigits[i]) {
          otpDigits[i].value = char;
          otpDigits[i].classList.add("filled");
        }
      });

      const nextIndex = Math.min(digits.length, otpDigits.length - 1);
      otpDigits[nextIndex]?.focus();

      if (digits.length === 6 && step2Form) {
        // Automatically submit when full 6 digits are pasted
        step2Form.dispatchEvent(new Event("submit", { cancelable: true }));
      }
    });
  });

  // ===========================================================================
  // STEP 2: VERIFY OTP SUBMISSION
  // ===========================================================================
  if (step2Form) {
    step2Form.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideMessage();

      const otpToken = getOtpValue();
      if (otpToken.length !== 6) {
        showMessage("Please enter the complete 6-digit verification code.", "error");
        return;
      }

      if (verifyOtpButton) {
        verifyOtpButton.disabled = true;
        verifyOtpButton.textContent = "Verifying...";
      }

      try {
        const { data, error } = await verifyEmailOtp({
          email: registeredEmail,
          token: otpToken,
          type: "signup"
        });

        if (error) {
          showMessage(formatAuthError(error), "error");
          if (verifyOtpButton) {
            verifyOtpButton.disabled = false;
            verifyOtpButton.textContent = "Verify & Activate Account";
          }
          return;
        }

        // Successfully verified
        showMessage("Account verified successfully! Redirecting...", "success");
        showAuthToast("Account verified successfully!");

        setTimeout(() => {
          window.location.href = nextTarget;
        }, 800);
      } catch (err) {
        showMessage(formatAuthError(err), "error");
        if (verifyOtpButton) {
          verifyOtpButton.disabled = false;
          verifyOtpButton.textContent = "Verify & Activate Account";
        }
      }
    });
  }

  // ===========================================================================
  // RESEND OTP
  // ===========================================================================
  if (resendOtpBtn) {
    resendOtpBtn.addEventListener("click", async () => {
      if (resendCooldown > 0 || !registeredEmail) return;

      resendOtpBtn.disabled = true;
      resendOtpBtn.textContent = "Resending...";
      hideMessage();

      try {
        const { error } = await resendSignupOtp({
          email: registeredEmail
        });

        if (error) {
          showMessage(formatAuthError(error), "error");
          resendOtpBtn.disabled = false;
          resendOtpBtn.textContent = "Resend Code";
          return;
        }

        showMessage("A new verification code has been sent to your email.", "success");
        showAuthToast("Verification code resent!");
        clearOtpInputs();
        startCooldownTimer();
      } catch (err) {
        showMessage(formatAuthError(err), "error");
        resendOtpBtn.disabled = false;
        resendOtpBtn.textContent = "Resend Code";
      }
    });
  }

  // ===========================================================================
  // CHANGE EMAIL (Back to Step 1)
  // ===========================================================================
  if (changeEmailLink) {
    changeEmailLink.addEventListener("click", (e) => {
      e.preventDefault();
      hideMessage();

      if (cooldownInterval) {
        clearInterval(cooldownInterval);
        cooldownInterval = null;
      }

      // Switch views
      step2Form.style.display = "none";
      step1Form.style.display = "block";

      if (authTitle) authTitle.textContent = "Create New Account";
      if (authSubtitle) authSubtitle.textContent = "Sign up with your email to get started";

      if (signButton) {
        signButton.disabled = false;
        signButton.textContent = "Send Verification Code";
      }

      emailInput?.focus();
    });
  }

  // Google OAuth button fallback
  if (googleBtn) {
    googleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showMessage("Sign up with your email above to receive order and price drop alerts.", "error");
    });
  }

  // Apple OAuth button fallback
  if (appleBtn) {
    appleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showMessage("Sign up with your email above to receive order and price drop alerts.", "error");
    });
  }
});
