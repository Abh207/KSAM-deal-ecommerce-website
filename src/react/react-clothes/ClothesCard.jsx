import React, { useState } from "react";
import { buildProductUid } from "../../lib/cartHelper.js";

function ClothesCard({
    product,
    isWishlisted,
    onWishlist,
    onAddToCart
}) {
    const [addedQuick, setAddedQuick] = useState(false);

    /* =====================================================
       IMAGE PATH
    ====================================================== */
    const getImagePath = (image) => {
        if (!image) return "";
        if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) return image;
        const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
        const normalizedBase = base.endsWith("/") ? base : `${base}/`;
        const clean = image.replace(/^\/+/, "");
        if (image.startsWith(normalizedBase)) return image;
        return `${normalizedBase}${clean}`;
    };

    /* =====================================================
       PRODUCT URL (product.html)
    ====================================================== */
    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const uid = product.uid || buildProductUid(product.category, product.id);
    const productUrl = `${normalizedBase}product.html?id=${encodeURIComponent(product.id)}&category=${encodeURIComponent(product.category)}&uid=${encodeURIComponent(uid)}&from=clothing`;

    /* =====================================================
       DISCOUNT CALCULATION
    ====================================================== */
    const oldPriceNum = Number(product.oldPrice || product.actualPrice || 0);
    const priceNum = Number(product.price || 0);
    const discount = product.discount || (oldPriceNum > priceNum ? Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100) : 0);

    /* =====================================================
       QUICK CART
    ====================================================== */
    const handleQuickAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const itemWithDefaults = {
            ...product,
            selectedSize: product.sizes?.[0] || "M",
            selectedColor: product.color || "Default"
        };
        if (onAddToCart) {
            onAddToCart(itemWithDefaults);
        }
        setAddedQuick(true);
        setTimeout(() => setAddedQuick(false), 1200);
    };

    const imagePath = getImagePath(product.image);

    /* =====================================================
       RENDER
    ====================================================== */
    return (
        <article
            className="clothes-product-card"
            data-category={product.category}
            data-id={product.id}
        >
            {/* =================================================
                IMAGE CONTAINER (4/5 Aspect Ratio, object-fit contain)
            ================================================== */}
            <div className="clothes-product-image-container">
                <a
                    href={productUrl}
                    className="clothes-product-image-link"
                    aria-label={`View details for ${product.name}`}
                >
                    {imagePath && (
                        <img
                            src={imagePath}
                            alt={product.name || "KSAM Deal fashion"}
                            className="clothes-product-image"
                            loading="lazy"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.parentElement?.classList.add("image-missing");
                            }}
                        />
                    )}
                </a>

                {/* IMAGE FALLBACK */}
                <div className="clothes-card-image-fallback">
                    <span>{product.category || "CLOTHES"}</span>
                    <strong>KSAM</strong>
                    <small>DEAL</small>
                </div>

                {/* DISCOUNT BADGE */}
                {discount > 0 && (
                    <span className="clothes-discount-badge">
                        {discount}% OFF
                    </span>
                )}

                {/* WISHLIST BUTTON */}
                <button
                    type="button"
                    className={`clothes-card-wishlist-btn ${isWishlisted ? "is-active" : ""}`}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onWishlist) {
                            onWishlist(product);
                        }
                    }}
                >
                    <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                </button>
            </div>

            {/* =================================================
                CARD CONTENT
            ================================================== */}
            <div className="clothes-product-content">
                <p className="clothes-product-category">
                    {product.category || "CLOTHING"}
                </p>

                <h3 className="clothes-product-name">
                    <a
                        href={productUrl}
                        className="clothes-product-name-link"
                    >
                        {product.name}
                    </a>
                </h3>

                <p className="clothes-product-brand">
                    {product.brand || "KSAM Basics"}
                </p>

                <p className="clothes-product-description">
                    {product.description || "Premium fabric tailored for contemporary everyday comfort and street style."}
                </p>

                <div className="clothes-product-price">
                    <span className="clothes-current-price">
                        ₹{priceNum.toLocaleString("en-IN")}
                    </span>

                    {oldPriceNum > 0 && (
                        <del className="clothes-original-price">
                            ₹{oldPriceNum.toLocaleString("en-IN")}
                        </del>
                    )}
                </div>

                <p className="clothes-stock">
                    {Number(product.stock) > 0
                        ? `${product.stock} items available`
                        : "Out of stock"}
                </p>

                {/* =================================================
                    BOTTOM ACTION ROW: [Square Cart Button] [View Product →]
                ================================================== */}
                <div className="clothes-product-actions">
                    <button
                        type="button"
                        className={`clothes-quick-cart-btn ${addedQuick ? "is-added" : ""}`}
                        onClick={handleQuickAddToCart}
                        aria-label={`Add ${product.name} to cart`}
                        title="Add to Cart"
                        disabled={Number(product.stock) <= 0}
                    >
                        {addedQuick ? (
                            <i className="fa-solid fa-check"></i>
                        ) : (
                            <i className="fa-solid fa-bag-shopping"></i>
                        )}
                    </button>

                    <a
                        href={productUrl}
                        className="clothes-view-product-btn"
                        aria-label={`View details for ${product.name}`}
                    >
                        <span className="clothes-view-btn-full">View Product</span>
                        <span className="clothes-view-btn-short">View</span>
                        <i className="fa-solid fa-arrow-right clothes-view-btn-arrow"></i>
                    </a>
                </div>
            </div>
        </article>
    );
}

export default ClothesCard;