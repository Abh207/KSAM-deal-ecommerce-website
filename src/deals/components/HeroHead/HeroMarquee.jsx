import React, { useState } from "react";
import { resolveAsset } from "./useHeroHead.js";
import { useMarquee } from "./useMarquee.js";

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

function ProductCard({ product, onAdd }) {
  const [imgError, setImgError] = useState(false);
  const initialLetter = product.name ? product.name.trim().charAt(0).toUpperCase() : "P";
  const imgSrc = resolveAsset(product.image);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cardX = (e.clientX - rect.left) / rect.width - 0.5;
    const cardY = (e.clientY - rect.top) / rect.height - 0.5;
    e.currentTarget.style.transform = `perspective(800px) rotateY(${cardX * 8}deg) rotateX(${-cardY * 8}deg) translateY(-4px) scale(1.02)`;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = "";
  };

  const handleAddClick = (e) => {
    e.stopPropagation();

    // Visual button feedback
    const btn = e.currentTarget;
    btn.classList.add("added");
    setTimeout(() => {
      btn.classList.remove("added");
    }, 1200);

    const cartBtn = document.querySelector("[data-ksam-cart]");
    if (!cartBtn) {
      if (onAdd) {
        onAdd({
          id: product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          image: imgSrc,
          category: product.category,
          store: product.store || "KSAM Deal"
        });
      }
      return;
    }

    const sourceRect = btn.getBoundingClientRect();
    const cartRect = cartBtn.getBoundingClientRect();

    const clone = document.createElement("div");
    clone.className = "flying-cart-clone";
    clone.innerHTML = `<img src="${imgSrc}" alt="" />`;
    const startX = sourceRect.left + sourceRect.width / 2 - 28;
    const startY = sourceRect.top + sourceRect.height / 2 - 28;
    const endX = cartRect.left + cartRect.width / 2 - 24;
    const endY = cartRect.top + cartRect.height / 2 - 24;

    clone.style.left = `${startX}px`;
    clone.style.top = `${startY}px`;
    document.body.appendChild(clone);

    const anim = clone.animate(
      [
        {
          transform: "translate(0, 0) scale(1)",
          opacity: 1
        },
        {
          transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0.28)`,
          opacity: 0.4
        }
      ],
      {
        duration: 650,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards"
      }
    );

    anim.onfinish = () => {
      clone.remove();

      // Squash and bounce on Cart Button
      cartBtn.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(0.85, 1.15)" },
          { transform: "scale(1.15, 0.85)" },
          { transform: "scale(0.95, 1.05)" },
          { transform: "scale(1)" }
        ],
        {
          duration: 600,
          easing: "cubic-bezier(0.34, 1.56, 0.64, 1)"
        }
      );

      // Spark Burst
      burstSparks(cartRect.left + cartRect.width / 2, cartRect.top + cartRect.height / 2);

      // Update React cart state & Toast in Deals.jsx
      if (onAdd) {
        onAdd({
          id: product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          image: imgSrc,
          category: product.category,
          store: product.store || "KSAM Deal"
        });
      }
    };
  };

  return (
    <div
      className={`product-card accent-${product.accent || "green"}`}
      data-id={product.id}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Header Row */}
      <div className="card-header-row">
        <span className="card-category-tag" title={product.category}>
          {product.category}
        </span>
        <span className="card-discount-badge">{product.discount}</span>
      </div>

      {/* 2. Image Area */}
      <div className="card-img-wrap">
        {!imgError ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="card-prod-img"
            loading="lazy"
            decoding="async"
            width="200"
            height="135"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="card-img-placeholder" aria-hidden="true">
            <span>{initialLetter}</span>
          </div>
        )}
      </div>

      {/* 3. Product Name */}
      <h3 className="prod-name" title={product.name}>
        {product.name}
      </h3>

      {/* 4. Rating */}
      <div className="prod-rating">
        <span className="rating-star">★</span>
        <span>{product.rating}</span>
      </div>

      {/* 5. Footer Row with Price and Add Button */}
      <div className="card-footer-row">
        <div className="card-price-group">
          {/* Note: product.price and product.oldPrice render raw price strings (e.g. "$799") */}
          <span className="prod-new-price">{product.price}</span>
          <span className="prod-old-price">{product.oldPrice}</span>
        </div>
        <button
          type="button"
          className="btn-add-cart-round"
          aria-label={`Add ${product.name} to cart`}
          title="Add to cart"
          onClick={handleAddClick}
        >
          <svg
            width="12"
            height="12"
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

export function HeroMarquee({ onAdd }) {
  const {
    track1Ref,
    track2Ref,
    repeatedRow1,
    repeatedRow2,
    isHoveringRow1Ref,
    isHoveringRow2Ref
  } = useMarquee();

  return (
    <div className="kh-root">
      <section className="showcase-section" id="showcase">
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
          >
            <div className="marquee-track" ref={track1Ref}>
              {repeatedRow1.map((prod, idx) => (
                <ProductCard key={`r1-${prod.id}-${idx}`} product={prod} onAdd={onAdd} />
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
          >
            <div className="marquee-track" ref={track2Ref}>
              {repeatedRow2.map((prod, idx) => (
                <ProductCard key={`r2-${prod.id}-${idx}`} product={prod} onAdd={onAdd} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HeroMarquee;
