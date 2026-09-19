import React from "react";


function ClothesCard({
    product,
    isWishlisted,
    onWishlist,
    onViewProduct,
    onAddToCart
}) {


    /* =====================================================
       IMAGE PATH
    ====================================================== */

    const getImagePath = (image) => {

        if (!image) {
            return "";
        }

        return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, "")}`;

    };


    /* =====================================================
       PRICE FORMAT
    ====================================================== */

    const formatPrice = (price) => {

        return Number(
            price || 0
        ).toLocaleString("en-IN");

    };


    /* =====================================================
       STAR RATING
    ====================================================== */

    const renderStars = (rating) => {

        const roundedRating =
            Math.round(
                Number(rating || 0)
            );

        return "★".repeat(
            Math.min(
                roundedRating,
                5
            )
        );

    };


    /* =====================================================
       IMAGE
    ====================================================== */

    const imagePath =
        getImagePath(
            product.image
        );


    /* =====================================================
       RENDER
    ====================================================== */

    return (

        <article
            className="clothes-product-card"
        >


            {/* =================================================
                PRODUCT IMAGE
            ================================================== */}

            <div className="clothes-product-image-wrap">


                {imagePath ? (

                    <img
                        src={imagePath}
                        alt={
                            product.name ||
                            "KSAM Deal fashion product"
                        }
                        className="clothes-product-image"
                        loading="lazy"
                        onError={(event) => {

                            event.currentTarget.style.display =
                                "none";

                            event.currentTarget.parentElement.classList.add(
                                "image-missing"
                            );

                        }}
                    />

                ) : null}


                {/* =================================================
                    IMAGE FALLBACK
                ================================================== */}

                <div className="clothes-card-image-fallback">

                    <span>
                        {product.category ||
                            "FASHION"}
                    </span>

                    <strong>
                        KSAM
                    </strong>

                    <small>
                        DEAL
                    </small>

                </div>


                {/* =================================================
                    PRODUCT BADGE
                ================================================== */}

                {product.badge && (

                    <span className="clothes-product-badge">

                        {product.badge}

                    </span>

                )}


                {/* =================================================
                    WISHLIST
                ================================================== */}

                <button
                    type="button"
                    className={
                        `clothes-wishlist ${
                            isWishlisted
                                ? "active"
                                : ""
                        }`
                    }
                    onClick={() =>
                        onWishlist(product)
                    }
                    aria-label={
                        isWishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                    }
                >

                    <i
                        className={
                            isWishlisted
                                ? "fa-solid fa-heart"
                                : "fa-regular fa-heart"
                        }
                    ></i>

                </button>


                {/* =================================================
                    HOVER OVERLAY
                ================================================== */}

                <div className="clothes-image-overlay">


                    <button
                        type="button"
                        className="clothes-overlay-view"
                        onClick={() =>
                            onViewProduct(product)
                        }
                    >

                        <i className="fa-solid fa-eye"></i>

                        Quick View

                    </button>


                </div>


                {/* =================================================
                    IMAGE NUMBER
                ================================================== */}

                <span className="clothes-image-number">

                    /
                    {String(
                        product.id ||
                        "01"
                    ).replace(
                        /\D/g,
                        ""
                    ).slice(-2) || "01"}

                </span>


            </div>


            {/* =================================================
                PRODUCT INFORMATION
            ================================================== */}

            <div className="clothes-product-content">


                {/* BRAND / CATEGORY */}

                <div className="clothes-product-topline">

                    <span className="clothes-product-category">

                        {product.brand ||
                            product.category ||
                            "KSAM DEAL"}

                    </span>


                    {product.stock !== undefined && (

                        <span
                            className={
                                Number(product.stock) <= 5
                                    ? "clothes-stock low"
                                    : "clothes-stock"
                            }
                        >

                            {Number(product.stock) <= 5
                                ? `Only ${product.stock} left`
                                : "In stock"}

                        </span>

                    )}

                </div>


                {/* PRODUCT NAME */}

                <h3 className="clothes-product-name">

                    {product.name}

                </h3>


                {/* RATING */}

                <div className="clothes-product-rating">


                    <span className="clothes-stars">

                        {renderStars(
                            product.rating
                        )}

                    </span>


                    <strong>

                        {Number(
                            product.rating || 0
                        ).toFixed(1)}

                    </strong>


                    <span>

                        (
                        {product.reviews || 0}
                        )

                    </span>

                </div>


                {/* PRICE */}

                <div className="clothes-price-row">


                    <strong className="clothes-current-price">

                        ₹
                        {formatPrice(
                            product.price
                        )}

                    </strong>


                    {product.oldPrice && (

                        <del className="clothes-old-price">

                            ₹
                            {formatPrice(
                                product.oldPrice
                            )}

                        </del>

                    )}


                    {product.discount && (

                        <span className="clothes-discount">

                            {product.discount}%
                            OFF

                        </span>

                    )}

                </div>


                {/* COLOR */}

                {product.color && (

                    <div className="clothes-product-color">

                        <span>
                            Color
                        </span>

                        <strong>
                            {product.color}
                        </strong>

                    </div>

                )}


                {/* SIZES */}

                {product.sizes?.length > 0 && (

                    <div className="clothes-size-row">


                        <span className="clothes-size-label">

                            Sizes

                        </span>


                        <div className="clothes-size-list">

                            {product.sizes
                                .slice(
                                    0,
                                    4
                                )
                                .map(
                                    (size) => (

                                        <span
                                            className="clothes-size"
                                            key={size}
                                        >

                                            {size}

                                        </span>

                                    )
                                )}


                            {product.sizes.length > 4 && (

                                <span className="clothes-more-size">

                                    +
                                    {
                                        product
                                            .sizes
                                            .length - 4
                                    }

                                </span>

                            )}

                        </div>

                    </div>

                )}


                {/* =================================================
                    ACTION BUTTONS
                ================================================== */}

                <div className="clothes-card-actions">


                    {/* VIEW PRODUCT */}

                    <button
                        type="button"
                        className="clothes-view-product"
                        onClick={() =>
                            onViewProduct(product)
                        }
                    >

                        <span>
                            View Product
                        </span>

                        <i className="fa-solid fa-arrow-right"></i>

                    </button>


                    {/* ADD TO CART */}

                    <button
                        type="button"
                        className="clothes-add-cart"
                        onClick={() =>
                            onAddToCart(product)
                        }
                        aria-label={`Add ${product.name} to cart`}
                    >

                        <i className="fa-solid fa-bag-shopping"></i>

                        <span>
                            Add
                        </span>

                    </button>

                </div>


            </div>

        </article>

    );

}


export default ClothesCard;