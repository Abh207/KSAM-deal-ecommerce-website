import React, { useEffect, useState } from "react";
import ShopPromo from "./ShopPromo.jsx";

import ShopProductCard from "./ShopProductCard.jsx";
import shopProducts from "./shopProducts.json";


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
       SCROLL TO DEALS
    ----------------------------------------------------- */

    const scrollToDeals = () => {

        document
            .getElementById("shop-deals")
            ?.scrollIntoView({
                behavior: "smooth"
            });

    };


    /* -----------------------------------------------------
       ADD PRODUCT TO CART
    ----------------------------------------------------- */

    const addToCart = (product) => {

    try {

        const cart =
            JSON.parse(
                localStorage.getItem("cartProductLS")
            ) || [];


        const productId = Number(product.id);


        const existingProduct =
            cart.find(
                (item) =>
                    Number(item.id) === productId
            );


        if (existingProduct) {

            existingProduct.quantity =
                Number(existingProduct.quantity || 1) + 1;

        } else {

            cart.push({

                id: productId,

                name: product.name,

                category: product.category,

                price: Number(product.price),

                oldPrice: Number(
                    product.oldPrice || product.price
                ),

                rating: Number(
                    product.rating || 0
                ),

                discount: Number(
                    product.discount || 0
                ),

                accent:
                    product.accent || "#7c3aed",

                image: product.image,

                quantity: 1

            });

        }


        localStorage.setItem(
            "cartProductLS",
            JSON.stringify(cart)
        );


        setCartMessage(
            `${product.name} added to cart!`
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


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="shop-header">

                <div className="shop-logo">

                    <span>
                        KSAM
                    </span>

                    Deal

                </div>


                <nav className="shop-navigation">

                    <a href="./index.html">
                        Home
                    </a>

                    <a href="#shop-categories">
                        Categories
                    </a>

                    <a href="#shop-products">
                        Products
                    </a>

                    <a href="#shop-deals">
                        Deals
                    </a>

                    <a href="#shop-services">
                        Services
                    </a>

                </nav>


                <div className="shop-header-actions">

                    <button
                        className="shop-search-button"
                        onClick={() => {

                            document
                                .getElementById(
                                    "shop-search"
                                )
                                ?.focus();

                        }}
                        aria-label="Search products"
                    >
                        🔍
                    </button>


                    <a
                        href="./addToCart.html"
                        className="shop-cart-button"
                    >
                        🛒 Cart
                    </a>

                </div>

            </header>


            {/* =================================================
                HERO
            ================================================= */}

            <section className="shop-hero">

                <div className="shop-hero-content">

                    <span className="shop-hero-label">
                        NEW COLLECTION
                    </span>


                    <h1>

                        Technology
                        <br />

                        That Makes
                        <br />

                        <span>
                            Life Better.
                        </span>

                    </h1>


                    <p>
                        Discover the latest electronics,
                        smart devices and accessories
                        at amazing prices.
                    </p>


                    <div className="shop-hero-buttons">

                        <button
                            onClick={scrollToProducts}
                            className="shop-primary-button"
                        >
                            Shop Now →
                        </button>


                        <button
                            onClick={scrollToDeals}
                            className="shop-secondary-button"
                        >
                            View Deals
                        </button>

                    </div>

                </div>


                <div className="shop-hero-image">

                    <img
                        src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200"
                        alt="Modern electronics"
                    />

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

                    <a href="./index.html">
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