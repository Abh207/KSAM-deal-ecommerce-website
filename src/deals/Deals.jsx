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
            />


            <main>

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