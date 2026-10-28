import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
    useCallback
} from "react";
import { createRoot } from "react-dom/client";

import ShoeCard from "./ShoeCard";
import ShoePromoCarousel from "./ShoePromoCarousel";
import ShoeFeedback from "./ShoeFeedback";
import BackToTop from "../react/beauty-sections/BackToTop.jsx";
import Navbar from "../deals/components/Navbar.jsx";
import { addProductToCart, normalizeCartItem } from "../lib/cartHelper.js";
import { isInWishlist, toggleWishlist as sharedToggleWishlist, subscribeWishlist } from "../lib/wishlist.js";

import shoesData from "../api/shoes-products.json";

import "./shoes.css";
import "./shoes-modern.css";

function ShoesMain() {
    /* =====================================================
       STATE
       ===================================================== */
    // Category filter (used internally by Promo Carousel & Clear Filter pill)
    const [category, setCategory] = useState("All");

    // Pagination
    const [visibleProducts, setVisibleProducts] = useState(
        shoesData.store.defaultVisibleProducts || 8
    );

    // Wishlist change re-render subscriber
    const [, setWishlistVersion] = useState(0);
    useEffect(() => {
        const unsub = subscribeWishlist(() => {
            setWishlistVersion((v) => v + 1);
        });
        return unsub;
    }, []);

    // Toast feedback
    const [toast, setToast] = useState("");
    const toastTimerRef = useRef(null);

    const showToast = useCallback((msg) => {
        setToast(msg);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => {
            setToast("");
        }, 2500);
    }, []);

    /* =====================================================
       HERO VIDEO STATE & LIFECYCLE (PART 3)
       ===================================================== */
    const heroVideoRef = useRef(null);
    const heroSectionRef = useRef(null);
    const [heroVideoFailed, setHeroVideoFailed] = useState(false);
    const [heroInView, setHeroInView] = useState(true);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
        return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    });

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onChange = (e) => setPrefersReducedMotion(e.matches);
        if (mq.addEventListener) mq.addEventListener("change", onChange);
        return () => {
            if (mq.removeEventListener) mq.removeEventListener("change", onChange);
        };
    }, []);

    // Viewport visibility observer
    useEffect(() => {
        const el = heroSectionRef.current;
        if (!el || typeof IntersectionObserver === "undefined") return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setHeroInView(entry.isIntersecting);
                });
            },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Play / pause video based on viewport & tab visibility
    useEffect(() => {
        const vid = heroVideoRef.current;
        if (!vid) return;

        const handlePlayState = () => {
            if (document.visibilityState === "hidden" || !heroInView || prefersReducedMotion || heroVideoFailed) {
                vid.pause();
            } else {
                const playPromise = vid.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(() => {});
                }
            }
        };

        handlePlayState();

        document.addEventListener("visibilitychange", handlePlayState);
        return () => {
            document.removeEventListener("visibilitychange", handlePlayState);
        };
    }, [heroInView, prefersReducedMotion, heroVideoFailed]);

    /* =====================================================
       CART & WISHLIST HANDLERS
       ===================================================== */
    const handleAddToCart = (product, qty = 1) => {
        try {
            const normalized = normalizeCartItem(product, qty);
            addProductToCart(product, qty);
            showToast(`${normalized?.name || product.name || "Product"} added to cart 🛒`);
        } catch (error) {
            console.error("Unable to add product:", error);
        }
    };

    const handleWishlist = (product) => {
        sharedToggleWishlist(product);
    };

    /* =====================================================
       PRODUCTS FILTERING
       ===================================================== */
    const filteredProducts = useMemo(() => {
        if (!category || category === "All") {
            return shoesData.products;
        }
        return shoesData.products.filter(
            (product) => product.category?.toLowerCase() === category.toLowerCase()
        );
    }, [category]);

    const productsToShow = useMemo(() => {
        return filteredProducts.slice(0, visibleProducts);
    }, [filteredProducts, visibleProducts]);

    const loadMore = () => {
        setVisibleProducts((prev) => prev + 4);
    };

    const handleCategorySelect = (newCategory) => {
        setCategory(newCategory || "All");
        setVisibleProducts(16);
    };

    /* =====================================================
       RENDER
       ===================================================== */
    return (
        <div className="shoes-page">
            {/* Shared Deals-style Navbar */}
            <Navbar />

            {/* =================================================
               PART 1: FULL SCREEN HERO VIDEO WITH LEFT TEXT BLOCK
               ================================================= */}
            <section className="ksam-shoe-hero" ref={heroSectionRef}>
                {!prefersReducedMotion && !heroVideoFailed ? (
                    <video
                        ref={heroVideoRef}
                        className="ksam-hero-video"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        disablePictureInPicture
                        controlsList="nodownload nofullscreen noremoteplayback"
                        poster={`${import.meta.env.BASE_URL}assets/videos/shoes-hero-poster.jpg`}
                        onError={() => setHeroVideoFailed(true)}
                    >
                        <source
                            src={`${import.meta.env.BASE_URL}assets/videos/shoes-hero.mp4`}
                            type="video/mp4"
                        />
                    </video>
                ) : (
                    <img
                        src={`${import.meta.env.BASE_URL}assets/videos/shoes-hero-poster.jpg`}
                        alt="Shoes Collection"
                        className="ksam-hero-video-poster"
                    />
                )}

                {/* Readability gradient overlay (left dark, fading to transparent at ~60%) */}
                <div className="ksam-hero-overlay" aria-hidden="true" />

                {/* Hero text block on the TOP-LEFT side */}
                <div className="ksam-hero-content">
                    <h1 className="ksam-hero-title">
                        Step Into Comfort.<br />
                        <span className="ksam-hero-accent">Walk Into Confidence.</span>
                    </h1>
                    <p className="ksam-hero-desc">
                        Discover sneakers, running shoes and everyday styles at unbeatable deals, all in one place.
                    </p>
                </div>
            </section>

            {/* =================================================
               PART 1 & 4: PRODUCTS SECTION WITH CENTERED HEADINGS
               ================================================= */}
            <section className="shoe-products-section" id="shoe-products">
                {/* Centered Heading Block (Part 4) */}
                <div className="shoe-products-heading-block">
                    <span className="shoe-heading-pill">
                        KSAM COLLECTION
                    </span>
                    <h2 className="shoe-heading-title">
                        Shoes made for <span>every step</span>
                    </h2>
                    <p className="shoe-heading-subtitle">
                        Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
                    </p>
                    {category !== "All" && (
                        <button
                            type="button"
                            className="shoe-clear-filter-pill"
                            onClick={() => setCategory("All")}
                            aria-label="Clear category filter"
                        >
                            Clear filter ✕
                        </button>
                    )}
                </div>

                {/* Product Area (No Filter Sidebar, Full Width) */}
                <div className="shoe-product-area">
                    {productsToShow.length > 0 ? (
                        <div className="shoe-grid beauty-products-grid">
                            {productsToShow.map((product) => (
                                <ShoeCard
                                    key={product.id}
                                    product={product}
                                    isWishlisted={isInWishlist(product.id)}
                                    onWishlist={handleWishlist}
                                    onAddToCart={handleAddToCart}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="shoe-no-results">
                            <h3>No shoes found</h3>
                            <p>No products match the selected category.</p>
                            <button
                                type="button"
                                onClick={() => setCategory("All")}
                            >
                                View All Shoes
                            </button>
                        </div>
                    )}

                    {/* Load More Button */}
                    {visibleProducts < filteredProducts.length && (
                        <div className="load-more-wrapper">
                            <button
                                type="button"
                                className="load-more-button"
                                onClick={loadMore}
                            >
                                Load More Shoes
                                <i className="fa-solid fa-arrow-down"></i>
                            </button>
                            <span>
                                Showing {productsToShow.length} of {filteredProducts.length}
                            </span>
                        </div>
                    )}
                </div>
            </section>

            {/* =================================================
               PART 6: CLICKABLE PROMOTIONAL CARDS CAROUSEL
               ================================================= */}
            <ShoePromoCarousel onSelectCategory={handleCategorySelect} />

            {/* =================================================
               PART 3: CUSTOMER FEEDBACK SECTION (MATCHED TO BEAUTY)
               ================================================= */}
            <ShoeFeedback />

            {/* Floating Back to Top Button (Part 2) */}
            <BackToTop />

            {/* Toast Notification */}
            {toast && (
                <div className="beauty-toast">
                    <div className="beauty-toast-icon">
                        <i className="fa-solid fa-circle-check" style={{ color: "#16c965", fontSize: "20px" }}></i>
                    </div>
                    <div className="beauty-toast-content">
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                            {toast}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

/* =========================================================
   RENDER
   ========================================================= */
const rootElement = document.getElementById("shoes-root");
if (rootElement) {
    createRoot(rootElement).render(<ShoesMain />);
}

export default ShoesMain;