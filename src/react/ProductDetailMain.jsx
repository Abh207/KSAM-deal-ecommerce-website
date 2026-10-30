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
  findProduct,
  getRelatedProducts,
  buildProductUid,
  addProductToCart,
  formatPrice,
  resolveImagePath,
  DEFAULT_PLACEHOLDER_IMAGE
} from "../lib/cartHelper.js";
import {
  isInWishlist,
  toggleWishlist,
  subscribeWishlist
} from "../lib/wishlist.js";

import "./productDetail.css";

// Unique description generator for products that lack a detailed description
function getProductDescription(product) {
  if (product.description && product.description.trim()) {
    return product.description.trim();
  }
  if (product.desc && product.desc.trim()) {
    return product.desc.trim();
  }
  if (product.details && typeof product.details === "string" && product.details.trim()) {
    return product.details.trim();
  }

  const name = product.name || product.title || "This premium product";
  const cat = (product.category || "General").toLowerCase();
  const priceStr = formatPrice(product.price);

  if (cat.includes("watch")) {
    return `The ${name} combines master horology with sleek contemporary craftsmanship. Featuring high-durability construction and refined aesthetics, it offers exceptional reliability for both daily wear and formal occasions. At ${priceStr}, it delivers remarkable precision and enduring sophistication.`;
  } else if (cat.includes("shoe")) {
    return `Engineered for superior comfort and all-day agility, the ${name} delivers responsive cushioning and dynamic foot support. Built with premium breathable materials and reinforced traction outsoles, it transitions seamlessly from training to urban lifestyle. Experience exceptional footwear value at ${priceStr}.`;
  } else if (cat.includes("audio") || cat.includes("headphone") || cat.includes("speaker")) {
    return `Immerse yourself in rich, high-fidelity sound with the ${name}. Tuned with precision acoustic drivers and advanced noise isolation, it reproduces crisp highs, natural vocals, and deep bass. Available today at ${priceStr} with certified audio clarity.`;
  } else if (cat.includes("cloth") || cat.includes("shirt") || cat.includes("apparel") || cat.includes("fashion")) {
    return `Crafted with premium organic textiles, the ${name} provides breathable softness and a tailored modern silhouette. Its reinforced double stitching and anti-fade weave ensure lasting wear through daily routines. Add timeless wardrobe value at ${priceStr}.`;
  } else if (cat.includes("chair") || cat.includes("furniture")) {
    return `Designed for ultimate postural alignment, the ${name} integrates ergonomic lumbar contouring with high-density pressure-relief cushioning. Tested for heavy-duty daily performance and smooth multi-directional movement, it elevates any space. Exceptional seating value at ${priceStr}.`;
  } else if (cat.includes("beauty") || cat.includes("skin") || cat.includes("cosmetic")) {
    return `Infused with nutrient-rich botanical active extracts, the ${name} revitalizes and deeply hydrates your skin. Dermatologist tested and hypoallergenic, this clean formula restores balanced glow throughout the day. Elevate your self-care routine at ${priceStr}.`;
  }

  return `The ${name} is engineered to rigorous standards for dependable performance and everyday durability. With an ergonomic design tailored for modern living, it combines functional utility with sleek aesthetics. Certified authentic quality at ${priceStr}.`;
}

// Category-specific bullet features
function getKeyFeatures(product) {
  const cat = (product.category || "").toLowerCase();
  if (
    cat.includes("audio") ||
    cat.includes("headphone") ||
    cat.includes("speaker") ||
    cat.includes("earbud") ||
    cat.includes("neckband")
  ) {
    const batteryText = product.battery
      ? `Up to ${product.battery} of wireless playback with rapid fast-charging`
      : "Ultra-long continuous wireless playback with USB-C fast charging";
    const connText = product.connectivity
      ? `Ultra-low latency ${product.connectivity} connection with instant pairing`
      : "Ultra-low latency Bluetooth 5.3 connection with instant auto-pairing";
    const hasAnc =
      Array.isArray(product.features) &&
      product.features.some((f) => /noise|anc/i.test(f));
    const ancText = hasAnc
      ? "Hybrid Active Noise Cancellation (ANC) with ambient pass-through mode"
      : "Passive noise-isolating acoustic seal with ergonomic comfort fit";

    return [
      ancText,
      batteryText,
      connText,
      "Precision-tuned neodymium acoustic dynamic drivers with deep bass stereo",
      "Dual beamforming ENC microphones for crystal-clear hands-free calls"
    ];
  }

  if (Array.isArray(product.features) && product.features.length > 0) {
    return product.features;
  }

  if (cat.includes("watch")) {
    return [
      "High-precision Japanese quartz / automatic movement",
      "50-meter water resistance with sealed screw-down caseback",
      "Scratch-resistant sapphire-coated crystal glass",
      "Comfort-fit hypoallergenic strap with quick-release clasp",
      "Luminous hands and indices for clear night visibility"
    ];
  } else if (cat.includes("shoe")) {
    return [
      "Ultra-responsive shock absorption foam midsole",
      "High-abrasion anti-slip rubber compound outsole",
      "Breathable engineered multi-layer mesh upper",
      "Reinforced ergonomic heel cradle for locked-in support",
      "Lightweight design engineered for all-day endurance"
    ];
  } else if (cat.includes("cloth") || cat.includes("apparel") || cat.includes("fashion")) {
    return [
      "100% premium combed organic cotton blend",
      "Pre-shrunk anti-fade colorfast textile treatment",
      "Reinforced double-needle stitching along stress points",
      "Breathable moisture-wicking weave for all-day comfort",
      "Easy-care machine washable with wrinkle resistance"
    ];
  } else if (cat.includes("chair") || cat.includes("furniture")) {
    return [
      "Ergonomic lumbar contouring with multi-angle tilt lock",
      "High-density molded memory foam seat cushion",
      "Breathable tension-responsive mesh backrest",
      "Heavy-duty Class 4 pneumatic gas lift mechanism",
      "360° smooth-glide dual-wheel casters safe for all floors"
    ];
  } else if (cat.includes("beauty")) {
    return [
      "100% certified organic botanical active extracts",
      "Deep-penetrating moisture complex with hyaluronic acid",
      "Dermatologist tested, hypoallergenic, and non-comedogenic",
      "Free from parabens, sulfates, phthalates, and synthetic dyes",
      "Cruelty-free certified formulation for sensitive skin"
    ];
  }
  return [
    "Precision engineered with durable high-grade materials",
    "Rigorously tested for long-lasting daily performance",
    "Modern minimalist design aesthetic with ergonomic comfort",
    "100% genuine and verified KSAM Deal authentic guarantee",
    "Manufacturer certified warranty coverage included"
  ];
}

function ProductDetailPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [sizeError, setSizeError] = useState("");

  const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const wishlistUrl = `${normalizedBase}watchwishlist.html`;
  const homeUrl = `${normalizedBase}`;
  const shopUrl = `${normalizedBase}shop.html`;

  useEffect(() => {
    // Scroll to the very top on load
    window.scrollTo({ top: 0, behavior: "instant" });

    const params = new URLSearchParams(window.location.search);
    const uid = params.get("uid");
    const id = params.get("id");
    const category = params.get("category");

    if (!uid && !id) {
      setLoading(false);
      return;
    }

    // Lookup strictly by uid first, then category + id. Never fall back to wrong category item!
    const item = findProduct({ uid, category, id });

    if (item) {
      const resolvedCategory = item.category || category || "General";
      const populatedProduct = {
        ...item,
        category: resolvedCategory,
        uid: item.uid || buildProductUid(resolvedCategory, item.id)
      };
      setProduct(populatedProduct);
      setActiveImage(resolveImagePath(populatedProduct.image));
      setIsWishlisted(isInWishlist(populatedProduct.uid || populatedProduct.id));

      // Shared related products helper (strictly same category / parent group)
      const related = getRelatedProducts(populatedProduct, 4);
      setRelatedProducts(related);
    } else {
      setProduct(null);
    }
    setLoading(false);
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
        "name": product.brand || product.category || "KSAM Deal"
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

  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const isFromWishlist =
    params.get("from") === "wishlist" ||
    (typeof document !== "undefined" &&
      document.referrer &&
      document.referrer.toLowerCase().includes("wishlist"));

  const isFromAudio =
    !isFromWishlist &&
    (params.get("from") === "audio" ||
      (typeof document !== "undefined" &&
        document.referrer &&
        document.referrer.toLowerCase().includes("audio.html")) ||
      Boolean(
        product &&
          ["audio", "earbuds", "headphones", "speakers", "neckbands"].some(
            (c) => String(product.category || "").toLowerCase().includes(c)
          )
      ));

  const isFromClothing =
    !isFromWishlist &&
    !isFromAudio &&
    (params.get("from") === "clothing" ||
      (typeof document !== "undefined" &&
        document.referrer &&
        document.referrer.toLowerCase().includes("clothes.html")) ||
      Boolean(
        product &&
          ["tops", "dresses", "bottoms", "jackets", "shirts", "clothes"].some(
            (c) => String(product.category || "").toLowerCase().includes(c)
          )
      ));

  const isFromElectronics =
    !isFromWishlist &&
    !isFromAudio &&
    !isFromClothing &&
    (params.get("from") === "electronics" ||
      (typeof document !== "undefined" &&
        document.referrer &&
        (document.referrer.toLowerCase().includes("electronics.html") ||
          document.referrer.toLowerCase().includes("fashionspeaker.html"))) ||
      Boolean(
        product &&
          ["smartphones", "laptops", "cameras", "gaming", "smart home", "electronics", "gadgets"].some(
            (c) => String(product.category || "").toLowerCase().includes(c)
          )
      ));

  const isFromWatches =
    !isFromWishlist &&
    !isFromAudio &&
    !isFromClothing &&
    !isFromElectronics &&
    (params.get("from") === "watches" ||
      (typeof document !== "undefined" &&
        document.referrer &&
        document.referrer.toLowerCase().includes("watchshop")) ||
      Boolean(product && String(product.category || "").toLowerCase().includes("watch")));

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

    if (Array.isArray(product.sizes) && product.sizes.length > 0 && !selectedSize) {
      setSizeError("Please select a size before adding to cart");
      return;
    }

    setSizeError("");
    const itemToAdd = {
      ...product,
      selectedSize: selectedSize || undefined,
      selectedColor: product.color || undefined
    };

    addProductToCart(itemToAdd, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const handleOpenRelated = (e, relProd) => {
    e.preventDefault();
    const id = relProd.id !== undefined && relProd.id !== null ? relProd.id : "";
    const category = relProd.category || "";
    const uid = relProd.uid || buildProductUid(category, id);
    const fromParam = isFromAudio
      ? "&from=audio"
      : isFromClothing
      ? "&from=clothing"
      : isFromElectronics
      ? "&from=electronics"
      : isFromWatches
      ? "&from=watches"
      : "";
    window.location.href = `${normalizedBase}product.html?id=${encodeURIComponent(id)}&category=${encodeURIComponent(category)}&uid=${encodeURIComponent(uid)}${fromParam}`;
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <main className="product-detail-main">
          <div style={{ textAlign: "center", padding: "100px 20px", color: "#16a34a", fontSize: "18px", fontWeight: 600 }}>
            Loading product details...
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
              The product you are looking for doesn't exist, has an invalid ID or category, or has been removed from the catalog.
            </p>
            <a
              href={
                isFromAudio
                  ? `${normalizedBase}audio.html`
                  : isFromClothing
                  ? `${normalizedBase}clothes.html`
                  : isFromElectronics
                  ? `${normalizedBase}electronics.html`
                  : isFromWatches
                  ? `${normalizedBase}watchshop.html`
                  : wishlistUrl
              }
              className="product-detail-notfound-btn"
            >
              <ArrowLeft size={16} />
              <span>
                {isFromAudio
                  ? "Back to Audio"
                  : isFromClothing
                  ? "← Back to Clothing"
                  : isFromElectronics
                  ? "Back to Electronics"
                  : isFromWatches
                  ? "Back to Watches"
                  : "Back to Wishlist"}
              </span>
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
  const reviewsCount = 40 + Math.abs(String(product.id).length * 19);
  const description = getProductDescription(product);
  const keyFeatures = getKeyFeatures(product);

  const isAudio = Boolean(
    isFromAudio ||
    (product &&
      ["audio", "earbuds", "headphones", "speakers", "neckbands"].some(
        (c) => String(product.category || "").toLowerCase().includes(c)
      ))
  );

  // Specifications
  const specs = [
    { label: "Brand", value: product.brand || product.store || (isAudio ? "KSAM Audio" : "KSAM Signature") },
    { label: "Category", value: product.category || (isAudio ? "Audio" : "General") },
    { label: "Model / SKU", value: product.sku || `KSAM-${product.id}` },
    isAudio
      ? { label: "Connectivity", value: product.connectivity || "Bluetooth 5.3 / Wireless" }
      : {
          label: "Material",
          value:
            product.material ||
            (String(product.category || "").toLowerCase().includes("watch")
              ? "Stainless Steel / Sapphire Crystal"
              : String(product.category || "").toLowerCase().includes("shoe")
              ? "Engineered Mesh / High-Grade EVA"
              : String(product.category || "").toLowerCase().includes("chair")
              ? "Reinforced Steel / High-Density Foam"
              : "Certified High-Grade Composite")
        },
    ...(isAudio && product.battery ? [{ label: "Battery / Playback", value: product.battery }] : []),
    ...(isAudio && product.waterResistance ? [{ label: "Water Resistance", value: product.waterResistance }] : []),
    { label: "Warranty", value: "1-Year Official Manufacturer Warranty" },
    { label: "Availability", value: "In Stock (Ships in 24 Hours)" }
  ];

  const mainImgSrc = resolveImagePath(product.image);
  const thumbnailList =
    Array.isArray(product.images) && product.images.length > 1
      ? product.images.map(resolveImagePath)
      : [mainImgSrc];

  return (
    <div className="product-detail-page">
      {/* 1. Shared KSAM Navbar */}
      <Navbar searchPlaceholder={isAudio ? `Search ${product.category?.toLowerCase() || "audio"}...` : undefined} />

      <main className="product-detail-main">
        {/* Breadcrumb Navigation: Home / Category / Product Name */}
        <nav className="product-detail-breadcrumb" aria-label="Breadcrumb">
          <a href={homeUrl}>Home</a>
          <span className="sep">/</span>
          <a
            href={
              isFromAudio
                ? `${normalizedBase}audio.html`
                : isFromClothing
                ? `${normalizedBase}clothes.html`
                : isFromElectronics
                ? `${normalizedBase}electronics.html`
                : isFromWatches || (product.category && product.category.toLowerCase().includes("watch"))
                ? `${normalizedBase}watchshop.html`
                : `${shopUrl}?category=${encodeURIComponent(product.category || "All")}`
            }
          >
            {product.category || "Catalog"}
          </a>
          <span className="sep">/</span>
          <span className="current">{product.name || product.title}</span>
        </nav>

        {/* Product Details Grid: Left Image, Right Info */}
        <div className="product-detail-grid">
          {/* Left Column: Large Image & Thumbnails */}
          <div className="product-detail-media-wrap">
            <div className="product-detail-media">
              {/* Green Discount Pill Badge */}
              {discountPct > 0 && (
                <span className="product-detail-discount-badge">
                  -{discountPct}%
                </span>
              )}

              {/* Heart Button synced with Wishlist */}
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
                alt={product.name || product.title || "Product"}
                className="product-detail-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE;
                }}
              />
            </div>

            {/* Clickable Thumbnails */}
            {thumbnailList.length > 0 && (
              <div className="product-detail-thumbs">
                {thumbnailList.map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`product-detail-thumb-btn${activeImage === thumb ? " is-active" : ""}`}
                    onClick={() => setActiveImage(thumb)}
                    aria-label={`View angle ${idx + 1}`}
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

          {/* Right Column: Product Information Block */}
          <div className="product-detail-info">
            <span className="product-detail-cat-pill">
              {product.category || "Product"}
            </span>

            <h1 className="product-detail-title">
              {product.name || product.title}
            </h1>

            {/* Rating Row: Gold stars #fbbf24 */}
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
              <p className="product-detail-desc">{description}</p>
            </div>

            {/* Key Features List */}
            <div className="product-detail-features-block">
              <h2 className="product-detail-section-title">Key Features</h2>
              <ul className="product-detail-features-list">
                {keyFeatures.map((feat, idx) => (
                  <li key={idx}>
                    <Check size={16} className="product-detail-feat-check" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specifications Table (Light with zebra stripes) */}
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

            {/* Delivery & Returns Line */}
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

            {/* Quantity Selector & Add to Cart Section */}
            <div className="product-detail-buy-section">
              {/* Clothing Options: Color & Size Selector */}
              {(product.color || (Array.isArray(product.sizes) && product.sizes.length > 0)) && (
                <div className="product-detail-clothing-options">
                  {product.color && (
                    <div className="product-detail-color-line">
                      <span className="product-detail-option-label">Color:</span>
                      <strong className="product-detail-color-value">{product.color}</strong>
                    </div>
                  )}

                  {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                    <div className="product-detail-sizes-box">
                      <div className="product-detail-sizes-header">
                        <span className="product-detail-option-label">Select Size:</span>
                        {selectedSize && (
                          <span className="product-detail-selected-size-chip">{selectedSize}</span>
                        )}
                      </div>
                      <div className="product-detail-sizes-pills" role="radiogroup" aria-label="Product size">
                        {product.sizes.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            className={`product-detail-size-pill ${selectedSize === sz ? "is-selected" : ""}`}
                            onClick={() => {
                              setSelectedSize(sz);
                              setSizeError("");
                            }}
                            aria-label={`Size ${sz}`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                      {sizeError && (
                        <p className="product-detail-size-error-msg" role="alert">
                          {sizeError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

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
                    -
                  </button>
                  <span className="product-detail-qty-val">{quantity}</span>
                  <button
                    type="button"
                    className="product-detail-qty-btn"
                    onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                    disabled={product.stock ? quantity >= product.stock : quantity >= 99}
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

                <a
                  href={
                    isFromAudio
                      ? `${normalizedBase}audio.html`
                      : isFromClothing
                      ? `${normalizedBase}clothes.html`
                      : isFromElectronics
                      ? `${normalizedBase}electronics.html`
                      : isFromWatches
                      ? `${normalizedBase}watchshop.html`
                      : wishlistUrl
                  }
                  className="product-detail-back-link"
                >
                  <ArrowLeft size={16} />
                  <span>
                    {isFromAudio
                      ? "Back to Audio"
                      : isFromClothing
                      ? "← Back to Clothing"
                      : isFromElectronics
                      ? "Back to Electronics"
                      : isFromWatches
                      ? "Back to Watches"
                      : "Back to Wishlist"}
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider between main product block & Related Section */}
        {relatedProducts.length > 0 && <div className="product-detail-divider" />}

        {/* Section: "You may also like" (4 related products from SAME category / type) */}
        {relatedProducts.length > 0 && (
          <section className="product-detail-related-section">
            <div className="product-detail-related-header">
              <h2>You may also like</h2>
              <p className="product-detail-related-subtitle">
                More {product.category || "items"} you might like
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
                        alt={rel.name || rel.title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE;
                        }}
                      />
                    </div>

                    <div className="related-card-info">
                      <span className="related-card-cat">{rel.category || "Item"}</span>
                      <h3 className="related-card-title">{rel.name || rel.title}</h3>
                      
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
          <span className="mobile-sticky-name">{product.name || product.title}</span>
        </div>
        <button
          type="button"
          className="mobile-sticky-btn"
          onClick={handleAddToCart}
        >
          {added ? "Added ✓" : "Add to Cart"}
        </button>
      </div>

      {/* NO FOOTER per requirement */}
    </div>
  );
}

const rootEl = document.getElementById("product-root");
if (rootEl) {
  createRoot(rootEl).render(<ProductDetailPage />);
}

export default ProductDetailPage;

