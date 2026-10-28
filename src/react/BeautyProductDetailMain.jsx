import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  Star,
  Heart,
  ArrowLeft,
  Check,
  AlertCircle,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowRight
} from "lucide-react";

import Navbar from "../deals/components/Navbar.jsx";
import {
  findBeautyProduct,
  getRelatedBeautyProducts,
  beautyProducts
} from "../data/beautyData.js";
import {
  addProductToCart,
  formatPrice,
  resolveImagePath,
  DEFAULT_PLACEHOLDER_IMAGE,
  buildProductUid
} from "../lib/cartHelper.js";
import {
  isInWishlist,
  toggleWishlist,
  subscribeWishlist
} from "../lib/wishlist.js";

import "./productDetail.css";

function BeautyProductDetailPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);

  const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const homeUrl = `${normalizedBase}`;
  const beautyUrl = `${normalizedBase}beauty.html`;

  const loadProductFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get("uid");
    const id = params.get("id");
    const category = params.get("category");

    let item = null;
    if (uid || id || category) {
      item = findBeautyProduct({ uid, id, category });
    } else {
      item = beautyProducts[0];
    }

    if (item) {
      setProduct(item);
      setActiveImage(resolveImagePath(item.image));
      setIsWishlisted(isInWishlist(item.uid || item.id));
      setQuantity(1);

      // Related 4 products from same category first
      const related = getRelatedBeautyProducts(item, 4);
      setRelatedProducts(related);
    } else {
      setProduct(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    loadProductFromUrl();

    const handlePopState = () => {
      window.scrollTo({ top: 0, behavior: "instant" });
      loadProductFromUrl();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Sync wishlist status
  useEffect(() => {
    if (!product) return;
    const unsub = subscribeWishlist(() => {
      setIsWishlisted(isInWishlist(product.uid || product.id));
    });
    return unsub;
  }, [product]);

  // Dynamic SEO title, meta description, and Product JSON-LD
  useEffect(() => {
    if (!product) return;

    // 1. Dynamic Title
    document.title = `${product.name} | Buy Online at KSAM Deal`;

    // 2. Dynamic Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        product.description || `Buy ${product.name} at discounted price on KSAM Deal.`
      );
    }

    // 3. Dynamic Product JSON-LD
    let script = document.getElementById("product-jsonld");
    if (!script) {
      script = document.createElement("script");
      script.id = "product-jsonld";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    const priceNum = typeof product.price === "number"
      ? product.price
      : parseFloat(String(product.price).replace(/[^0-9.]/g, "")) || 0;

    const fullImageUrl = product.image
      ? (product.image.startsWith("http")
          ? product.image
          : `${window.location.origin}${resolveImagePath(product.image)}`)
      : "https://abh207.github.io/KSAM-deal-ecommerce-website/assets/images/logo-512.png";

    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": fullImageUrl,
      "description": product.description || `Buy ${product.name} on KSAM Deal.`,
      "brand": {
        "@type": "Brand",
        "name": product.brand || "KSAM Deal"
      },
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "INR",
        "price": priceNum,
        "availability": "https://schema.org/InStock"
      }
    };

    script.textContent = JSON.stringify(jsonLdData);
  }, [product]);

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product) return;
    toggleWishlist(product);
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!product) return;

    addProductToCart(product, quantity);
    window.dispatchEvent(new Event("cartUpdated"));

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const handleOpenRelated = (e, relProd) => {
    e.preventDefault();
    const id = relProd.id !== undefined && relProd.id !== null ? relProd.id : "";
    const category = relProd.category || "Beauty";
    const uid = relProd.uid || buildProductUid(category, id);
    const nextUrl = `${normalizedBase}beauty-product.html?id=${encodeURIComponent(id)}&category=${encodeURIComponent(category)}&uid=${encodeURIComponent(uid)}`;
    
    window.history.pushState({}, "", nextUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
    loadProductFromUrl();
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <main className="product-detail-main">
          <div style={{ textAlign: "center", padding: "100px 20px", color: "#16a34a", fontSize: "18px", fontWeight: 600 }}>
            Loading beauty product details...
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <main className="product-detail-main">
          <div className="product-detail-notfound">
            <div className="product-detail-notfound-icon">
              <AlertCircle size={36} />
            </div>
            <h1>Product Not Found</h1>
            <p>
              The beauty product you are looking for doesn't exist, has an invalid ID or category, or has been removed from the catalog.
            </p>
            <a href={beautyUrl} className="product-detail-notfound-btn">
              <ArrowLeft size={16} />
              <span>Back to Beauty</span>
            </a>
          </div>
        </main>
      </div>
    );
  }

  const rawOldPrice =
    product.originalPrice ||
    product.oldPrice ||
    product.actualPrice ||
    product.mrp ||
    0;

  const hasDiscount = Boolean(rawOldPrice && rawOldPrice > product.price);
  const discountPct = hasDiscount
    ? Math.round(((rawOldPrice - product.price) / rawOldPrice) * 100)
    : 0;

  const ratingVal = product.rating ? Number(product.rating) : 4.8;
  const reviewsCount = product.reviewsCount || 59;
  const maxStock = Number(product.stock) || 25;

  // Specifications Table Rows
  const specs = [
    { label: "Brand", value: product.brand || "KSAM Beauty" },
    { label: "Category", value: product.category || "Beauty" },
    { label: "Model / SKU", value: product.specs?.sku || `KSAM-BEAUTY-${product.id}` },
    { label: "Size / Volume", value: product.specs?.size || "Standard Size" },
    { label: "Skin Type / Finish", value: product.specs?.skinType || "Suitable for All Skin Types" },
    { label: "Shelf Life", value: product.specs?.shelfLife || "24 Months from Mfd." },
    { label: "Availability", value: `In Stock - ${maxStock} items available` }
  ];

  const mainImgSrc = resolveImagePath(product.image);
  const thumbnailList =
    Array.isArray(product.images) && product.images.length > 1
      ? product.images.map(resolveImagePath)
      : [mainImgSrc];

  return (
    <div className="product-detail-page">
      {/* Shared KSAM Navbar */}
      <Navbar />

      <main className="product-detail-main">
        {/* 1. Breadcrumb: Home / Beauty / <Product name> */}
        <nav className="product-detail-breadcrumb" aria-label="Breadcrumb">
          <a href={homeUrl}>Home</a>
          <span className="sep">/</span>
          <a href={beautyUrl}>Beauty</a>
          <span className="sep">/</span>
          <span className="current">{product.name}</span>
        </nav>

        {/* 2. Two-Column Section */}
        <div className="product-detail-grid">
          {/* LEFT: large product image card with discount badge, wishlist heart, thumbnail strip */}
          <div className="product-detail-media-wrap">
            <div className="product-detail-media">
              {discountPct > 0 && (
                <span className="product-detail-discount-badge">
                  -{discountPct}%
                </span>
              )}

              <button
                type="button"
                className="product-detail-heart-btn"
                onClick={handleToggleWishlist}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  size={20}
                  strokeWidth={2}
                  fill={isWishlisted ? "#22c55e" : "none"}
                  color={isWishlisted ? "#22c55e" : "#0f172a"}
                />
              </button>

              <img
                src={activeImage || mainImgSrc}
                alt={product.name || "Beauty Product"}
                className="product-detail-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE;
                }}
              />
            </div>

            {/* Thumbnail Strip */}
            {thumbnailList.length > 0 && (
              <div className="product-detail-thumbs">
                {thumbnailList.map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`product-detail-thumb-btn${activeImage === thumb ? " is-active" : ""}`}
                    onClick={() => setActiveImage(thumb)}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img
                      src={thumb}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Category, Name, Brand, Rating, Price, Description, Features, Specs, Info, Stepper, Add to Cart, Back link */}
          <div className="product-detail-info">
            <span className="product-detail-cat-pill">
              {product.category || "Beauty"}
            </span>

            <h1 className="product-detail-title">
              {product.name}
            </h1>

            <p className="product-detail-brand">
              Brand: <span>{product.brand}</span>
            </p>

            {/* Star Rating + Review count */}
            <div className="product-detail-rating-row">
              <div className="product-detail-stars" aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.round(ratingVal) ? "#fbbf24" : "none"}
                    stroke="#fbbf24"
                  />
                ))}
              </div>
              <span className="product-detail-rating-num">{ratingVal.toFixed(1)}</span>
              <span className="product-detail-rating-count">
                ({reviewsCount} verified customer reviews)
              </span>
            </div>

            {/* Price Box */}
            <div className="product-detail-price-box">
              <span className="product-detail-current-price">
                {formatPrice(product.price)}
              </span>
              {hasDiscount ? (
                <span className="product-detail-old-price">
                  {formatPrice(rawOldPrice)}
                </span>
              ) : null}
              {discountPct > 0 ? (
                <span className="product-detail-save-badge">
                  Save {discountPct}%
                </span>
              ) : null}
            </div>

            {/* Description */}
            <div className="product-detail-desc-block">
              <h2 className="product-detail-section-title">Description</h2>
              <p className="product-detail-desc">{product.description}</p>
            </div>

            {/* Key Features (4-5 checklist items with green check icons) */}
            <div className="product-detail-features-block">
              <h2 className="product-detail-section-title">Key Features</h2>
              <ul className="product-detail-features-list">
                {product.features?.map((feat, idx) => (
                  <li key={idx}>
                    <Check size={16} className="product-detail-feat-check" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specifications Striped Table */}
            <div className="product-detail-specs-block">
              <h2 className="product-detail-section-title">Specifications</h2>
              <div className="product-detail-specs-table">
                {specs.map((row, idx) => (
                  <div key={idx} className="product-detail-spec-row">
                    <span className="product-detail-spec-label">{row.label}</span>
                    <span className="product-detail-spec-val">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Strip: Free delivery · Easy returns · Secure payment */}
            <div className="product-detail-trust-line">
              <div className="trust-item">
                <Truck size={16} className="trust-icon" />
                <span>Free delivery on qualifying orders</span>
              </div>
              <span className="trust-dot">·</span>
              <div className="trust-item">
                <RotateCcw size={16} className="trust-icon" />
                <span>Easy returns</span>
              </div>
              <span className="trust-dot">·</span>
              <div className="trust-item">
                <ShieldCheck size={16} className="trust-icon" />
                <span>Secure payment</span>
              </div>
            </div>

            {/* Divider & Quantity Stepper & Add to Cart */}
            <div className="product-detail-buy-section">
              <div className="product-detail-qty-row">
                <span className="product-detail-qty-label">Quantity:</span>
                <div className="product-detail-qty-control">
                  <button
                    type="button"
                    className="product-detail-qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="product-detail-qty-val">{quantity}</span>
                  <button
                    type="button"
                    className="product-detail-qty-btn"
                    onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                    disabled={quantity >= maxStock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="product-detail-action-btns">
                <button
                  type="button"
                  className={`product-detail-add-btn${added ? " is-added" : ""}`}
                  onClick={handleAddToCart}
                  disabled={maxStock <= 0}
                  aria-label={`Add ${quantity} of ${product.name} to cart`}
                >
                  {added ? (
                    <>
                      <Check size={18} />
                      <span>Added to Cart ✓</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>Add to Cart ({formatPrice(product.price * quantity)})</span>
                    </>
                  )}
                </button>

                <a href={beautyUrl} className="product-detail-back-link">
                  <ArrowLeft size={16} />
                  <span>← Back to Beauty</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        {relatedProducts.length > 0 && <div className="product-detail-divider" />}

        {/* 3. "You may also like" Section */}
        {relatedProducts.length > 0 && (
          <section className="product-detail-related-section">
            <div className="product-detail-related-header">
              <h2>You may also like</h2>
              <p className="product-detail-related-subtitle">
                More {product.category || "Beauty"} you might like
              </p>
            </div>

            <div className="product-detail-related-grid">
              {relatedProducts.map((rel) => {
                const relOldPrice =
                  rel.originalPrice || rel.oldPrice || rel.actualPrice || 0;
                const relHasDiscount = Boolean(relOldPrice && relOldPrice > rel.price);
                const relDiscount = relHasDiscount
                  ? Math.round(((relOldPrice - rel.price) / relOldPrice) * 100)
                  : 0;
                const relRating = rel.rating ? Number(rel.rating) : 4.8;

                return (
                  <article
                    key={rel.uid || `${rel.category}-${rel.id}`}
                    className="product-detail-related-card"
                    onClick={(e) => handleOpenRelated(e, rel)}
                  >
                    <div className="related-card-image">
                      {relDiscount > 0 && (
                        <span className="related-discount-badge">
                          -{relDiscount}%
                        </span>
                      )}
                      <img
                        src={resolveImagePath(rel.image)}
                        alt={rel.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE;
                        }}
                      />
                    </div>

                    <div className="related-card-info">
                      <span className="related-card-cat">{rel.category || "Beauty"}</span>
                      <h3 className="related-card-title">{rel.name}</h3>

                      <div className="related-card-rating">
                        <div className="related-card-stars">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              fill={i < Math.round(relRating) ? "#fbbf24" : "none"}
                              stroke="#fbbf24"
                            />
                          ))}
                        </div>
                        <span className="related-card-rating-num">{relRating.toFixed(1)}</span>
                      </div>

                      <div className="related-card-prices">
                        <span className="related-card-price">{formatPrice(rel.price)}</span>
                        {relHasDiscount ? (
                          <span className="related-card-oldprice">
                            {formatPrice(relOldPrice)}
                          </span>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        className="related-view-btn"
                        onClick={(e) => handleOpenRelated(e, rel)}
                      >
                        <span>View Product</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Sticky Bottom Add to Cart Bar for Mobile */}
      <div className="product-detail-mobile-sticky-bar">
        <div className="mobile-sticky-left">
          <span className="mobile-sticky-price">{formatPrice(product.price * quantity)}</span>
          <span className="mobile-sticky-name">{product.name}</span>
        </div>
        <button
          type="button"
          className="mobile-sticky-btn"
          onClick={handleAddToCart}
          disabled={maxStock <= 0}
        >
          {added ? "Added ✓" : `Add to Cart (${formatPrice(product.price * quantity)})`}
        </button>
      </div>
    </div>
  );
}

const rootEl = document.getElementById("beauty-product-root");
if (rootEl) {
  createRoot(rootEl).render(<BeautyProductDetailPage />);
}

export default BeautyProductDetailPage;
