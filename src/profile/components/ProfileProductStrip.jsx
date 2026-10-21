import { useState, useEffect, useRef, useMemo } from "react";
import { BASE_URL } from "../../auth/auth.js";
import { respectReducedMotion } from "../../lib/motion.js";
import { INLINE_PRODUCTS } from "../../deals/components/HeroHead/useMarquee.js";

function resolveProductImage(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const clean = path.replace(/^\/+/, "");
  const viteBase =
    typeof import.meta !== "undefined" && import.meta.env?.BASE_URL && import.meta.env.BASE_URL !== "/"
      ? import.meta.env.BASE_URL.replace(/\/+$/, "") + "/"
      : "/";

  // Check if starts with public asset paths
  if (clean.startsWith("assets/") || clean.startsWith("public/")) {
    return `${viteBase}ksamhead/${clean.replace(/^public\//, "")}`;
  }
  return `${viteBase}${clean}`;
}

function StripCard({ product }) {
  const [imgFailed, setImgFailed] = useState(false);
  const initialLetter = product.name ? product.name.trim().charAt(0).toUpperCase() : "P";
  const imgSrc = resolveProductImage(product.image);
  const showcaseLink = `${BASE_URL}index.html#showcase`;

  return (
    <a
      href={showcaseLink}
      className="kx-strip-card"
      data-tone={product.accent || "green"}
      aria-label={`View deal for ${product.name} at ${product.price}`}
    >
      {/* Discount Badge */}
      {product.discount && (
        <span className="kx-strip-discount-badge">{product.discount}</span>
      )}

      {/* Image Container */}
      <div className="kx-strip-img-wrap">
        {!imgFailed && imgSrc ? (
          <img
            src={imgSrc}
            alt=""
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="kx-strip-img"
          />
        ) : (
          <div className="kx-strip-fallback-letter" aria-hidden="true">
            {initialLetter}
          </div>
        )}
      </div>

      {/* Product Name (2 lines max) */}
      <h3 className="kx-strip-prod-name" title={product.name}>
        {product.name}
      </h3>

      {/* Pricing Row */}
      <div className="kx-strip-price-row">
        <span className="kx-strip-price">{product.price}</span>
        {product.oldPrice && (
          <span className="kx-strip-old-price">{product.oldPrice}</span>
        )}
      </div>
    </a>
  );
}

export default function ProfileProductStrip() {
  const [products, setProducts] = useState(INLINE_PRODUCTS);
  const isReducedMotion = respectReducedMotion();
  const stripRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let active = true;
    const viteBase =
      typeof import.meta !== "undefined" && import.meta.env?.BASE_URL && import.meta.env.BASE_URL !== "/"
        ? import.meta.env.BASE_URL.replace(/\/+$/, "")
        : "";
    const fetchUrl = `${viteBase}/ksamhead/data/products.json`.replace(/\/+/g, "/");

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (active && data && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {
        // Fallback to INLINE_PRODUCTS
      });

    return () => {
      active = false;
    };
  }, []);

  // Pause when off-screen
  useEffect(() => {
    const el = stripRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPaused(!entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Split into 2 rows and duplicate each for seamless 40s loop
  const { row1, row2 } = useMemo(() => {
    const r1 = products.filter((p) => p.row !== 2);
    const r2 = products.filter((p) => p.row === 2);
    return {
      row1: [...r1, ...r1], // Duplicated for seamless loop
      row2: [...r2, ...r2]  // Duplicated for seamless loop
    };
  }, [products]);

  return (
    <section
      ref={stripRef}
      className={`kx-product-strip-section ${isPaused ? "is-offscreen" : ""}`}
      aria-label="Trending Deals Showcase"
    >
      {/* Section Header Reusing Home Marquee Heading Text */}
      <div className="kx-strip-header">
        <div className="kx-strip-eyebrow">Curated Selections</div>
        <h2 className="kx-strip-title">
          Trending <span className="kx-strip-title-gradient">Deals &amp; Drops</span>
        </h2>
        <p className="kx-strip-subtitle">
          Hand-picked flagship electronics with verified drops. Smooth continuous scroll updated every hour.
        </p>
      </div>

      {/* Dual Row Seamless Strip with Edge Fade Masks */}
      <div className={`kx-strip-container ${isReducedMotion ? "is-reduced-motion" : ""}`}>
        {/* Row 1: Left to Right */}
        <div className="kx-strip-row kx-strip-row--forward">
          <div className="kx-strip-track kx-strip-track--forward">
            {row1.map((product, idx) => (
              <StripCard key={`r1-${product.id}-${idx}`} product={product} />
            ))}
          </div>
        </div>

        {/* Row 2: Right to Left */}
        <div className="kx-strip-row kx-strip-row--reverse">
          <div className="kx-strip-track kx-strip-track--reverse">
            {row2.map((product, idx) => (
              <StripCard key={`r2-${product.id}-${idx}`} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
