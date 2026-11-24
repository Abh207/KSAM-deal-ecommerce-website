import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  Lock,
  Check,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileText,
  Printer,
  ShieldCheck,
  Tag,
  X
} from "lucide-react";

import { supabase } from "../lib/supabase.js";
import {
  PLANS,
  getPlanBySlug,
  calculatePlanPricing,
  normalizePlanSlug
} from "../lib/plansConfig.js";

import Toast from "../deals/components/Toast.jsx";
import "./subscribe.css";

const BASE_URL = import.meta.env.BASE_URL || "/";
const FORM_STATE_KEY = "ksam_subscribe_checkout_state";
const PENDING_ACTION_KEY = "ksam_pending_auth_action";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand",
  "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal"
];

const WALLET_OPTIONS = [
  "PhonePe",
  "Paytm",
  "Mobikwik",
  "Amazon Pay",
  "Freecharge",
  "Airtel Money"
];

// Lazy-load Razorpay checkout script on demand
let rzpScriptPromise = null;
function loadRazorpayScript() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (!rzpScriptPromise) {
    rzpScriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error("[Subscribe Checkout] Failed to load Razorpay checkout script");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }
  return rzpScriptPromise;
}

export default function SubscribeApp() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeSub, setActiveSub] = useState(null);

  // Stepper state: 1: Plan, 2: Details, 3: Payment, 4: Success
  const [currentStep, setCurrentStep] = useState(1);

  // Read URL query params or restore from sessionStorage
  const [selectedPlanSlug, setSelectedPlanSlug] = useState(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("plan");
      if (p) return normalizePlanSlug(p);
      try {
        const saved = sessionStorage.getItem(FORM_STATE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.planSlug) return normalizePlanSlug(parsed.planSlug);
        }
      } catch {}
    }
    return "deal-hunter";
  });

  const [billingCycle, setBillingCycle] = useState(() => {
    if (typeof window !== "undefined") {
      const b = new URLSearchParams(window.location.search).get("billing");
      if (b === "yearly" || b === "monthly") return b;
      try {
        const saved = sessionStorage.getItem(FORM_STATE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.billingCycle) return parsed.billingCycle;
        }
      } catch {}
    }
    return "monthly";
  });

  // Step 2 Form details
  const [details, setDetails] = useState(() => {
    const fallback = {
      name: "",
      email: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "Maharashtra",
      pincode: "",
      gstNumber: "",
      saveToProfile: true
    };
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(FORM_STATE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.details) return { ...fallback, ...parsed.details };
        }
      } catch {}
    }
    return fallback;
  });

  const [formErrors, setFormErrors] = useState({});

  // Payment method selection (Default: UPI)
  const [selectedMethod, setSelectedMethod] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(FORM_STATE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.selectedMethod) return parsed.selectedMethod;
        }
      } catch {}
    }
    return "upi";
  });

  // Safe extra controls
  const [upiId, setUpiId] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("PhonePe");
  const [upiError, setUpiError] = useState("");

  // Terms agreement checkbox: UNTICKED by default
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Server coupon verification state
  const [couponInput, setCouponInput] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  // Payment execution state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [completedSub, setCompletedSub] = useState(null);

  // UI accordion toggles
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const selectedPlan = useMemo(() => getPlanBySlug(selectedPlanSlug), [selectedPlanSlug]);
  const pricing = useMemo(() => calculatePlanPricing(selectedPlan.slug, billingCycle), [selectedPlan.slug, billingCycle]);

  // Synchronize URL query params with current plan & billing cycle via history.replaceState
  const updateUrlParams = useCallback((slug, cycle) => {
    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("plan", slug);
      url.searchParams.set("billing", cycle);
      window.history.replaceState({}, "", url.toString());
    } catch (err) {
      console.warn("[Subscribe Checkout] URL sync error:", err);
    }
  }, []);

  const handlePlanSelect = useCallback((slug) => {
    const norm = normalizePlanSlug(slug);
    setSelectedPlanSlug(norm);
    updateUrlParams(norm, billingCycle);
  }, [billingCycle, updateUrlParams]);

  const handleBillingCycleChange = useCallback((cycle) => {
    const nextCycle = cycle === "yearly" ? "yearly" : "monthly";
    setBillingCycle(nextCycle);
    updateUrlParams(selectedPlanSlug, nextCycle);
  }, [selectedPlanSlug, updateUrlParams]);

  // Read URL query params on page load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlPlan = params.get("plan");
      const urlCycle = params.get("billing");
      if (urlPlan) {
        setSelectedPlanSlug(normalizePlanSlug(urlPlan));
      }
      if (urlCycle === "yearly" || urlCycle === "monthly") {
        setBillingCycle(urlCycle);
      }
    }
  }, []);

  // Save progress in sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          FORM_STATE_KEY,
          JSON.stringify({
            planSlug: selectedPlanSlug,
            billingCycle,
            selectedMethod,
            details: {
              name: details.name,
              email: details.email,
              phone: details.phone,
              line1: details.line1,
              line2: details.line2,
              city: details.city,
              state: details.state,
              pincode: details.pincode,
              gstNumber: details.gstNumber
            }
          })
        );
      } catch {}
    }
  }, [selectedPlanSlug, billingCycle, selectedMethod, details]);

  // Check auth and pre-fill details from profile
  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(currentSession);

        if (currentSession?.user) {
          const user = currentSession.user;
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (isMounted && prof) {
            setProfile(prof);
            setDetails((prev) => ({
              ...prev,
              name: prev.name || prof.full_name || user.user_metadata?.full_name || "",
              email: prev.email || prof.email || user.email || "",
              phone: prev.phone || prof.phone || ""
            }));
          }

          // Fetch billing details if saved
          const { data: billing } = await supabase
            .from("billing_details")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (isMounted && billing) {
            setDetails((prev) => ({
              ...prev,
              name: prev.name || billing.name || "",
              phone: prev.phone || billing.phone || "",
              line1: prev.line1 || billing.line1 || "",
              line2: prev.line2 || billing.line2 || "",
              city: prev.city || billing.city || "",
              state: prev.state || billing.state || prev.state,
              pincode: prev.pincode || billing.pincode || "",
              gstNumber: prev.gstNumber || billing.gst_number || ""
            }));
          }

          // Check active subscription
          const { data: subData } = await supabase
            .from("subscriptions")
            .select("id, plan_slug, status, end_date, start_date")
            .eq("user_id", user.id)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (isMounted && subData) {
            setActiveSub(subData);
          }
        }
      } catch (err) {
        console.warn("[SubscribeApp] Auth check warning:", err);
      } finally {
        if (isMounted) setAuthChecking(false);
      }
    }

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Pre-load Razorpay script if on Step 3
  useEffect(() => {
    if (currentStep === 3) {
      loadRazorpayScript();
    }
  }, [currentStep]);

  const handleRequireLogin = () => {
    const returnUrl = `${window.location.pathname}?plan=${selectedPlan.slug}&billing=${billingCycle}`;
    try {
      sessionStorage.setItem(
        PENDING_ACTION_KEY,
        JSON.stringify({
          returnTo: returnUrl,
          message: `Please sign in to continue with the ${selectedPlan.name} plan.`,
          pending: { type: "subscription", planSlug: selectedPlan.slug, billingCycle }
        })
      );
    } catch {}
    window.location.href = `${BASE_URL}login.html?returnTo=${encodeURIComponent(returnUrl)}`;
  };

  const handleFieldChange = (field, value) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!details.name.trim() || details.name.trim().length < 2) {
      errors.name = "Please enter your full name.";
    }
    if (!details.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    const cleanPhone = details.phone.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = "Please enter a valid 10-digit Indian mobile number.";
    }
    if (!details.line1.trim() || details.line1.trim().length < 4) {
      errors.line1 = "Please enter your street address or flat number.";
    }
    if (!details.city.trim()) {
      errors.city = "Please enter your city.";
    }
    if (!details.state.trim()) {
      errors.state = "Please select your state.";
    }
    const cleanPin = details.pincode.replace(/[^0-9]/g, "");
    if (!cleanPin || cleanPin.length !== 6) {
      errors.pincode = "Please enter a valid 6-digit PIN code.";
    }
    if (details.gstNumber.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(details.gstNumber.trim())) {
      errors.gstNumber = "Please enter a valid 15-character GSTIN or leave blank.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Server coupon validation via supabase.functions.invoke
  const handleValidateCoupon = async (codeToVerify, showToast = true) => {
    const code = (codeToVerify || couponInput).trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    if (pricing.basePrice === 0) {
      setCouponError("Coupons cannot be applied to the free Explorer tier.");
      return;
    }

    setCouponValidating(true);
    setCouponError("");

    try {
      const { data, error } = await supabase.functions.invoke("validate-coupon", {
        body: {
          coupon_code: code,
          plan_slug: selectedPlan.slug,
          billing_cycle: billingCycle
        }
      });

      if (error || !data || !data.valid) {
        console.warn("[Subscribe Checkout] Coupon validate error:", error || data);
        setAppliedCoupon(null);
        setCouponError(data?.error || `Coupon "${code}" is invalid or expired.`);
      } else {
        setAppliedCoupon(data);
        setCouponInput("");
        if (showToast) setToastMessage(data.message || `Coupon "${data.code}" applied!`);
      }
    } catch (err) {
      console.warn("[Subscribe Checkout] Coupon validation fallback error:", err);
      // Client-side fallback if edge function is unreachable
      if (code === "KSAM20") {
        const discountAmount = Math.round(pricing.basePrice * 0.2);
        setAppliedCoupon({
          valid: true,
          code: "KSAM20",
          discount_type: "percent",
          discount_value: 20,
          discount_amount: discountAmount,
          final_amount: Math.max(0, pricing.basePrice - discountAmount),
          message: `Coupon "KSAM20" applied! You save ₹${discountAmount}.`
        });
        setCouponInput("");
      } else if (code === "WELCOME50") {
        const discountAmount = Math.min(50, pricing.basePrice);
        setAppliedCoupon({
          valid: true,
          code: "WELCOME50",
          discount_type: "flat",
          discount_value: 50,
          discount_amount: discountAmount,
          final_amount: Math.max(0, pricing.basePrice - discountAmount),
          message: `Coupon "WELCOME50" applied! You save ₹${discountAmount}.`
        });
        setCouponInput("");
      } else {
        setCouponError(`Coupon "${code}" is invalid.`);
      }
    } finally {
      setCouponValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
    setToastMessage("Coupon removed.");
  };

  // Grand Total Calculation
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const finalPayableTotal = Math.max(0, pricing.basePrice - discountAmount);

  // Stepper navigation
  const handleStep1Continue = () => {
    if (!session && !authChecking) {
      handleRequireLogin();
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep2Continue = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    if (session?.user && details.saveToProfile) {
      try {
        await supabase.from("billing_details").upsert({
          user_id: session.user.id,
          name: details.name.trim(),
          email: details.email.trim(),
          phone: details.phone.trim(),
          line1: details.line1.trim(),
          line2: details.line2.trim() || null,
          city: details.city.trim(),
          state: details.state.trim(),
          pincode: details.pincode.trim(),
          gst_number: details.gstNumber.trim() || null,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });
      } catch (err) {
        console.warn("[Subscribe Checkout] Billing save warning:", err);
      }
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Dynamic Pay Button label following selected method (PROBLEM C)
  const getPayButtonLabel = (method, amount) => {
    if (amount === 0) return "Activate plan";
    switch (method) {
      case "upi":
        return `Pay ₹${amount} via UPI`;
      case "card":
        return `Pay ₹${amount} with Card`;
      case "netbanking":
        return `Pay ₹${amount} via Netbanking`;
      case "wallet":
        return `Pay ₹${amount} with Wallet`;
      default:
        return `Pay ₹${amount}`;
    }
  };

  const getMethodDisplayName = (method) => {
    switch (method) {
      case "upi": return "UPI";
      case "card": return "Credit & Debit Cards";
      case "netbanking": return "Netbanking";
      case "wallet": return "Wallets";
      default: return "Payment Method";
    }
  };

  // Step 3 Payment Execution (PROBLEM A & B)
  const handlePaymentSubmit = async () => {
    // 1. Enforce terms checkbox
    if (finalPayableTotal > 0 && !termsAgreed) {
      setPaymentError("Please check the box to accept the Terms of Service, Privacy Policy, and Refund Policy.");
      return;
    }

    // 2. Validate optional UPI ID if entered
    if (selectedMethod === "upi" && upiId.trim()) {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(upiId.trim())) {
        setUpiError("Please enter a valid UPI ID (e.g. yourname@bank) or leave blank.");
        return;
      }
    }
    setUpiError("");

    setPaymentError("");
    setIsProcessingPayment(true);

    try {
      // 3. Confirm active session before making request
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      if (!freshSession?.access_token) {
        setPaymentError("Your session has expired. Please sign in again to continue.");
        setIsProcessingPayment(false);
        handleRequireLogin();
        return;
      }

      // 4. Call create-razorpay-order Edge Function via supabase.functions.invoke
      const { data: orderData, error: invokeErr } = await supabase.functions.invoke(
        "create-razorpay-order",
        {
          body: {
            plan_slug: selectedPlan.slug,
            billing_cycle: billingCycle,
            coupon_code: appliedCoupon ? appliedCoupon.code : undefined
          }
        }
      );

      if (invokeErr) {
        console.error("[Subscribe Checkout] create-razorpay-order error:", {
          name: invokeErr.name,
          message: invokeErr.message,
          context: invokeErr.context,
          status: invokeErr.context?.status
        });

        let friendlyMsg = "Unable to start checkout. Please try again.";
        const msgStr = String(invokeErr.message || invokeErr.name || "");
        if (msgStr.includes("Failed to fetch") || invokeErr.name === "FunctionsFetchError") {
          friendlyMsg = "Unable to reach the payment server. Please check your internet connection or try again in a few moments.";
        } else if (invokeErr.context?.status === 401) {
          friendlyMsg = "Your session has expired. Please sign in again.";
          handleRequireLogin();
          return;
        } else if (invokeErr.message) {
          friendlyMsg = invokeErr.message;
        }
        setPaymentError(friendlyMsg);
        setIsProcessingPayment(false);
        return;
      }

      if (!orderData || !orderData.success) {
        setPaymentError(orderData?.error || "Failed to initialize payment order. Please try again.");
        setIsProcessingPayment(false);
        return;
      }

      // 5. Free Plan or 100% Coupon: Completed immediately without gateway
      if (orderData.free || finalPayableTotal === 0) {
        const now = new Date();
        const endDate = new Date(now.getTime() + (billingCycle === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000);
        setCompletedSub({
          plan_name: selectedPlan.name,
          plan_slug: selectedPlan.slug,
          billing_cycle: billingCycle,
          amount_paid: 0,
          payment_id: "FREE_" + Math.random().toString(36).slice(2, 10).toUpperCase(),
          order_id: orderData.subscription_id || "DIR_" + Date.now(),
          start_date: now.toISOString(),
          end_date: endDate.toISOString(),
          customer_name: details.name,
          customer_email: details.email
        });
        setCurrentStep(4);
        setIsProcessingPayment(false);
        try {
          localStorage.setItem("ksam_user_plan", selectedPlan.name);
          sessionStorage.removeItem(FORM_STATE_KEY);
          window.dispatchEvent(new CustomEvent("ksam-profile-updated", { detail: { plan: selectedPlan.name } }));
        } catch {}
        return;
      }

      // 6. Paid Plan: Load and open Razorpay Checkout
      const hasRzp = await loadRazorpayScript();
      if (!hasRzp || !window.Razorpay) {
        throw new Error("Unable to open Razorpay payment gateway. Please check your internet connection.");
      }

      // Configure Razorpay Standard Checkout with preferred method (PROBLEM B)
      const options = {
        key: orderData.key_id || "rzp_test_TbQFNEdiyvVwDt",
        amount: orderData.amount,
        currency: "INR",
        name: "KSAM Deal",
        description: `${selectedPlan.name} Membership (${billingCycle === "yearly" ? "Annual" : "Monthly"})`,
        image: `${BASE_URL}assets/images/logo-512.png`,
        order_id: orderData.order_id,
        prefill: {
          name: details.name || "",
          email: details.email || freshSession?.user?.email || "",
          contact: details.phone ? details.phone.replace(/[^0-9]/g, "") : "",
          method: selectedMethod,
          vpa: selectedMethod === "upi" && upiId.trim() ? upiId.trim() : undefined
        },
        notes: {
          plan: selectedPlan.slug,
          cycle: billingCycle,
          preferred_method: selectedMethod,
          wallet_name: selectedMethod === "wallet" ? selectedWallet : undefined
        },
        // Razorpay config.display: prioritizes selected method block at the top while keeping other methods accessible
        config: {
          display: {
            blocks: {
              preferred: {
                name: `Pay using ${getMethodDisplayName(selectedMethod)}`,
                instruments: [{ method: selectedMethod }]
              },
              other: {
                name: "Other Payment Methods",
                instruments: [
                  { method: "upi" },
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" }
                ].filter((m) => m.method !== selectedMethod)
              }
            },
            sequence: ["block.preferred", "block.other"],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        theme: {
          color: "#111827"
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            setPaymentError("Payment window was closed before completing transaction. You have not been charged.");
          }
        },
        handler: async function (response) {
          try {
            // Verify payment signature on server via verify-razorpay-payment
            const { data: verifyData, error: verifyErr } = await supabase.functions.invoke(
              "verify-razorpay-payment",
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  plan_slug: selectedPlan.slug,
                  billing_cycle: billingCycle
                }
              }
            );

            if (verifyErr || !verifyData || !verifyData.success) {
              console.error("[Subscribe Checkout] Payment verification failure:", verifyErr || verifyData);
              throw new Error(verifyData?.error || "Payment signature verification failed. Please contact support.");
            }

            const now = new Date();
            const endDate = new Date(now.getTime() + (billingCycle === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000);

            setCompletedSub({
              plan_name: selectedPlan.name,
              plan_slug: selectedPlan.slug,
              billing_cycle: billingCycle,
              amount_paid: finalPayableTotal,
              discount_amount: discountAmount,
              coupon_code: appliedCoupon ? appliedCoupon.code : null,
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              start_date: now.toISOString(),
              end_date: endDate.toISOString(),
              customer_name: details.name,
              customer_email: details.email
            });

            try {
              localStorage.setItem("ksam_user_plan", selectedPlan.name);
              sessionStorage.removeItem(FORM_STATE_KEY);
              window.dispatchEvent(new CustomEvent("ksam-profile-updated", { detail: { plan: selectedPlan.name } }));
            } catch {}

            setCurrentStep(4);
            window.scrollTo({ top: 0, behavior: "smooth" });
          } catch (verErr) {
            console.error("[Subscribe Checkout] Verify error:", verErr);
            setPaymentError(verErr.message || "Payment verification failed. Please contact support with your payment ID.");
          } finally {
            setIsProcessingPayment(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        setIsProcessingPayment(false);
        const errDesc = resp.error?.description || "Payment was declined or cancelled at the gateway";
        setPaymentError(`Payment failed: ${errDesc}. Please try a different payment method.`);
      });
      rzp.open();
    } catch (err) {
      console.error("[Subscribe Checkout] Execution error:", err);
      setIsProcessingPayment(false);
      setPaymentError(err.message || "Unable to start checkout. Please try again.");
    }
  };

  const isCurrentPlanActive = activeSub && activeSub.plan_slug === selectedPlan.slug;

  const handleBackNavigation = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.href = `${BASE_URL}products.html#pricing`;
    }
  };

  const payButtonLabel = getPayButtonLabel(selectedMethod, finalPayableTotal);

  return (
    <div className="checkout-page">
      {/* 1. SIMPLE TOP HEADER (PROBLEM D: Logo left, Secure checkout right, no full site nav) */}
      <header className="checkout-header">
        <div className="checkout-header-inner">
          <a href={`${BASE_URL}index.html`} className="checkout-brand">
            <img
              src={`${BASE_URL}assets/images/ksam-deal logo.png`}
              alt="KSAM Deal"
              className="checkout-brand-logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `${BASE_URL}assets/images/logo-512.png`;
              }}
            />
            <span className="checkout-brand-title">KSAM Deal</span>
          </a>

          <div className="checkout-secure-badge">
            <Lock size={14} className="text-gray-500" />
            <span>Secure checkout</span>
          </div>
        </div>
      </header>

      {/* 2. SLIM STEP INDICATOR (1. Plan, 2. Details, 3. Payment) */}
      {currentStep <= 3 && (
        <div className="checkout-stepper-wrap">
          <nav className="checkout-stepper" aria-label="Checkout Progress">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`checkout-step-btn ${currentStep === 1 ? "is-active" : currentStep > 1 ? "is-completed" : ""}`}
            >
              <span className="checkout-step-num">
                {currentStep > 1 ? <Check size={12} /> : "1"}
              </span>
              <span>Plan</span>
            </button>

            <span className="checkout-step-divider" />

            <button
              type="button"
              disabled={currentStep < 2}
              onClick={() => setCurrentStep(2)}
              className={`checkout-step-btn ${currentStep === 2 ? "is-active" : currentStep > 2 ? "is-completed" : ""}`}
            >
              <span className="checkout-step-num">
                {currentStep > 2 ? <Check size={12} /> : "2"}
              </span>
              <span>Details</span>
            </button>

            <span className="checkout-step-divider" />

            <button
              type="button"
              disabled={currentStep < 3}
              className={`checkout-step-btn ${currentStep === 3 ? "is-active" : ""}`}
            >
              <span className="checkout-step-num">3</span>
              <span>Payment</span>
            </button>
          </nav>
        </div>
      )}

      {/* Mobile Collapsible Summary Accordion (< 1024px) */}
      {currentStep <= 3 && (
        <div className="checkout-mobile-summary">
          <button
            type="button"
            onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
            className="checkout-mobile-summary-trigger"
            aria-expanded={mobileSummaryOpen}
          >
            <div className="checkout-mobile-summary-left">
              <Tag size={14} className="text-gray-500 shrink-0" />
              <span>Order Summary</span>
              <span className="text-gray-300">•</span>
              <span className="checkout-mobile-summary-title">{selectedPlan.name}</span>
              <ChevronDown
                size={14}
                className={`checkout-mobile-chevron ${mobileSummaryOpen ? "is-open" : ""}`}
              />
            </div>
            <span className="checkout-mobile-summary-price tabular-nums">₹{finalPayableTotal}</span>
          </button>

          {mobileSummaryOpen && (
            <div className="checkout-mobile-accordion">
              <div className="checkout-mobile-accordion-inner">
                <div className="flex justify-between text-gray-700">
                  <span>{selectedPlan.name} ({billingCycle === "yearly" ? "Annual" : "Monthly"})</span>
                  <span className="tabular-nums font-semibold">₹{pricing.subtotal}</span>
                </div>

                {billingCycle === "yearly" && pricing.savingsAmount > 0 && (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Yearly savings (20% off)</span>
                    <span className="tabular-nums font-semibold">-₹{pricing.savingsAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>Price includes 18% GST</span>
                  <span className="tabular-nums">₹{pricing.gstAmount}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span className="tabular-nums">-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 text-sm">
                  <span>Total Amount</span>
                  <span className="tabular-nums text-base">₹{finalPayableTotal}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. MAIN CHECKOUT CONTAINER */}
      <main className="checkout-container">
        {/* Not Signed In Notice */}
        {!authChecking && !session && currentStep <= 3 && (
          <div className="mb-6 p-4 rounded-md border border-amber-200 bg-amber-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2.5 text-amber-900">
              <AlertCircle size={18} className="text-amber-600 shrink-0" />
              <span>Please sign in to continue with the {selectedPlan.name} plan.</span>
            </div>
            <button
              type="button"
              onClick={handleRequireLogin}
              className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded transition shrink-0"
            >
              Sign In to Continue →
            </button>
          </div>
        )}

        {/* Already on Same Plan Notice */}
        {isCurrentPlanActive && currentStep <= 3 && (
          <div className="mb-6 p-4 rounded-md border border-blue-200 bg-blue-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
            <div className="text-blue-900">
              <strong>You're already on the {selectedPlan.name} plan.</strong> Active until{" "}
              {activeSub.end_date ? new Date(activeSub.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "current cycle"}.
            </div>
            <a
              href={`${BASE_URL}profile.html#subscription`}
              className="text-xs font-semibold text-blue-700 hover:underline shrink-0"
            >
              View in Profile →
            </a>
          </div>
        )}

        {/* 2-COLUMN LAYOUT (DESKTOP >= 1024px: ~65% Left, ~35% Right) */}
        {currentStep <= 3 ? (
          <div className="checkout-grid">
            {/* LEFT COLUMN: STEPS */}
            <div>
              {/* ================= STEP 1: PLAN SELECTION ================= */}
              {currentStep === 1 && (
                <div className="checkout-box">
                  <h1 className="checkout-box-title">Choose your deal mode</h1>
                  <p className="checkout-box-desc">Select the membership tier that fits your deal hunting needs.</p>

                  {/* Tactile Billing Segmented Control */}
                  <div className="checkout-cycle-wrap">
                    <div
                      className={`checkout-segmented-control ${billingCycle === "yearly" ? "is-yearly" : "is-monthly"}`}
                      role="group"
                      aria-label="Billing cycle"
                    >
                      <div className="checkout-segment-slider" aria-hidden="true" />
                      <button
                        type="button"
                        onClick={() => handleBillingCycleChange("monthly")}
                        className={`checkout-segment-btn ${billingCycle === "monthly" ? "is-active" : ""}`}
                        aria-pressed={billingCycle === "monthly"}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBillingCycleChange("yearly")}
                        className={`checkout-segment-btn ${billingCycle === "yearly" ? "is-active" : ""}`}
                        aria-pressed={billingCycle === "yearly"}
                      >
                        <span>Yearly</span>
                        <span className="checkout-savings-pill">Save 20%</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Clean Plan Cards (Anti-AI, Custom Radio Indicator, No Double Bullets) */}
                  <div className="checkout-plan-grid" role="radiogroup" aria-label="Subscription Plans">
                    {PLANS.map((plan) => {
                      const isSelected = plan.slug === selectedPlan.slug;
                      const isYearly = billingCycle === "yearly";
                      const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
                      const monthlyEq = isYearly && plan.yearlyPrice > 0 ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;

                      return (
                        <div
                          key={plan.slug}
                          onClick={() => handlePlanSelect(plan.slug)}
                          className={`checkout-plan-card ${isSelected ? "is-selected" : ""}`}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              handlePlanSelect(plan.slug);
                            }
                          }}
                        >
                          {plan.popular && (
                            <span className="checkout-plan-badge">Most Popular</span>
                          )}

                          <div>
                            {/* Card Header: Title & Circular Indicator */}
                            <div className="checkout-plan-header">
                              <h3 className="checkout-plan-name">{plan.name}</h3>
                              <div className="checkout-plan-indicator">
                                {isSelected && <Check size={12} strokeWidth={3} className="text-white" />}
                              </div>
                            </div>

                            <p className="checkout-plan-desc">{plan.description}</p>

                            {/* Price Hierarchy */}
                            <div className="checkout-price-block">
                              <div className="checkout-price-main">
                                <span className="checkout-price-amount tabular-nums">
                                  {price === 0 ? "Free" : `₹${price}`}
                                </span>
                                {price > 0 && (
                                  <span className="checkout-price-period">
                                    {isYearly ? "/year" : "/month"}
                                  </span>
                                )}
                              </div>
                              {isYearly && price > 0 && (
                                <p className="checkout-price-subtext">
                                  ₹{monthlyEq}/mo billed annually • Save 20%
                                </p>
                              )}
                            </div>

                            {/* Features List (fixed double-bullet bug) */}
                            <ul className="checkout-plan-features">
                              {plan.features.map((feat, idx) => (
                                <li key={idx} className="checkout-plan-feature-item">
                                  <Check size={14} strokeWidth={2.5} className="checkout-feature-icon" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleStep1Continue}
                    className="checkout-btn-primary"
                  >
                    <span>Continue to Details</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* ================= STEP 2: DETAILS ================= */}
              {currentStep === 2 && (
                <div className="checkout-box">
                  <h2 className="checkout-box-title">Contact &amp; billing details</h2>
                  <p className="checkout-box-desc">We use these details for your tax invoice and account verification.</p>

                  <form onSubmit={handleStep2Continue} className="space-y-4">
                    <div className="checkout-form-grid">
                      {/* Full Name */}
                      <div className="checkout-field">
                        <label className="checkout-label">Full Name *</label>
                        <input
                          type="text"
                          required
                          autoComplete="name"
                          value={details.name}
                          onChange={(e) => handleFieldChange("name", e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className={`checkout-input ${formErrors.name ? "has-error" : ""}`}
                        />
                        {formErrors.name && <span className="checkout-error-msg">{formErrors.name}</span>}
                      </div>

                      {/* Email Address */}
                      <div className="checkout-field">
                        <label className="checkout-label">Email Address *</label>
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          value={details.email}
                          onChange={(e) => handleFieldChange("email", e.target.value)}
                          placeholder="name@example.com"
                          className={`checkout-input ${formErrors.email ? "has-error" : ""}`}
                        />
                        {formErrors.email && <span className="checkout-error-msg">{formErrors.email}</span>}
                      </div>

                      {/* Mobile Number */}
                      <div className="checkout-field full-width">
                        <label className="checkout-label">10-Digit Mobile Number *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold select-none">+91</span>
                          <input
                            type="tel"
                            required
                            autoComplete="tel"
                            maxLength={10}
                            value={details.phone}
                            onChange={(e) => handleFieldChange("phone", e.target.value.replace(/[^0-9]/g, ""))}
                            placeholder="9876543210"
                            className={`checkout-input !pl-12 ${formErrors.phone ? "has-error" : ""}`}
                          />
                        </div>
                        {formErrors.phone && <span className="checkout-error-msg">{formErrors.phone}</span>}
                      </div>

                      {/* Street Address */}
                      <div className="checkout-field full-width">
                        <label className="checkout-label">Street / House Address *</label>
                        <input
                          type="text"
                          required
                          autoComplete="street-address"
                          value={details.line1}
                          onChange={(e) => handleFieldChange("line1", e.target.value)}
                          placeholder="e.g. Flat 402, Green Heights, MG Road"
                          className={`checkout-input ${formErrors.line1 ? "has-error" : ""}`}
                        />
                        {formErrors.line1 && <span className="checkout-error-msg">{formErrors.line1}</span>}
                      </div>

                      {/* Line 2 (Optional) */}
                      <div className="checkout-field full-width">
                        <label className="checkout-label">Apartment / Landmark (Optional)</label>
                        <input
                          type="text"
                          value={details.line2}
                          onChange={(e) => handleFieldChange("line2", e.target.value)}
                          placeholder="Near City Mall"
                          className="checkout-input"
                        />
                      </div>

                      {/* City */}
                      <div className="checkout-field">
                        <label className="checkout-label">City *</label>
                        <input
                          type="text"
                          required
                          autoComplete="address-level2"
                          value={details.city}
                          onChange={(e) => handleFieldChange("city", e.target.value)}
                          placeholder="Mumbai"
                          className={`checkout-input ${formErrors.city ? "has-error" : ""}`}
                        />
                        {formErrors.city && <span className="checkout-error-msg">{formErrors.city}</span>}
                      </div>

                      {/* State */}
                      <div className="checkout-field">
                        <label className="checkout-label">State *</label>
                        <select
                          value={details.state}
                          onChange={(e) => handleFieldChange("state", e.target.value)}
                          className={`checkout-input ${formErrors.state ? "has-error" : ""}`}
                        >
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {formErrors.state && <span className="checkout-error-msg">{formErrors.state}</span>}
                      </div>

                      {/* PIN Code */}
                      <div className="checkout-field">
                        <label className="checkout-label">6-Digit PIN Code *</label>
                        <input
                          type="text"
                          required
                          autoComplete="postal-code"
                          maxLength={6}
                          value={details.pincode}
                          onChange={(e) => handleFieldChange("pincode", e.target.value.replace(/[^0-9]/g, ""))}
                          placeholder="400001"
                          className={`checkout-input ${formErrors.pincode ? "has-error" : ""}`}
                        />
                        {formErrors.pincode && <span className="checkout-error-msg">{formErrors.pincode}</span>}
                      </div>

                      {/* GST Number */}
                      <div className="checkout-field">
                        <label className="checkout-label">GSTIN (Optional, for tax credit)</label>
                        <input
                          type="text"
                          maxLength={15}
                          value={details.gstNumber}
                          onChange={(e) => handleFieldChange("gstNumber", e.target.value.toUpperCase())}
                          placeholder="27AAAAA0000A1Z5"
                          className={`checkout-input ${formErrors.gstNumber ? "has-error" : ""}`}
                        />
                        {formErrors.gstNumber && <span className="checkout-error-msg">{formErrors.gstNumber}</span>}
                      </div>
                    </div>

                    <label className="checkout-checkbox-row">
                      <input
                        type="checkbox"
                        checked={details.saveToProfile}
                        onChange={(e) => handleFieldChange("saveToProfile", e.target.checked)}
                      />
                      <span>Save these billing details to my KSAM Deal profile for future orders.</span>
                    </label>

                    <div className="pt-4 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="checkout-btn-secondary"
                      >
                        <ArrowLeft size={14} />
                        <span>Change Plan</span>
                      </button>

                      <button
                        type="submit"
                        className="checkout-btn-primary !w-auto"
                      >
                        <span>Continue to Payment</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ================= STEP 3: PAYMENT METHOD (PROBLEM B) ================= */}
              {currentStep === 3 && (
                <div className="checkout-box">
                  <h2 className="checkout-box-title">Select payment method</h2>
                  <p className="checkout-box-desc">
                    Choose how you want to pay. You will complete your transaction safely in the secure Razorpay payment window.
                  </p>

                  <div className="checkout-method-list" role="radiogroup" aria-label="Payment Methods">
                    {/* 1. UPI */}
                    <div
                      onClick={() => setSelectedMethod("upi")}
                      className={`checkout-method-row ${selectedMethod === "upi" ? "is-selected" : ""}`}
                      role="radio"
                      aria-checked={selectedMethod === "upi"}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          setSelectedMethod("upi");
                        }
                      }}
                    >
                      <div className={`checkout-radio mt-0.5 ${selectedMethod === "upi" ? "is-checked" : ""}`}>
                        {selectedMethod === "upi" && <div className="checkout-radio-dot" />}
                      </div>

                      <div className="checkout-method-content">
                        <div className="checkout-method-header">
                          <h4 className="checkout-method-name">UPI (Instant &amp; Free)</h4>
                          <span className="text-[10px] font-bold text-green-800 bg-green-100 px-1.5 py-0.5 rounded">Fastest</span>
                        </div>
                        <p className="checkout-method-desc">
                          Google Pay, PhonePe, Paytm, BHIM, CRED, or any banking UPI app.
                        </p>

                        {/* Optional UPI ID Input */}
                        {selectedMethod === "upi" && (
                          <div className="checkout-method-extra" onClick={(e) => e.stopPropagation()}>
                            <div className="checkout-upi-input-wrap">
                              <label className="checkout-label">Your UPI ID (Optional)</label>
                              <input
                                type="text"
                                value={upiId}
                                onChange={(e) => {
                                  setUpiId(e.target.value.trim());
                                  setUpiError("");
                                }}
                                placeholder="e.g. yourname@oksbi"
                                className={`checkout-input !py-1.5 !text-xs ${upiError ? "has-error" : ""}`}
                              />
                              {upiError ? (
                                <span className="checkout-error-msg">{upiError}</span>
                              ) : (
                                <span className="text-[11px] text-gray-500">
                                  Optional. We will prefill this in the Razorpay window for you.
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 2. Credit & Debit Cards */}
                    <div
                      onClick={() => setSelectedMethod("card")}
                      className={`checkout-method-row ${selectedMethod === "card" ? "is-selected" : ""}`}
                      role="radio"
                      aria-checked={selectedMethod === "card"}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          setSelectedMethod("card");
                        }
                      }}
                    >
                      <div className={`checkout-radio mt-0.5 ${selectedMethod === "card" ? "is-checked" : ""}`}>
                        {selectedMethod === "card" && <div className="checkout-radio-dot" />}
                      </div>

                      <div className="checkout-method-content">
                        <div className="checkout-method-header">
                          <h4 className="checkout-method-name">Credit &amp; Debit Cards</h4>
                        </div>
                        <p className="checkout-method-desc">
                          Visa, Mastercard, RuPay, Maestro. All major Indian and international cards.
                        </p>
                        {selectedMethod === "card" && (
                          <div className="checkout-method-extra">
                            <span className="text-[11px] text-gray-500 block leading-relaxed">
                              Card details are entered directly inside Razorpay's encrypted modal. KSAM Deal never collects or stores your card number or CVV.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 3. Netbanking */}
                    <div
                      onClick={() => setSelectedMethod("netbanking")}
                      className={`checkout-method-row ${selectedMethod === "netbanking" ? "is-selected" : ""}`}
                      role="radio"
                      aria-checked={selectedMethod === "netbanking"}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          setSelectedMethod("netbanking");
                        }
                      }}
                    >
                      <div className={`checkout-radio mt-0.5 ${selectedMethod === "netbanking" ? "is-checked" : ""}`}>
                        {selectedMethod === "netbanking" && <div className="checkout-radio-dot" />}
                      </div>

                      <div className="checkout-method-content">
                        <div className="checkout-method-header">
                          <h4 className="checkout-method-name">Netbanking</h4>
                        </div>
                        <p className="checkout-method-desc">
                          50+ Indian banks supported including HDFC, SBI, ICICI, Axis, Kotak, and PNB.
                        </p>
                      </div>
                    </div>

                    {/* 4. Wallets */}
                    <div
                      onClick={() => setSelectedMethod("wallet")}
                      className={`checkout-method-row ${selectedMethod === "wallet" ? "is-selected" : ""}`}
                      role="radio"
                      aria-checked={selectedMethod === "wallet"}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          setSelectedMethod("wallet");
                        }
                      }}
                    >
                      <div className={`checkout-radio mt-0.5 ${selectedMethod === "wallet" ? "is-checked" : ""}`}>
                        {selectedMethod === "wallet" && <div className="checkout-radio-dot" />}
                      </div>

                      <div className="checkout-method-content">
                        <div className="checkout-method-header">
                          <h4 className="checkout-method-name">Wallets</h4>
                        </div>
                        <p className="checkout-method-desc">
                          Paytm, PhonePe, Mobikwik, Amazon Pay, Freecharge, and more.
                        </p>

                        {/* Wallet Choice Chips */}
                        {selectedMethod === "wallet" && (
                          <div className="checkout-method-extra" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[11px] font-semibold text-gray-700 block mb-1">
                              Select your preferred wallet:
                            </span>
                            <div className="checkout-wallet-chips">
                              {WALLET_OPTIONS.map((w) => (
                                <button
                                  key={w}
                                  type="button"
                                  onClick={() => setSelectedWallet(w)}
                                  className={`checkout-wallet-chip ${selectedWallet === w ? "is-selected" : ""}`}
                                >
                                  {w}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions Checkbox (PROBLEM C: UNCHECKED by default) */}
                  <label className="checkout-checkbox-row">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      required
                    />
                    <span>
                      I agree to the{" "}
                      <a href={`${BASE_URL}terms.html`} target="_blank" rel="noopener noreferrer" className="text-gray-900 underline font-semibold">
                        Terms of Service
                      </a>
                      ,{" "}
                      <a href={`${BASE_URL}privacy-policy.html`} target="_blank" rel="noopener noreferrer" className="text-gray-900 underline font-semibold">
                        Privacy Policy
                      </a>
                      , and{" "}
                      <a href={`${BASE_URL}refund-policy.html`} target="_blank" rel="noopener noreferrer" className="text-gray-900 underline font-semibold">
                        Refund &amp; Cancellation Policy
                      </a>
                      .
                    </span>
                  </label>

                  {/* Payment Error Banner with Retry */}
                  {paymentError && (
                    <div className="mt-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-800 text-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-600 shrink-0" />
                        <span>{paymentError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handlePaymentSubmit}
                        className="px-3 py-1 rounded bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition shrink-0"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Desktop Primary Pay Button (PROBLEM C: Single button on desktop, dynamic label) */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      disabled={isProcessingPayment}
                      onClick={() => setCurrentStep(2)}
                      className="checkout-btn-secondary"
                    >
                      <ArrowLeft size={14} />
                      <span>Back to Details</span>
                    </button>

                    {/* Shown on desktop; on mobile the sticky bar is used */}
                    <div className="hidden lg:block w-72">
                      <button
                        type="button"
                        disabled={isProcessingPayment || (finalPayableTotal > 0 && !termsAgreed)}
                        onClick={handlePaymentSubmit}
                        className="checkout-btn-primary"
                      >
                        {isProcessingPayment ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <Lock size={15} />
                            <span>{payButtonLabel}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* FAQ Accordion (Clean, plain layout) */}
              <div className="checkout-faq-wrap">
                <h3 className="checkout-faq-title">Frequently asked questions</h3>
                <div className="space-y-1">
                  {[
                    {
                      id: "faq-1",
                      q: "Can I cancel my subscription at any time?",
                      a: "Yes. You can cancel your subscription from your profile Subscription tab. You retain all benefits until the end of your paid billing period."
                    },
                    {
                      id: "faq-2",
                      q: "How does billing and renewal work?",
                      a: "Your membership is active for the selected duration (monthly or yearly). When the period ends, you can renew directly through your profile."
                    },
                    {
                      id: "faq-3",
                      q: "What is your refund policy?",
                      a: "For digital subscriptions, please review our Refund & Cancellation Policy. If you experience technical issues, contact our support team."
                    },
                    {
                      id: "faq-4",
                      q: "How do I download my GST tax invoice?",
                      a: "Provide your GSTIN during Step 2 of checkout. Your itemized 18% GST tax invoice will be generated and available to download in your profile."
                    }
                  ].map((faq) => {
                    const isOpen = activeFaq === faq.id;
                    return (
                      <div key={faq.id} className="checkout-faq-item">
                        <button
                          type="button"
                          onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                          className="checkout-faq-trigger"
                          aria-expanded={isOpen}
                        >
                          <span>{faq.q}</span>
                          {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                        {isOpen && <div className="checkout-faq-body">{faq.a}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT STICKY ORDER SUMMARY COLUMN (~35%) */}
            <div>
              <div className="checkout-summary-box">
                <h3 className="checkout-summary-title">Order summary</h3>

                <div className="checkout-summary-table">
                  <div className="checkout-summary-row">
                    <span className="font-semibold text-gray-900">
                      {selectedPlan.name} ({billingCycle === "yearly" ? "Annual" : "Monthly"})
                    </span>
                    <span className="font-semibold text-gray-900 tabular-nums">₹{pricing.subtotal}</span>
                  </div>

                  {billingCycle === "yearly" && pricing.savingsAmount > 0 && (
                    <div className="checkout-summary-row is-savings">
                      <div className="flex items-center gap-1.5">
                        <Tag size={13} />
                        <span>Yearly savings (20% off)</span>
                      </div>
                      <span className="tabular-nums font-semibold">-₹{pricing.savingsAmount}</span>
                    </div>
                  )}

                  <div className="checkout-summary-row is-gst">
                    <span>Price includes 18% GST</span>
                    <span className="tabular-nums">₹{pricing.gstAmount}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="checkout-summary-row is-savings">
                      <div className="flex items-center gap-1">
                        <Tag size={12} />
                        <span>Coupon ({appliedCoupon.code})</span>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-gray-400 hover:text-gray-600 ml-1 transition"
                          title="Remove coupon"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <span className="tabular-nums font-semibold">-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="checkout-summary-row is-total">
                    <span>Total</span>
                    <span className="checkout-summary-total-price tabular-nums">₹{finalPayableTotal}</span>
                  </div>
                </div>

                {/* Coupon Code Input */}
                {pricing.basePrice > 0 && (
                  <div className="checkout-coupon-wrap">
                    <label className="checkout-label text-xs">Have a coupon code?</label>
                    <div className="checkout-coupon-row">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        placeholder="e.g. KSAM20"
                        className="checkout-coupon-input"
                      />
                      <button
                        type="button"
                        disabled={couponValidating || !couponInput.trim()}
                        onClick={() => handleValidateCoupon()}
                        className="checkout-coupon-btn"
                      >
                        {couponValidating ? "..." : "Apply"}
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                        <AlertCircle size={12} className="shrink-0" />
                        <span>{couponError}</span>
                      </p>
                    )}

                    {appliedCoupon && (
                      <p className="text-xs text-green-700 mt-1.5 flex items-center gap-1 font-semibold">
                        <Check size={12} className="shrink-0" />
                        <span>{appliedCoupon.description || `Coupon ${appliedCoupon.code} applied!`}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Factual Reassurance Note */}
                <div className="checkout-reassurance">
                  <ShieldCheck size={14} className="shrink-0 mt-0.5 text-gray-500" />
                  <span>Payments are processed securely by Razorpay. KSAM Deal does not store your card, UPI PIN or CVV.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= STEP 4: SUCCESS SCREEN (PROBLEM D: Plain, high-contrast) ================= */
          <div className="max-w-lg mx-auto checkout-box text-center py-10 space-y-5">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-800 flex items-center justify-center mx-auto">
              <Check size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment confirmed</h1>
              <p className="text-xs text-gray-600 mt-1">
                Your subscription to <strong>{completedSub?.plan_name}</strong> is now active.
              </p>
            </div>

            {/* Plain Receipt Box */}
            <div className="p-4 rounded border border-gray-200 bg-gray-50 text-left text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Payment ID</span>
                <span className="font-mono font-semibold text-gray-900">{completedSub?.payment_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Order Reference</span>
                <span className="font-mono text-gray-700">{completedSub?.order_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Plan</span>
                <span className="font-semibold text-gray-900">{completedSub?.plan_name} ({completedSub?.billing_cycle})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-bold text-gray-900">₹{completedSub?.amount_paid}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Valid Until</span>
                <span className="font-semibold text-gray-900">
                  {new Date(completedSub?.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`${BASE_URL}profile.html#subscription`}
                className="checkout-btn-primary !w-auto !py-2.5 !px-5 text-sm"
              >
                <span>View My Subscription</span>
                <ArrowRight size={14} />
              </a>

              <a
                href={`${BASE_URL}products.html`}
                className="checkout-btn-secondary !w-auto !py-2.5 !px-5 text-sm"
              >
                <span>Explore Deals</span>
              </a>

              <button
                type="button"
                onClick={() => setShowReceiptModal(true)}
                className="checkout-btn-secondary !w-auto !py-2.5 !px-5 text-sm"
              >
                <Printer size={14} />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MOBILE STICKY BOTTOM PAY BAR (PROBLEM C: Only sticky bar on mobile) */}
      {currentStep <= 3 && (
        <div className="checkout-mobile-sticky">
          <div>
            <span className="text-[10px] text-gray-500 block font-semibold uppercase">Total</span>
            <span className="text-base font-extrabold text-gray-900">₹{finalPayableTotal}</span>
          </div>

          <button
            type="button"
            disabled={isProcessingPayment || (currentStep === 3 && finalPayableTotal > 0 && !termsAgreed)}
            onClick={
              currentStep === 1
                ? handleStep1Continue
                : currentStep === 2
                ? handleStep2Continue
                : handlePaymentSubmit
            }
            className="checkout-btn-primary !w-auto !py-2.5 !px-5 text-sm"
          >
            {currentStep === 1 ? (
              <span>Continue →</span>
            ) : currentStep === 2 ? (
              <span>Proceed to Pay →</span>
            ) : isProcessingPayment ? (
              <span>Connecting...</span>
            ) : (
              <span>{payButtonLabel}</span>
            )}
          </button>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {showReceiptModal && completedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white border border-gray-300 rounded-lg max-w-md w-full p-6 text-gray-900 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-gray-700" />
                <h3 className="font-bold text-base">Tax Invoice &amp; Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs p-4 bg-gray-50 border border-gray-200 rounded">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">KSAM Deal E-Commerce</h4>
                  <p className="text-[11px] text-gray-500">GSTIN: 27AAAAA0000A1Z5</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 font-bold text-[10px]">PAID</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <div>
                  <span className="block text-gray-400">Billed To:</span>
                  <strong className="text-gray-900">{completedSub.customer_name || "Customer"}</strong>
                  <p>{completedSub.customer_email}</p>
                </div>
                <div className="text-right">
                  <span className="block text-gray-400">Date:</span>
                  <strong>{new Date().toLocaleDateString("en-IN")}</strong>
                  <p>Order #{completedSub.order_id}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 space-y-1">
                <div className="flex justify-between text-gray-700">
                  <span>{completedSub.plan_name} ({completedSub.billing_cycle})</span>
                  <span>₹{completedSub.amount_paid}</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>18% Integrated GST</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-gray-900 pt-2 border-t border-gray-200">
                  <span>Grand Total</span>
                  <span>₹{completedSub.amount_paid}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="checkout-btn-primary !w-auto !py-2 !px-4 text-xs"
              >
                <Printer size={14} />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAN FOOTER */}
      <footer className="checkout-footer">
        <div className="checkout-footer-inner">
          <div className="checkout-footer-links">
            <a href={`${BASE_URL}terms.html`} className="checkout-footer-link">
              Terms of Service
            </a>
            <span>•</span>
            <a href={`${BASE_URL}privacy-policy.html`} className="checkout-footer-link">
              Privacy Policy
            </a>
            <span>•</span>
            <a href={`${BASE_URL}refund-policy.html`} className="checkout-footer-link">
              Refund Policy
            </a>
            <span>•</span>
            <a href={`${BASE_URL}contact-us.html`} className="checkout-footer-link">
              Contact
            </a>
          </div>

          <p>© {new Date().getFullYear()} KSAM Deal. Payments processed securely by Razorpay.</p>
        </div>
      </footer>

      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage("")}
          variant="success"
        />
      )}
    </div>
  );
}

const rootEl = document.getElementById("subscribe-root");
if (rootEl) {
  createRoot(rootEl).render(<SubscribeApp />);
}
