import {
  BASE_URL,
  validateReturnTo,
  getPendingAction,
  getSession,
  isEmailVerified,
  validateEmail,
  signInWithEmailPassword,
  signInWithEmailOtp,
  verifyEmailOtp,
  resendSignupOtp,
  formatAuthError,
  showAuthToast
} from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const rawNext = urlParams.get("next");
  const isUnverifiedParam = urlParams.get("unverified") === "1";
  const emailParam = urlParams.get("email");
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

  // If already logged in with confirmed email, redirect immediately
  const existingSession = await getSession();
  if (existingSession?.user && isEmailVerified(existingSession.user)) {
    window.location.href = nextTarget;
    return;
  }

  // UI Elements
  const loginTitle = document.getElementById("loginTitle");
  const loginSubtitle = document.getElementById("loginSubtitle");
  const messageBox = document.getElementById("authStatusMessage");
  const tabsContainer = document.getElementById("authTabsContainer");
  const tabPasswordBtn = document.getElementById("tabPasswordBtn");
  const tabOtpBtn = document.getElementById("tabOtpBtn");

  // Form 1: Password Login
  const passwordLoginForm = document.getElementById("passwordLoginForm");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const signButton = document.getElementById("signButton");
  const googleBtn = document.querySelector(".googleLink");
  const appleBtn = document.querySelector(".appleLink");

  // Form 2: OTP Request
  const otpRequestForm = document.getElementById("otpRequestForm");
  const otpLoginEmail = document.getElementById("otpLoginEmail");
  const sendOtpButton = document.getElementById("sendOtpButton");

  // Form 3: OTP Verification
  const loginOtpVerifyForm = document.getElementById("loginOtpVerifyForm");
  const otpDigits = Array.from(document.querySelectorAll("#loginOtpBoxes .kx-otp-digit"));
  const loginVerifyOtpBtn = document.getElementById("loginVerifyOtpBtn");
  const loginChangeEmailLink = document.getElementById("loginChangeEmailLink");
  const loginResendOtpBtn = document.getElementById("loginResendOtpBtn");
  const loginResendTimerEl = document.getElementById("loginResendTimer");

  // State
  let activeTab = "password"; // 'password' | 'otp'
  let targetEmail = "";
  let otpVerificationType = "email"; // 'signup' | 'email'
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
    if (loginResendOtpBtn) {
      loginResendOtpBtn.disabled = true;
      loginResendOtpBtn.innerHTML = `Resend Code (<span id="loginResendTimer">${resendCooldown}</span>s)`;
    }

    cooldownInterval = setInterval(() => {
      resendCooldown -= 1;
      const timerSpan = document.getElementById("loginResendTimer");
      if (timerSpan) timerSpan.textContent = String(resendCooldown);

      if (resendCooldown <= 0) {
        clearInterval(cooldownInterval);
        cooldownInterval = null;
        if (loginResendOtpBtn) {
          loginResendOtpBtn.disabled = false;
          loginResendOtpBtn.textContent = "Resend Code";
        }
      }
    }, 1000);
  }

  function switchToOtpVerification(email, type = "email", messageText = "Verification code sent to your email inbox.") {
    targetEmail = email;
    otpVerificationType = type;

    passwordLoginForm.style.display = "none";
    otpRequestForm.style.display = "none";
    loginOtpVerifyForm.style.display = "block";
    if (tabsContainer) tabsContainer.style.display = "none";

    if (loginTitle) loginTitle.textContent = "Verify Your Email";
    if (loginSubtitle) {
      loginSubtitle.innerHTML = `Enter the 6-digit code sent to <strong style="color:var(--kx-text);">${targetEmail}</strong>`;
    }

    showMessage(messageText, "success");
    clearOtpInputs();
    startCooldownTimer();

    setTimeout(() => {
      otpDigits[0]?.focus();
    }, 150);
  }

  function switchTab(tab) {
    activeTab = tab;
    hideMessage();

    if (tab === "password") {
      tabPasswordBtn?.classList.add("active");
      tabOtpBtn?.classList.remove("active");
      passwordLoginForm.style.display = "block";
      otpRequestForm.style.display = "none";
      loginOtpVerifyForm.style.display = "none";
      if (loginTitle) loginTitle.textContent = "Welcome Back";
      if (loginSubtitle) loginSubtitle.textContent = "Sign in to your KSAM Deal account";
    } else {
      tabOtpBtn?.classList.add("active");
      tabPasswordBtn?.classList.remove("active");
      otpRequestForm.style.display = "block";
      passwordLoginForm.style.display = "none";
      loginOtpVerifyForm.style.display = "none";
      if (loginTitle) loginTitle.textContent = "Email OTP Sign In";
      if (loginSubtitle) loginSubtitle.textContent = "Sign in quickly using a 6-digit email code";
    }
  }

  tabPasswordBtn?.addEventListener("click", () => switchTab("password"));
  tabOtpBtn?.addEventListener("click", () => switchTab("otp"));

  // If redirected with unverified email
  if (isUnverifiedParam && emailParam && validateEmail(emailParam)) {
    const cleanEmail = emailParam.trim().toLowerCase();
    resendSignupOtp({ email: cleanEmail }).catch(() => {});
    switchToOtpVerification(
      cleanEmail,
      "signup",
      "Email not confirmed. We've sent a verification code to your email."
    );
  }

  // ===========================================================================
  // FORM 1: PASSWORD LOGIN SUBMISSION
  // ===========================================================================
  if (passwordLoginForm) {
    passwordLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideMessage();

      const email = loginEmail?.value?.trim().toLowerCase() || "";
      const password = loginPassword?.value || "";

      if (!validateEmail(email)) {
        showMessage("Please enter a valid email address.", "error");
        loginEmail?.focus();
        return;
      }

      if (!password) {
        showMessage("Please enter your password.", "error");
        loginPassword?.focus();
        return;
      }

      if (signButton) {
        signButton.disabled = true;
        signButton.textContent = "Signing In...";
      }

      try {
        const { data, error, cleanEmail } = await signInWithEmailPassword({
          email,
          password
        });

        if (error) {
          const errorMsg = error.message || "";

          // If email is unconfirmed, automatically send OTP and switch to OTP screen
          if (
            errorMsg.toLowerCase().includes("email not confirmed") ||
            errorMsg.toLowerCase().includes("unconfirmed") ||
            errorMsg.toLowerCase().includes("email is not confirmed")
          ) {
            // Trigger signup OTP resend
            await resendSignupOtp({ email: cleanEmail });
            switchToOtpVerification(
              cleanEmail,
              "signup",
              "Email not confirmed. We've sent a verification code to your email."
            );
            return;
          }

          showMessage(formatAuthError(error), "error");
          if (signButton) {
            signButton.disabled = false;
            signButton.textContent = "Sign In";
          }
          return;
        }

        // Check if user is email verified
        if (data?.user) {
          if (!isEmailVerified(data.user)) {
            // Send OTP and prompt verification
            await resendSignupOtp({ email: cleanEmail });
            switchToOtpVerification(
              cleanEmail,
              "signup",
              "Email not confirmed. We've sent a verification code to your email."
            );
            return;
          }

          showMessage("Signed in successfully! Redirecting...", "success");
          showAuthToast("Welcome back! Signed in successfully.");
          setTimeout(() => {
            window.location.href = nextTarget;
          }, 600);
        }
      } catch (err) {
        showMessage(formatAuthError(err), "error");
        if (signButton) {
          signButton.disabled = false;
          signButton.textContent = "Sign In";
        }
      }
    });
  }

  // ===========================================================================
  // FORM 2: OTP LOGIN REQUEST SUBMISSION
  // ===========================================================================
  if (otpRequestForm) {
    otpRequestForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideMessage();

      const email = otpLoginEmail?.value?.trim().toLowerCase() || "";

      if (!validateEmail(email)) {
        showMessage("Please enter a valid email address.", "error");
        otpLoginEmail?.focus();
        return;
      }

      if (sendOtpButton) {
        sendOtpButton.disabled = true;
        sendOtpButton.textContent = "Sending Code...";
      }

      try {
        const { error, cleanEmail } = await signInWithEmailOtp({
          email
        });

        if (error) {
          showMessage(formatAuthError(error), "error");
          if (sendOtpButton) {
            sendOtpButton.disabled = false;
            sendOtpButton.textContent = "Send OTP Code";
          }
          return;
        }

        switchToOtpVerification(
          cleanEmail,
          "email",
          "Verification code sent! Please check your email inbox or spam folder."
        );
      } catch (err) {
        showMessage(formatAuthError(err), "error");
        if (sendOtpButton) {
          sendOtpButton.disabled = false;
          sendOtpButton.textContent = "Send OTP Code";
        }
      }
    });
  }

  // ===========================================================================
  // FORM 3: OTP VERIFICATION & INPUT HANDLING
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

      if (getOtpValue().length === 6) {
        hideMessage();
      }
    });

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

      if (digits.length === 6 && loginOtpVerifyForm) {
        loginOtpVerifyForm.dispatchEvent(new Event("submit", { cancelable: true }));
      }
    });
  });

  // VERIFY OTP SUBMISSION
  if (loginOtpVerifyForm) {
    loginOtpVerifyForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideMessage();

      const otpToken = getOtpValue();
      if (otpToken.length !== 6) {
        showMessage("Please enter the complete 6-digit verification code.", "error");
        return;
      }

      if (loginVerifyOtpBtn) {
        loginVerifyOtpBtn.disabled = true;
        loginVerifyOtpBtn.textContent = "Verifying...";
      }

      try {
        const { data, error } = await verifyEmailOtp({
          email: targetEmail,
          token: otpToken,
          type: otpVerificationType
        });

        if (error) {
          showMessage(formatAuthError(error), "error");
          if (loginVerifyOtpBtn) {
            loginVerifyOtpBtn.disabled = false;
            loginVerifyOtpBtn.textContent = "Verify & Sign In";
          }
          return;
        }

        showMessage("Verified successfully! Redirecting...", "success");
        showAuthToast("Signed in successfully!");

        setTimeout(() => {
          window.location.href = nextTarget;
        }, 700);
      } catch (err) {
        showMessage(formatAuthError(err), "error");
        if (loginVerifyOtpBtn) {
          loginVerifyOtpBtn.disabled = false;
          loginVerifyOtpBtn.textContent = "Verify & Sign In";
        }
      }
    });
  }

  // RESEND OTP
  if (loginResendOtpBtn) {
    loginResendOtpBtn.addEventListener("click", async () => {
      if (resendCooldown > 0 || !targetEmail) return;

      loginResendOtpBtn.disabled = true;
      loginResendOtpBtn.textContent = "Resending...";
      hideMessage();

      try {
        let resendErr = null;
        if (otpVerificationType === "signup") {
          const res = await resendSignupOtp({ email: targetEmail });
          resendErr = res.error;
        } else {
          const res = await signInWithEmailOtp({ email: targetEmail });
          resendErr = res.error;
        }

        if (resendErr) {
          showMessage(formatAuthError(resendErr), "error");
          loginResendOtpBtn.disabled = false;
          loginResendOtpBtn.textContent = "Resend Code";
          return;
        }

        showMessage("A new verification code has been sent to your email.", "success");
        showAuthToast("Verification code resent!");
        clearOtpInputs();
        startCooldownTimer();
      } catch (err) {
        showMessage(formatAuthError(err), "error");
        loginResendOtpBtn.disabled = false;
        loginResendOtpBtn.textContent = "Resend Code";
      }
    });
  }

  // CHANGE EMAIL (Back to Sign-in)
  if (loginChangeEmailLink) {
    loginChangeEmailLink.addEventListener("click", (e) => {
      e.preventDefault();
      hideMessage();

      if (cooldownInterval) {
        clearInterval(cooldownInterval);
        cooldownInterval = null;
      }

      if (tabsContainer) tabsContainer.style.display = "flex";
      switchTab(activeTab);

      if (signButton) {
        signButton.disabled = false;
        signButton.textContent = "Sign In";
      }
      if (sendOtpButton) {
        sendOtpButton.disabled = false;
        sendOtpButton.textContent = "Send OTP Code";
      }
    });
  }

  // Handle Google / Apple buttons
  if (googleBtn) {
    googleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showMessage("Sign in with your email and password or email code above.", "error");
    });
  }

  if (appleBtn) {
    appleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showMessage("Sign in with your email and password or email code above.", "error");
    });
  }
});
