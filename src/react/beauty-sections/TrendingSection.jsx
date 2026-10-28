import React, { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ShoppingBag, Check, Flame } from "lucide-react";
import { resolveImagePath } from "../../lib/cartHelper.js";

const TrendingSection = ({ products = [], onAddToCart }) => {
    const scrollRef = useRef(null);
    const [addedIds, setAddedIds] = useState({});

    // Top 8 products
    const trendingProducts = products.slice(0, 8);

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        const scrollAmount = 340;
        scrollRef.current.scrollBy({
            left: direction === "next" ? scrollAmount : -scrollAmount,
            behavior: "smooth"
        });
    };

    const handleQuickAdd = (product, e) => {
        e.preventDefault();
        e.stopPropagation();

        if (onAddToCart) {
            onAddToCart(product, 1);
        }

        setAddedIds((prev) => ({ ...prev, [product.id]: true }));
        setTimeout(() => {
            setAddedIds((prev) => ({ ...prev, [product.id]: false }));
        }, 1200);
    };

    return (
        <section className="beauty-section-wrap beauty-trending-section" aria-label="Trending Beauty Products">
            <div className="beauty-glass-panel">
                <div className="beauty-trending-header">
                    <div>
                        <div className="beauty-section-badge">
                            <Flame size={14} className="beauty-badge-icon" />
                            <span>POPULAR PICKS</span>
                        </div>
                        <h2 className="beauty-section-title">Trending Now</h2>
                        <p className="beauty-section-subtitle">
                            The most coveted formulas this week, loved by customers and beauty editors alike.
                        </p>
                    </div>

                    <div className="beauty-trending-controls">
                        <button
                            type="button"
                            className="beauty-carousel-arrow"
                            onClick={() => scroll("prev")}
                            aria-label="Scroll left in trending products"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <button
                            type="button"
                            className="beauty-carousel-arrow"
                            onClick={() => scroll("next")}
                            aria-label="Scroll right in trending products"
                        >
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Horizontal Scroll Track */}
                <div className="beauty-trending-track" ref={scrollRef}>
                    {trendingProducts.map((product) => {
                        const isAdded = !!addedIds[product.id];
                        const productUrl = `beauty-product.html?id=${encodeURIComponent(
                            product.id
                        )}&category=${encodeURIComponent(
                            product.category || "Beauty"
                        )}&uid=${encodeURIComponent(product.id)}`;

                        return (
                            <div key={`trend-${product.id}`} className="beauty-trending-card">
                                <a href={productUrl} className="beauty-trending-img-link" tabIndex={-1}>
                                    <img
                                        src={resolveImagePath(product.image)}
                                        alt={product.name}
                                        className="beauty-trending-img"
                                        loading="lazy"
                                    />
                                    {product.actualPrice && product.actualPrice > product.price && (
                                        <span className="beauty-trending-discount">
                                            {Math.round(
                                                ((product.actualPrice - product.price) / product.actualPrice) * 100
                                            )}% OFF
                                        </span>
                                    )}
                                </a>

                                <div className="beauty-trending-info">
                                    <span className="beauty-trending-category">{product.category}</span>
                                    <a href={productUrl} className="beauty-trending-title-link">
                                        <h4 className="beauty-trending-name">{product.name}</h4>
                                    </a>

                                    <div className="beauty-trending-price-row">
                                        <div className="beauty-trending-prices">
                                            <span className="beauty-trending-curr-price">₹{product.price}</span>
                                            {product.actualPrice && (
                                                <span className="beauty-trending-old-price">₹{product.actualPrice}</span>
                                            )}
                                        </div>

                                        <div className="beauty-trending-actions">
                                            {/* Small square cart button */}
                                            <button
                                                type="button"
                                                className={`beauty-quick-cart-btn compact${isAdded ? " added" : ""}`}
                                                onClick={(e) => handleQuickAdd(product, e)}
                                                title="Add to Cart"
                                                aria-label={`Add ${product.name} to Cart`}
                                            >
                                                {isAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
                                            </button>

                                            {/* View Product link */}
                                            <a
                                                href={productUrl}
                                                className="beauty-view-product-btn compact"
                                                aria-label={`View details of ${product.name}`}
                                            >
                                                <span>View</span>
                                                <span className="beauty-btn-arrow">→</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default TrendingSection;
