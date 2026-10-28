/**
 * KSAM Deal - Shared Full-Page Background Video Controller
 * Handles autoplay, accessibility (prefers-reduced-motion),
 * network-awareness (data-saver/slow connections), tab visibility, and error fallback.
 */
(function () {
  function initBgVideo() {
    document.body.classList.add("has-bg-video");

    const wrap = document.querySelector(".bg-video-wrap");
    const video = document.querySelector(".bg-video");
    if (!wrap || !video) return;

    // 1. Accessibility: prefers-reduced-motion check
    const reducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 2. Performance: Data-saver / slow 2G connection check
    const conn =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    const isSlowConn =
      conn &&
      (Boolean(conn.saveData) ||
        conn.effectiveType === "2g" ||
        conn.effectiveType === "slow-2g");

    if (reducedMotion || isSlowConn) {
      video.pause();
      video.removeAttribute("autoplay");
      if (isSlowConn) {
        // Skip fetching video stream on slow network
        video.src = "";
        try {
          video.load();
        } catch (e) {}
      }
      return;
    }

    // 3. Play video with catch for autoplay policy
    video.muted = true;
    try {
      video.defaultMuted = true;
    } catch (e) {}

    const attemptPlay = function () {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          // Retry on first user interaction if blocked
          const onUserInteraction = function () {
            video.play().catch(function () {});
            window.removeEventListener("pointerdown", onUserInteraction);
            window.removeEventListener("keydown", onUserInteraction);
            window.removeEventListener("scroll", onUserInteraction);
          };
          window.addEventListener("pointerdown", onUserInteraction, { once: true, passive: true });
          window.addEventListener("keydown", onUserInteraction, { once: true, passive: true });
          window.addEventListener("scroll", onUserInteraction, { once: true, passive: true });
        });
      }
    };

    attemptPlay();

    // 4. Tab visibility change (pause when hidden, resume when visible)
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") {
        video.pause();
      } else if (!reducedMotion && !isSlowConn) {
        video.play().catch(function () {});
      }
    });

    // 5. Fallback if video fails to load
    const handleFailure = function () {
      wrap.classList.add("is-fallback");
    };

    video.addEventListener("error", handleFailure);
    const sourceEl = video.querySelector("source");
    if (sourceEl) {
      sourceEl.addEventListener("error", handleFailure);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBgVideo);
  } else {
    initBgVideo();
  }
})();
