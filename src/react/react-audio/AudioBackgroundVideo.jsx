import React, { useEffect, useRef, useState } from "react";

export default function AudioBackgroundVideo() {
    const videoRef = useRef(null);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [fallback, setFallback] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const isReduced = mq.matches;

        const conn =
            navigator.connection ||
            navigator.mozConnection ||
            navigator.webkitConnection;
        const isSlowOrSaveData =
            conn?.saveData ||
            (conn?.effectiveType &&
                ["slow-2g", "2g", "3g"].includes(conn.effectiveType));

        if (isReduced || isSlowOrSaveData) {
            setReducedMotion(true);
            return;
        }

        const handleMotion = (e) => setReducedMotion(e.matches);
        mq.addEventListener?.("change", handleMotion);

        // Defer playback until after first paint
        const startPlay = () => {
            if (videoRef.current) {
                videoRef.current.play().catch(() => {
                    setFallback(true);
                });
            }
        };

        if ("requestIdleCallback" in window) {
            window.requestIdleCallback(startPlay, { timeout: 2000 });
        } else {
            setTimeout(startPlay, 300);
        }

        // Pause when tab is hidden, resume when visible
        const handleVisibilityChange = () => {
            if (document.hidden) {
                videoRef.current?.pause();
            } else if (!reducedMotion && !fallback) {
                videoRef.current?.play().catch(() => {});
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            mq.removeEventListener?.("change", handleMotion);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [reducedMotion, fallback]);

    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const videoSrc = `${normalizedBase}assets/videos/audio-bg.mp4`;
    const mobileVideoSrc = `${normalizedBase}assets/videos/audio-bg_mobile.mp4`;
    const webmSrc = `${normalizedBase}assets/videos/audio-bg.webm`;
    const mobileWebmSrc = `${normalizedBase}assets/videos/audio-bg_mobile.webm`;
    const posterSrc = `${normalizedBase}assets/videos/audio-bg-poster.webp`;

    return (
        <div className="audio-bg-video-wrap" aria-hidden="true">
            {!reducedMotion && !fallback ? (
                <video
                    ref={videoRef}
                    className="audio-bg-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={posterSrc}
                    onError={() => setFallback(true)}
                >
                    <source
                        media="(max-width: 768px)"
                        src={mobileWebmSrc}
                        type="video/webm"
                    />
                    <source
                        media="(max-width: 768px)"
                        src={mobileVideoSrc}
                        type="video/mp4"
                    />
                    <source src={webmSrc} type="video/webm" />
                    <source src={videoSrc} type="video/mp4" />
                </video>
            ) : (
                <img
                    src={posterSrc}
                    alt=""
                    className="audio-bg-video-poster"
                    loading="eager"
                    decoding="async"
                />
            )}
            <div className="audio-bg-video-overlay" />
        </div>
    );
}
