import { Star } from "lucide-react";

import { deals } from "../data/dealsData";


function ProductMiniCard({ product }) {

    return (

        <div
            className="
                group
                flex
                w-[280px]
                shrink-0
                items-center
                gap-4
                rounded-2xl
                border
                border-white/10
                bg-[#0a0a0a]
                p-3
                transition
                hover:scale-[1.03]
                hover:border-[#22FF88]/50
                hover:shadow-[0_0_30px_rgba(34,255,136,.1)]
            "
        >

            <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="
                    h-20
                    w-20
                    rounded-xl
                    object-cover
                "
            />


            <div className="min-w-0 flex-1">

                <p
                    className="
                        truncate
                        text-sm
                        font-bold
                        text-white
                    "
                >
                    {product.name}
                </p>

                <p
                    className="
                        mt-1
                        font-black
                        text-[#22FF88]
                    "
                >
                    ₹{product.price.toLocaleString("en-IN")}
                </p>

                <div
                    className="
                        mt-1
                        flex
                        items-center
                        gap-1
                        text-xs
                        text-[#FFD60A]
                    "
                >

                    <Star
                        size={12}
                        fill="currentColor"
                    />

                    {product.rating}

                </div>

            </div>


            <button
                className="
                    rounded-lg
                    bg-[#22FF88]
                    px-3
                    py-2
                    text-xs
                    font-black
                    text-black
                    opacity-0
                    transition
                    group-hover:opacity-100
                "
            >
                Add
            </button>

        </div>

    );

}


function MarqueeRow({
    products,
    reverse = false
}) {

    const items = [
        ...products,
        ...products
    ];


    return (

        <div
            className="
                overflow-hidden
                [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]
            "
        >

            <div
                className={`
                    flex
                    w-max
                    gap-5
                    py-3
                    ${
                        reverse
                            ? "animate-marquee-right"
                            : "animate-marquee-left"
                    }
                    hover:[animation-play-state:paused]
                `}
            >

                {items.map(
                    (product, index) => (

                        <ProductMiniCard
                            key={`${product.id}-${index}`}
                            product={product}
                        />

                    )
                )}

            </div>

        </div>

    );

}


function Marquee() {

    return (

        <section
            className="
                overflow-hidden
                bg-black
                py-24
            "
        >

            <div className="mx-auto max-w-7xl px-5">

                <div className="mb-12">

                    <p
                        className="
                            text-sm
                            font-bold
                            uppercase
                            tracking-[.3em]
                            text-[#38BDF8]
                        "
                    >
                        LIVE DEAL STREAM
                    </p>

                    <h2
                        className="
                            mt-3
                            text-4xl
                            font-black
                            text-white
                            sm:text-5xl
                        "
                    >
                        Deals moving
                        <span className="text-[#22FF88]">
                            {" "}all day.
                        </span>
                    </h2>

                </div>

            </div>


            <MarqueeRow
                products={deals.slice(0, 8)}
            />

            <MarqueeRow
                products={deals.slice(4, 12)}
                reverse
            />

        </section>

    );

}

export default Marquee;