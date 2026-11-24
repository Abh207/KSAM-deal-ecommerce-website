import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  Compass,
  Flame,
  Crown,
  Check,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Calendar,
  CheckCircle2,
  RefreshCw,
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  Tag,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Printer,
  Download,
  Info,
  X,
  FileText
} from "lucide-react";

import { supabase } from "../lib/supabase.js";
import {
  PLANS,
  getPlanBySlug,
  calculatePlanPricing,
  normalizePlanSlug,
  isHigherTier,
  isSameTier,
  getUpgradeNotice
} from "../lib/plansConfig.js";

import Navbar from "../deals/components/Navbar.jsx";
import Footer from "../deals/components/Footer.jsx";
import Toast from "../deals/components/Toast.jsx";

// Global tokens and styles
import "../deals/tailwind-generated.css";
import "../deals/deals.css";
import "../styles/kx-tokens.css";
import "../styles/kx-motion.css";
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

function PlanIcon({ icon, size = 20, className = "" }) {
  if (icon === "flame") return <Flame size={size} className={className} />;
  if (icon === "crown") return <Crown size={size} className={className} />;
  return <Compass size={size} className={className} />;
}

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
        console.error("Failed to load Razorpay checkout script");
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

  // Read URL query params
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
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [preferredMethod, setPreferredMethod] = useState("upi");
  const [termsAgreed, setTermsAgreed] = useState(true);

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
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const selectedPlan = useMemo(() => getPlanBySlug(selectedPlanSlug), [selectedPlanSlug]);
  const pricing = useMemo(() => calculatePlanPricing(selectedPlan.slug, billingCycle), [selectedPlan.slug, billingCycle]);

  // Save progress in sessionStorage (excluding payment data)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          FORM_STATE_KEY,
          JSON.stringify({
            planSlug: selectedPlanSlug,
            billingCycle,
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
  }, [selectedPlanSlug, billingCycle, details]);

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

  // Recalculate coupon if plan or billing cycle changes
  useEffect(() => {
    if (appliedCoupon) {
      handleValidateCoupon(appliedCoupon.code, false);
    }
  }, [selectedPlanSlug, billingCycle]);

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
      errors.line1 = "Please enter a valid address (street or flat).";
    }
    if (!details.city.trim()) {
      errors.city = "Please enter your city.";
    }
    if (!details.state.trim()) {
      errors.state = "Please select your state.";
    }
    const cleanPin = details.pincode.replace(/[^0-9]/g, "");
    if (!cleanPin || cleanPin.length !== 6) {
      errors.pincode = "Please enter a valid 6-digit Indian PIN code.";
    }
    if (details.gstNumber.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(details.gstNumber.trim())) {
      errors.gstNumber = "Please enter a valid 15-character GSTIN or leave blank.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Server coupon validation
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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://epchmnhmwnrchgflgwdf.supabase.co";
      const token = session?.access_token;
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${supabaseUrl}/functions/v1/validate-coupon`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          coupon_code: code,
          plan_slug: selectedPlan.slug,
          billing_cycle: billingCycle
        })
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        setAppliedCoupon(null);
        setCouponError(data.error || `Coupon "${code}" is invalid or expired.`);
      } else {
        setAppliedCoupon(data);
        setCouponInput("");
        if (showToast) setToastMessage(data.message || `Coupon "${data.code}" applied!`);
      }
    } catch (err) {
      console.warn("[SubscribeApp] Coupon validation fallback error:", err);
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

  // Grand Total Calculation with Coupon & GST
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const finalPayableTotal = Math.max(0, pricing.basePrice - discountAmount);

  // Stepper navigation handlers
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

    // Save billing details & preferences if user opted in
    if (session?.user) {
      try {
        if (details.saveToProfile) {
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
        }

        // Save marketing preference if checked
        if (marketingConsent) {
          await supabase.from("profiles").update({
            marketing_opt_in: true,
            updated_at: new Date().toISOString()
          }).eq("id", session.user.id);
        }
      } catch (err) {
        console.warn("[SubscribeApp] Auto-save billing error:", err);
      }
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 3 Payment Execution
  const handlePaymentSubmit = async () => {
    if (finalPayableTotal > 0 && !termsAgreed) {
      setPaymentError("Please accept the Terms of Service, Privacy Policy, and Refund Policy.");
      return;
    }

    setPaymentError("");
    setIsProcessingPayment(true);

    try {
      const token = session?.access_token;
      if (!token) {
        handleRequireLogin();
        return;
      }

      // 1. Call create-razorpay-order Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://epchmnhmwnrchgflgwdf.supabase.co";
      const orderRes = await fetch(`${supabaseUrl}/functions/v1/create-razorpay-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_slug: selectedPlan.slug,
          billing_cycle: billingCycle,
          coupon_code: appliedCoupon ? appliedCoupon.code : undefined
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initialize order");
      }

      // 2. Free Plan / 100% Discount: Completed immediately without gateway
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
          window.dispatchEvent(new CustomEvent("ksam-profile-updated", { detail: { plan: selectedPlan.name } }));
        } catch {}
        return;
      }

      // 3. Paid Plan: Ensure Razorpay script is loaded
      const hasRzp = await loadRazorpayScript();
      if (!hasRzp || !window.Razorpay) {
        throw new Error("Unable to open Razorpay payment gateway. Please check your internet connection.");
      }

      const options = {
        key: orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TbQFNEdiyvVwDt",
        amount: orderData.amount,
        currency: "INR",
        name: "KSAM Deal",
        description: `${selectedPlan.name} Membership (${billingCycle === "yearly" ? "Annual" : "Monthly"})`,
        image: `${BASE_URL}assets/images/logo-512.png`,
        order_id: orderData.order_id,
        prefill: {
          name: details.name || "",
          email: details.email || session?.user?.email || "",
          contact: details.phone ? details.phone.replace(/[^0-9]/g, "") : ""
        },
        notes: {
          plan: selectedPlan.slug,
          cycle: billingCycle,
          preferred_method: preferredMethod
        },
        theme: {
          color: "#84FF00",
          backdrop_color: "rgba(5, 10, 2, 0.9)"
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            setPaymentError("Payment window was closed before completing transaction. You have not been charged.");
          }
        },
        handler: async function (response) {
          try {
            // Verify payment on server
            const verifyRes = await fetch(`${supabaseUrl}/functions/v1/verify-razorpay-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_slug: selectedPlan.slug,
                billing_cycle: billingCycle
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment signature verification failed.");
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

            // Update local plan state for navbar and profile
            try {
              localStorage.setItem("ksam_user_plan", selectedPlan.name);
              sessionStorage.removeItem(FORM_STATE_KEY);
              window.dispatchEvent(new CustomEvent("ksam-profile-updated", { detail: { plan: selectedPlan.name } }));
            } catch {}

            setCurrentStep(4);
            window.scrollTo({ top: 0, behavior: "smooth" });
          } catch (verErr) {
            console.error("[SubscribeApp] Verify payment error:", verErr);
            setPaymentError(verErr.message || "Payment verification failed. Please contact support.");
          } finally {
            setIsProcessingPayment(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        setIsProcessingPayment(false);
        const errDesc = resp.error?.description || "Payment failed at gateway";
        setPaymentError(`Payment failed: ${errDesc}. Please try a different payment method.`);
      });
      rzp.open();
    } catch (err) {
      console.error("[SubscribeApp] Checkout execution error:", err);
      setIsProcessingPayment(false);
      setPaymentError(err.message || "Failed to start checkout. Please try again.");
    }
  };

  const isCurrentPlanActive = activeSub && isSameTier(activeSub.plan_slug, selectedPlan.slug);
  const upgradeNotice = useMemo(() => getUpgradeNotice(activeSub, selectedPlan.slug), [activeSub, selectedPlan.slug]);

  // Back link handler
  const handleBackNavigation = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.location.href = `${BASE_URL}products.html#pricing`;
    }
  };

  return (
    <div className="sub-checkout-page">
      {/* 1. TOP BAR WITH 4-STEP STEPPER */}
      <header className="sub-topbar">
        <div className="sub-topbar-inner">
          {/* Brand Logo & Title */}
          <a href={`${BASE_URL}index.html`} className="sub-brand-link">
            <img
              src={`${BASE_URL}assets/images/ksam-deal logo.png`}
              alt="KSAM Deal"
              className="sub-brand-logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `${BASE_URL}assets/images/logo-512.png`;
              }}
            />
            <div className="sub-brand-title hidden sm:flex">
              <span>KSAM Deal</span>
              <span className="sub-brand-badge">Checkout</span>
            </div>
          </a>

          {/* Stepper with 4 Steps */}
          <nav className="sub-stepper" aria-label="Checkout Progress">
            <button
              type="button"
              disabled={currentStep > 3}
              onClick={() => setCurrentStep(1)}
              className={`sub-step-node ${currentStep === 1 ? "is-active" : currentStep > 1 ? "is-completed" : ""}`}
            >
              <div className="sub-step-indicator">
                {currentStep > 1 ? <Check size={14} /> : "1"}
              </div>
              <span className="sub-step-title hidden md:inline">Plan</span>
            </button>

            <div className={`sub-step-line ${currentStep >= 2 ? "is-active" : ""}`} />

            <button
              type="button"
              disabled={currentStep < 2 || currentStep > 3}
              onClick={() => setCurrentStep(2)}
              className={`sub-step-node ${currentStep === 2 ? "is-active" : currentStep > 2 ? "is-completed" : ""}`}
            >
              <div className="sub-step-indicator">
                {currentStep > 2 ? <Check size={14} /> : "2"}
              </div>
              <span className="sub-step-title hidden md:inline">Details</span>
            </button>

            <div className={`sub-step-line ${currentStep >= 3 ? "is-active" : ""}`} />

            <button
              type="button"
              disabled={currentStep < 3 || currentStep > 3}
              className={`sub-step-node ${currentStep === 3 ? "is-active" : currentStep > 3 ? "is-completed" : ""}`}
            >
              <div className="sub-step-indicator">
                {currentStep > 3 ? <Check size={14} /> : "3"}
              </div>
              <span className="sub-step-title hidden md:inline">Payment</span>
            </button>

            <div className={`sub-step-line ${currentStep >= 4 ? "is-active" : ""}`} />

            <div className={`sub-step-node ${currentStep === 4 ? "is-active" : ""}`}>
              <div className="sub-step-indicator">4</div>
              <span className="sub-step-title hidden md:inline">Success</span>
            </div>
          </nav>

          {/* Back Link */}
          {currentStep <= 3 && (
            <button
              type="button"
              onClick={handleBackNavigation}
              className="sub-back-link"
              aria-label="Go back to previous step"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Mobile Accordion Summary Bar (Visible on mobile only, steps 1-3) */}
        {currentStep <= 3 && (
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
              className="sub-mobile-summary-trigger"
            >
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-[#84FF00]" />
                <span>Order Summary: <strong className="text-white">{selectedPlan.name}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#84FF00] font-black">₹{finalPayableTotal}</span>
                {mobileSummaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {mobileSummaryOpen && (
              <div className="p-4 bg-[#080e05] border-b border-white/10 space-y-3">
                <div className="sub-summary-line">
                  <span>Subtotal ({selectedPlan.name} {billingCycle})</span>
                  <span>₹{pricing.subtotal}</span>
                </div>
                <div className="sub-summary-line">
                  <span>18% GST (Included)</span>
                  <span>₹{pricing.gstAmount}</span>
                </div>
                {appliedCoupon && (
                  <div className="sub-summary-line text-[#84FF00]">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="sub-summary-line total">
                  <span>Total Amount</span>
                  <span className="text-[#84FF00]">₹{finalPayableTotal}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Shared Global Navbar */}
      <Navbar />

      {/* MAIN CONTENT AREA: 2-COLUMN LAYOUT (DESKTOP) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {/* Not Signed In Banner */}
        {!authChecking && !session && currentStep <= 3 && (
          <div className="sub-card mb-8 border-[#FFD60A]/40 bg-[#FFD60A]/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#FFD60A]/20 text-[#FFD60A] flex items-center justify-center shrink-0">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Sign In Required</h3>
                <p className="text-white/60 text-sm">
                  Please sign in to link your membership to your KSAM Deal account.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRequireLogin}
              className="sub-btn-primary sm:w-auto shrink-0 !bg-[#FFD60A] !text-black !py-2.5 !px-6"
            >
              Sign In to Continue →
            </button>
          </div>
        )}

        {/* Already on Same Plan Banner */}
        {isCurrentPlanActive && currentStep <= 3 && (
          <div className="sub-card mb-8 border-[#84FF00]/40 bg-[#84FF00]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-[#84FF00] shrink-0" />
              <div>
                <h4 className="text-white font-bold text-base">You're already on this plan!</h4>
                <p className="text-white/70 text-sm">
                  Your active <strong>{selectedPlan.name}</strong> membership is valid until{" "}
                  {activeSub.end_date ? new Date(activeSub.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "current cycle"}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`${BASE_URL}profile.html#subscription`}
                className="sub-btn-secondary !text-xs !py-2"
              >
                View in Profile
              </a>
              {selectedPlan.slug !== "pro" && (
                <button
                  type="button"
                  onClick={() => setSelectedPlanSlug("pro")}
                  className="sub-btn-primary !text-xs !py-2 !px-4"
                >
                  Upgrade to Pro →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Upgrade Notice */}
        {upgradeNotice && upgradeNotice.type === "upgrade" && currentStep <= 3 && (
          <div className="sub-card mb-8 border-sky-400/30 bg-sky-400/10 flex items-center gap-3">
            <Sparkles size={20} className="text-sky-400 shrink-0" />
            <p className="text-xs sm:text-sm text-sky-200">
              {upgradeNotice.message}
            </p>
          </div>
        )}

        {/* 2-COLUMN GRID (STEPS 1, 2, 3) */}
        {currentStep <= 3 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT PANEL (~65% / 7.5 COLS) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              {/* ================= STEP 1: PLAN SELECTION ================= */}
              {currentStep === 1 && (
                <div className="sub-card space-y-6">
                  {/* Step Title & Monthly/Yearly Toggle */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div>
                      <span className="text-xs font-bold text-[#84FF00] tracking-wider uppercase">Step 1 of 3</span>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Select Your Deal Mode</h1>
                      <p className="text-sm text-white/50 mt-1">Unlock real-time price tracking, deal alerts, and intelligent recommendations.</p>
                    </div>

                    {/* Monthly / Yearly Switcher */}
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setBillingCycle("monthly")}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                          billingCycle === "monthly" ? "bg-[#84FF00] text-black shadow-sm" : "text-white/60 hover:text-white"
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingCycle("yearly")}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                          billingCycle === "yearly" ? "bg-[#84FF00] text-black shadow-sm" : "text-white/60 hover:text-white"
                        }`}
                      >
                        <span>Yearly</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${billingCycle === "yearly" ? "bg-black text-[#84FF00]" : "bg-[#FFD60A] text-black"}`}>
                          Save 20%
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Selectable Plan Cards */}
                  <div className="sub-plan-grid">
                    {PLANS.map((plan) => {
                      const isSelected = plan.slug === selectedPlan.slug;
                      const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
                      const period = billingCycle === "yearly" ? "/year" : "/month";

                      return (
                        <div
                          key={plan.slug}
                          onClick={() => setSelectedPlanSlug(plan.slug)}
                          className={`sub-plan-card ${isSelected ? "is-selected" : ""}`}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              setSelectedPlanSlug(plan.slug);
                            }
                          }}
                        >
                          {plan.popular && (
                            <div className="sub-plan-popular-badge">
                              Most Popular
                            </div>
                          )}

                          <div>
                            {/* Card Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center border"
                                style={{
                                  backgroundColor: `${plan.accent}15`,
                                  borderColor: `${plan.accent}30`,
                                  color: plan.accent
                                }}
                              >
                                <PlanIcon icon={plan.icon} size={20} />
                              </div>
                              <div className="sub-plan-radio">
                                {isSelected && <div className="sub-plan-radio-dot" />}
                              </div>
                            </div>

                            <h3 className="text-lg font-extrabold text-white">{plan.name}</h3>
                            <p className="text-xs text-white/50 mt-1 min-h-[32px]">{plan.description}</p>

                            {/* Price */}
                            <div className="my-4 pb-4 border-b border-white/10">
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl sm:text-3xl font-black text-white">
                                  {price === 0 ? "Free" : `₹${price}`}
                                </span>
                                {price > 0 && (
                                  <span className="text-xs text-white/40">{period}</span>
                                )}
                              </div>
                              {billingCycle === "yearly" && price > 0 && (
                                <span className="text-[11px] text-[#84FF00] font-bold mt-1 inline-block">
                                  ₹{Math.round(price / 12)}/mo billed annually
                                </span>
                              )}
                            </div>

                            {/* Features Checklist */}
                            <ul className="space-y-2.5 text-xs text-white/70">
                              {plan.features.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Check size={14} className="text-[#84FF00] shrink-0 mt-0.5" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mt-6 pt-4 border-t border-white/5">
                            <span className={`text-xs font-bold block text-center py-2 rounded-lg transition-all ${
                              isSelected ? "bg-[#84FF00] text-black" : "bg-white/5 text-white/70"
                            }`}>
                              {isSelected ? "Selected Plan" : "Choose Plan"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Expandable Compare Plans Matrix */}
                  <div className="pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowCompareModal(!showCompareModal)}
                      className="text-xs font-bold text-[#84FF00] hover:underline inline-flex items-center gap-1.5"
                    >
                      <Info size={14} />
                      <span>{showCompareModal ? "Hide full plan comparison" : "Compare all plans side-by-side"}</span>
                      {showCompareModal ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showCompareModal && (
                      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4">
                        <table className="sub-compare-table">
                          <thead>
                            <tr>
                              <th>Feature</th>
                              <th>Explorer</th>
                              <th className="text-[#84FF00]">Deal Hunter</th>
                              <th className="text-purple-400">Pro</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Deal Search &amp; Price Comparison</td>
                              <td><Check size={14} className="text-white/60" /></td>
                              <td><Check size={14} className="text-[#84FF00]" /></td>
                              <td><Check size={14} className="text-[#84FF00]" /></td>
                            </tr>
                            <tr>
                              <td>Price Drop Instant Alerts</td>
                              <td className="text-white/30">—</td>
                              <td>5 Active Alerts</td>
                              <td>Unlimited Alerts</td>
                            </tr>
                            <tr>
                              <td>Multi-Store Tracker (Amazon, Flipkart)</td>
                              <td className="text-white/30">—</td>
                              <td><Check size={14} className="text-[#84FF00]" /></td>
                              <td><Check size={14} className="text-[#84FF00]" /></td>
                            </tr>
                            <tr>
                              <td>AI Personalized Recommendations</td>
                              <td className="text-white/30">—</td>
                              <td className="text-white/30">—</td>
                              <td><Check size={14} className="text-[#84FF00]" /></td>
                            </tr>
                            <tr>
                              <td>Priority Customer Support</td>
                              <td>Community</td>
                              <td>Standard</td>
                              <td>24/7 Dedicated</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Continue Button to Step 2 */}
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleStep1Continue}
                      className="sub-btn-primary"
                    >
                      <span>Continue to Your Details</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ================= STEP 2: YOUR DETAILS ================= */}
              {currentStep === 2 && (
                <div className="sub-card space-y-6">
                  <div className="pb-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#84FF00] tracking-wider uppercase">Step 2 of 3</span>
                      <h2 className="text-2xl font-extrabold text-white mt-1">Your Billing &amp; Contact Details</h2>
                      <p className="text-sm text-white/50 mt-1">We need this information to generate your tax invoice and verify your account.</p>
                    </div>
                  </div>

                  <form onSubmit={handleStep2Continue} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="sub-input-group">
                        <label className="sub-label">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={details.name}
                          onChange={(e) => handleFieldChange("name", e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className={`sub-input ${formErrors.name ? "has-error" : ""}`}
                        />
                        {formErrors.name && <span className="sub-input-error">{formErrors.name}</span>}
                      </div>

                      {/* Email Address */}
                      <div className="sub-input-group">
                        <label className="sub-label">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={details.email}
                          onChange={(e) => handleFieldChange("email", e.target.value)}
                          placeholder="name@example.com"
                          className={`sub-input ${formErrors.email ? "has-error" : ""}`}
                        />
                        {formErrors.email && <span className="sub-input-error">{formErrors.email}</span>}
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="sub-input-group">
                      <label className="sub-label">10-Digit Mobile Number *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm font-bold select-none">+91</span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={details.phone}
                          onChange={(e) => handleFieldChange("phone", e.target.value.replace(/[^0-9]/g, ""))}
                          placeholder="9876543210"
                          className={`sub-input !pl-14 ${formErrors.phone ? "has-error" : ""}`}
                        />
                      </div>
                      {formErrors.phone && <span className="sub-input-error">{formErrors.phone}</span>}
                    </div>

                    {/* Street Address */}
                    <div className="sub-input-group">
                      <label className="sub-label">Street / House / Building Address *</label>
                      <input
                        type="text"
                        required
                        value={details.line1}
                        onChange={(e) => handleFieldChange("line1", e.target.value)}
                        placeholder="e.g. Flat 402, Green Heights, MG Road"
                        className={`sub-input ${formErrors.line1 ? "has-error" : ""}`}
                      />
                      {formErrors.line1 && <span className="sub-input-error">{formErrors.line1}</span>}
                    </div>

                    {/* Address Line 2 (Optional) */}
                    <div className="sub-input-group">
                      <label className="sub-label">Apartment / Landmark (Optional)</label>
                      <input
                        type="text"
                        value={details.line2}
                        onChange={(e) => handleFieldChange("line2", e.target.value)}
                        placeholder="Near Metro Station"
                        className="sub-input"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* City */}
                      <div className="sub-input-group">
                        <label className="sub-label">City *</label>
                        <input
                          type="text"
                          required
                          value={details.city}
                          onChange={(e) => handleFieldChange("city", e.target.value)}
                          placeholder="Mumbai"
                          className={`sub-input ${formErrors.city ? "has-error" : ""}`}
                        />
                        {formErrors.city && <span className="sub-input-error">{formErrors.city}</span>}
                      </div>

                      {/* State Dropdown */}
                      <div className="sub-input-group">
                        <label className="sub-label">State *</label>
                        <select
                          value={details.state}
                          onChange={(e) => handleFieldChange("state", e.target.value)}
                          className={`sub-input ${formErrors.state ? "has-error" : ""}`}
                        >
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s} className="bg-[#0e1709] text-white">
                              {s}
                            </option>
                          ))}
                        </select>
                        {formErrors.state && <span className="sub-input-error">{formErrors.state}</span>}
                      </div>

                      {/* PIN Code */}
                      <div className="sub-input-group">
                        <label className="sub-label">6-Digit PIN Code *</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={details.pincode}
                          onChange={(e) => handleFieldChange("pincode", e.target.value.replace(/[^0-9]/g, ""))}
                          placeholder="400001"
                          className={`sub-input ${formErrors.pincode ? "has-error" : ""}`}
                        />
                        {formErrors.pincode && <span className="sub-input-error">{formErrors.pincode}</span>}
                      </div>
                    </div>

                    {/* GSTIN (Optional) */}
                    <div className="sub-input-group">
                      <label className="sub-label">GST Number (Optional, for Business Tax Credit)</label>
                      <input
                        type="text"
                        maxLength={15}
                        value={details.gstNumber}
                        onChange={(e) => handleFieldChange("gstNumber", e.target.value.toUpperCase())}
                        placeholder="27AAAAA0000A1Z5"
                        className={`sub-input ${formErrors.gstNumber ? "has-error" : ""}`}
                      />
                      {formErrors.gstNumber && <span className="sub-input-error">{formErrors.gstNumber}</span>}
                    </div>

                    {/* Save to Profile Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer text-xs text-white/70 select-none">
                        <input
                          type="checkbox"
                          checked={details.saveToProfile}
                          onChange={(e) => handleFieldChange("saveToProfile", e.target.checked)}
                          className="h-4 w-4 rounded accent-[#84FF00] bg-black/40 border-white/20"
                        />
                        <span>Save these details to my KSAM Deal profile for 1-click future renewals and orders.</span>
                      </label>
                    </div>

                    {/* Action Row */}
                    <div className="pt-4 flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="sub-btn-secondary"
                      >
                        <ArrowLeft size={14} />
                        <span>Change Plan</span>
                      </button>

                      <button
                        type="submit"
                        className="sub-btn-primary sm:w-auto"
                      >
                        <span>Continue to Payment</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ================= STEP 3: PAYMENT ================= */}
              {currentStep === 3 && (
                <div className="sub-card space-y-6">
                  <div className="pb-6 border-b border-white/10">
                    <span className="text-xs font-bold text-[#84FF00] tracking-wider uppercase">Step 3 of 3</span>
                    <h2 className="text-2xl font-extrabold text-white mt-1">Select Payment Method</h2>
                    <p className="text-sm text-white/50 mt-1">
                      Choose your preferred method. You will complete your payment securely in the official Razorpay checkout window.
                    </p>
                  </div>

                  {/* Informational Payment Method Radio Rows */}
                  <div className="sub-payment-methods">
                    {/* UPI */}
                    <div
                      onClick={() => setPreferredMethod("upi")}
                      className={`sub-payment-row ${preferredMethod === "upi" ? "is-selected" : ""}`}
                      role="radio"
                      aria-checked={preferredMethod === "upi"}
                      tabIndex={0}
                    >
                      <div className="sub-payment-info">
                        <div className="sub-payment-icon">
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-white">UPI</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#84FF00]/15 text-[#84FF00]">Fastest</span>
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">Google Pay, PhonePe, Paytm, BHIM, and any UPI app</p>
                        </div>
                      </div>
                      <div className="sub-plan-radio">
                        {preferredMethod === "upi" && <div className="sub-plan-radio-dot" />}
                      </div>
                    </div>

                    {/* Cards */}
                    <div
                      onClick={() => setPreferredMethod("card")}
                      className={`sub-payment-row ${preferredMethod === "card" ? "is-selected" : ""}`}
                      role="radio"
                      aria-checked={preferredMethod === "card"}
                      tabIndex={0}
                    >
                      <div className="sub-payment-info">
                        <div className="sub-payment-icon">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-white">Credit &amp; Debit Cards</h4>
                          <p className="text-xs text-white/50 mt-0.5">Visa, Mastercard, RuPay, American Express</p>
                        </div>
                      </div>
                      <div className="sub-plan-radio">
                        {preferredMethod === "card" && <div className="sub-plan-radio-dot" />}
                      </div>
                    </div>

                    {/* Netbanking */}
                    <div
                      onClick={() => setPreferredMethod("netbanking")}
                      className={`sub-payment-row ${preferredMethod === "netbanking" ? "is-selected" : ""}`}
                      role="radio"
                      aria-checked={preferredMethod === "netbanking"}
                      tabIndex={0}
                    >
                      <div className="sub-payment-info">
                        <div className="sub-payment-icon">
                          <Building size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-white">Netbanking</h4>
                          <p className="text-xs text-white/50 mt-0.5">50+ major Indian banks supported (HDFC, ICICI, SBI, Axis, etc.)</p>
                        </div>
                      </div>
                      <div className="sub-plan-radio">
                        {preferredMethod === "netbanking" && <div className="sub-plan-radio-dot" />}
                      </div>
                    </div>

                    {/* Wallets */}
                    <div
                      onClick={() => setPreferredMethod("wallet")}
                      className={`sub-payment-row ${preferredMethod === "wallet" ? "is-selected" : ""}`}
                      role="radio"
                      aria-checked={preferredMethod === "wallet"}
                      tabIndex={0}
                    >
                      <div className="sub-payment-info">
                        <div className="sub-payment-icon">
                          <Wallet size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-white">Wallets</h4>
                          <p className="text-xs text-white/50 mt-0.5">Paytm, Mobikwik, and other supported wallets</p>
                        </div>
                      </div>
                      <div className="sub-plan-radio">
                        {preferredMethod === "wallet" && <div className="sub-plan-radio-dot" />}
                      </div>
                    </div>
                  </div>

                  {/* Informational Security Notice */}
                  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] flex items-start gap-3 text-xs text-white/60">
                    <Lock size={16} className="text-[#84FF00] shrink-0 mt-0.5" />
                    <p>
                      <strong>Zero Storage Guarantee:</strong> KSAM Deal never collects or stores your card number, CVV, expiry date, or UPI PIN. You will enter your payment details securely inside the official 256-bit encrypted Razorpay window.
                    </p>
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer text-xs text-white/70 select-none">
                      <input
                        type="checkbox"
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#84FF00] bg-black/40 border-white/20 mt-0.5 shrink-0"
                      />
                      <span>
                        I agree to KSAM Deal's{" "}
                        <a href={`${BASE_URL}terms.html`} target="_blank" rel="noopener noreferrer" className="text-[#84FF00] underline">
                          Terms of Service
                        </a>
                        ,{" "}
                        <a href={`${BASE_URL}privacy-policy.html`} target="_blank" rel="noopener noreferrer" className="text-[#84FF00] underline">
                          Privacy Policy
                        </a>
                        , and{" "}
                        <a href={`${BASE_URL}refund-policy.html`} target="_blank" rel="noopener noreferrer" className="text-[#84FF00] underline">
                          Refund &amp; Cancellation Policy
                        </a>
                        .
                      </span>
                    </label>
                  </div>

                  {/* Error Banner */}
                  {paymentError && (
                    <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-200 text-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{paymentError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handlePaymentSubmit}
                        className="px-3 py-1 rounded bg-red-500 text-white font-bold text-[11px] hover:bg-red-600 transition shrink-0"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Action Row */}
                  <div className="pt-4 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      disabled={isProcessingPayment}
                      onClick={() => setCurrentStep(2)}
                      className="sub-btn-secondary"
                    >
                      <ArrowLeft size={14} />
                      <span>Back to Details</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessingPayment || (finalPayableTotal > 0 && !termsAgreed)}
                      onClick={handlePaymentSubmit}
                      className="sub-btn-primary sm:w-auto"
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Connecting to Razorpay...</span>
                        </>
                      ) : finalPayableTotal === 0 ? (
                        <>
                          <Check size={16} />
                          <span>Activate Free Plan</span>
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          <span>Pay ₹{finalPayableTotal} with Razorpay</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* FAQ Accordion under checkout */}
              <div className="sub-card">
                <h3 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
                  <HelpCircle size={18} className="text-[#84FF00]" />
                  <span>Frequently Asked Questions</span>
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      id: "faq-1",
                      q: "Can I cancel my membership at any time?",
                      a: "Yes. You can cancel with 1 click directly from your Account Hub > Subscription tab anytime. You will retain all benefits until your current billing period ends."
                    },
                    {
                      id: "faq-2",
                      q: "How does renewal work?",
                      a: "Memberships renew automatically at standard plan pricing. We send you a reminder alert 3 days before renewal. You can disable auto-renewal anytime in your profile settings."
                    },
                    {
                      id: "faq-3",
                      q: "Are refunds available?",
                      a: "Digital memberships can be cancelled anytime. For detailed terms regarding refund eligibility and cooling-off windows, please review our Refund & Cancellation Policy."
                    },
                    {
                      id: "faq-4",
                      q: "Can I get a GST tax invoice?",
                      a: "Yes. Simply enter your company GSTIN during Step 2 of checkout. Your itemized 18% GST tax invoice will be available to download instantly in your profile."
                    }
                  ].map((faq) => {
                    const isOpen = activeFaq === faq.id;
                    return (
                      <div key={faq.id} className="sub-faq-item">
                        <button
                          type="button"
                          onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                          className="sub-faq-trigger"
                          aria-expanded={isOpen}
                        >
                          <span>{faq.q}</span>
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {isOpen && <div className="sub-faq-body">{faq.a}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (~35% / 4.5 COLS): SUMMARY CARD */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sub-card sub-summary-sticky space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Order Summary</h3>
                  <p className="text-xs text-white/50 mt-0.5">Transparent billing. No hidden fees.</p>
                </div>

                {/* Selected Plan Banner */}
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${selectedPlan.accent}20`, color: selectedPlan.accent }}
                    >
                      <PlanIcon icon={selectedPlan.icon} size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{selectedPlan.name}</h4>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/70 capitalize inline-block mt-0.5">
                        {billingCycle} billing
                      </span>
                    </div>
                  </div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-[#84FF00] font-bold hover:underline"
                    >
                      Change
                    </button>
                  )}
                </div>

                {/* Itemized Calculation */}
                <div className="space-y-2.5 text-xs">
                  <div className="sub-summary-line">
                    <span>Base Plan Price</span>
                    <span>₹{pricing.subtotal}</span>
                  </div>
                  <div className="sub-summary-line">
                    <span className="flex items-center gap-1">
                      <span>18% GST (Included)</span>
                      <Info size={12} className="text-white/40" title="18% Goods & Services Tax" />
                    </span>
                    <span>₹{pricing.gstAmount}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="sub-summary-line text-[#84FF00] font-bold">
                      <div className="flex items-center gap-1.5">
                        <Tag size={12} />
                        <span>Discount ({appliedCoupon.code})</span>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-white/40 hover:text-white ml-1"
                          title="Remove coupon"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="sub-summary-line total">
                    <span>Total Amount</span>
                    <span className="text-[#84FF00] font-black">₹{finalPayableTotal}</span>
                  </div>
                </div>

                {/* Pre-filled Editable Email Input in Summary */}
                <div className="sub-input-group pt-2 border-t border-white/10">
                  <label className="sub-label">Receipt Email</label>
                  <input
                    type="email"
                    value={details.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="name@example.com"
                    className="sub-input !py-2.5 !text-xs"
                  />
                </div>

                {/* Marketing Consent Checkbox */}
                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-white/60 select-none">
                    <input
                      type="checkbox"
                      checked={marketingConsent}
                      onChange={(e) => setMarketingConsent(e.target.checked)}
                      className="h-3.5 w-3.5 rounded accent-[#84FF00] bg-black/40 border-white/20 mt-0.5 shrink-0"
                    />
                    <span>Send me curated deal alerts, flash sale warnings, and special offers.</span>
                  </label>
                </div>

                {/* Coupon Code Box */}
                {pricing.basePrice > 0 && (
                  <div className="pt-2 border-t border-white/10">
                    <label className="sub-label mb-1.5 block">Have a coupon code?</label>
                    <div className="sub-coupon-wrap">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        placeholder="e.g. KSAM20"
                        className="sub-coupon-input"
                      />
                      <button
                        type="button"
                        disabled={couponValidating || !couponInput.trim()}
                        onClick={() => handleValidateCoupon()}
                        className="sub-coupon-btn"
                      >
                        {couponValidating ? "Verifying..." : "Apply"}
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[11px] text-red-400 font-semibold mt-1.5 flex items-center gap-1">
                        <AlertCircle size={12} />
                        <span>{couponError}</span>
                      </p>
                    )}

                    {appliedCoupon && (
                      <p className="text-[11px] text-[#84FF00] font-semibold mt-1.5 flex items-center gap-1">
                        <Check size={12} />
                        <span>{appliedCoupon.description || `Coupon ${appliedCoupon.code} applied!`}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Primary CTA Button (in right column) */}
                <div className="pt-2">
                  {currentStep === 1 ? (
                    <button
                      type="button"
                      onClick={handleStep1Continue}
                      className="sub-btn-primary"
                    >
                      <span>Continue to Details</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : currentStep === 2 ? (
                    <button
                      type="button"
                      onClick={handleStep2Continue}
                      className="sub-btn-primary"
                    >
                      <span>Continue to Payment</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isProcessingPayment || (finalPayableTotal > 0 && !termsAgreed)}
                      onClick={handlePaymentSubmit}
                      className="sub-btn-primary"
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : finalPayableTotal === 0 ? (
                        <span>Activate Free Plan</span>
                      ) : (
                        <span>Pay ₹{finalPayableTotal} Now</span>
                      )}
                    </button>
                  )}
                </div>

                {/* Safe & Secure Payments Card */}
                <div className="sub-trust-box space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#84FF00]" />
                    <span className="text-xs font-bold text-white">Safe &amp; Secure Payments</span>
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    Payments are processed securely by Razorpay. 256-bit bank-grade encryption protects your transaction.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["UPI", "Visa", "Mastercard", "RuPay", "Netbanking", "Wallets"].map((m) => (
                      <span key={m} className="sub-trust-pill">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= STEP 4: SUCCESS SCREEN ================= */
          <div className="max-w-2xl mx-auto sub-card text-center py-10 sm:py-14 space-y-6">
            <div className="sub-success-check">
              <Check size={40} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#84FF00] tracking-wider uppercase">Order Confirmed</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Welcome to {completedSub?.plan_name}!</h1>
              <p className="text-sm text-white/60 max-w-md mx-auto">
                Your payment was verified successfully. All membership features have been unlocked on your account.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-black/40 text-left space-y-3 max-w-lg mx-auto text-xs">
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-white/50">Payment ID</span>
                <span className="font-mono font-bold text-white">{completedSub?.payment_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-white/50">Order Reference</span>
                <span className="font-mono text-white/80">{completedSub?.order_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-white/50">Plan &amp; Cycle</span>
                <span className="font-bold text-white">{completedSub?.plan_name} ({completedSub?.billing_cycle})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-white/50">Amount Paid</span>
                <span className="font-extrabold text-[#84FF00] text-sm">₹{completedSub?.amount_paid}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-white/50">Valid Until</span>
                <span className="font-bold text-white">
                  {new Date(completedSub?.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <a
                href={`${BASE_URL}profile.html#subscription`}
                className="sub-btn-primary sm:w-auto !py-3 !px-6"
              >
                <span>View My Subscription</span>
                <ArrowRight size={16} />
              </a>

              <a
                href={`${BASE_URL}products.html`}
                className="sub-btn-secondary sm:w-auto !py-3 !px-6"
              >
                <span>Explore Deals</span>
              </a>

              <button
                type="button"
                onClick={() => setShowReceiptModal(true)}
                className="sub-btn-secondary sm:w-auto !py-3 !px-6"
              >
                <Printer size={16} />
                <span>Download Receipt</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MOBILE STICKY BOTTOM PAY BAR (Steps 1-3) */}
      {currentStep <= 3 && (
        <div className="sub-mobile-sticky-bar lg:hidden">
          <div>
            <span className="text-[10px] text-white/50 block font-bold uppercase tracking-wider">Total Payable</span>
            <span className="text-lg font-black text-[#84FF00]">₹{finalPayableTotal}</span>
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
            className="sub-btn-primary !w-auto !py-3 !px-6"
          >
            {currentStep === 1 ? (
              <span>Continue →</span>
            ) : currentStep === 2 ? (
              <span>Proceed to Pay →</span>
            ) : isProcessingPayment ? (
              <span>Processing...</span>
            ) : (
              <span>Pay ₹{finalPayableTotal}</span>
            )}
          </button>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {showReceiptModal && completedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1709] border border-white/20 rounded-2xl max-w-lg w-full p-6 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#84FF00]" />
                <h3 className="font-bold text-base">Tax Invoice &amp; Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60"
              >
                <X size={16} />
              </button>
            </div>

            <div id="sub-printable-receipt" className="space-y-3 text-xs p-4 bg-black/40 rounded-xl">
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <div>
                  <h4 className="font-extrabold text-sm text-white">KSAM Deal E-Commerce</h4>
                  <p className="text-[10px] text-white/50">Sold by KSAM Deal • GSTIN: 27AAAAA0000A1Z5</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#84FF00]/15 text-[#84FF00] font-bold text-[10px]">PAID</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-white/70">
                <div>
                  <span className="block text-white/40">Billed To:</span>
                  <strong className="text-white">{completedSub.customer_name || "Customer"}</strong>
                  <p>{completedSub.customer_email}</p>
                </div>
                <div className="text-right">
                  <span className="block text-white/40">Invoice Date:</span>
                  <strong>{new Date().toLocaleDateString("en-IN")}</strong>
                  <p>Order #{completedSub.order_id}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-1">
                <div className="flex justify-between text-white/80">
                  <span>{completedSub.plan_name} Membership ({completedSub.billing_cycle})</span>
                  <span>₹{completedSub.amount_paid}</span>
                </div>
                <div className="flex justify-between text-[11px] text-white/50">
                  <span>18% Integrated GST</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-white/10">
                  <span>Grand Total</span>
                  <span className="text-[#84FF00]">₹{completedSub.amount_paid}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="sub-btn-primary !w-auto !py-2 !px-4 text-xs"
              >
                <Printer size={14} />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEGAL FOOTER AREA */}
      <footer className="border-t border-white/10 bg-[#040802] mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-xs text-white/50 max-w-2xl mx-auto">
            By proceeding, you agree to the{" "}
            <a href={`${BASE_URL}terms.html`} className="text-white/80 hover:text-[#84FF00] underline">
              Terms of Service
            </a>
            ,{" "}
            <a href={`${BASE_URL}privacy-policy.html`} className="text-white/80 hover:text-[#84FF00] underline">
              Privacy Policy
            </a>
            , and the{" "}
            <a href={`${BASE_URL}refund-policy.html`} className="text-white/80 hover:text-[#84FF00] underline">
              Refund &amp; Cancellation Policy
            </a>
            .
          </p>

          <p className="text-xs font-semibold text-white/70">
            Sold by KSAM Deal. All rights reserved © {new Date().getFullYear()}.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/60">
            <a href={`${BASE_URL}terms.html`} className="hover:text-[#84FF00] transition">
              Terms
            </a>
            <span>•</span>
            <a href={`${BASE_URL}privacy-policy.html`} className="hover:text-[#84FF00] transition">
              Privacy
            </a>
            <span>•</span>
            <a href={`${BASE_URL}refund-policy.html`} className="hover:text-[#84FF00] transition">
              Refund Policy
            </a>
            <span>•</span>
            <a href={`${BASE_URL}contact-us.html`} className="hover:text-[#84FF00] transition">
              Contact
            </a>
          </div>
        </div>
      </footer>

      {/* Global Toast */}
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
