import { useEffect, useRef, useState } from "react";

export const BASE = "/ksamhead/";

export const INLINE_DATA = {
  hero: {
    mode: "auto",
    playbackRate: 0.9,
    phoneX: 0.68,
    phoneScale: 0.88,
    words: [
      "Titanium Pro",
      "Ultra Displays",
      "Smart Watches",
      "Laptops",
      "Audio Gear"
    ],
    video: [
      "videos/hero/hero_bg_new.webm",
      "videos/hero/hero_bg_new.mp4"
    ],
    poster: "videos/hero/hero_bg_new_poster.webp"
  }
};

export function resolveAsset(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const clean = path.replace(/^\/+/, "");
  const viteBase = typeof import.meta !== "undefined" && import.meta.env?.BASE_URL && import.meta.env.BASE_URL !== "/"
    ? import.meta.env.BASE_URL.replace(/\/+$/, "")
    : "";
  if (clean.startsWith("videos/") || clean.startsWith("ksamhead/")) {
    return `${viteBase}/${clean}`.replace(/\/+/g, "/");
  }
  return `${viteBase}${BASE}${clean}`.replace(/\/+/g, "/");
}

export function useHeroHead({ paused = false } = {}) {
  const heroRef = useRef(null);
  const heroContentRef = useRef(null);
  const hugeTextRef = useRef(null);
  const videoRef = useRef(null);
  const ambientVideoRef = useRef(null);
  const ambientCanvasRef = useRef(null);
  const rotatingWordRef = useRef(null);
  const headlineRef = useRef(null);

  const [heroData, setHeroData] = useState(INLINE_DATA.hero);
  const [countdown, setCountdown] = useState("00:00:00");
  const [videoFailed, setVideoFailed] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 767 : false
  );
  const [isSaveDataOrReducedMotion, setIsSaveDataOrReducedMotion] = useState(false);

  // Check Save-Data, slow connection, reduced motion, and mobile screen size
  useEffect(() => {
    const checkSettings = () => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const navConn = typeof navigator !== "undefined" ? navigator.connection : null;
      const saveData = Boolean(
        navConn?.saveData ||
        (navConn?.effectiveType && ["slow-2g", "2g", "3g"].includes(navConn.effectiveType))
      );
      setIsSaveDataOrReducedMotion(reducedMotion || saveData);
      setIsMobile(window.innerWidth <= 767);
    };

    checkSettings();
    window.addEventListener("resize", checkSettings, { passive: true });
    return () => window.removeEventListener("resize", checkSettings);
  }, []);

  // 1. Fetch data with inline fallback
  useEffect(() => {
    let active = true;
    const viteBase = typeof import.meta !== "undefined" && import.meta.env?.BASE_URL && import.meta.env.BASE_URL !== "/"
      ? import.meta.env.BASE_URL.replace(/\/+$/, "")
      : "";
    const fetchUrl = `${viteBase}${BASE}data/products.json`.replace(/\/+/g, "/");

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (active && data && data.hero) {
          setHeroData({
            ...INLINE_DATA.hero,
            ...data.hero
          });
        }
      })
      .catch(() => {
        // Keep INLINE_DATA on failure
      });

    return () => {
      active = false;
    };
  }, []);

  // 2. Midnight Countdown
  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0
      );
      const diffMs = midnight.getTime() - now.getTime();
      if (diffMs <= 0) {
        setCountdown("00:00:00");
        return;
      }
      const hrs = String(Math.floor(diffMs / 3600000)).padStart(2, "0");
      const mins = String(Math.floor((diffMs % 3600000) / 60000)).padStart(2, "0");
      const secs = String(Math.floor((diffMs % 60000) / 1000)).padStart(2, "0");
      setCountdown(`${hrs}:${mins}:${secs}`);
    }

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Slot Machine Scramble
  useEffect(() => {
    const wordEl = rotatingWordRef.current;
    if (!wordEl) return;

    const words = heroData.words && heroData.words.length ? heroData.words : INLINE_DATA.hero.words;
    let wordIdx = 0;
    const scrambleLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");

    let scrambleInterval = null;
    let safetyTimer = null;
    let rollTimer = null;
    let mainInterval = null;

    function scrambleTo(targetText) {
      if (scrambleInterval) clearInterval(scrambleInterval);
      if (safetyTimer) clearTimeout(safetyTimer);

      let step = 0;
      const totalSteps = 8;
      const stepDuration = 45;

      scrambleInterval = setInterval(() => {
        step++;
        if (step >= totalSteps) {
          clearInterval(scrambleInterval);
          scrambleInterval = null;
          if (wordEl) wordEl.textContent = targetText;
        } else if (wordEl) {
          let scrambled = "";
          for (let i = 0; i < targetText.length; i++) {
            if (targetText[i] === " ") {
              scrambled += " ";
            } else if (i < (step / totalSteps) * targetText.length) {
              scrambled += targetText[i];
            } else {
              scrambled += scrambleLetters[Math.floor(Math.random() * scrambleLetters.length)];
            }
          }
          wordEl.textContent = scrambled;
        }
      }, stepDuration);

      safetyTimer = setTimeout(() => {
        if (scrambleInterval) {
          clearInterval(scrambleInterval);
          scrambleInterval = null;
        }
        if (wordEl) wordEl.textContent = targetText;
      }, 400);
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (scrambleInterval) clearInterval(scrambleInterval);
        if (safetyTimer) clearTimeout(safetyTimer);
        if (wordEl) wordEl.textContent = words[wordIdx];
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    mainInterval = setInterval(() => {
      if (document.hidden) return;
      wordIdx = (wordIdx + 1) % words.length;
      const nextWord = words[wordIdx];

      if (wordEl) {
        wordEl.style.transform = "translateY(-110%)";
        wordEl.style.opacity = "0";
      }

      rollTimer = setTimeout(() => {
        if (!wordEl) return;
        wordEl.style.transition = "none";
        wordEl.style.transform = "translateY(110%)";
        void wordEl.offsetHeight; // trigger reflow
        wordEl.style.transition = "transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease";
        wordEl.style.transform = "translateY(0)";
        wordEl.style.opacity = "1";
        scrambleTo(nextWord);
      }, 260);
    }, 3400);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (scrambleInterval) clearInterval(scrambleInterval);
      if (safetyTimer) clearTimeout(safetyTimer);
      if (rollTimer) clearTimeout(rollTimer);
      if (mainInterval) clearInterval(mainInterval);
    };
  }, [heroData.words]);

  // 4. Parallax & Huge Background Text Slide
  useEffect(() => {
    const handleScroll = () => {
      if (window.matchMedia("(max-width: 767px)").matches) {
        if (heroContentRef.current) {
          heroContentRef.current.style.transform = "";
          heroContentRef.current.style.opacity = "";
        }
        return;
      }
      const currentScrollY = window.scrollY;

      if (hugeTextRef.current) {
        hugeTextRef.current.style.transform = `translateX(${currentScrollY * -0.2}px)`;
      }

      if (heroContentRef.current && currentScrollY < 900) {
        const factor = currentScrollY * 0.28;
        const opacityFactor = Math.max(0, 1 - currentScrollY / 650);
        heroContentRef.current.style.transform = `translate3d(0, -${factor}px, 0)`;
        heroContentRef.current.style.opacity = opacityFactor;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 5. Headline Letter Hover Wave
  useEffect(() => {
    const titleEl = headlineRef.current;
    if (!titleEl) return;
    const letters = titleEl.querySelectorAll(".char-letter");
    const cleanupFns = [];

    letters.forEach((letter, idx) => {
      let timeoutId = null;
      const onEnter = () => {
        const prev = letters[idx - 1];
        const next = letters[idx + 1];
        if (prev) prev.style.transform = "translateY(-4px) scale(1.04)";
        if (next) next.style.transform = "translateY(-4px) scale(1.04)";
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (prev) prev.style.transform = "";
          if (next) next.style.transform = "";
        }, 450);
      };

      letter.addEventListener("mouseenter", onEnter);
      cleanupFns.push(() => {
        letter.removeEventListener("mouseenter", onEnter);
        clearTimeout(timeoutId);
      });
    });

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  // 6. Video Playback & Ambient Canvas Draw Loop with MutationObserver (Navbar search overlay) & IntersectionObserver
  useEffect(() => {
    const heroEl = heroRef.current;
    const vid = videoRef.current;
    const ambVid = ambientVideoRef.current;
    const canvas = ambientCanvasRef.current;
    if (!heroEl) return;

    let isHeroInView = true;
    let isPageVisible = !document.hidden;
    let isSearchOpen = document.body.style.overflow === "hidden" || Boolean(document.querySelector(".ksam-overlay"));
    let ambientAnimId = null;
    let lastAmbientTime = 0;
    const AMBIENT_FPS_INTERVAL = 1000 / 30; // 30 FPS cap

    const ctx = canvas ? canvas.getContext("2d", { alpha: false }) : null;

    function drawAmbientFrame() {
      if (!ctx || !canvas || !vid) return;
      if (vid.readyState >= 2) {
        try {
          ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
        } catch {
          // ignore draw errors during source transitions
        }
      }
    }

    function managePlayback() {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const navConn = typeof navigator !== "undefined" ? navigator.connection : null;
      const isSaveData = Boolean(
        navConn?.saveData ||
        (navConn?.effectiveType && ["slow-2g", "2g", "3g"].includes(navConn.effectiveType))
      );

      if (reducedMotion || isSaveData) {
        if (vid) vid.pause();
        if (ambVid) ambVid.pause();
        drawAmbientFrame();
        return;
      }

      const shouldPlay = isHeroInView && isPageVisible && !isSearchOpen && !paused;

      if (shouldPlay) {
        const rate = heroData.playbackRate || 0.9;
        if (vid) {
          vid.defaultMuted = true;
          vid.muted = true;
          vid.playbackRate = rate;
          try {
            const p = vid.play();
            if (p !== undefined) {
              p.catch(() => {
                if (vid.error) {
                  setVideoFailed(true);
                }
              });
            }
          } catch {
            if (vid.error) {
              setVideoFailed(true);
            }
          }
        }
        if (ambVid) {
          ambVid.playbackRate = rate;
          ambVid.play().catch(() => {});
        }
      } else {
        if (vid) vid.pause();
        if (ambVid) ambVid.pause();
      }
    }

    function ambientTick(now) {
      const shouldDraw = isHeroInView && isPageVisible && !isSearchOpen && !paused;
      if (shouldDraw && now - lastAmbientTime >= AMBIENT_FPS_INTERVAL) {
        lastAmbientTime = now;
        drawAmbientFrame();
      }
      ambientAnimId = requestAnimationFrame(ambientTick);
    }
    ambientAnimId = requestAnimationFrame(ambientTick);

    // IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isHeroInView = entry.isIntersecting;
          managePlayback();
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(heroEl);

    // Page visibility
    const onVisChange = () => {
      isPageVisible = !document.hidden;
      managePlayback();
    };
    document.addEventListener("visibilitychange", onVisChange);

    // MutationObserver on document.body for Navbar search overlay opening (overflow: hidden)
    const bodyObserver = new MutationObserver(() => {
      const searchNow = document.body.style.overflow === "hidden" || Boolean(document.querySelector(".ksam-overlay"));
      if (searchNow !== isSearchOpen) {
        isSearchOpen = searchNow;
        managePlayback();
      }
    });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["style", "class"], childList: true });

    // Video error handling
    const onVideoError = () => {
      if (vid && vid.error) {
        setVideoFailed(true);
      }
    };
    if (vid) {
      vid.addEventListener("error", onVideoError);
    }

    // Time sync for ambient video
    const onTimeUpdate = () => {
      if (ambVid && vid && Math.abs(ambVid.currentTime - vid.currentTime) > 0.3) {
        ambVid.currentTime = vid.currentTime;
      }
    };
    if (vid) {
      vid.addEventListener("timeupdate", onTimeUpdate);
    }

    managePlayback();

    return () => {
      observer.disconnect();
      bodyObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisChange);
      if (ambientAnimId) cancelAnimationFrame(ambientAnimId);
      if (vid) {
        vid.removeEventListener("error", onVideoError);
        vid.removeEventListener("timeupdate", onTimeUpdate);
        vid.pause();
      }
      if (ambVid) ambVid.pause();
    };
  }, [paused, heroData.playbackRate]);

  return {
    heroRef,
    heroContentRef,
    hugeTextRef,
    videoRef,
    ambientVideoRef,
    ambientCanvasRef,
    rotatingWordRef,
    headlineRef,
    heroData,
    countdown,
    videoFailed,
    setVideoFailed,
    isMobile,
    isSaveDataOrReducedMotion
  };
}
