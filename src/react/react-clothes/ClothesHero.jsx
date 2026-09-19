import React, { useEffect, useState } from "react";


function ClothesHero({ hero }) {

    const heroData = hero || {};

    const images =
        heroData.heroImages?.length
            ? heroData.heroImages
            : [];


    /* =====================================================
       HERO SLIDER
    ====================================================== */

    const [currentSlide, setCurrentSlide] =
        useState(0);


    /* =====================================================
       IMAGE PATH
    ====================================================== */

    const getImagePath = (image) => {

        if (!image) {
            return "";
        }

        return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, "")}`;

    };


    /* =====================================================
       AUTO SLIDE
    ====================================================== */

    useEffect(() => {

        if (images.length <= 1) {
            return;
        }


        const interval = setInterval(() => {

            setCurrentSlide((current) => {

                return (
                    (current + 1) %
                    images.length
                );

            });

        }, 4500);


        return () => {

            clearInterval(interval);

        };

    }, [images.length]);


    /* =====================================================
       PREVIOUS SLIDE
    ====================================================== */

    const previousSlide = () => {

        if (!images.length) {
            return;
        }


        setCurrentSlide((current) => {

            return (
                (current - 1 + images.length) %
                images.length
            );

        });

    };


    /* =====================================================
       NEXT SLIDE
    ====================================================== */

    const nextSlide = () => {

        if (!images.length) {
            return;
        }


        setCurrentSlide((current) => {

            return (
                (current + 1) %
                images.length
            );

        });

    };


    /* =====================================================
       SCROLL TO COLLECTION
    ====================================================== */

    const scrollToCollection = (event) => {

        event.preventDefault();


        document
            .querySelector(
                ".clothes-products-section"
            )
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    };


    /* =====================================================
       SCROLL TO CATEGORY
    ====================================================== */

    const scrollToCategories = (event) => {

        event.preventDefault();


        document
            .querySelector(
                ".clothes-category-section"
            )
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    };


    /* =====================================================
       CURRENT IMAGE
    ====================================================== */

    const currentImage =
        images[currentSlide];


    /* =====================================================
       RENDER
    ====================================================== */

    return (

        <section
            className="clothes-hero"
            id="new"
        >


            {/* =================================================
                HERO BACKGROUND GRID
            ================================================== */}

            <div className="clothes-hero-grid"></div>


            {/* =================================================
                LARGE DECORATIVE CIRCLE
            ================================================== */}

            <div className="clothes-hero-circle"></div>


            {/* =================================================
                HERO CONTENT
            ================================================== */}

            <div className="clothes-hero-content">


                {/* EYEBROW */}

                <div className="clothes-hero-eyebrow">

                    <span className="clothes-hero-eyebrow-dot"></span>

                    {heroData.eyebrow ||
                        "NEW SEASON • KSAM DEAL"}

                </div>


                {/* MAIN TITLE */}

                <h1 className="clothes-hero-title">

                    <span>
                        {heroData.titleBlack ||
                            "Wear your"}
                    </span>

                    <strong>
                        {heroData.titleGreen ||
                            "style."}
                    </strong>

                </h1>


                {/* DESCRIPTION */}

                <p className="clothes-hero-description">

                    {heroData.description ||
                        "Discover modern clothing, everyday essentials and statement pieces designed for your style."}

                </p>


                {/* BUTTONS */}

                <div className="clothes-hero-buttons">


                    <a
                        href="#trending"
                        className="clothes-hero-primary"
                        onClick={
                            scrollToCollection
                        }
                    >

                        Shop collection

                        <i className="fa-solid fa-arrow-right"></i>

                    </a>


                    <a
                        href="#categories"
                        className="clothes-hero-secondary"
                        onClick={
                            scrollToCategories
                        }
                    >

                        Explore categories

                    </a>

                </div>


                {/* HERO INFORMATION */}

                <div className="clothes-hero-meta">


                    <div>

                        <strong>
                            50%
                        </strong>

                        <span>
                            OFF
                        </span>

                    </div>


                    <p>

                        <b>
                            Fresh looks.
                        </b>

                        <br />

                        {heroData.smallText ||
                            "Easy returns"}

                    </p>

                </div>


            </div>


            {/* =================================================
                HERO VISUAL
            ================================================== */}

            <div className="clothes-hero-visual">


                {/* IMAGE FRAME */}

                <div className="clothes-hero-image-frame">


                    {/* TOP LABEL */}

                    <div className="clothes-hero-image-label">

                        <span>
                            KSAM
                        </span>

                        <b>
                            01
                        </b>

                    </div>


                    {/* IMAGE */}

                    {currentImage ? (

                        <img
                            key={currentImage}
                            src={getImagePath(
                                currentImage
                            )}
                            alt="KSAM Deal fashion collection"
                            className="clothes-hero-image"
                            onError={(event) => {

                                event.currentTarget.style.display =
                                    "none";

                                event.currentTarget.parentElement.classList.add(
                                    "hero-image-missing"
                                );

                            }}
                        />

                    ) : (

                        <div className="clothes-hero-fallback">

                            <span>
                                KSAM
                            </span>

                            <strong>
                                DEAL
                            </strong>

                            <small>
                                FASHION
                            </small>

                        </div>

                    )}


                    {/* IMAGE GRADIENT */}

                    <div className="clothes-hero-image-gradient"></div>


                    {/* IMAGE CAPTION */}

                    <div className="clothes-hero-image-caption">

                        {/* <span>
                            NEW DROP
                        </span> 

                        <strong>
                            2026
                        </strong>  */}

                    </div>

                </div>


                {/* =================================================
                    FLOATING DISCOUNT CARD
                ================================================== */}

                <div className="clothes-hero-floating-card discount">

                    <span>
                        UP TO
                    </span>

                    <strong>
                        50%
                    </strong>

                    <small>
                        OFF
                    </small>

                </div>


                {/* =================================================
                    FLOATING STYLE CARD
                ================================================== */}

                <div className="clothes-hero-floating-card style">

                    <i className="fa-solid fa-star"></i>

                    <div>

                        <strong>
                            DAILY STYLE
                        </strong>

                        <small>
                            Made for you
                        </small>

                    </div>

                </div>


                {/* =================================================
                    SLIDER CONTROLS
                ================================================== */}

                <div className="clothes-hero-controls">


                    <button
                        type="button"
                        onClick={
                            previousSlide
                        }
                        aria-label="Previous fashion image"
                    >

                        <i className="fa-solid fa-arrow-left"></i>

                    </button>


                    <div className="clothes-hero-dots">

                        {images.map(
                            (_, index) => (

                                <button
                                    type="button"
                                    key={index}
                                    className={
                                        currentSlide ===
                                        index
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setCurrentSlide(
                                            index
                                        )
                                    }
                                    aria-label={`Show fashion image ${
                                        index + 1
                                    }`}
                                />

                            )
                        )}

                    </div>


                    <button
                        type="button"
                        onClick={
                            nextSlide
                        }
                        aria-label="Next fashion image"
                    >

                        <i className="fa-solid fa-arrow-right"></i>

                    </button>

                </div>


            </div>


            {/* =================================================
                VERTICAL HERO TEXT
            ================================================== */}

            <div className="clothes-hero-side-text">

                KSAM DEAL
                <span>
                    /
                </span>
                FASHION

            </div>


            {/* =================================================
                SCROLL INDICATOR
            ================================================== */}

            <a
                href="#categories"
                className="clothes-hero-scroll"
                onClick={
                    scrollToCategories
                }
            >

                {/* <span>
                    SCROLL TO EXPLORE
                </span> */}

                <i className="fa-solid fa-arrow-down"></i>

            </a>


        </section>

    );

}


export default ClothesHero;