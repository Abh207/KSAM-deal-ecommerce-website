import React, { useEffect, useRef, useState, memo, useMemo } from "react";
import {
  Layers,
  Wind,
  Coffee,
  Bot,
  Flame,
  Zap,
  UtensilsCrossed,
  Wallet,
  Glasses,
  Luggage,
  CupSoda,
  SmartphoneCharging,
  LayoutGrid,
  Headphones,
  Speaker,
  Volume2,
  Watch,
  Footprints,
  Shirt,
  Sparkles,
  Smartphone,
  Laptop,
  Camera,
  Gamepad2,
  Armchair,
  Heart
} from "lucide-react";
import "./categoryTiles.css";

// Helper component for count-up animation on scroll
const AnimatedCount = memo(function AnimatedCount({ target, trigger }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setCount(target);
      return;
    }

    let startTimestamp = null;
    const duration = 800; // ms
    let rafId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - (1 - progress) * (1 - progress);
      setCount(Math.round(ease * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, trigger]);

  return <span>{trigger ? count : target}</span>;
});

// Title & eyebrow config per category
const CATEGORY_TILES_HEADER_CONFIG = {
  audio: {
    eyebrow: "EXPLORE AUDIO",
    title: "Find your sound.",
    subtitle: "Choose the audio experience that matches your lifestyle."
  },
  "home-appliances": {
    eyebrow: "EXPLORE HOME APPLIANCES",
    title: "Upgrade your living space.",
    subtitle: "High-performance smart appliances designed for effortless daily comfort."
  },
  "accessories-lifestyle": {
    eyebrow: "EXPLORE ACCESSORIES & LIFESTYLE",
    title: "Find your everyday style.",
    subtitle: "Carefully curated leather goods, optical wear, and daily carry essentials."
  },
  clothing: {
    eyebrow: "EXPLORE CLOTHING",
    title: "Define your wardrobe.",
    subtitle: "Premium fabrics and modern fits tailored for all-day confidence."
  },
  watches: {
    eyebrow: "EXPLORE TIMEPIECES",
    title: "Master your time.",
    subtitle: "From luxury automatics to modern chronographs and sports dials."
  },
  shoes: {
    eyebrow: "EXPLORE FOOTWEAR",
    title: "Step into your style.",
    subtitle: "Performance sneakers, dress shoes, and casual runners crafted for movement."
  },
  beauty: {
    eyebrow: "EXPLORE BEAUTY & WELLNESS",
    title: "Find your signature glow.",
    subtitle: "Nourishing formulations, clean skincare, and radiant cosmetics."
  },
  chairs: {
    eyebrow: "EXPLORE ERGONOMIC SEATING",
    title: "Sit with supreme support.",
    subtitle: "Doctor-approved lumbar curves and premium leather craftsmanship."
  },
  electronics: {
    eyebrow: "EXPLORE CONSUMER TECH",
    title: "Power your productivity.",
    subtitle: "Flagship devices, fast computing, and gaming grade hardware."
  },
  fashion: {
    eyebrow: "EXPLORE FASHION & APPAREL",
    title: "Express your persona.",
    subtitle: "Signature apparel, iconic silhouettes, and statement pieces."
  }
};

// Subcategory icon selector
function getSubCategoryIcon(name = "") {
  const n = String(name).toLowerCase();

  // Home appliances
  if (n.includes("purifier") || n.includes("air")) return <Wind size={20} />;
  if (n.includes("espresso") || n.includes("coffee")) return <Coffee size={20} />;
  if (n.includes("robotic") || n.includes("robot") || n.includes("vacuum") && n.includes("robot")) return <Bot size={20} />;
  if (n.includes("fryer") || n.includes("air fryer")) return <Flame size={20} />;
  if (n.includes("cordless") || n.includes("stick")) return <Zap size={20} />;
  if (n.includes("cooker") || n.includes("instant pot") || n.includes("oven")) return <UtensilsCrossed size={20} />;

  // Lifestyle & accessories
  if (n.includes("cardholder") || n.includes("wallet")) return <Wallet size={20} />;
  if (n.includes("sunglass") || n.includes("glasses")) return <Glasses size={20} />;
  if (n.includes("duffle") || n.includes("bag") || n.includes("backpack") || n.includes("travel")) return <Luggage size={20} />;
  if (n.includes("tumbler") || n.includes("bottle") || n.includes("mug") || n.includes("drink")) return <CupSoda size={20} />;
  if (n.includes("charger") || n.includes("charging") || n.includes("wireless charger")) return <SmartphoneCharging size={20} />;
  if (n.includes("desk") || n.includes("mat") || n.includes("pad")) return <LayoutGrid size={20} />;

  // Audio
  if (n.includes("headphone")) return <Headphones size={20} />;
  if (n.includes("earbud") || n.includes("tws")) return <Headphones size={20} />;
  if (n.includes("speaker")) return <Speaker size={20} />;
  if (n.includes("soundbar")) return <Volume2 size={20} />;

  // Others
  if (n.includes("watch")) return <Watch size={20} />;
  if (n.includes("shoe") || n.includes("sneaker") || n.includes("footwear")) return <Footprints size={20} />;
  if (n.includes("shirt") || n.includes("dress") || n.includes("men") || n.includes("women") || n.includes("cloth")) return <Shirt size={20} />;
  if (n.includes("phone")) return <Smartphone size={20} />;
  if (n.includes("laptop")) return <Laptop size={20} />;
  if (n.includes("camera")) return <Camera size={20} />;
  if (n.includes("gaming")) return <Gamepad2 size={20} />;
  if (n.includes("chair")) return <Armchair size={20} />;
  if (n.includes("beauty") || n.includes("skin") || n.includes("serum")) return <Heart size={20} />;

  return <Sparkles size={20} />;
}

// Derive subcategory from individual product
export function deriveProductSubCategory(product, parentCategorySlug = "") {
  if (product.subCategory) return product.subCategory;
  if (product.type) return product.type;

  const name = String(product.name || product.title || "").toLowerCase();
  const desc = String(product.description || product.desc || "").toLowerCase();
  const pCat = String(product.category || "").toLowerCase();

  // Home Appliances
  if (name.includes("purifier") || desc.includes("purifier")) return "Air Purifiers";
  if (name.includes("espresso") || name.includes("coffee") || desc.includes("espresso")) return "Espresso Machines";
  if (name.includes("robotic") || name.includes("robot") || desc.includes("lidar")) return "Robotic Vacuums";
  if (name.includes("fryer") || desc.includes("air fryer")) return "Air Fryers";
  if (name.includes("cordless") || desc.includes("stick vacuum")) return "Cordless Vacuums";
  if (name.includes("cooker") || desc.includes("pressure cooker")) return "Multi-Cookers";

  // Accessories & Lifestyle
  if (name.includes("cardholder") || name.includes("wallet")) return "Wallets & Cards";
  if (name.includes("sunglass") || desc.includes("polarized")) return "Sunglasses";
  if (name.includes("duffle") || name.includes("bag") || name.includes("weekender")) return "Travel Bags";
  if (name.includes("tumbler") || name.includes("bottle")) return "Drinkware";
  if (name.includes("charging") || name.includes("wireless")) return "Tech Accessories";
  if (name.includes("desk") || name.includes("mat")) return "Desk Essentials";

  // Audio
  if (name.includes("earbud") || name.includes("tws") || pCat.includes("earbud")) return "Earbuds";
  if (name.includes("speaker") || pCat.includes("speaker")) return "Speakers";
  if (name.includes("headphone") || pCat.includes("headphone")) return "Headphones";
  if (name.includes("soundbar") || pCat.includes("soundbar")) return "Soundbars";
  if (name.includes("neckband") || pCat.includes("neckband")) return "Neckbands";

  // Clothing
  if (name.includes("women") || desc.includes("women")) return "Women's Collection";
  if (name.includes("men") || desc.includes("men")) return "Men's Collection";
  if (name.includes("dress") || desc.includes("dress")) return "Dresses";
  if (name.includes("jacket") || name.includes("hoodie") || name.includes("coat")) return "Jackets & Outerwear";
  if (name.includes("jean") || name.includes("pant") || name.includes("trouser")) return "Bottoms";
  if (name.includes("t-shirt") || name.includes("shirt") || name.includes("top")) return "Tops & Shirts";

  // Electronics
  if (name.includes("phone") || desc.includes("smartphone")) return "Smartphones";
  if (name.includes("laptop") || desc.includes("macbook") || desc.includes("zenbook")) return "Laptops";
  if (name.includes("gaming") || desc.includes("mouse") || desc.includes("keyboard")) return "Gaming Gear";
  if (name.includes("camera") || desc.includes("dslr") || desc.includes("lens")) return "Cameras & Photo";
  if (name.includes("smart") || desc.includes("smart home")) return "Smart Home";

  // Watches
  if (name.includes("smart") || desc.includes("smartwatch")) return "Smartwatches";
  if (name.includes("automatic") || name.includes("mechanical") || desc.includes("automatic")) return "Automatic Watches";
  if (name.includes("chronograph") || desc.includes("chronograph")) return "Chronographs";
  if (name.includes("sport") || desc.includes("diver") || desc.includes("waterproof")) return "Sports Watches";

  // Fallback to product category or "Essentials"
  if (product.category && product.category.toLowerCase() !== parentCategorySlug.toLowerCase()) {
    return product.category;
  }
  return "Featured Essentials";
}

export default function CategoryTilesSection({
  categorySlug = "audio",
  categoryLabel = "Audio",
  products = [],
  selectedSubCategory = "All",
  onSelectSubCategory,
  tilesSpeed = "18s"
}) {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [isTilesPaused, setIsTilesPaused] = useState(false);

  // IntersectionObserver for staggered reveal and count-up trigger
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 3D Tilt handlers for desktop
  const handleTileMouseMove = (e) => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.setProperty("--cat-mx", `${x}px`);
    card.style.setProperty("--cat-my", `${y}px`);
    card.style.transform = `perspective(700px) rotateX(${rotateX.toFixed(
      2
    )}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
  };

  const handleTileMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = "";
    card.style.removeProperty("--cat-mx");
    card.style.removeProperty("--cat-my");
  };

  // Derive subcategory tiles from current product list
  const tiles = useMemo(() => {
    const subCatCountMap = new Map();

    for (const prod of products) {
      const subCat = deriveProductSubCategory(prod, categorySlug);
      subCatCountMap.set(subCat, (subCatCountMap.get(subCat) || 0) + 1);
    }

    const subTiles = Array.from(subCatCountMap.entries()).map(([subCatName, count], idx) => ({
      id: `subcat-${idx + 1}`,
      name: subCatName,
      displayName: subCatName,
      count
    }));

    return [
      {
        id: "cat-all",
        name: "All",
        displayName: `All ${categoryLabel}`,
        count: products.length
      },
      ...subTiles
    ];
  }, [products, categoryLabel, categorySlug]);

  const headerConfig =
    CATEGORY_TILES_HEADER_CONFIG[categorySlug] || {
      eyebrow: `EXPLORE ${categoryLabel.toUpperCase()}`,
      title: "Find your style.",
      subtitle: "Choose the collection that matches your lifestyle."
    };

  return (
    <section
      ref={sectionRef}
      className={`audio-categories-section category-tiles-section ${inView ? "is-in-view" : ""}`}
      id="category-tiles-section"
      aria-label={`Explore ${categoryLabel} Sub-Categories`}
    >
      {/* Header */}
      <div className="audio-categories-heading">
        <span className="audio-cat-eyebrow">{headerConfig.eyebrow}</span>
        <h2 className="audio-cat-title">{headerConfig.title}</h2>
        <p className="audio-cat-subtitle">{headerConfig.subtitle}</p>
      </div>

      {/* Horizontal Scroll with edge fade & seamless fast auto-move on mobile */}
      <div
        className={`audio-cat-scroll-wrap ${isTilesPaused ? "is-paused" : ""}`}
        onTouchStart={() => setIsTilesPaused(true)}
        onTouchEnd={() => setIsTilesPaused(false)}
        onTouchCancel={() => setIsTilesPaused(false)}
        style={{ "--tiles-speed": tilesSpeed }}
      >
        <div
          className="audio-cat-grid"
          role="tablist"
          aria-label={`${categoryLabel} sub-categories`}
        >
          {/* Primary Track Group */}
          <div className="audio-cat-track-group">
            {tiles.map((tile, index) => {
              const isActive =
                tile.name === "All"
                  ? selectedSubCategory === "All"
                  : selectedSubCategory === tile.name;

              return (
                <button
                  key={tile.id || tile.name}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-pressed={isActive}
                  className={`audio-cat-card ${isActive ? "is-active" : ""}`}
                  style={{ "--stagger-idx": index }}
                  onClick={() => onSelectSubCategory(tile.name)}
                  onMouseMove={handleTileMouseMove}
                  onMouseLeave={handleTileMouseLeave}
                >
                  {/* Mouse spotlight gradient */}
                  <span className="audio-cat-spotlight" aria-hidden="true" />

                  {/* Subcategory Icon */}
                  <span className="audio-cat-icon-wrap" aria-hidden="true">
                    {tile.name === "All" ? <Layers size={20} /> : getSubCategoryIcon(tile.name)}
                  </span>

                  {/* Subcategory Title */}
                  <span className="audio-cat-name">{tile.displayName}</span>

                  {/* Live product count badge with animated count-up */}
                  <span
                    className="audio-cat-pill"
                    aria-label={`${tile.count} products`}
                    aria-live="polite"
                  >
                    <AnimatedCount target={tile.count} trigger={inView} />
                  </span>

                  {/* Sliding active neon indicator */}
                  {isActive && (
                    <span
                      className="audio-cat-active-indicator"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Cloned Track Group for Seamless Infinite Marquee on Mobile */}
          <div className="audio-cat-track-group is-clone" aria-hidden="true">
            {tiles.map((tile, index) => {
              const isActive =
                tile.name === "All"
                  ? selectedSubCategory === "All"
                  : selectedSubCategory === tile.name;

              return (
                <button
                  key={`${tile.id || tile.name}-clone`}
                  type="button"
                  role="tab"
                  tabIndex={-1}
                  aria-selected={isActive}
                  aria-pressed={isActive}
                  className={`audio-cat-card ${isActive ? "is-active" : ""}`}
                  style={{ "--stagger-idx": index }}
                  onClick={() => onSelectSubCategory(tile.name)}
                  onMouseMove={handleTileMouseMove}
                  onMouseLeave={handleTileMouseLeave}
                >
                  {/* Mouse spotlight gradient */}
                  <span className="audio-cat-spotlight" aria-hidden="true" />

                  {/* Subcategory Icon */}
                  <span className="audio-cat-icon-wrap" aria-hidden="true">
                    {tile.name === "All" ? <Layers size={20} /> : getSubCategoryIcon(tile.name)}
                  </span>

                  {/* Subcategory Title */}
                  <span className="audio-cat-name">{tile.displayName}</span>

                  {/* Live product count badge with animated count-up */}
                  <span
                    className="audio-cat-pill"
                    aria-label={`${tile.count} products`}
                    aria-live="polite"
                  >
                    <AnimatedCount target={tile.count} trigger={inView} />
                  </span>

                  {/* Sliding active neon indicator */}
                  {isActive && (
                    <span
                      className="audio-cat-active-indicator"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

