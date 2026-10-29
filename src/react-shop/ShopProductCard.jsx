import React, { useState, useEffect } from "react";
import { ShoppingBag, Check, ArrowRight } from "lucide-react";
import { isInWishlist, toggleWishlist, subscribeWishlist } from "../lib/wishlist.js";
import { buildProductUid, resolveImagePath } from "../lib/cartHelper.js";
import "./ShopProductCard.css";

const ShopProductCard = ({ product, onAddToCart }) => {
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
    const productUrl = `${normalizedBase}product.html?id=${encodeURIComponent(product.id)}&category=${encodeURIComponent(product.category)}&uid=${encodeURIComponent(uid)}&from=electronics`;

    const handleQuickAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onAddToCart) {
            onAddToCart(product, 1);
        }
        setAddedQuick(true);
        setTimeout(() => setAddedQuick(false), 1200);
    };

    const actual = product.actualPrice || product.oldPrice || product.price;
    const discount = actual > product.price
        ? Math.round(((actual - product.price) / actual) * 100)
        : 0;

    return (
        <article
            className="beauty-product-card electronics-card"
            data-category={product.category}
            data-id={product.id}
        >
            {/* Top Image Area */}
            <div className="beauty-product-image-container electronics-image-container">
                <a
                    href={productUrl}
                    className="beauty-product-image-link"
                    aria-label={`View details for ${product.name}`}
                >
                    <img
                        src={resolveImagePath(product.image)}
                        alt={product.name}
                        loading="lazy"
                        className="beauty-product-image electronics-product-image"
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
                </a>

                {/* Top-left: Black pill discount badge */}
                {discount > 0 && (
                    <span className="beauty-discount-badge">
                        {discount}% OFF
                    </span>
                )}

                {/* Top-right: Round dark translucent wishlist heart */}
                <button
                    type="button"
                    className={`beauty-card-wishlist-btn ${isInWishlist(product.id) ? "is-active" : ""}`}
                    aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                    }}
                >
                    {isInWishlist(product.id) ? "♥" : "♡"}
                </button>
            </div>

            {/* Product Content */}
            <div className="beauty-product-content">
                {/* Small green uppercase letter-spaced category */}
                <p className="beauty-product-category">
                    {product.category}
                </p>

                {/* Bold clickable product name */}
                <h3 className="beauty-product-name">
                    <a
                        href={productUrl}
                        className="beauty-product-name-link"
                    >
                        {product.name}
                    </a>
                </h3>

                {/* Bold grey brand name */}
                <p className="beauty-product-brand">
                    {product.brand || "KSAM Certified"}
                </p>

                {/* Short grey description (2 lines max) */}
                <p className="beauty-product-description">
                    {product.description}
                </p>

                {/* Price in INR with struck-through old price */}
                <div className="beauty-product-price">
                    <span className="beauty-current-price">
                        ₹{product.price}
                    </span>

                    {actual > product.price && (
                        <span className="beauty-original-price">
                            ₹{actual}
                        </span>
                    )}
                </div>

                {/* Stock text */}
                <p className="beauty-stock">
                    {product.stock > 0
                        ? `${product.stock} items available`
                        : "Out of stock"}
                </p>

                {/* Bottom Row Actions */}
                <div className="beauty-product-actions">
                    {/* Black rounded-square cart button */}
                    <button
                        type="button"
                        className={`beauty-quick-cart-btn ${addedQuick ? "is-added" : ""}`}
                        onClick={handleQuickAddToCart}
                        aria-label={`Add ${product.name} to Cart`}
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
};

export default ShopProductCard;