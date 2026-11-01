import React, {
    useEffect,
    useMemo,
    useState,
    useRef
} from "react";

import { createRoot } from "react-dom/client";

import ClothesCard from "./ClothesCard";

import FashionCampaign from "./FashionCampaign";
import ClothesHero from "./ClothesHero";
import ClothesFeedback from "./ClothesFeedback.jsx";
import AudioBackgroundVideo from "../react-audio/AudioBackgroundVideo.jsx";

import clothesData from "../../api/clothesproducts.json";
import { requireAuth } from "../../auth/auth.js";
import Navbar from "../../deals/components/Navbar.jsx";
import { addProductToCart, normalizeCartItem, resolveImagePath } from "../../lib/cartHelper.js";
import { isInWishlist, toggleWishlist as sharedToggleWishlist, subscribeWishlist } from "../../lib/wishlist.js";

import "./clothes.css";


/* =========================================================
   STORAGE KEYS
========================================================= */

const CART_KEY = "cartProductLS";
const WISHLIST_KEY = "clothesWishlist";
const THEME_KEY = "ksamClothesTheme";


/* =========================================================
   HELPER FUNCTIONS
========================================================= */

const getImagePath = (image) => {

    if (!image) {
        return "";
    }

    return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, "")}`;
};


const readLocalStorage = (key, fallback) => {

    try {

        const value = localStorage.getItem(key);

        if (!value) {
            return fallback;
        }

        return JSON.parse(value);

    } catch (error) {

        console.error(`Unable to read ${key}`, error);

        return fallback;
    }
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

function ClothesMain() {

    const store = clothesData.store || {};

    const categories = clothesData.categories || [];

    const products = clothesData.products || [];


    /* =====================================================
       THEME
    ====================================================== */

    const [theme, setTheme] = useState(() => {

        return (
            localStorage.getItem(THEME_KEY) ||
            "dark"
        );

    });


    /* =====================================================
       SEARCH / FILTER STATES
    ====================================================== */

    const [search, setSearch] = useState("");

    const [activeCategory, setActiveCategory] = useState("All");

    const [selectedGender, setSelectedGender] = useState("All");

    const [sortBy, setSortBy] = useState("featured");

    const [maxPrice, setMaxPrice] = useState(
        Number(store.maxPrice || 5000)
    );


    /* =====================================================
       PRODUCT DISPLAY
    ====================================================== */

    const [visibleProducts, setVisibleProducts] = useState(
        Number(store.defaultVisibleProducts || 8)
    );


    const [, setWishlistVersion] = useState(0);

    useEffect(() => {
        const unsub = subscribeWishlist(() => {
            setWishlistVersion((v) => v + 1);
        });
        return unsub;
    }, []);


    /* =====================================================
       CART
    ====================================================== */

    const [cartCount, setCartCount] = useState(0);


    /* =====================================================
       QUICK VIEW
    ====================================================== */

    const [selectedProduct, setSelectedProduct] = useState(null);


    /* =====================================================
       TOAST
    ====================================================== */

    const [toast, setToast] = useState("");


    /* =====================================================
       BACK TO TOP
    ====================================================== */

    const [showTopButton, setShowTopButton] = useState(false);


    /* =====================================================
       MOBILE FILTER
    ====================================================== */

    const [mobileFilters, setMobileFilters] = useState(false);


    /* =====================================================
       THEME EFFECT
    ====================================================== */

    useEffect(() => {

        document.documentElement.dataset.clothesTheme =
            theme;

        localStorage.setItem(
            THEME_KEY,
            theme
        );

    }, [theme]);


    /* =====================================================
       CART COUNT
    ====================================================== */

    const updateCartCount = () => {

        const cart = readLocalStorage(
            CART_KEY,
            []
        );

        if (!Array.isArray(cart)) {

            setCartCount(0);

            return;
        }


        const total = cart.reduce(
            (sum, item) => {

                return (
                    sum +
                    Number(item.quantity || 1)
                );

            },
            0
        );


        setCartCount(total);
    };


    useEffect(() => {

        updateCartCount();


        const handleStorage = () => {

            updateCartCount();

        };


        window.addEventListener(
            "storage",
            handleStorage
        );


        window.addEventListener(
            "focus",
            handleStorage
        );


        return () => {

            window.removeEventListener(
                "storage",
                handleStorage
            );


            window.removeEventListener(
                "focus",
                handleStorage
            );

        };

    }, []);





    /* =====================================================
       SCROLL DETECTION
    ====================================================== */

    useEffect(() => {

        const handleScroll = () => {

            setShowTopButton(
                window.scrollY > 500
            );

        };


        window.addEventListener(
            "scroll",
            handleScroll,
            {
                passive: true
            }
        );


        handleScroll();


        return () => {

            window.removeEventListener(
                "scroll",
                handleScroll
            );

        };

    }, []);


    /* =====================================================
       TOAST MESSAGE
    ====================================================== */

    const showToast = (message) => {

        setToast(message);


        window.clearTimeout(
            window.__ksamClothesToast
        );


        window.__ksamClothesToast =
            window.setTimeout(() => {

                setToast("");

            }, 2500);

    };


    /* =====================================================
       THEME TOGGLE
    ====================================================== */

    const toggleTheme = () => {

        setTheme((currentTheme) => {

            if (currentTheme === "dark") {

                return "light";

            }

            return "dark";

        });

    };


    /* =====================================================
       WISHLIST
    ====================================================== */

    const toggleWishlist = (product) => {
        if (!requireAuth({ type: "wishlist", product })) {
            return;
        }
        sharedToggleWishlist(product);
    };


    /* =====================================================
       ADD TO CART
    ====================================================== */

    const addToCart = (product) => {
        if (!requireAuth({ type: "add_to_cart", product })) {
            return;
        }

        const normalized = normalizeCartItem(product, 1);
        addProductToCart(product, 1);
        updateCartCount();

        showToast(
            `${normalized?.name || product.name || "Product"} added to cart`
        );
    };


    /* =====================================================
       CATEGORY SELECTION
    ====================================================== */

    const selectCategory = (category) => {

        setActiveCategory(category);

        setVisibleProducts(
            Number(
                store.defaultVisibleProducts || 8
            )
        );


        window.requestAnimationFrame(() => {

            document
                .querySelector(
                    ".clothes-products-section"
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        });

    };


    /* =====================================================
       RESET FILTERS
    ====================================================== */

    const resetFilters = () => {

        setSearch("");

        setActiveCategory("All");

        setSelectedGender("All");

        setSortBy("featured");

        setMaxPrice(
            Number(store.maxPrice || 5000)
        );

        setVisibleProducts(
            Number(
                store.defaultVisibleProducts || 8
            )
        );

    };


    /* =====================================================
       CATEGORY PILLS
    ====================================================== */

    const CATEGORY_PILLS = [
        "All",
        "Women",
        "Men",
        "Dresses",
        "Tops",
        "Bottoms",
        "Jackets"
    ];


    /* =====================================================
       FILTER + SORT PRODUCTS
    ====================================================== */

    const filteredAndSortedProducts = useMemo(() => {

        let result = [...products];

        /* SEARCH */
        const keyword = search.trim().toLowerCase();
        if (keyword) {
            result = result.filter((product) => {
                const searchableText = [
                    product.name,
                    product.brand,
                    product.category,
                    product.gender,
                    product.color,
                    product.description,
                    ...(product.tags || [])
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(keyword);
            });
        }

        /* CATEGORY / GENDER PILL FILTER */
        if (activeCategory !== "All") {
            const cat = activeCategory.toLowerCase();
            result = result.filter((product) => {
                const pCat = String(product.category || "").toLowerCase();
                const pGender = String(product.gender || "").toLowerCase();
                if (cat === "women") {
                    return pGender === "women" || pCat === "women";
                }
                if (cat === "men") {
                    return pGender === "men" || pCat === "men";
                }
                return pCat === cat;
            });
        }

        /* SORT */
        switch (sortBy) {
            case "price-low":
                result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
                break;
            case "price-high":
                result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
                break;
            case "newest":
                result.sort((a, b) => Number(b.newArrival || 0) - Number(a.newArrival || 0));
                break;
            case "featured":
            default:
                result.sort((a, b) => Number(b.featured || 0) - Number(a.featured || 0));
                break;
        }

        return result;

    }, [products, search, activeCategory, sortBy]);

    const filteredProducts = filteredAndSortedProducts;
    const displayedProducts = filteredAndSortedProducts;


    /* =====================================================
       BACK TO TOP
    ====================================================== */

    const scrollToTop = () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };



    /* =====================================================
       TASK 1: CATEGORY CIRCLES AUTO-MOVE ON MOBILE ONLY
    ====================================================== */
    const categorySectionRef = useRef(null);
    const categoryScrollerRef = useRef(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const mobileMq = window.matchMedia("(max-width: 768px)");
        const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

        let isMobile = mobileMq.matches;
        let isReducedMotion = motionMq.matches;

        let animFrameId = null;
        let isVisible = false;
        let isInteracting = false;
        let resumeTimer = null;

        // Auto-move direction: 1 = forward (Women -> Accessories), -1 = backward (glide back)
        let direction = 1;
        let pauseUntil = 0;
        let lastTime = 0;
        let currentScroll = 0;
        const SPEED = 35; // px/sec

        const step = (timestamp) => {
            if (!isMobile || isReducedMotion || !isVisible) {
                animFrameId = null;
                return;
            }

            const scroller = categoryScrollerRef.current;
            if (!scroller) {
                animFrameId = null;
                return;
            }

            if (!lastTime) lastTime = timestamp;
            const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
            lastTime = timestamp;

            const maxScroll = scroller.scrollWidth - scroller.clientWidth;

            if (maxScroll > 2 && !isInteracting) {
                if (timestamp >= pauseUntil) {
                    if (direction === 1) {
                        currentScroll += SPEED * dt;
                        if (currentScroll >= maxScroll) {
                            currentScroll = maxScroll;
                            scroller.scrollLeft = maxScroll;
                            direction = -1;
                            pauseUntil = timestamp + 1000;
                        } else {
                            scroller.scrollLeft = currentScroll;
                        }
                    } else {
                        currentScroll -= (SPEED * 1.5) * dt;
                        if (currentScroll <= 0) {
                            currentScroll = 0;
                            scroller.scrollLeft = 0;
                            direction = 1;
                            pauseUntil = timestamp + 1000;
                        } else {
                            scroller.scrollLeft = currentScroll;
                        }
                    }
                }
            }

            animFrameId = requestAnimationFrame(step);
        };

        const startAnimation = () => {
            if (!animFrameId && isMobile && !isReducedMotion && isVisible && !document.hidden) {
                const scroller = categoryScrollerRef.current;
                if (scroller) {
                    currentScroll = scroller.scrollLeft;
                }
                lastTime = 0;
                animFrameId = requestAnimationFrame(step);
            }
        };

        const stopAnimation = () => {
            if (animFrameId) {
                cancelAnimationFrame(animFrameId);
                animFrameId = null;
            }
        };

        // 1. IntersectionObserver (threshold: 0.4)
        let observer = null;
        if ("IntersectionObserver" in window && categorySectionRef.current) {
            observer = new IntersectionObserver(
                ([entry]) => {
                    isVisible = entry.isIntersecting;
                    if (isVisible) {
                        startAnimation();
                    } else {
                        stopAnimation();
                    }
                },
                { threshold: 0.4 }
            );
            observer.observe(categorySectionRef.current);
        } else {
            isVisible = true;
            startAnimation();
        }

        // 2. Tab visibility changes
        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopAnimation();
            } else if (isVisible) {
                startAnimation();
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // 3. User interaction pausing
        const markInteraction = () => {
            isInteracting = true;
            if (resumeTimer) clearTimeout(resumeTimer);
        };

        const endInteraction = () => {
            if (resumeTimer) clearTimeout(resumeTimer);
            resumeTimer = setTimeout(() => {
                const scroller = categoryScrollerRef.current;
                if (scroller) {
                    currentScroll = scroller.scrollLeft;
                }
                isInteracting = false;
                lastTime = 0;
            }, 2000);
        };

        const scrollerEl = categoryScrollerRef.current;
        if (scrollerEl) {
            scrollerEl.addEventListener("touchstart", markInteraction, { passive: true });
            scrollerEl.addEventListener("touchmove", markInteraction, { passive: true });
            scrollerEl.addEventListener("touchend", endInteraction, { passive: true });
            scrollerEl.addEventListener("touchcancel", endInteraction, { passive: true });
            scrollerEl.addEventListener("pointerdown", markInteraction, { passive: true });
            scrollerEl.addEventListener("pointerup", endInteraction, { passive: true });
            scrollerEl.addEventListener("pointercancel", endInteraction, { passive: true });
            scrollerEl.addEventListener("wheel", markInteraction, { passive: true });
            scrollerEl.addEventListener("mouseleave", endInteraction, { passive: true });
        }

        // 4. Media query listeners
        const handleMobileChange = (e) => {
            isMobile = e.matches;
            if (isMobile && isVisible && !isReducedMotion) {
                startAnimation();
            } else {
                stopAnimation();
            }
        };
        const handleMotionChange = (e) => {
            isReducedMotion = e.matches;
            if (isReducedMotion) {
                stopAnimation();
            } else if (isMobile && isVisible) {
                startAnimation();
            }
        };

        if (mobileMq.addEventListener) {
            mobileMq.addEventListener("change", handleMobileChange);
            motionMq.addEventListener("change", handleMotionChange);
        }

        if (isMobile && isVisible && !isReducedMotion) {
            startAnimation();
        }

        return () => {
            stopAnimation();
            if (resumeTimer) clearTimeout(resumeTimer);
            if (observer) observer.disconnect();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (scrollerEl) {
                scrollerEl.removeEventListener("touchstart", markInteraction);
                scrollerEl.removeEventListener("touchmove", markInteraction);
                scrollerEl.removeEventListener("touchend", endInteraction);
                scrollerEl.removeEventListener("touchcancel", endInteraction);
                scrollerEl.removeEventListener("pointerdown", markInteraction);
                scrollerEl.removeEventListener("pointerup", endInteraction);
                scrollerEl.removeEventListener("pointercancel", endInteraction);
                scrollerEl.removeEventListener("wheel", markInteraction);
                scrollerEl.removeEventListener("mouseleave", endInteraction);
            }
            if (mobileMq.removeEventListener) {
                mobileMq.removeEventListener("change", handleMobileChange);
                motionMq.removeEventListener("change", handleMotionChange);
            }
        };
    }, []);

    /* =====================================================
       RENDER
    ====================================================== */

    return (

        <div className="clothes-page">

            {/* Shared Deals-style Navbar */}
            <Navbar />

            {/* Moving Video Background behind all content */}
            <AudioBackgroundVideo />


            {/* =================================================
                TOP ANNOUNCEMENT
            ================================================== */}

            <div className="clothes-announcement">

                <div className="clothes-announcement-track">

                    <span>
                        ✦ FREE DELIVERY ABOVE ₹999
                    </span>

                    <span>•</span>

                    <span>
                        30 DAY EASY RETURNS
                    </span>

                    <span>•</span>

                    <span>
                        SECURE CHECKOUT
                    </span>

                    <span>•</span>

                    <span>
                        NEW SEASON IS LIVE
                    </span>

                    <span>•</span>

                    <span>
                        ✦ FREE DELIVERY ABOVE ₹999
                    </span>

                </div>

            </div>





            {/* =================================================
                HERO
            ================================================== */}

            <ClothesHero
                hero={clothesData.hero}
            />





            {/* =================================================
                CATEGORY SECTION
            ================================================== */}

            <section
                className="clothes-category-section"
                id="categories"
                ref={categorySectionRef}
            >

                <div className="clothes-section-heading">


                    <div>

                        <span>
                            CURATED FOR YOU
                        </span>

                        <h2>
                            Shop by category
                        </h2>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            selectCategory("All")
                        }
                    >

                        View all

                        <i className="fa-solid fa-arrow-right"></i>

                    </button>

                </div>


                <div className="clothes-category-scroller-wrap">
                <div className="clothes-category-scroller" ref={categoryScrollerRef}>

                    {categories.map(
                        (category) => {

                            const name =
                                category.name ||
                                category;


                            return (

                                <button
                                    type="button"
                                    key={name}
                                    className={
                                        `clothes-category-item ${
                                            activeCategory === name
                                                ? "active"
                                                : ""
                                        }`
                                    }
                                    onClick={() =>
                                        selectCategory(name)
                                    }
                                >

                                    <div className="clothes-category-circle">

                                        {category.image && (

                                            <img
                                                src={getImagePath(
                                                    category.image
                                                )}
                                                alt={name}
                                                onError={(event) => {

                                                    event.currentTarget.style.display =
                                                        "none";

                                                    event.currentTarget.parentElement.classList.add(
                                                        "image-missing"
                                                    );

                                                }}
                                            />

                                        )}

                                        <span>
                                            {name.slice(0, 1)}
                                        </span>

                                    </div>


                                    <b>
                                        {name}
                                    </b>

                                </button>

                            );

                        }
                    )}

                </div>
                </div>

            </section>


            <FashionCampaign />


            {/* =================================================
                AUTO SCROLL PRODUCTS
            ================================================== */}

            <section
                className="clothes-marquee-section"
                id="women"
            >

                <div className="clothes-section-heading compact">


                    <div>

                        <span>
                            KSAM DEAL EDIT
                        </span>

                        <h2>
                            Trending pieces
                        </h2>

                    </div>


                    <small>
                        Auto scrolling • New drops
                    </small>

                </div>


                <div className="clothes-marquee">

                    <div className="clothes-marquee-track">

                        {[...products, ...products].map(
                            (product, index) => (

                                <article
                                    className="clothes-marquee-card"
                                    key={`${product.id}-${index}`}
                                >

                                    <div className="clothes-marquee-image">

                                        {product.image && (

                                            <img
                                                src={getImagePath(
                                                    product.image
                                                )}
                                                alt=""
                                                onError={(event) => {

                                                    event.currentTarget.style.display =
                                                        "none";

                                                    event.currentTarget.parentElement.classList.add(
                                                        "image-missing"
                                                    );

                                                }}
                                            />

                                        )}

                                        <span>
                                            {
                                                product.badge ||
                                                "TRENDING"
                                            }
                                        </span>

                                    </div>


                                    <div>

                                        <small>
                                            {product.category}
                                        </small>

                                        <h3>
                                            {product.name}
                                        </h3>

                                        <b>
                                            ₹
                                            {Number(
                                                product.price || 0
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </b>

                                    </div>

                                </article>

                            )
                        )}

                    </div>

                </div>

            </section>


            {/* =================================================
                PRODUCTS
            ================================================== */}

            <main
                className="clothes-products-section"
                id="trending"
            >
                {/* MODERN CENTERED STACKED HEADER */}
                <div className="clothes-header-block">
                    <div className="clothes-header-badge">
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                        <span>SHOP THE DROP</span>
                    </div>

                    <h2 className="clothes-header-heading">
                        Find your <span className="clothes-header-accent">style</span>
                    </h2>

                    <p className="clothes-header-subtitle">
                        Fresh fits for every mood. Discover the latest in women's, men's and everyday wear.
                    </p>

                    <p className="clothes-header-count">
                        Showing <strong className="clothes-count-highlight">{filteredAndSortedProducts.length}</strong> products
                    </p>
                </div>

                {/* MODERN CENTERED TOOLBAR */}
                <div className="clothes-toolbar-modern">
                    <div className="clothes-pills-row" role="tablist" aria-label="Category filter">
                        {CATEGORY_PILLS.map((pill) => (
                            <button
                                key={pill}
                                type="button"
                                role="tab"
                                aria-selected={activeCategory === pill}
                                className={`clothes-category-pill ${activeCategory === pill ? "is-active" : ""}`}
                                onClick={() => selectCategory(pill)}
                            >
                                {pill}
                            </button>
                        ))}
                    </div>

                    <div className="clothes-sort-wrapper">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="clothes-sort-select-pill"
                            aria-label="Sort products"
                        >
                            <option value="featured">Featured</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="newest">Newest</option>
                        </select>
                    </div>
                </div>

                {/* FULL WIDTH PRODUCTS GRID */}
                <div className="clothes-product-area-fullwidth">
                    {filteredAndSortedProducts.length > 0 ? (
                        <div className="clothes-product-grid">
                            {filteredAndSortedProducts.map((product) => (
                                <ClothesCard
                                    key={product.id}
                                    product={product}
                                    isWishlisted={isInWishlist(product.id)}
                                    onWishlist={toggleWishlist}
                                    onAddToCart={addToCart}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="clothes-empty-state">
                            <i className="fa-solid fa-shirt"></i>
                            <h3>No products found</h3>
                            <p>No products match your selected filter.</p>
                            <button
                                type="button"
                                className="clothes-clear-filters-btn"
                                onClick={resetFilters}
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>
            </main>


            {/* =================================================
                DYNAMIC FOOTER
            ================================================== */}

            <ClothesFeedback />


            {/* =================================================
                FLOATING BUTTONS
            ================================================== */}

            <div className="clothes-floating-controls">


                {/* COLOR/THEME BUTTON */}

                <button
                    type="button"
                    className="clothes-floating-theme"
                    onClick={toggleTheme}
                    title="Change webpage color"
                    aria-label="Change webpage color"
                >

                    <i
                        className={
                            theme === "dark"
                                ? "fa-solid fa-sun"
                                : "fa-solid fa-moon"
                        }
                    ></i>

                </button>


                {/* BACK TO TOP */}

                {showTopButton && (

                    <button
                        type="button"
                        className="clothes-floating-top"
                        onClick={scrollToTop}
                        title="Back to top"
                        aria-label="Back to top"
                    >

                        <i className="fa-solid fa-arrow-up"></i>

                    </button>

                )}

            </div>


            {/* =================================================
                TOAST
            ================================================== */}

            {toast && (

                <div
                    className="clothes-toast"
                    role="status"
                >

                    <i className="fa-solid fa-circle-check"></i>

                    {toast}

                </div>

            )}

        </div>

    );

}


/* =========================================================
   REACT ROOT
========================================================= */

const rootElement =
    document.getElementById(
        "clothes-root"
    );


if (rootElement) {

    createRoot(
        rootElement
    ).render(
        <ClothesMain />
    );

}


export default ClothesMain;