import React, { useEffect, useRef, useState } from "react";
import "./ProductCard.css";

function ProductCard({ product, onProductClick }) {

    const cardRef = useRef(null);

    const [isWishlisted, setIsWishlisted] = useState(false);


    /* =========================================
       CHECK WISHLIST
    ========================================= */

    useEffect(() => {

        const wishlist =
            JSON.parse(
                localStorage.getItem("watchWishlist")
            ) || [];

        const exists = wishlist.some(
            (item) => item.id === product.id
        );

        setIsWishlisted(exists);

    }, [product.id]);


    /* =========================================
       WISHLIST BUTTON
    ========================================= */

    const toggleWishlist = () => {

        const wishlist =
            JSON.parse(
                localStorage.getItem("watchWishlist")
            ) || [];


        const existingIndex =
            wishlist.findIndex(
                (item) => item.id === product.id
            );


        if (existingIndex !== -1) {

            // Remove from wishlist

            wishlist.splice(existingIndex, 1);

            setIsWishlisted(false);

        } else {

            // Add to wishlist

            wishlist.push(product);

            setIsWishlisted(true);

        }


        localStorage.setItem(
            "watchWishlist",
            JSON.stringify(wishlist)
        );

    };


    /* =========================================
       REPEAT IMAGE ANIMATION
    ========================================= */

    useEffect(() => {

        const observer =
            new IntersectionObserver(
                ([entry]) => {

                    if (entry.isIntersecting) {

                        cardRef.current?.classList.add(
                            "image-visible"
                        );

                    } else {

                        cardRef.current?.classList.remove(
                            "image-visible"
                        );

                    }

                },
                {
                    threshold: 0.2
                }
            );


        if (cardRef.current) {
            observer.observe(cardRef.current);
        }


        return () => {
            observer.disconnect();
        };

    }, []);


    return (

        <article
            ref={cardRef}
            className="watch-product-card"
        >


            {/* ================= IMAGE ================= */}

            <div className="watch-product-image-box">


                {/* PRODUCT BADGE */}

                {product.badge && (

                    <span className="watch-product-badge">
                        {product.badge}
                    </span>

                )}


                {/* WISHLIST */}

                <button
                    className={`watch-product-wishlist ${
                        isWishlisted
                            ? "wishlisted"
                            : ""
                    }`}
                    onClick={toggleWishlist}
                    aria-label={
                        isWishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                    }
                >
                    {isWishlisted ? "♥" : "♡"}
                </button>


                {/* PRODUCT IMAGE */}

                <img
                    src={product.image}
                    alt={product.name}
                    className="watch-product-image"
                />

            </div>



            {/* ================= PRODUCT INFO ================= */}

            <div className="watch-product-info">


                {/* CATEGORY */}

                <p className="watch-product-category">
                    {product.category}
                </p>


                {/* NAME */}

                <h3 className="watch-product-name">
                    {product.name}
                </h3>


                {/* RATING */}

                <div className="watch-product-rating">

                    <span className="watch-stars">

                        {"★".repeat(product.rating)}

                        {"☆".repeat(
                            5 - product.rating
                        )}

                    </span>


                    <span className="watch-reviews">
                        ({product.reviews})
                    </span>

                </div>


                {/* PRICE */}

                <p className="watch-product-price">
                    ${product.price.toFixed(2)}
                </p>


                {/* VIEW PRODUCT */}

                <button
                    className="watch-product-button"
                    onClick={() =>
                        onProductClick(product)
                    }
                >
                    VIEW PRODUCT
                </button>

            </div>

        </article>

    );
}

export default ProductCard;