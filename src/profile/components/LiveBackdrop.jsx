import { useEffect, useRef } from "react";
import { respectReducedMotion } from "../../lib/motion.js";

/**
 * LiveBackdrop: Premium, futuristic, multi-layered cinematic animated background
 * for the KSAM Deal profile webpage.
 *
 * Architecture:
 * 1. Deep Midnight Base Layer (#06080D).
 * 2. Volumetric Organic Aurora Orbs (Hardware-accelerated CSS 3D transforms with
 *    emerald green, electric cyan, deep cosmic violet, royal blue, and subtle magenta).
 * 3. Atmospheric Sweeping Light Rays (Subtle rotating volumetric aurora beam).
 * 4. Desktop Interactive Cursor Aura (Smooth spring-interpolated glow tracking cursor).
 * 5. Micro Cosmic Stardust Particles (Lightweight 2D canvas with gentle drifting stardust).
 * 6. Film Grain SVG Noise & Technical Grid Overlay (Prevents digital banding).
 * 7. Central Readability Vignette (Maintains WCAG AA contrast for foreground content).
 */
export default function LiveBackdrop({
  palette = "default",
  accent = "green",
  isModalOpen = false
}) {
  const containerRef = useRef(null);
  const cursorAuraRef = useRef(null);
  const particleCanvasRef = useRef(null);

  // Desktop Pointer Tracking with Damped Spring / Lerp (Zero React re-renders)
  useEffect(() => {
    const isReduced = respectReducedMotion();
    const isFinePointer =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (isReduced || !isFinePointer) return;

    const aura = cursorAuraRef.current;
    if (!aura) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let currentX = targetX;
    let currentY = targetY;
    let isMoving = false;
    let hasEntered = false;
    let animId = null;

    const handlePointerMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!hasEntered) {
        hasEntered = true;
        aura.style.opacity = "1";
      }
      isMoving = true;
    };

    const handlePointerLeave = () => {
      isMoving = false;
      aura.style.opacity = "0";
    };

    const updateCursorPosition = () => {
      animId = requestAnimationFrame(updateCursorPosition);

      if (document.hidden || isModalOpen) return;

      // Spring damping interpolation
      currentX += (targetX - currentX) * 0.055;
      currentY += (targetY - currentY) * 0.055;

      aura.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave, { passive: true });
    animId = requestAnimationFrame(updateCursorPosition);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isModalOpen]);

  // Micro Cosmic Stardust Particles Canvas
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isReduced = respectReducedMotion();
    const isLowPower = typeof navigator !== "undefined" && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const isSmallMobile = typeof window !== "undefined" && window.innerWidth < 640;

    // Static frame for reduced motion or low power / small screens
    if (isReduced || isLowPower || isSmallMobile) {
      canvas.width = Math.floor(window.innerWidth * 0.35);
      canvas.height = Math.floor(window.innerHeight * 0.35);
      ctx.fillStyle = "rgba(34, 255, 136, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    canvas.style.display = "block";

    // 0.35 resolution scale for maximum efficiency
    const scale = 0.35;
    let width = (canvas.width = Math.max(100, Math.floor(window.innerWidth * scale)));
    let height = (canvas.height = Math.max(100, Math.floor(window.innerHeight * scale)));

    // Particle count: 24 on desktop, 12 on tablet
    const count = window.innerWidth > 1024 ? 24 : 12;
    const particles = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: (0.75 + Math.random() * 1.25) * scale,
        baseAlpha: 0.14 + Math.random() * 0.26,
        pulseSpeed: 0.015 + Math.random() * 0.025,
        pulsePhase: Math.random() * Math.PI * 2,
        vy: (0.12 + Math.random() * 0.22) * scale,
        swaySpeed: 0.008 + Math.random() * 0.015,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: (0.4 + Math.random() * 0.6) * scale,
        colorType: Math.random() > 0.5 ? "toneA" : Math.random() > 0.25 ? "toneB" : "white"
      });
    }

    let animId = null;
    let lastTime = 0;
    const fpsInterval = 1000 / 30; // 30 FPS cap for maximum power efficiency

    const handleResize = () => {
      width = canvas.width = Math.max(100, Math.floor(window.innerWidth * scale));
      height = canvas.height = Math.max(100, Math.floor(window.innerHeight * scale));
    };

    window.addEventListener("resize", handleResize, { passive: true });

    let t = 0;
    const render = (timestamp) => {
      animId = requestAnimationFrame(render);

      if (document.hidden || isModalOpen) return;

      const elapsed = timestamp - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = timestamp - (elapsed % fpsInterval);

      t += 0.02;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.vy;
        p.x += Math.sin(t * p.swaySpeed + p.swayPhase) * p.swayAmp;

        // Wrap around viewport edges seamlessly
        if (p.y < -5) {
          p.y = height + 5;
          p.x = Math.random() * width;
        }
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;

        const currentAlpha = p.baseAlpha * (0.65 + 0.35 * Math.sin(t * p.pulseSpeed * 10 + p.pulsePhase));

        let fill;
        if (palette === "danger") {
          fill = `rgba(248, 113, 113, ${currentAlpha})`;
        } else if (palette === "privacy") {
          fill = p.colorType === "toneA" ? `rgba(56, 189, 248, ${currentAlpha})` : p.colorType === "toneB" ? `rgba(168, 85, 247, ${currentAlpha})` : `rgba(255, 255, 255, ${currentAlpha * 0.7})`;
        } else if (palette === "terms") {
          fill = p.colorType === "toneA" ? `rgba(255, 214, 10, ${currentAlpha})` : p.colorType === "toneB" ? `rgba(34, 255, 136, ${currentAlpha})` : `rgba(168, 85, 247, ${currentAlpha * 0.4})`;
        } else if (palette === "affiliate") {
          fill = p.colorType === "toneA" ? `rgba(34, 255, 136, ${currentAlpha})` : p.colorType === "toneB" ? `rgba(255, 214, 10, ${currentAlpha})` : `rgba(168, 85, 247, ${currentAlpha * 0.5})`;
        } else if (palette === "contact") {
          fill = p.colorType === "toneA" ? `rgba(34, 255, 136, ${currentAlpha})` : p.colorType === "toneB" ? `rgba(56, 189, 248, ${currentAlpha})` : `rgba(255, 255, 255, ${currentAlpha * 0.7})`;
        } else if (p.colorType === "toneA") {
          fill = `rgba(0, 245, 160, ${currentAlpha})`;
        } else if (p.colorType === "toneB") {
          fill = `rgba(39, 215, 255, ${currentAlpha})`;
        } else {
          fill = `rgba(255, 255, 255, ${currentAlpha * 0.8})`;
        }

        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, p.radius), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [palette, isModalOpen]);

  return (
    <div
      ref={containerRef}
      className={`kx-live-backdrop ${isModalOpen ? "is-modal-dimmed" : ""}`}
      data-palette={palette}
      data-accent={accent}
      aria-hidden="true"
    >
      {/* Layer 0: Midnight Obsidian Charcoal Deep Space */}
      <div className="kx-backdrop-base" />

      {/* Layer 1: Volumetric Organic Aurora Light Waves (GPU-accelerated CSS Orbs) */}
      <div className="kx-backdrop-mesh">
        {/* Orb 1: Emerald Aurora Wave (Top-Left / Center-Left) */}
        <div className="kx-orb kx-orb-emerald" />

        {/* Orb 2: Electric Cyan Beam (Top-Right / Header) */}
        <div className="kx-orb kx-orb-cyan" />

        {/* Orb 3: Cosmic Deep Violet Drift (Bottom-Left) */}
        <div className="kx-orb kx-orb-violet" />

        {/* Orb 4: Royal Midnight Blue Depth (Bottom-Right / Footer) */}
        <div className="kx-orb kx-orb-blue" />

        {/* Orb 5: Apple-inspired Subtle Magenta Sheen (Mid-Right Ambient Accent) */}
        <div className="kx-orb kx-orb-magenta" />
      </div>

      {/* Layer 2: Atmospheric Sweeping Light Rays (Cinematic God-Ray Sheen) */}
      <div className="kx-backdrop-rays" />

      {/* Layer 3: Interactive Cursor Light Aura (Smooth Lerped Desktop Follower) */}
      <div ref={cursorAuraRef} className="kx-backdrop-cursor-aura" />

      {/* Layer 4: Micro Cosmic Stardust Particles Canvas */}
      <canvas ref={particleCanvasRef} className="kx-backdrop-particles" />

      {/* Layer 5: Subtle 48px Technical Grid Overlay */}
      <div className="kx-backdrop-grid" />

      {/* Layer 6: Fine Film Grain (SVG Fractal Noise, Prevents Color Banding) */}
      <div className="kx-backdrop-grain" />

      {/* Layer 7: Central Readability Vignette (Guarantees WCAG AA Text Contrast) */}
      <div className="kx-backdrop-vignette" />
    </div>
  );
}
