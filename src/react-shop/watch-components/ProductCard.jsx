import React, { useState, useEffect } from "react";
import { ShoppingBag, Check, ArrowRight } from "lucide-react";
import { isInWishlist, toggleWishlist as sharedToggleWishlist, subscribeWishlist } from "../../lib/wishlist.js";
import { buildProductUid } from "../../lib/cartHelper.js";
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

function ProductCard({ product, onAddToCart }) {
    const [, setWishlistVersion] = useState(0);
    const [addedQuick, setAddedQuick] = useState(false);

    useEffect(() => {
        const unsub = subscribeWishlist(() => {
            setWishlistVersion((v) => v + 1);
        });
        return unsub;
    }, []);

    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const uid = product.uid || buildProductUid(product.category, product.id);
    const productUrl = `${normalizedBase}product.html?id=${encodeURIComponent(product.id)}&category=${encodeURIComponent(product.category)}&uid=${encodeURIComponent(uid)}&from=watches`;

    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!requireAuth({ type: "wishlist", product })) {
            return;
        }
        sharedToggleWishlist(product);
    };

    const handleQuickAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onAddToCart) {
            onAddToCart(product, 1);
        }
        setAddedQuick(true);
        setTimeout(() => setAddedQuick(false), 1200);
    };

    const rawOldPrice = Number(product.actualPrice || product.oldPrice || product.originalPrice || 0);
    const hasDiscount = Boolean(rawOldPrice && rawOldPrice > product.price);
    const discount = hasDiscount
        ? Math.round(((rawOldPrice - product.price) / rawOldPrice) * 100)
        : 50;

    const brandName = product.brand || "KSAM Signature";
    const isWish = isInWishlist(product.id);

    return (
        <article
            className="beauty-product-card watch-product-card-themed"
            data-category={product.category}
            data-id={product.id}
        >
            {/* Image Area on Top */}
            <div className="beauty-product-image-container watch-image-container">
                <a
                    href={productUrl}
                    className="beauty-product-image-link"
                    aria-label={`View details for ${product.name}`}
                >
                    <img
                        src={getImagePath(product.image)}
                        alt={product.name}
                        className="beauty-product-image watch-product-img-contain"
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
                </a>

                {/* Top-Left Black Pill Discount Badge */}
                <span className="beauty-discount-badge watch-discount-badge">
                    {discount}% OFF
                </span>

                {/* Top-Right Round Dark Translucent Wishlist Heart */}
                <button
                    type="button"
                    className={`beauty-card-wishlist-btn watch-wishlist-btn ${isWish ? "is-active" : ""}`}
                    aria-label={isWish ? "Remove from wishlist" : "Add to wishlist"}
                    onClick={handleWishlistClick}
                >
                    {isWish ? "♥" : "♡"}
                </button>
            </div>

            {/* Product Content Block */}
            <div className="beauty-product-content watch-product-content">
                {/* Category label in small uppercase letter-spaced text */}
                <p className="beauty-product-category watch-cat-label">
                    {product.category}
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
                    {product.description}
                </p>

                {/* Price in large bold ₹ with old price struck through in grey */}
                <div className="beauty-product-price watch-price-row">
                    <span className="beauty-current-price watch-cur-price">
                        ₹{product.price}
                    </span>

                    {rawOldPrice > 0 && (
                        <span className="beauty-original-price watch-old-price">
                            ₹{rawOldPrice}
                        </span>
                    )}
                </div>

                {/* Stock Text */}
                <p className="beauty-stock watch-stock-text">
                    {product.stock > 0
                        ? `${product.stock} items available`
                        : "Out of stock"}
                </p>

                {/* Bottom Row Actions */}
                <div className="beauty-product-actions watch-actions-row">
                    {/* Black rounded-square cart icon button */}
                    <button
                        type="button"
                        className={`beauty-quick-cart-btn watch-quick-cart-btn ${addedQuick ? "is-added" : ""}`}
                        onClick={handleQuickAddToCart}
                        aria-label="Add to Cart"
                        title="Add to Cart"
                        disabled={product.stock <= 0}
                    >
                        {addedQuick ? (
                            <Check size={20} strokeWidth={2.5} />
                        ) : (
                            <ShoppingBag size={20} strokeWidth={2} />
                        )}
                    </button>

                    {/* Full-width light-green View Product button */}
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

export default ProductCard;