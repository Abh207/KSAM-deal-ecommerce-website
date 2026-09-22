import React, {
    useState
} from "react";


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

    const [adding, setAdding] =
        useState(false);


    const handleAdd = () => {

        setAdding(true);

        onAddToCart(product);

        setTimeout(() => {
            setAdding(false);
        }, 800);

    };


    return (

        <article className="audio-product-card">


            {/* IMAGE */}

            <div className="audio-product-image">

                {product.badge && (

                    <span className="audio-product-badge">
                        {product.badge}
                    </span>

                )}


                {product.discount && (

                    <span className="audio-product-discount">
                        -{product.discount}%
                    </span>

                )}


                <button
                    className={
                        `audio-wishlist ${
                            isWishlisted
                                ? "active"
                                : ""
                        }`
                    }
                    onClick={() =>
                        onWishlist(product)
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


                <img
                    src={getImagePath(
                        product.image
                    )}
                    alt={product.name}
                    loading="lazy"
                />


                <button
                    className="audio-view-overlay"
                    onClick={() =>
                        onViewProduct(product)
                    }
                >
                    Quick view
                    <i className="fa-solid fa-arrow-right"></i>
                </button>

            </div>


            {/* CONTENT */}

            <div className="audio-product-content">

                <div className="audio-product-meta">

                    <span>
                        {product.brand}
                    </span>

                    <span>
                        {product.category}
                    </span>

                </div>


                <h3>
                    {product.name}
                </h3>


                <div className="audio-product-rating">

                    <span>
                        ★
                    </span>

                    <strong>
                        {product.rating}
                    </strong>

                    <small>
                        ({product.reviews})
                    </small>

                </div>


                <div className="audio-product-price">

                    <strong>
                        ₹
                        {Number(
                            product.price
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

                    <span>
                        {product.discount}% OFF
                    </span>

                </div>


                {product.features?.length > 0 && (

                    <div className="audio-product-tags">

                        {product.features
                            .slice(0, 3)
                            .map(
                                (
                                    feature,
                                    index
                                ) => (

                                    <span
                                        key={index}
                                    >
                                        {feature}
                                    </span>

                                )
                            )}

                    </div>

                )}


                <div className="audio-stock">

                    <i></i>

                    {product.stock <= 10
                        ? `Only ${product.stock} left`
                        : "In stock"}

                </div>


                <div className="audio-product-actions">

                    <button
                        className="audio-add-cart"
                        onClick={handleAdd}
                        disabled={
                            product.stock <= 0 ||
                            adding
                        }
                    >

                        {adding ? (
                            <>
                                <i className="fa-solid fa-check"></i>
                                Added
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-bag-shopping"></i>
                                Add to cart
                            </>
                        )}

                    </button>


                    <button
                        className="audio-eye-button"
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