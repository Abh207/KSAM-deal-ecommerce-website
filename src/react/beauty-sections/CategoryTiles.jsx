import React from "react";
import { Sparkles, ArrowUpRight } from "lucide-react";

const CATEGORY_TILES = [
    {
        name: "Skin Care",
        image: "assets/images/beauty/tile-skincare.jpg",
        count: "12 Products",
        badge: "Most Popular",
        desc: "Cleansers, Toners & Serums"
    },
    {
        name: "Makeup",
        image: "assets/images/beauty/tile-makeup.jpg",
        count: "8 Products",
        badge: "Trending",
        desc: "Lipsticks, Foundations & Eyes"
    },
    {
        name: "Fragrance",
        image: "assets/images/beauty/tile-fragrance.jpg",
        count: "6 Products",
        badge: "Luxury",
        desc: "Eau de Parfum & Fine Mists"
    },
    {
        name: "Hair Care",
        image: "assets/images/beauty/tile-haircare.jpg",
        count: "10 Products",
        badge: "Salon Care",
        desc: "Shampoos, Conditioners & Oils"
    },
    {
        name: "Body Care",
        image: "assets/images/beauty/tile-bodycare.jpg",
        count: "8 Products",
        badge: "Spa Therapy",
        desc: "Lotions, Scrubs & Bath"
    }
];

const resolveUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const clean = path.replace(/^\/+/, "");
    if (path.startsWith(normalizedBase)) return path;
    return `${normalizedBase}${clean}`;
};

const CategoryTiles = ({ onSelectCategory }) => {
    const handleTileClick = (category) => {
        if (onSelectCategory) {
            onSelectCategory(category);
        }
        const productsEl = document.getElementById("products");
        if (productsEl) {
            productsEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <section className="beauty-section-wrap beauty-category-tiles-section" aria-label="Shop by Category">
            <div className="beauty-glass-panel">
                <div className="beauty-section-header-centered">
                    <div className="beauty-section-badge">
                        <Sparkles size={14} className="beauty-badge-icon" />
                        <span>EXPLORE COLLECTIONS</span>
                    </div>
                    <h2 className="beauty-section-title">Shop by Category</h2>
                    <p className="beauty-section-subtitle">
                        Find exactly what your beauty ritual craves across our specialized categories.
                    </p>
                </div>

                <div className="beauty-category-tiles-grid">
                    {CATEGORY_TILES.map((tile) => (
                        <div
                            key={tile.name}
                            className="beauty-category-tile"
                            onClick={() => handleTileClick(tile.name)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    handleTileClick(tile.name);
                                }
                            }}
                            aria-label={`Category: ${tile.name}, ${tile.count}. Click to filter products.`}
                        >
                            <div className="beauty-category-tile-media">
                                <img
                                    src={resolveUrl(tile.image)}
                                    alt={tile.name}
                                    className="beauty-category-tile-img"
                                    loading="lazy"
                                />
                                <div className="beauty-category-tile-overlay" />
                                <span className="beauty-category-tile-badge">{tile.badge}</span>
                            </div>

                            <div className="beauty-category-tile-info">
                                <span className="beauty-category-tile-count">{tile.count}</span>
                                <h3 className="beauty-category-tile-name">{tile.name}</h3>
                                <p className="beauty-category-tile-desc">{tile.desc}</p>
                                <span className="beauty-category-tile-link">
                                    <span>Explore</span>
                                    <ArrowUpRight size={16} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryTiles;
