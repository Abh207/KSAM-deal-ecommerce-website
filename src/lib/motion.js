import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin if available
if (typeof window !== "undefined" && gsap) {
  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch (err) {
    console.debug("[Motion] ScrollTrigger registration notice:", err);
  }
}

/**
 * Check if the user or device requests reduced motion
 */
export function respectReducedMotion() {
  if (typeof window === "undefined") return true;
  const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isLowPower = typeof navigator !== "undefined" && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  return isReduced || isLowPower;
}

/**
 * Reveal an element with a smooth fade-up
 */
export function reveal(el, options = {}) {
  if (!el) return null;
  if (respectReducedMotion()) {
    gsap.set(el, { opacity: 1, y: 0, clearProps: "all" });
    return null;
  }

  const {
    y = 28,
    duration = 0.7,
    delay = 0,
    ease = "power3.out",
    scrollTrigger = false
  } = options;

  const config = {
    opacity: 0,
    y,
    duration,
    delay,
    ease
  };

  if (scrollTrigger) {
    config.scrollTrigger = {
      trigger: el,
      start: "top 88%",
      once: true
    };
  }

  return gsap.from(el, config);
}

/**
 * Stagger reveal multiple child elements
 */
export function revealStagger(container, selector, options = {}) {
  if (!container) return null;
  const targets = container.querySelectorAll(selector);
  if (!targets.length) return null;

  if (respectReducedMotion()) {
    gsap.set(targets, { opacity: 1, y: 0, clearProps: "all" });
    return null;
  }

  const {
    stagger = 0.08,
    y = 24,
    duration = 0.65,
    delay = 0,
    ease = "power3.out"
  } = options;

  return gsap.from(targets, {
    opacity: 0,
    y,
    duration,
    stagger,
    delay,
    ease,
    scrollTrigger: {
      trigger: container,
      start: "top 85%",
      once: true
    }
  });
}

/**
 * Subtle parallax on decorative layers (max 40px)
 */
export function parallax(el, speed = 0.15) {
  if (!el || respectReducedMotion()) return null;

  return gsap.to(el, {
    y: () => -40 * speed,
    ease: "none",
    scrollTrigger: {
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
}

/**
 * Magnetic button interaction (desktop pointer only, max 8px)
 */
export function magnetic(el, maxPull = 8) {
  if (!el || respectReducedMotion()) return () => {};
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return () => {}; // Disabled on touch devices
  }

  const onMouseMove = (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);

    const pullX = Math.max(-maxPull, Math.min(maxPull, x * 0.35));
    const pullY = Math.max(-maxPull, Math.min(maxPull, y * 0.35));

    gsap.to(el, {
      x: pullX,
      y: pullY,
      duration: 0.25,
      ease: "power2.out"
    });
  };

  const onMouseLeave = () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.45,
      ease: "elastic.out(1, 0.4)"
    });
  };

  el.addEventListener("mousemove", onMouseMove);
  el.addEventListener("mouseleave", onMouseLeave);

  return () => {
    el.removeEventListener("mousemove", onMouseMove);
    el.removeEventListener("mouseleave", onMouseLeave);
  };
}

/**
 * Subtle 3D Card tilt on hover (desktop pointer only)
 */
export function tiltOnHover(el, intensity = 6) {
  if (!el || respectReducedMotion()) return () => {};
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return () => {};
  }

  const onMouseMove = (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotX = ((y / rect.height) - 0.5) * -intensity;
    const rotY = ((x / rect.width) - 0.5) * intensity;

    gsap.to(el, {
      rotationX: rotX,
      rotationY: rotY,
      transformPerspective: 1000,
      duration: 0.3,
      ease: "power1.out"
    });
  };

  const onMouseLeave = () => {
    gsap.to(el, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.5,
      ease: "power2.out"
    });
  };

  el.addEventListener("mousemove", onMouseMove);
  el.addEventListener("mouseleave", onMouseLeave);

  return () => {
    el.removeEventListener("mousemove", onMouseMove);
    el.removeEventListener("mouseleave", onMouseLeave);
  };
}

/**
 * Smooth number count-up
 */
export function countUp(el, target, duration = 1.2) {
  if (!el) return null;
  const num = parseInt(target, 10) || 0;
  if (respectReducedMotion()) {
    el.innerText = num.toLocaleString("en-IN");
    return null;
  }

  const obj = { val: 0 };
  return gsap.to(obj, {
    val: num,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      el.innerText = Math.round(obj.val).toLocaleString("en-IN");
    }
  });
}
