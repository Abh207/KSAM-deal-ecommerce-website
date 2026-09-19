console.log("SHOES MAIN JS IS RUNNING");


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
   STORAGE KEYS
   ========================================================= */

const CART_KEY = "cartProductLS";

const WISHLIST_KEY = "shoesWishlist";



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

            }

            catch {

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
   DYNAMIC HERO
   ===================================================== */

const [heroIndex, setHeroIndex] = useState(0);

const heroProducts = useMemo(() => {

    const featured =
        shoesData.products.filter(
            (product) => product.featured
        );

    return featured.length
        ? featured
        : shoesData.products;

}, []);


const heroProduct =
    heroProducts[
        heroIndex % heroProducts.length
    ];


/* AUTOMATIC HERO CHANGE */

useEffect(() => {

    if (heroProducts.length <= 1) {
        return;
    }

    const heroTimer = setInterval(() => {

        setHeroIndex(
            (current) =>
                (current + 1) %
                heroProducts.length
        );

    }, 4000);

    return () => {
        clearInterval(heroTimer);
    };

}, [heroProducts.length]);



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

        }

        catch {

            setCartCount(0);

        }

    };



    useEffect(() => {

        updateCartCount();

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

    const filteredProducts = useMemo(() => {

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
                        product.category === category
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
                        b.discount - a.discount
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



    /* =====================================================
       VISIBLE PRODUCTS
       ===================================================== */

    const productsToShow =
        filteredProducts.slice(
            0,
            visibleProducts
        );



    /* =====================================================
       CATEGORY CHANGE
       ===================================================== */

    const handleCategoryChange =
        (newCategory) => {

            setCategory(
                newCategory
            );

            setVisibleProducts(8);

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

                }

                else {

                    existingCart.push({

                        id: product.id,

                        name: product.name,

                        category:
                            product.category,

                        price: product.price,

                        image: product.image,

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

            }

            catch (error) {

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
       RESET FILTERS
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
       HERO
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
   MODERN DYNAMIC SHOE HERO
   ================================================= */}

<section className="ksam-shoe-hero">


    {/* BACKGROUND DECORATION */}

    <div className="ksam-hero-glow ksam-glow-one"></div>

    <div className="ksam-hero-glow ksam-glow-two"></div>

    <div className="ksam-hero-grid"></div>



    {/* TOP HERO NAV */}

    {/* <div className="ksam-hero-top">

        <div className="ksam-hero-brand">

            <span className="ksam-brand-symbol">
                K
            </span>

            <div>

                <strong>
                    KSAM
                </strong>

                <small>
                    SHOES
                </small>

            </div>

        </div>


        <div className="ksam-hero-links">

            <a href="#shoe-products">
                FOOTWEAR
            </a>

            <a href="#shoe-products">
                SHOP
            </a>

            <a href="#shoe-category-section">
                CATEGORIES
            </a>

            <a href="#shoe-deals">
                DEALS
            </a>

        </div>


        <button
            type="button"
            className="ksam-account-button"
            onClick={() => {
                window.location.href =
                    "./login.html";
            }}
        >

            <span>
                MY ACCOUNT
            </span>

            <i className="fa-regular fa-user"></i>

        </button>

    </div> */}



    {/* MAIN HERO */}

    <div className="ksam-hero-main">


        {/* LEFT SIDE */}

        <div className="ksam-hero-content">


            <div className="ksam-hero-label">

                <span className="ksam-pulse"></span>

                NEW SEASON

                <span className="ksam-label-line"></span>

                KSAM DEAL

            </div>


            <h1>

                Step into

                <span>
                    something
                </span>

                <strong>
                    better.
                </strong>

            </h1>


            <p>

                Discover sneakers, running shoes,
                sports footwear and everyday styles
                designed to move with you.

            </p>


            <div className="ksam-hero-buttons">

                <button
                    type="button"
                    className="ksam-shop-button"
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

                    Explore collection

                    <i className="fa-solid fa-arrow-right"></i>

                </button>


                <span className="ksam-return-note">

                    <i className="fa-solid fa-circle-check"></i>

                    Easy returns

                </span>

            </div>



            {/* STATS */}

            <div className="ksam-hero-stats">

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
                        4.8★
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



        {/* RIGHT SIDE PRODUCT */}

        <div className="ksam-hero-product-area">


            {/* DELIVERY FLOAT */}

            <div className="ksam-floating-info ksam-delivery">

                <i className="fa-solid fa-truck-fast"></i>

                <div>

                    <strong>
                        Fast delivery
                    </strong>

                    <span>
                        Above ₹999
                    </span>

                </div>

            </div>



            {/* RATING FLOAT */}

            <div className="ksam-floating-info ksam-rating">

                <i className="fa-solid fa-star"></i>

                <div>

                    <strong>
                        {heroProduct?.rating || 4.8}
                    </strong>

                    <span>
                        Rated
                    </span>

                </div>

            </div>



            {/* PRODUCT CARD */}

            {heroProduct && (

                <div
                    className="ksam-main-product"
                    key={heroProduct.id}
                >


                    <div className="ksam-product-top">

                        <span className="ksam-featured-label">

                            FEATURED

                        </span>


                        <span className="ksam-product-badge">

                            {heroProduct.badge ||
                                "KSAM PICK"}

                        </span>

                    </div>


                    {/* IMAGE */}

                    <div className="ksam-product-image-wrap">

                        <div className="ksam-image-circle"></div>

                        <img
                            src={`${import.meta.env.BASE_URL}${heroProduct.image.replace(/^\/+/, "")}`}
                            alt={heroProduct.name}
                            className="ksam-main-shoe-image"
                        />

                    </div>


                    {/* PRODUCT INFO */}

                    <div className="ksam-main-product-info">

                        <span>
                            {heroProduct.category}
                        </span>


                        <h2>
                            {heroProduct.name}
                        </h2>


                        <div className="ksam-product-bottom">

                            <strong>

                                ₹
                                {Number(
                                    heroProduct.price
                                ).toLocaleString("en-IN")}

                            </strong>


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

            )}



            {/* SLIDER DOTS */}

            <div className="ksam-hero-dots">

                {heroProducts.map(
                    (product, index) => (

                        <button
                            key={product.id}
                            type="button"
                            className={
                                index === heroIndex
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setHeroIndex(index)
                            }
                            aria-label={
                                `Show ${product.name}`
                            }
                        />

                    )
                )}

            </div>

        </div>

    </div>



    {/* FEATURED PRODUCT STRIP */}

    <div className="ksam-featured-strip">


        <div className="ksam-strip-heading">

            <div>

                <span>
                    TRENDING NOW
                </span>

                <h2>
                    Step up your rotation
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

                View collection

                <i className="fa-solid fa-arrow-right"></i>

            </button>

        </div>



        <div className="ksam-mini-products">

            {heroProducts
                .slice(0, 3)
                .map((product, index) => (

                    <article
                        className={
                            index ===
                            heroIndex %
                                Math.min(
                                    heroProducts.length,
                                    3
                                )
                                ? "ksam-mini-card active"
                                : "ksam-mini-card"
                        }
                        key={product.id}
                    >


                        <div className="ksam-mini-image">

                            <img
                                src={`${import.meta.env.BASE_URL}${product.image.replace(/^\/+/, "")}`}
                                alt={product.name}
                            />

                        </div>


                        <div className="ksam-mini-content">

                            <span>
                                {product.category}
                            </span>

                            <h3>
                                {product.name}
                            </h3>


                            <div>

                                <strong>
                                    ₹
                                    {Number(
                                        product.price
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>


                                <span>
                                    ★ {product.rating}
                                </span>

                            </div>

                        </div>


                        <i className="fa-solid fa-arrow-up-right-from-square ksam-mini-icon"></i>

                    </article>

                ))}

        </div>

    </div>


</section>

            {/* =================================================
               CATEGORY SECTION
               ================================================= */}

            <section className="shoe-category-section">

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

                                    {item === "All" && "✨"}

                                    {item === "Sneakers" && "👟"}

                                    {item === "Running" && "🏃"}

                                    {item === "Sports" && "⚡"}

                                    {item === "Casual" && "🧢"}

                                    {item === "Formal" && "👞"}

                                    {item === "Walking" && "🚶"}

                                    {item === "Boots" && "🥾"}

                                </span>


                                {item}

                            </button>

                        )
                    )}

                </div>

            </section>



            {/* =================================================
               PRODUCTS SECTION
               ================================================= */}

            <section
                className="shoe-products-section"
                id="shoe-products"
            >


                {/* HEADER */}

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
                            </strong>{" "}
                            products

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


                    {/* =================================================
                       FILTER SIDEBAR
                       ================================================= */}

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



                        {/* FEATURES */}

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



                    {/* =================================================
                       PRODUCT GRID
                       ================================================= */}

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
                                                openQuickView
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

            <section className="shoe-promo">

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
                        src={`${import.meta.env.BASE_URL}products/shoes/shoe5.png`}
                        alt="KSAM sports shoe"
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
               QUICK VIEW MODAL
               ================================================= */}

            {quickProduct && (

                <div
                    className="quick-view-overlay"
                    onClick={closeQuickView}
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
                                src={`${import.meta.env.BASE_URL}${quickProduct.image.replace(/^\/+/, "")}`}
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
                                {quickProduct.price.toLocaleString(
                                    "en-IN"
                                )}

                                {quickProduct.oldPrice && (

                                    <del>
                                        ₹
                                        {quickProduct.oldPrice.toLocaleString(
                                            "en-IN"
                                        )}
                                    </del>

                                )}

                            </div>


                            <p>
                                {quickProduct.description}
                            </p>


                            <div className="quick-features">

                                {quickProduct.features.map(
                                    (feature) => (

                                        <span
                                            key={feature}
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

                                {quickProduct.sizes.map(
                                    (size) => (

                                        <span
                                            key={size}
                                        >
                                            {size}
                                        </span>

                                    )
                                )}

                            </div>


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