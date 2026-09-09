import React, {
    useEffect,
    useState
} from "react";

import "./DiscountBanner.css";


function DiscountBanner() {

    const offers = [
        {
            id: 1,
            eyebrow: "LIMITED TIME OFFER",
            title: "UP TO 60% OFF",
            subtitle: "Upgrade Your Everyday",
            description:
                "Discover amazing products at prices you'll love.",
            button: "SHOP DEALS",
            accent: "01"
        },

        {
            id: 2,
            eyebrow: "MEGA SAVINGS",
            title: "SAVE MORE TODAY",
            subtitle: "Big Deals. Better Choices.",
            description:
                "Find your favourites before these offers disappear.",
            button: "EXPLORE DEALS",
            accent: "02"
        },

        {
            id: 3,
            eyebrow: "SPECIAL COLLECTION",
            title: "DEALS YOU CAN'T MISS",
            subtitle: "Something For Everyone",
            description:
                "Shop trending products with exclusive discounts.",
            button: "SHOP NOW",
            accent: "03"
        }
    ];


    const [activeOffer, setActiveOffer] =
        useState(0);


    /* =====================================================
       AUTO CHANGE
    ===================================================== */

    useEffect(() => {

        const timer =
            setInterval(() => {

                setActiveOffer(
                    (current) =>
                        (
                            current + 1
                        ) %
                        offers.length
                );

            }, 5000);


        return () =>
            clearInterval(timer);

    }, [offers.length]);


    /* =====================================================
       SCROLL TO PRODUCTS
    ===================================================== */

    const shopNow = () => {

        document
            .querySelector(
                ".home-products-grid"
            )
            ?.scrollIntoView({
                behavior: "smooth"
            });

    };


    const currentOffer =
        offers[activeOffer];


    return (

        <section
            className="discount-banner-section"
        >

            <div
                className="discount-banner"
            >


                {/* =================================================
                   BACKGROUND DECORATION
                ================================================= */}

                <div
                    className="discount-decoration discount-decoration-one"
                ></div>

                <div
                    className="discount-decoration discount-decoration-two"
                ></div>


                {/* =================================================
                   LEFT CONTENT
                ================================================= */}

                <div
                    className="discount-banner-content"
                    key={currentOffer.id}
                >

                    <span
                        className="discount-banner-eyebrow"
                    >
                        {currentOffer.eyebrow}
                    </span>


                    <h2>
                        {currentOffer.title}
                    </h2>


                    <h3>
                        {currentOffer.subtitle}
                    </h3>


                    <p>
                        {currentOffer.description}
                    </p>


                    <button
                        type="button"
                        className="discount-banner-button"
                        onClick={shopNow}
                    >
                        {currentOffer.button}

                        <span>
                            →
                        </span>

                    </button>

                </div>


                {/* =================================================
                   VISUAL
                ================================================= */}

                <div
                    className="discount-banner-visual"
                >

                    <div
                        className="discount-circle discount-circle-one"
                    ></div>

                    <div
                        className="discount-circle discount-circle-two"
                    ></div>

                    <div
                        className="discount-floating-card discount-card-one"
                    >
                        -60%
                    </div>

                    <div
                        className="discount-floating-card discount-card-two"
                    >
                        SALE
                    </div>

                    <div
                        className="discount-main-shape"
                    >

                        <span>
                            {currentOffer.accent}
                        </span>

                    </div>

                </div>


                {/* =================================================
                   SLIDER INDICATORS
                ================================================= */}

                <div
                    className="discount-indicators"
                >

                    {offers.map(
                        (offer, index) => (

                            <button
                                key={offer.id}
                                type="button"
                                aria-label={
                                    `Show offer ${index + 1}`
                                }
                                className={
                                    index === activeOffer
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setActiveOffer(
                                        index
                                    )
                                }
                            ></button>

                        )
                    )}

                </div>

            </div>

        </section>

    );

}


export default DiscountBanner;