import React, {
    useEffect,
    useRef,
    useState
} from "react";

import horizontalProductsData
    from "../../api/horizontalProducts.json";

import "./HorizontalProducts.css";


function HorizontalProducts({
    products = [],
    onOpen,
    onAddToCart
}) {

    const sliderRef =
        useRef(null);


    const animationRef =
        useRef(null);


    const [isPaused, setIsPaused] =
        useState(false);


    /* =====================================================
       SECTION SETTINGS
    ===================================================== */

    const sectionSettings =
        horizontalProductsData.section || {};


    const scrollSpeed =
        Number(
            sectionSettings.scrollSpeed || 0.6
        );


    /* =====================================================
       GET PRODUCTS FROM MAIN JSON
    ===================================================== */

    const horizontalProductIds =
        horizontalProductsData.products || [];


    const displayProducts =
        horizontalProductIds
            .map((productId) => {

                return products.find(
                    (product) =>
                        String(product.id) ===
                        String(productId)
                );

            })
            .filter(Boolean);


    /* =====================================================
       IMAGE PATH
    ===================================================== */

    const getImage =
        (image) => {

            if (!image) {
                return "";
            }


            if (
                image.startsWith("http://") ||
                image.startsWith("https://")
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
                product.discount !== undefined &&
                product.discount !== null
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
       AUTO SCROLL
    ===================================================== */

    useEffect(() => {

        const slider =
            sliderRef.current;


        if (
            !slider ||
            !sectionSettings.autoScroll ||
            displayProducts.length < 2
        ) {

            return;

        }


        const autoScroll =
            () => {

                if (!isPaused) {

                    slider.scrollLeft +=
                        scrollSpeed;


                    /*
                     * Restart from beginning
                     * when reaching the end.
                     */

                    if (
                        slider.scrollLeft +
                        slider.clientWidth >=
                        slider.scrollWidth - 2
                    ) {

                        slider.scrollLeft = 0;

                    }

                }


                animationRef.current =
                    requestAnimationFrame(
                        autoScroll
                    );

            };


        animationRef.current =
            requestAnimationFrame(
                autoScroll
            );


        return () => {

            if (
                animationRef.current
            ) {

                cancelAnimationFrame(
                    animationRef.current
                );

            }

        };

    }, [
        isPaused,
        scrollSpeed,
        sectionSettings.autoScroll,
        displayProducts.length
    ]);


    /* =====================================================
       MANUAL NAVIGATION
    ===================================================== */

    const moveSlider =
        (direction) => {

            const slider =
                sliderRef.current;


            if (!slider) {
                return;
            }


            slider.scrollBy({

                left:
                    direction * 330,

                behavior:
                    "smooth"

            });

        };


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (
        displayProducts.length === 0
    ) {

        return null;

    }


    return (

        <section
            className="horizontal-products-section"
        >


            {/* =================================================
               HEADER
            ================================================= */}

            <div
                className="horizontal-products-header"
            >

                <div>

                    <span
                        className="horizontal-eyebrow"
                    >
                        {
                            sectionSettings.eyebrow ||
                            "TRENDING NOW"
                        }
                    </span>


                    <h2>

                        {
                            sectionSettings.title ||
                            "Popular Products"
                        }

                    </h2>


                    <p>

                        {
                            sectionSettings.description ||
                            "Discover our popular products."
                        }

                    </p>

                </div>


                {/* =================================================
                   CONTROLS
                ================================================= */}

                <div
                    className="horizontal-controls"
                >

                    <button
                        type="button"
                        aria-label="Previous products"
                        onClick={() =>
                            moveSlider(-1)
                        }
                    >
                        ←
                    </button>


                    <button
                        type="button"
                        aria-label="Next products"
                        onClick={() =>
                            moveSlider(1)
                        }
                    >
                        →
                    </button>

                </div>

            </div>


            {/* =================================================
               PRODUCT SLIDER
            ================================================= */}

            <div
                className="horizontal-slider-wrapper"

                onMouseEnter={() =>
                    setIsPaused(true)
                }

                onMouseLeave={() =>
                    setIsPaused(false)
                }

                onTouchStart={() =>
                    setIsPaused(true)
                }

                onTouchEnd={() =>
                    setIsPaused(false)
                }
            >

                <div
                    ref={sliderRef}
                    className="horizontal-products-slider"
                >

                    {
                        displayProducts.map(
                            (product, index) => {

                                const discount =
                                    getDiscount(
                                        product
                                    );


                                return (

                                    <article
                                        key={
                                            product.id
                                        }

                                        className="horizontal-product-card"

                                        onClick={() =>
                                            onOpen &&
                                            onOpen(
                                                product
                                            )
                                        }
                                    >


                                        {/* IMAGE */}

                                        <div
                                            className="horizontal-product-image"
                                        >

                                            {
                                                discount >
                                                0 && (

                                                    <span
                                                        className="horizontal-discount"
                                                    >
                                                        -{discount}%
                                                    </span>

                                                )
                                            }


                                            {
                                                product.badge && (

                                                    <span
                                                        className="horizontal-badge"
                                                    >
                                                        {
                                                            product.badge
                                                        }
                                                    </span>

                                                )
                                            }


                                            <img
                                                src={
                                                    getImage(
                                                        product.image
                                                    )
                                                }

                                                alt={
                                                    product.name ||
                                                    "Product"
                                                }

                                                loading={
                                                    index < 4
                                                        ? "eager"
                                                        : "lazy"
                                                }

                                                onError={(
                                                    event
                                                ) => {

                                                    event.currentTarget.style.opacity =
                                                        "0";

                                                }}
                                            />

                                        </div>


                                        {/* PRODUCT INFORMATION */}

                                        <div
                                            className="horizontal-product-info"
                                        >

                                            <span
                                                className="horizontal-category"
                                            >
                                                {
                                                    product.category
                                                }
                                            </span>


                                            <h3>

                                                {
                                                    product.name
                                                }

                                            </h3>


                                            {/* RATING */}

                                            <div
                                                className="horizontal-rating"
                                            >

                                                <span>
                                                    ★
                                                </span>

                                                {
                                                    product.rating ||
                                                    0
                                                }

                                                <small>
                                                    (
                                                    {
                                                        product.reviews ||
                                                        0
                                                    }
                                                    )
                                                </small>

                                            </div>


                                            {/* PRICE */}

                                            <div
                                                className="horizontal-price"
                                            >

                                                <strong>

                                                    ₹
                                                    {
                                                        Number(
                                                            product.price ||
                                                            0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )
                                                    }

                                                </strong>


                                                {
                                                    product.oldPrice && (

                                                        <del>

                                                            ₹
                                                            {
                                                                Number(
                                                                    product.oldPrice
                                                                ).toLocaleString(
                                                                    "en-IN"
                                                                )
                                                            }

                                                        </del>

                                                    )
                                                }

                                            </div>


                                            {/* CART */}

                                            <button
                                                type="button"

                                                disabled={
                                                    product.stock !==
                                                    undefined &&
                                                    Number(
                                                        product.stock
                                                    ) <= 0
                                                }

                                                onClick={(
                                                    event
                                                ) => {

                                                    event.stopPropagation();


                                                    if (
                                                        onAddToCart
                                                    ) {

                                                        onAddToCart(
                                                            product,
                                                            1
                                                        );

                                                    }

                                                }}
                                            >

                                                {
                                                    product.stock !==
                                                    undefined &&
                                                    Number(
                                                        product.stock
                                                    ) <= 0
                                                        ? "OUT OF STOCK"
                                                        : "ADD TO CART"
                                                }

                                            </button>

                                        </div>

                                    </article>

                                );

                            }
                        )
                    }

                </div>

            </div>


            {/* =================================================
               AUTO SCROLL STATUS
            ================================================= */}

            {
                sectionSettings.autoScroll && (

                    <div
                        className="horizontal-scroll-status"
                    >

                        <span
                            className={
                                isPaused
                                    ? "paused"
                                    : ""
                            }
                        ></span>


                        {
                            isPaused
                                ? "PAUSED"
                                : "AUTO SCROLLING"
                        }

                    </div>

                )
            }

        </section>

    );

}


export default HorizontalProducts;