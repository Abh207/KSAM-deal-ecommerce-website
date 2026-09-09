import React, { useRef, useState } from "react";

import "./ProductCard.css";


function ProductCard({
    product,
    index = 0,
    isWishlisted = false,
    onWishlist,
    onOpen,
    onAddToCart
}) {

    const cardRef = useRef(null);

    const [isHovered, setIsHovered] =
        useState(false);

    const [added, setAdded] =
        useState(false);

    const [imageLoaded, setImageLoaded] =
        useState(false);


    /* =====================================================
       IMAGE URL
    ===================================================== */

    const imageUrl =
        `${import.meta.env.BASE_URL}${product.image}`;


    /* =====================================================
       DISCOUNT
    ===================================================== */

    const discount =
        Number(product.discount) ||
        (
            product.oldPrice &&
            product.price
                ? Math.round(
                    (
                        (Number(product.oldPrice) -
                            Number(product.price)) /
                        Number(product.oldPrice)
                    ) * 100
                )
                : 0
        );


    /* =====================================================
       STOCK
    ===================================================== */

    const stock =
        Number(product.stock || 0);


    const stockPercentage =
        Math.min(
            100,
            Math.max(
                5,
                (stock / 20) * 100
            )
        );


    /* =====================================================
       MOUSE 3D EFFECT
    ===================================================== */

    const handleMouseMove = (event) => {

        if (!cardRef.current) {
            return;
        }

        const card =
            cardRef.current;

        const rect =
            card.getBoundingClientRect();


        const x =
            event.clientX -
            rect.left;


        const y =
            event.clientY -
            rect.top;


        const centerX =
            rect.width / 2;


        const centerY =
            rect.height / 2;


        const rotateX =
            ((y - centerY) / centerY) *
            -4;


        const rotateY =
            ((x - centerX) / centerX) *
            4;


        card.style.setProperty(
            "--mouse-x",
            `${x}px`
        );

        card.style.setProperty(
            "--mouse-y",
            `${y}px`
        );

        card.style.setProperty(
            "--rotate-x",
            `${rotateX}deg`
        );

        card.style.setProperty(
            "--rotate-y",
            `${rotateY}deg`
        );

    };


    /* =====================================================
       RESET 3D EFFECT
    ===================================================== */

    const handleMouseLeave = () => {

        setIsHovered(false);

        if (!cardRef.current) {
            return;
        }

        cardRef.current.style.setProperty(
            "--rotate-x",
            "0deg"
        );

        cardRef.current.style.setProperty(
            "--rotate-y",
            "0deg"
        );

    };


    /* =====================================================
       ADD TO CART
    ===================================================== */

    const handleAddToCart = (event) => {

        event.stopPropagation();

        if (stock <= 0) {
            return;
        }


        if (onAddToCart) {

            onAddToCart(product);

        }


        setAdded(true);


        setTimeout(() => {

            setAdded(false);

        }, 1800);

    };


    /* =====================================================
       OPEN PRODUCT
    ===================================================== */

    const handleOpen = () => {

        if (onOpen) {

            onOpen(product);

        }

    };


    return (

        <article
            ref={cardRef}

            className={
                `dynamic-product-card ${
                    isHovered
                        ? "card-hovered"
                        : ""
                } ${
                    added
                        ? "card-added"
                        : ""
                }`
            }

            style={{
                "--card-index": index
            }}

            onMouseEnter={() =>
                setIsHovered(true)
            }

            onMouseMove={
                handleMouseMove
            }

            onMouseLeave={
                handleMouseLeave
            }

            onClick={
                handleOpen
            }
        >


            {/* =================================================
               MOUSE LIGHT
            ================================================= */}

            <div className="product-card-light"></div>



            {/* =================================================
               IMAGE SECTION
            ================================================= */}

            <div className="dynamic-product-image">


                {/* TOP BADGES */}

                <div className="product-top-badges">

                    {product.badge && (

                        <span className="dynamic-product-badge">

                            {product.badge}

                        </span>

                    )}


                    {discount > 0 && (

                        <span className="dynamic-product-discount">

                            -{discount}%

                        </span>

                    )}

                </div>



                {/* WISHLIST */}

                <button
                    type="button"

                    className={
                        `dynamic-product-wishlist ${
                            isWishlisted
                                ? "active"
                                : ""
                        }`
                    }

                    aria-label={
                        isWishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                    }

                    onClick={(event) => {

                        event.stopPropagation();

                        if (onWishlist) {

                            onWishlist(
                                product.id
                            );

                        }

                    }}
                >

                    <span>

                        {isWishlisted
                            ? "♥"
                            : "♡"}

                    </span>

                </button>



                {/* IMAGE LOADING */}

                {!imageLoaded && (

                    <div className="product-image-loader">

                        <div></div>

                    </div>

                )}



                {/* PRODUCT IMAGE */}

                <img
                    src={imageUrl}

                    alt={product.name}

                    className={
                        imageLoaded
                            ? "loaded"
                            : ""
                    }

                    loading={
                        index < 4
                            ? "eager"
                            : "lazy"
                    }

                    onLoad={() =>
                        setImageLoaded(true)
                    }

                    onError={() =>
                        setImageLoaded(true)
                    }
                />



                {/* IMAGE SHINE */}

                <div className="product-image-shine"></div>



                {/* QUICK ACTIONS */}

                <div className="product-hover-actions">

                    <button
                        type="button"

                        onClick={(event) => {

                            event.stopPropagation();

                            handleOpen();

                        }}
                    >

                        <span>
                            👁
                        </span>

                        QUICK VIEW

                    </button>


                    <button
                        type="button"

                        disabled={
                            stock <= 0
                        }

                        onClick={
                            handleAddToCart
                        }
                    >

                        <span>
                            🛒
                        </span>

                        {added
                            ? "ADDED"
                            : "ADD TO CART"}

                    </button>

                </div>

            </div>



            {/* =================================================
               PRODUCT INFO
            ================================================= */}

            <div className="dynamic-product-info">


                {/* CATEGORY */}

                <span className="dynamic-product-category">

                    {product.category}

                </span>



                {/* NAME */}

                <h2
                    title={product.name}
                >

                    {product.name}

                </h2>



                {/* RATING */}

                <div className="dynamic-product-rating">

                    <span className="stars">

                        {"★".repeat(
                            Math.min(
                                5,
                                Number(
                                    product.rating || 0
                                )
                            )
                        )}

                    </span>


                    <strong>

                        {product.rating || 0}

                    </strong>


                    <small>

                        ({product.reviews || 0})

                    </small>

                </div>



                {/* PRICE */}

                <div className="dynamic-product-price">

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


                    {discount > 0 && (

                        <span>

                            Save {discount}%

                        </span>

                    )}

                </div>



                {/* STOCK */}

                <div className="dynamic-product-stock">

                    <div className="stock-text">

                        <span>

                            {stock > 0
                                ? "IN STOCK"
                                : "OUT OF STOCK"}

                        </span>


                        {stock > 0 && (

                            <small>

                                {stock} left

                            </small>

                        )}

                    </div>


                    {stock > 0 && (

                        <div className="stock-bar">

                            <span
                                style={{
                                    width:
                                        `${stockPercentage}%`
                                }}
                            ></span>

                        </div>

                    )}

                </div>



                {/* VIEW BUTTON */}

                <button
                    type="button"

                    className="dynamic-product-button"

                    onClick={(event) => {

                        event.stopPropagation();

                        handleOpen();

                    }}
                >

                    <span>
                        VIEW PRODUCT
                    </span>

                    <strong>
                        →
                    </strong>

                </button>

            </div>


            {/* =================================================
               ADDED EFFECT
            ================================================= */}

            {added && (

                <div className="card-added-indicator">

                    ✓ Added to cart

                </div>

            )}

        </article>

    );

}


export default ProductCard;