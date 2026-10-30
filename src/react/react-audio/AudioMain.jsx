import React, {
    useEffect,
    useMemo,
    useState,
    useCallback
} from "react";
import { createRoot } from "react-dom/client";

import AudioCard from "./AudioCard";
import AudioHero from "./AudioHero";
import AudioBackgroundVideo from "./AudioBackgroundVideo.jsx";
import AudioCategorySection from "./AudioCategorySection.jsx";
import AudioOfferSection from "./AudioOfferSection.jsx";
import AudioSpotlight from "./AudioSpotlight.jsx";
import AudioFeatures from "./AudioFeatures.jsx";

import audioData from "../../api/audio-products.json";
import { requireAuth } from "../../auth/auth.js";
import Navbar from "../../deals/components/Navbar.jsx";
import { addProductToCart, normalizeCartItem } from "../../lib/cartHelper.js";
import {
    isInWishlist,
    toggleWishlist as sharedToggleWishlist,
    subscribeWishlist,
    getWishlist,
    WISHLIST_STORAGE_KEY
} from "../../lib/wishlist.js";

import "./audio.css";

const CART_KEY = "cartProductLS";

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

    // Category is now the sole filter
    const [category, setCategory] = useState("All");

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
            const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
            const count = cart.reduce(
                (total, item) => total + Number(item.quantity || 1),
                0
            );
            setCartCount(count);
        } catch {
            setCartCount(0);
        }
    };

    useEffect(() => {
        updateCartCount();
        window.addEventListener("storage", updateCartCount);
        return () => {
            window.removeEventListener("storage", updateCartCount);
        };
    }, []);

    /* =====================================================
       WISHLIST
    ===================================================== */
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
            showMessage("Unable to add product");
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
       FILTER PRODUCTS (Category tile is the sole filter)
    ===================================================== */
    const filteredProducts = useMemo(() => {
        if (category === "All") {
            return products;
        }
        return products.filter((p) => p.category === category);
    }, [products, category]);

    /* =====================================================
       SPOTLIGHT
    ===================================================== */
    const spotlightProducts = products.filter((product) => product.featured);
    const spotlightProduct =
        spotlightProducts[
            spotlightIndex % Math.max(spotlightProducts.length, 1)
        ] || products[0];

    useEffect(() => {
        if (!spotlightProducts.length) return;
        const timer = setInterval(() => {
            setSpotlightIndex((current) => current + 1);
        }, 6000);
        return () => clearInterval(timer);
    }, [spotlightProducts.length]);

    /* =====================================================
       OFFER ROTATION
    ===================================================== */
    const currentOffer = offers[offerIndex % Math.max(offers.length, 1)];

    useEffect(() => {
        if (!offers.length) return;
        const timer = setInterval(() => {
            setOfferIndex((current) => (current + 1) % offers.length);
        }, 12000);
        return () => clearInterval(timer);
    }, [offers.length]);

    /* =====================================================
       BACK TO TOP
    ===================================================== */
    useEffect(() => {
        const handleScroll = () => {
            setShowTop(window.scrollY > 600);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    /* =====================================================
       SCROLL TO PRODUCTS
    ===================================================== */
    const scrollToProducts = useCallback(() => {
        document.getElementById("audio-products")?.scrollIntoView({
            behavior: "smooth"
        });
    }, []);

    const handleSelectCategory = (catName) => {
        setCategory(catName);
        scrollToProducts();
    };

    return (
        <div className="audio-page">
            {/* Shared Deals-style Navbar (keeps header search & nav intact) */}
            <Navbar searchPlaceholder="Search earbuds, headphones, speakers..." />

            {/* Moving Video Background behind all content */}
            <AudioBackgroundVideo />

            {/* =================================================
                ANNOUNCEMENT BAR
            ================================================= */}
            <div className="audio-announcement" aria-label="Audio Announcements">
                <div>FREE DELIVERY ABOVE ₹999</div>
                <span aria-hidden="true">•</span>
                <div>30 DAY EASY RETURNS</div>
                <span aria-hidden="true">•</span>
                <div>SECURE CHECKOUT</div>
                <span aria-hidden="true">•</span>
                <div>NEW AUDIO COLLECTION</div>
                <span aria-hidden="true">•</span>
                <div>FREE DELIVERY ABOVE ₹999</div>
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
            <section className="audio-moving-strip" aria-label="Featured Audio Highlights">
                <div className="audio-moving-track">
                    {[...products, ...products].map((product, index) => (
                        <div
                            className="audio-moving-item"
                            key={`${product.id}-${index}`}
                        >
                            <img
                                src={getImagePath(product.image)}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                width="56"
                                height="56"
                            />
                            <div>
                                <strong>{product.name}</strong>
                                <span>
                                    ₹{Number(product.price).toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* =================================================
                CATEGORIES (Task 3 Redesigned Tiles)
            ================================================= */}
            <AudioCategorySection
                categories={categories}
                products={products}
                selectedCategory={category}
                onSelectCategory={handleSelectCategory}
            />

            {/* =================================================
                OFFER (Task 2 Redesigned Flash Sale Banner)
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
                PRODUCTS GRID (All products rendered at once, no toolbar/pagination)
            ================================================= */}
            <section
                className="audio-products"
                id="audio-products"
                aria-label="All Audio Products"
            >
                {/* Screen reader live update when category filter changes */}
                <div className="sr-only" aria-live="polite" aria-atomic="true">
                    Showing {filteredProducts.length} {category === "All" ? "" : category} products
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="audio-product-grid" key={category}>
                        {filteredProducts.map((product) => (
                            <AudioCard
                                key={product.id}
                                product={product}
                                isWishlisted={isInWishlist(product.id)}
                                onWishlist={toggleWishlist}
                                onAddToCart={addToCart}
                                onViewProduct={setSelectedProduct}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="audio-empty-state">
                        <i className="fa-solid fa-headphones-simple"></i>
                        <h3>No products found</h3>
                        <p>
                            There are currently no products available in &quot;{category}&quot;.
                        </p>
                        <button
                            type="button"
                            className="audio-lime-button"
                            onClick={() => setCategory("All")}
                        >
                            View All Audio ({products.length})
                        </button>
                    </div>
                )}
            </section>

            {/* =================================================
                TOAST
            ================================================= */}
            {toast && (
                <div className="audio-toast" role="status" aria-live="polite">
                    <i className="fa-solid fa-check"></i>
                    {toast}
                </div>
            )}

            {/* =================================================
                BACK TO TOP BUTTON
            ================================================= */}
            {showTop && (
                <button
                    type="button"
                    className="audio-top-button"
                    aria-label="Back to top of page"
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
