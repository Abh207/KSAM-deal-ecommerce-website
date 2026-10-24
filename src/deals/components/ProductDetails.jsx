import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ArrowLeft,
  ArrowUpRight,
  Heart,
  Bell,
  Star,
  Clock,
  ShieldCheck,
  Leaf,
  Gem,
  ShoppingBag,
  Store
} from "lucide-react";
import { wishlistService } from "../services/wishlistService.js";
import {
  getDeals,
  logOutboundClick,
  getCategoryFallbackImage
} from "../services/productService.js";
import ProductCard from "./ProductCard.jsx";
import PriceAlertModal from "./PriceAlertModal.jsx";

const DEFAULT_COLORS = [
  { name: "Blue Denim", hex: "#1d4ed8" },
  { name: "Midnight Black", hex: "#111827" },
  { name: "Slate Gray", hex: "#4b5563" },
  { name: "Classic White", hex: "#e5e7eb" }
];

const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];

/**
 * ProductDetails recreates Image 3 EXACTLY:
 * - Rendered in a portal at the end of <body> with z-index: 999999.
 * - Dimmed blurred backdrop, centered modal (max 1100px) on laptop, full-screen sheet on mobile.
 * - Dark navy-to-black gradient, glowing border, frosted pale circle, glowing circular pedestal.
 * - 48px glass heart button, 40px bold title, 5 gold stars, 44px ₹ price + green savings tag.
 * - 3 feature items, interactive color/size swatches, 64px "Buy on {store}" pill with dark arrow circle.
 * - Price-alert bell, store chip, "Price updated 3d ago", and similar deals row.
 */
export function ProductDetails({ product, onClose, onSelectProduct }) {
  const [activeProduct, setActiveProduct] = useState(product);
  const [selectedImage, setSelectedImage] = useState(product?.image);
  const [isSaved, setIsSaved] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [similarDeals, setSimilarDeals] = useState([]);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [selectedSize, setSelectedSize] = useState("L");

  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Sync state when product prop changes
  useEffect(() => {
    if (product) {
      setActiveProduct(product);
      setSelectedImage(product.image);
    }
  }, [product]);

  // Save previous focus and focus modal close button on mount
  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    return () => {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Sync wishlist status
  useEffect(() => {
    if (!activeProduct?.id) return;
    let active = true;
    wishlistService.isSaved(activeProduct.id).then((saved) => {
      if (active) setIsSaved(saved);
    });

    const unsub = wishlistService.subscribe(() => {
      wishlistService.isSaved(activeProduct.id).then((saved) => {
        if (active) setIsSaved(saved);
      });
    });

    return () => {
      active = false;
      unsub();
    };
  }, [activeProduct?.id]);

  // Fetch similar products
  useEffect(() => {
    if (!activeProduct?.id) return;
    let active = true;

    async function loadExtraData() {
      try {
        const categoryToQuery =
          activeProduct.category && activeProduct.category !== "Deals"
            ? activeProduct.category
            : "All";

        const res = await getDeals({
          category: categoryToQuery,
          pageSize: 6
        });

        if (active) {
          const filtered = (res.products || [])
            .filter((p) => String(p.id) !== String(activeProduct.id))
            .slice(0, 4);
          setSimilarDeals(filtered);
        }
      } catch (err) {
        console.warn("Failed to load similar products for modal:", err);
      }
    }

    loadExtraData();

    return () => {
      active = false;
    };
  }, [activeProduct?.id, activeProduct?.category]);

  // Focus trap & Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleToggleWishlist = async () => {
    if (savingWishlist || !activeProduct) return;
    setSavingWishlist(true);
    try {
      const nextState = await wishlistService.toggle(activeProduct);
      setIsSaved(nextState);
    } catch (err) {
      console.warn("Failed to toggle wishlist in details:", err);
    } finally {
      setSavingWishlist(false);
    }
  };

  const handleBuyClick = () => {
    if (activeProduct?.id) {
      logOutboundClick(activeProduct.id, "product_details_modal");
    }
  };

  if (!activeProduct) return null;

  // Safe field resolution to ensure the modal never crashes or stays empty
  const productName = activeProduct.name || "Untitled Product";
  const rawPrice = activeProduct.price;
  const numPrice = typeof rawPrice === "number"
    ? rawPrice
    : Number(String(rawPrice || "0").replace(/[^0-9.]/g, "")) || 0;

  const rawOldPrice = activeProduct.oldPrice || activeProduct.old_price;
  const numOldPrice = typeof rawOldPrice === "number"
    ? rawOldPrice
    : Number(String(rawOldPrice || "0").replace(/[^0-9.]/g, "")) || Math.round(numPrice * 1.4);

  const savings = numOldPrice > numPrice ? numOldPrice - numPrice : 0;

  const displayImage =
    selectedImage ||
    activeProduct.image ||
    getCategoryFallbackImage(activeProduct.category, activeProduct.name);

  const outboundUrl =
    activeProduct.affiliateUrl ||
    activeProduct.productUrl ||
    activeProduct.url ||
    "https://www.amazon.in/";

  const storeName = activeProduct.store || "Amazon";

  const ratingNum = activeProduct.rating ? Number(activeProduct.rating).toFixed(1) : "4.5";
  const reviewCountStr = activeProduct.reviews
    ? `(${Number(activeProduct.reviews).toLocaleString("en-IN")} reviews)`
    : "(120 reviews)";

  const badgeText =
    activeProduct.discount && Number(String(activeProduct.discount).replace(/[^0-9]/g, "")) > 0
      ? `-${Number(String(activeProduct.discount).replace(/[^0-9]/g, ""))}%`
      : "New";

  // Check if product has legitimate color/size data
  const catLower = (activeProduct.category || "").toLowerCase();
  const nameLower = productName.toLowerCase();
  const isWearable =
    catLower.includes("fashion") ||
    catLower.includes("shoe") ||
    catLower.includes("clothing") ||
    nameLower.includes("jacket") ||
    nameLower.includes("shoe") ||
    nameLower.includes("sneaker") ||
    nameLower.includes("shirt") ||
    nameLower.includes("cloth");

  const hasColors =
    Array.isArray(activeProduct.colors) && activeProduct.colors.length > 0
      ? true
      : isWearable;

  const colorsList =
    Array.isArray(activeProduct.colors) && activeProduct.colors.length > 0
      ? activeProduct.colors
      : DEFAULT_COLORS;

  const hasSizes =
    Array.isArray(activeProduct.sizes) && activeProduct.sizes.length > 0
      ? true
      : isWearable;

  const sizesList =
    Array.isArray(activeProduct.sizes) && activeProduct.sizes.length > 0
      ? activeProduct.sizes
      : DEFAULT_SIZES;

  const modalContent = (
    <div
      className="product-details-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-details-title"
    >
      <div
        ref={dialogRef}
        className="product-details-modal"
      >
        {/* Subtle diagonal white light streak */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-120px",
            left: "-120px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 60%, transparent 80%)",
            filter: "blur(40px)",
            pointerEvents: "none",
            zIndex: 0
          }}
        />

        {/* Top-right Glass Close Button */}
        <div style={{ position: "absolute", top: "18px", right: "18px", zIndex: 30 }}>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            type="button"
            aria-label="Close product details"
            className="details-glass-btn"
            style={{ width: "44px", height: "44px" }}
          >
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>

        {/* Mobile Back Button (top left) */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Go back"
          className="details-glass-btn sm:hidden"
          style={{ position: "absolute", top: "18px", left: "18px", zIndex: 30, width: "44px", height: "44px" }}
        >
          <ArrowLeft size={20} strokeWidth={2.4} />
        </button>

        {/* Scrollable Container */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "clamp(20px, 3.5vw, 40px)",
            position: "relative",
            zIndex: 1
          }}
        >
          {/* 2-Column Hero: Left Stage (47%) + Right Info (53%) */}
          <div
            className="grid gap-8 lg:grid-cols-[47%_53%] lg:gap-10 items-center"
            style={{ display: "grid" }}
          >
            {/* ========================================================
                LEFT COLUMN: Image Stage with Circular Glow & Pedestal
               ======================================================== */}
            <div className="details-left-stage">
              {/* Frosted pale circle behind product with bright rim light on upper-right edge */}
              <div aria-hidden="true" className="details-frosted-circle" />

              {/* Top-Left: Solid blue pill badge (#0a6cff) */}
              <div style={{ position: "absolute", left: "18px", top: "18px", zIndex: 20 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: "9999px",
                    background: "#0a6cff",
                    padding: "6px 16px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#ffffff",
                    boxShadow: "0 2px 14px rgba(10, 108, 255, 0.55)"
                  }}
                >
                  {badgeText}
                </span>
              </div>

              {/* Top-Right: 48px round glass-blur button with white heart icon */}
              <button
                onClick={handleToggleWishlist}
                type="button"
                aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
                className="details-glass-btn"
                style={{
                  position: "absolute",
                  right: "18px",
                  top: "18px",
                  zIndex: 20,
                  width: "48px",
                  height: "48px",
                  boxShadow: isSaved ? "0 0 16px rgba(255,255,255,0.4)" : "none"
                }}
              >
                <Heart
                  size={22}
                  strokeWidth={2}
                  fill={isSaved ? "#ffffff" : "none"}
                  color="#ffffff"
                  className={savingWishlist ? "animate-pulse" : ""}
                />
              </button>

              {/* Centered Large Product Image */}
              <div
                style={{
                  position: "relative",
                  zIndex: 10,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px 0"
                }}
              >
                <img
                  src={displayImage}
                  alt={productName}
                  style={{
                    maxHeight: "300px",
                    maxWidth: "85%",
                    width: "auto",
                    objectFit: "contain",
                    filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.7))",
                    transition: "transform 0.4s ease"
                  }}
                />
              </div>

              {/* Pedestal: Dark disc with bright blue-white glowing rim & soft shadow */}
              <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginTop: "-10px" }}>
                <div className="details-pedestal-shadow" />
                <div className="details-pedestal" />
              </div>
            </div>

            {/* ========================================================
                RIGHT COLUMN: Product Info with Thin Horizontal Dividers
               ======================================================== */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                {/* 1. Title: Very large bold white (40px laptop, clamp on phone) */}
                <h1
                  id="product-details-title"
                  style={{
                    fontSize: "clamp(24px, 3.2vw, 40px)",
                    fontWeight: 800,
                    color: "#ffffff",
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                    margin: 0
                  }}
                >
                  {productName}
                </h1>

                {/* 2. Short Description: Muted light gray, 2-3 lines */}
                <p
                  style={{
                    margin: "10px 0 0 0",
                    fontSize: "clamp(13px, 1.1vw, 15px)",
                    color: "rgba(255, 255, 255, 0.7)",
                    lineHeight: 1.55
                  }}
                >
                  {activeProduct.description ||
                    "Experience premium build quality and exceptional performance with verified merchant warranty and live price drop savings."}
                </p>

                {/* Thin horizontal divider */}
                <hr className="details-divider" />

                {/* 3. Rating Row: 5 gold stars, "4.5" bold, vertical divider, review count */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={18}
                        fill="#ffc107"
                        stroke="#ffc107"
                        className="shrink-0"
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff" }}>
                    {ratingNum}
                  </span>
                  <span style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.25)", margin: "0 4px" }} />
                  <span style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", fontWeight: 500 }}>
                    {reviewCountStr}
                  </span>
                </div>

                {/* Thin horizontal divider */}
                <hr className="details-divider" />

                {/* 4. Price Row: 44px white bold ₹ + struck-through price + green savings tag */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "14px" }}>
                  <span style={{ fontSize: "clamp(30px, 3.8vw, 44px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
                    ₹{numPrice.toLocaleString("en-IN")}
                  </span>

                  {numOldPrice > numPrice && (
                    <del style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                      ₹{numOldPrice.toLocaleString("en-IN")}
                    </del>
                  )}

                  {savings > 0 && (
                    <span
                      style={{
                        borderRadius: "9999px",
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "1px solid rgba(16, 185, 129, 0.35)",
                        padding: "4px 12px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#34d399"
                      }}
                    >
                      You save ₹{savings.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                {/* Thin horizontal divider */}
                <hr className="details-divider" />

                {/* 5. 3 Feature Items separated by vertical dividers, white line icons */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    padding: "4px 0"
                  }}
                >
                  {/* Item 1: Shield */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingRight: "10px", borderRight: "1px solid rgba(255,255,255,0.15)" }}>
                    <ShieldCheck size={22} className="shrink-0" style={{ color: "#ffffff" }} />
                    <div style={{ fontSize: "12px", lineHeight: 1.25 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: "#ffffff" }}>Premium</p>
                      <p style={{ margin: 0, color: "rgba(255,255,255,0.6)" }}>Quality</p>
                    </div>
                  </div>

                  {/* Item 2: Leaf */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 10px", borderRight: "1px solid rgba(255,255,255,0.15)" }}>
                    <Leaf size={22} className="shrink-0" style={{ color: "#ffffff" }} />
                    <div style={{ fontSize: "12px", lineHeight: 1.25 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: "#ffffff" }}>Comfortable</p>
                      <p style={{ margin: 0, color: "rgba(255,255,255,0.6)" }}>Fit</p>
                    </div>
                  </div>

                  {/* Item 3: Gem */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: "10px" }}>
                    <Gem size={22} className="shrink-0" style={{ color: "#ffffff" }} />
                    <div style={{ fontSize: "12px", lineHeight: 1.25 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: "#ffffff" }}>Stylish</p>
                      <p style={{ margin: 0, color: "rgba(255,255,255,0.6)" }}>Design</p>
                    </div>
                  </div>
                </div>

                {/* 6. Color Row: Shown only if product has colors */}
                {hasColors && (
                  <>
                    <hr className="details-divider" />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>Color:</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {colorsList.map((col) => {
                            const isSelected = selectedColor.name === col.name;
                            return (
                              <button
                                key={col.name}
                                type="button"
                                onClick={() => setSelectedColor(col)}
                                aria-label={`Select color ${col.name}`}
                                style={{
                                  backgroundColor: col.hex,
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  cursor: "pointer",
                                  border: isSelected ? "2px solid #ffffff" : "1px solid rgba(255,255,255,0.25)",
                                  boxShadow: isSelected ? "0 0 14px rgba(56, 189, 248, 0.85), inset 0 0 4px rgba(0,0,0,0.5)" : "none",
                                  transform: isSelected ? "scale(1.1)" : "scale(1)",
                                  transition: "all 0.2s ease"
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>

                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
                        {selectedColor.name}
                      </span>
                    </div>
                  </>
                )}

                {/* 7. Size Row: Shown only if product has sizes */}
                {hasSizes && (
                  <>
                    <hr className="details-divider" />
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>Size:</span>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
                        {sizesList.map((sz) => {
                          const isSelected = selectedSize === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setSelectedSize(sz)}
                              style={{
                                height: "36px",
                                minWidth: "44px",
                                padding: "0 14px",
                                borderRadius: "9999px",
                                fontSize: "13px",
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                backgroundColor: isSelected ? "#ffffff" : "transparent",
                                color: isSelected ? "#000000" : "#ffffff",
                                border: isSelected ? "1px solid #ffffff" : "1px solid rgba(255,255,255,0.25)"
                              }}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Divider before CTA */}
                <hr className="details-divider" />

                {/* 8. CTA: 64px tall pill, white-to-light-blue gradient with soft blue glow, black cart icon, bold centered text, 48px dark circle with white arrow */}
                <div style={{ paddingTop: "4px" }}>
                  <a
                    href={outboundUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleBuyClick}
                    className="details-cta-btn"
                  >
                    {/* Left: Cart icon */}
                    <ShoppingBag size={24} style={{ color: "#000000", flexShrink: 0 }} />

                    {/* Center: Bold text "Buy on {store}" */}
                    <span style={{ fontSize: "clamp(16px, 1.4vw, 19px)", fontWeight: 800, color: "#000000", textAlign: "center", flex: 1, padding: "0 8px" }}>
                      Buy on {storeName}
                    </span>

                    {/* Right: 48px Dark navy circle with white arrow */}
                    <div className="details-cta-arrow">
                      <ArrowUpRight size={22} strokeWidth={2.5} />
                    </div>
                  </a>
                </div>

                {/* 9. Below CTA: Muted line with Clock + Store chip + Round glass bell button */}
                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.6)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Clock size={14} style={{ color: "rgba(255,255,255,0.6)", flexShrink: 0 }} />
                    <span>{activeProduct.priceUpdatedLabel || "Price updated 3d ago"}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {/* Store Chip */}
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        borderRadius: "9999px",
                        border: "1px solid rgba(255,255,255,0.18)",
                        background: "rgba(255,255,255,0.06)",
                        padding: "4px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#ffffff"
                      }}
                    >
                      <Store size={13} style={{ color: "#ffffff" }} />
                      <span>{storeName}</span>
                    </span>

                    {/* Price-Alert Bell Button matching glass style */}
                    <button
                      onClick={() => setShowAlertModal(true)}
                      type="button"
                      aria-label="Set price drop alert"
                      title="Set price alert"
                      className="details-glass-btn"
                      style={{ width: "36px", height: "36px" }}
                    >
                      <Bell size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 10. Similar Deals Row */}
          {similarDeals.length > 0 && (
            <div style={{ marginTop: "44px", paddingTop: "28px", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                  Similar deals in {activeProduct.category || "Deals"}
                </h3>
              </div>

              <div
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                style={{ display: "grid", gap: "16px" }}
              >
                {similarDeals.map((deal) => (
                  <ProductCard
                    key={deal.id}
                    product={deal}
                    onOpenDetails={(item) => {
                      if (onSelectProduct) {
                        onSelectProduct(item);
                      } else {
                        setActiveProduct(item);
                        setSelectedImage(item.image);
                        window.location.hash = `product-${item.id}`;
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price Alert Modal */}
      <PriceAlertModal
        product={activeProduct}
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
      />
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}

export default ProductDetails;
