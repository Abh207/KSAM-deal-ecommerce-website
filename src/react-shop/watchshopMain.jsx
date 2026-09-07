import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import "./watchshopApp.css";

import productsData from "../api/watch-products.json";

import CategorySection from "./watch-components/CategorySection";
import ProductSection from "./watch-components/ProductSection";
import ProductPopup from "./watch-components/ProductPopup";
import Footer from "./watch-components/Footer";


function WatchShop() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Selected category
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Cart item count
    const [cartCount, setCartCount] = useState(0);


    /* =========================================
       LOAD PRODUCTS
    ========================================= */

    useEffect(() => {

        setProducts(productsData);
        setLoading(false);

    }, []);


    /* =========================================
       UPDATE CART COUNT
    ========================================= */

    const updateCartCount = () => {

        const cart =
            JSON.parse(
                localStorage.getItem("cartProductLS")
            ) || [];


        const totalQuantity = cart.reduce(
            (total, item) =>
                total + (Number(item.quantity) || 0),
            0
        );


        setCartCount(totalQuantity);

    };


    /* =========================================
       LOAD CART COUNT
    ========================================= */

    useEffect(() => {

        updateCartCount();


        window.addEventListener(
            "storage",
            updateCartCount
        );


        return () => {

            window.removeEventListener(
                "storage",
                updateCartCount
            );

        };

    }, []);


    /* =========================================
       FILTER PRODUCTS
    ========================================= */

    const filteredProducts =
        selectedCategory === "All"
            ? products
            : products.filter(
                (product) =>
                    product.category === selectedCategory
            );


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (
            <div className="watchshop-loading">
                Loading products...
            </div>
        );

    }


    return (

        <div className="watchshop-app">


            {/* =========================================
                HEADER
            ========================================= */}

            <header className="watch-header">


                {/* LOGO */}

                <div className="watch-logo">
                    KSAM <span>DEAL</span>
                </div>


                {/* NAVIGATION */}

                <nav className="watch-nav">

                    <a href="./index.html">
                        HOME
                    </a>


                    <a href="#products">
                        WATCHES
                    </a>


                    <a href="#categories">
                        CATEGORIES
                    </a>


                    <a href="#contact">
                        CONTACT
                    </a>


                    <a href="./watchwishlist.html">
                        WISHLIST
                    </a>

                </nav>


                {/* CART */}

                <a
                    href="./addToCart.html"
                    className="watch-cart"
                >

                    🛒 CART

                    <span className="watch-cart-count">
                        {cartCount}
                    </span>

                </a>

            </header>



            {/* =========================================
                HERO
            ========================================= */}
<section
    className="watch-hero"
    style={{
        backgroundImage: `url("${import.meta.env.BASE_URL}products/watchHeaderLogo.png")`
    }}
>
    <div className="watch-hero-content">

        <span>NEW COLLECTION</span>

        <h1>
            PRECISION.
            <br />
            <span className="watch-hero-gold">
                CRAFTED FOR TIME.
            </span>
        </h1>

        <p>
            Where timeless design meets
            <br />
            modern performance.
        </p>

        <a
            href="#products"
            className="watch-hero-button"
        >
            SHOP NOW →
        </a>

        <a
            href="#categories"
            className="watch-hero-outline-button"
        >
            EXPLORE COLLECTIONS
        </a>

    </div>
</section>


            {/* =========================================
                CATEGORIES
            ========================================= */}

            <CategorySection

                selectedCategory={selectedCategory}

                onCategorySelect={(category) => {

                    setSelectedCategory(category);


                    setTimeout(() => {

                        document
                            .getElementById("products")
                            ?.scrollIntoView({
                                behavior: "smooth"
                            });

                    }, 100);

                }}

            />



            {/* =========================================
                PRODUCTS
            ========================================= */}

            <div id="products">


                <p className="watch-total-products">

                    Showing{" "}
                    {filteredProducts.length}
                    {" "}Products

                </p>


                <ProductSection

                    products={filteredProducts}

                    onProductClick={(product) => {

                        setSelectedProduct(product);

                    }}

                />

            </div>



            {/* =========================================
                FOOTER
            ========================================= */}

            <Footer />



            {/* =========================================
                PRODUCT POPUP
            ========================================= */}

            <ProductPopup
    product={selectedProduct}
    onClose={() => {
        setSelectedProduct(null);
    }}
    onCartUpdate={updateCartCount}
/>


        </div>

    );

}



/* =========================================
   CREATE REACT ROOT
========================================= */

const root = createRoot(
    document.getElementById("watchshop-root")
);


root.render(
    <WatchShop />
);