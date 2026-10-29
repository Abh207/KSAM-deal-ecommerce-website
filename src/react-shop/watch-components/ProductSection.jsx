import React from "react";
import ProductCard from "./ProductCard";
import "./ProductSection.css";

function ProductSection({ products, onAddToCart }) {
    return (
        <section className="watch-product-section">

            <div className="watch-product-heading">
                <div>
                    <span>OUR COLLECTION</span>
                    <h1>BEST SELLERS</h1>
                </div>

                <div className="watch-result-count-pill">
                    {products.length} {products.length === 1 ? "Product" : "Products"}
                </div>
            </div>

            <div className="watch-product-grid">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={onAddToCart}
                    />
                ))}
            </div>

        </section>
    );
}

export default ProductSection;