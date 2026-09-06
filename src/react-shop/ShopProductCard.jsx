import React from "react";


function ShopProductCard({
    product,
    onProductClick,
    onAddToCart
}) {

    return (

        <article
            className="shop-product-card"
            style={{
                "--product-accent":
                    product.accent || "#7c3aed"
            }}
        >

            {/* PRODUCT IMAGE */}

            <div
                className="shop-product-image"
                onClick={() =>
                    onProductClick(product)
                }
            >

                <div className="shop-image-glow"></div>


                <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                />


                {/* DISCOUNT */}

                {product.discount && (

                    <span className="shop-discount-badge">
                        -{product.discount}%
                    </span>

                )}


                {/* QUICK VIEW */}

                <button
                    className="shop-quick-view"
                    onClick={(event) => {

                        event.stopPropagation();

                        onProductClick(product);

                    }}
                    aria-label="View product"
                >
                    👁
                </button>

            </div>


            {/* PRODUCT INFORMATION */}

            <div className="shop-product-info">

                <span className="shop-product-category">
                    {product.category}
                </span>


                <h3>
                    {product.name}
                </h3>


                <div className="shop-rating">

                    <span className="shop-stars">
                        ★★★★★
                    </span>

                    <span>
                        {product.rating}
                    </span>

                </div>


                <div className="shop-price">

                    <strong>
                        ${product.price}
                    </strong>


                    {product.oldPrice && (

                        <del>
                            ${product.oldPrice}
                        </del>

                    )}

                </div>


                {/* BUTTONS */}

                <div className="shop-product-actions">

                    <button
                        className="shop-view-button"
                        onClick={() =>
                            onProductClick(product)
                        }
                    >
                        View Details
                    </button>


                    <button
                        className="shop-add-button"
                        onClick={() =>
                            onAddToCart(product)
                        }
                    >
                        🛒 Add
                    </button>

                </div>

            </div>

        </article>

    );

}


export default ShopProductCard;