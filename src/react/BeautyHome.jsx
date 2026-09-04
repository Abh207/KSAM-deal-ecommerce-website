import React, { useEffect, useMemo, useState } from "react";

import products from "../api/beautyProducts.json";

import Header from "./Header.jsx";
import ProductCard from "./ProductCard.jsx";
import Countdown from "./Countdown.jsx";
import Toast from "./Toast.jsx";

import "./BeautyHome.css";

const CART_STORAGE_KEY = "cartProductLS";

const BeautyHome = () => {
    // -----------------------------
    // Search
    // -----------------------------
    const [searchTerm, setSearchTerm] = useState("");

    // -----------------------------
    // Category
    // -----------------------------
    const [selectedCategory, setSelectedCategory] = useState("All");

    // -----------------------------
    // Cart
    // -----------------------------
    const [cartCount, setCartCount] = useState(0);

    // -----------------------------
    // Toast
    // -----------------------------
    const [toast, setToast] = useState(null);

    // -----------------------------
    // Get cart from localStorage
    // -----------------------------
    const getCartProducts = () => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);

            if (!savedCart) {
                return [];
            }

            const parsedCart = JSON.parse(savedCart);

            return Array.isArray(parsedCart) ? parsedCart : [];
        } catch (error) {
            console.error("Error reading cart:", error);
            return [];
        }
    };

    // -----------------------------
    // Calculate total cart quantity
    // -----------------------------
    const updateCartCount = () => {
        const cartProducts = getCartProducts();

        const totalQuantity = cartProducts.reduce(
            (total, product) => {
                return total + (Number(product.quantity) || 0);
            },
            0
        );

        setCartCount(totalQuantity);
    };

    // -----------------------------
    // Load cart count when page loads
    // -----------------------------
    useEffect(() => {
        updateCartCount();

        const handleCartUpdate = () => {
            updateCartCount();
        };

        window.addEventListener(
            "cartUpdated",
            handleCartUpdate
        );

        return () => {
            window.removeEventListener(
                "cartUpdated",
                handleCartUpdate
            );
        };
    }, []);

    // -----------------------------
    // Categories
    // -----------------------------
    const categories = useMemo(() => {
        const uniqueCategories = [
            ...new Set(products.map((product) => product.category))
        ];

        return ["All", ...uniqueCategories];
    }, []);

    // -----------------------------
    // Filter products
    // -----------------------------
    const filteredProducts = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return products.filter((product) => {

            const matchesCategory =
                selectedCategory === "All" ||
                product.category === selectedCategory;

            const matchesSearch =
                search === "" ||
                product.name.toLowerCase().includes(search) ||
                product.brand.toLowerCase().includes(search) ||
                product.category.toLowerCase().includes(search);

            return matchesCategory && matchesSearch;
        });
    }, [searchTerm, selectedCategory]);

    // -----------------------------
    // Add product to cart
    // -----------------------------
    const handleAddToCart = (product, quantity) => {

        const cartProducts = getCartProducts();

        const existingProduct = cartProducts.find(
            (cartProduct) =>
                Number(cartProduct.id) === Number(product.id)
        );

        if (existingProduct) {

            existingProduct.quantity =
                Number(existingProduct.quantity || 0) +
                Number(quantity);

            // Keep price as UNIT price
            existingProduct.price =
                Number(product.price);

        } else {

            cartProducts.push({
                id: Number(product.id),
                quantity: Number(quantity),
                price: Number(product.price)
            });
        }

        // Save cart
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cartProducts)
        );

        // Update cart count
        updateCartCount();

        // Tell other JavaScript files that cart changed
        window.dispatchEvent(
            new Event("cartUpdated")
        );

        // Show popup
        setToast({
            message: "Product added to cart",
            productName: product.name
        });
    };

    // -----------------------------
    // Close Toast
    // -----------------------------
    const closeToast = () => {
        setToast(null);
    };

    return (
        <div className="beauty-page">

            {/* Header */}
            <Header
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                cartCount={cartCount}
            />

            {/* Hero Section */}
            <section
                id="home"
                className="beauty-hero"
            >
                <div className="beauty-hero-content">

                    <p className="beauty-hero-small-title">
                        DISCOVER YOUR BEAUTY
                    </p>

                    <h1>
                        Beauty That
                        <br />
                        <span>Feels Like You</span>
                    </h1>

                    <p className="beauty-hero-description">
                        Discover skincare, makeup, hair care and
                        fragrances carefully selected for your
                        everyday beauty routine.
                    </p>

                    <a
                        href="#products"
                        className="beauty-hero-button"
                    >
                        Shop Now
                    </a>

                </div>

                <div className="beauty-hero-decoration">
                    <div className="beauty-hero-circle"></div>

                    <div className="beauty-hero-card">
                        <span>NEW</span>
                        <strong>Beauty Collection</strong>
                    </div>
                </div>
            </section>

            {/* Sale Section */}
            <section
                id="offers"
                className="beauty-sale-section"
            >
                <Countdown />
            </section>

            {/* Products */}
            <section
                id="products"
                className="beauty-products-section"
            >

                <div className="beauty-section-heading">

                    <div>
                        <p className="beauty-section-label">
                            SHOP OUR COLLECTION
                        </p>

                        <h2>
                            Best Sellers
                        </h2>
                    </div>

                    <p className="beauty-result-count">
                        {filteredProducts.length} products
                    </p>

                </div>

                {filteredProducts.length > 0 ? (

                    <div className="beauty-products-grid">

                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={handleAddToCart}
                            />
                        ))}

                    </div>

                ) : (

                    <div className="beauty-no-products">
                        <div className="beauty-no-products-icon">
                            🔍
                        </div>

                        <h3>
                            No products found
                        </h3>

                        <p>
                            Try another search or category.
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedCategory("All");
                            }}
                        >
                            Show All Products
                        </button>
                    </div>

                )}

            </section>

            {/* Bottom Offer */}
            <section className="beauty-bottom-offer">

                <div>
                    <p>
                        SPECIAL OFFER
                    </p>

                    <h2>
                        Glow More. Spend Less.
                    </h2>

                    <span>
                        Enjoy amazing deals on your favourite
                        beauty products.
                    </span>
                </div>

                <a
                    href="#products"
                    className="beauty-offer-button"
                >
                    Explore Products
                </a>

            </section>

            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    productName={toast.productName}
                    onClose={closeToast}
                />
            )}

        </div>
    );
};

export default BeautyHome;