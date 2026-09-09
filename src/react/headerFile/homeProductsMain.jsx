import React, {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";


import AnnouncementBar from "./AnnouncementBar";
import HomeNavbar from "./HomeNavbar";

import NewsletterSection from "./NewsletterSection";

import DiscountBanner from "./DiscountBanner";

import BenefitsSection from "./BenefitsSection";

import TestimonialsSection from "./Testimonials";


import HomeFooter from "./headerHomeFooter";
import CategorySection from "./CategorySection";

import HorizontalProducts from "./HorizontalProducts";

import FlashDeals from "./FlashDeals";

import { createRoot } from "react-dom/client";
import HeroSection from "./HeroSection";
import ProductCard from "./ProductCard";
import productsData from "../../api/headerproducts.json";
import "./homeProducts.css";


/* =========================================================
   STORAGE KEYS
========================================================= */

const CART_KEY = "cartProductLS";
const WISHLIST_KEY = "headerProductsWishlist";
const RECENT_KEY = "headerProductsRecentlyViewed";


/* =========================================================
   IMAGE PATH
   Works correctly with GitHub Pages
========================================================= */

function getProductImage(image) {

    if (!image) {
        return "";
    }

    return `${import.meta.env.BASE_URL}${image}`;
}


/* =========================================================
   LOCAL STORAGE HELPERS
========================================================= */

function getStorage(key, fallback = []) {

    try {

        return JSON.parse(
            localStorage.getItem(key)
        ) || fallback;

    } catch (error) {

        console.error(
            `Unable to read ${key}`,
            error
        );

        return fallback;

    }

}


function saveStorage(key, value) {

    localStorage.setItem(
        key,
        JSON.stringify(value)
    );

}


/* =========================================================
   MAIN COMPONENT
========================================================= */

function HomeProducts() {

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [selectedProduct, setSelectedProduct] =
        useState(null);

    const [selectedCategory, setSelectedCategory] =
        useState("All");

    const [searchText, setSearchText] =
        useState("");

    const [sortOption, setSortOption] =
        useState("Featured");

    const [wishlist, setWishlist] =
        useState([]);

    const [cartMessage, setCartMessage] =
        useState("");

    const [quantity, setQuantity] =
        useState(1);

    const [recentProducts, setRecentProducts] =
        useState([]);

    const [showFilters, setShowFilters] =
        useState(false);


    const productsSectionRef =
        useRef(null);


    /* =====================================================
       LOAD DATA
    ===================================================== */

    useEffect(() => {

        setProducts(productsData);

        setWishlist(
            getStorage(WISHLIST_KEY)
        );

        setRecentProducts(
            getStorage(RECENT_KEY)
        );

        setLoading(false);

    }, []);


    /* =====================================================
       SCROLL ANIMATION
       
       IMPORTANT:
       Animation is removed when cards leave viewport.
       Therefore animation runs AGAIN every time the
       user comes back to the product section.
    ===================================================== */

    useEffect(() => {

        if (loading) return;

        const section =
            productsSectionRef.current;

        if (!section) return;


        const cards =
            section.querySelectorAll(
                ".home-product-card"
            );


        const observer =
            new IntersectionObserver(

                (entries) => {

                    entries.forEach((entry) => {

                        if (entry.isIntersecting) {

                            entry.target.classList.add(
                                "product-visible"
                            );

                        } else {

                            entry.target.classList.remove(
                                "product-visible"
                            );

                        }

                    });

                },

                {
                    threshold: 0.18
                }

            );


        cards.forEach((card) => {

            observer.observe(card);

        });


        return () => {

            observer.disconnect();

        };

    }, [
        loading,
        products,
        selectedCategory,
        searchText,
        sortOption
    ]);


    /* =====================================================
       CATEGORIES
    ===================================================== */

    const categories = useMemo(() => {

        const uniqueCategories =
            [
                ...new Set(
                    products.map(
                        (product) =>
                            product.category
                    )
                )
            ];

        return [
            "All",
            ...uniqueCategories
        ];

    }, [products]);


    /* =====================================================
       FILTER + SEARCH + SORT
    ===================================================== */

    const filteredProducts = useMemo(() => {

        let result =
            products.filter((product) => {

                const matchesCategory =
                    selectedCategory === "All" ||
                    product.category ===
                    selectedCategory;


                const search =
                    searchText
                        .trim()
                        .toLowerCase();


                const searchableText =
                    `
                    ${product.name}
                    ${product.category}
                    ${product.description}
                    `.toLowerCase();


                const matchesSearch =
                    searchableText.includes(
                        search
                    );


                return (
                    matchesCategory &&
                    matchesSearch
                );

            });


        /* FEATURED */

        if (
            sortOption ===
            "Featured"
        ) {

            const badgePriority = {

                "BEST SELLER": 1,

                "POPULAR": 2,

                "NEW": 3

            };


            result.sort(
                (a, b) =>
                    (
                        badgePriority[a.badge] ||
                        4
                    ) -
                    (
                        badgePriority[b.badge] ||
                        4
                    )
            );

        }


        /* PRICE LOW */

        if (
            sortOption ===
            "Price Low"
        ) {

            result.sort(
                (a, b) =>
                    Number(a.price) -
                    Number(b.price)
            );

        }


        /* PRICE HIGH */

        if (
            sortOption ===
            "Price High"
        ) {

            result.sort(
                (a, b) =>
                    Number(b.price) -
                    Number(a.price)
            );

        }


        /* RATING */

        if (
            sortOption ===
            "Rating"
        ) {

            result.sort(
                (a, b) =>
                    Number(b.rating) -
                    Number(a.rating)
            );

        }


        /* DISCOUNT */

        if (
            sortOption ===
            "Discount"
        ) {

            result.sort(
                (a, b) =>
                    Number(b.discount || 0) -
                    Number(a.discount || 0)
            );

        }


        return result;

    }, [
        products,
        selectedCategory,
        searchText,
        sortOption
    ]);


    /* =====================================================
       DISCOUNT
    ===================================================== */

    const getDiscount =
        (product) => {

            if (
                product.discount
            ) {

                return product.discount;

            }


            if (
                product.oldPrice &&
                product.price
            ) {

                return Math.round(
                    (
                        (
                            product.oldPrice -
                            product.price
                        ) /
                        product.oldPrice
                    ) * 100
                );

            }


            return 0;

        };


    /* =====================================================
       WISHLIST
    ===================================================== */

    const toggleWishlist =
        (productId) => {

            let updatedWishlist;


            if (
                wishlist.includes(
                    productId
                )
            ) {

                updatedWishlist =
                    wishlist.filter(
                        (id) =>
                            id !== productId
                    );

            } else {

                updatedWishlist = [
                    ...wishlist,
                    productId
                ];

            }


            setWishlist(
                updatedWishlist
            );

            saveStorage(
                WISHLIST_KEY,
                updatedWishlist
            );

        };


    /* =====================================================
       IS WISHLISTED
    ===================================================== */

    const isWishlisted =
        (productId) => {

            return wishlist.includes(
                productId
            );

        };


    /* =====================================================
       RECENTLY VIEWED
    ===================================================== */

    const addToRecentlyViewed =
        (product) => {

            const existing =
                getStorage(
                    RECENT_KEY
                );


            const filtered =
                existing.filter(
                    (id) =>
                        id !== product.id
                );


            const updated = [
                product.id,
                ...filtered
            ].slice(0, 6);


            setRecentProducts(
                updated
            );

            saveStorage(
                RECENT_KEY,
                updated
            );

        };


    /* =====================================================
       OPEN PRODUCT
    ===================================================== */

    const openProduct =
        (product) => {

            setSelectedProduct(
                product
            );

            setQuantity(1);

            addToRecentlyViewed(
                product
            );

            document.body.style.overflow =
                "hidden";

        };


    /* =====================================================
       CLOSE PRODUCT
    ===================================================== */

    const closeProduct = () => {

        setSelectedProduct(null);

        setQuantity(1);

        setCartMessage("");

        document.body.style.overflow =
            "";

    };


    /* =====================================================
       ADD TO CART
    ===================================================== */

    const addToCart =
        (product, productQuantity = 1) => {

            const cart =
                getStorage(
                    CART_KEY
                );


            const existingProduct =
                cart.find(
                    (item) =>
                        String(item.id) ===
                        String(product.id)
                );


            if (existingProduct) {

                existingProduct.quantity =
                    Number(
                        existingProduct.quantity ||
                        1
                    ) +
                    productQuantity;

            } else {

                cart.push({

                    ...product,

                    quantity:
                        productQuantity,

                    image:
                        product.image

                });

            }


            saveStorage(
                CART_KEY,
                cart
            );


            setCartMessage(
                "✓ Added to cart"
            );


            window.dispatchEvent(
                new Event("cartUpdated")
            );


            setTimeout(() => {

                setCartMessage("");

            }, 2200);

        };


    /* =====================================================
       POPUP ADD TO CART
    ===================================================== */

    const handlePopupCart =
        () => {

            if (
                !selectedProduct
            ) {
                return;
            }


            addToCart(
                selectedProduct,
                quantity
            );

        };


    /* =====================================================
       ESC KEY
    ===================================================== */

    useEffect(() => {

        const handleKeyDown =
            (event) => {

                if (
                    event.key ===
                    "Escape" &&
                    selectedProduct
                ) {

                    closeProduct();

                }

            };


        document.addEventListener(
            "keydown",
            handleKeyDown
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

        };

    }, [selectedProduct]);


    /* =====================================================
       CLEANUP BODY SCROLL
    ===================================================== */

    useEffect(() => {

        return () => {

            document.body.style.overflow =
                "";

        };

    }, []);


    /* =====================================================
       CLEAR SEARCH
    ===================================================== */

    const clearSearch = () => {

        setSearchText("");

    };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="home-products-loading">

                <div className="products-loader"></div>

                <p>
                    Loading Products...
                </p>

            </div>

        );

    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (
    <>

        <AnnouncementBar />

        <HomeNavbar />

        <main
            className="home-products-app"
            ref={productsSectionRef}
        >

            <HeroSection />


<CategorySection
    products={products}
    onCategorySelect={(category) => {

        setSelectedCategory(category);

        document
            .querySelector(".home-products-grid")
            ?.scrollIntoView({
                behavior: "smooth"
            });

    }}
    
/>


            <FlashDeals
    products={products}
    onOpen={openProduct}
    onAddToCart={addToCart}
/>



<HorizontalProducts
    products={products}
    onOpen={openProduct}
    onAddToCart={addToCart}
/>



<DiscountBanner />

            {/* =================================================
               BACKGROUND DECORATION
            ================================================= */}

            <div className="products-bg-orb products-bg-orb-one"></div>

            <div className="products-bg-orb products-bg-orb-two"></div>


            {/* =================================================
               HEADER
            ================================================= */}

            <section className="home-products-header">

                <div className="products-header-line"></div>


                <span>
                    KSAM DEAL COLLECTION
                </span>


                <h1>

                    EXPLORE

                    <strong>
                        OUR PRODUCTS
                    </strong>

                </h1>


                <p>
                    Discover premium products,
                    exclusive deals and carefully
                    selected collections made for you.
                </p>


                <div className="products-header-stats">

                    <div>
                        <strong>
                            {products.length}+
                        </strong>

                        <span>
                            Products
                        </span>
                    </div>


                    <div>
                        <strong>
                            24/7
                        </strong>

                        <span>
                            Shopping
                        </span>
                    </div>


                    <div>
                        <strong>
                            100%
                        </strong>

                        <span>
                            Quality
                        </span>
                    </div>

                </div>

            </section>



            {/* =================================================
               STICKY CONTROLS
            ================================================= */}

            <section className="products-controls">

                <div className="products-search-box">

                    <span className="search-icon">
                        ⌕
                    </span>


                    <input
                        type="search"
                        value={searchText}
                        placeholder="Search products, categories..."
                        onChange={(event) =>
                            setSearchText(
                                event.target.value
                            )
                        }
                    />


                    {searchText && (

                        <button
                            className="clear-search"
                            type="button"
                            onClick={clearSearch}
                        >
                            ×
                        </button>

                    )}

                </div>


                <button
                    className="mobile-filter-toggle"
                    type="button"
                    onClick={() =>
                        setShowFilters(
                            !showFilters
                        )
                    }
                >

                    ☰ Filters

                </button>

            </section>



            {/* =================================================
               FILTER AREA
            ================================================= */}

            <section
                className={
                    `products-filter-area ${
                        showFilters
                            ? "filters-open"
                            : ""
                    }`
                }
            >


                <div className="products-category-list">

                    {categories.map(
                        (category) => (

                            <button
                                key={category}

                                type="button"

                                className={
                                    selectedCategory ===
                                    category
                                        ? "active"
                                        : ""
                                }

                                onClick={() => {

                                    setSelectedCategory(
                                        category
                                    );

                                    setShowFilters(
                                        false
                                    );

                                }}
                            >

                                {category}

                            </button>

                        )
                    )}

                </div>


                <div className="products-sort">

                    <label>
                        Sort:
                    </label>


                    <select
                        value={sortOption}
                        onChange={(event) =>
                            setSortOption(
                                event.target.value
                            )
                        }
                    >

                        <option value="Featured">
                            Featured
                        </option>

                        <option value="Price Low">
                            Price: Low → High
                        </option>

                        <option value="Price High">
                            Price: High → Low
                        </option>

                        <option value="Rating">
                            Highest Rated
                        </option>

                        <option value="Discount">
                            Biggest Discount
                        </option>

                    </select>

                </div>

            </section>



            {/* =================================================
               RESULT INFO
            ================================================= */}

            <div className="products-result-bar">

                <div>

                    <span>
                        Showing
                    </span>

                    <strong>
                        {filteredProducts.length}
                    </strong>

                    <span>
                        products
                    </span>

                </div>


                {selectedCategory !==
                    "All" && (

                    <button
                        type="button"
                        onClick={() =>
                            setSelectedCategory(
                                "All"
                            )
                        }
                    >
                        Clear category ×
                    </button>

                )}

            </div>



            {/* =================================================
               PRODUCT GRID
            ================================================= */}

            <section className="home-products-grid">


                {filteredProducts.length > 0 ? (

                    filteredProducts.map(
                        (product, index) => {

                            const discount =
                                getDiscount(
                                    product
                                );


                            return (

                                <article
                                    key={
                                        product.id
                                    }

                                    className="home-product-card"

                                    style={{
                                        "--card-index":
                                            index
                                    }}

                                    onClick={() =>
                                        openProduct(
                                            product
                                        )
                                    }
                                >


                                    {/* =================================================
                                       IMAGE
                                    ================================================= */}

                                    <div className="home-product-image">


                                        {/* BADGE */}

                                        {product.badge && (

                                            <span
                                                className={
                                                    `home-product-badge badge-${String(
                                                        product.badge
                                                    )
                                                        .toLowerCase()
                                                        .replace(
                                                            /\s+/g,
                                                            "-"
                                                        )}`
                                                }
                                            >

                                                {product.badge}

                                            </span>

                                        )}


                                        {/* DISCOUNT */}

                                        {discount > 0 && (

                                            <span className="product-discount">

                                                -
                                                {discount}%

                                            </span>

                                        )}


                                        {/* WISHLIST */}

                                        <button
                                            type="button"

                                            className={
                                                `home-product-wishlist ${
                                                    isWishlisted(
                                                        product.id
                                                    )
                                                        ? "wishlisted"
                                                        : ""
                                                }`
                                            }

                                            aria-label={
                                                isWishlisted(
                                                    product.id
                                                )
                                                    ? "Remove from wishlist"
                                                    : "Add to wishlist"
                                            }

                                            onClick={(event) => {

                                                event.stopPropagation();

                                                toggleWishlist(
                                                    product.id
                                                );

                                            }}
                                        >

                                            {
                                                isWishlisted(
                                                    product.id
                                                )
                                                    ? "♥"
                                                    : "♡"
                                            }

                                        </button>


                                        {/* PRODUCT IMAGE */}

                                        <img
                                            src={
                                                getProductImage(
                                                    product.image
                                                )
                                            }

                                            alt={
                                                product.name
                                            }

                                            loading={
                                                index < 4
                                                    ? "eager"
                                                    : "lazy"
                                            }

                                            onError={(
                                                event
                                            ) => {

                                                event.currentTarget.style.display =
                                                    "none";

                                            }}
                                        />


                                        {/* QUICK VIEW */}

                                        <button
                                            type="button"

                                            className="quick-view-button"

                                            onClick={(event) => {

                                                event.stopPropagation();

                                                openProduct(
                                                    product
                                                );

                                            }}
                                        >

                                            👁 QUICK VIEW

                                        </button>

                                    </div>



                                    {/* =================================================
                                       PRODUCT INFO
                                    ================================================= */}

                                    <div className="home-product-info">


                                        <div className="product-category-row">

                                            <span>
                                                {
                                                    product.category
                                                }
                                            </span>

                                        </div>


                                        <h2>
                                            {
                                                product.name
                                            }
                                        </h2>


                                        {/* RATING */}

                                        <div className="home-product-rating">

                                            <span className="rating-stars">

                                                {"★".repeat(
                                                    Number(
                                                        product.rating
                                                    )
                                                )}

                                            </span>


                                            <span className="rating-number">

                                                {
                                                    product.rating
                                                }

                                            </span>


                                            <small>

                                                (
                                                {
                                                    product.reviews
                                                }
                                                )

                                            </small>

                                        </div>


                                        {/* PRICE */}

                                        <div className="home-product-price">

                                            <strong>

                                                ₹
                                                {Number(
                                                    product.price
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                            </strong>


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


                                        {/* STOCK */}

                                        <div className="product-stock">

                                            <span className="stock-dot"></span>

                                            {product.stock > 0
                                                ? `${product.stock} left in stock`
                                                : "Out of stock"}

                                        </div>


                                        {/* VIEW BUTTON */}

                                        <button
                                            type="button"

                                            className="home-product-view"

                                            onClick={(event) => {

                                                event.stopPropagation();

                                                openProduct(
                                                    product
                                                );

                                            }}
                                        >

                                            <span>
                                                VIEW PRODUCT
                                            </span>

                                            <strong>
                                                →
                                            </strong>

                                        </button>

                                    </div>

                                </article>

                            );

                        }

                    )

                ) : (

                    <div className="home-products-empty">

                        <div className="empty-icon">
                            🔍
                        </div>

                        <h2>
                            No Products Found
                        </h2>

                        <p>
                            Try another search,
                            category or filter.
                        </p>


                        <button
                            type="button"
                            onClick={() => {

                                setSearchText("");

                                setSelectedCategory(
                                    "All"
                                );

                            }}
                        >
                            SHOW ALL PRODUCTS
                        </button>

                    </div>

                )}

            </section>



            {/* =================================================
               RECENTLY VIEWED
            ================================================= */}

            {recentProducts.length > 0 && (

                <section className="recent-products">

                    <div className="recent-products-heading">

                        <div>

                            <span>
                                YOUR ACTIVITY
                            </span>

                            <h2>
                                Recently Viewed
                            </h2>

                        </div>

                    </div>


                    <div className="recent-products-list">

                        {recentProducts.map(
                            (productId) => {

                                const product =
                                    products.find(
                                        (item) =>
                                            item.id ===
                                            productId
                                    );


                                if (!product) {
                                    return null;
                                }


                                return (

                                    <button
                                        key={
                                            product.id
                                        }

                                        type="button"

                                        className="recent-product"

                                        onClick={() =>
                                            openProduct(
                                                product
                                            )
                                        }
                                    >

                                        <img
                                            src={
                                                getProductImage(
                                                    product.image
                                                )
                                            }

                                            alt={
                                                product.name
                                            }
                                        />


                                        <div>

                                            <strong>
                                                {
                                                    product.name
                                                }
                                            </strong>

                                            <span>

                                                ₹
                                                {Number(
                                                    product.price
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                            </span>

                                        </div>

                                    </button>

                                );

                            }
                        )}

                    </div>

                </section>

            )}



            {/* =================================================
               PRODUCT POPUP
            ================================================= */}

            {selectedProduct && (

                <div
                    className="home-product-popup-overlay"

                    onClick={
                        closeProduct
                    }
                >


                    <div
                        className="home-product-popup"

                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* CLOSE */}

                        <button
                            type="button"

                            className="home-product-popup-close"

                            aria-label="Close"

                            onClick={
                                closeProduct
                            }
                        >

                            ×

                        </button>



                        {/* POPUP IMAGE */}

                        <div className="home-popup-image">

                            {selectedProduct.badge && (

                                <span className="popup-badge">

                                    {
                                        selectedProduct.badge
                                    }

                                </span>

                            )}


                            <img
                                src={
                                    getProductImage(
                                        selectedProduct.image
                                    )
                                }

                                alt={
                                    selectedProduct.name
                                }
                            />

                        </div>



                        {/* POPUP DETAILS */}

                        <div className="home-popup-details">


                            <span className="popup-category">

                                {
                                    selectedProduct.category
                                }

                            </span>


                            <h2>

                                {
                                    selectedProduct.name
                                }

                            </h2>


                            {/* RATING */}

                            <div className="home-popup-rating">

                                <span>

                                    {"★".repeat(
                                        Number(
                                            selectedProduct.rating
                                        )
                                    )}

                                </span>

                                <small>

                                    {
                                        selectedProduct.rating
                                    }
                                    /5 ·
                                    {" "}
                                    {
                                        selectedProduct.reviews
                                    }
                                    {" "}
                                    reviews

                                </small>

                            </div>


                            {/* PRICE */}

                            <div className="home-popup-price">

                                <strong>

                                    ₹
                                    {Number(
                                        selectedProduct.price
                                    ).toLocaleString(
                                        "en-IN"
                                    )}

                                </strong>


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


                                {getDiscount(
                                    selectedProduct
                                ) > 0 && (

                                    <span>

                                        -
                                        {
                                            getDiscount(
                                                selectedProduct
                                            )
                                        }%

                                    </span>

                                )}

                            </div>


                            {/* DESCRIPTION */}

                            <p className="popup-description">

                                {
                                    selectedProduct.description
                                }

                            </p>


                            {/* STOCK */}

                            <div className="home-popup-stock">

                                <span className="stock-dot"></span>

                                {
                                    selectedProduct.stock >
                                    0
                                        ? `In Stock — ${selectedProduct.stock} available`
                                        : "Out of Stock"
                                }

                            </div>


                            {/* QUANTITY */}

                            {selectedProduct.stock >
                                0 && (

                                <div className="popup-quantity">

                                    <span>
                                        Quantity
                                    </span>


                                    <div className="quantity-controls">

                                        <button
                                            type="button"

                                            onClick={() =>
                                                setQuantity(
                                                    Math.max(
                                                        1,
                                                        quantity -
                                                            1
                                                    )
                                                )
                                            }
                                        >
                                            −
                                        </button>


                                        <strong>
                                            {
                                                quantity
                                            }
                                        </strong>


                                        <button
                                            type="button"

                                            onClick={() =>
                                                setQuantity(
                                                    Math.min(
                                                        selectedProduct.stock,
                                                        quantity +
                                                            1
                                                    )
                                                )
                                            }
                                        >
                                            +
                                        </button>

                                    </div>

                                </div>

                            )}


                            {/* ACTIONS */}

                            <div className="popup-actions">

                                <button
                                    type="button"

                                    className={
                                        `home-popup-cart ${
                                            cartMessage
                                                ? "added"
                                                : ""
                                        }`
                                    }

                                    disabled={
                                        selectedProduct.stock <=
                                        0
                                    }

                                    onClick={
                                        handlePopupCart
                                    }
                                >

                                    {cartMessage
                                        ? cartMessage
                                        : "ADD TO CART"}

                                </button>


                                <button
                                    type="button"

                                    className={
                                        `popup-wishlist-button ${
                                            isWishlisted(
                                                selectedProduct.id
                                            )
                                                ? "active"
                                                : ""
                                        }`
                                    }

                                    onClick={() =>
                                        toggleWishlist(
                                            selectedProduct.id
                                        )
                                    }
                                >

                                    {isWishlisted(
                                        selectedProduct.id
                                    )
                                        ? "♥"
                                        : "♡"}

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </main>

        <BenefitsSection />

        <TestimonialsSection />

        <NewsletterSection />

        <HomeFooter />



        </>

    );

}


/* =========================================================
   REACT ROOT
========================================================= */

const rootElement =
    document.getElementById(
        "products-root"
    );


if (rootElement) {

    const root =
        createRoot(
            rootElement
        );

    root.render(
        <HomeProducts />
    );

}