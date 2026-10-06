import { useEffect, useState } from "react";


import Navbar
    from "./components/Navbar.jsx";

import Hero
    from "./components/Hero.jsx";

import Stats
    from "./components/Stats.jsx";

import Marquee
    from "./components/Marquee.jsx";

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


function Deals() {

    const [cartCount, setCartCount] =
        useState(0);

    const [toast, setToast] =
        useState("");


    const [allSearchResults, setAllSearchResults] =
        useState([]);

    const [searchPageQuery, setSearchPageQuery] =
        useState("");


    /*
    ==========================================
    PRELOADER
    ==========================================
    */

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        const timer =
            setTimeout(
                () => setLoading(false),
                900
            );


        return () =>
            clearTimeout(timer);

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


    function handleAdd(product) {

        setCartCount(
            count => count + 1
        );


        setToast(
            `${product.name} added to your deal list`
        );

    }


    function handleViewAll(searchQuery, products) {

        setSearchPageQuery(searchQuery);

        setAllSearchResults(products);

    }


    if (loading) {

        return (

            <div
                className="
                    flex
                    min-h-screen
                    items-center
                    justify-center
                    bg-black
                "
            >

                <div className="text-center">

                    <div
                        className="
                            mx-auto
                            h-14
                            w-14
                            animate-spin
                            rounded-full
                            border-4
                            border-white/10
                            border-t-[#22FF88]
                        "
                    />

                    <p
                        className="
                            mt-5
                            text-sm
                            font-bold
                            tracking-widest
                            text-white
                        "
                    >
                        KSAM DEAL
                    </p>

                </div>

            </div>

        );

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

            <ScrollProgress />

            <CursorGlow />

<Navbar
    cartCount={cartCount}
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


                                {/* View Deal */}
                                <a
                                    href={product.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="search-product-button"
                                >
                                    View Deal ↗
                                </a>

                            </div>

                        </article>
                    );
                })}

            </div>

        </section>
    )}


    <Hero />

    <Stats />

    <Marquee />

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