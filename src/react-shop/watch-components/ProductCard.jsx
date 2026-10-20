import React, { useEffect, useRef, useState } from "react";
import { requireAuth } from "../../auth/auth.js";
import "./ProductCard.css";

const getImagePath = (image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) return image;
    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const clean = image.replace(/^\/+/, "");
    if (image.startsWith(normalizedBase)) return image;
    return `${normalizedBase}${clean}`;
};

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
        if (!requireAuth({ type: "wishlist", product })) {
            return;
        }

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
                    src={getImagePath(product.image)}
                    alt={product.name}
                    className="watch-product-image"
                    onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fb = document.createElement("div");
                        fb.style.cssText = "width:100%;height:100%;min-height:160px;display:flex;align-items:center;justify-content:center;background:#18181b;color:#a1a1aa;font-size:12px;font-weight:700;text-align:center;padding:10px;border-radius:12px;";
                        fb.textContent = product.name || "Watch";
                        if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.appendChild(fb);
                        }
                    }}
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