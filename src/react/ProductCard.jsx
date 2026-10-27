import React, { useState, useEffect } from "react";
import { isInWishlist, toggleWishlist, subscribeWishlist } from "../lib/wishlist.js";
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
    const [quantity, setQuantity] = useState(1);
    const [, setWishlistVersion] = useState(0);

    useEffect(() => {
        const unsub = subscribeWishlist(() => {
            setWishlistVersion((v) => v + 1);
        });
        return unsub;
    }, []);

    const increaseQuantity = () => {
        if (quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleAddToCart = () => {
        onAddToCart(product, quantity);
        setQuantity(1);
    };

    const discount = Math.round(
        ((product.actualPrice - product.price) / product.actualPrice) * 100
    );

    return (
        <article className="beauty-product-card">

            <div className="beauty-product-image-container">
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
                        border: "1px solid rgba(255, 255, 255, 0.35)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#ffffff",
                        fontSize: "16px",
                        lineHeight: 1,
                        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.4)",
                        transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#ffffff";
                        e.currentTarget.style.boxShadow = "0 0 12px rgba(255, 255, 255, 0.45)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.35)";
                        e.currentTarget.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.4)";
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
                    {product.name}
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

                    <div className="beauty-quantity-control">
                        <button
                            type="button"
                            onClick={decreaseQuantity}
                            disabled={quantity <= 1}
                        >
                            −
                        </button>

                        <span>{quantity}</span>

                        <button
                            type="button"
                            onClick={increaseQuantity}
                            disabled={quantity >= product.stock}
                        >
                            +
                        </button>
                    </div>

                    <button
                        type="button"
                        className="beauty-add-cart-button"
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                    >
                        🛒 Add to Cart
                    </button>

                </div>

            </div>
        </article>
    );
};

export default ProductCard;