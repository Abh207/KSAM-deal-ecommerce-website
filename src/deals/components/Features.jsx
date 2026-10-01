import {
    Search,
    GitCompare,
    BadgeDollarSign,
    Bell,
    Globe2,
    Sparkles
} from "lucide-react";


const features = [

    {
        icon: Search,
        title: "One Search",
        text: "Search products without opening multiple shopping apps."
    },

    {
        icon: GitCompare,
        title: "Compare Prices",
        text: "See prices and discounts from multiple stores."
    },

    {
        icon: BadgeDollarSign,
        title: "Find Savings",
        text: "Discover discounted products in one place."
    },

    {
        icon: Bell,
        title: "Deal Alerts",
        text: "Get notified when interesting deals appear."
    },

    {
        icon: Globe2,
        title: "Multiple Stores",
        text: "Explore products across different marketplaces."
    },

    {
        icon: Sparkles,
        title: "Smart Discovery",
        text: "Future AI features will personalize deal discovery."
    }

];


function Features() {

    return (

        <section
            id="features"
            className="
                bg-[#050505]
                py-28
            "
        >

            <div
                className="
                    mx-auto
                    max-w-7xl
                    px-5
                "
            >

                <div className="max-w-2xl">

                    <p
                        className="
                            text-sm
                            font-bold
                            uppercase
                            tracking-[.3em]
                            text-[#22FF88]
                        "
                    >
                        WHY KSAM DEAL
                    </p>

                    <h2
                        className="
                            mt-4
                            text-4xl
                            font-black
                            text-white
                            sm:text-5xl
                        "
                    >
                        Shopping discovery,
                        <span className="text-[#38BDF8]">
                            {" "}reimagined.
                        </span>
                    </h2>

                </div>


                <div
                    className="
                        mt-14
                        grid
                        gap-5
                        sm:grid-cols-2
                        lg:grid-cols-3
                    "
                >

                    {features.map(
                        feature => {

                            const Icon =
                                feature.icon;

                            return (

                                <article
                                    key={feature.title}
                                    className="
                                        group
                                        rounded-3xl
                                        border
                                        border-white/10
                                        bg-[#0a0a0a]
                                        p-7
                                        transition
                                        duration-500
                                        hover:-translate-y-2
                                        hover:border-[#22FF88]/40
                                    "
                                >

                                    <div
                                        className="
                                            mb-6
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-[#22FF88]/10
                                            text-[#22FF88]
                                            transition
                                            group-hover:bg-[#22FF88]
                                            group-hover:text-black
                                        "
                                    >

                                        <Icon />

                                    </div>


                                    <h3
                                        className="
                                            text-xl
                                            font-bold
                                            text-white
                                        "
                                    >
                                        {feature.title}
                                    </h3>


                                    <p
                                        className="
                                            mt-3
                                            leading-7
                                            text-gray-500
                                        "
                                    >
                                        {feature.text}
                                    </p>

                                </article>

                            );

                        }
                    )}

                </div>

            </div>

        </section>

    );

}

export default Features;