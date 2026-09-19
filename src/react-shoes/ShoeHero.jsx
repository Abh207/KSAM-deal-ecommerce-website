import React, { useEffect, useState } from "react";
import heroData from "../../api/shoes-featured.json";

function ShoeHero() {

    const products = heroData.heroProducts;

    const [activeIndex, setActiveIndex] = useState(0);

    const activeProduct = products[activeIndex];


    // AUTOMATIC SLIDER
    useEffect(() => {

        const timer = setInterval(() => {

            setActiveIndex((previous) =>
                (previous + 1) % products.length
            );

        }, 4500);

        return () => clearInterval(timer);

    }, [products.length]);


    const getImagePath = (image) => {

        return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, "")}`;

    };


    const formatPrice = (price) => {

        return Number(price).toLocaleString("en-IN");

    };


    const handleExplore = () => {

        document
            .getElementById("shoe-products")
            ?.scrollIntoView({
                behavior: "smooth"
            });

    };


    const handleViewProduct = () => {

        document
            .getElementById("shoe-products")
            ?.scrollIntoView({
                behavior: "smooth"
            });

    };


    return (

        <section className="shoe-hero">

            {/* BACKGROUND DECORATION */}

            <div className="shoe-hero-glow shoe-hero-glow-one"></div>

            <div className="shoe-hero-glow shoe-hero-glow-two"></div>


            <div className="shoe-hero-container">


                {/* LEFT SIDE */}

                <div className="shoe-hero-content">


                     {/* KSAM DEAL LOGO */}

    <div className="shoe-hero-logo">
        <img
            src={`${import.meta.env.BASE_URL}ksam-deal-logo.png`}
            alt="KSAM Deal"
        />
    </div>

    {/* HERO LABEL */}


                    <div className="shoe-hero-label">

                        <span className="shoe-label-dot">
                            ●
                        </span>

                        STEP INTO SOMETHING NEW

                    </div>


                    <h1>

                        Find your

                        <span>
                            perfect pair.
                        </span>

                    </h1>


                    <p className="shoe-hero-description">

                        Discover sneakers, running shoes,
                        sports footwear, casual styles and
                        premium boots designed for every step.

                    </p>


                    <div className="shoe-hero-actions">


                        <button
                            type="button"
                            className="shoe-hero-primary"
                            onClick={handleExplore}
                        >

                            Explore Shoes

                            <span>↓</span>

                        </button>


                        <div className="shoe-hero-trust">

                            <span className="trust-check">
                                ✓
                            </span>

                            Easy returns

                        </div>

                    </div>


                    {/* STATS */}

                    <div className="shoe-hero-stats">


                        <div>

                            <strong>
                                {products.length * 2}+
                            </strong>

                            <span>
                                Styles
                            </span>

                        </div>


                        <div>

                            <strong>
                                {activeProduct.rating}★
                            </strong>

                            <span>
                                Top rated
                            </span>

                        </div>


                        <div>

                            <strong>
                                ₹999
                            </strong>

                            <span>
                                Free delivery
                            </span>

                        </div>

                    </div>


                </div>


                {/* RIGHT SIDE */}

                <div className="shoe-hero-visual">


                    {/* FAST DELIVERY BADGE */}

                    <div className="shoe-floating-badge delivery">

                        🚚

                        <span>
                            Fast Delivery
                        </span>

                    </div>


                    {/* MAIN PRODUCT CARD */}

                    <div
                        className="shoe-feature-card"
                        key={activeProduct.id}
                    >


                        <div className="shoe-feature-tag">

                            {activeProduct.tag}

                        </div>


                        <div className="shoe-feature-image-wrapper">

                            <img
                                src={getImagePath(
                                    activeProduct.image
                                )}
                                alt={activeProduct.name}
                                className="shoe-feature-image"
                            />

                        </div>


                        <div className="shoe-feature-info">


                            <span className="shoe-feature-category">

                                {activeProduct.category}

                            </span>


                            <h2>

                                {activeProduct.name}

                            </h2>


                            <div className="shoe-feature-price">

                                ₹
                                {formatPrice(
                                    activeProduct.price
                                )}

                            </div>


                            <div className="shoe-feature-rating">

                                <span>
                                    ★
                                </span>

                                {activeProduct.rating}

                                <small>
                                    ({activeProduct.reviews})
                                </small>

                            </div>

                        </div>

                    </div>


                    {/* RATING BADGE */}

                    <div className="shoe-floating-badge rating">

                        ★

                        <span>

                            {activeProduct.rating} Rated

                        </span>

                    </div>


                    {/* MINI PRODUCTS */}

                    <div className="shoe-mini-products">


                        {products
                            .slice(0, 3)
                            .map((product, index) => (

                                <div
                                    className={
                                        index === activeIndex
                                            ? "shoe-mini-card active"
                                            : "shoe-mini-card"
                                    }
                                    key={product.id}
                                >


                                    <div className="shoe-mini-image">

                                        <img
                                            src={getImagePath(
                                                product.image
                                            )}
                                            alt={product.name}
                                        />

                                    </div>


                                    <div className="shoe-mini-info">

                                        <span>
                                            {product.category}
                                        </span>

                                        <strong>
                                            {product.name}
                                        </strong>

                                        <b>
                                            ₹
                                            {formatPrice(
                                                product.price
                                            )}
                                        </b>

                                    </div>

                                </div>

                            ))}


                    </div>


                    {/* SLIDER INDICATOR */}

                    <div className="shoe-slider-control">


                        <div className="shoe-slider-dots">

                            {products.map((product, index) => (

                                <button
                                    key={product.id}
                                    type="button"
                                    className={
                                        index === activeIndex
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setActiveIndex(index)
                                    }
                                    aria-label={`Show ${product.name}`}
                                />

                            ))}

                        </div>


                        <span>

                            0{activeIndex + 1}

                            <small>
                                / 0{products.length}
                            </small>

                        </span>

                    </div>


                </div>

            </div>


            {/* BOTTOM FEATURE STRIP */}

            <div className="shoe-hero-benefits">


                <div>

                    <strong>
                        Free Delivery
                    </strong>

                    <span>
                        On orders above ₹999
                    </span>

                </div>


                <div>

                    <strong>
                        Easy Returns
                    </strong>

                    <span>
                        Simple 7-day returns
                    </span>

                </div>


                <div>

                    <strong>
                        Secure Payments
                    </strong>

                    <span>
                        Safe & trusted checkout
                    </span>

                </div>


                <div>

                    <strong>
                        Fresh Styles
                    </strong>

                    <span>
                        New products added regularly
                    </span>

                </div>


            </div>

        </section>

    );

}


export default ShoeHero;