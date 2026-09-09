import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import "./FlashDeals.css";


function FlashDeals({
    products = [],
    onOpen,
    onAddToCart
}) {

    /* =====================================================
       COUNTDOWN
    ===================================================== */

    const getEndTime = () => {

        const savedEnd =
            localStorage.getItem(
                "ksamFlashDealEnd"
            );

        if (savedEnd) {

            const savedTime =
                Number(savedEnd);

            if (
                savedTime > Date.now()
            ) {
                return savedTime;
            }

        }

        const newEnd =
            Date.now() +
            (
                8 * 60 * 60 * 1000
            );

        localStorage.setItem(
            "ksamFlashDealEnd",
            String(newEnd)
        );

        return newEnd;
    };


    const [timeLeft, setTimeLeft] =
        useState(
            Math.max(
                0,
                getEndTime() - Date.now()
            )
        );


    /* =====================================================
       TIMER
    ===================================================== */

    useEffect(() => {

        const timer =
            setInterval(() => {

                const endTime =
                    Number(
                        localStorage.getItem(
                            "ksamFlashDealEnd"
                        )
                    );

                const remaining =
                    endTime - Date.now();


                if (remaining <= 0) {

                    const newEnd =
                        Date.now() +
                        (
                            8 *
                            60 *
                            60 *
                            1000
                        );

                    localStorage.setItem(
                        "ksamFlashDealEnd",
                        String(newEnd)
                    );

                    setTimeLeft(
                        8 *
                        60 *
                        60 *
                        1000
                    );

                } else {

                    setTimeLeft(
                        remaining
                    );

                }

            }, 1000);


        return () => {

            clearInterval(timer);

        };

    }, []);


    /* =====================================================
       FORMAT TIMER
    ===================================================== */

    const timerValues =
        useMemo(() => {

            const totalSeconds =
                Math.floor(
                    timeLeft / 1000
                );


            const hours =
                Math.floor(
                    totalSeconds / 3600
                );


            const minutes =
                Math.floor(
                    (totalSeconds % 3600) /
                    60
                );


            const seconds =
                totalSeconds % 60;


            return {

                hours:
                    String(hours)
                        .padStart(2, "0"),

                minutes:
                    String(minutes)
                        .padStart(2, "0"),

                seconds:
                    String(seconds)
                        .padStart(2, "0")

            };

        }, [timeLeft]);


    /* =====================================================
       SELECT DEAL PRODUCTS
    ===================================================== */

    const dealProducts =
        useMemo(() => {

            return [...products]
                .filter(
                    (product) =>
                        Number(
                            product.stock || 0
                        ) > 0
                )
                .sort(
                    (a, b) =>
                        Number(
                            b.discount || 0
                        ) -
                        Number(
                            a.discount || 0
                        )
                )
                .slice(0, 8);

        }, [products]);


    /* =====================================================
       IMAGE PATH
    ===================================================== */

    const getImage =
        (image) => {

            if (!image) {
                return "";
            }

            if (
                image.startsWith(
                    "http://"
                ) ||
                image.startsWith(
                    "https://"
                )
            ) {

                return image;

            }

            return (
                import.meta.env.BASE_URL +
                image.replace(
                    /^\/+/,
                    ""
                )
            );

        };


    /* =====================================================
       DISCOUNT
    ===================================================== */

    const getDiscount =
        (product) => {

            if (
                product.discount
            ) {

                return Number(
                    product.discount
                );

            }


            if (
                product.oldPrice &&
                product.price
            ) {

                return Math.round(
                    (
                        (
                            Number(
                                product.oldPrice
                            ) -
                            Number(
                                product.price
                            )
                        ) /
                        Number(
                            product.oldPrice
                        )
                    ) * 100
                );

            }


            return 0;

        };


    /* =====================================================
       SCROLL TO PRODUCTS
    ===================================================== */

    const viewAllDeals = () => {

        document
            .querySelector(
                ".home-products-grid"
            )
            ?.scrollIntoView({
                behavior: "smooth"
            });

    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <section className="flash-deals-section">


            {/* =================================================
               HEADER
            ================================================= */}

            <div className="flash-deals-header">

                <div className="flash-deals-title">

                    <span className="flash-deals-small-title">
                        LIMITED TIME OFFER
                    </span>

                    <h2>
                        <span>⚡</span>
                        FLASH DEALS
                    </h2>

                    <p>
                        Grab the biggest discounts
                        before the timer ends.
                    </p>

                </div>


                {/* =================================================
                   TIMER
                ================================================= */}

                <div className="flash-timer-wrapper">

                    <span className="flash-timer-label">
                        DEALS END IN
                    </span>

                    <div className="flash-timer">

                        <div className="flash-time-box">

                            <strong>
                                {
                                    timerValues.hours
                                }
                            </strong>

                            <small>
                                HRS
                            </small>

                        </div>


                        <span className="flash-time-separator">
                            :
                        </span>


                        <div className="flash-time-box">

                            <strong>
                                {
                                    timerValues.minutes
                                }
                            </strong>

                            <small>
                                MIN
                            </small>

                        </div>


                        <span className="flash-time-separator">
                            :
                        </span>


                        <div className="flash-time-box">

                            <strong>
                                {
                                    timerValues.seconds
                                }
                            </strong>

                            <small>
                                SEC
                            </small>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
               PRODUCTS
            ================================================= */}

            <div className="flash-deals-products">

                {dealProducts.map(
                    (product, index) => {

                        const discount =
                            getDiscount(
                                product
                            );


                        return (

                            <article
                                className="flash-deal-card"
                                key={product.id}
                                style={{
                                    "--flash-index":
                                        index
                                }}
                                onClick={() =>
                                    onOpen &&
                                    onOpen(
                                        product
                                    )
                                }
                            >


                                {/* IMAGE */}

                                <div className="flash-deal-image">

                                    <span className="flash-deal-tag">
                                        ⚡ DEAL
                                    </span>


                                    {discount > 0 && (

                                        <span className="flash-deal-discount">

                                            -{discount}%

                                        </span>

                                    )}


                                    <img
                                        src={
                                            getImage(
                                                product.image
                                            )
                                        }
                                        alt={
                                            product.name
                                        }
                                        loading={
                                            index < 3
                                                ? "eager"
                                                : "lazy"
                                        }
                                    />

                                </div>


                                {/* INFO */}

                                <div className="flash-deal-info">

                                    <span className="flash-deal-category">
                                        {product.category}
                                    </span>


                                    <h3>
                                        {product.name}
                                    </h3>


                                    <div className="flash-deal-rating">

                                        <span>
                                            ★
                                        </span>

                                        {product.rating || 0}

                                        <small>
                                            ({product.reviews || 0})
                                        </small>

                                    </div>


                                    <div className="flash-deal-price">

                                        <strong>
                                            ₹
                                            {Number(
                                                product.price || 0
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>


                                        {product.oldPrice && (

                                            <del>
                                                ₹
                                                {Number(
                                                    product.oldPrice
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </del>

                                        )}

                                    </div>


                                    <div className="flash-deal-bottom">

                                        <span className="flash-stock">

                                            🔥
                                            {" "}
                                            {product.stock}
                                            {" "}
                                            left

                                        </span>


                                        <button
                                            type="button"
                                            onClick={(event) => {

                                                event.stopPropagation();

                                                if (
                                                    onAddToCart &&
                                                    product.stock > 0
                                                ) {

                                                    onAddToCart(
                                                        product,
                                                        1
                                                    );

                                                }

                                            }}
                                            disabled={
                                                !product.stock ||
                                                product.stock <= 0
                                            }
                                        >
                                            ADD
                                        </button>

                                    </div>

                                </div>

                            </article>

                        );

                    }
                )}

            </div>


            {/* =================================================
               FOOTER BUTTON
            ================================================= */}

            <div className="flash-deals-footer">

                <button
                    type="button"
                    onClick={viewAllDeals}
                >
                    VIEW ALL DEALS
                    <span>→</span>
                </button>

            </div>

        </section>

    );

}


export default FlashDeals;