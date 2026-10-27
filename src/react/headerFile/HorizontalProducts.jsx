import React, {
    useEffect,
    useRef,
    useState
} from "react";

import horizontalProductsData
    from "../../api/horizontalProducts.json";
import { isInWishlist, toggleWishlist, subscribeWishlist } from "../../lib/wishlist.js";
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

    const [, setWishlistVersion] = useState(0);

    useEffect(() => {
        const unsub = subscribeWishlist(() => {
            setWishlistVersion((v) => v + 1);
        });
        return unsub;
    }, []);


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


            const scrollStep =
                typeof window !== "undefined" && window.innerWidth < 560
                    ? Math.round(window.innerWidth * 0.85 + 18)
                    : 398;

            slider.scrollBy({

                left:
                    direction * scrollStep,

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

                                            <button
                                                type="button"
                                                className={`horizontal-card-wishlist-btn ${isInWishlist(product.id) ? "is-active" : ""}`}
                                                aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleWishlist(product);
                                                }}
                                                style={{
                                                    position: "absolute",
                                                    top: "10px",
                                                    right: "10px",
                                                    zIndex: 5,
                                                    width: "38px",
                                                    height: "38px",
                                                    borderRadius: "50%",
                                                    background: "rgba(0, 0, 0, 0.65)",
                                                    border: "1px solid rgba(255, 255, 255, 0.35)",
                                                    backdropFilter: "blur(8px)",
                                                    WebkitBackdropFilter: "blur(8px)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer",
                                                    color: "#ffffff",
                                                    fontSize: "16px",
                                                    lineHeight: 1,
                                                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.4)",
                                                    transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = "#ffffff";
                                                    e.currentTarget.style.boxShadow = "0 0 12px rgba(255, 255, 255, 0.45)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.35)";
                                                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.4)";
                                                }}
                                            >
                                                {isInWishlist(product.id) ? "♥" : "♡"}
                                            </button>


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