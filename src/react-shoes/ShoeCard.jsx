import React, { useState } from "react";
import { ShoppingBag, Check, ArrowRight } from "lucide-react";
import { isInWishlist, toggleWishlist } from "../lib/wishlist.js";
import { buildProductUid } from "../lib/cartHelper.js";
import "../react/ProductCard.css";

const getImagePath = (image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) return image;
    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const clean = image.replace(/^\/+/, "");
    if (image.startsWith(normalizedBase)) return image;
    return `${normalizedBase}${clean}`;
};

function ShoeCard({
    product,
    isWishlisted,
    onWishlist,
    onAddToCart
}) {
    const [addedQuick, setAddedQuick] = useState(false);

    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const uid = product.uid || buildProductUid(product.category || "Shoes", product.id);
    const productUrl = `${normalizedBase}Product.html?id=${encodeURIComponent(product.id)}&category=${encodeURIComponent(product.category || "Shoes")}&uid=${encodeURIComponent(uid)}`;

    const handleQuickAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onAddToCart) {
            onAddToCart(product, 1);
        }
        setAddedQuick(true);
        setTimeout(() => setAddedQuick(false), 1200);
    };

    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onWishlist) {
            onWishlist(product);
        } else {
            toggleWishlist(product);
        }
    };

    const discount = product.discount || (
        product.oldPrice && product.price
            ? Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100)
            : 0
    );

    const brand = product.brand || "StrideX";
    const categoryLabel = String(product.category || "SNEAKERS").toUpperCase();
    const wishlisted = typeof isWishlisted === "boolean" ? isWishlisted : isInWishlist(product.id);

    return (
        <article
            className="beauty-product-card shoe-beauty-card"
            data-category={product.category}
            data-id={product.id}
        >
            {/* Top image area */}
            <div className="beauty-product-image-container shoe-card-img-wrap">
                <a
                    href={productUrl}
                    className="beauty-product-image-link"
                    aria-label={`View details for ${product.name}`}
                >
                    <img
                        src={getImagePath(product.image)}
                        alt={product.name}
                        className="beauty-product-image shoe-card-img"
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fb = document.createElement("div");
                            fb.style.cssText = "width:100%;height:100%;min-height:160px;display:flex;align-items:center;justify-content:center;background:#18181b;color:#a1a1aa;font-size:12px;font-weight:700;text-align:center;padding:10px;border-radius:12px;";
                            fb.textContent = product.name || "Shoes";
                            if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.appendChild(fb);
                            }
                        }}
                    />
                </a>

                {/* Black pill discount badge on top-left */}
                {discount > 0 && (
                    <span className="beauty-discount-badge">
                        {discount}% OFF
                    </span>
                )}

                {/* Dark translucent round wishlist heart on top-right */}
                <button
                    type="button"
                    className={`beauty-card-wishlist-btn ${wishlisted ? "is-active" : ""}`}
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    onClick={handleWishlistClick}
                >
                    {wishlisted ? "♥" : "♡"}
                </button>
            </div>

            {/* Content area */}
            <div className="beauty-product-content">
                {/* Category label in small green uppercase letter-spaced text */}
                <p className="beauty-product-category">
                    {categoryLabel}
                </p>

                {/* Product name in bold large dark text */}
                <h3 className="beauty-product-name">
                    <a
                        href={productUrl}
                        className="beauty-product-name-link"
                    >
                        {product.name}
                    </a>
                </h3>

                {/* Brand name in bold grey */}
                <p className="beauty-product-brand">
                    {brand}
                </p>

                {/* Short description in grey, 2 lines max */}
                <p className="beauty-product-description">
                    {product.description || "Modern lightweight shoes designed for everyday style, responsive cushioning and comfortable movement."}
                </p>

                {/* Price in large bold with old price struck through in grey */}
                <div className="beauty-product-price">
                    <span className="beauty-current-price">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>
                    {product.oldPrice && (
                        <span className="beauty-original-price">
                            ₹{Number(product.oldPrice).toLocaleString("en-IN")}
                        </span>
                    )}
                </div>

                {/* Stock text in bold green-grey: "18 items available" */}
                <p className="beauty-stock">
                    {Number(product.stock) > 0
                        ? `${product.stock} items available`
                        : "Out of stock"}
                </p>

                {/* Bottom row: black rounded-square cart button + full-width light-green View Product button */}
                <div className="beauty-product-actions">
                    <button
                        type="button"
                        className={`beauty-quick-cart-btn ${addedQuick ? "is-added" : ""}`}
                        onClick={handleQuickAddToCart}
                        aria-label="Add to Cart"
                        title="Add to Cart"
                        disabled={Number(product.stock) <= 0}
                    >
                        {addedQuick ? (
                            <Check size={20} strokeWidth={2.5} />
                        ) : (
                            <ShoppingBag size={20} strokeWidth={2} />
                        )}
                    </button>

                    <a
                        href={productUrl}
                        className="beauty-view-product-btn"
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

export default ShoeCard;