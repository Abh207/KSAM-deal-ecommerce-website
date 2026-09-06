import React, { useEffect, useState } from "react";
import "./ShopPromo.css";

const promoProducts = [
    {
        id: 301,
        type: "laptop",
        title: "MacBook Air M2",
        subtitle: "Supercharged by M2.",
        price: 999,
        oldPrice: 1099,
        category: "Laptops",
        image: "/KSAM-deal-ecommerce-website/macbook.jpg"
    },
    {
        id: 302,
        type: "headphones",
        title: "Wireless Headphones",
        subtitle: "Premium sound. Zero limits.",
        price: 149,
        oldPrice: 249,
        category: "Audio",
        image:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=90"
    },
    {
        id: 303,
        type: "audio",
        title: "Premium Audio",
        subtitle: "Sound that moves you.",
        price: 199,
        oldPrice: 299,
        category: "Audio",
        image:
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=90"
    },
    {
        id: 304,
        type: "camera",
        title: "Professional Camera",
        subtitle: "Capture every detail.",
        price: 799,
        oldPrice: 999,
        category: "Cameras",
        image:
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=90"
    }
];

function ShopPromo() {

    const [timeLeft, setTimeLeft] = useState({
        hours: 5,
        minutes: 59,
        seconds: 59
    });

    const [activeOffer, setActiveOffer] = useState(0);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [cartMessage, setCartMessage] = useState("");

    /* =========================
       COUNTDOWN
    ========================= */

    useEffect(() => {

        const timer = setInterval(() => {

            setTimeLeft((previous) => {

                let {
                    hours,
                    minutes,
                    seconds
                } = previous;

                if (seconds > 0) {
                    seconds--;
                } else {
                    seconds = 59;

                    if (minutes > 0) {
                        minutes--;
                    } else {
                        minutes = 59;

                        if (hours > 0) {
                            hours--;
                        } else {
                            hours = 5;
                        }
                    }
                }

                return {
                    hours,
                    minutes,
                    seconds
                };
            });

        }, 1000);

        return () => clearInterval(timer);

    }, []);


    /* =========================
       ROTATING DEAL
    ========================= */

    useEffect(() => {

        const offerTimer = setInterval(() => {

            setActiveOffer((previous) =>
                (previous + 1) % 3
            );

        }, 3500);

        return () => clearInterval(offerTimer);

    }, []);


    /* =========================
       ADD TO CART
    ========================= */

    const addToCart = (product) => {

        try {

            const cart =
                JSON.parse(
                    localStorage.getItem(
                        "cartProductLS"
                    )
                ) || [];

            const existingProduct =
                cart.find(
                    (item) =>
                        Number(item.id) ===
                        Number(product.id)
                );

            if (existingProduct) {

                existingProduct.quantity =
                    Number(
                        existingProduct.quantity || 1
                    ) + 1;

            } else {

                cart.push({
                    id: product.id,
                    name: product.title,
                    category: product.category,
                    price: product.price,
                    oldPrice: product.oldPrice,
                    image: product.image,
                    quantity: 1
                });

            }

            localStorage.setItem(
                "cartProductLS",
                JSON.stringify(cart)
            );

            setCartMessage(
                `${product.title} added to cart ✓`
            );

            setTimeout(() => {
                setCartMessage("");
            }, 2500);

        } catch (error) {

            console.error(
                "Unable to add product:",
                error
            );

        }

    };


    /* =========================
       SHOP CATEGORY
    ========================= */

    const shopCategory = (category) => {

        window.location.href =
            `./shop.html?category=${encodeURIComponent(
                category
            )}`;

    };


    return (

        <section className="shop-promo-section">

            {/* TOP LABEL */}

            <div className="promo-heading">

                <div>
                    <span>
                        KSAM DEAL
                    </span>

                    <h2>
                        Today's Best Deals
                    </h2>
                </div>

                <div className="promo-live">

                    <span className="live-dot"></span>

                    <span>
                        LIVE DEALS
                    </span>

                </div>

            </div>


            {/* PROMO GRID */}

            <div className="shop-promo-grid">


                {/* =========================
                    LAPTOP
                ========================= */}

                <article
                    className="promo-card promo-laptop"
                    onClick={() =>
                        setSelectedProduct(
                            promoProducts[0]
                        )
                    }
                >

                    <div className="promo-shine"></div>

                    <div className="promo-content">

                        <span className="promo-small-text">
                            LIMITED TIME OFFER
                        </span>

                        <h2>
                            MacBook
                            <br />
                            Air M2
                        </h2>

                        <p className="promo-highlight">
                            Supercharged by M2.
                        </p>

                        <div className="promo-price">

                            From{" "}

                            <strong>
                                $999
                            </strong>

                            <del>
                                $1099
                            </del>

                        </div>

                        <button
                            className="promo-button"
                            onClick={(event) => {
                                event.stopPropagation();
                                addToCart(
                                    promoProducts[0]
                                );
                            }}
                        >
                            Add To Cart
                            <span>→</span>
                        </button>

                    </div>


                    <div className="promo-product-image laptop-image">

                        <img
                            src={promoProducts[0].image}
                            alt="MacBook Air M2"
                        />

                    </div>


                    <div className="promo-discount">
                        -9%
                    </div>

                </article>


                {/* =========================
                    HEADPHONES
                ========================= */}

                <article
                    className="promo-card promo-headphones"
                    onClick={() =>
                        setSelectedProduct(
                            promoProducts[1]
                        )
                    }
                >

                    <div className="promo-glow"></div>

                    <div className="promo-content">

                        <span className="promo-small-text">
                            MEGA DEAL
                        </span>

                        <h2>
                            Grab Up To
                            <br />
                            <span>
                                40% Off
                            </span>
                        </h2>

                        <p className="promo-highlight">
                            On selected items
                        </p>

                        <button
                            className="promo-button"
                            onClick={(event) => {
                                event.stopPropagation();
                                addToCart(
                                    promoProducts[1]
                                );
                            }}
                        >
                            Add To Cart
                            <span>→</span>
                        </button>

                    </div>


                    <div className="promo-product-image headphone-image">

                        <img
                            src={promoProducts[1].image}
                            alt="Wireless headphones"
                        />

                    </div>


                    <div className="promo-floating-badge">

                        40%
                        <small>
                            OFF
                        </small>

                    </div>

                </article>


                {/* =========================
                    AUDIO
                ========================= */}

                <article
                    className="promo-card promo-audio"
                    onClick={() =>
                        setSelectedProduct(
                            promoProducts[2]
                        )
                    }
                >

                    <div className="promo-content">

                        <span className="promo-small-text">
                            PREMIUM AUDIO
                        </span>

                        <h2>
                            {activeOffer === 0
                                ? "Sound That Moves You."
                                : activeOffer === 1
                                ? "Feel Every Beat."
                                : "Music. Reimagined."
                            }
                        </h2>

                        <p>
                            Premium audio experience
                            for every moment.
                        </p>

                        <button
                            className="promo-button"
                            onClick={(event) => {
                                event.stopPropagation();
                                addToCart(
                                    promoProducts[2]
                                );
                            }}
                        >
                            Add To Cart
                            <span>→</span>
                        </button>

                    </div>


                    <div className="promo-product-image audio-image">

                        <img
                            src={promoProducts[2].image}
                            alt="Premium headphones"
                        />

                    </div>

                </article>


                {/* =========================
                    CAMERA
                ========================= */}

                <article
                    className="promo-card promo-camera"
                    onClick={() =>
                        setSelectedProduct(
                            promoProducts[3]
                        )
                    }
                >

                    <div className="promo-content">

                        <span className="promo-small-text">
                            PRO COLLECTION
                        </span>

                        <h2>
                            Capture Every
                            <br />
                            Detail.
                        </h2>

                        <p>
                            Professional cameras
                            for professionals.
                        </p>

                        <button
                            className="promo-button"
                            onClick={(event) => {
                                event.stopPropagation();
                                addToCart(
                                    promoProducts[3]
                                );
                            }}
                        >
                            Add To Cart
                            <span>→</span>
                        </button>

                    </div>


                    <div className="promo-product-image camera-image">

                        <img
                            src={promoProducts[3].image}
                            alt="Professional camera"
                        />

                    </div>

                </article>

            </div>


            {/* =========================
                COUNTDOWN
            ========================= */}

            <div className="promo-bottom-bar">

                <div className="deal-message">

                    <span className="fire">
                        🔥
                    </span>

                    <div>

                        <strong>
                            Flash Sale Ending Soon
                        </strong>

                        <small>
                            Grab your favorite tech before the deal disappears.
                        </small>

                    </div>

                </div>


                <div className="countdown">

                    <div>
                        <strong>
                            {String(
                                timeLeft.hours
                            ).padStart(2, "0")}
                        </strong>

                        <small>
                            HRS
                        </small>
                    </div>

                    <span>:</span>

                    <div>
                        <strong>
                            {String(
                                timeLeft.minutes
                            ).padStart(2, "0")}
                        </strong>

                        <small>
                            MIN
                        </small>
                    </div>

                    <span>:</span>

                    <div>
                        <strong>
                            {String(
                                timeLeft.seconds
                            ).padStart(2, "0")}
                        </strong>

                        <small>
                            SEC
                        </small>
                    </div>

                </div>

            </div>


            {/* =========================
                TOAST
            ========================= */}

            {cartMessage && (

                <div className="promo-cart-toast">

                    <span>✓</span>

                    {cartMessage}

                    <a href="./addToCart.html">
                        View Cart
                    </a>

                </div>

            )}


            {/* =========================
                QUICK VIEW MODAL
            ========================= */}

            {selectedProduct && (

                <div
                    className="promo-modal-overlay"
                    onClick={() =>
                        setSelectedProduct(null)
                    }
                >

                    <div
                        className="promo-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <button
                            className="promo-modal-close"
                            onClick={() =>
                                setSelectedProduct(null)
                            }
                        >
                            ×
                        </button>


                        <div className="promo-modal-image">

                            <img
                                src={
                                    selectedProduct.image
                                }
                                alt={
                                    selectedProduct.title
                                }
                            />

                        </div>


                        <div className="promo-modal-info">

                            <span>
                                {selectedProduct.category}
                            </span>

                            <h2>
                                {selectedProduct.title}
                            </h2>

                            <p>
                                {selectedProduct.subtitle}
                            </p>

                            <div className="modal-price">

                                <strong>
                                    $
                                    {
                                        selectedProduct.price
                                    }
                                </strong>

                                <del>
                                    $
                                    {
                                        selectedProduct.oldPrice
                                    }
                                </del>

                            </div>

                            <button
                                className="modal-cart-button"
                                onClick={() => {
                                    addToCart(
                                        selectedProduct
                                    );

                                    setSelectedProduct(
                                        null
                                    );
                                }}
                            >
                                Add To Cart
                                <span>
                                    →
                                </span>
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </section>
    );
}

export default ShopPromo;