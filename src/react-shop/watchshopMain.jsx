import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";

import "./watchshopApp.css";

import productsData from "../api/watch-products.json";

import Navbar from "../deals/components/Navbar";
import WatchVideoHero from "./watch-components/WatchVideoHero";
import CategorySection from "./watch-components/CategorySection";
import ProductSection from "./watch-components/ProductSection";
import WatchPromoCarousel from "./watch-components/WatchPromoCarousel";
import WatchFeedback from "./watch-components/WatchFeedback";
import BackToTop from "../react/beauty-sections/BackToTop";
import Toast from "../react/Toast";

import { requireAuth } from "../auth/auth.js";
import { addProductToCart, normalizeCartItem } from "../lib/cartHelper.js";

function WatchShop() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [cartCount, setCartCount] = useState(0);
    const [toast, setToast] = useState(null);

    /* =========================================
       LOAD PRODUCTS
    ========================================= */
    useEffect(() => {
        setProducts(productsData);
        setLoading(false);
    }, []);

    /* =========================================
       PART 2 - BACKGROUND VIDEO LIFECYCLE
    ========================================= */
    useEffect(() => {
        const bgVideo = document.querySelector(".bg-video");
        const bgWrap = document.querySelector(".bg-video-wrap");
        if (!bgVideo) return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const saveData = navigator.connection?.saveData === true;

        if (prefersReducedMotion || saveData) {
            bgVideo.pause();
            if (bgWrap) {
                bgWrap.style.background = "linear-gradient(180deg, #0b0b0b 0%, #1a1409 100%)";
            }
            if (bgVideo) {
                bgVideo.style.display = "none";
            }
            return;
        }

        const attemptPlay = () => {
            try {
                bgVideo.muted = true;
                bgVideo.defaultMuted = true;
                const p = bgVideo.play();
                if (p !== undefined) {
                    p.catch(() => {
                        // Retry on first user interaction
                        const onFirstInteraction = () => {
                            bgVideo.play().catch(() => {});
                            window.removeEventListener("click", onFirstInteraction);
                            window.removeEventListener("touchstart", onFirstInteraction);
                            window.removeEventListener("keydown", onFirstInteraction);
                        };
                        window.addEventListener("click", onFirstInteraction, { once: true });
                        window.addEventListener("touchstart", onFirstInteraction, { once: true });
                        window.addEventListener("keydown", onFirstInteraction, { once: true });
                    });
                }
            } catch (err) {}
        };

        attemptPlay();

        // Error handling fallback: dark gradient (#0b0b0b to #1a1409)
        const handleError = () => {
            if (bgWrap) {
                bgWrap.style.background = "linear-gradient(180deg, #0b0b0b 0%, #1a1409 100%)";
            }
            if (bgVideo) {
                bgVideo.style.display = "none";
            }
        };
        bgVideo.addEventListener("error", handleError);

        // Pause when tab is hidden
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                bgVideo.pause();
            } else if (!prefersReducedMotion && !saveData) {
                bgVideo.play().catch(() => {});
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            bgVideo.removeEventListener("error", handleError);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
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
       LOAD CART COUNT & LISTENERS
    ========================================= */
    useEffect(() => {
        updateCartCount();

        window.addEventListener("storage", updateCartCount);
        window.addEventListener("cartUpdated", updateCartCount);

        return () => {
            window.removeEventListener("storage", updateCartCount);
            window.removeEventListener("cartUpdated", updateCartCount);
        };
    }, []);

    /* =========================================
       HANDLE ADD TO CART
    ========================================= */
    const handleAddToCart = (product, quantity = 1) => {
        if (!requireAuth({ type: "add_to_cart", product })) {
            return;
        }

        const normalized = normalizeCartItem(product, quantity);
        addProductToCart(product, quantity);

        updateCartCount();

        setToast({
            message: "Added to cart",
            productName: normalized?.name || product.name
        });
    };

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
            {/* Shared Deals-style Navbar */}
            <Navbar />

            {/* PART 1 - NEW FULL-SCREEN VIDEO HERO */}
            <WatchVideoHero />

            {/* PART 1 - EXISTING HERO MOVED DIRECTLY BELOW NEW VIDEO HERO */}
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

            {/* CATEGORIES */}
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

            {/* PRODUCTS */}
            <div id="products">
                <ProductSection
                    products={filteredProducts}
                    onAddToCart={handleAddToCart}
                />
            </div>

            {/* PART 4 - CLICKABLE PROMOTIONAL CARDS CAROUSEL */}
            <WatchPromoCarousel />

            {/* PART 5 - CUSTOMER FEEDBACK SECTION */}
            <WatchFeedback />

            {/* FLOATING BACK TO TOP */}
            <BackToTop />

            {/* TOAST NOTIFICATION */}
            {toast && (
                <Toast
                    message={toast.message}
                    productName={toast.productName}
                    onClose={() => setToast(null)}
                />
            )}
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