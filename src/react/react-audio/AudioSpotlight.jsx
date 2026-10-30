import React from "react";
import { ShoppingBag, Heart } from "lucide-react";

export default function AudioSpotlight({
    spotlightProduct,
    getImagePath,
    addToCart,
    toggleWishlist
}) {
    if (!spotlightProduct) return null;

    return (
        <section className="audio-spotlight">
            <div className="audio-section-heading light">
                <span>FEATURED SPOTLIGHT</span>
                <h2>Built for your sound.</h2>
            </div>

            <div className="audio-spotlight-box">
                <div className="audio-spotlight-image">
                    <img
                        src={getImagePath(spotlightProduct.image)}
                        alt={spotlightProduct.name}
                        loading="lazy"
                        decoding="async"
                        width="360"
                        height="360"
                    />
                </div>

                <div className="audio-spotlight-info">
                    <span className="audio-product-brand">
                        {spotlightProduct.brand}
                    </span>
                    <h2>{spotlightProduct.name}</h2>
                    <p>{spotlightProduct.description}</p>

                    <div className="audio-rating">
                        <span>★</span>
                        <strong>{spotlightProduct.rating}</strong>
                        <small>({spotlightProduct.reviews} reviews)</small>
                    </div>

                    <div className="audio-spotlight-price">
                        ₹{Number(spotlightProduct.price).toLocaleString("en-IN")}
                        <del>₹{Number(spotlightProduct.oldPrice).toLocaleString("en-IN")}</del>
                        <b>{spotlightProduct.discount}% OFF</b>
                    </div>

                    <div className="audio-feature-tags">
                        {spotlightProduct.features?.slice(0, 4).map((feature, index) => (
                            <span key={index}>✓ {feature}</span>
                        ))}
                    </div>

                    <div className="audio-spotlight-buttons">
                        <button
                            className="audio-lime-button"
                            onClick={() => addToCart(spotlightProduct)}
                        >
                            <ShoppingBag size={18} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 6 }} />
                            Add to cart
                        </button>

                        <button
                            className="audio-outline-button"
                            onClick={() => toggleWishlist(spotlightProduct)}
                            aria-label="Add to wishlist"
                        >
                            <Heart size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
