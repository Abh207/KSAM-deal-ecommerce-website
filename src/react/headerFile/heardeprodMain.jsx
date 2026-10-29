import React, { useState, useEffect, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import Navbar from "../../deals/components/Navbar.jsx";
import Footer from "../../deals/components/Footer.jsx";
import CategorySection from "./CategorySection.jsx";
import ScrollProgress from "../../deals/components/ScrollProgress.jsx";
import rawProductsData from "../../api/products.json";
import { addProductToCart, resolveImagePath } from "../../lib/cartHelper.js";
import { isInWishlist, toggleWishlist as sharedToggleWishlist, subscribeWishlist } from "../../lib/wishlist.js";
import "./homeProducts.css";

/* Helper to resolve product image paths from public/ directory */
const getProductImage = (image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) {
        return image;
    }
    const clean = image.replace(/^\.?\/?(public\/)?/, "");
    const base = import.meta.env.BASE_URL || "/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    return `${normalizedBase}${clean}`;
};

function HeardeprodPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchText, setSearchText] = useState("");
    const [sortOption, setSortOption] = useState("Featured");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [wishlist, setWishlist] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    // Subscribe to wishlist updates
    useEffect(() => {
        const unsub = subscribeWishlist(() => {
            setWishlist(Array.from(document.querySelectorAll ? [] : []));
        });
        return () => unsub();
    }, []);

    // Filter unique products from products.json
    const products = useMemo(() => {
        const seen = new Set();
        return rawProductsData.filter((p) => {
            const key = `${p.id}-${p.name}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, []);

    const categories = useMemo(() => {
        const list = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];
        return list;
    }, [products]);

    // Filtered & sorted products for catalog
    const filteredProducts = useMemo(() => {
        let result = products.filter((p) => {
            const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
            const matchesSearch = !searchText.trim() || 
                p.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                p.category?.toLowerCase().includes(searchText.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchText.toLowerCase());
            return matchesCat && matchesSearch;
        });

        if (sortOption === "Price Low") {
            result.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortOption === "Price High") {
            result.sort((a, b) => Number(b.price) - Number(a.price));
        } else if (sortOption === "Rating") {
            result.sort((a, b) => (Number(b.rating) || 5) - (Number(a.rating) || 5));
        } else if (sortOption === "Discount") {
            result.sort((a, b) => {
                const discA = a.Actualprice ? Math.round(((a.Actualprice - a.price) / a.Actualprice) * 100) : 0;
                const discB = b.Actualprice ? Math.round(((b.Actualprice - b.price) / b.Actualprice) * 100) : 0;
                return discB - discA;
            });
        }
        return result;
    }, [products, selectedCategory, searchText, sortOption]);

    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        try {
            addProductToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                quantity: 1
            });
            setToastMessage(`Added ${product.name} to cart!`);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2500);
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleWishlist = (e, productId) => {
        e.stopPropagation();
        sharedToggleWishlist(productId);
        setWishlist((prev) => 
            prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
        );
    };

    return (
        <>
            <ScrollProgress />
            <Navbar />

            <main className="home-products-app" style={{ paddingTop: "76px" }}>
                {/* 1. CATEGORY SHOWCASE SECTION WITH GADGETS ACTIVE */}
                <CategorySection
                    initialCategory="gadgets"
                    onViewAllClick={() => {
                        document.querySelector(".gadgets-catalog-anchor")?.scrollIntoView({ behavior: "smooth" });
                    }}
                />

                <div className="gadgets-catalog-anchor" style={{ height: "20px" }}></div>

                {/* 2. GADGETS SECTION CONTROLS */}
                <div style={{ maxWidth: "1450px", margin: "40px auto 20px", padding: "0 10px" }}>
                    <div style={{ textAlign: "center", marginBottom: "30px" }}>
                        <span style={{
                            display: "inline-block",
                            padding: "6px 16px",
                            borderRadius: "999px",
                            background: "rgba(20, 240, 192, 0.1)",
                            border: "1px solid rgba(20, 240, 192, 0.3)",
                            color: "#14f0c0",
                            fontSize: "12px",
                            fontWeight: 700,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            marginBottom: "12px"
                        }}>
                            GADGETS CATALOG
                        </span>
                        <h2 style={{
                            fontSize: "clamp(26px, 4vw, 42px)",
                            fontWeight: 800,
                            color: "#ffffff",
                            margin: "0 0 10px",
                            letterSpacing: "-0.02em"
                        }}>
                            Trending <span style={{
                                background: "linear-gradient(135deg, #34f5a1, #14e6c8)",
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}>Gadgets & Tech</span> Deals
                        </h2>
                        <p style={{ color: "#94a3b8", fontSize: "15px", maxWidth: "600px", margin: "0 auto" }}>
                            Discover high-performance computers, smartphones, wireless audio, and cutting-edge accessories.
                        </p>
                    </div>

                    {/* SEARCH CONTROLS */}
                    <section className="products-controls">
                        <div className="products-search-box">
                            <span className="search-icon">⌕</span>
                            <input
                                type="search"
                                value={searchText}
                                placeholder="Search gadgets, computers, audio..."
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                            {searchText && (
                                <button className="clear-search" type="button" onClick={() => setSearchText("")}>×</button>
                            )}
                        </div>
                    </section>

                    {/* CATEGORY FILTER & SORT ROW */}
                    <section className="products-filter-area">
                        <div className="products-category-list">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={selectedCategory === cat ? "active" : ""}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="products-sort">
                            <label>Sort by:</label>
                            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                                <option value="Featured">Featured</option>
                                <option value="Price Low">Price: Low → High</option>
                                <option value="Price High">Price: High → Low</option>
                                <option value="Rating">Highest Rated</option>
                                <option value="Discount">Biggest Discount</option>
                            </select>
                        </div>
                    </section>

                    {/* RESULT COUNT */}
                    <div className="products-result-bar">
                        <div>
                            <span>Showing</span>
                            <strong>{filteredProducts.length}</strong>
                            <span>gadgets</span>
                        </div>
                        {selectedCategory !== "All" && (
                            <button type="button" onClick={() => setSelectedCategory("All")}>
                                Clear category ×
                            </button>
                        )}
                    </div>
                </div>

                {/* 3. PRODUCT GRID */}
                <section className="home-products-grid">
                    {filteredProducts.map((product, index) => {
                        const discount = product.Actualprice && product.Actualprice > product.price
                            ? Math.round(((product.Actualprice - product.price) / product.Actualprice) * 100)
                            : 0;

                        return (
                            <article
                                key={product.id}
                                className="home-product-card product-visible"
                                style={{ "--card-index": index }}
                                onClick={() => setSelectedProduct(product)}
                            >
                                <div className="home-product-image">
                                    <span className="home-product-badge badge-best-seller">
                                        GADGET
                                    </span>
                                    {discount > 0 && (
                                        <span className="product-discount">
                                            -{discount}%
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        className={`home-product-wishlist ${isInWishlist(product.id) ? "wishlisted" : ""}`}
                                        aria-label="Wishlist"
                                        onClick={(e) => handleToggleWishlist(e, product.id)}
                                    >
                                        {isInWishlist(product.id) ? "♥" : "♡"}
                                    </button>

                                    <img
                                        src={getProductImage(product.image)}
                                        alt={product.name}
                                        loading={index < 4 ? "eager" : "lazy"}
                                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                                    />
                                </div>

                                <div className="home-product-info">
                                    <div className="product-category-row">
                                        <span>{product.category || "Gadget"}</span>
                                    </div>

                                    <h2>{product.name}</h2>

                                    <div className="home-product-rating">
                                        <span className="rating-stars">★★★★★</span>
                                        <span className="rating-number">4.9</span>
                                        <small>(128)</small>
                                    </div>

                                    <div className="home-product-price">
                                        <strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>
                                        {product.Actualprice && (
                                            <del>₹{Number(product.Actualprice).toLocaleString("en-IN")}</del>
                                        )}
                                    </div>

                                    <div className="product-stock">
                                        <span className="stock-dot"></span>
                                        {product.stock ? `${product.stock} in stock` : "In stock"}
                                    </div>

                                    <button
                                        type="button"
                                        className="home-product-view"
                                        onClick={(e) => handleAddToCart(e, product)}
                                    >
                                        <span>ADD TO CART</span>
                                        <strong>+</strong>
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </section>

                {/* 4. WHY CHOOSE KSAMDEAL FEATURES */}
                <section style={{ maxWidth: "1400px", margin: "70px auto 40px", padding: "0 20px" }}>
                    <div style={{
                        borderRadius: "28px",
                        background: "linear-gradient(135deg, rgba(20, 240, 192, 0.04), rgba(16, 185, 129, 0.02))",
                        border: "1px solid rgba(20, 230, 170, 0.2)",
                        padding: "clamp(24px, 4vw, 44px)"
                    }}>
                        <div style={{ textAlign: "center", marginBottom: "36px" }}>
                            <h3 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>
                                Why Choose KSAM Deal Gadgets
                            </h3>
                            <p style={{ color: "#94a3b8", fontSize: "15px" }}>
                                Smart gadgets and verified tech delivered with industry-leading support
                            </p>
                        </div>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: "20px"
                        }}>
                            <div style={{ padding: "20px", borderRadius: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ fontSize: "24px", color: "#14f0c0", marginBottom: "10px" }}>⚡</div>
                                <h4 style={{ color: "#fff", fontSize: "17px", margin: "0 0 6px" }}>Fast Delivery</h4>
                                <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>Express dispatch within 24 hours on all gadget orders.</p>
                            </div>
                            <div style={{ padding: "20px", borderRadius: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ fontSize: "24px", color: "#14f0c0", marginBottom: "10px" }}>🛡️</div>
                                <h4 style={{ color: "#fff", fontSize: "17px", margin: "0 0 6px" }}>100% Genuine</h4>
                                <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>Every gadget undergoes strict quality inspection and genuine warranty.</p>
                            </div>
                            <div style={{ padding: "20px", borderRadius: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ fontSize: "24px", color: "#14f0c0", marginBottom: "10px" }}>🔄</div>
                                <h4 style={{ color: "#fff", fontSize: "17px", margin: "0 0 6px" }}>30-Day Returns</h4>
                                <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>Hassle-free 30-day return and instant money-back guarantee.</p>
                            </div>
                            <div style={{ padding: "20px", borderRadius: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ fontSize: "24px", color: "#14f0c0", marginBottom: "10px" }}>💬</div>
                                <h4 style={{ color: "#fff", fontSize: "17px", margin: "0 0 6px" }}>24/7 Expert Support</h4>
                                <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>Live chat support ready to guide you to the right gadgets.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* QUICK VIEW POPUP MODAL */}
            {selectedProduct && (
                <div className="home-popup-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="home-product-popup" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="home-product-popup-close"
                            onClick={() => setSelectedProduct(null)}
                        >
                            ×
                        </button>
                        <div className="home-popup-main">
                            <div className="home-popup-image">
                                <img
                                    src={getProductImage(selectedProduct.image)}
                                    alt={selectedProduct.name}
                                />
                            </div>
                            <div className="home-popup-details">
                                <span className="product-category-row">
                                    <span>{selectedProduct.category}</span>
                                </span>
                                <h2>{selectedProduct.name}</h2>
                                <p style={{ color: "#aaa", fontSize: "14px", lineHeight: "1.6" }}>
                                    {selectedProduct.description || "High-performance tech gadget with advanced features and verified build quality."}
                                </p>
                                <div className="home-product-price" style={{ margin: "16px 0" }}>
                                    <strong>₹{Number(selectedProduct.price).toLocaleString("en-IN")}</strong>
                                    {selectedProduct.Actualprice && (
                                        <del>₹{Number(selectedProduct.Actualprice).toLocaleString("en-IN")}</del>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="home-product-view"
                                    style={{ height: "46px", background: "#d4a853", color: "#000", fontWeight: 800 }}
                                    onClick={(e) => {
                                        handleAddToCart(e, selectedProduct);
                                        setSelectedProduct(null);
                                    }}
                                >
                                    <span>ADD TO CART NOW</span>
                                    <strong>→</strong>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST NOTIFICATION */}
            {showToast && (
                <div style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    zIndex: 9999,
                    background: "#030c0a",
                    border: "1px solid #14f0c0",
                    color: "#fff",
                    padding: "14px 22px",
                    borderRadius: "14px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(20,240,192,0.3)",
                    fontWeight: 600,
                    fontSize: "14px",
                    animation: "csFadeIn 0.3s ease"
                }}>
                    ✓ {toastMessage}
                </div>
            )}

            <Footer />
        </>
    );
}

const rootEl = document.getElementById("heardeprod-root");
if (rootEl) {
    createRoot(rootEl).render(
        <React.StrictMode>
            <HeardeprodPage />
        </React.StrictMode>
    );
}

export default HeardeprodPage;
