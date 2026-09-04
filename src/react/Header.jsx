import React from "react";
import "./Header.css";

const Header = ({ searchTerm, setSearchTerm, categories, selectedCategory, setSelectedCategory, cartCount }) => {
    return (
        <header className="beauty-header">

            {/* Top Navigation */}
            <div className="beauty-header-top">

                <div className="beauty-logo">
                    <span className="beauty-logo-main">KSAM</span>
                    <span className="beauty-logo-sub">BEAUTY</span>
                </div>

                <nav className="beauty-nav">
                    <a href="#home">Home</a>
                    <a href="#products">Products</a>
                    <a href="#offers">Offers</a>
                    <a href="#categories">Categories</a>
                </nav>

                <a
                    href="./addToCart.html"
                    className="beauty-cart-link"
                    aria-label="Open shopping cart"
                >
                    🛒
                    <span className="beauty-cart-count">
                        {cartCount}
                    </span>
                </a>

            </div>

            {/* Search */}
            <div className="beauty-search-container">

                <div className="beauty-search-box">
                    <span className="beauty-search-icon">⌕</span>

                    <input
                        type="search"
                        placeholder="Search beauty products..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            className="beauty-search-clear"
                            onClick={() => setSearchTerm("")}
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>

            </div>

            {/* Categories */}
            <div
                id="categories"
                className="beauty-category-container"
            >
                {categories.map((category) => (
                    <button
                        key={category}
                        type="button"
                        className={
                            selectedCategory === category
                                ? "beauty-category-button active"
                                : "beauty-category-button"
                        }
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

        </header>
    );
};

export default Header;