import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import { createRoot } from "react-dom/client";

import ShoeCard from "./ShoeCard";

import shoesData from "../api/shoes-products.json";

import "./shoes.css";


/* =========================================================
   STORAGE
========================================================= */

const CART_KEY = "cartProductLS";

const WISHLIST_KEY = "shoesWishlist";


/* =========================================================
   IMAGE HELPER
========================================================= */

const getImagePath = (image) => {

    if (!image) {
        return `${import.meta.env.BASE_URL}products/shoes/shoe1.png`;
    }

    return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, "")}`;
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

function ShoesMain() {


    /* =====================================================
       STATE
    ===================================================== */

    const [search, setSearch] =
        useState("");

    const [category, setCategory] =
        useState("All");

    const [sort, setSort] =
        useState("featured");

    const [maxPrice, setMaxPrice] =
        useState(5000);

    const [visibleProducts, setVisibleProducts] =
        useState(
            shoesData.store.defaultVisibleProducts || 8
        );

    const [wishlist, setWishlist] =
        useState(() => {

            try {

                return JSON.parse(
                    localStorage.getItem(
                        WISHLIST_KEY
                    )
                ) || [];

            } catch {

                return [];

            }

        });


    const [quickProduct, setQuickProduct] =
        useState(null);


    const [mobileFilters, setMobileFilters] =
        useState(false);


    const [toast, setToast] =
        useState("");


    const [cartCount, setCartCount] =
        useState(0);


    /* =====================================================
       AUTOMATIC HERO
    ===================================================== */

    const featuredProducts =
        useMemo(() => {

            const featured =
                shoesData.products.filter(
                    (product) =>
                        product.featured
                );

            return featured.length
                ? featured
                : shoesData.products;

        }, []);


    const [heroIndex, setHeroIndex] =
        useState(0);


    const heroProduct =
        featuredProducts[
            heroIndex % featuredProducts.length
        ] || shoesData.products[0];


    /* =====================================================
       AUTOMATIC FEATURED PRODUCT STRIP
    ===================================================== */

    const [featuredOffset, setFeaturedOffset] =
        useState(0);


    const rotatingFeatured =
        useMemo(() => {

            const products =
                featuredProducts;

            if (!products.length) {
                return [];
            }

            const result = [];

            for (
                let i = 0;
                i < Math.min(4, products.length);
                i++
            ) {

                result.push(
                    products[
                        (featuredOffset + i) %
                        products.length
                    ]
                );

            }

            return result;

        }, [
            featuredProducts,
            featuredOffset
        ]);


    /* =====================================================
       HERO AUTO ROTATION
    ===================================================== */

    useEffect(() => {

        if (featuredProducts.length <= 1) {
            return;
        }

        const timer =
            setInterval(() => {

                setHeroIndex(
                    (current) =>
                        (current + 1) %
                        featuredProducts.length
                );

            }, 4500);


        return () =>
            clearInterval(timer);

    }, [featuredProducts]);


    /* =====================================================
       FEATURED PRODUCTS AUTO ROTATION
    ===================================================== */

    useEffect(() => {

        if (featuredProducts.length <= 1) {
            return;
        }

        const timer =
            setInterval(() => {

                setFeaturedOffset(
                    (current) =>
                        (current + 1) %
                        featuredProducts.length
                );

            }, 3500);


        return () =>
            clearInterval(timer);

    }, [featuredProducts]);


    /* =====================================================
       CART COUNT
    ===================================================== */

    const updateCartCount = () => {

        try {

            const cart =
                JSON.parse(
                    localStorage.getItem(
                        CART_KEY
                    )
                ) || [];


            const count =
                cart.reduce(
                    (total, item) =>
                        total +
                        Number(
                            item.quantity || 1
                        ),
                    0
                );


            setCartCount(count);

        } catch {

            setCartCount(0);

        }

    };


    useEffect(() => {

        updateCartCount();

        const handleStorage =
            () => updateCartCount();

        window.addEventListener(
            "storage",
            handleStorage
        );

        const interval =
            setInterval(
                updateCartCount,
                1000
            );

        return () => {

            window.removeEventListener(
                "storage",
                handleStorage
            );

            clearInterval(interval);

        };

    }, []);


    /* =====================================================
       WISHLIST STORAGE
    ===================================================== */

    useEffect(() => {

        localStorage.setItem(
            WISHLIST_KEY,
            JSON.stringify(wishlist)
        );

    }, [wishlist]);


    /* =====================================================
       TOAST
    ===================================================== */

    const showToast = (message) => {

        setToast(message);

        setTimeout(() => {

            setToast("");

        }, 2200);

    };


    /* =====================================================
       FILTER + SEARCH + SORT
    ===================================================== */

    const filteredProducts =
        useMemo(() => {

            let products =
                [...shoesData.products];


            /* SEARCH */

            if (search.trim()) {

                const query =
                    search
                        .toLowerCase()
                        .trim();


                products =
                    products.filter(
                        (product) => {

                            return (

                                product.name
                                    .toLowerCase()
                                    .includes(query)

                                ||

                                product.brand
                                    .toLowerCase()
                                    .includes(query)

                                ||

                                product.category
                                    .toLowerCase()
                                    .includes(query)

                                ||

                                product.color
                                    .toLowerCase()
                                    .includes(query)

                            );

                        }
                    );

            }


            /* CATEGORY */

            if (category !== "All") {

                products =
                    products.filter(
                        (product) =>
                            product.category ===
                            category
                    );

            }


            /* PRICE */

            products =
                products.filter(
                    (product) =>
                        Number(product.price) <=
                        Number(maxPrice)
                );


            /* SORT */

            switch (sort) {

                case "price-low":

                    products.sort(
                        (a, b) =>
                            a.price - b.price
                    );

                    break;


                case "price-high":

                    products.sort(
                        (a, b) =>
                            b.price - a.price
                    );

                    break;


                case "rating":

                    products.sort(
                        (a, b) =>
                            b.rating - a.rating
                    );

                    break;


                case "newest":

                    products.sort(
                        (a, b) =>
                            Number(b.newArrival) -
                            Number(a.newArrival)
                    );

                    break;


                case "discount":

                    products.sort(
                        (a, b) =>
                            b.discount -
                            a.discount
                    );

                    break;


                default:

                    products.sort(
                        (a, b) =>
                            Number(b.featured) -
                            Number(a.featured)
                    );

                    break;

            }


            return products;

        }, [
            search,
            category,
            maxPrice,
            sort
        ]);


    const productsToShow =
        filteredProducts.slice(
            0,
            visibleProducts
        );


    /* =====================================================
       CATEGORY
    ===================================================== */

    const handleCategoryChange =
        (newCategory) => {

            setCategory(
                newCategory
            );

            setVisibleProducts(8);

            document
                .getElementById(
                    "shoe-products"
                )
                ?.scrollIntoView({
                    behavior: "smooth"
                });

        };


    /* =====================================================
       SEARCH
    ===================================================== */

    const handleSearch =
        (event) => {

            setSearch(
                event.target.value
            );

            setVisibleProducts(8);

        };


    /* =====================================================
       WISHLIST
    ===================================================== */

    const handleWishlist =
        (product) => {

            setWishlist((current) => {

                if (
                    current.includes(
                        product.id
                    )
                ) {

                    showToast(
                        "Removed from wishlist"
                    );


                    return current.filter(
                        (id) =>
                            id !== product.id
                    );

                }


                showToast(
                    "Added to wishlist ❤️"
                );


                return [
                    ...current,
                    product.id
                ];

            });

        };


    /* =====================================================
       ADD TO CART
    ===================================================== */

    const handleAddToCart =
        (product) => {

            try {

                const existingCart =
                    JSON.parse(
                        localStorage.getItem(
                            CART_KEY
                        )
                    ) || [];


                const existingIndex =
                    existingCart.findIndex(
                        (item) =>
                            item.id ===
                            product.id
                    );


                if (
                    existingIndex !== -1
                ) {

                    existingCart[
                        existingIndex
                    ].quantity =
                        Number(
                            existingCart[
                                existingIndex
                            ].quantity || 1
                        ) + 1;

                } else {

                    existingCart.push({

                        id:
                            product.id,

                        name:
                            product.name,

                        category:
                            product.category,

                        price:
                            product.price,

                        image:
                            product.image,

                        quantity: 1

                    });

                }


                localStorage.setItem(
                    CART_KEY,
                    JSON.stringify(
                        existingCart
                    )
                );


                updateCartCount();


                showToast(
                    `${product.name} added to cart 🛒`
                );

            } catch (error) {

                console.error(
                    "Unable to add product:",
                    error
                );

            }

        };


    /* =====================================================
       QUICK VIEW
    ===================================================== */

    const openQuickView =
        (product) => {

            setQuickProduct(
                product
            );

        };


    const closeQuickView =
        () => {

            setQuickProduct(
                null
            );

        };


    /* =====================================================
       VIEW PRODUCT
    ===================================================== */

    const viewProduct =
        (product) => {

            setQuickProduct(
                product
            );

        };


    /* =====================================================
       LOAD MORE
    ===================================================== */

    const loadMore =
        () => {

            setVisibleProducts(
                (current) =>
                    current + 4
            );

        };


    /* =====================================================
       RESET
    ===================================================== */

    const resetFilters =
        () => {

            setSearch("");

            setCategory("All");

            setSort("featured");

            setMaxPrice(5000);

            setVisibleProducts(8);

        };


    /* =====================================================
       CATEGORY ICON
    ===================================================== */

    const getCategoryIcon =
        (item) => {

            const icons = {

                All: "✨",

                Sneakers: "👟",

                Running: "🏃",

                Sports: "⚡",

                Casual: "🧢",

                Formal: "👞",

                Walking: "🚶",

                Boots: "🥾"

            };

            return icons[item] || "👟";

        };


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="shoes-page">


            {/* =================================================
               ANNOUNCEMENT
            ================================================= */}

            <div className="shoes-announcement">

                <div>

                    <i className="fa-solid fa-bolt"></i>

                    New arrivals are here

                </div>


                <span>

                    Free delivery above ₹999

                </span>


                <div>

                    <i className="fa-solid fa-shield-halved"></i>

                    Secure shopping

                </div>

            </div>



            {/* =================================================
               NAVBAR
            ================================================= */}

            <header className="shoes-navbar">

                <a
                    href="./index.html"
                    className="shoes-logo"
                >

                    <img
                        src="./public/ksam-deal logo.png"
                        alt="KSAM Deal"
                    />

                </a>


                <nav>

                    <a href="./index.html">
                        Home
                    </a>

                    <a href="./Product.html">
                        Products
                    </a>

                    <a className="active">
                        Shoes
                    </a>

                    <a href="./contact.html">
                        Contact
                    </a>

                </nav>


                <button
                    type="button"
                    className="shoes-cart-button"
                    onClick={() =>
                        window.location.href =
                            "./addToCart.html"
                    }
                >

                    <i className="fa-solid fa-cart-shopping"></i>

                    <span>
                        Cart
                    </span>

                    <b>
                        {cartCount}
                    </b>

                </button>

            </header>



            {/* =================================================
               AUTOMATIC HERO
            ================================================= */}

            <section className="shoes-hero dynamic-shoes-hero">

                <div className="hero-orb hero-orb-one"></div>

                <div className="hero-orb hero-orb-two"></div>


                <div className="shoes-hero-content">

                    <div className="hero-kicker">

                        <i className="fa-solid fa-fire"></i>

                        STEP INTO SOMETHING NEW

                    </div>


                    <h1>

                        Find your

                        <span>
                            perfect pair.
                        </span>

                    </h1>


                    <p>

                        Discover sneakers, running shoes,
                        sports footwear, casual styles and
                        premium boots designed for every step.

                    </p>


                    <div className="hero-actions">

                        <button
                            type="button"
                            onClick={() =>
                                document
                                    .getElementById(
                                        "shoe-products"
                                    )
                                    ?.scrollIntoView({
                                        behavior: "smooth"
                                    })
                            }
                        >

                            Explore Shoes

                            <i className="fa-solid fa-arrow-down"></i>

                        </button>


                        <span>

                            <i className="fa-solid fa-circle-check"></i>

                            Easy returns

                        </span>

                    </div>


                    <div className="hero-mini-stats">

                        <div>

                            <strong>
                                {shoesData.products.length}+
                            </strong>

                            <span>
                                Styles
                            </span>

                        </div>


                        <div>

                            <strong>
                                {heroProduct.rating}★
                            </strong>

                            <span>
                                Top rating
                            </span>

                        </div>


                        <div>

                            <strong>
                                ₹999
                            </strong>

                            <span>
                                Free delivery
                            </span>

                        </div>

                    </div>

                </div>



                {/* =================================================
                   DYNAMIC HERO PRODUCT
                ================================================= */}

                <div className="shoes-hero-visual">

                    <div className="hero-circle"></div>


                    <div
                        className="hero-product-card"
                        key={heroProduct.id}
                    >

                        <span className="hero-product-tag">

                            KSAM PICK

                        </span>


                        <img
                            src={getImagePath(
                                heroProduct.image
                            )}
                            alt={heroProduct.name}
                        />


                        <div className="hero-product-info">

                            <span>
                                {heroProduct.category}
                            </span>

                            <strong>
                                {heroProduct.name}
                            </strong>


                            <div>

                                <b>
                                    ₹
                                    {Number(
                                        heroProduct.price
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </b>


                                {heroProduct.oldPrice && (

                                    <del>
                                        ₹
                                        {Number(
                                            heroProduct.oldPrice
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </del>

                                )}

                            </div>

                        </div>

                    </div>


                    <div className="hero-floating floating-one">

                        <i className="fa-solid fa-truck-fast"></i>

                        Fast Delivery

                    </div>


                    <div className="hero-floating floating-two">

                        <i className="fa-solid fa-star"></i>

                        {heroProduct.rating} Rated

                    </div>

                </div>

            </section>



            {/* =================================================
               AUTO FEATURED PRODUCT STRIP
            ================================================= */}

            <section className="shoe-featured-section">

                <div className="shoe-section-heading">

                    <div>

                        <span>
                            KSAM PICKS
                        </span>

                        <h2>
                            Trending right now
                        </h2>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            document
                                .getElementById(
                                    "shoe-products"
                                )
                                ?.scrollIntoView({
                                    behavior: "smooth"
                                })
                        }
                    >

                        View all

                        <i className="fa-solid fa-arrow-right"></i>

                    </button>

                </div>


                <div className="featured-shoe-strip">

                    {rotatingFeatured.map(
                        (product) => (

                            <article
                                className="featured-shoe-card"
                                key={product.id}
                            >

                                <button
                                    type="button"
                                    className="featured-heart"
                                    onClick={() =>
                                        handleWishlist(
                                            product
                                        )
                                    }
                                >

                                    <i
                                        className={
                                            wishlist.includes(
                                                product.id
                                            )
                                                ? "fa-solid fa-heart"
                                                : "fa-regular fa-heart"
                                        }
                                    ></i>

                                </button>


                                <div className="featured-shoe-image">

                                    <img
                                        src={getImagePath(
                                            product.image
                                        )}
                                        alt={
                                            product.name
                                        }
                                    />

                                </div>


                                <div className="featured-shoe-info">

                                    <span>
                                        {product.category}
                                    </span>

                                    <h3>
                                        {product.name}
                                    </h3>


                                    <div className="featured-rating">

                                        <strong>
                                            ★ {product.rating}
                                        </strong>

                                        <small>
                                            ({product.reviews})
                                        </small>

                                    </div>


                                    <div className="featured-price">

                                        ₹
                                        {Number(
                                            product.price
                                        ).toLocaleString(
                                            "en-IN"
                                        )}

                                        {product.oldPrice && (

                                            <del>
                                                ₹
                                                {Number(
                                                    product.oldPrice
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </del>

                                        )}

                                    </div>


                                    <button
                                        type="button"
                                        className="featured-view-button"
                                        onClick={() =>
                                            viewProduct(
                                                product
                                            )
                                        }
                                    >

                                        View Product

                                        <i className="fa-solid fa-arrow-right"></i>

                                    </button>

                                </div>

                            </article>

                        )
                    )}

                </div>

            </section>



            {/* =================================================
               CATEGORY SECTION
            ================================================= */}

            <section
    id="shoe-category-section"
    className="shoe-category-section"
>

                <div className="shoe-section-heading">

                    <div>

                        <span>
                            SHOP YOUR STYLE
                        </span>

                        <h2>
                            Explore by category
                        </h2>

                    </div>


                    <p>
                        Find the right pair for every occasion.
                    </p>

                </div>


                <div className="shoe-category-list">

                    {shoesData.categories.map(
                        (item) => (

                            <button
                                type="button"
                                key={item}
                                className={
                                    category === item
                                        ? "shoe-category active"
                                        : "shoe-category"
                                }
                                onClick={() =>
                                    handleCategoryChange(
                                        item
                                    )
                                }
                            >

                                <span>
                                    {getCategoryIcon(item)}
                                </span>

                                {item}

                                <small>
                                    {item === "All"
                                        ? shoesData.products.length
                                        : shoesData.products.filter(
                                            (product) =>
                                                product.category ===
                                                item
                                        ).length}
                                    {" "}styles
                                </small>

                            </button>

                        )
                    )}

                </div>

            </section>



            {/* =================================================
               PRODUCTS
            ================================================= */}

            <section
                className="shoe-products-section"
                id="shoe-products"
            >

                <div className="products-toolbar">

                    <div>

                        <span className="toolbar-kicker">
                            KSAM COLLECTION
                        </span>

                        <h2>
                            Shoes made for every step
                        </h2>

                        <p>

                            Showing{" "}

                            <strong>
                                {filteredProducts.length}
                            </strong>

                            {" "}products

                        </p>

                    </div>


                    <div className="toolbar-actions">


                        {/* SEARCH */}

                        <div className="shoe-search">

                            <i className="fa-solid fa-magnifying-glass"></i>


                            <input
                                type="search"
                                placeholder="Search shoes..."
                                value={search}
                                onChange={handleSearch}
                            />


                            {search && (

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                >

                                    <i className="fa-solid fa-xmark"></i>

                                </button>

                            )}

                        </div>



                        {/* SORT */}

                        <select
                            className="shoe-sort"
                            value={sort}
                            onChange={(event) =>
                                setSort(
                                    event.target.value
                                )
                            }
                        >

                            <option value="featured">
                                Featured
                            </option>

                            <option value="newest">
                                New Arrivals
                            </option>

                            <option value="rating">
                                Top Rated
                            </option>

                            <option value="price-low">
                                Price: Low to High
                            </option>

                            <option value="price-high">
                                Price: High to Low
                            </option>

                            <option value="discount">
                                Biggest Discount
                            </option>

                        </select>


                        <button
                            type="button"
                            className="mobile-filter-button"
                            onClick={() =>
                                setMobileFilters(
                                    !mobileFilters
                                )
                            }
                        >

                            <i className="fa-solid fa-sliders"></i>

                            Filters

                        </button>

                    </div>

                </div>



                <div className="products-layout">


                    {/* FILTER SIDEBAR */}

                    <aside
                        className={
                            mobileFilters
                                ? "shoe-filter-sidebar mobile-open"
                                : "shoe-filter-sidebar"
                        }
                    >

                        <div className="filter-title">

                            <div>

                                <span>
                                    REFINE
                                </span>

                                <h3>
                                    Filters
                                </h3>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    resetFilters
                                }
                            >
                                Reset
                            </button>

                        </div>



                        {/* CATEGORY */}

                        <div className="filter-group">

                            <h4>
                                Category
                            </h4>


                            {shoesData.categories.map(
                                (item) => (

                                    <button
                                        type="button"
                                        key={item}
                                        className={
                                            category === item
                                                ? "filter-option active"
                                                : "filter-option"
                                        }
                                        onClick={() =>
                                            handleCategoryChange(
                                                item
                                            )
                                        }
                                    >

                                        <span>
                                            {item}
                                        </span>


                                        {category === item && (

                                            <i className="fa-solid fa-check"></i>

                                        )}

                                    </button>

                                )
                            )}

                        </div>



                        {/* PRICE */}

                        <div className="filter-group">

                            <div className="filter-price-heading">

                                <h4>
                                    Maximum Price
                                </h4>

                                <strong>
                                    ₹{maxPrice}
                                </strong>

                            </div>


                            <input
                                type="range"
                                min="500"
                                max="5000"
                                step="100"
                                value={maxPrice}
                                onChange={(event) => {

                                    setMaxPrice(
                                        Number(
                                            event.target.value
                                        )
                                    );

                                    setVisibleProducts(
                                        8
                                    );

                                }}
                                className="price-range"
                            />


                            <div className="price-range-labels">

                                <span>
                                    ₹500
                                </span>

                                <span>
                                    ₹5000
                                </span>

                            </div>

                        </div>



                        {/* BENEFITS */}

                        <div className="filter-benefits">

                            <div>

                                <i className="fa-solid fa-truck-fast"></i>

                                <span>
                                    Free delivery above ₹999
                                </span>

                            </div>


                            <div>

                                <i className="fa-solid fa-rotate-left"></i>

                                <span>
                                    Easy returns
                                </span>

                            </div>


                            <div>

                                <i className="fa-solid fa-shield-halved"></i>

                                <span>
                                    Secure checkout
                                </span>

                            </div>

                        </div>

                    </aside>



                    {/* PRODUCT AREA */}

                    <div className="shoe-product-area">

                        {productsToShow.length > 0 ? (

                            <div className="shoe-grid">

                                {productsToShow.map(
                                    (product) => (

                                        <ShoeCard
                                            key={
                                                product.id
                                            }

                                            product={
                                                product
                                            }

                                            isWishlisted={
                                                wishlist.includes(
                                                    product.id
                                                )
                                            }

                                            onWishlist={
                                                handleWishlist
                                            }

                                            onAddToCart={
                                                handleAddToCart
                                            }

                                            onQuickView={
                                                viewProduct
                                            }

                                        />

                                    )
                                )}

                            </div>

                        ) : (

                            <div className="shoe-no-results">

                                <div>

                                    <i className="fa-solid fa-shoe-prints"></i>

                                </div>

                                <h3>
                                    No shoes found
                                </h3>

                                <p>
                                    Try changing your
                                    search or filters.
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        resetFilters
                                    }
                                >
                                    Clear Filters
                                </button>

                            </div>

                        )}



                        {/* LOAD MORE */}

                        {visibleProducts <
                            filteredProducts.length && (

                            <div className="load-more-wrapper">

                                <button
                                    type="button"
                                    className="load-more-button"
                                    onClick={
                                        loadMore
                                    }
                                >

                                    Load More Shoes

                                    <i className="fa-solid fa-arrow-down"></i>

                                </button>

                                <span>

                                    Showing{" "}
                                    {productsToShow.length}
                                    {" "}of{" "}
                                    {filteredProducts.length}

                                </span>

                            </div>

                        )}

                    </div>

                </div>

            </section>



            {/* =================================================
               PROMOTIONAL BANNER
            ================================================= */}
            <section
    id="shoe-deals"
    className="shoe-promo"
>

                <div className="promo-glow"></div>


                <div className="promo-content">

                    <span>
                        STEP INTO SAVINGS
                    </span>

                    <h2>

                        Your next favourite

                        <strong>
                            pair is waiting.
                        </strong>

                    </h2>

                    <p>
                        Fresh styles, everyday comfort
                        and deals made for KSAM shoppers.
                    </p>


                    <button
                        type="button"
                        onClick={() =>
                            document
                                .getElementById(
                                    "shoe-products"
                                )
                                ?.scrollIntoView({
                                    behavior: "smooth"
                                })
                        }
                    >

                        Shop Collection

                        <i className="fa-solid fa-arrow-right"></i>

                    </button>

                </div>


                <div className="promo-shoe">

                    <img
                        src={getImagePath(
                            heroProduct.image
                        )}
                        alt={heroProduct.name}
                    />

                </div>

            </section>



            {/* =================================================
               FOOTER
            ================================================= */}

            <footer className="shoes-footer">

                <div className="shoes-footer-inner">


                    <div className="footer-brand">

                        <img
                            src="./public/ksam-deal logo.png"
                            alt="KSAM Deal"
                        />

                        <p>

                            Everyday products.
                            Better shopping.
                            Your KSAM Deal.

                        </p>

                    </div>


                    <div>

                        <h4>
                            SHOP
                        </h4>

                        <a href="#shoe-products">
                            Sneakers
                        </a>

                        <a href="#shoe-products">
                            Running
                        </a>

                        <a href="#shoe-products">
                            Sports
                        </a>

                        <a href="#shoe-products">
                            Formal
                        </a>

                    </div>


                    <div>

                        <h4>
                            KSAM DEAL
                        </h4>

                        <a href="./index.html">
                            Home
                        </a>

                        <a href="./Product.html">
                            Products
                        </a>

                        <a href="./contact.html">
                            Contact
                        </a>

                        <a href="./addToCart.html">
                            Cart
                        </a>

                    </div>


                    <div>

                        <h4>
                            WHY KSAM?
                        </h4>

                        <p>
                            Secure shopping
                        </p>

                        <p>
                            Fast delivery
                        </p>

                        <p>
                            Easy returns
                        </p>

                        <p>
                            Great deals
                        </p>

                    </div>

                </div>


                <div className="footer-bottom">

                    <span>

                        © {new Date().getFullYear()}
                        {" "}KSAM Deal

                    </span>

                    <span>

                        Designed & developed by Abhay Chauhan

                    </span>

                </div>

            </footer>



            {/* =================================================
               QUICK VIEW / VIEW PRODUCT
            ================================================= */}

            {quickProduct && (

                <div
                    className="quick-view-overlay"
                    onClick={
                        closeQuickView
                    }
                >

                    <div
                        className="quick-view-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        <button
                            type="button"
                            className="quick-close"
                            onClick={
                                closeQuickView
                            }
                        >

                            <i className="fa-solid fa-xmark"></i>

                        </button>


                        <div className="quick-view-image">

                            <img
                                src={getImagePath(
                                    quickProduct.image
                                )}
                                alt={
                                    quickProduct.name
                                }
                            />

                        </div>


                        <div className="quick-view-content">

                            <span className="quick-category">

                                {quickProduct.category}

                            </span>


                            <h2>
                                {quickProduct.name}
                            </h2>


                            <div className="quick-rating">

                                <span>
                                    ★
                                </span>

                                {quickProduct.rating}

                                <small>
                                    ({quickProduct.reviews} reviews)
                                </small>

                            </div>


                            <div className="quick-price">

                                ₹
                                {Number(
                                    quickProduct.price
                                ).toLocaleString(
                                    "en-IN"
                                )}


                                {quickProduct.oldPrice && (

                                    <del>

                                        ₹
                                        {Number(
                                            quickProduct.oldPrice
                                        ).toLocaleString(
                                            "en-IN"
                                        )}

                                    </del>

                                )}

                            </div>


                            <p>
                                {quickProduct.description}
                            </p>


                            <div className="quick-features">

                                {quickProduct.features?.map(
                                    (feature) => (

                                        <span
                                            key={
                                                feature
                                            }
                                        >

                                            <i className="fa-solid fa-check"></i>

                                            {feature}

                                        </span>

                                    )
                                )}

                            </div>


                            <div className="quick-size-title">

                                Available Sizes

                            </div>


                            <div className="quick-sizes">

                                {quickProduct.sizes?.map(
                                    (size) => (

                                        <span
                                            key={size}
                                        >
                                            {size}
                                        </span>

                                    )
                                )}

                            </div>


                            <div className="quick-actions">

                                <button
                                    type="button"
                                    className="quick-add-button"
                                    onClick={() => {

                                        handleAddToCart(
                                            quickProduct
                                        );

                                        closeQuickView();

                                    }}
                                >

                                    <i className="fa-solid fa-cart-plus"></i>

                                    Add to Cart

                                </button>


                                <button
                                    type="button"
                                    className="quick-buy-button"
                                    onClick={() => {

                                        handleAddToCart(
                                            quickProduct
                                        );

                                        window.location.href =
                                            "./addToCart.html";

                                    }}
                                >

                                    Buy Now

                                    <i className="fa-solid fa-arrow-right"></i>

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}



            {/* =================================================
               TOAST
            ================================================= */}

            {toast && (

                <div className="shoe-toast">

                    <i className="fa-solid fa-circle-check"></i>

                    {toast}

                </div>

            )}

        </div>

    );

}


/* =========================================================
   RENDER
========================================================= */

const rootElement =
    document.getElementById(
        "shoes-root"
    );


if (rootElement) {

    createRoot(
        rootElement
    ).render(
        <ShoesMain />
    );

}


export default ShoesMain;