import React, { useEffect, useRef, useState } from "react";

const resolveVideoUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const clean = path.replace(/^\/+/, "");
    if (path.startsWith(normalizedBase)) return path;
    return `${normalizedBase}${clean}`;
};

function WatchVideoHero() {
    const sectionRef = useRef(null);
    const videoRef = useRef(null);
    const [reducedMotion, setReducedMotion] = useState(false);

    const videoSrc = resolveVideoUrl("assets/videos/watches-hero.mp4");

    // Check prefers-reduced-motion
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mediaQuery.matches);

        const handleMotionChange = (e) => setReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handleMotionChange);

        return () => mediaQuery.removeEventListener("change", handleMotionChange);
    }, []);

    // Intersection observer & visibilitychange for play/pause
    useEffect(() => {
        const sectionEl = sectionRef.current;
        const videoEl = videoRef.current;
        if (!sectionEl || !videoEl) return;

        try {
            videoEl.muted = true;
            videoEl.defaultMuted = true;
        } catch (e) {}

        if (reducedMotion) {
            videoEl.pause();
            return;
        }

        if (typeof IntersectionObserver === "undefined") {
            videoEl.play().catch(() => {});
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && document.visibilityState !== "hidden" && !reducedMotion) {
                    videoEl.play().catch(() => {});
                } else {
                    videoEl.pause();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sectionEl);

        const handleVisibilityChange = () => {
            if (!videoRef.current || reducedMotion) return;
            if (document.visibilityState === "hidden") {
                videoRef.current.pause();
            } else if (sectionRef.current) {
                const rect = sectionRef.current.getBoundingClientRect();
                const inView = rect.top < window.innerHeight && rect.bottom > 0;
                if (inView) {
                    videoRef.current.play().catch(() => {});
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            observer.disconnect();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [reducedMotion]);

    return (
        <section
            ref={sectionRef}
            className="watch-video-hero"
            aria-label="Watches Video Showcase"
        >
            <video
                ref={videoRef}
                className="watch-video-hero-video"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
            >
                <source src={videoSrc} type="video/mp4" />
            </video>
        </section>
    );
}

export default WatchVideoHero;
