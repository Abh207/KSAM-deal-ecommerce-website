import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import { createRoot } from "react-dom/client";

import AudioCard from "./AudioCard";
import AudioHero from "./AudioHero";

import audioData from "../../api/audio-products.json";

import "./audio.css";


/* =========================================================
   CONSTANTS
========================================================= */

const CART_KEY = "cartProductLS";
const WISHLIST_KEY = "audioWishlist";
const THEME_KEY = "ksamAudioTheme";


/* =========================================================
   IMAGE HELPER
========================================================= */

const getImagePath = (image) => {

    if (!image) return "";

    return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, "")}`;
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

function AudioMain() {

    /* -------------------------------------------------------
       DATA
    ------------------------------------------------------- */

    const store = audioData.store || {};

    const products = audioData.products || [];

    const categories = audioData.categories || [];

    const features = audioData.featureHighlights || [];

    const offers = audioData.offers || [];

    const spotlightIds =
        audioData.spotlightProducts || [];


    /* -------------------------------------------------------
       THEME
    ------------------------------------------------------- */

    const [theme, setTheme] = useState(() => {

        return (
            localStorage.getItem(THEME_KEY) ||
            "dark"
        );

    });


    /* -------------------------------------------------------
       SEARCH / FILTER
    ------------------------------------------------------- */

    const [search, setSearch] = useState("");

    const [activeCategory, setActiveCategory] =
        useState("All");

    const [sortBy, setSortBy] =
        useState("featured");

    const [maxPrice, setMaxPrice] =
        useState(Number(store.maxPrice || 15000));

    const [visibleProducts, setVisibleProducts] =
        useState(Number(store.defaultVisibleProducts || 8));


    /* -------------------------------------------------------
       WISHLIST
    ------------------------------------------------------- */

    const [wishlist, setWishlist] = useState(() => {

        try {

            return JSON.parse(
                localStorage.getItem(WISHLIST_KEY)
            ) || [];

        } catch {

            return [];

        }

    });


    /* -------------------------------------------------------
       CART
    ------------------------------------------------------- */

    const [cartCount, setCartCount] =
        useState(0);


    /* -------------------------------------------------------
       SPOTLIGHT
    ------------------------------------------------------- */

    const [spotlightIndex, setSpotlightIndex] =
        useState(0);


    /* -------------------------------------------------------
       OFFER
    ------------------------------------------------------- */

    const [offerIndex, setOfferIndex] =
        useState(0);

    const [timeLeft, setTimeLeft] =
        useState({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        });


    /* -------------------------------------------------------
       MOBILE FILTER
    ------------------------------------------------------- */

    const [mobileFilters, setMobileFilters] =
        useState(false);


    /* -------------------------------------------------------
       QUICK VIEW
    ------------------------------------------------------- */

    const [selectedProduct, setSelectedProduct] =
        useState(null);


    /* -------------------------------------------------------
       TOAST
    ------------------------------------------------------- */

    const [toast, setToast] =
        useState("");


    /* -------------------------------------------------------
       BACK TO TOP
    ------------------------------------------------------- */

    const [showTopButton, setShowTopButton] =
        useState(false);


    /* =======================================================
       APPLY THEME
    ======================================================= */

    useEffect(() => {

        document.documentElement.dataset.audioTheme =
            theme;

        localStorage.setItem(
            THEME_KEY,
            theme
        );

    }, [theme]);


    /* =======================================================
       READ CART
    ======================================================= */

    const updateCartCount = () => {

        try {

            const cart =
                JSON.parse(
                    localStorage.getItem(CART_KEY)
                ) || [];

            const count =
                cart.reduce(
                    (total, item) =>
                        total +
                        Number(item.quantity || 1),
                    0
                );

            setCartCount(count);

        } catch {

            setCartCount(0);

        }

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


    /* =======================================================
       WISHLIST STORAGE
    ======================================================= */

    useEffect(() => {

        localStorage.setItem(
            WISHLIST_KEY,
            JSON.stringify(wishlist)
        );

    }, [wishlist]);


    /* =======================================================
       WISHLIST TOGGLE
    ======================================================= */

    const toggleWishlist = (product) => {

        setWishlist((previous) => {

            if (previous.includes(product.id)) {

                showToast(
                    "Removed from wishlist"
                );

                return previous.filter(
                    (id) => id !== product.id
                );

            }

            showToast(
                "Added to wishlist ❤️"
            );

            return [
                ...previous,
                product.id
            ];

        });

    };


    /* =======================================================
       TOAST
    ======================================================= */

    const showToast = (message) => {

        setToast(message);

        setTimeout(() => {

            setToast("");

        }, 2200);

    };


    /* =======================================================
       ADD TO CART
    ======================================================= */

    const addToCart = (product) => {

        try {

            const cart =
                JSON.parse(
                    localStorage.getItem(CART_KEY)
                ) || [];

            const existingIndex =
                cart.findIndex(
                    (item) =>
                        item.id === product.id
                );


            if (existingIndex !== -1) {

                cart[existingIndex].quantity =
                    Number(
                        cart[existingIndex].quantity || 1
                    ) + 1;

            } else {

                cart.push({

                    id: product.id,

                    name: product.name,

                    brand: product.brand,

                    category: product.category,

                    price: product.price,

                    oldPrice: product.oldPrice,

                    image: product.image,

                    quantity: 1

                });

            }


            localStorage.setItem(
                CART_KEY,
                JSON.stringify(cart)
            );

            updateCartCount();

            showToast(
                `${product.name} added to cart`
            );

        } catch {

            showToast(
                "Unable to add product"
            );

        }

    };


    /* =======================================================
       CATEGORY SELECTION
    ======================================================= */

    const selectCategory = (category) => {

        setActiveCategory(category);

        setVisibleProducts(
            Number(
                store.defaultVisibleProducts || 8
            )
        );

        setTimeout(() => {

            document
                .querySelector(
                    ".audio-products-section"
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }, 50);

    };


    /* =======================================================
       SEARCH
    ======================================================= */

    const handleSearch = (event) => {

        setSearch(
            event.target.value
        );

        setVisibleProducts(
            Number(
                store.defaultVisibleProducts || 8
            )
        );

    };


    /* =======================================================
       FILTER PRODUCTS
    ======================================================= */

    const filteredProducts = useMemo(() => {

        const searchText =
            search
                .trim()
                .toLowerCase();


        let result =
            products.filter((product) => {

                const searchableText = [

                    product.name,

                    product.brand,

                    product.category,

                    product.color,

                    product.description,

                    ...(product.tags || []),

                    ...(product.features || [])

                ]
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !searchText ||
                    searchableText.includes(
                        searchText
                    );


                const matchesCategory =
                    activeCategory === "All" ||
                    product.category ===
                        activeCategory;


                const matchesPrice =
                    Number(product.price) <=
                    Number(maxPrice);


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesPrice
                );

            });


        /* ---------------------------------------------------
           SORT
        --------------------------------------------------- */

        if (sortBy === "price-low") {

            result.sort(
                (a, b) =>
                    Number(a.price) -
                    Number(b.price)
            );

        }

        else if (sortBy === "price-high") {

            result.sort(
                (a, b) =>
                    Number(b.price) -
                    Number(a.price)
            );

        }

        else if (sortBy === "rating") {

            result.sort(
                (a, b) =>
                    Number(b.rating) -
                    Number(a.rating)
            );

        }

        else if (sortBy === "discount") {

            result.sort(
                (a, b) =>
                    Number(b.discount) -
                    Number(a.discount)
            );

        }

        else if (sortBy === "newest") {

            result.sort(
                (a, b) =>
                    Number(b.newArrival) -
                    Number(a.newArrival)
            );

        }

        else {

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
        maxPrice,
        sortBy
    ]);


    /* =======================================================
       VISIBLE PRODUCT LIST
    ======================================================= */

    const displayedProducts =
        filteredProducts.slice(
            0,
            visibleProducts
        );


    /* =======================================================
       LOAD MORE
    ======================================================= */

    const loadMore = () => {

        setVisibleProducts(
            (previous) =>
                previous +
                Number(
                    store.productsPerLoad || 4
                )
        );

    };


    /* =======================================================
       SPOTLIGHT PRODUCT
    ======================================================= */

    const spotlightProducts = useMemo(() => {

        return spotlightIds
            .map((id) =>
                products.find(
                    (product) =>
                        product.id === id
                )
            )
            .filter(Boolean);

    }, [
        spotlightIds,
        products
    ]);


    /* =======================================================
       AUTOMATIC SPOTLIGHT CHANGE
    ======================================================= */

    useEffect(() => {

        if (
            spotlightProducts.length <= 1
        ) {
            return;
        }

        const timer =
            setInterval(() => {

                setSpotlightIndex(
                    (previous) =>
                        (
                            previous + 1
                        ) %
                        spotlightProducts.length
                );

            }, 6000);


        return () => {
            clearInterval(timer);
        };

    }, [
        spotlightProducts.length
    ]);


    /* =======================================================
       CURRENT SPOTLIGHT
    ======================================================= */

    const currentSpotlight =
        spotlightProducts[
            spotlightIndex %
            Math.max(
                spotlightProducts.length,
                1
            )
        ];


    /* =======================================================
       OFFER TIMER
    ======================================================= */

    const calculateTimeLeft = (
        endTime
    ) => {

        const difference =
            new Date(endTime).getTime() -
            Date.now();


        if (difference <= 0) {

            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            };

        }


        return {

            days:
                Math.floor(
                    difference /
                    (1000 * 60 * 60 * 24)
                ),

            hours:
                Math.floor(
                    (
                        difference /
                        (1000 * 60 * 60)
                    ) % 24
                ),

            minutes:
                Math.floor(
                    (
                        difference /
                        (1000 * 60)
                    ) % 60
                ),

            seconds:
                Math.floor(
                    (
                        difference /
                        1000
                    ) % 60
                )

        };

    };


    /* =======================================================
       UPDATE TIMER
    ======================================================= */

    useEffect(() => {

        if (!offers.length) {
            return;
        }


        const updateTimer = () => {

            const currentOffer =
                offers[
                    offerIndex %
                    offers.length
                ];


            const remaining =
                calculateTimeLeft(
                    currentOffer.endTime
                );


            const isExpired =
                remaining.days === 0 &&
                remaining.hours === 0 &&
                remaining.minutes === 0 &&
                remaining.seconds === 0;


            if (isExpired) {

                setOfferIndex(
                    (previous) =>
                        (
                            previous + 1
                        ) %
                        offers.length
                );

                return;

            }


            setTimeLeft(
                remaining
            );

        };


        updateTimer();


        const timer =
            setInterval(
                updateTimer,
                1000
            );


        return () => {
            clearInterval(timer);
        };

    }, [
        offerIndex,
        offers
    ]);


    /* =======================================================
       CURRENT OFFER
    ======================================================= */

    const currentOffer =
        offers[
            offerIndex %
            Math.max(
                offers.length,
                1
            )
        ];


    /* =======================================================
       OFFER PRODUCTS
    ======================================================= */

    const offerProducts =
        currentOffer
            ? currentOffer.productIds
                .map((id) =>
                    products.find(
                        (product) =>
                            product.id === id
                    )
                )
                .filter(Boolean)
            : [];


    /* =======================================================
       BACK TO TOP
    ======================================================= */

    useEffect(() => {

        const handleScroll = () => {

            setShowTopButton(
                window.scrollY > 600
            );

        };


        window.addEventListener(
            "scroll",
            handleScroll
        );


        return () => {

            window.removeEventListener(
                "scroll",
                handleScroll
            );

        };

    }, []);


    const scrollToTop = () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    };


    /* =======================================================
       CART NAVIGATION
    ======================================================= */

    const openCart = () => {

        window.location.href =
            "./addToCart.html";

    };


    /* =======================================================
       RENDER
    ======================================================= */

    return (

        <div className="audio-page">


            {/* =================================================
                TOP ANNOUNCEMENT
            ================================================= */}

            <div className="audio-announcement">

                <div className="audio-announcement-track">

                    <span>
                        FREE DELIVERY ABOVE ₹999
                    </span>

                    <span>•</span>

                    <span>
                        UP TO 60% OFF
                    </span>

                    <span>•</span>

                    <span>
                        PREMIUM AUDIO COLLECTION
                    </span>

                    <span>•</span>

                    <span>
                        KSAM DEAL
                    </span>

                    <span>•</span>

                    <span>
                        FREE DELIVERY ABOVE ₹999
                    </span>

                    <span>•</span>

                    <span>
                        UP TO 60% OFF
                    </span>

                </div>

            </div>


            {/* =================================================
                NAVBAR
            ================================================= */}

            <header className="audio-navbar">

                <a
                    href="./index.html"
                    className="audio-logo"
                >

                    <span className="audio-logo-main">
                        KSAM
                    </span>

                    <span className="audio-logo-sub">
                        DEAL
                    </span>

                </a>


                <nav className="audio-nav">

                    <a href="#home">
                        Home
                    </a>

                    <a href="#categories">
                        Categories
                    </a>

                    <a href="#offers">
                        Offers
                    </a>

                    <a href="#spotlight">
                        Spotlight
                    </a>

                    <a href="#products">
                        Products
                    </a>

                </nav>


                <div className="audio-nav-actions">

                    <button
                        className="audio-theme-button"
                        onClick={() =>
                            setTheme(
                                theme === "dark"
                                    ? "light"
                                    : "dark"
                            )
                        }
                        aria-label="Change theme"
                    >
                        <i
                            className={
                                theme === "dark"
                                    ? "fa-solid fa-sun"
                                    : "fa-solid fa-moon"
                            }
                        ></i>
                    </button>


                    <button
                        className="audio-cart-button"
                        onClick={openCart}
                    >

                        <i className="fa-solid fa-bag-shopping"></i>

                        <span>
                            Cart
                        </span>

                        <b>
                            {cartCount}
                        </b>

                    </button>

                </div>

            </header>


            {/* =================================================
                HERO
            ================================================= */}

            <main id="home">

                <AudioHero
                    hero={audioData.hero}
                    onExplore={() =>
                        document
                            .querySelector(
                                "#categories"
                            )
                            ?.scrollIntoView({
                                behavior: "smooth"
                            })
                    }
                />


                {/* =============================================
                    AUTO MOVING STRIP
                ============================================= */}

                <section className="audio-marquee-section">

                    <div className="audio-marquee-label">
                        <span>
                            TRENDING AUDIO
                        </span>

                        <i className="fa-solid fa-arrow-right"></i>
                    </div>


                    <div className="audio-marquee">

                        <div className="audio-marquee-track">

                            {[
                                ...products,
                                ...products
                            ].map(
                                (product, index) => (

                                    <div
                                        className="audio-marquee-card"
                                        key={`${product.id}-${index}`}
                                    >

                                        <div className="audio-marquee-image">

                                            <img
                                                src={getImagePath(
                                                    product.image
                                                )}
                                                alt={
                                                    product.name
                                                }
                                            />

                                        </div>

                                        <div>

                                            <small>
                                                {product.brand}
                                            </small>

                                            <strong>
                                                {product.name}
                                            </strong>

                                        </div>

                                        <span>
                                            {store.currency}
                                            {product.price}
                                        </span>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                </section>


                {/* =============================================
                    CATEGORIES
                ============================================= */}

                <section
                    className="audio-categories-section"
                    id="categories"
                >

                    <div className="audio-section-heading">

                        <div>

                            <span>
                                EXPLORE
                            </span>

                            <h2>
                                Find your sound.
                            </h2>

                        </div>

                        <p>
                            Choose the audio experience
                            that matches your lifestyle.
                        </p>

                    </div>


                    <div className="audio-category-grid">

                        <button
                            className={
                                activeCategory === "All"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                selectCategory("All")
                            }
                        >

                            <i className="fa-solid fa-layer-group"></i>

                            <strong>
                                All Audio
                            </strong>

                            <small>
                                {products.length} products
                            </small>

                        </button>


                        {categories.map(
                            (category) => (

                                <button
                                    key={category.id}
                                    className={
                                        activeCategory ===
                                        category.name
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        selectCategory(
                                            category.name
                                        )
                                    }
                                >

                                    <i
                                        className={
                                            category.icon
                                        }
                                    ></i>

                                    <strong>
                                        {category.name}
                                    </strong>

                                    <small>
                                        {
                                            products.filter(
                                                (product) =>
                                                    product.category ===
                                                    category.name
                                            ).length
                                        } products
                                    </small>

                                </button>

                            )
                        )}

                    </div>

                </section>


                {/* =============================================
                    OFFER SECTION
                ============================================= */}

                <section
                    className="audio-offer-section"
                    id="offers"
                >

                    <div className="audio-offer-content">

                        <span className="audio-offer-eyebrow">
                            ⚡ LIMITED TIME
                        </span>

                        <h2>
                            {currentOffer?.title}
                        </h2>

                        <p>
                            {currentOffer?.subtitle}
                        </p>


                        <div className="audio-offer-discount">
                            {currentOffer?.discount}
                        </div>


                        <div className="audio-countdown">

                            <div>
                                <strong>
                                    {String(
                                        timeLeft.days
                                    ).padStart(2, "0")}
                                </strong>

                                <span>
                                    DAYS
                                </span>
                            </div>


                            <b>:</b>


                            <div>
                                <strong>
                                    {String(
                                        timeLeft.hours
                                    ).padStart(2, "0")}
                                </strong>

                                <span>
                                    HOURS
                                </span>
                            </div>


                            <b>:</b>


                            <div>
                                <strong>
                                    {String(
                                        timeLeft.minutes
                                    ).padStart(2, "0")}
                                </strong>

                                <span>
                                    MIN
                                </span>
                            </div>


                            <b>:</b>


                            <div>
                                <strong>
                                    {String(
                                        timeLeft.seconds
                                    ).padStart(2, "0")}
                                </strong>

                                <span>
                                    SEC
                                </span>
                            </div>

                        </div>


                        <button
                            className="audio-offer-button"
                            onClick={() =>
                                document
                                    .querySelector(
                                        "#products"
                                    )
                                    ?.scrollIntoView({
                                        behavior: "smooth"
                                    })
                            }
                        >
                            Shop this offer

                            <i className="fa-solid fa-arrow-right"></i>

                        </button>

                    </div>


                    <div className="audio-offer-products">

                        {offerProducts.map(
                            (product) => (

                                <div
                                    className="audio-offer-product"
                                    key={product.id}
                                >

                                    <span>
                                        -{product.discount}%
                                    </span>

                                    <img
                                        src={getImagePath(
                                            product.image
                                        )}
                                        alt={
                                            product.name
                                        }
                                    />

                                    <strong>
                                        {product.name}
                                    </strong>

                                    <div>

                                        <b>
                                            {store.currency}
                                            {product.price}
                                        </b>

                                        <del>
                                            {store.currency}
                                            {product.oldPrice}
                                        </del>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </section>


                {/* =============================================
                    SPOTLIGHT
                ============================================= */}

                {currentSpotlight && (

                    <section
                        className="audio-spotlight-section"
                        id="spotlight"
                    >

                        <div className="audio-spotlight-image">

                            <div className="spotlight-glow"></div>

                            <img
                                src={getImagePath(
                                    currentSpotlight.image
                                )}
                                alt={
                                    currentSpotlight.name
                                }
                            />

                            <span className="spotlight-badge">
                                {currentSpotlight.badge}
                            </span>

                        </div>


                        <div className="audio-spotlight-info">

                            <span>
                                FEATURED SPOTLIGHT
                            </span>

                            <small>
                                {currentSpotlight.brand}
                            </small>

                            <h2>
                                {currentSpotlight.name}
                            </h2>

                            <p>
                                {currentSpotlight.description}
                            </p>


                            <div className="spotlight-rating">

                                <strong>
                                    ★ {currentSpotlight.rating}
                                </strong>

                                <span>
                                    (
                                    {currentSpotlight.reviews}
                                    reviews)
                                </span>

                            </div>


                            <div className="spotlight-price">

                                <strong>
                                    {store.currency}
                                    {currentSpotlight.price}
                                </strong>

                                <del>
                                    {store.currency}
                                    {currentSpotlight.oldPrice}
                                </del>

                                <b>
                                    {currentSpotlight.discount}%
                                    OFF
                                </b>

                            </div>


                            <div className="spotlight-features">

                                {currentSpotlight.features
                                    ?.slice(0, 4)
                                    .map(
                                        (
                                            feature,
                                            index
                                        ) => (

                                            <div
                                                key={
                                                    `${currentSpotlight.id}-${index}`
                                                }
                                            >

                                                <i className="fa-solid fa-check"></i>

                                                <span>
                                                    {feature}
                                                </span>

                                            </div>

                                        )
                                    )}

                            </div>


                            <div className="spotlight-actions">

                                <button
                                    onClick={() =>
                                        addToCart(
                                            currentSpotlight
                                        )
                                    }
                                >
                                    <i className="fa-solid fa-cart-plus"></i>

                                    Add to cart
                                </button>


                                <button
                                    className="spotlight-wishlist"
                                    onClick={() =>
                                        toggleWishlist(
                                            currentSpotlight
                                        )
                                    }
                                >

                                    <i
                                        className={
                                            wishlist.includes(
                                                currentSpotlight.id
                                            )
                                                ? "fa-solid fa-heart"
                                                : "fa-regular fa-heart"
                                        }
                                    ></i>

                                </button>

                            </div>


                            <div className="spotlight-dots">

                                {spotlightProducts.map(
                                    (product, index) => (

                                        <button
                                            key={
                                                product.id
                                            }
                                            className={
                                                index ===
                                                spotlightIndex
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setSpotlightIndex(
                                                    index
                                                )
                                            }
                                        ></button>

                                    )
                                )}

                            </div>

                        </div>

                    </section>

                )}


                {/* =============================================
                    FEATURES
                ============================================= */}

                <section className="audio-features-section">

                    <div className="audio-section-heading">

                        <div>

                            <span>
                                WHY KSAM AUDIO
                            </span>

                            <h2>
                                Built for better sound.
                            </h2>

                        </div>

                    </div>


                    <div className="audio-feature-grid">

                        {features.map(
                            (feature, index) => (

                                <article
                                    key={
                                        feature.id
                                    }
                                    className="audio-feature-card"
                                >

                                    <div className="audio-feature-number">
                                        0{index + 1}
                                    </div>

                                    <div className="audio-feature-icon">

                                        <i
                                            className={
                                                feature.icon
                                            }
                                        ></i>

                                    </div>

                                    <h3>
                                        {feature.title}
                                    </h3>

                                    <p>
                                        {feature.description}
                                    </p>

                                </article>

                            )
                        )}

                    </div>

                </section>


                {/* =============================================
                    PRODUCTS
                ============================================= */}

                <section
                    className="audio-products-section"
                    id="products"
                >

                    <div className="audio-products-heading">

                        <div>

                            <span>
                                SHOP AUDIO
                            </span>

                            <h2>
                                Find your next sound.
                            </h2>

                        </div>


                        <div className="audio-product-count">
                            {filteredProducts.length}
                            {" "}
                            products
                        </div>

                    </div>


                    {/* FILTER BAR */}

                    <div className="audio-filter-bar">

                        <div className="audio-search">

                            <i className="fa-solid fa-magnifying-glass"></i>

                            <input
                                type="text"
                                placeholder="Search earbuds, headphones..."
                                value={search}
                                onChange={handleSearch}
                            />

                            {search && (

                                <button
                                    onClick={() =>
                                        setSearch("")
                                    }
                                >
                                    ×
                                </button>

                            )}

                        </div>


                        <select
                            value={sortBy}
                            onChange={(event) =>
                                setSortBy(
                                    event.target.value
                                )
                            }
                        >

                            <option value="featured">
                                Featured
                            </option>

                            <option value="newest">
                                New arrivals
                            </option>

                            <option value="rating">
                                Top rated
                            </option>

                            <option value="discount">
                                Biggest discount
                            </option>

                            <option value="price-low">
                                Price: Low to High
                            </option>

                            <option value="price-high">
                                Price: High to Low
                            </option>

                        </select>


                        <button
                            className="audio-mobile-filter-button"
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


                    {/* FILTER PANEL */}

                    <div
                        className={`audio-filter-panel ${
                            mobileFilters
                                ? "open"
                                : ""
                        }`}
                    >

                        <div>

                            <label>
                                Category
                            </label>

                            <select
                                value={
                                    activeCategory
                                }
                                onChange={(event) =>
                                    selectCategory(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="All">
                                    All
                                </option>

                                {categories.map(
                                    (category) => (

                                        <option
                                            key={
                                                category.id
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


                        <div className="audio-price-filter">

                            <div>

                                <label>
                                    Maximum price
                                </label>

                                <strong>
                                    {store.currency}
                                    {maxPrice}
                                </strong>

                            </div>

                            <input
                                type="range"
                                min="100"
                                max={
                                    Number(
                                        store.maxPrice ||
                                        15000
                                    )
                                }
                                step="100"
                                value={maxPrice}
                                onChange={(event) =>
                                    setMaxPrice(
                                        Number(
                                            event.target.value
                                        )
                                    )
                                }
                            />

                        </div>


                        <button
                            onClick={() => {

                                setSearch("");

                                setActiveCategory(
                                    "All"
                                );

                                setMaxPrice(
                                    Number(
                                        store.maxPrice ||
                                        15000
                                    )
                                );

                                setSortBy(
                                    "featured"
                                );

                            }}
                        >
                            Reset filters
                        </button>

                    </div>


                    {/* PRODUCT GRID */}

                    {displayedProducts.length > 0 ? (

                        <div className="audio-product-grid">

                            {displayedProducts.map(
                                (product) => (

                                    <AudioCard
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
                                            toggleWishlist
                                        }
                                        onAddToCart={
                                            addToCart
                                        }
                                        onViewProduct={
                                            setSelectedProduct
                                        }
                                    />

                                )
                            )}

                        </div>

                    ) : (

                        <div className="audio-empty-state">

                            <i className="fa-solid fa-headphones"></i>

                            <h3>
                                No audio products found
                            </h3>

                            <p>
                                Try another search or
                                reset your filters.
                            </p>

                            <button
                                onClick={() => {

                                    setSearch("");

                                    setActiveCategory(
                                        "All"
                                    );

                                    setMaxPrice(
                                        Number(
                                            store.maxPrice ||
                                            15000
                                        )
                                    );

                                }}
                            >
                                Reset
                            </button>

                        </div>

                    )}


                    {/* LOAD MORE */}

                    {visibleProducts <
                        filteredProducts.length && (

                        <div className="audio-load-more">

                            <button
                                onClick={
                                    loadMore
                                }
                            >
                                Load more products

                                <i className="fa-solid fa-arrow-down"></i>

                            </button>

                        </div>

                    )}

                </section>

            </main>


            {/* =================================================
                QUICK VIEW MODAL
            ================================================= */}

            {selectedProduct && (

                <div
                    className="audio-modal"
                    onClick={() =>
                        setSelectedProduct(
                            null
                        )
                    }
                >

                    <div
                        className="audio-modal-content"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <button
                            className="audio-modal-close"
                            onClick={() =>
                                setSelectedProduct(
                                    null
                                )
                            }
                        >
                            ×
                        </button>


                        <div className="audio-modal-image">

                            <img
                                src={getImagePath(
                                    selectedProduct.image
                                )}
                                alt={
                                    selectedProduct.name
                                }
                            />

                        </div>


                        <div className="audio-modal-info">

                            <small>
                                {
                                    selectedProduct.brand
                                }
                            </small>

                            <h2>
                                {
                                    selectedProduct.name
                                }
                            </h2>

                            <div className="audio-modal-rating">
                                ★{" "}
                                {
                                    selectedProduct.rating
                                }
                                {" "}
                                (
                                {
                                    selectedProduct.reviews
                                }
                                )
                            </div>

                            <p>
                                {
                                    selectedProduct.description
                                }
                            </p>


                            <div className="audio-modal-price">

                                <strong>
                                    {store.currency}
                                    {
                                        selectedProduct.price
                                    }
                                </strong>

                                <del>
                                    {store.currency}
                                    {
                                        selectedProduct.oldPrice
                                    }
                                </del>

                            </div>


                            <div className="audio-modal-specs">

                                <div>
                                    <span>
                                        Battery
                                    </span>

                                    <strong>
                                        {
                                            selectedProduct.battery
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Connectivity
                                    </span>

                                    <strong>
                                        {
                                            selectedProduct.connectivity
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Water resistance
                                    </span>

                                    <strong>
                                        {
                                            selectedProduct.waterResistance
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Stock
                                    </span>

                                    <strong>
                                        {
                                            selectedProduct.stock
                                        }
                                    </strong>
                                </div>

                            </div>


                            <button
                                className="audio-modal-cart"
                                onClick={() => {

                                    addToCart(
                                        selectedProduct
                                    );

                                    setSelectedProduct(
                                        null
                                    );

                                }}
                            >

                                <i className="fa-solid fa-cart-plus"></i>

                                Add to cart

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                TOAST
            ================================================= */}

            {toast && (

                <div className="audio-toast">

                    <i className="fa-solid fa-circle-check"></i>

                    <span>
                        {toast}
                    </span>

                </div>

            )}


            {/* =================================================
                BACK TO TOP
            ================================================= */}

            {showTopButton && (

                <button
                    className="audio-back-top"
                    onClick={scrollToTop}
                    aria-label="Back to top"
                >
                    ↑
                </button>

            )}


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="audio-footer">

                <div className="audio-footer-main">

                    <div>

                        <div className="audio-footer-logo">
                            KSAM
                            <span>
                                DEAL
                            </span>
                        </div>

                        <p>
                            Premium audio,
                            powerful experiences.
                        </p>

                    </div>


                    <div>

                        <h4>
                            Shop
                        </h4>

                        <a href="#products">
                            Earbuds
                        </a>

                        <a href="#products">
                            Headphones
                        </a>

                        <a href="#products">
                            Speakers
                        </a>

                        <a href="#products">
                            Gaming
                        </a>

                    </div>


                    <div>

                        <h4>
                            Help
                        </h4>

                        <a href="./contact.html">
                            Contact
                        </a>

                        <a href="./addToCart.html">
                            Cart
                        </a>

                        <a href="#offers">
                            Offers
                        </a>

                    </div>


                    <div>

                        <h4>
                            KSAM Deal
                        </h4>

                        <p>
                            Better products.
                            Better prices.
                            Better everyday.
                        </p>

                    </div>

                </div>


                <div className="audio-footer-bottom">

                    <span>
                        © {new Date().getFullYear()}
                        {" "}
                        KSAM Deal. All rights reserved.
                    </span>

                    <span>
                        Designed for better sound.
                    </span>

                </div>

            </footer>

        </div>

    );
}


/* =========================================================
   MOUNT
========================================================= */

const rootElement =
    document.getElementById(
        "audio-root"
    );


if (rootElement) {

    createRoot(
        rootElement
    ).render(
        <AudioMain />
    );

}