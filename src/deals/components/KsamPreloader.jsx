import React, { useState, useEffect, useRef, useMemo } from "react";
import { Sparkles, Flame, Percent, ShoppingBag, ShieldCheck } from "lucide-react";
import "./KsamPreloader.css";

const STATUS_STEPS = [
  { threshold: 0, text: "Initializing deal discovery engine..." },
  { threshold: 28, text: "Scanning top verified retailers..." },
  { threshold: 58, text: "Curating best discounts & price drops..." },
  { threshold: 88, text: "Finalizing your experience..." },
  { threshold: 98, text: "Welcome to KSAM Deal" }
];

export function KsamPreloader({ isExiting = false, onComplete }) {
  const [internalProgress, setInternalProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(STATUS_STEPS[0].text);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  // Deterministic micro-particles for the background
  const particles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: `${(i * 7 + 11) % 90 + 5}%`,
      top: `${(i * 13 + 23) % 80 + 10}%`,
      size: `${(i % 3) * 1.5 + 2.5}px`,
      color: i % 2 === 0 ? "rgba(34, 255, 136, 0.75)" : "rgba(56, 189, 248, 0.75)",
      delay: `${(i * 0.45).toFixed(2)}s`,
      duration: `${(6 + (i % 4)).toFixed(1)}s`
    }));
  }, []);

  useEffect(() => {
    const DURATION = 1800; // 1.8 seconds smooth cinematic assembly

    const updateProgress = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progressFraction = Math.min(1, elapsed / DURATION);

      // Ease out cubic for a fluid deceleration toward 100%
      const easedProgress = 1 - Math.pow(1 - progressFraction, 3);
      const currentPct = Math.min(100, Math.round(easedProgress * 100));

      setInternalProgress(currentPct);

      // Update status message naturally based on current progress
      for (let i = STATUS_STEPS.length - 1; i >= 0; i--) {
        if (currentPct >= STATUS_STEPS[i].threshold) {
          setCurrentStatus(STATUS_STEPS[i].text);
          break;
        }
      }

      if (progressFraction < 1) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        if (onComplete) {
          onComplete();
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onComplete]);

  return (
    <div
      className={`ksam-preloader-root ${isExiting ? "is-exiting" : ""}`}
      role="progressbar"
      aria-label="Loading KSAM Deal"
      aria-valuenow={internalProgress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* 1. Multi-Layer Animated Atmospheric Background */}
      <div className="ksam-loader-bg-aurora" aria-hidden="true">
        <div className="ksam-aurora-blob-1" />
        <div className="ksam-aurora-blob-2" />
        <div className="ksam-aurora-blob-3" />
        <div className="ksam-loader-grid-mesh" />

        {/* Ambient floating particles */}
        {particles.map((p) => (
          <span
            key={p.id}
            className="ksam-loader-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}`,
              animationDelay: p.delay,
              animationDuration: p.duration
            }}
          />
        ))}
      </div>

      {/* 2. Large Dynamic 3D Centerpiece */}
      <div className="ksam-loader-centerpiece-stage" aria-hidden="true">
        <div className="ksam-loader-gimbal">
          {/* Outer Multi-Ring Energy System */}
          <div className="ksam-orbit-ring ksam-orbit-ring-1" />
          <div className="ksam-orbit-ring ksam-orbit-ring-2" />
          <div className="ksam-orbit-ring ksam-orbit-ring-3" />

          {/* Radial Core Glow */}
          <div className="ksam-core-radial-glow" />

          {/* Central 3D Glass Energy Orb */}
          <div className="ksam-core-orb">
            <div className="ksam-core-emblem">
              {/* Futuristic KSAM Deal insignia SVG */}
              <svg
                viewBox="0 0 64 64"
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="ksamBagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22FF88" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                  <linearGradient id="ksamSpeedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22FF88" stopOpacity="0" />
                    <stop offset="100%" stopColor="#22FF88" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* Dynamic Speed Streaks */}
                <path d="M6 24 L20 24" stroke="url(#ksamSpeedGrad)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M10 32 L22 32" stroke="url(#ksamSpeedGrad)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M8 40 L21 40" stroke="url(#ksamSpeedGrad)" strokeWidth="2.5" strokeLinecap="round" />

                {/* Glowing Shopping Bag Body */}
                <path
                  d="M24 16 C24 8, 40 8, 40 16"
                  stroke="url(#ksamBagGrad)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <path
                  d="M18 18 L46 18 C48.5 18, 50.5 20, 50 22.5 L47 44 C46.5 46.5, 44.5 48, 42 48 L22 48 C19.5 48, 17.5 46.5, 17 44 L14 22.5 C13.5 20, 15.5 18, 18 18 Z"
                  fill="url(#ksamBagGrad)"
                  fillOpacity="0.25"
                  stroke="url(#ksamBagGrad)"
                  strokeWidth="2.4"
                />

                {/* Lightning Deal Bolt / Cart Icon Accent */}
                <path
                  d="M33 24 L27 33 L33 33 L31 42 L39 31 L33 31 Z"
                  fill="#FFFFFF"
                  stroke="#22FF88"
                  strokeWidth="0.8"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* 3. Floating Deal-Discovery Visual Elements */}
          {/* Badge 1: Hot Deal */}
          <div className="ksam-floating-badge ksam-badge-hot-deal">
            <Flame size={12} className="text-[#22FF88] animate-pulse" />
            <span>Hot Deal</span>
          </div>

          {/* Badge 2: Save More */}
          <div className="ksam-floating-badge ksam-badge-save-more">
            <Percent size={12} className="text-[#38BDF8]" />
            <span>Save More</span>
          </div>

          {/* Mini Product Card Silhouette 1 (Top Left) */}
          <div className="ksam-mini-card-1">
            <div className="ksam-mini-card-thumb" />
            <div className="ksam-mini-card-line" />
            <div className="ksam-mini-card-line short" />
          </div>

          {/* Mini Product Card Silhouette 2 (Bottom Right) */}
          <div className="ksam-mini-card-2">
            <div className="ksam-mini-card-thumb" />
            <div className="ksam-mini-card-line" />
            <div className="ksam-mini-card-line short" />
          </div>
        </div>
      </div>

      {/* 4. Branding and Typography */}
      <div className="ksam-loader-brand-wrap">
        <h1 className="ksam-loader-brand-title">
          <span className="ksam-word-ksam">KSAM</span>
          <span className="ksam-word-deal">DEAL</span>
        </h1>

        <p className="ksam-loader-tagline">
          <span>Discover</span>
          <span className="ksam-tagline-dot" />
          <span>Compare</span>
          <span className="ksam-tagline-dot" />
          <span>Save</span>
        </p>
      </div>

      {/* 5. Loading Progress Experience */}
      <div className="ksam-loader-progress-cluster">
        {/* Glowing Progress Track */}
        <div className="ksam-loader-track-bar">
          <div
            className="ksam-loader-fill-bar"
            style={{ width: `${internalProgress}%` }}
          />
        </div>

        {/* Status Message and Numeric Percentage */}
        <div className="ksam-loader-status-row">
          <span className="ksam-loader-status-msg" key={currentStatus}>
            {currentStatus}
          </span>
          <span className="ksam-loader-status-pct">
            {internalProgress}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default KsamPreloader;
