import React from "react";
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  UserPlus,
  LogIn,
  Sparkles,
  Bell,
  MapPin,
  Clock,
  Layers,
  CheckCircle2
} from "lucide-react";
import { BASE_URL, validateReturnTo } from "../../auth/auth.js";

export default function SignedOutGate() {
  const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : `${BASE_URL}profile.html`;
  const validatedReturn = validateReturnTo(currentPath) || `${BASE_URL}profile.html`;
  const bannerCoverImg = `${BASE_URL}lamplight.png`;

  const loginUrl = `${BASE_URL}login.html?next=${encodeURIComponent(validatedReturn)}`;
  const signUpUrl = `${BASE_URL}signUp.html?next=${encodeURIComponent(validatedReturn)}`;

  return (
    <div className="ks-signed-out-gate" aria-label="Sign in required to access profile">
      {/* 1. Hero Section for Signed-Out Visitors */}
      <section className="ks-hero-section relative overflow-hidden">
        {/* Animated Mesh Background */}
        <div className="kx-mesh-bg" aria-hidden="true">
          <div className="kx-mesh-circle-1" />
          <div className="kx-mesh-circle-2" />
          <div className="kx-mesh-circle-3" />
        </div>

        {/* Micro Grain */}
        <div className="kx-noise-overlay" aria-hidden="true" />

        {/* Blended Background Cover */}
        <div className="ks-hero-cover-bg" aria-hidden="true">
          <img
            src={bannerCoverImg}
            alt=""
            loading="lazy"
            className="ks-hero-cover-img"
          />
          <div className="ks-hero-cover-overlay" />
        </div>

        <div className="ks-hero-content-wrapper flex flex-col items-center justify-center relative z-10 py-16 sm:py-24 text-center max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#22FF88]/10 border border-[#22FF88]/30 text-xs font-bold text-[#22FF88] mb-6">
            <Lock size={13} />
            <span>KSAM Deal Member Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
            Unlock Your Personal <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2DFFB2] via-[#26D9F8] to-[#8B7CFF]">
              Shopping & Alert Center
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#C0CAD8] max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Sign in to access real-time price alerts on tracked deals, rapid one-click address checkouts, browsing history across Indian stores, and custom notification controls.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={loginUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#2DFFB2] to-[#25C9F7] text-[#05070B] font-extrabold text-sm hover:shadow-[0_0_30px_rgba(45,255,178,0.4)] hover:scale-[1.02] transition"
            >
              <LogIn size={18} />
              <span>Sign In to Account</span>
            </a>

            <a
              href={signUpUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm transition"
            >
              <UserPlus size={18} />
              <span>Create Free Account</span>
              <ArrowRight size={14} />
            </a>
          </div>

          {/* 3 Quick Value Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 text-left">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div className="h-9 w-9 rounded-xl bg-[#22FF88]/10 border border-[#22FF88]/20 flex items-center justify-center text-[#22FF88] mb-2.5">
                <Bell size={18} />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Instant Price Alerts</h4>
              <p className="text-xs text-gray-400">Set target prices and get notified the second drops go live.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div className="h-9 w-9 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/20 flex items-center justify-center text-[#38BDF8] mb-2.5">
                <MapPin size={18} />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Saved Pin Codes</h4>
              <p className="text-xs text-gray-400">Store delivery addresses to check delivery eligibility faster.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div className="h-9 w-9 rounded-xl bg-[#FFD60A]/10 border border-[#FFD60A]/20 flex items-center justify-center text-[#FFD60A] mb-2.5">
                <ShieldCheck size={18} />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">DPDP 2023 Compliant</h4>
              <p className="text-xs text-gray-400">End-to-end encrypted profile data and total privacy controls.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Blurred Preview of Profile Sections Behind Gate */}
      <div className="ks-gate-preview-container relative overflow-hidden" aria-hidden="true">
        <div className="ks-gate-preview-blur">
          {/* Simulated Sections for visual depth */}
          <div className="ks-section-band py-16 px-6 max-w-6xl mx-auto">
            <div className="h-10 w-48 bg-white/10 rounded-xl mb-4" />
            <div className="h-4 w-96 bg-white/5 rounded-lg mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-48 rounded-2xl bg-white/[0.03] border border-white/5" />
              <div className="h-48 rounded-2xl bg-white/[0.03] border border-white/5" />
              <div className="h-48 rounded-2xl bg-white/[0.03] border border-white/5" />
            </div>
          </div>
        </div>

        {/* Overlay gradient mask */}
        <div className="ks-gate-preview-gradient-overlay flex items-center justify-center">
          <div className="text-center p-8 rounded-3xl bg-[#0a0e14]/90 border border-white/15 backdrop-blur-xl max-w-md shadow-2xl">
            <Sparkles size={28} className="text-[#22FF88] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Signed-Out Preview</h3>
            <p className="text-xs text-gray-400 mb-5">
              Sign in with your email or Google account to load your saved data and custom dashboard.
            </p>
            <a
              href={loginUrl}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#22FF88] text-black font-extrabold text-xs hover:opacity-90 transition"
            >
              <LogIn size={15} />
              <span>Sign In Now</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
