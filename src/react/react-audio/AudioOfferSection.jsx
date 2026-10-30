import React from "react";
import { ArrowRight } from "lucide-react";

export default function AudioOfferSection({ currentOffer, products, scrollToProducts, getImagePath }) {
    if (!currentOffer) return null;

    return (
        <section className="audio-offer">
            <div className="audio-offer-box">
                <div className="audio-offer-info">
                    <span className="audio-pill">
                        LIMITED TIME DROP
                    </span>
                    <h2>{currentOffer.title}</h2>
                    <p>{currentOffer.subtitle}</p>
                    <strong className="audio-offer-discount">
                        {currentOffer.discount}
                    </strong>

                    <div className="audio-countdown">
                        <div>
                            <strong>100</strong>
                            <span>DAYS</span>
                        </div>
                        <div>
                            <strong>04</strong>
                            <span>HOURS</span>
                        </div>
                        <div>
                            <strong>16</strong>
                            <span>MIN</span>
                        </div>
                        <div>
                            <strong>49</strong>
                            <span>SEC</span>
                        </div>
                    </div>

                    <button
                        className="audio-lime-button"
                        onClick={scrollToProducts}
                    >
                        Shop this offer
                        <ArrowRight size={16} style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 6 }} />
                    </button>
                </div>

                <div className="audio-offer-products">
                    {products
                        .filter((product) =>
                            currentOffer.productIds?.includes(product.id)
                        )
                        .slice(0, 3)
                        .map((product) => (
                            <div className="audio-offer-product" key={product.id}>
                                <div className="audio-offer-product-image">
                                    <img
                                        src={getImagePath(product.image)}
                                        alt={product.name}
                                        loading="lazy"
                                        decoding="async"
                                        width="120"
                                        height="120"
                                    />
                                </div>
                                <strong>{product.name}</strong>
                                <div>
                                    <b>₹{Number(product.price).toLocaleString("en-IN")}</b>
                                    <del>₹{Number(product.oldPrice).toLocaleString("en-IN")}</del>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </section>
    );
}
