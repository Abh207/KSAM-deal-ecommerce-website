import React, { useState, useRef } from "react";
import { resolveAsset } from "./useHeroHead.js";
import { useMarquee } from "./useMarquee.js";
import { requireAuth } from "../../../auth/auth.js";

function burstSparks(originX, originY) {
  const colors = ["#22ff88", "#38bdf8", "#ffd60a"];
  const sparkCount = 8;

  for (let i = 0; i < sparkCount; i++) {
    const spark = document.createElement("div");
    spark.className = "cart-spark";
    spark.style.backgroundColor = colors[i % colors.length];
    spark.style.left = `${originX}px`;
    spark.style.top = `${originY}px`;
    document.body.appendChild(spark);

    const angle = (i / sparkCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
    const dist = 32 + Math.random() * 24;
    const destX = originX + Math.cos(angle) * dist;
    const destY = originY + Math.sin(angle) * dist;

    const anim = spark.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        {
          transform: `translate(${destX - originX}px, ${destY - originY}px) scale(0)`,
          opacity: 0
        }
      ],
      {
        duration: 450 + Math.random() * 200,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards"
      }
    );
    anim.onfinish = () => {
      spark.remove();
    };
  }
}

function ProductCard({ product, onAdd, onOpenDetails }) {
  const [imgError, setImgError] = useState(false);
  const initialLetter = product.name ? product.name.trim().charAt(0).toUpperCase() : "P";
  const imgSrc = resolveAsset(product.image);

  const numericPrice = typeof product.price === "number"
    ? product.price
    : Number(String(product.price || "").replace(/[^0-9.]/g, "")) || 49;
  const numericOldPrice = typeof product.oldPrice === "number"
    ? product.oldPrice
    : Number(String(product.oldPrice || "").replace(/[^0-9.]/g, "")) || Math.round(numericPrice * 1.5);
  const numericDiscount = typeof product.discount === "number"
    ? product.discount
    : Number(String(product.discount || "").replace(/[^0-9]/g, "")) || 40;

  const productPayload = {
    id: product.id,
    name: product.name,
    price: numericPrice,
    oldPrice: numericOldPrice,
    discount: numericDiscount,
    rating: product.rating ? Number(product.rating) : 4.8,
    image: imgSrc,
    category: product.category || "Electronics",
    store: product.store || "Amazon",
    url: product.url || product.affiliateUrl || "https://www.amazon.in/"
  };

  const handleOpenModal = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onOpenDetails) {
      onOpenDetails(productPayload);
      return;
    }
    window.dispatchEvent(new CustomEvent("open-product-details", { detail: productPayload }));
    window.location.hash = `product-${product.id}`;
  };

  const handleAddClick = (e) => {
    handleOpenModal(e);
  };

  const handleCardClick = (e) => {
    handleOpenModal(e);
  };

  return (
    <div
      className={`product-card accent-${product.accent || "green"}`}
      data-id={product.id}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* 1. Top Header Row: Category tag on left, discount badge on right */}
      <div className="card-header-row">
        <span className="card-category-tag" title={product.category}>
          {product.category}
        </span>
        <span className="card-discount-badge">{product.discount}</span>
      </div>

      {/* 2. Image Area: 1:1 rounded panel with soft light-gray gradient */}
      <div className="card-img-wrap">
        {!imgError ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="card-prod-img"
            loading="lazy"
            decoding="async"
            width="170"
            height="170"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="card-img-placeholder" aria-hidden="true">
            <span>{initialLetter}</span>
          </div>
        )}
      </div>

      {/* 3. Product Name (Dark, bold 600, max 2 lines with ellipsis, fixed min-height) */}
      <h3 className="prod-name" title={product.name}>
        {product.name}
      </h3>

      {/* 4. Rating (Directly under name, NO divider line) */}
      <div className="prod-rating">
        <span className="rating-star">★</span>
        <span>{product.rating}</span>
      </div>

      {/* 5. Footer Row with Price and Add Button (NO horizontal divider line anywhere) */}
      <div className="card-footer-row">
        <div className="card-price-group">
          <span className="prod-new-price">{product.price}</span>
          <span className="prod-old-price">{product.oldPrice}</span>
        </div>
        <button
          type="button"
          className="btn-add-cart-round"
          aria-label={`Open details for ${product.name}`}
          title="View product details"
          onClick={handleAddClick}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function HeroMarquee({ onAdd, onOpenDetails }) {
  const {
    track1Ref,
    track2Ref,
    repeatedRow1,
    repeatedRow2,
    isHoveringRow1Ref,
    isHoveringRow2Ref,
    sectionVisible
  } = useMarquee();

  const row1TouchTimer = useRef(null);
  const row2TouchTimer = useRef(null);

  const handleRow1TouchStart = () => {
    if (row1TouchTimer.current) clearTimeout(row1TouchTimer.current);
    isHoveringRow1Ref.current = true;
  };

  const handleRow1TouchEnd = () => {
    if (row1TouchTimer.current) clearTimeout(row1TouchTimer.current);
    row1TouchTimer.current = setTimeout(() => {
      isHoveringRow1Ref.current = false;
    }, 2000);
  };

  const handleRow2TouchStart = () => {
    if (row2TouchTimer.current) clearTimeout(row2TouchTimer.current);
    isHoveringRow2Ref.current = true;
  };

  const handleRow2TouchEnd = () => {
    if (row2TouchTimer.current) clearTimeout(row2TouchTimer.current);
    row2TouchTimer.current = setTimeout(() => {
      isHoveringRow2Ref.current = false;
    }, 2000);
  };

  return (
    <div className="kh-root">
      <section
        className={`showcase-section ${sectionVisible ? "showcase-visible" : ""}`}
        id="showcase"
      >
        {/* Section Header */}
        <div className="showcase-header">
          <div className="showcase-eyebrow">Curated Selections</div>
          <h2 className="showcase-title">
            Trending <span className="gradient-text">Deals &amp; Drops</span>
          </h2>
          <p className="showcase-subtitle">
            Hand-picked flagship electronics with verified drops. Smooth continuous scroll
            updated every hour.
          </p>
        </div>

        {/* Centered Marquee Container (matching product grid max-w-7xl and padding) */}
        <div className="marquee-container mx-auto max-w-7xl px-3 sm:px-6">
          {/* Dual Marquee Arena */}
          <div className="marquee-arena" aria-label="Auto-scrolling product showcase">
            {/* Row 1: Left to Right */}
            <div
              className="marquee-row row-left"
              onMouseEnter={() => {
                isHoveringRow1Ref.current = true;
              }}
              onMouseLeave={() => {
                isHoveringRow1Ref.current = false;
              }}
              onTouchStart={handleRow1TouchStart}
              onTouchEnd={handleRow1TouchEnd}
            >
              <div className="marquee-track" ref={track1Ref}>
                {repeatedRow1.map((prod, idx) => (
                  <ProductCard
                    key={`r1-${prod.id}-${idx}`}
                    product={prod}
                    onAdd={onAdd}
                    onOpenDetails={onOpenDetails}
                  />
                ))}
              </div>
            </div>

            {/* Row 2: Right to Left */}
            <div
              className="marquee-row row-right"
              onMouseEnter={() => {
                isHoveringRow2Ref.current = true;
              }}
              onMouseLeave={() => {
                isHoveringRow2Ref.current = false;
              }}
              onTouchStart={handleRow2TouchStart}
              onTouchEnd={handleRow2TouchEnd}
            >
              <div className="marquee-track" ref={track2Ref}>
                {repeatedRow2.map((prod, idx) => (
                  <ProductCard
                    key={`r2-${prod.id}-${idx}`}
                    product={prod}
                    onAdd={onAdd}
                    onOpenDetails={onOpenDetails}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HeroMarquee;
