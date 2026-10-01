import {
    ArrowRight,
    Play,
    Zap,
    ShieldCheck,
    Globe
} from "lucide-react";

import { useEffect, useState } from "react";


function Hero() {

    const phrases = [
        "FIND THE DEAL.",
        "COMPARE SMARTER.",
        "SAVE MORE.",
        "SHOP WITHOUT NOISE."
    ];


    const [index, setIndex] =
        useState(0);


    useEffect(() => {

        const timer =
            setInterval(() => {

                setIndex(
                    previous =>
                        (previous + 1) %
                        phrases.length
                );

            }, 2500);


        return () =>
            clearInterval(timer);

    }, []);


    return (

        <section
            id="home"
            className="
                relative
                min-h-screen
                overflow-hidden
                bg-black
                pt-32
            "
        >

            {/* Background */}

            <div
                className="
                    pointer-events-none
                    absolute
                    left-[10%]
                    top-40
                    h-72
                    w-72
                    rounded-full
                    bg-[#22FF88]/10
                    blur-[100px]
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute
                    right-[10%]
                    top-72
                    h-80
                    w-80
                    rounded-full
                    bg-[#38BDF8]/10
                    blur-[110px]
                "
            />


            <div
                className="
                    relative
                    mx-auto
                    grid
                    max-w-7xl
                    items-center
                    gap-16
                    px-5
                    py-20
                    lg:grid-cols-2
                "
            >

                {/* Text */}

                <div>

                    <div
                        className="
                            mb-6
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-[#22FF88]/20
                            bg-[#22FF88]/5
                            px-4
                            py-2
                            text-sm
                            text-[#22FF88]
                        "
                    >

                        <Zap
                            size={15}
                            fill="currentColor"
                        />

                        Your personal deal hunter

                    </div>


                    <h1
                        className="
                            max-w-4xl
                            text-5xl
                            font-black
                            leading-[.95]
                            tracking-tight
                            text-white
                            sm:text-7xl
                            lg:text-8xl
                        "
                    >

                        {phrases[index]}

                        <span
                            className="
                                block
                                bg-gradient-to-r
                                from-[#22FF88]
                                via-white
                                to-[#38BDF8]
                                bg-clip-text
                                text-transparent
                            "
                        >
                            NOT THE NOISE.
                        </span>

                    </h1>


                    <p
                        className="
                            mt-8
                            max-w-xl
                            text-lg
                            leading-8
                            text-gray-400
                        "
                    >
                        Discover discounted products
                        from multiple online stores,
                        compare prices and jump directly
                        to the original seller.
                    </p>


                    <div
                        className="
                            mt-10
                            flex
                            flex-wrap
                            gap-4
                        "
                    >

                        <a
                            href="#deals"
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-[#22FF88]
                                px-6
                                py-4
                                font-black
                                text-black
                                transition
                                hover:-translate-y-1
                                hover:shadow-[0_0_35px_rgba(34,255,136,.3)]
                            "
                        >
                            Explore Deals

                            <ArrowRight
                                size={18}
                            />

                        </a>


                        <a
                            href="#how"
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-white/15
                                bg-white/5
                                px-6
                                py-4
                                font-bold
                                text-white
                                backdrop-blur
                                transition
                                hover:border-[#38BDF8]
                                hover:text-[#38BDF8]
                            "
                        >

                            <Play size={17} />

                            How It Works

                        </a>

                    </div>


                    <div
                        className="
                            mt-10
                            flex
                            flex-wrap
                            gap-5
                            text-sm
                            text-gray-500
                        "
                    >

                        <span className="flex gap-2">
                            <ShieldCheck
                                size={17}
                                className="text-[#22FF88]"
                            />
                            Verified links
                        </span>

                        <span className="flex gap-2">
                            <Globe
                                size={17}
                                className="text-[#38BDF8]"
                            />
                            Multiple stores
                        </span>

                    </div>

                </div>


                {/* Visual */}

                <div
                    className="
                        relative
                        hidden
                        min-h-[500px]
                        lg:block
                    "
                >

                    <div
                        className="
                            absolute
                            left-10
                            top-20
                            h-72
                            w-72
                            rounded-full
                            bg-[#22FF88]/10
                            blur-[100px]
                        "
                    />


                    <div
                        className="
                            absolute
                            right-10
                            top-10
                            h-64
                            w-64
                            rounded-full
                            bg-[#38BDF8]/10
                            blur-[100px]
                        "
                    />


                    <div
                        className="
                            absolute
                            left-16
                            top-28
                            w-72
                            rotate-[-8deg]
                            overflow-hidden
                            rounded-3xl
                            border
                            border-white/10
                            bg-[#0a0a0a]
                            shadow-2xl
                            animate-float
                        "
                    >

                        <img
                            src={phrases.length
                                ? "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80"
                                : ""}
                            alt="Featured headphones"
                            className="h-72 w-full object-cover"
                        />

                        <div className="p-5">

                            <p className="text-gray-400">
                                Wireless Headphones
                            </p>

                            <p className="mt-1 text-2xl font-black text-[#22FF88]">
                                ₹1,499
                            </p>

                        </div>

                    </div>


                    <div
                        className="
                            absolute
                            right-8
                            top-10
                            w-64
                            rotate-[8deg]
                            overflow-hidden
                            rounded-3xl
                            border
                            border-white/10
                            bg-[#0a0a0a]
                            shadow-2xl
                            animate-float
                        "
                        style={{
                            animationDelay: "1.2s"
                        }}
                    >

                        <img
                            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80"
                            alt="Smart watch"
                            className="
                                h-56
                                w-full
                                object-cover
                            "
                        />

                        <div className="p-4">

                            <p className="text-gray-400">
                                Smart Watch
                            </p>

                            <p className="text-xl font-black text-[#38BDF8]">
                                ₹1,999
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </section>

    );

}

export default Hero;