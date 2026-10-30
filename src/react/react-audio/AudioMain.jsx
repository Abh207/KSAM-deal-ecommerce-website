import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import { createRoot } from "react-dom/client";

import AudioCard from "./AudioCard";
import AudioHero from "./AudioHero";
import AudioBackgroundVideo from "./AudioBackgroundVideo.jsx";
import AudioOfferSection from "./AudioOfferSection.jsx";
import AudioSpotlight from "./AudioSpotlight.jsx";
import AudioFeatures from "./AudioFeatures.jsx";

import audioData from "../../api/audio-products.json";
import { requireAuth } from "../../auth/auth.js";
import Navbar from "../../deals/components/Navbar.jsx";
import { addProductToCart, normalizeCartItem, resolveImagePath } from "../../lib/cartHelper.js";
import {
    isInWishlist,
    toggleWishlist as sharedToggleWishlist,
    subscribeWishlist,
    getWishlist,
    WISHLIST_STORAGE_KEY
} from "../../lib/wishlist.js";

import "./audio.css";

const CART_KEY = "cartProductLS";
const WISHLIST_KEY = "audioWishlist";

const getImagePath = (image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) return image;
    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    let clean = image.replace(/^\/+/, "");
    clean = clean.replace(/\.(png|jpe?g)$/i, ".webp");
    return `${normalizedBase}${clean}`;
};

function AudioMain() {

    const products = audioData.products || [];
    const categories = audioData.categories || [];
    const offers = audioData.offers || [];
    const features = audioData.featureHighlights || [];

    const store = audioData.store || {};

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("featured");
    const [maxPrice, setMaxPrice] = useState(store.maxPrice || 15000);

    const [wishlist, setWishlist] = useState(() => {
        try {
            return getWishlist() || JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || "[]") || [];
        } catch {
            return [];
        }
    });

    const [, setWishlistVersion] = useState(0);

    useEffect(() => {
        const unsub = subscribeWishlist((count, items) => {
            setWishlist(items || getWishlist() || []);
            setWishlistVersion((v) => v + 1);
        });
        return unsub;
    }, []);

    const [cartCount, setCartCount] = useState(0);

    const [visibleProducts, setVisibleProducts] = useState(
        store.defaultVisibleProducts || 8
    );

    const [spotlightIndex, setSpotlightIndex] = useState(0);

    const [offerIndex, setOfferIndex] = useState(0);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [toast, setToast] = useState("");

    const [showTop, setShowTop] = useState(false);


    /* =====================================================
       CART COUNT
    ===================================================== */

    const updateCartCount = () => {

        try {

            const cart =
                JSON.parse(
                    localStorage.getItem(CART_KEY) || "[]"
                );

            const count = cart.reduce(
                (total, item) =>
                    total + Number(item.quantity || 1),
                0
            );

            setCartCount(count);

        } catch {
            setCartCount(0);
        }
    };


    useEffect(() => {

        updateCartCount();

        window.addEventListener(
            "storage",
            updateCartCount
        );

        return () => {
            window.removeEventListener(
                "storage",
                updateCartCount
            );
        };

    }, []);


    const toggleWishlist = async (product) => {
        if (!requireAuth({ type: "wishlist", product })) {
            return;
        }
        await sharedToggleWishlist(product);
        setWishlist(getWishlist() || []);
    };


    /* =====================================================
       ADD TO CART
    ===================================================== */

    const addToCart = (product) => {
        if (!requireAuth({ type: "add_to_cart", product })) {
            return;
        }

        try {
            const normalized = normalizeCartItem(product, 1);
            addProductToCart(product, 1);
            updateCartCount();

            showMessage(
                `${normalized?.name || product.name || "Product"} added to cart`
            );
        } catch {
            showMessage(
                "Unable to add product"
            );
        }
    };


    /* =====================================================
       TOAST
    ===================================================== */

    const showMessage = (message) => {

        setToast(message);

        setTimeout(() => {
            setToast("");
        }, 2200);

    };


    /* =====================================================
       FILTER PRODUCTS
    ===================================================== */

    const filteredProducts = useMemo(() => {

        let result = [...products];

        const searchText =
            search.trim().toLowerCase();

        if (searchText) {

            result = result.filter((product) => {

                return (
                    product.name
                        ?.toLowerCase()
                        .includes(searchText) ||

                    product.brand
                        ?.toLowerCase()
                        .includes(searchText) ||

                    product.category
                        ?.toLowerCase()
                        .includes(searchText)
                );

            });
        }


        if (category !== "All") {

            result = result.filter(
                (product) =>
                    product.category === category
            );

        }


        result = result.filter(
            (product) =>
                Number(product.price) <=
                Number(maxPrice)
        );


        switch (sort) {

            case "price-low":
                result.sort(
                    (a, b) =>
                        a.price - b.price
                );
                break;

            case "price-high":
                result.sort(
                    (a, b) =>
                        b.price - a.price
                );
                break;

            case "rating":
                result.sort(
                    (a, b) =>
                        b.rating - a.rating
                );
                break;

            case "discount":
                result.sort(
                    (a, b) =>
                        b.discount - a.discount
                );
                break;

            case "newest":
                result.sort(
                    (a, b) =>
                        Number(b.newArrival) -
                        Number(a.newArrival)
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
        category,
        maxPrice,
        sort
    ]);


    /* =====================================================
       SPOTLIGHT
    ===================================================== */

    const spotlightProducts =
        products.filter(
            (product) =>
                product.featured
        );

    const spotlightProduct =
        spotlightProducts[
            spotlightIndex %
            Math.max(spotlightProducts.length, 1)
        ] || products[0];


    useEffect(() => {

        if (!spotlightProducts.length) return;

        const timer =
            setInterval(() => {

                setSpotlightIndex(
                    (current) =>
                        current + 1
                );

            }, 6000);

        return () => clearInterval(timer);

    }, [spotlightProducts.length]);


    /* =====================================================
       OFFER ROTATION
    ===================================================== */

    const currentOffer =
        offers[
            offerIndex %
            Math.max(offers.length, 1)
        ];


    useEffect(() => {

        if (!offers.length) return;

        const timer =
            setInterval(() => {

                setOfferIndex(
                    (current) =>
                        (current + 1) %
                        offers.length
                );

            }, 12000);

        return () => clearInterval(timer);

    }, [offers.length]);


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    useEffect(() => {

        const handleScroll = () => {

            setShowTop(
                window.scrollY > 600
            );

        };

        window.addEventListener(
            "scroll",
            handleScroll
        );

        return () =>
            window.removeEventListener(
                "scroll",
                handleScroll
            );

    }, []);


    const scrollToProducts = () => {

        document
            .getElementById("audio-products")
            ?.scrollIntoView({
                behavior: "smooth"
            });

    };


    const resetFilters = () => {

        setSearch("");
        setCategory("All");
        setSort("featured");
        setMaxPrice(
            store.maxPrice || 15000
        );
        setVisibleProducts(
            store.defaultVisibleProducts || 8
        );

    };


    return (

        <div className="audio-page">

            {/* Shared Deals-style Navbar */}
            <Navbar />

            <AudioBackgroundVideo />

            {/* =================================================
                ANNOUNCEMENT BAR
            ================================================= */}

            <div className="audio-announcement">

                <div>
                    FREE DELIVERY ABOVE ₹999
                </div>

                <span>•</span>

                <div>
                    30 DAY EASY RETURNS
                </div>

                <span>•</span>

                <div>
                    SECURE CHECKOUT
                </div>

                <span>•</span>

                <div>
                    NEW AUDIO COLLECTION
                </div>

                <span>•</span>

                <div>
                    FREE DELIVERY ABOVE ₹999
                </div>

            </div>





            {/* =================================================
                HERO
            ================================================= */}

            <AudioHero
                hero={audioData.hero}
                onExplore={scrollToProducts}
            />


            {/* =================================================
                MOVING PRODUCT STRIP
            ================================================= */}

            <section className="audio-moving-strip">

                <div className="audio-moving-track">

                    {[...products, ...products].map(
                        (product, index) => (

                            <div
                                className="audio-moving-item"
                                key={`${product.id}-${index}`}
                            >

                                <img
                                    src={getImagePath(
                                        product.image
                                    )}
                                    alt=""
                                />

                                <div>

                                    <strong>
                                        {product.name}
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

                            </div>

                        )
                    )}

                </div>

            </section>


            {/* =================================================
                CATEGORIES
            ================================================= */}

            <section
                className="audio-categories"
                id="audio-categories"
            >

                <div className="audio-section-heading">

                    <span>
                        EXPLORE AUDIO
                    </span>

                    <h2>
                        Find your sound.
                    </h2>

                    <p>
                        Choose the audio experience
                        that matches your lifestyle.
                    </p>

                </div>


                <div className="audio-category-list">

                    <button
                        className={
                            category === "All"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setCategory("All")
                        }
                    >
                        <i className="fa-solid fa-layer-group"></i>
                        All Audio
                        <small>
                            {products.length}
                        </small>
                    </button>


                    {categories.map(
                        (item) => {

                            const count =
                                products.filter(
                                    (product) =>
                                        product.category ===
                                        item.name
                                ).length;

                            return (

                                <button
                                    key={item.id}
                                    className={
                                        category ===
                                        item.name
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setCategory(
                                            item.name
                                        )
                                    }
                                >

                                    <i
                                        className={
                                            item.icon
                                        }
                                    ></i>

                                    {item.name}

                                    <small>
                                        {count}
                                    </small>

                                </button>

                            );

                        }
                    )}

                </div>

            </section>


            {/* =================================================
                OFFER
            ================================================= */}

            {currentOffer && (
                <AudioOfferSection
                    currentOffer={currentOffer}
                    products={products}
                    scrollToProducts={scrollToProducts}
                    getImagePath={getImagePath}
                />
            )}

            {/* =================================================
                SPOTLIGHT
            ================================================= */}

            {spotlightProduct && (
                <AudioSpotlight
                    spotlightProduct={spotlightProduct}
                    getImagePath={getImagePath}
                    addToCart={addToCart}
                    toggleWishlist={toggleWishlist}
                />
            )}

            {/* =================================================
                FEATURES
            ================================================= */}

            <AudioFeatures features={features} />

            {/* =================================================
                PRODUCTS
            ================================================= */}

            <section
                className="audio-products"
                id="audio-products"
            >

                <div className="audio-products-heading">

                    <div>

                        <span>
                            SHOP AUDIO
                        </span>

                        <h2>
                            Find your next sound.
                        </h2>

                        <p>
                            {filteredProducts.length}
                            {" "}products
                        </p>

                    </div>


                    <div className="audio-sort">

                        <select
                            value={sort}
                            onChange={(e) =>
                                setSort(
                                    e.target.value
                                )
                            }
                        >

                            <option value="featured">
                                Featured
                            </option>

                            <option value="newest">
                                Newest
                            </option>

                            <option value="rating">
                                Top Rated
                            </option>

                            <option value="discount">
                                Biggest Discount
                            </option>

                            <option value="price-low">
                                Price Low
                            </option>

                            <option value="price-high">
                                Price High
                            </option>

                        </select>

                    </div>

                </div>


                <div className="audio-filter-row">

                    <div className="audio-main-search">

                        <i className="fa-solid fa-magnifying-glass"></i>

                        <input
                            type="text"
                            placeholder="Search earbuds, headphones..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <label>

                        Category

                        <select
                            value={category}
                            onChange={(e) =>
                                setCategory(
                                    e.target.value
                                )
                            }
                        >

                            <option value="All">
                                All
                            </option>

                            {categories.map(
                                (item) => (
                                    <option
                                        key={item.id}
                                        value={item.name}
                                    >
                                        {item.name}
                                    </option>
                                )
                            )}

                        </select>

                    </label>


                    <label className="audio-price-filter">

                        Maximum price

                        <strong>
                            ₹
                            {Number(
                                maxPrice
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </strong>

                        <input
                            type="range"
                            min="500"
                            max={
                                store.maxPrice ||
                                15000
                            }
                            step="100"
                            value={maxPrice}
                            onChange={(e) =>
                                setMaxPrice(
                                    Number(
                                        e.target.value
                                    )
                                )
                            }
                        />

                    </label>


                    <button
                        className="audio-reset"
                        onClick={resetFilters}
                    >
                        Reset
                    </button>

                </div>


                <div className="audio-product-grid">

                    {filteredProducts
                        .slice(
                            0,
                            visibleProducts
                        )
                        .map((product) => (

                            <AudioCard
                                key={product.id}
                                product={product}
                                isWishlisted={
                                    isInWishlist(
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

                        ))}

                </div>


                {visibleProducts <
                    filteredProducts.length && (

                    <div className="audio-load-more">

                        <button
                            onClick={() =>
                                setVisibleProducts(
                                    (value) =>
                                        value +
                                        (
                                            store.productsPerLoad ||
                                            4
                                        )
                                )
                            }
                        >
                            Load more products
                            <i className="fa-solid fa-arrow-down"></i>
                        </button>

                    </div>

                )}

            </section>


            {/* =================================================
    FOOTER
================================================= */}

{toast && (

                <div className="audio-toast">

                    <i className="fa-solid fa-check"></i>

                    {toast}

                </div>

            )}


            {/* =================================================
                TOP BUTTON
            ================================================= */}

            {showTop && (

                <button
                    className="audio-top-button"
                    onClick={() =>
                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        })
                    }
                >
                    ↑
                </button>

            )}

        </div>

    );
}


class AudioErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("AudioMain Error Boundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "32px 20px",
                    background: "#080e0c",
                    color: "#ffffff",
                    fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "52px", marginBottom: "16px" }}>⚠️</div>
                    <h1 style={{ fontSize: "26px", fontWeight: "800", margin: "0 0 10px", color: "#ffffff" }}>
                        Something went wrong
                    </h1>
                    <p style={{ color: "rgba(255, 255, 255, 0.72)", maxWidth: "460px", margin: "0 0 24px", lineHeight: "1.6", fontSize: "15px" }}>
                        We encountered an unexpected error while loading the audio experience. Please reload the page to try again.
                    </p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        style={{
                            padding: "12px 30px",
                            borderRadius: "9999px",
                            border: "none",
                            background: "linear-gradient(135deg, #1de9b6 0%, #16c79a 100%)",
                            color: "#05130e",
                            fontWeight: "800",
                            fontSize: "15px",
                            cursor: "pointer",
                            boxShadow: "0 4px 18px rgba(29, 233, 182, 0.4)"
                        }}
                    >
                        Reload page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const rootElement = document.getElementById("audio-root");

if (rootElement) {
    createRoot(rootElement).render(
        <AudioErrorBoundary>
            <AudioMain />
        </AudioErrorBoundary>
    );
}