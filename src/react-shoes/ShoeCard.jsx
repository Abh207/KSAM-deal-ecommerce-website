import React from "react";

function ShoeCard({
    product,
    isWishlisted,
    onWishlist,
    onQuickView
}) {

    const getImagePath = (image) => {

        if (!image) {
            return `${import.meta.env.BASE_URL}products/shoes/shoe1.png`;
        }

        return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, "")}`;
    };


    return (

        <article className="shoe-card">


            {/* PRODUCT IMAGE */}

            <div className="shoe-card-image-area">

                <img
                    src={getImagePath(product.image)}
                    alt={product.name}
                    className="shoe-card-image"
                />


                {/* PRODUCT BADGE */}

                {product.badge && (

                    <span className="shoe-badge">
                        {product.badge}
                    </span>

                )}


                {/* WISHLIST */}

                <button
                    type="button"
                    className={
                        isWishlisted
                            ? "shoe-wishlist active"
                            : "shoe-wishlist"
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


                {/* QUICK VIEW */}

                <button
                    type="button"
                    className="shoe-quick-view"
                    onClick={() =>
                        onQuickView(product)
                    }
                >

                    <i className="fa-solid fa-eye"></i>

                    Quick View

                </button>

            </div>



            {/* PRODUCT INFORMATION */}

            <div className="shoe-card-content">


                {/* CATEGORY */}

                <div className="shoe-card-category">

                    {product.category}

                </div>


                {/* NAME */}

                <h3 className="shoe-card-title">

                    {product.name}

                </h3>


                {/* RATING */}

                <div className="shoe-card-rating">

                    <span className="stars">

                        {"★".repeat(
                            Math.round(
                                product.rating
                            )
                        )}

                    </span>


                    <span className="rating-number">

                        {product.rating}

                    </span>


                    <span className="review-count">

                        ({product.reviews})

                    </span>

                </div>


                {/* PRICE */}

                <div className="shoe-card-price-row">

                    <strong className="shoe-price">

                        ₹
                        {Number(
                            product.price
                        ).toLocaleString("en-IN")}

                    </strong>


                    {product.oldPrice && (

                        <del className="shoe-old-price">

                            ₹
                            {Number(
                                product.oldPrice
                            ).toLocaleString("en-IN")}

                        </del>

                    )}


                    {product.discount && (

                        <span className="shoe-discount">

                            {product.discount}% OFF

                        </span>

                    )}

                </div>



                {/* PRODUCT META */}

                <div className="shoe-card-meta">

                    <span>

                        <i className="fa-solid fa-palette"></i>

                        {product.color}

                    </span>


                    <span>

                        <i className="fa-solid fa-box"></i>

                        {product.stock} left

                    </span>

                </div>



                {/* VIEW PRODUCT BUTTON */}

                <button
                    type="button"
                    className="shoe-view-product"
                    onClick={() =>
                        onQuickView(product)
                    }
                >

                    <i className="fa-solid fa-eye"></i>

                    View Product

                    <i className="fa-solid fa-arrow-right view-product-arrow"></i>

                </button>


            </div>

        </article>

    );

}


export default ShoeCard;