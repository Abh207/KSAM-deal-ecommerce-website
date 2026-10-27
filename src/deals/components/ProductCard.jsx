import { useState, useEffect } from "react";
import { Star, Heart, ArrowUpRight } from "lucide-react";
import { wishlistService } from "../services/wishlistService.js";
import { getCategoryFallbackImage } from "../services/productService.js";

/**
 * ProductCard matches Image 2 exactly:
 * - Card: background var(--card-bg), border-radius 24px, 1px border rgba(255,255,255,0.12).
 * - Inner padding: 22px on laptop, 14px on phone.
 * - Soft white glow layer (var(--card-glow)) behind product image.
 * - Top-left: Solid blue pill (#0a6cff) badge "New" or discount like "-43%".
 *   Height 35px, padding 0 18px, bold white 17px text (laptop).
 * - Top-right: Plain white OUTLINE heart icon (~34px laptop, 26px phone), 44px tap target.
 * - Image: Large, centered, object-fit contain (~55% card height), directly on dark gradient.
 * - Name: White, bold (700), left aligned, 20px laptop (clamp 15px phone), 1 line ellipsis laptop, max 2 phone.
 * - Price row on 1 line: Large bold white price (31px laptop, clamp 20px phone) in ₹,
 *   yellow (#ffc107) filled star + white bold rating. Original price directly UNDER price (~13px muted).
 * - Button: Full-width WHITE pill (#ffffff), border-radius 999px, height 54px laptop / 46px phone,
 *   centered bold BLACK text "View Product" (22px laptop, 16px phone) with black icon to the left.
 */
export function ProductCard({ product, onOpenDetails }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    wishlistService.isSaved(product.id).then((saved) => {
      if (active) setIsSaved(saved);
    });

    const unsub = wishlistService.subscribe(() => {
      wishlistService.isSaved(product.id).then((saved) => {
        if (active) setIsSaved(saved);
      });
    });

    return () => {
      active = false;
      unsub();
    };
  }, [product.id]);

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    setSaving(true);
    try {
      const nextState = await wishlistService.toggle(product);
      setIsSaved(nextState);
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCardClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onOpenDetails) {
      onOpenDetails(product);
      return;
    }
    window.location.hash = `product-${product.id}`;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(e);
    }
  };

  const displayImage =
    !imgFailed && product.image
      ? product.image
      : getCategoryFallbackImage(product.category, product.name);

  const ratingValue = product.rating ? Number(product.rating).toFixed(1) : "4.5";
  const badgeText = product.discount && product.discount > 0 ? `-${product.discount}%` : "New";

  return (
    <article
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${product.name}`}
      className="ksam-product-card group"
    >
      {/* Soft white glow layer behind image */}
      <div className="ksam-card-glow-bg" aria-hidden="true" />

      {/* Top row: Badge on left, heart on right, vertically centered on the same line */}
      <div className="ksam-card-top-row">
        <div className="ksam-card-badge-wrap">
          <span className="ksam-card-badge">{badgeText}</span>
        </div>

        <button
          onClick={handleToggleSave}
          type="button"
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          className="ksam-card-heart-btn"
        >
          <Heart
            strokeWidth={1.8}
            fill={isSaved ? "#ffffff" : "none"}
            color="#ffffff"
            className="ksam-card-heart-icon"
          />
        </button>
      </div>

      {/* 1. Image Area: Photo sits directly on the dark gradient */}
      <div className="ksam-card-img-wrap">
        {/* Shimmer skeleton while loading */}
        {!imgLoaded && !imgFailed && (
          <div aria-hidden="true" className="ksam-card-img-skeleton" />
        )}

        {/* Product photo */}
        <img
          src={displayImage}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            if (!imgFailed) {
              setImgFailed(true);
            }
            setImgLoaded(true);
          }}
          className={`ksam-card-img ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        />

        {/* Fallback gradient banner with product name if image fails */}
        {imgFailed && (
          <div className="ksam-card-img-fallback">
            <span>{product.name}</span>
          </div>
        )}
      </div>

      {/* 2. Content Area */}
      <div className="ksam-card-content">
        {/* Product Name */}
        <h3 title={product.name} className="ksam-card-title">
          {product.name}
        </h3>

        {/* Price Row on one line */}
        <div className="ksam-card-price-row">
          <div className="ksam-card-price-col">
            <span className="ksam-card-price">
              ₹{Number(product.price || 0).toLocaleString("en-IN")}
            </span>
            {/* Original price directly under current price */}
            {product.oldPrice > product.price && (
              <del className="ksam-card-old-price">
                ₹{Number(product.oldPrice).toLocaleString("en-IN")}
              </del>
            )}
          </div>

          {/* Yellow star rating on the right */}
          <div className="ksam-card-rating">
            <Star
              size={18}
              fill="#ffc107"
              stroke="#ffc107"
              className="shrink-0"
            />
            <span className="ksam-card-rating-num">{ratingValue}</span>
          </div>
        </div>

        {/* 3. Button: Full-width WHITE pill with black bold "View Product" */}
        <div className="ksam-card-btn-wrap">
          <button
            type="button"
            onClick={handleCardClick}
            className="ksam-view-btn"
          >
            <ArrowUpRight
              size={20}
              strokeWidth={2.6}
              className="ksam-view-btn-icon shrink-0"
            />
            <span>View Product</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
