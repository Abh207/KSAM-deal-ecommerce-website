import React, { useEffect, useMemo, useState, useRef } from "react";

import products from "../api/beautyProducts.json";

import ProductCard from "./ProductCard.jsx";
import Toast from "./Toast.jsx";
import { requireAuth } from "../auth/auth.js";
import Navbar from "../deals/components/Navbar.jsx";
import { addProductToCart, normalizeCartItem, resolveImagePath } from "../lib/cartHelper.js";

import "./BeautyHome.css";
import "./beauty-sections/beautySections.css";

import BeautyBackgroundVideo from "./beauty-sections/BeautyBackgroundVideo.jsx";
import PromoCarousel from "./beauty-sections/PromoCarousel.jsx";
import CategoryTiles from "./beauty-sections/CategoryTiles.jsx";
import TrendingSection from "./beauty-sections/TrendingSection.jsx";
import RoutineTimeline from "./beauty-sections/RoutineTimeline.jsx";
import IngredientSpotlight from "./beauty-sections/IngredientSpotlight.jsx";
import ReviewCarousel from "./beauty-sections/ReviewCarousel.jsx";
import BackToTop from "./beauty-sections/BackToTop.jsx";

const CART_STORAGE_KEY = "cartProductLS";

const BeautyHome = () => {
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
    // Hero Video Ref & Lifecycle
    // -----------------------------
    const heroRef = useRef(null);
    const videoRef = useRef(null);

    const resolveVideoUrl = (path) => {
        if (!path) return "";
        if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
        const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
        const normalizedBase = base.endsWith("/") ? base : `${base}/`;
        const clean = path.replace(/^\/+/, "");
        if (path.startsWith(normalizedBase)) return path;
        return `${normalizedBase}${clean}`;
    };

    const heroVideoSrc = resolveVideoUrl("assets/videos/gemini_generated_video_99e67b16.mp4");

    useEffect(() => {
        const heroEl = heroRef.current;
        const videoEl = videoRef.current;
        if (!heroEl || !videoEl) return;

        try {
            videoEl.muted = true;
            videoEl.defaultMuted = true;
        } catch (e) {}

        if (typeof IntersectionObserver === "undefined") {
            videoEl.play().catch(() => {});
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && document.visibilityState !== "hidden") {
                    videoEl.play().catch(() => {});
                } else {
                    videoEl.pause();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(heroEl);

        const handleVisibilityChange = () => {
            if (!videoRef.current) return;
            if (document.visibilityState === "hidden") {
                videoRef.current.pause();
            } else if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                const inView = rect.top < window.innerHeight && rect.bottom > 0;
                if (inView) {
                    videoRef.current.play().catch(() => {});
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            observer.disconnect();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

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
        return products.filter((product) => {
            return (
                selectedCategory === "All" ||
                product.category === selectedCategory
            );
        });
    }, [selectedCategory]);

    // -----------------------------
    // Add product to cart
    // -----------------------------
    const handleAddToCart = (product, quantity) => {
        if (!requireAuth({ type: "add_to_cart", product })) {
            return;
        }

        const normalized = normalizeCartItem(product, quantity);
        addProductToCart(product, quantity);

        // Update cart count
        updateCartCount();

        // Show popup
        setToast({
            message: "Product added to cart",
            productName: normalized?.name || product.name
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

            {/* Part 1: Full-Page Fixed Background Video & Overlay */}
            <BeautyBackgroundVideo />

            {/* Shared Deals-style Navbar */}
            <Navbar />

            {/* Hero Section - Background Video Only (First thing under navbar) */}
            <section
                id="home"
                className="beauty-hero"
                ref={heroRef}
            >
                <video
                    ref={videoRef}
                    className="beauty-hero-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                >
                    <source src={heroVideoSrc} type="video/mp4" />
                </video>
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
                        {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
                    </p>

                </div>

                {/* Filter Chips row above the product boxes */}
                <div
                    id="categories"
                    className="beauty-category-container beauty-filter-strip"
                    role="tablist"
                    aria-label="Filter products by category"
                >
                    {categories.map((category) => {
                        const isSelected = selectedCategory === category;
                        return (
                            <button
                                key={category}
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                className={`beauty-category-button${isSelected ? " active" : ""}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        );
                    })}
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
                            Try another category.
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setSelectedCategory("All");
                            }}
                        >
                            Show All Products
                        </button>
                    </div>

                )}

            </section>

            {/* Sections below Products Grid */}
            <PromoCarousel onSelectCategory={setSelectedCategory} />
            <CategoryTiles onSelectCategory={setSelectedCategory} />
            <TrendingSection products={products} onAddToCart={handleAddToCart} />
            <RoutineTimeline />
            <IngredientSpotlight />
            <ReviewCarousel />

            {/* Floating Back to Top Button */}
            <BackToTop />

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