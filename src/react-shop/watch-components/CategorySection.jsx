import React from "react";
import "./CategorySection.css";

function CategorySection({ onCategorySelect, selectedCategory }) {

    const categories = [
        {
            name: "MEN'S WATCHES",
            category: "Men's Watches",
            image: "products/watch1.png"
        },
        {
            name: "WOMEN'S WATCHES",
            category: "Women's Watches",
            image: "products/watch6.png"
        },
        {
            name: "SPORT WATCHES",
            category: "Sport Watches",
            image: "products/watch2.png"
        },
        {
            name: "DRESS WATCHES",
            category: "Dress Watches",
            image: "products/watch3.png"
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

                {categories.map((category) => (

                    <div
                        className="watch-category-card"
                        key={category.category}
                    >

                        <div className="watch-category-image">

                            <img
                                src={category.image}
                                alt={category.name}
                            />

                        </div>


                        <div className="watch-category-content">

                            <h3>
                                {category.name}
                            </h3>


                            <button
                                onClick={() =>
                                    onCategorySelect(
                                        category.category
                                    )
                                }
                            >
                                SHOP NOW →
                            </button>

                        </div>

                    </div>

                ))}

            </div>

        </section>
    );
}

export default CategorySection;