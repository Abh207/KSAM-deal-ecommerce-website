import React from "react";
import "./CategorySection.css";

const getImagePath = (image) => {
    if (!image) return "";
    if (
        image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("data:")
    ) {
        return image;
    }
    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const clean = image.replace(/^\/+/, "");
    if (image.startsWith(normalizedBase)) return image;
    return `${normalizedBase}${clean}`;
};

function CategorySection({ onCategorySelect, selectedCategory }) {
    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;

    const categories = [
        {
            name: "MEN'S WATCHES",
            category: "Men's Watches",
            image: "products/watch1.png",
            id: 1001,
            uid: "mens-watches-1001"
        },
        {
            name: "WOMEN'S WATCHES",
            category: "Women's Watches",
            image: "products/watch6.png",
            id: 1006,
            uid: "womens-watches-1006"
        },
        {
            name: "SPORT WATCHES",
            category: "Sport Watches",
            image: "products/watch2.png",
            id: 1002,
            uid: "sport-watches-1002"
        },
        {
            name: "DRESS WATCHES",
            category: "Dress Watches",
            image: "products/watch3.png",
            id: 1003,
            uid: "dress-watches-1003"
        }
    ];

    return (
        <section
            className="watch-category-section"
            id="categories"
        >
            <div className="watch-category-heading">
                <span>SHOP BY STYLE</span>
                <h2>
                    EXPLORE CATEGORIES
                </h2>
            </div>

            {/* FILTER BUTTONS */}
            <div className="watch-category-filters">
                <button
                    className={
                        selectedCategory === "All"
                            ? "active"
                            : ""
                    }
                    onClick={() => onCategorySelect("All")}
                >
                    ALL WATCHES
                </button>

                {categories.map((category) => (
                    <button
                        key={category.category}
                        className={
                            selectedCategory === category.category
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            onCategorySelect(category.category)
                        }
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* CATEGORY CARDS */}
            <div className="watch-category-grid">
                {categories.map((category) => {
                    const tileUrl = `${normalizedBase}product.html?id=${encodeURIComponent(category.id)}&category=${encodeURIComponent(category.category)}&uid=${encodeURIComponent(category.uid)}&from=watches`;

                    return (
                        <a
                            href={tileUrl}
                            className="watch-category-card"
                            key={category.category}
                            data-product-id={category.id}
                            data-category={category.category}
                            data-uid={category.uid}
                            aria-label={`Shop ${category.name}`}
                        >
                            <div className="watch-category-image">
                                <img
                                    src={getImagePath(category.image)}
                                    alt={category.name}
                                    loading="lazy"
                                />
                            </div>

                            <div className="watch-category-content">
                                <h3>
                                    {category.name}
                                </h3>

                                <span className="watch-category-shop-link">
                                    <span>SHOP NOW</span>
                                    <svg
                                        className="watch-category-arrow-svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </span>
                            </div>
                        </a>
                    );
                })}
            </div>
        </section>
    );
}

export default CategorySection;