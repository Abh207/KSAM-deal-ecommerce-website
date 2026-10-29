import React, { useEffect, useState, useRef } from "react";
import { Cpu } from "lucide-react";
import shopProducts from "./shopProducts.json";
import Navbar from "../deals/components/Navbar.jsx";
import ShopProductCard from "./ShopProductCard.jsx";
import ElectronicsPromoCarousel from "./ElectronicsPromoCarousel.jsx";
import ElectronicsFeedback from "./ElectronicsFeedback.jsx";
import BackToTop from "../react/beauty-sections/BackToTop.jsx";
import Toast from "../react/Toast.jsx";

import { addProductToCart, normalizeCartItem } from "../lib/cartHelper.js";

import "./ShopHome.css";
import "./ShopProductCard.css";
import "./ShopPromo.css";

/* =========================================================
   CATEGORIES LIST
========================================================= */
const CATEGORIES = [
    { name: "All", icon: "⚡" },
    { name: "Smartphones", icon: "📱" },
    { name: "Laptops", icon: "💻" },
    { name: "Audio", icon: "🎧" },
    { name: "Cameras", icon: "📷" },
    { name: "Gaming", icon: "🎮" },
    { name: "Smart Home", icon: "🏠" }
];

function ShopHome() {
    /* -----------------------------------------------------
       STATES
    ----------------------------------------------------- */
    const [activeCategory, setActiveCategory] = useState("All");
    const [toast, setToast] = useState(null);

    const heroVideoRef = useRef(null);
    const heroSectionRef = useRef(null);

    const ROTATING_WORDS = ["Better.", "Smarter.", "Faster.", "Easier."];
    const [wordIndex, setWordIndex] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [parallax, setParallax] = useState({ x: 0, y: 0 });

    /* -----------------------------------------------------
       ROTATING WORDS (EVERY 3 SECONDS) - HERO
    ----------------------------------------------------- */
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) return;

        const interval = setInterval(() => {
            setIsFlipping(true);
            setTimeout(() => {
                setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
                setIsFlipping(false);
            }, 320);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    /* -----------------------------------------------------
       HERO MOUSE PARALLAX (DESKTOP ONLY)
    ----------------------------------------------------- */
    const handleHeroMouseMove = (e) => {
        if (typeof window === "undefined" || window.innerWidth <= 768) return;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) return;

        const rect = heroSectionRef.current?.getBoundingClientRect();
        if (!rect) return;

        const relativeX = (e.clientX - rect.left) / rect.width - 0.5;
        const relativeY = (e.clientY - rect.top) / rect.height - 0.5;

        setParallax({
            x: Math.round(relativeX * -24),
            y: Math.round(relativeY * -20)
        });
    };

    const handleHeroMouseLeave = () => {
        setParallax({ x: 0, y: 0 });
    };

    /* -----------------------------------------------------
       HERO VIDEO CONTROLS & OBSERVER
    ----------------------------------------------------- */
    useEffect(() => {
        const video = heroVideoRef.current;
        const section = heroSectionRef.current;
        if (!video || !section) return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) {
            video.pause();
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const playPromise = video.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(() => {});
                        }
                    } else {
                        video.pause();
                    }
                });
            },
            { threshold: 0.15 }
        );

        observer.observe(section);

        return () => {
            observer.disconnect();
        };
    }, []);

    /* -----------------------------------------------------
       CATEGORY FILTERING & PRODUCT FILTER
    ----------------------------------------------------- */
    const filteredProducts = activeCategory === "All"
        ? shopProducts
        : shopProducts.filter((product) => product.category === activeCategory);

    const handleCategoryClick = (categoryName) => {
        setActiveCategory(categoryName);
        const grid = document.getElementById("shop-products");
        if (grid) {
            const rect = grid.getBoundingClientRect();
            if (rect.top < 0 || rect.top > window.innerHeight) {
                grid.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };

    /* -----------------------------------------------------
       ADD TO CART (Part 3 requirement)
    ----------------------------------------------------- */
    const handleAddToCart = (product, qty = 1) => {
        try {
            const normalized = normalizeCartItem(product, qty);
            addProductToCart(product, qty);

            setToast({
                message: "Added to cart",
                productName: normalized?.name || product.name || "Product"
            });
        } catch (error) {
            console.error("Cart error:", error);
        }
    };

    return (
        <div className="shop-page">
            {/* Shared Navbar */}
            <Navbar />

            {/* =================================================
                HERO SECTION (Content and design kept unchanged)
            ================================================= */}
            <section
                className="shop-hero"
                ref={heroSectionRef}
                onMouseMove={handleHeroMouseMove}
                onMouseLeave={handleHeroMouseLeave}
            >
                {/* Looping Cinematic Video Background */}
                <video
                    ref={heroVideoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster={`${import.meta.env.BASE_URL}videos/hero-keyboard-poster.webp`}
                    className="shop-hero-video"
                    aria-hidden="true"
                >
                    <source
                        src={`${import.meta.env.BASE_URL}videos/hero-keyboard.mp4`}
                        type="video/mp4"
                    />
                </video>

                {/* Soft Ambient Radial Glow behind text */}
                <div className="shop-hero-glow" aria-hidden="true" />

                {/* Left-to-right gradient overlay for text readability */}
                <div className="shop-hero-overlay-gradient" aria-hidden="true" />

                {/* Bottom-right watermark cover backup */}
                <div className="shop-hero-watermark-cover" aria-hidden="true" />

                <div
                    className="shop-hero-content"
                    style={{
                        transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`
                    }}
                >
                    <h1 className="shop-hero-title">
                        <div className="shop-hero-line-mask">
                            <span className="shop-hero-line shop-hero-line-1">
                                Technology
                            </span>
                        </div>
                        <div className="shop-hero-line-mask">
                            <span className="shop-hero-line shop-hero-line-2">
                                That Makes
                            </span>
                        </div>
                        <div className="shop-hero-line-mask">
                            <span className="shop-hero-line shop-hero-line-3 shop-hero-gradient-text">
                                <span>Life</span>
                                <span className={`shop-hero-rotating-word ${isFlipping ? "is-flipping" : ""}`}>
                                    {ROTATING_WORDS[wordIndex]}
                                </span>
                            </span>
                        </div>
                    </h1>

                    <div className="shop-hero-underline" aria-hidden="true" />

                    <p className="shop-hero-description">
                        Discover the latest <span className="shop-hero-highlight">electronics</span>, <span className="shop-hero-highlight">smart devices</span> and <span className="shop-hero-highlight">accessories</span> at amazing prices.
                    </p>
                </div>
            </section>

            {/* =================================================
                PART 1 - SHOP BY CATEGORY SECTION
            ================================================= */}
            <section id="shop-categories" className="shop-categories" aria-label="Product Categories">
                <div className="beauty-section-header-centered">
                    <div className="beauty-section-badge">
                        <Cpu size={14} className="beauty-badge-icon" aria-hidden="true" />
                        <span>EXPLORE CATEGORIES</span>
                    </div>

                    <h2 className="beauty-section-title">
                        Shop By <span className="shop-categories-gradient-text">Category</span>
                    </h2>

                    <p className="beauty-section-subtitle">
                        Find high-performance gadgets tailored to your digital workflow and lifestyle.
                    </p>
                </div>

                <div className="shop-category-scroll-container">
                    <div className="shop-category-grid" role="tablist" aria-label="Electronics category filters">
                        {CATEGORIES.map((category) => {
                            const isActive = activeCategory === category.name;
                            return (
                                <button
                                    key={category.name}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    className={`shop-category-chip${isActive ? " active" : ""}`}
                                    onClick={() => handleCategoryClick(category.name)}
                                >
                                    <span className="category-chip-icon" aria-hidden="true">{category.icon}</span>
                                    <span>{category.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* =================================================
                PRODUCTS GRID
            ================================================= */}
            <section id="shop-products" className="shop-products" aria-label="Electronics Products">
                {filteredProducts.length > 0 ? (
                    <div className="shop-product-grid">
                        {filteredProducts.map((product) => (
                            <ShopProductCard
                                key={`${activeCategory}-${product.id}`}
                                product={product}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="beauty-no-products">
                        <div style={{ fontSize: "42px", marginBottom: "12px" }}>🔎</div>
                        <h3>No products found</h3>
                        <p>No electronics found in this category.</p>
                        <button
                            type="button"
                            onClick={() => setActiveCategory("All")}
                        >
                            View All Products
                        </button>
                    </div>
                )}
            </section>

            {/* =================================================
                PART 4 - CLICKABLE PROMO CAROUSEL (Below products)
            ================================================= */}
            <ElectronicsPromoCarousel />

            {/* =================================================
                PART 5A - CUSTOMER FEEDBACK SECTION (Below promo)
            ================================================= */}
            <ElectronicsFeedback />

            {/* =================================================
                VALUE & SERVICES PROPOSITION (Transparent cards)
            ================================================= */}
            <section className="shop-services-section" aria-label="Why KSAM Deal">
                <div className="beauty-section-header-centered">
                    <div className="beauty-section-badge">
                        <span>WHY KSAM DEAL</span>
                    </div>

                    <h2 className="beauty-section-title">
                        Engineered For <span className="beauty-reviews-gradient-text">Trust</span>
                    </h2>

                    <p className="beauty-section-subtitle">
                        Every device is verified for authenticity, backed by certified brand coverage.
                    </p>
                </div>

                <div className="shop-service-grid">
                    <div className="shop-service-card">
                        <span className="shop-service-icon">⚡</span>
                        <h3>Express Dispatch</h3>
                        <p>Orders processed within 24 hours with real-time live package tracking.</p>
                    </div>

                    <div className="shop-service-card">
                        <span className="shop-service-icon">💰</span>
                        <h3>Price Match Guarantee</h3>
                        <p>We compare tech deals nationwide to ensure you never overpay.</p>
                    </div>

                    <div className="shop-service-card">
                        <span className="shop-service-icon">🛡️</span>
                        <h3>Verified Quality</h3>
                        <p>100% brand-sealed original packaging with valid warranty support.</p>
                    </div>

                    <div className="shop-service-card">
                        <span className="shop-service-icon">💬</span>
                        <h3>Specialist Support</h3>
                        <p>Get instant guidance on specs, setups, and compatibility anytime.</p>
                    </div>
                </div>
            </section>

            {/* Floating Back to Top Button */}
            <BackToTop />

            {/* Toast notification */}
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

export default ShopHome;