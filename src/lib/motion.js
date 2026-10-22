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

/**
 * Advanced Scroll-Triggered Box Reveal with alternating offsets
 * Moves into place when reached at ~85% of viewport height
 */
export function revealBox(el, options = {}) {
  if (!el) return null;
  if (respectReducedMotion()) {
    gsap.set(el, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, clearProps: "all" });
    return null;
  }

  const {
    direction = "up",
    index = 0,
    delay = 0,
    duration = 0.9,
    ease = "power3.out"
  } = options;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const angle = (index % 2 === 0 ? 2 : -2);

  let startX = 0;
  let startY = 48;

  if (!isMobile) {
    if (direction === "left") {
      startX = -64;
      startY = 20;
    } else if (direction === "right") {
      startX = 64;
      startY = 20;
    } else {
      startX = (index % 2 === 0 ? -32 : 32);
      startY = 64;
    }
  }

  gsap.set(el, { willChange: "transform, opacity" });

  return gsap.fromTo(
    el,
    {
      opacity: 0,
      x: startX,
      y: startY,
      scale: 0.94,
      rotation: angle
    },
    {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      duration,
      delay,
      ease,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true
      },
      onComplete: () => {
        gsap.set(el, { clearProps: "willChange,transform" });
      }
    }
  );
}

/**
 * Staggered Card Grid Reveal where cards fly in from alternating sides
 */
export function revealGroup(container, selector = ".kx-glow", options = {}) {
  if (!container) return null;
  const items = container.querySelectorAll(selector);
  if (!items.length) return null;

  if (respectReducedMotion()) {
    gsap.set(items, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, clearProps: "all" });
    return null;
  }

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const { stagger = 0.08, duration = 0.9, ease = "power3.out" } = options;

  items.forEach((item, idx) => {
    const fromLeft = idx % 2 === 0;
    const startX = isMobile ? 0 : fromLeft ? -64 : 64;
    const startY = isMobile ? 48 : 24;
    const angle = fromLeft ? -2 : 2;

    gsap.set(item, { willChange: "transform, opacity" });

    gsap.fromTo(
      item,
      {
        opacity: 0,
        x: startX,
        y: startY,
        scale: 0.94,
        rotation: angle
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        duration,
        ease,
        scrollTrigger: {
          trigger: item,
          start: "top 85%",
          once: true
        },
        onComplete: () => {
          gsap.set(item, { clearProps: "willChange,transform" });
        }
      }
    );
  });
}

/**
 * Decorative layer scroll parallax drift (scrub: 0.6, up to 60px)
 */
export function initScrollParallax(targets, maxDrift = 60) {
  if (!targets || respectReducedMotion()) return () => {};

  const elements = typeof targets === "string" ? document.querySelectorAll(targets) : targets;
  if (!elements || !elements.length) return () => {};

  const tweens = [];
  elements.forEach((el, idx) => {
    const speed = idx % 2 === 0 ? 1 : 0.65;
    const tween = gsap.to(el, {
      y: () => -maxDrift * speed,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6
      }
    });
    tweens.push(tween);
  });

  return () => {
    tweens.forEach((t) => t.kill());
  };
}

/**
 * Hero content drift as visitor scrolls down (moves up slowly, fades slightly)
 */
export function initHeroExitDrift(heroEl, contentEl) {
  if (!heroEl || !contentEl || respectReducedMotion()) return () => {};

  const tween = gsap.to(contentEl, {
    y: -40,
    opacity: 0.88,
    ease: "none",
    scrollTrigger: {
      trigger: heroEl,
      start: "top top",
      end: "bottom top",
      scrub: 0.6
    }
  });

  return () => {
    tween.kill();
  };
}

/**
 * Subtle desktop-only hover tilt (max 4 degrees)
 */
export function initCardTilt4Deg(container) {
  if (!container || respectReducedMotion()) return () => {};
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return () => {};
  }

  const cards = container.querySelectorAll(".kx-glow");
  const cleanups = [];

  cards.forEach((card) => {
    const onMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotX = ((y / rect.height) - 0.5) * -4;
      const rotY = ((x / rect.width) - 0.5) * 4;

      gsap.to(card, {
        rotationX: rotX,
        rotationY: rotY,
        transformPerspective: 1000,
        duration: 0.3,
        ease: "power1.out"
      });
    };

    const onMouseLeave = () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.45,
        ease: "power2.out"
      });
    };

    card.addEventListener("mousemove", onMouseMove);
    card.addEventListener("mouseleave", onMouseLeave);

    cleanups.push(() => {
      card.removeEventListener("mousemove", onMouseMove);
      card.removeEventListener("mouseleave", onMouseLeave);
    });
  });

  return () => {
    cleanups.forEach((c) => c());
  };
}

