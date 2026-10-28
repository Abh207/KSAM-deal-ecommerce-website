import React, { useEffect, useRef, useState } from "react";

const BeautyBackgroundVideo = () => {
    const videoRef = useRef(null);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);

    const resolveUrl = (path) => {
        if (!path) return "";
        if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
        const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
        const normalizedBase = base.endsWith("/") ? base : `${base}/`;
        const clean = path.replace(/^\/+/, "");
        if (path.startsWith(normalizedBase)) return path;
        return `${normalizedBase}${clean}`;
    };

    const videoSrc = resolveUrl("assets/videos/gemini_generated_video_b2afb415.mp4");
    const posterSrc = resolveUrl("assets/videos/beauty-bg-poster.jpg");

    // Check for prefers-reduced-motion
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mediaQuery.matches);

        const handleMotionChange = (e) => setReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handleMotionChange);

        return () => mediaQuery.removeEventListener("change", handleMotionChange);
    }, []);

    // Pause video when tab is hidden or when reduced motion is requested
    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;

        if (reducedMotion) {
            videoEl.pause();
            return;
        }

        try {
            videoEl.muted = true;
            videoEl.defaultMuted = true;
            const playPromise = videoEl.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {});
            }
        } catch (e) {}

        const handleVisibilityChange = () => {
            if (!videoRef.current || reducedMotion) return;
            if (document.visibilityState === "hidden") {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(() => {});
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [reducedMotion]);

    return (
        <div className="beauty-page-video-wrap" aria-hidden="true">
            {/* If reduced motion is active, show only the static poster */}
            {reducedMotion ? (
                <img
                    src={posterSrc}
                    alt=""
                    className="beauty-page-static-poster"
                />
            ) : (
                <video
                    ref={videoRef}
                    className={`beauty-page-bg-video${videoLoaded ? " is-loaded" : ""}`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster={posterSrc}
                    onLoadedData={() => setVideoLoaded(true)}
                >
                    <source src={videoSrc} type="video/mp4" />
                </video>
            )}

            {/* Soft dark gradient overlay for optimal readability */}
            <div className="beauty-page-bg-overlay" />
        </div>
    );
};

export default BeautyBackgroundVideo;
