import React, { useState, useEffect } from "react";
import { ShoppingBag, Check, ArrowRight } from "lucide-react";
import { isInWishlist, toggleWishlist, subscribeWishlist } from "../lib/wishlist.js";
import { buildProductUid } from "../lib/cartHelper.js";
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

const ProductCard = ({ product, onAddToCart }) => {
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
    const productUrl = `${normalizedBase}beauty-product.html?id=${encodeURIComponent(product.id)}&category=${encodeURIComponent(product.category)}&uid=${encodeURIComponent(uid)}`;

    const handleQuickAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onAddToCart(product, 1);
        setAddedQuick(true);
        setTimeout(() => setAddedQuick(false), 1200);
    };

    const discount = Math.round(
        ((product.actualPrice - product.price) / product.actualPrice) * 100
    );

    return (
        <article
            className="beauty-product-card"
            data-category={product.category}
            data-id={product.id}
        >

            <div className="beauty-product-image-container">
                <a
                    href={productUrl}
                    className="beauty-product-image-link"
                    aria-label={`View details for ${product.name}`}
                >
                    <img
                        src={getImagePath(product.image)}
                        alt={product.name}
                        className="beauty-product-image"
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

                <span className="beauty-discount-badge">
                    {discount}% OFF
                </span>

                <button
                    type="button"
                    className={`beauty-card-wishlist-btn ${isInWishlist(product.id) ? "is-active" : ""}`}
                    aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                    }}
                    style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        zIndex: 5,
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        background: "rgba(0, 0, 0, 0.65)",
                        border: isInWishlist(product.id)
                            ? "1.5px solid var(--accent, #1de9b6)"
                            : "1px solid rgba(255, 255, 255, 0.35)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: isInWishlist(product.id) ? "var(--accent, #1de9b6)" : "#ffffff",
                        fontSize: "16px",
                        lineHeight: 1,
                        boxShadow: isInWishlist(product.id)
                            ? "0 0 14px rgba(29, 233, 182, 0.45)"
                            : "0 4px 14px rgba(0, 0, 0, 0.4)",
                        transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = isInWishlist(product.id) ? "var(--accent, #1de9b6)" : "#ffffff";
                        e.currentTarget.style.boxShadow = isInWishlist(product.id)
                            ? "0 0 16px rgba(29, 233, 182, 0.6)"
                            : "0 0 12px rgba(255, 255, 255, 0.45)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = isInWishlist(product.id)
                            ? "var(--accent, #1de9b6)"
                            : "rgba(255, 255, 255, 0.35)";
                        e.currentTarget.style.boxShadow = isInWishlist(product.id)
                            ? "0 0 14px rgba(29, 233, 182, 0.45)"
                            : "0 4px 14px rgba(0, 0, 0, 0.4)";
                    }}
                >
                    {isInWishlist(product.id) ? "♥" : "♡"}
                </button>
            </div>

            <div className="beauty-product-content">

                <p className="beauty-product-category">
                    {product.category}
                </p>

                <h3 className="beauty-product-name">
                    <a
                        href={productUrl}
                        className="beauty-product-name-link"
                    >
                        {product.name}
                    </a>
                </h3>

                <p className="beauty-product-brand">
                    {product.brand}
                </p>

                <p className="beauty-product-description">
                    {product.description}
                </p>

                <div className="beauty-product-price">
                    <span className="beauty-current-price">
                        ₹{product.price}
                    </span>

                    <span className="beauty-original-price">
                        ₹{product.actualPrice}
                    </span>
                </div>

                <p className="beauty-stock">
                    {product.stock > 0
                        ? `${product.stock} items available`
                        : "Out of stock"}
                </p>

                <div className="beauty-product-actions">

                    <button
                        type="button"
                        className={`beauty-quick-cart-btn ${addedQuick ? "is-added" : ""}`}
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

export default ProductCard;