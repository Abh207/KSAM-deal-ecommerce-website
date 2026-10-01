const plans = [

    {
        name: "Explorer",
        price: "Free",
        description:
            "For discovering deals.",
        features: [
            "Deal discovery",
            "Product search",
            "Category filters",
            "External store links"
        ]
    },

    {
        name: "Deal Hunter",
        price: "₹99",
        description:
            "For frequent deal hunters.",
        features: [
            "Everything in Explorer",
            "Deal alerts",
            "Saved products",
            "Price tracking"
        ],
        popular: true
    },

    {
        name: "Pro",
        price: "₹199",
        description:
            "For advanced shoppers.",
        features: [
            "Everything in Deal Hunter",
            "Advanced tracking",
            "Personalized recommendations",
            "AI-powered discovery"
        ]
    }

];


function Pricing() {

    return (

        <section className="bg-[#050505] py-28">

            <div
                className="
                    mx-auto
                    max-w-6xl
                    px-5
                "
            >

                <div className="text-center">

                    <p
                        className="
                            text-sm
                            font-bold
                            uppercase
                            tracking-[.3em]
                            text-[#38BDF8]
                        "
                    >
                        MEMBERSHIP
                    </p>

                    <h2
                        className="
                            mt-4
                            text-4xl
                            font-black
                            text-white
                        "
                    >
                        Choose your
                        <span className="text-[#22FF88]">
                            {" "}deal mode.
                        </span>
                    </h2>

                </div>


                <div
                    className="
                        mt-14
                        grid
                        gap-6
                        md:grid-cols-3
                    "
                >

                    {plans.map(
                        plan => (

                            <article
                                key={plan.name}
                                className={`
                                    rounded-3xl
                                    border
                                    p-7
                                    ${
                                        plan.popular
                                            ? "border-[#22FF88] bg-[#22FF88]/5 shadow-[0_0_40px_rgba(34,255,136,.08)]"
                                            : "border-white/10 bg-[#0a0a0a]"
                                    }
                                `}
                            >

                                {plan.popular && (

                                    <span
                                        className="
                                            rounded-full
                                            bg-[#FFD60A]
                                            px-3
                                            py-1
                                            text-xs
                                            font-black
                                            text-black
                                        "
                                    >
                                        MOST POPULAR
                                    </span>

                                )}


                                <h3
                                    className="
                                        mt-5
                                        text-xl
                                        font-black
                                        text-white
                                    "
                                >
                                    {plan.name}
                                </h3>


                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        text-gray-500
                                    "
                                >
                                    {plan.description}
                                </p>


                                <p
                                    className="
                                        mt-7
                                        text-4xl
                                        font-black
                                        text-[#22FF88]
                                    "
                                >
                                    {plan.price}
                                </p>


                                <ul className="mt-7 space-y-4">

                                    {plan.features.map(
                                        feature => (

                                            <li
                                                key={feature}
                                                className="
                                                    text-sm
                                                    text-gray-400
                                                "
                                            >
                                                <span className="mr-2 text-[#22FF88]">
                                                    ✓
                                                </span>

                                                {feature}

                                            </li>

                                        )
                                    )}

                                </ul>


                                <button
                                    className="
                                        mt-8
                                        w-full
                                        rounded-xl
                                        border
                                        border-[#22FF88]/30
                                        py-3
                                        font-bold
                                        text-[#22FF88]
                                        transition
                                        hover:bg-[#22FF88]
                                        hover:text-black
                                    "
                                >
                                    Get Started
                                </button>

                            </article>

                        )
                    )}

                </div>

            </div>

        </section>

    );

}

export default Pricing;