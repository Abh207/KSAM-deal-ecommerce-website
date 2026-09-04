import React, { useState } from "react";
import "./ProductCard.css";

const ProductCard = ({ product, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);

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
                    src={product.image}
                    alt={product.name}
                    className="beauty-product-image"
                />

                <span className="beauty-discount-badge">
                    {discount}% OFF
                </span>
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