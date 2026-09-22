import React, { useEffect, useState } from "react";


function AudioHero({ hero, onExplore }) {

    const slides = hero?.slides || [];

    const [currentSlide, setCurrentSlide] = useState(0);

    const [isPaused, setIsPaused] = useState(false);


    /* =====================================================
       CURRENT SLIDE
    ===================================================== */

    const current =
        slides[
            currentSlide %
            Math.max(slides.length, 1)
        ];


    /* =====================================================
       NEXT SLIDE
    ===================================================== */

    const nextSlide = () => {

        if (!slides.length) return;

        setCurrentSlide(
            (previous) =>
                (previous + 1) %
                slides.length
        );

    };


    /* =====================================================
       PREVIOUS SLIDE
    ===================================================== */

    const previousSlide = () => {

        if (!slides.length) return;

        setCurrentSlide(
            (previous) =>
                (previous - 1 + slides.length) %
                slides.length
        );

    };


    /* =====================================================
       AUTOMATIC SLIDER
    ===================================================== */

    useEffect(() => {

        if (
            slides.length <= 1 ||
            isPaused
        ) {
            return;
        }


        const timer = setInterval(() => {

            setCurrentSlide(
                (previous) =>
                    (previous + 1) %
                    slides.length
            );

        }, 5500);


        return () => {

            clearInterval(timer);

        };

    }, [
        slides.length,
        isPaused
    ]);


    /* =====================================================
       KEYBOARD CONTROLS
    ===================================================== */

    useEffect(() => {

        const handleKeyboard = (event) => {

            if (event.key === "ArrowRight") {

                nextSlide();

            }

            if (event.key === "ArrowLeft") {

                previousSlide();

            }

        };


        window.addEventListener(
            "keydown",
            handleKeyboard
        );


        return () => {

            window.removeEventListener(
                "keydown",
                handleKeyboard
            );

        };

    }, [slides.length]);


    /* =====================================================
       IMAGE PATH
    ===================================================== */

    const getImagePath = (image) => {

        if (!image) return "";

        return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, "")}`;

    };


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (!current) {

        return (

            <section className="audio-hero">

                <div className="audio-hero-empty">

                    <span>
                        KSAM DEAL AUDIO
                    </span>

                    <h1>
                        Premium sound.
                        <br />
                        Better everyday.
                    </h1>

                    <p>
                        Discover earbuds, headphones,
                        speakers and more.
                    </p>

                    <button
                        onClick={onExplore}
                    >
                        Explore audio
                    </button>

                </div>

            </section>

        );

    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <section
            className="audio-hero"
            id="audio-hero"
            onMouseEnter={() =>
                setIsPaused(true)
            }
            onMouseLeave={() =>
                setIsPaused(false)
            }
        >

            {/* =================================================
                BACKGROUND DECORATION
            ================================================= */}

            <div className="audio-hero-grid"></div>

            <div className="audio-hero-glow"></div>

            <div className="audio-hero-circle"></div>


            {/* =================================================
                TOP LABEL
            ================================================= */}

            <div className="audio-hero-top">

                <div className="audio-hero-eyebrow">

                    <span></span>

                    {current.eyebrow ||
                        "NEW AUDIO COLLECTION"}

                </div>


                <div className="audio-hero-counter">

                    <strong>
                        {String(
                            currentSlide + 1
                        ).padStart(2, "0")}
                    </strong>

                    <span>
                        /
                    </span>

                    <span>
                        {String(
                            slides.length
                        ).padStart(2, "0")}
                    </span>

                </div>

            </div>


            {/* =================================================
                HERO CONTENT
            ================================================= */}

            <div className="audio-hero-content">


                {/* =============================================
                    LEFT SIDE
                ============================================= */}

                <div className="audio-hero-copy">

                    <span className="audio-hero-kicker">

                        {current.kicker ||
                            "PREMIUM SOUND"}

                    </span>


                    <h1>

                        {current.title}

                        {current.highlight && (

                            <span>
                                {" "}
                                {current.highlight}
                            </span>

                        )}

                    </h1>


                    <p>
                        {current.description}
                    </p>


                    {/* =========================================
                        PRODUCT META
                    ========================================= */}

                    <div className="audio-hero-meta">

                        {current.meta?.map(
                            (item, index) => (

                                <div
                                    key={
                                        `${current.id}-meta-${index}`
                                    }
                                >

                                    <i
                                        className={
                                            item.icon ||
                                            "fa-solid fa-check"
                                        }
                                    ></i>

                                    <span>
                                        {item.text}
                                    </span>

                                </div>

                            )
                        )}

                    </div>


                    {/* =========================================
                        BUTTONS
                    ========================================= */}

                    <div className="audio-hero-actions">

                        <button
                            className="audio-hero-shop"
                            onClick={onExplore}
                        >

                            {current.buttonText ||
                                "Shop collection"}

                            <i className="fa-solid fa-arrow-right"></i>

                        </button>


                        <button
                            className="audio-hero-play"
                            onClick={() =>
                                setIsPaused(
                                    !isPaused
                                )
                            }
                            aria-label={
                                isPaused
                                    ? "Play slider"
                                    : "Pause slider"
                            }
                        >

                            <i
                                className={
                                    isPaused
                                        ? "fa-solid fa-play"
                                        : "fa-solid fa-pause"
                                }
                            ></i>

                        </button>

                    </div>


                    {/* =========================================
                        COLLECTION LABEL
                    ========================================= */}

                    <div className="audio-hero-bottom-label">

                        <strong>
                            {String(
                                currentSlide + 1
                            ).padStart(2, "0")}
                        </strong>

                        <span></span>

                        <small>
                            {current.category ||
                                "AUDIO COLLECTION"}
                        </small>

                    </div>

                </div>


                {/* =============================================
                    RIGHT PRODUCT IMAGE
                ============================================= */}

                <div className="audio-hero-visual">

                    <div className="audio-hero-image-frame">

                        {/* Product glow */}

                        <div className="audio-product-glow"></div>


                        {/* Product image */}

                        <img
                            key={
                                current.image
                            }
                            className="audio-hero-product-image"
                            src={getImagePath(
                                current.image
                            )}
                            alt={
                                current.title ||
                                "KSAM Deal Audio"
                            }
                        />


                        {/* Product shadow */}

                        <div className="audio-product-shadow"></div>

                    </div>


                    {/* =========================================
                        SALE BADGE
                    ========================================= */}

                    {current.discount && (

                        <div className="audio-hero-sale">

                            <span>
                                UP TO
                            </span>

                            <strong>
                                {current.discount}
                            </strong>

                            <small>
                                OFF
                            </small>

                        </div>

                    )}


                    {/* =========================================
                        FLOATING PRODUCT CARD
                    ========================================= */}

                    {current.floatingCard && (

                        <div className="audio-floating-card">

                            <div className="audio-floating-icon">

                                <i
                                    className={
                                        current
                                            .floatingCard
                                            .icon ||
                                        "fa-solid fa-headphones"
                                    }
                                ></i>

                            </div>


                            <div>

                                <strong>
                                    {
                                        current
                                            .floatingCard
                                            .title
                                    }
                                </strong>

                                <span>
                                    {
                                        current
                                            .floatingCard
                                            .subtitle
                                    }
                                </span>

                            </div>

                        </div>

                    )}

                </div>

            </div>


            {/* =================================================
                SLIDER CONTROLS
            ================================================= */}

            <div className="audio-hero-controls">


                {/* Progress */}

                <div className="audio-hero-progress">

                    <div
                        key={currentSlide}
                        className="audio-hero-progress-bar"
                    ></div>

                </div>


                {/* Dots */}

                <div className="audio-hero-dots">

                    {slides.map(
                        (slide, index) => (

                            <button
                                key={
                                    slide.id ||
                                    index
                                }
                                className={
                                    index ===
                                    currentSlide
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setCurrentSlide(
                                        index
                                    )
                                }
                                aria-label={`Go to slide ${
                                    index + 1
                                }`}
                            ></button>

                        )
                    )}

                </div>


                {/* Arrow controls */}

                <div className="audio-hero-arrows">

                    <button
                        onClick={
                            previousSlide
                        }
                        aria-label="Previous slide"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>

                    <button
                        onClick={
                            nextSlide
                        }
                        aria-label="Next slide"
                    >
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>

                </div>

            </div>


            {/* =================================================
                SIDE TEXT
            ================================================= */}

            <div className="audio-hero-side-text">

                {current.sideText ||
                    "KSAM DEAL • AUDIO"}

            </div>


            {/* =================================================
                SCROLL INDICATOR
            ================================================= */}

            <div className="audio-hero-scroll">

                <span>
                    SCROLL
                </span>

                <i className="fa-solid fa-arrow-down"></i>

            </div>

        </section>

    );

}


export default AudioHero;