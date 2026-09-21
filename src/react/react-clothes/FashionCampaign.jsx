import React, { useEffect, useRef, useState } from "react";
import campaignData from "../../api/fashion-campaign.json";
import "./fashion-campaign.css";

const getImagePath = (image) => {
    if (!image) return "";

    return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, "")}`;
};

export default function FashionCampaign() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [mousePosition, setMousePosition] = useState({
        x: 0,
        y: 0
    });

    const sectionRef = useRef(null);

    const slides = campaignData.slides || [];

    /* -----------------------------------------
       AUTO SLIDER
    ----------------------------------------- */

    useEffect(() => {
        if (isPaused || slides.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide((previous) =>
                (previous + 1) % slides.length
            );
        }, campaignData.settings.autoPlayDelay);

        return () => clearInterval(timer);
    }, [isPaused, slides.length]);

    /* -----------------------------------------
       NEXT SLIDE
    ----------------------------------------- */

    const nextSlide = () => {
        setCurrentSlide((previous) =>
            (previous + 1) % slides.length
        );
    };

    /* -----------------------------------------
       PREVIOUS SLIDE
    ----------------------------------------- */

    const previousSlide = () => {
        setCurrentSlide((previous) =>
            previous === 0
                ? slides.length - 1
                : previous - 1
        );
    };

    /* -----------------------------------------
       KEYBOARD CONTROLS
    ----------------------------------------- */

    useEffect(() => {
        const handleKeyboard = (event) => {
            if (event.key === "ArrowRight") {
                nextSlide();
            }

            if (event.key === "ArrowLeft") {
                previousSlide();
            }

            if (event.key === " ") {
                event.preventDefault();
                setIsPaused((value) => !value);
            }
        };

        window.addEventListener("keydown", handleKeyboard);

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyboard
            );
        };
    }, [slides.length]);

    /* -----------------------------------------
       MOUSE PARALLAX
    ----------------------------------------- */

    const handleMouseMove = (event) => {
        if (!sectionRef.current) return;

        const rect =
            sectionRef.current.getBoundingClientRect();

        const x =
            ((event.clientX - rect.left) / rect.width - 0.5) * 2;

        const y =
            ((event.clientY - rect.top) / rect.height - 0.5) * 2;

        setMousePosition({
            x,
            y
        });
    };

    const handleMouseLeave = () => {
        setMousePosition({
            x: 0,
            y: 0
        });
    };

    if (!slides.length) {
        return null;
    }

    const activeSlide = slides[currentSlide];

    return (
        <section
            ref={sectionRef}
            className="fashion-campaign"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsPaused(false)}
            onMouseLeave={() => {
                handleMouseLeave();
                setIsPaused(false);
            }}
        >

            {/* -----------------------------------------
                BACKGROUND SLIDES
            ----------------------------------------- */}

            <div className="fashion-campaign-background">

                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`fashion-campaign-slide ${
                            index === currentSlide
                                ? "active"
                                : ""
                        }`}
                    >

                        <img
                            src={getImagePath(slide.image)}
                            alt={slide.alt}
                            style={{
                                transform:
                                    index === currentSlide
                                        ? `
                                            translate(
                                                ${mousePosition.x * -8}px,
                                                ${mousePosition.y * -5}px
                                            )
                                            scale(0.92)
                                        `
                                        : "scale(1)"
                            }}
                        />

                    </div>
                ))}

            </div>

            {/* -----------------------------------------
                DARK GRADIENT
            ----------------------------------------- */}

            <div className="fashion-campaign-overlay"></div>

            {/* -----------------------------------------
                TOP LABEL
            ----------------------------------------- */}

            <div className="fashion-campaign-top">

                <div className="fashion-campaign-season">

                    <span className="campaign-dot"></span>

                    <span>
                        {activeSlide.eyebrow}
                    </span>

                </div>

                <div className="campaign-counter">
                    <span>
                        {String(currentSlide + 1).padStart(2, "0")}
                    </span>

                    <span className="counter-line"></span>

                    <span>
                        {String(slides.length).padStart(2, "0")}
                    </span>
                </div>

            </div>

            {/* -----------------------------------------
                INTERACTIVE INFO
            ----------------------------------------- */}

            <div className="fashion-campaign-content">

                <div className="campaign-mini-label">
                    {activeSlide.smallLabel}
                </div>

                <h2>
                    {activeSlide.title}
                </h2>

                <p>
                    {activeSlide.description}
                </p>

                <div className="campaign-actions">

                    <button
                        className="campaign-shop-button"
                        onClick={() => {
                            const target =
                                document.querySelector(
                                    ".clothes-products-section"
                                );

                            target?.scrollIntoView({
                                behavior: "smooth"
                            });
                        }}
                    >
                        <span>
                            Shop collection
                        </span>

                        <span className="campaign-arrow">
                            →
                        </span>
                    </button>

                    <button
                        className="campaign-pause-button"
                        onClick={() =>
                            setIsPaused((value) => !value)
                        }
                        aria-label={
                            isPaused
                                ? "Play slideshow"
                                : "Pause slideshow"
                        }
                    >
                        {isPaused ? "▶" : "Ⅱ"}
                    </button>

                </div>

            </div>

            {/* -----------------------------------------
                FLOATING SALE BADGE
            ----------------------------------------- */}

            <div className="campaign-sale-badge">

                <span className="sale-small">
                    UP TO
                </span>

                <strong>
                    {activeSlide.discount}%
                </strong>

                <span className="sale-off">
                    OFF
                </span>

            </div>

            {/* -----------------------------------------
                SLIDE INFORMATION
            ----------------------------------------- */}

            <div className="campaign-bottom">

                <div className="campaign-bottom-info">

                    <span className="campaign-index">
                        {String(currentSlide + 1).padStart(2, "0")}
                    </span>

                    <span className="campaign-bottom-line"></span>

                    <span>
                        {activeSlide.category}
                    </span>

                </div>

                <div className="campaign-controls">

                    <button
                        onClick={previousSlide}
                        aria-label="Previous slide"
                    >
                        ←
                    </button>

                    <button
                        onClick={nextSlide}
                        aria-label="Next slide"
                    >
                        →
                    </button>

                </div>

            </div>

            {/* -----------------------------------------
                PROGRESS DOTS
            ----------------------------------------- */}

            <div className="campaign-dots">

                {slides.map((slide, index) => (
                    <button
                        key={slide.id}
                        className={
                            index === currentSlide
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setCurrentSlide(index)
                        }
                        aria-label={`Go to slide ${index + 1}`}
                    >
                        <span></span>
                    </button>
                ))}

            </div>

            {/* -----------------------------------------
                PROGRESS BAR
            ----------------------------------------- */}

            <div className="campaign-progress">

                <div
                    key={currentSlide}
                    className={`campaign-progress-bar ${
                        isPaused ? "paused" : ""
                    }`}
                    style={{
                        animationDuration: `${campaignData.settings.autoPlayDelay}ms`
                    }}
                ></div>

            </div>

        </section>
    );
}