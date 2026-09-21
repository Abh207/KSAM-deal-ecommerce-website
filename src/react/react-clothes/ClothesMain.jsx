import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import { createRoot } from "react-dom/client";

import ClothesCard from "./ClothesCard";

import FashionCampaign from "./FashionCampaign";
import ClothesHero from "./ClothesHero";

import clothesData from "../../api/clothesproducts.json";

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


    /* =====================================================
       WISHLIST
    ====================================================== */

    const [wishlist, setWishlist] = useState(() => {

        return readLocalStorage(
            WISHLIST_KEY,
            []
        );

    });


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
       WISHLIST STORAGE
    ====================================================== */

    useEffect(() => {

        localStorage.setItem(
            WISHLIST_KEY,
            JSON.stringify(wishlist)
        );

    }, [wishlist]);


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

        setWishlist((currentWishlist) => {

            const exists =
                currentWishlist.some(
                    (item) =>
                        item.id === product.id
                );


            if (exists) {

                showToast(
                    "Removed from wishlist"
                );


                return currentWishlist.filter(
                    (item) =>
                        item.id !== product.id
                );

            }


            showToast(
                "Added to wishlist ♥"
            );


            return [
                ...currentWishlist,
                product
            ];

        });

    };


    /* =====================================================
       ADD TO CART
    ====================================================== */

    const addToCart = (product) => {

        const currentCart =
            readLocalStorage(
                CART_KEY,
                []
            );


        const existingProduct =
            currentCart.find(
                (item) =>
                    item.id === product.id
            );


        let updatedCart;


        if (existingProduct) {

            updatedCart =
                currentCart.map(
                    (item) => {

                        if (
                            item.id === product.id
                        ) {

                            return {
                                ...item,
                                quantity:
                                    Number(
                                        item.quantity || 1
                                    ) + 1
                            };

                        }

                        return item;

                    }
                );

        } else {

            updatedCart = [
                ...currentCart,

                {
                    id: product.id,

                    name: product.name,

                    category: product.category,

                    price: product.price,

                    oldPrice: product.oldPrice,

                    image: product.image,

                    quantity: 1
                }

            ];

        }


        localStorage.setItem(
            CART_KEY,
            JSON.stringify(updatedCart)
        );


        updateCartCount();


        showToast(
            `${product.name} added to cart`
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
       FILTER + SORT PRODUCTS
    ====================================================== */

    const filteredProducts = useMemo(() => {

        let result = [...products];


        /* SEARCH */

        const keyword =
            search
                .trim()
                .toLowerCase();


        if (keyword) {

            result = result.filter(
                (product) => {

                    const searchableText = [

                        product.name,

                        product.brand,

                        product.category,

                        product.gender,

                        product.color,

                        ...(product.tags || [])

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return searchableText.includes(
                        keyword
                    );

                }
            );

        }


        /* CATEGORY */

        if (activeCategory !== "All") {

            result = result.filter(
                (product) =>
                    product.category ===
                    activeCategory
            );

        }


        /* GENDER */

        if (selectedGender !== "All") {

            result = result.filter(
                (product) =>
                    product.gender ===
                    selectedGender
            );

        }


        /* PRICE */

        result = result.filter(
            (product) =>
                Number(product.price || 0) <=
                Number(maxPrice)
        );


        /* SORT */

        switch (sortBy) {

            case "newest":

                result.sort(
                    (a, b) =>
                        Number(b.newArrival) -
                        Number(a.newArrival)
                );

                break;


            case "rating":

                result.sort(
                    (a, b) =>
                        Number(b.rating || 0) -
                        Number(a.rating || 0)
                );

                break;


            case "price-low":

                result.sort(
                    (a, b) =>
                        Number(a.price || 0) -
                        Number(b.price || 0)
                );

                break;


            case "price-high":

                result.sort(
                    (a, b) =>
                        Number(b.price || 0) -
                        Number(a.price || 0)
                );

                break;


            default:

                result.sort(
                    (a, b) =>
                        Number(b.featured) -
                        Number(a.featured)
                );

        }


        return result;

    }, [
        products,
        search,
        activeCategory,
        selectedGender,
        maxPrice,
        sortBy
    ]);


    /* =====================================================
       VISIBLE PRODUCTS
    ====================================================== */

    const displayedProducts =
        filteredProducts.slice(
            0,
            visibleProducts
        );


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
       RENDER
    ====================================================== */

    return (

        <div className="clothes-page">


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
                NAVBAR
            ================================================== */}

            <header className="clothes-navbar">


                {/* LOGO */}

                <a
                    href="./index.html"
                    className="clothes-logo"
                >

                    <strong>
                        KSAM
                    </strong>

                    <span>
                        DEAL
                    </span>

                </a>


                {/* NAVIGATION */}

                <nav
                    className="clothes-nav-links"
                    aria-label="Fashion navigation"
                >

                    <a href="#new">
                        NEW IN
                    </a>

                    <a href="#women">
                        WOMEN
                    </a>

                    <a href="#men">
                        MEN
                    </a>

                    <a href="#categories">
                        ACCESSORIES
                    </a>

                    <a href="#sale">
                        SALE
                    </a>

                </nav>


                {/* SEARCH */}

                <div className="clothes-navbar-search">

                    <i className="fa-solid fa-magnifying-glass"></i>


                    <input
                        type="search"
                        placeholder="Search clothes, brands..."
                        value={search}
                        onChange={(event) => {

                            setSearch(
                                event.target.value
                            );

                            setVisibleProducts(8);

                        }}
                    />


                    {search && (

                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                            aria-label="Clear search"
                        >

                            <i className="fa-solid fa-xmark"></i>

                        </button>

                    )}

                </div>


                {/* NAV ACTIONS */}

                <div className="clothes-nav-actions">


                    {/* THEME CIRCLE */}

                    <button
                        type="button"
                        className="clothes-theme-button"
                        onClick={toggleTheme}
                        title="Change webpage color"
                        aria-label="Change webpage color"
                    >

                        <span></span>

                    </button>


                    {/* CART */}

                    <button
                        type="button"
                        className="clothes-cart-button"
                        onClick={() => {

                            window.location.href =
                                "./addToCart.html";

                        }}
                        aria-label="Open shopping cart"
                    >

                        <i className="fa-solid fa-bag-shopping"></i>


                        {cartCount > 0 && (

                            <b>
                                {cartCount}
                            </b>

                        )}

                    </button>

                </div>

            </header>


            {/* =================================================
                HERO
            ================================================== */}

            <ClothesHero
                hero={clothesData.hero}
            />


            {/* =================================================
                BENEFITS
            ================================================== */}

            <section className="clothes-benefits">


                <div>

                    <i className="fa-solid fa-truck-fast"></i>

                    <span>

                        <b>
                            FREE SHIPPING
                        </b>

                        <small>
                            On orders above ₹999
                        </small>

                    </span>

                </div>


                <div>

                    <i className="fa-solid fa-arrow-rotate-left"></i>

                    <span>

                        <b>
                            EASY RETURNS
                        </b>

                        <small>
                            Simple return experience
                        </small>

                    </span>

                </div>


                <div>

                    <i className="fa-regular fa-credit-card"></i>

                    <span>

                        <b>
                            SECURE PAYMENT
                        </b>

                        <small>
                            Safe checkout
                        </small>

                    </span>

                </div>


                <div>

                    <i className="fa-solid fa-location-dot"></i>

                    <span>

                        <b>
                            KSAM DEAL
                        </b>

                        <small>
                            Style delivered to you
                        </small>

                    </span>

                </div>


            </section>


            {/* =================================================
                CATEGORY SECTION
            ================================================== */}

            <section
                className="clothes-category-section"
                id="categories"
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


                <div className="clothes-category-scroller">

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


                <div className="clothes-products-heading">


                    <div>

                        <span>
                            SHOP THE DROP
                        </span>

                        <h2>
                            Find your style
                        </h2>

                    </div>


                    <strong>
                        {filteredProducts.length} products
                    </strong>

                </div>


                {/* TOOLBAR */}

                <div className="clothes-toolbar">


                    <div className="clothes-filter-pills">


                        <button
                            type="button"
                            className={
                                activeCategory === "All"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                selectCategory("All")
                            }
                        >
                            All
                        </button>


                        {categories
                            .slice(0, 6)
                            .map((category) => {

                                const name =
                                    category.name ||
                                    category;


                                return (

                                    <button
                                        type="button"
                                        key={name}
                                        className={
                                            activeCategory === name
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            selectCategory(name)
                                        }
                                    >

                                        {name}

                                    </button>

                                );

                            })}

                    </div>


                    <div className="clothes-toolbar-actions">


                        <button
                            type="button"
                            className="clothes-mobile-filter-button"
                            onClick={() =>
                                setMobileFilters(
                                    (value) => !value
                                )
                            }
                        >

                            <i className="fa-solid fa-sliders"></i>

                            Filters

                        </button>


                        <select
                            value={sortBy}
                            onChange={(event) => {

                                setSortBy(
                                    event.target.value
                                );

                                setVisibleProducts(8);

                            }}
                            className="clothes-sort"
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

                        </select>

                    </div>

                </div>


                {/* SHOP LAYOUT */}

                <div
                    className={
                        `clothes-shop-layout ${
                            mobileFilters
                                ? "filters-open"
                                : ""
                        }`
                    }
                >


                    {/* SIDEBAR */}

                    <aside className="clothes-sidebar">


                        <div className="clothes-sidebar-title">

                            <h3>
                                Filters
                            </h3>

                            <button
                                type="button"
                                onClick={resetFilters}
                            >
                                Reset
                            </button>

                        </div>


                        {/* GENDER */}

                        <div className="clothes-filter-box">

                            <h4>
                                Gender
                            </h4>


                            {[
                                "All",
                                "Women",
                                "Men",
                                "Unisex"
                            ].map((gender) => (

                                <label
                                    className="clothes-radio"
                                    key={gender}
                                >

                                    <input
                                        type="radio"
                                        name="gender"
                                        checked={
                                            selectedGender ===
                                            gender
                                        }
                                        onChange={() =>
                                            setSelectedGender(
                                                gender
                                            )
                                        }
                                    />

                                    <span>
                                        {gender}
                                    </span>

                                </label>

                            ))}

                        </div>


                        {/* PRICE */}

                        <div className="clothes-filter-box">

                            <h4>
                                Maximum price
                            </h4>


                            <div className="clothes-price-value">

                                <span>
                                    ₹0
                                </span>

                                <b>
                                    ₹
                                    {Number(
                                        maxPrice
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </b>

                            </div>


                            <input
                                type="range"
                                min="500"
                                max={
                                    Number(
                                        store.maxPrice ||
                                        5000
                                    )
                                }
                                step="100"
                                value={maxPrice}
                                onChange={(event) =>
                                    setMaxPrice(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        {/* COLORS */}

                        <div className="clothes-filter-box">

                            <h4>
                                Quick colors
                            </h4>


                            <div className="clothes-color-options">

                                {[
                                    "Black",
                                    "White",
                                    "Green",
                                    "Blue",
                                    "Brown",
                                    "Beige"
                                ].map((color) => (

                                    <button
                                        type="button"
                                        key={color}
                                        className={
                                            `clothes-color-dot clothes-color-${color.toLowerCase()}`
                                        }
                                        title={color}
                                        onClick={() => {

                                            setSearch(
                                                color
                                            );

                                            setVisibleProducts(
                                                8
                                            );

                                        }}
                                    />

                                ))}

                            </div>

                        </div>


                        {/* OFFER */}

                        <div className="clothes-filter-offer">

                            <span>
                                KSAM DEAL
                            </span>

                            <strong>
                                STYLE
                                <br />
                                WITHOUT
                                <br />
                                LIMITS.
                            </strong>

                            <small>
                                Fresh drops. Better prices.
                            </small>

                        </div>

                    </aside>


                    {/* PRODUCT AREA */}

                    <section className="clothes-product-area">


                        {displayedProducts.length ? (

                            <>

                                <div className="clothes-product-grid">

                                    {displayedProducts.map(
                                        (product) => (

                                            <ClothesCard
                                                key={product.id}
                                                product={product}
                                                isWishlisted={
                                                    wishlist.some(
                                                        (item) =>
                                                            item.id ===
                                                            product.id
                                                    )
                                                }
                                                onWishlist={
                                                    toggleWishlist
                                                }
                                                onViewProduct={
                                                    setSelectedProduct
                                                }
                                                onAddToCart={
                                                    addToCart
                                                }
                                            />

                                        )
                                    )}

                                </div>


                                {displayedProducts.length <
                                    filteredProducts.length && (

                                    <button
                                        type="button"
                                        className="clothes-load-more"
                                        onClick={() =>
                                            setVisibleProducts(
                                                (value) =>
                                                    value + 8
                                            )
                                        }
                                    >

                                        Load more

                                        <i className="fa-solid fa-arrow-down"></i>

                                    </button>

                                )}

                            </>

                        ) : (

                            <div className="clothes-empty-state">

                                <i className="fa-solid fa-shirt"></i>

                                <h3>
                                    No styles found
                                </h3>

                                <p>
                                    Try another search or reset
                                    your filters.
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        resetFilters
                                    }
                                >
                                    Reset filters
                                </button>

                            </div>

                        )}

                    </section>

                </div>

            </main>


            {/* =================================================
                QUICK VIEW MODAL
            ================================================== */}

            {selectedProduct && (

                <div
                    className="clothes-modal-backdrop"
                    onClick={() =>
                        setSelectedProduct(null)
                    }
                >

                    <div
                        className="clothes-product-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        <button
                            type="button"
                            className="clothes-modal-close"
                            onClick={() =>
                                setSelectedProduct(null)
                            }
                            aria-label="Close product details"
                        >

                            <i className="fa-solid fa-xmark"></i>

                        </button>


                        <div className="clothes-modal-image">

                            {selectedProduct.image && (

                                <img
                                    src={getImagePath(
                                        selectedProduct.image
                                    )}
                                    alt={
                                        selectedProduct.name
                                    }
                                    onError={(event) => {

                                        event.currentTarget.style.display =
                                            "none";

                                        event.currentTarget.parentElement.classList.add(
                                            "image-missing"
                                        );

                                    }}
                                />

                            )}

                            <div className="clothes-product-fallback">

                                <span>
                                    {
                                        selectedProduct.category
                                    }
                                </span>

                                <strong>
                                    KSAM
                                </strong>

                                <small>
                                    DEAL
                                </small>

                            </div>

                        </div>


                        <div className="clothes-modal-content">

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


                            <div className="clothes-modal-rating">

                                ★{" "}
                                {Number(
                                    selectedProduct.rating ||
                                    0
                                ).toFixed(1)}

                                <small>
                                    (
                                    {
                                        selectedProduct.reviews ||
                                        0
                                    }{" "}
                                    reviews)
                                </small>

                            </div>


                            <div className="clothes-modal-price">

                                ₹
                                {Number(
                                    selectedProduct.price ||
                                    0
                                ).toLocaleString(
                                    "en-IN"
                                )}


                                {selectedProduct.oldPrice && (

                                    <del>

                                        ₹
                                        {Number(
                                            selectedProduct.oldPrice
                                        ).toLocaleString(
                                            "en-IN"
                                        )}

                                    </del>

                                )}

                            </div>


                            <p>

                                {
                                    selectedProduct.description ||
                                    "A versatile KSAM Deal fashion piece designed for everyday styling."
                                }

                            </p>


                            {selectedProduct.sizes?.length > 0 && (

                                <div className="clothes-modal-sizes">

                                    <b>
                                        Available sizes
                                    </b>


                                    <div>

                                        {selectedProduct.sizes.map(
                                            (size) => (

                                                <span
                                                    key={size}
                                                >
                                                    {size}
                                                </span>

                                            )
                                        )}

                                    </div>

                                </div>

                            )}


                            <button
                                type="button"
                                className="clothes-modal-cart"
                                onClick={() => {

                                    addToCart(
                                        selectedProduct
                                    );

                                    setSelectedProduct(
                                        null
                                    );

                                }}
                            >

                                <i className="fa-solid fa-bag-shopping"></i>

                                Add to cart

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                DYNAMIC FOOTER
            ================================================== */}

            <footer
                className="clothes-footer"
                id="sale"
            >

                <div className="clothes-footer-top">


                    {/* BRAND */}

                    <div className="clothes-footer-brand">

                        <a
                            href="#new"
                            className="clothes-footer-logo"
                        >

                            KSAM
                            <span>
                                DEAL
                            </span>

                        </a>


                        <p>
                            Modern fashion, everyday confidence.
                            Discover clothing made to move with
                            your style.
                        </p>


                        <div className="clothes-socials">

                            <a
                                href="https://github.com/Abh207"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="GitHub"
                            >
                                <i className="fa-brands fa-github"></i>
                            </a>


                            <a
                                href="https://www.linkedin.com/in/abhay-chauhan-ab4a0937b"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="LinkedIn"
                            >
                                <i className="fa-brands fa-linkedin-in"></i>
                            </a>


                            <a
                                href="#new"
                                aria-label="Instagram"
                            >
                                <i className="fa-brands fa-instagram"></i>
                            </a>


                            <a
                                href="#new"
                                aria-label="Facebook"
                            >
                                <i className="fa-brands fa-facebook-f"></i>
                            </a>

                        </div>

                    </div>


                    {/* SHOP */}

                    <div>

                        <h3>
                            Shop
                        </h3>

                        <a href="#new">
                            New In
                        </a>

                        <a href="#women">
                            Women
                        </a>

                        <a href="#men">
                            Men
                        </a>

                        <a href="#categories">
                            Accessories
                        </a>

                        <a href="#trending">
                            Trending
                        </a>

                    </div>


                    {/* HELP */}

                    <div>

                        <h3>
                            Help
                        </h3>

                        <a href="#new">
                            Shipping
                        </a>

                        <a href="#new">
                            Returns
                        </a>

                        <a href="#new">
                            Size Guide
                        </a>

                        <a href="#new">
                            Payment
                        </a>

                        <a href="#new">
                            Contact
                        </a>

                    </div>


                    {/* NEWSLETTER */}

                    <div className="clothes-footer-newsletter">

                        <span>
                            STAY IN THE LOOP
                        </span>

                        <h3>
                            Get fresh drops
                            in your inbox.
                        </h3>


                        <form
                            onSubmit={(event) => {

                                event.preventDefault();

                                showToast(
                                    "Thanks! You're on the KSAM Deal list."
                                );

                                event.currentTarget.reset();

                            }}
                        >

                            <input
                                type="email"
                                placeholder="Your email address"
                                aria-label="Email address"
                                required
                            />


                            <button
                                type="submit"
                                aria-label="Subscribe"
                            >

                                <i className="fa-solid fa-arrow-right"></i>

                            </button>

                        </form>


                        <small>
                            New drops, offers and style updates.
                            No spam.
                        </small>

                    </div>

                </div>


                {/* FOOTER BOTTOM */}

                <div className="clothes-footer-bottom">

                    <span>
                        © {new Date().getFullYear()}
                        {" "}
                        KSAM Deal. All rights reserved.
                    </span>

                    <span>
                        Designed for modern shopping.
                    </span>

                </div>

            </footer>


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