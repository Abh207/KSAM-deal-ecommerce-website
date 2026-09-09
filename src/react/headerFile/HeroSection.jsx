import React, { useEffect, useState } from "react";

import "./HeroSection.css";

function HeroSection() {

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {

        const timer = setTimeout(() => {
            setLoaded(true);
        }, 100);

        return () => clearTimeout(timer);

    }, []);


    const scrollToProducts = () => {

        const products =
            document.getElementById("products");

        if (products) {

            products.scrollIntoView({
                behavior: "smooth"
            });

        }

    };


    const scrollToCategories = () => {

        const categories =
            document.getElementById("categories");

        if (categories) {

            categories.scrollIntoView({
                behavior: "smooth"
            });

        }

    };


    return (

        <section
            className={
                `hero-section ${
                    loaded ? "hero-loaded" : ""
                }`
            }
        >

            {/* BACKGROUND EFFECTS */}

            <div className="hero-orb hero-orb-one"></div>

            <div className="hero-orb hero-orb-two"></div>

            <div className="hero-grid"></div>


            {/* MAIN CONTENT */}

            <div className="hero-container">

                <div className="hero-content">


                    <div className="hero-brand">

                        <span></span>

                        KSAM DEAL

                        <span></span>

                    </div>


                    <div className="hero-tag">

                        PREMIUM ONLINE SHOPPING

                    </div>


                    <h1>

                        EVERYTHING

                        <span>
                            YOU WANT.
                        </span>

                        ONE PLACE.

                    </h1>


                    <p className="hero-description">

                        Discover premium gadgets,
                        watches, furniture, beauty
                        products and everyday essentials
                        carefully selected for you.

                    </p>


                    <div className="hero-actions">


                        <button
                            type="button"
                            className="hero-shop-button"
                            onClick={scrollToProducts}
                        >

                            SHOP NOW

                            <span>
                                →
                            </span>

                        </button>


                        <button
                            type="button"
                            className="hero-explore-button"
                            onClick={scrollToCategories}
                        >

                            EXPLORE COLLECTIONS

                        </button>


                    </div>


                    {/* TRUST INFORMATION */}

                    <div className="hero-stats">


                        <div className="hero-stat">

                            <strong>
                                100+
                            </strong>

                            <span>
                                PRODUCTS
                            </span>

                        </div>


                        <div className="hero-stat-line"></div>


                        <div className="hero-stat">

                            <strong>
                                4.8
                                <small>★</small>
                            </strong>

                            <span>
                                CUSTOMER RATING
                            </span>

                        </div>


                        <div className="hero-stat-line"></div>


                        <div className="hero-stat">

                            <strong>
                                24/7
                            </strong>

                            <span>
                                SHOPPING
                            </span>

                        </div>


                    </div>

                </div>


                {/* RIGHT VISUAL */}

                <div className="hero-visual">


                    <div className="hero-circle hero-circle-one"></div>

                    <div className="hero-circle hero-circle-two"></div>


                    <div className="hero-floating-card hero-card-top">

                        <span>
                            TRENDING
                        </span>

                        <strong>
                            NEW
                        </strong>

                    </div>


                    <div className="hero-main-product">

                        <div className="hero-product-glow"></div>

                        <div className="hero-product-shape">

                            <span>
                                KSAM
                            </span>

                            <strong>
                                DEAL
                            </strong>

                        </div>

                    </div>


                    <div className="hero-floating-card hero-card-bottom">

                        <span>
                            ★
                        </span>

                        <div>

                            <strong>
                                4.8 / 5
                            </strong>

                            <small>
                                Happy Customers
                            </small>

                        </div>

                    </div>


                </div>

            </div>


            {/* BOTTOM SCROLL */}

            <button
                type="button"
                className="hero-scroll"
                onClick={scrollToProducts}
            >

                <span>
                    SCROLL TO SHOP
                </span>

                <div className="hero-scroll-line"></div>

            </button>

        </section>

    );

}

export default HeroSection;