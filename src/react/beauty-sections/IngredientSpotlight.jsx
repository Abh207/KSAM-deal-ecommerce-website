import React, { useState } from "react";
import { Sparkles, CheckCircle2, RotateCw } from "lucide-react";

const INGREDIENTS = [
    {
        id: "vitc",
        name: "Vitamin C",
        badge: "Brightening Hero",
        image: "assets/images/beauty/ingredient-vitc.jpg",
        description: "A potent antioxidant that accelerates collagen synthesis and illuminates tired skin.",
        benefits: [
            "Fades stubborn dark spots & hyperpigmentation",
            "Neutralizes free radical environmental damage",
            "Restores youthful elasticity and firm texture",
            "Promotes an even, lit-from-within glow"
        ]
    },
    {
        id: "hyaluronic",
        name: "Hyaluronic Acid",
        badge: "Hydration Magnet",
        image: "assets/images/beauty/ingredient-hyaluronic.jpg",
        description: "Naturally occurring molecule capable of binding up to 1,000 times its weight in moisture.",
        benefits: [
            "Draws intense multi-depth cellular hydration",
            "Instantly plumps fine lines and smile wrinkles",
            "Strengthens the lipid barrier against dryness",
            "Leaves skin soft, supple, and bouncy"
        ]
    },
    {
        id: "aloe",
        name: "Aloe Vera",
        badge: "Calming Elixir",
        image: "assets/images/beauty/ingredient-aloe.jpg",
        description: "Pure soothing botanical rich in vitamins A, C, E, minerals, and restorative polysaccharides.",
        benefits: [
            "Cools redness, inflammation, and sunburn",
            "Accelerates recovery from blemishes and irritation",
            "Delivers lightweight, grease-free hydration",
            "Safe and gentle for sensitive skin barriers"
        ]
    },
    {
        id: "rose",
        name: "Rose Extract",
        badge: "Balancing Bloom",
        image: "assets/images/beauty/ingredient-rose.jpg",
        description: "Distilled organic damascena rose petals packed with anti-inflammatory polyphenols.",
        benefits: [
            "Balances skin's natural acidic pH balance",
            "Tightens enlarged pores and refines texture",
            "Infuses subtle, all-natural floral aromatherapy",
            "Hydrates dull skin for a refreshed radiance"
        ]
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

const IngredientSpotlight = () => {
    const [flippedCards, setFlippedCards] = useState({});

    const toggleFlip = (id) => {
        setFlippedCards((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <section className="beauty-section-wrap beauty-ingredients-section" aria-label="Ingredient Spotlight">
            <div className="beauty-glass-panel">
                <div className="beauty-section-header-centered">
                    <div className="beauty-section-badge">
                        <Sparkles size={14} className="beauty-badge-icon" />
                        <span>CLEAN & POTENT BOTANICALS</span>
                    </div>
                    <h2 className="beauty-section-title">Ingredient Spotlight</h2>
                    <p className="beauty-section-subtitle">
                        Hover or tap each card to reveal the science-backed skin benefits behind our core ingredients.
                    </p>
                </div>

                <div className="beauty-ingredients-grid">
                    {INGREDIENTS.map((item) => {
                        const isFlipped = !!flippedCards[item.id];
                        return (
                            <div
                                key={item.id}
                                className={`beauty-ingredient-card-wrap${isFlipped ? " is-flipped" : ""}`}
                                onClick={() => toggleFlip(item.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        toggleFlip(item.id);
                                    }
                                }}
                                aria-label={`${item.name} flip card. Press enter to flip.`}
                            >
                                <div className="beauty-ingredient-card-inner">
                                    {/* Front Side */}
                                    <div className="beauty-ingredient-card-face beauty-ingredient-card-front">
                                        <div className="beauty-ingredient-img-wrap">
                                            <img
                                                src={resolveUrl(item.image)}
                                                alt={item.name}
                                                className="beauty-ingredient-img"
                                                loading="lazy"
                                            />
                                            <span className="beauty-ingredient-badge">{item.badge}</span>
                                        </div>
                                        <div className="beauty-ingredient-front-body">
                                            <h3 className="beauty-ingredient-name">{item.name}</h3>
                                            <p className="beauty-ingredient-desc">{item.description}</p>
                                            <span className="beauty-flip-hint">
                                                <RotateCw size={14} />
                                                <span>Flip for benefits</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Back Side */}
                                    <div className="beauty-ingredient-card-face beauty-ingredient-card-back">
                                        <div className="beauty-ingredient-back-header">
                                            <span className="beauty-ingredient-back-pill">Key Skin Benefits</span>
                                            <h3 className="beauty-ingredient-back-name">{item.name}</h3>
                                        </div>
                                        <ul className="beauty-ingredient-benefits-list">
                                            {item.benefits.map((b, i) => (
                                                <li key={i} className="beauty-ingredient-benefit-item">
                                                    <CheckCircle2 size={16} className="beauty-benefit-tick" />
                                                    <span>{b}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <span className="beauty-flip-hint">
                                            <RotateCw size={14} />
                                            <span>Tap to flip back</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default IngredientSpotlight;
