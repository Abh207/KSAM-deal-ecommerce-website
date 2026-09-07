import React, { useEffect, useState } from "react";
import "./ProductPopup.css";

function ProductPopup({ product, onClose, onCartUpdate }) {

    const [quantity, setQuantity] = useState(1);


    /* =========================================
       RESET QUANTITY
    ========================================= */

    useEffect(() => {

        setQuantity(1);

    }, [product]);


    if (!product) {
        return null;
    }


    /* =========================================
       INCREASE QUANTITY
    ========================================= */

    const increaseQuantity = () => {

        if (quantity < product.stock) {

            setQuantity(quantity + 1);

        }

    };


    /* =========================================
       DECREASE QUANTITY
    ========================================= */

    const decreaseQuantity = () => {

        if (quantity > 1) {

            setQuantity(quantity - 1);

        }

    };


    /* =========================================
       ADD TO CART
    ========================================= */

    const addToCart = () => {

        const existingCart =
            JSON.parse(
                localStorage.getItem("cartProductLS")
            ) || [];


        const existingProductIndex =
            existingCart.findIndex(
                (item) => item.id === product.id
            );


        if (existingProductIndex !== -1) {

            existingCart[existingProductIndex].quantity +=
                quantity;

        } else {

            existingCart.push({

                ...product,

                quantity: quantity

            });

        }


        localStorage.setItem(
            "cartProductLS",
            JSON.stringify(existingCart)
        );


        /* UPDATE CART COUNT IMMEDIATELY */

        if (onCartUpdate) {

            onCartUpdate();

        }


        /* CLOSE POPUP */

        onClose();


        /* =========================================
           CART NOTIFICATION
        ========================================= */

        const notification =
            document.createElement("div");


        notification.className =
            "watch-cart-notification";


        notification.innerHTML = `
            <span class="watch-cart-check">✓</span>

            <div>
                <strong>Added to Cart</strong>
                <p>${product.name}</p>
            </div>
        `;


        document.body.appendChild(
            notification
        );


        setTimeout(() => {

            notification.classList.add(
                "show"
            );

        }, 10);


        setTimeout(() => {

            notification.classList.remove(
                "show"
            );


            setTimeout(() => {

                notification.remove();

            }, 300);

        }, 2500);

    };


    return (

        <div
            className="watch-popup-overlay"
            onClick={onClose}
        >


            <div
                className="watch-popup"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >


                {/* CLOSE BUTTON */}

                <button
                    className="watch-popup-close"
                    onClick={onClose}
                >
                    ×
                </button>



                {/* PRODUCT IMAGE */}

                <div className="watch-popup-image-box">

                    <img
                        src={product.image}
                        alt={product.name}
                        className="watch-popup-image"
                    />

                </div>



                {/* PRODUCT DETAILS */}

                <div className="watch-popup-details">


                    {/* BADGE */}

                    {product.badge && (

                        <span className="watch-popup-badge">
                            {product.badge}
                        </span>

                    )}



                    {/* CATEGORY */}

                    <p className="watch-popup-category">
                        {product.category}
                    </p>



                    {/* NAME */}

                    <h2 className="watch-popup-name">
                        {product.name}
                    </h2>



                    {/* RATING */}

                    <div className="watch-popup-rating">

                        <span>
                            {"★".repeat(
                                product.rating
                            )}

                            {"☆".repeat(
                                5 - product.rating
                            )}
                        </span>

                        <small>
                            ({product.reviews} reviews)
                        </small>

                    </div>



                    {/* PRICE */}

                    <p className="watch-popup-price">

                        ${product.price.toFixed(2)}

                    </p>



                    {/* DESCRIPTION */}

                    <p className="watch-popup-description">

                        {product.description}

                    </p>



                    {/* STOCK */}

                    <p className="watch-popup-stock">

                        {product.stock > 0
                            ? `In Stock: ${product.stock} available`
                            : "Out of Stock"
                        }

                    </p>



                    {/* QUANTITY */}

                    {product.stock > 0 && (

                        <div className="watch-popup-quantity">

                            <span>
                                Quantity
                            </span>


                            <div className="watch-popup-quantity-box">


                                <button
                                    onClick={
                                        decreaseQuantity
                                    }
                                >
                                    −
                                </button>


                                <span>
                                    {quantity}
                                </span>


                                <button
                                    onClick={
                                        increaseQuantity
                                    }
                                >
                                    +
                                </button>


                            </div>

                        </div>

                    )}



                    {/* ADD TO CART */}

                    <button
                        className="watch-popup-cart-button"
                        onClick={addToCart}
                        disabled={product.stock <= 0}
                    >

                        {product.stock > 0
                            ? "ADD TO CART"
                            : "OUT OF STOCK"
                        }

                    </button>


                </div>

            </div>

        </div>

    );

}

export default ProductPopup;