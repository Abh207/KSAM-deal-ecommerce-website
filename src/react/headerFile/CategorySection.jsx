import React, { useMemo, useState } from "react";
import categoryData from "../../api/categorySection.json";
import "./CategorySection.css";

function CategorySection({
    products = [],
    onCategorySelect
}) {
    const [activeCategory, setActiveCategory] = useState(null);

    /*
     * Create category information from the main product JSON.
     * Category configuration comes from categorySection.json.
     */
    const categories = useMemo(() => {
        return categoryData.categories.map((category) => {

            let categoryProducts = [];

            /*
             * If productIds are provided in categorySection.json,
             * use those specific products.
             */
            if (
                Array.isArray(category.productIds) &&
                category.productIds.length > 0
            ) {
                categoryProducts = products.filter((product) =>
                    category.productIds.includes(Number(product.id))
                );
            }

            /*
             * Otherwise automatically find products
             * using the category field from headerproducts.json.
             */
            if (categoryProducts.length === 0) {
                categoryProducts = products.filter((product) => {
                    const productCategory =
                        product.category ||
                        product.Category ||
                        product.type ||
                        "";

                    return (
                        String(productCategory).toLowerCase() ===
                        String(category.id).toLowerCase()
                    );
                });
            }

            /*
             * Use the first available product image
             * as the category image.
             */
            const imageProduct = categoryProducts[0];

            return {
                ...category,
                productCount: categoryProducts.length,
                image: imageProduct?.image || null
            };
        });
    }, [products]);

    const handleCategoryClick = (category) => {
        setActiveCategory(category.id);

        if (onCategorySelect) {
            onCategorySelect(category.id);
        }
    };

    return (
        <section className="category-section">

            {/* Header */}
            <div className="category-section-header">

                <div className="category-heading">

                    {categoryData.section.eyebrow && (
                        <span className="category-eyebrow">
                            {categoryData.section.eyebrow}
                        </span>
                    )}

                    <h2>
                        {categoryData.section.title}
                    </h2>

                    <p>
                        {categoryData.section.description}
                    </p>

                </div>

                {categoryData.section.showViewAll && (
                    <button
                        type="button"
                        className="category-view-all"
                        onClick={() => {
                            setActiveCategory(null);

                            if (onCategorySelect) {
                                onCategorySelect(null);
                            }
                        }}
                    >
                        View All
                        <span>→</span>
                    </button>
                )}

            </div>

            {/* Categories */}
            <div className="category-grid">

                {categories.map((category) => {

                    const isActive =
                        activeCategory === category.id;

                    return (
                        <button
                            type="button"
                            key={category.id}
                            className={`category-card ${
                                isActive ? "active" : ""
                            }`}
                            onClick={() =>
                                handleCategoryClick(category)
                            }
                            style={{
                                "--category-bg":
                                    category.color || "#f5f5f5"
                            }}
                        >

                            {/* Image */}
                            <div className="category-image-wrapper">

                                {category.image ? (
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="category-image"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="category-icon">
                                        {category.icon}
                                    </div>
                                )}

                            </div>

                            {/* Content */}
                            <div className="category-content">

                                <h3>
                                    {category.name}
                                </h3>

                                <p>
                                    {category.description}
                                </p>

                                {categoryData.section
                                    .showProductCount && (
                                    <span className="category-count">
                                        {category.productCount}{" "}
                                        {category.productCount === 1
                                            ? "Product"
                                            : "Products"}
                                    </span>
                                )}

                            </div>

                            {/* Arrow */}
                            {categoryData.section.showArrow && (
                                <span className="category-arrow">
                                    →
                                </span>
                            )}

                        </button>
                    );
                })}

            </div>

            {/* Active category message */}
            {activeCategory && (
                <div className="category-active-message">

                    <span>
                        Showing:
                    </span>

                    <strong>
                        {
                            categories.find(
                                (category) =>
                                    category.id === activeCategory
                            )?.name
                        }
                    </strong>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveCategory(null);

                            if (onCategorySelect) {
                                onCategorySelect(null);
                            }
                        }}
                    >
                        Clear ×
                    </button>

                </div>
            )}

        </section>
    );
}

export default CategorySection;