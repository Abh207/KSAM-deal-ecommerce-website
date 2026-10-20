import React from "react";


const getImagePath = (image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) return image;
    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const clean = image.replace(/^\/+/, "");
    if (image.startsWith(normalizedBase)) return image;
    return `${normalizedBase}${clean}`;
};

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
                    src={getImagePath(product.image)}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fb = document.createElement("div");
                        fb.style.cssText = "width:100%;height:100%;min-height:160px;display:flex;align-items:center;justify-content:center;background:#18181b;color:#a1a1aa;font-size:12px;font-weight:700;text-align:center;padding:10px;border-radius:12px;";
                        fb.textContent = product.name || "Product";
                        if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.appendChild(fb);
                        }
                    }}
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