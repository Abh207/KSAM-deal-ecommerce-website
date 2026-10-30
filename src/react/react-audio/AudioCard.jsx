import React, { useState } from "react";
import { ShoppingBag, Check, ArrowRight } from "lucide-react";
import { buildProductUid } from "../../lib/cartHelper.js";

const getImagePath = (image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) return image;
    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    let clean = image.replace(/^\/+/, "");
    clean = clean.replace(/\.(png|jpe?g)$/i, ".webp");
    if (clean.startsWith(normalizedBase.replace(/^\/+|\/+$/g, ""))) {
        return `/${clean}`;
    }
    return `${normalizedBase}${clean}`;
};

function AudioCard({
    product,
    isWishlisted,
    onWishlist,
    onAddToCart
}) {
    const [addedQuick, setAddedQuick] = useState(false);

    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const uid = product.uid || buildProductUid(product.category, product.id);
    const productUrl = `${normalizedBase}product.html?id=${encodeURIComponent(product.id)}&category=${encodeURIComponent(product.category || "Audio")}&uid=${encodeURIComponent(uid)}&from=audio`;

    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onWishlist(product);
    };

    const handleQuickAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onAddToCart) {
            onAddToCart(product);
        }
        setAddedQuick(true);
        setTimeout(() => setAddedQuick(false), 1200);
    };

    const rawOldPrice = Number(product.oldPrice || product.originalPrice || product.actualPrice || 0);
    const hasDiscount = Boolean(rawOldPrice && rawOldPrice > product.price);
    const discount = hasDiscount
        ? Math.round(((rawOldPrice - product.price) / rawOldPrice) * 100)
        : Number(product.discount) || 50;

    const brandName = product.brand || "KSAM Audio";
    const shortDesc = product.description || "Immerse yourself in rich, high-fidelity sound tuned with precision acoustic drivers and deep bass.";
    const stockCount = product.stock !== undefined ? Number(product.stock) : 18;

    return (
        <article
            className="audio-product-card watch-product-card-themed"
            data-category={product.category}
            data-id={product.id}
        >
            {/* Image Area on Top */}
            <div className="audio-product-image watch-image-container">
                <a
                    href={productUrl}
                    className="beauty-product-image-link"
                    aria-label={`View details for ${product.name}`}
                >
                    <img
                        src={getImagePath(product.image)}
                        alt={product.name}
                        className="watch-product-img-contain"
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fb = document.createElement("div");
                            fb.style.cssText = "width:100%;height:100%;min-height:160px;display:flex;align-items:center;justify-content:center;background:#18181b;color:#a1a1aa;font-size:12px;font-weight:700;text-align:center;padding:10px;border-radius:12px;";
                            fb.textContent = product.name || "Audio";
                            if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.appendChild(fb);
                            }
                        }}
                    />
                </a>

                {/* Top-Left Black Pill Discount Badge */}
                <span className="beauty-discount-badge watch-discount-badge">
                    {discount}% OFF
                </span>

                {/* Top-Right Round Wishlist Heart */}
                <button
                    type="button"
                    className={`audio-wishlist beauty-card-wishlist-btn watch-wishlist-btn ${isWishlisted ? "is-active" : ""}`}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    onClick={handleWishlistClick}
                >
                    <span className="heart-icon">{isWishlisted ? "♥" : "♡"}</span>
                </button>
            </div>

            {/* Product Content Block */}
            <div className="audio-product-content watch-product-content">
                {/* Category label in small uppercase letter-spaced green text */}
                <p className="beauty-product-category watch-cat-label">
                    {product.category || "AUDIO"}
                </p>

                {/* Product Name in Bold */}
                <h3 className="beauty-product-name watch-name">
                    <a
                        href={productUrl}
                        className="beauty-product-name-link"
                    >
                        {product.name}
                    </a>
                </h3>

                {/* Bold Grey Brand Name */}
                <p className="beauty-product-brand watch-brand">
                    {brandName}
                </p>

                {/* Short 2-line description in grey */}
                <p className="beauty-product-description watch-desc">
                    {shortDesc}
                </p>

                {/* Price in large bold ₹ with old price struck through in grey */}
                <div className="beauty-product-price watch-price-row">
                    <span className="beauty-current-price watch-cur-price">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>

                    {rawOldPrice > 0 && (
                        <span className="beauty-original-price watch-old-price">
                            ₹{Number(rawOldPrice).toLocaleString("en-IN")}
                        </span>
                    )}
                </div>

                {/* Stock Text: green "N items available" */}
                <p className="beauty-stock watch-stock-text">
                    {stockCount > 0
                        ? `${stockCount} items available`
                        : "Out of stock"}
                </p>

                {/* Bottom Row Actions */}
                <div className="beauty-product-actions watch-actions-row">
                    {/* Square black cart icon button */}
                    <button
                        type="button"
                        className={`beauty-quick-cart-btn watch-quick-cart-btn ${addedQuick ? "is-added" : ""}`}
                        onClick={handleQuickAddToCart}
                        aria-label="Add to Cart"
                        title="Add to Cart"
                        disabled={stockCount <= 0}
                    >
                        {addedQuick ? (
                            <Check size={20} strokeWidth={2.5} />
                        ) : (
                            <ShoppingBag size={20} strokeWidth={2} />
                        )}
                    </button>

                    {/* Wide light-green outlined View Product button */}
                    <a
                        href={productUrl}
                        className="beauty-view-product-btn watch-view-btn"
                        aria-label={`View details for ${product.name}`}
                    >
                        <span className="beauty-view-btn-full">View Product</span>
                        <span className="beauty-view-btn-short">View</span>
                        <ArrowRight size={16} className="beauty-view-btn-arrow" />
                    </a>
                </div>
            </div>
        </article>
    );
}

export default AudioCard;