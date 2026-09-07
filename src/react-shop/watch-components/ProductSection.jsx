import React from "react";
import ProductCard from "./ProductCard";
import "./ProductSection.css";

function ProductSection({ products, onProductClick }) {
    return (
        <section className="watch-product-section">

            <div className="watch-product-heading">
                <div>
                    <span>OUR COLLECTION</span>
                    <h1>BEST SELLERS</h1>
                </div>

                <button className="watch-view-all">
                    VIEW ALL →
                </button>
            </div>

            <div className="watch-product-grid">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onProductClick={onProductClick}
                    />
                ))}
            </div>

        </section>
    );
}

export default ProductSection;