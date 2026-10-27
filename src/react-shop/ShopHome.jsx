import React, { useEffect, useState, useRef } from "react";
import ShopPromo from "./ShopPromo.jsx";
import { requireAuth } from "../auth/auth.js";

import ShopProductCard from "./ShopProductCard.jsx";
import shopProducts from "./shopProducts.json";
import Navbar from "../deals/components/Navbar.jsx";
import { addProductToCart, normalizeCartItem, resolveImagePath } from "../lib/cartHelper.js";


/* =========================================================
   CATEGORIES
========================================================= */

const categories = [
    {
        name: "Smartphones",
        icon: "📱"
    },
    {
        name: "Laptops",
        icon: "💻"
    },
    {
        name: "Audio",
        icon: "🎧"
    },
    {
        name: "Cameras",
        icon: "📷"
    },
    {
        name: "Gaming",
        icon: "🎮"
    },
    {
        name: "Smart Home",
        icon: "🏠"
    }
];


/* =========================================================
   SHOP HOME
========================================================= */

function ShopHome() {

    /* -----------------------------------------------------
       STATES
    ----------------------------------------------------- */

    const [search, setSearch] = useState("");

    const [selectedCategory, setSelectedCategory] =
        useState("All");

    const [selectedProduct, setSelectedProduct] =
        useState(null);

    const [cartMessage, setCartMessage] =
        useState("");

    const heroVideoRef = useRef(null);
    const heroSectionRef = useRef(null);

    const ROTATING_WORDS = ["Better.", "Smarter.", "Faster.", "Easier."];
    const [wordIndex, setWordIndex] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [parallax, setParallax] = useState({ x: 0, y: 0 });

    /* -----------------------------------------------------
       ROTATING WORDS (EVERY 3 SECONDS)
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
       HERO MOUSE PARALLAX (DESKTOP ONLY: 10-15PX OPPOSITE)
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

        // Respect prefers-reduced-motion: pause video so poster is shown
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) {
            video.pause();
            return;
        }

        // Pause video when out of view, play when in view
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
       FILTER PRODUCTS
    ----------------------------------------------------- */

    const filteredProducts =
        shopProducts.filter((product) => {

            const productName =
                product.name?.toLowerCase() || "";

            const searchText =
                search.toLowerCase();

            const matchesSearch =
                productName.includes(searchText);

            const matchesCategory =
                selectedCategory === "All" ||
                product.category === selectedCategory;

            return (
                matchesSearch &&
                matchesCategory
            );

        });

    /* -----------------------------------------------------
       SCROLL TO PRODUCTS
    ----------------------------------------------------- */
    const scrollToProducts = () => {
        document
            .getElementById("shop-products")
            ?.scrollIntoView({
                behavior: "smooth"
            });
    };

    /* -----------------------------------------------------
       ADD PRODUCT TO CART
    ----------------------------------------------------- */

    const addToCart = (product) => {
        if (!requireAuth({ type: "add_to_cart", product })) {
            return;
        }
        try {
            const normalized = normalizeCartItem(product, 1);
            addProductToCart(product, 1);

            setCartMessage(
                `${normalized?.name || product.name || "Product"} added to cart!`
            );

            setTimeout(() => {
                setCartMessage("");
            }, 2500);
        } catch (error) {
            console.error(
                "Cart error:",
                error
            );
        }
    };


    /* -----------------------------------------------------
       PRODUCT SCROLL ANIMATION
    ----------------------------------------------------- */

    useEffect(() => {

        const cards =
            document.querySelectorAll(
                ".shop-product-reveal"
            );


        if (!cards.length) {
            return;
        }


        const observer =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach((entry) => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "shop-product-visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.12
                }
            );


        cards.forEach((card) => {

            observer.observe(card);

        });


        return () => {

            observer.disconnect();

        };

    }, [filteredProducts.length]);


    /* -----------------------------------------------------
       CLOSE POPUP WITH ESCAPE
    ----------------------------------------------------- */

    useEffect(() => {

        const handleEscape =
            (event) => {

                if (
                    event.key === "Escape"
                ) {

                    setSelectedProduct(null);

                }

            };


        document.addEventListener(
            "keydown",
            handleEscape
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleEscape
            );

        };

    }, []);


    /* =====================================================
       JSX
    ===================================================== */

    return (

        <div className="shop-page">


            {/* Shared Deals-style Navbar */}
            <Navbar />


            {/* =================================================
                HERO
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

            <ShopPromo />


            {/* =================================================
                FEATURES
            ================================================= */}

            <section className="shop-features">

                <div className="shop-feature">

                    <span>
                        🚚
                    </span>

                    <div>

                        <h3>
                            Free Shipping
                        </h3>

                        <p>
                            On orders over $50
                        </p>

                    </div>

                </div>


                <div className="shop-feature">

                    <span>
                        🔒
                    </span>

                    <div>

                        <h3>
                            Secure Payment
                        </h3>

                        <p>
                            100% secure checkout
                        </p>

                    </div>

                </div>


                <div className="shop-feature">

                    <span>
                        ↩️
                    </span>

                    <div>

                        <h3>
                            Easy Returns
                        </h3>

                        <p>
                            30 day return policy
                        </p>

                    </div>

                </div>


                <div className="shop-feature">

                    <span>
                        🎧
                    </span>

                    <div>

                        <h3>
                            24/7 Support
                        </h3>

                        <p>
                            We're here to help
                        </p>

                    </div>

                </div>

            </section>


            {/* =================================================
                CATEGORIES
            ================================================= */}

            <section
                id="shop-categories"
                className="shop-categories"
            >

                <div className="shop-section-heading">

                    <span>
                        EXPLORE
                    </span>

                    <h2>
                        Shop By Category
                    </h2>

                    <p>
                        Find exactly what you're looking for
                    </p>

                </div>


                <div className="shop-category-grid">

                    {categories.map(
                        (category) => (

                            <button
                                key={category.name}
                                className={
                                    `shop-category-card ${
                                        selectedCategory ===
                                        category.name
                                            ? "shop-category-active"
                                            : ""
                                    }`
                                }
                                onClick={() => {

                                    setSelectedCategory(
                                        category.name
                                    );

                                    scrollToProducts();

                                }}
                            >

                                <div className="shop-category-icon">
                                    {category.icon}
                                </div>


                                <h3>
                                    {category.name}
                                </h3>


                                <span>
                                    Explore →
                                </span>

                            </button>

                        )
                    )}

                </div>

            </section>


            {/* =================================================
                PRODUCTS
            ================================================= */}

            <section
                id="shop-products"
                className="shop-products"
            >

                <div className="shop-products-header">

                    <div className="shop-section-heading">

                        <span>
                            OUR PRODUCTS
                        </span>

                        <h2>
                            Best Sellers
                        </h2>

                        <p>
                            Discover our latest technology
                        </p>

                    </div>


                    <div className="shop-product-controls">

                        <input
                            id="shop-search"
                            type="search"
                            placeholder="Search products..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />


                        <select
                            value={selectedCategory}
                            onChange={(event) =>
                                setSelectedCategory(
                                    event.target.value
                                )
                            }
                        >

                            <option value="All">
                                All Products
                            </option>


                            {categories.map(
                                (category) => (

                                    <option
                                        key={
                                            category.name
                                        }
                                        value={
                                            category.name
                                        }
                                    >
                                        {category.name}
                                    </option>

                                )
                            )}

                        </select>

                    </div>

                </div>


                {/* PRODUCT GRID */}

                <div className="shop-product-grid">

                    {filteredProducts.map(
                        (product, index) => (

                            <div
                                key={product.id}
                                className="shop-product-reveal"
                                style={{
                                    "--animation-delay":
                                        `${index * 80}ms`
                                }}
                            >

                                <ShopProductCard
                                    product={product}
                                    onProductClick={
                                        setSelectedProduct
                                    }
                                    onAddToCart={
                                        addToCart
                                    }
                                />

                            </div>

                        )
                    )}

                </div>


                {/* NO PRODUCTS */}

                {filteredProducts.length === 0 && (

                    <div className="shop-no-products">

                        <div className="shop-no-products-icon">
                            🔎
                        </div>

                        <h3>
                            No products found
                        </h3>

                        <p>
                            Try another search or category.
                        </p>


                        <button
                            onClick={() => {

                                setSearch("");
                                setSelectedCategory("All");

                            }}
                        >
                            Show All Products
                        </button>

                    </div>

                )}

            </section>


            {/* =================================================
                DEAL BANNER
            ================================================= */}

            <section
                id="shop-deals"
                className="shop-deals"
            >

                <div>

                    <span>
                        LIMITED TIME OFFER
                    </span>

                    <h2>
                        Upgrade Your
                        <br />
                        Tech Today.
                    </h2>

                    <p>
                        Save up to 40% on selected electronics.
                    </p>

                    <button
                        onClick={scrollToProducts}
                    >
                        Shop Deals →
                    </button>

                </div>


                <div className="shop-deal-number">
                    40%
                </div>

            </section>


            {/* =================================================
                SERVICES
            ================================================= */}

            <section
                id="shop-services"
                className="shop-services"
            >

                <div className="shop-section-heading">

                    <span>
                        WHY KSAM DEAL
                    </span>

                    <h2>
                        We Make Shopping Easy
                    </h2>

                </div>


                <div className="shop-service-grid">

                    <div>

                        <span>
                            ⚡
                        </span>

                        <h3>
                            Fast Delivery
                        </h3>

                        <p>
                            Quick and reliable delivery
                            to your doorstep.
                        </p>

                    </div>


                    <div>

                        <span>
                            💰
                        </span>

                        <h3>
                            Best Prices
                        </h3>

                        <p>
                            Great products at competitive prices.
                        </p>

                    </div>


                    <div>

                        <span>
                            🛡️
                        </span>

                        <h3>
                            Trusted Quality
                        </h3>

                        <p>
                            Carefully selected products
                            you can trust.
                        </p>

                    </div>


                    <div>

                        <span>
                            💬
                        </span>

                        <h3>
                            Customer Support
                        </h3>

                        <p>
                            Friendly support whenever
                            you need us.
                        </p>

                    </div>

                </div>

            </section>


            {/* =================================================
                COMMUNITY / NEWSLETTER
            ================================================= */}

            <section className="shop-community">


                {/* TESTIMONIAL */}

                <div className="shop-testimonial">

                    <span className="shop-quote">
                        “
                    </span>

                    <span className="shop-community-label">
                        What Our Customers Say
                    </span>

                    <p>
                        KSAM Deal has the best collection
                        of gadgets. Fast delivery, great
                        prices and amazing products!
                    </p>


                    <div className="shop-customer">

                        <div className="shop-customer-avatar">
                            A
                        </div>

                        <div>

                            <strong>
                                Abhay Chauhan
                            </strong>

                            <small>
                                Verified Customer
                            </small>

                        </div>

                    </div>

                </div>


                {/* NEWSLETTER */}

                <div className="shop-newsletter-card">

                    <div className="shop-newsletter-content">

                        <span>
                            JOIN KSAM DEAL CLUB
                        </span>

                        <h2>
                            Get Exclusive Offers
                        </h2>

                        <p>
                            Get exclusive offers, new arrivals
                            and special discounts straight to
                            your inbox.
                        </p>


                        <form
                            onSubmit={(event) => {

                                event.preventDefault();

                                alert(
                                    "Thank you for joining KSAM Deal Club!"
                                );

                                event.currentTarget.reset();

                            }}
                        >

                            <input
                                type="email"
                                placeholder="Enter your email"
                                required
                            />

                            <button type="submit">
                                Subscribe
                            </button>

                        </form>

                    </div>


                    <div className="shop-envelope">

                        <div className="shop-envelope-icon">
                            ✉
                        </div>

                    </div>

                </div>


                {/* STATISTICS */}

                <div className="shop-community-stats">

                    <div className="shop-stat">

                        <span>
                            ♙
                        </span>

                        <div>

                            <strong>
                                10K+
                            </strong>

                            <small>
                                Happy Customers
                            </small>

                        </div>

                    </div>


                    <div className="shop-stat">

                        <span>
                            ♡
                        </span>

                        <div>

                            <strong>
                                500+
                            </strong>

                            <small>
                                Top Products
                            </small>

                        </div>

                    </div>


                    <div className="shop-stat">

                        <span>
                            ✓
                        </span>

                        <div>

                            <strong>
                                99%
                            </strong>

                            <small>
                                Satisfaction Rate
                            </small>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="shop-footer">

                <div>

                    <h2>
                        KSAM Deal
                    </h2>

                    <p>
                        Your destination for modern
                        electronics and smart technology.
                    </p>

                </div>


                <div>

                    <h3>
                        Quick Links
                    </h3>

                    <a href="./shop.html">
                        Home
                    </a>

                    <a href="#shop-products">
                        Products
                    </a>

                    <a href="#shop-deals">
                        Deals
                    </a>

                </div>


                <div>

                    <h3>
                        Support
                    </h3>

                    <a href="./contact.html">
                        Contact Us
                    </a>

                    <a href="./addToCart.html">
                        My Cart
                    </a>

                </div>

            </footer>


            {/* =================================================
                PRODUCT POPUP
            ================================================= */}

            {selectedProduct && (

                <div
                    className="shop-product-modal"
                    onClick={() =>
                        setSelectedProduct(null)
                    }
                >

                    <div
                        className="shop-product-modal-content"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <button
                            className="shop-modal-close"
                            onClick={() =>
                                setSelectedProduct(null)
                            }
                            aria-label="Close product"
                        >
                            ×
                        </button>


                        <div className="shop-modal-image">

                            <img
                                src={
                                    selectedProduct.image
                                }
                                alt={
                                    selectedProduct.name
                                }
                            />

                        </div>


                        <div className="shop-modal-info">

                            <span>
                                {
                                    selectedProduct.category
                                }
                            </span>


                            <h2>
                                {
                                    selectedProduct.name
                                }
                            </h2>


                            <div className="shop-modal-rating">

                                <span className="shop-stars">
                                    ★★★★★
                                </span>

                                {" "}

                                {
                                    selectedProduct.rating
                                }

                            </div>


                            <div className="shop-modal-price">

                                $
                                {
                                    selectedProduct.price
                                }


                                {
                                    selectedProduct.oldPrice && (

                                        <del>
                                            $
                                            {
                                                selectedProduct.oldPrice
                                            }
                                        </del>

                                    )
                                }

                            </div>


                            <p>
                                Discover premium quality
                                and modern technology with
                                this carefully selected
                                KSAM Deal product.
                            </p>


                            <button
                                className="shop-modal-cart"
                                onClick={() =>
                                    addToCart(
                                        selectedProduct
                                    )
                                }
                            >
                                🛒 Add To Cart
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                CART TOAST
            ================================================= */}

            {cartMessage && (

                <div className="shop-cart-toast">

                    <span>
                        ✓
                    </span>

                    {cartMessage}

                </div>

            )}

        </div>

    );

}


export default ShopHome;