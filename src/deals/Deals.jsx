import { useEffect, useState, useCallback } from "react";
import { requireAuth, getPendingAction, clearPendingAction, getStoredSessionSync } from "../auth/auth.js";
import KsamPreloader from "./components/KsamPreloader.jsx";


import Navbar
    from "./components/Navbar.jsx";

import HeroHead
    from "./components/HeroHead/HeroHead.jsx";

import HeroMarquee
    from "./components/HeroHead/HeroMarquee.jsx";

import Stats
    from "./components/Stats.jsx";

import PromoCarousel
    from "./components/PromoCarousel.jsx";

import Features
    from "./components/Features.jsx";

import HowItWorks
    from "./components/HowItWorks.jsx";

import FeaturedDeals
    from "./components/FeaturedDeals.jsx";

import Testimonials
    from "./components/Testimonials.jsx";

import Pricing
    from "./components/Pricing.jsx";

import FAQ
    from "./components/FAQ.jsx";

import Newsletter
    from "./components/Newsletter.jsx";

import Footer
    from "./components/Footer.jsx";

import Toast
    from "./components/Toast.jsx";

import CursorGlow
    from "./components/CursorGlow.jsx";

import ScrollProgress
    from "./components/ScrollProgress.jsx";
import { cartStore } from "./store/cartStore.js";
import "./responsive-cards.css";

function Deals() {
    const [toast, setToast] =
        useState("");


    const [allSearchResults, setAllSearchResults] =
        useState([]);

    const [searchPageQuery, setSearchPageQuery] =
        useState("");


    /*
    ==========================================
    PRELOADER (Cinematic Futuristic Experience)
    ==========================================
    */

    const [loading, setLoading] = useState(true);
    const [isPreloaderExiting, setIsPreloaderExiting] = useState(false);

    const handlePreloaderComplete = useCallback(() => {
        setIsPreloaderExiting(true);
        const exitTimer = setTimeout(() => {
            setLoading(false);
        }, 550);
        return () => clearTimeout(exitTimer);
    }, []);

    // Fallback timer ensures loading screen never hangs
    useEffect(() => {
        const fallbackTimer = setTimeout(() => {
            setIsPreloaderExiting(true);
            setTimeout(() => setLoading(false), 550);
        }, 2800);

        return () => clearTimeout(fallbackTimer);
    }, []);


    /*
    ==========================================
    TOAST
    ==========================================
    */

    useEffect(() => {

        if (!toast)
            return;


        const timer =
            setTimeout(
                () => setToast(""),
                2500
            );


        return () =>
            clearTimeout(timer);

    }, [toast]);

    useEffect(() => {
        const pending = getPendingAction();
        const hasSession = Boolean(getStoredSessionSync());
        if (pending && hasSession) {
            if (pending.pending?.type === "add_to_cart" && pending.pending.product) {
                cartStore.add(pending.pending.product);
                setToast(
                    `${pending.pending.product.name || "Product"} added to your deal list`
                );
            } else if (pending.pending?.type === "checkout") {
                const checkoutUrl = new URL("checkout.html", window.location.href).href;
                window.location.href = checkoutUrl;
            } else if (pending.pending?.type === "pricing") {
                setToast(
                    `Membership ${pending.pending.planName || "plan"} selected!`
                );
            }
            clearPendingAction();
        }
    }, []);

    function handleAdd(product) {
        if (!requireAuth({ type: "add_to_cart", product })) {
            return;
        }
        cartStore.add(product);
        setToast(
            `${product?.name || "Product"} added to your deal list`
        );
    }


    function handleViewAll(searchQuery, products) {

        setSearchPageQuery(searchQuery);

        setAllSearchResults(products);

    }


    return (

        <div
            className="
                min-h-screen
                overflow-x-hidden
                bg-black
                text-white
            "
        >
            {loading && (
                <KsamPreloader
                    isExiting={isPreloaderExiting}
                    onComplete={handlePreloaderComplete}
                />
            )}

            <ScrollProgress />

            <CursorGlow />

<Navbar
    onViewAll={handleViewAll}
/>

            <main>

    {/* SEARCH RESULTS */}
    {allSearchResults.length > 0 && (
        <section className="search-results-section">

            {/* Search Results Header */}
            <div className="search-results-header">

                <div>
                    <p className="search-results-label">
                        KSAM DEAL SEARCH
                    </p>

                    <h2>
                        Results for "{searchPageQuery}"
                    </h2>

                    <p>
                        {allSearchResults.length} products found
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setAllSearchResults([]);
                        setSearchPageQuery("");
                    }}
                    className="search-results-close"
                >
                    Clear results
                </button>

            </div>


            {/* Products Grid */}
            <div className="search-results-grid">

                {allSearchResults.map((product) => {

                    const discount =
                        product.oldPrice &&
                        product.price &&
                        Number(product.oldPrice) > Number(product.price)
                            ? Math.round(
                                (1 -
                                    Number(product.price) /
                                    Number(product.oldPrice)) *
                                100
                            )
                            : 0;

                    return (
                        <article
                            key={product.id}
                            className="search-product-card"
                        >

                            {/* Product Image */}
                            <div className="search-product-image">

                                {discount > 0 && (
                                    <span className="search-product-discount">
                                        {discount}% OFF
                                    </span>
                                )}

                                <img
                                    src={product.image}
                                    alt={product.name}
                                    loading="lazy"
                                    onError={(event) => {
                                        event.currentTarget.style.display =
                                            "none";
                                    }}
                                />

                            </div>


                            {/* Product Information */}
                            <div className="search-product-content">

                                {product.store && (
                                    <span className="search-product-store">
                                        {product.store}
                                    </span>
                                )}

                                <h3>
                                    {product.name}
                                </h3>


                                {/* Rating */}
                                {product.rating && (
                                    <div className="search-product-rating">
                                        ★ {product.rating}
                                    </div>
                                )}


                                {/* Price */}
                                <div className="search-product-price">

                                    <strong>
                                        ₹
                                        {Number(product.price || 0).toLocaleString(
                                            "en-IN"
                                        )}
                                    </strong>

                                    {discount > 0 && (
                                        <del>
                                            ₹
                                            {Number(
                                                product.oldPrice
                                            ).toLocaleString("en-IN")}
                                        </del>
                                    )}

                                </div>


                                {/* Actions */}
                                <div className="mt-3 flex items-center gap-2">
                                    {product.id && !String(product.id).startsWith("p-") && !String(product.id).startsWith("demo-") ? (
                                        <a
                                            href={`${import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/"}deal.html?id=${encodeURIComponent(product.id)}`}
                                            className="search-product-button"
                                        >
                                            View details ↗
                                        </a>
                                    ) : (
                                        <a
                                            href={product.url}
                                            target="_blank"
                                            rel="sponsored noopener noreferrer"
                                            className="search-product-button"
                                        >
                                            View Deal ↗
                                        </a>
                                    )}
                                </div>

                            </div>

                        </article>
                    );
                })}

            </div>

        </section>
    )}


    <HeroHead />

    <Stats />

    <PromoCarousel />

    <HeroMarquee onAdd={handleAdd} />

    <Features />

    <HowItWorks />

    <FeaturedDeals
        onAdd={handleAdd}
    />

    <Testimonials />

    <Pricing />

    <FAQ />

    <Newsletter />

</main>

            <Footer />


            <Toast
                message={toast}
                onClose={() =>
                    setToast("")
                }
            />

        </div>

    );

}


export default Deals;