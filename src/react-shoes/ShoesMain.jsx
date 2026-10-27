console.log("SHOES MAIN JS IS RUNNING");


import React, {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import { createRoot } from "react-dom/client";


import ShoeCard from "./ShoeCard";
import { requireAuth } from "../auth/auth.js";
import Navbar from "../deals/components/Navbar.jsx";
import { addProductToCart, normalizeCartItem, resolveImagePath } from "../lib/cartHelper.js";
import { isInWishlist, toggleWishlist as sharedToggleWishlist, subscribeWishlist } from "../lib/wishlist.js";

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


    const [, setWishlistVersion] = useState(0);

    useEffect(() => {
        const unsub = subscribeWishlist(() => {
            setWishlistVersion((v) => v + 1);
        });
        return unsub;
    }, []);


    const [quickProduct, setQuickProduct] =
        useState(null);


    const [mobileFilters, setMobileFilters] =
        useState(false);


    const [toast, setToast] =
        useState("");


    const [cartCount, setCartCount] =
        useState(0);


    /* =====================================================
       DYNAMIC HERO PRODUCTS (USED ACROSS PAGE)
       ===================================================== */
    const [heroIndex, setHeroIndex] = useState(0);

    const heroProducts = useMemo(() => {
        const featured = shoesData.products.filter(
            (product) => product.featured
        );
        return featured.length ? featured : shoesData.products;
    }, []);

    const heroProduct = heroProducts[heroIndex % heroProducts.length];

    /* =====================================================
       HERO VIDEO (VIDEO 2) STATE & LIFECYCLE
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

    useEffect(() => {
        const vid = heroVideoRef.current;
        if (!vid) return;
        if (heroInView && !prefersReducedMotion && !heroVideoFailed) {
            const playPromise = vid.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(() => {
                    setHeroVideoFailed(true);
                });
            }
        } else {
            vid.pause();
        }
    }, [heroInView, prefersReducedMotion, heroVideoFailed]);



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

    const handleWishlist = (product) => {
        if (!requireAuth({ type: "wishlist", product })) {
            return;
        }
        sharedToggleWishlist(product);
    };



    /* =====================================================
       ADD TO CART
       ===================================================== */

    const handleAddToCart =
        (product) => {

            if (!requireAuth({ type: "add_to_cart", product })) {
                return;
            }

            try {
                const normalized = normalizeCartItem(product, 1);
                addProductToCart(product, 1);
                updateCartCount();

                showToast(
                    `${normalized?.name || product.name || "Product"} added to cart 🛒`
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

            {/* Shared Deals-style Navbar */}
            <Navbar />

            {/* =================================================
   MODERN DYNAMIC SHOE HERO
   ================================================= */}

<section className="ksam-shoe-hero" ref={heroSectionRef}>

    {/* VIDEO 2 BACKGROUND LAYER ANCHORED TO RIGHT */}
    <div className="ksam-hero-video-wrapper" aria-hidden="true">
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
                alt="Sneaker exploded view"
                className="ksam-hero-video-poster"
            />
        )}
        <div className="ksam-hero-video-overlay" aria-hidden="true" />
    </div>

    {/* BACKGROUND DECORATION */}

    <div className="ksam-hero-glow ksam-glow-one"></div>

    <div className="ksam-hero-glow ksam-glow-two"></div>

    <div className="ksam-hero-grid"></div>



    {/* MAIN HERO */}

    <div className="ksam-hero-main">


        {/* LEFT SIDE */}

        <div className="ksam-hero-content">

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


        {/* MOBILE VIDEO BLOCK (under 768px, appears below text) */}

        <div className="ksam-hero-mobile-video-wrap">

            {!prefersReducedMotion && !heroVideoFailed ? (
                <video
                    className="ksam-hero-mobile-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                    poster={`${import.meta.env.BASE_URL}assets/videos/shoes-hero-poster.jpg`}
                >
                    <source
                        src={`${import.meta.env.BASE_URL}assets/videos/shoes-hero.mp4`}
                        type="video/mp4"
                    />
                </video>
            ) : (
                <img
                    src={`${import.meta.env.BASE_URL}assets/videos/shoes-hero-poster.jpg`}
                    alt="Sneaker exploded view"
                    className="ksam-hero-mobile-poster"
                />
            )}

        </div>

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
                                                isInWishlist(
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

                        <a href="./shop.html">
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