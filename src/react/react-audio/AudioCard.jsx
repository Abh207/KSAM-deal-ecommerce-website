import React, { useState } from "react";

const getImagePath = (image) => {
    if (!image) return "";

    return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, "")}`;
};

function AudioCard({
    product,
    isWishlisted,
    onWishlist,
    onAddToCart,
    onViewProduct
}) {

    const [imageError, setImageError] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = () => {

        setIsAdding(true);

        onAddToCart(product);

        setTimeout(() => {
            setIsAdding(false);
        }, 700);

    };


    return (

        <article className="audio-product-card">


            {/* =================================================
                IMAGE AREA
            ================================================= */}

            <div className="audio-card-image">


                {/* Product Badge */}

                {product.badge && (

                    <span className="audio-card-badge">
                        {product.badge}
                    </span>

                )}


                {/* Discount */}

                {product.discount && (

                    <span className="audio-card-discount">
                        -{product.discount}%
                    </span>

                )}


                {/* Wishlist */}

                <button
                    className={`audio-card-wishlist ${
                        isWishlisted
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        onWishlist(product)
                    }
                    aria-label="Add to wishlist"
                >

                    <i
                        className={
                            isWishlisted
                                ? "fa-solid fa-heart"
                                : "fa-regular fa-heart"
                        }
                    ></i>

                </button>


                {/* Product Image */}

                {!imageError ? (

                    <img
                        src={getImagePath(
                            product.image
                        )}
                        alt={product.name}
                        loading="lazy"
                        onError={() =>
                            setImageError(true)
                        }
                    />

                ) : (

                    <div className="audio-card-image-fallback">

                        <i className="fa-solid fa-headphones"></i>

                    </div>

                )}


                {/* Hover View Button */}

                <button
                    className="audio-card-quick-view"
                    onClick={() =>
                        onViewProduct(product)
                    }
                >

                    <i className="fa-regular fa-eye"></i>

                    View product

                </button>


            </div>


            {/* =================================================
                PRODUCT INFORMATION
            ================================================= */}

            <div className="audio-card-content">


                {/* Brand + Category */}

                <div className="audio-card-meta">

                    <span>
                        {product.brand}
                    </span>

                    <span>
                        {product.category}
                    </span>

                </div>


                {/* Product Name */}

                <h3>
                    {product.name}
                </h3>


                {/* Rating */}

                <div className="audio-card-rating">

                    <span className="audio-stars">
                        ★
                    </span>

                    <strong>
                        {product.rating}
                    </strong>

                    <span>
                        ({product.reviews})
                    </span>

                </div>


                {/* Price */}

                <div className="audio-card-price">

                    <strong>
                        ₹{product.price.toLocaleString("en-IN")}
                    </strong>

                    {product.oldPrice && (

                        <del>
                            ₹{product.oldPrice.toLocaleString("en-IN")}
                        </del>

                    )}

                    {product.discount && (

                        <span>
                            {product.discount}% OFF
                        </span>

                    )}

                </div>


                {/* Color */}

                {product.color && (

                    <div className="audio-card-color">

                        <span>
                            Color
                        </span>

                        <strong>
                            {product.color}
                        </strong>

                    </div>

                )}


                {/* Features */}

                {product.features?.length > 0 && (

                    <div className="audio-card-features">

                        {product.features
                            .slice(0, 3)
                            .map(
                                (
                                    feature,
                                    index
                                ) => (

                                    <span
                                        key={
                                            `${product.id}-feature-${index}`
                                        }
                                    >
                                        {feature}
                                    </span>

                                )
                            )}

                    </div>

                )}


                {/* Stock */}

                <div className="audio-card-stock">

                    {product.stock > 0 ? (

                        <>

                            <span className="stock-dot"></span>

                            {product.stock <= 10
                                ? `Only ${product.stock} left`
                                : "In stock"}

                        </>

                    ) : (

                        <span className="out-of-stock">
                            Out of stock
                        </span>

                    )}

                </div>


                {/* Actions */}

                <div className="audio-card-actions">


                    <button
                        className="audio-card-cart"
                        onClick={
                            handleAddToCart
                        }
                        disabled={
                            product.stock <= 0 ||
                            isAdding
                        }
                    >

                        {isAdding ? (

                            <>
                                <i className="fa-solid fa-check"></i>

                                Added
                            </>

                        ) : (

                            <>
                                <i className="fa-solid fa-cart-plus"></i>

                                Add to cart
                            </>

                        )}

                    </button>


                    <button
                        className="audio-card-view"
                        onClick={() =>
                            onViewProduct(product)
                        }
                    >

                        <i className="fa-regular fa-eye"></i>

                    </button>

                </div>

            </div>

        </article>

    );

}

export default AudioCard;