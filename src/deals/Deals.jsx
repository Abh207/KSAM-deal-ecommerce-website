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

import FeaturedDeals
    from "./components/FeaturedDeals.jsx";

import Testimonials
    from "./components/Testimonials.jsx";


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
import ProductCard
    from "./components/ProductCard.jsx";
import { saveDealsNavigationState, getDealsNavigationState, clearDealsNavigationState } from "./services/productService.js";
import { cartStore } from "./store/cartStore.js";
import "./responsive-cards.css";

export const SPLASH_SESSION_KEY = "ksam_splash_seen";

function checkHasSeenSplash() {
    try {
        return sessionStorage.getItem(SPLASH_SESSION_KEY) === "true";
    } catch {
        return false;
    }
}

function markSplashSeen() {
    try {
        sessionStorage.setItem(SPLASH_SESSION_KEY, "true");
    } catch {
        // Safe fallback
    }
}

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
    Show once per session, 12s duration, scroll lock
    ==========================================
    */

    const [loading, setLoading] = useState(() => !checkHasSeenSplash());
    const [isPreloaderExiting, setIsPreloaderExiting] = useState(false);

    const handlePreloaderComplete = useCallback(() => {
        markSplashSeen();
        setIsPreloaderExiting(true);
        const exitTimer = setTimeout(() => {
            setLoading(false);
        }, 600); // 0.6s smooth fade out
        return () => clearTimeout(exitTimer);
    }, []);

    // Lock page scroll while preloader is active, unlock when complete
    useEffect(() => {
        if (loading) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [loading]);


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


    useEffect(() => {
        const state = getDealsNavigationState();
        if (state?.isSearchMode && Array.isArray(state?.searchResults) && state.searchResults.length > 0) {
            setSearchPageQuery(state.searchPageQuery || "");
            setAllSearchResults(state.searchResults);
        }
    }, []);

    function handleViewAll(searchQuery, products) {
        setSearchPageQuery(searchQuery || "");
        setAllSearchResults(Array.isArray(products) ? products : []);
        saveDealsNavigationState({
            searchPageQuery: searchQuery || "",
            searchResults: Array.isArray(products) ? products : [],
            isSearchMode: true,
            scrollY: window.scrollY
        });
        setTimeout(() => {
            const el = document.querySelector(".search-results-section");
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }, 120);
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
                        clearDealsNavigationState();
                    }}
                    className="search-results-close"
                >
                    Clear results
                </button>

            </div>


            {/* Products Grid */}
            <div className="search-results-grid">
                {allSearchResults.map((product, idx) => (
                    <ProductCard
                        key={product.id || idx}
                        product={product}
                        index={idx}
                    />
                ))}
            </div>

        </section>
    )}


    <HeroHead />

    

    <PromoCarousel />

    <Stats />

    <HeroMarquee onAdd={handleAdd} />

    {/* <Features /> */}

    <FeaturedDeals
        onAdd={handleAdd}
    />

    <Features />

    <Testimonials />


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