import { ExternalLink, Star, Plus } from "lucide-react";


function DealCard({
    product,
    onAdd
}) {

    const openDeal = () => {

        window.open(
            product.url,
            "_blank",
            "noopener,noreferrer"
        );

    };


    return (

        <article
            className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-[#0a0a0a]
                transition-all
                duration-500
                hover:-translate-y-2
                hover:border-[#22FF88]/50
                hover:shadow-[0_0_35px_rgba(34,255,136,.12)]
            "
        >

            {/* Product image */}

            <div
                className="
                    relative
                    h-64
                    overflow-hidden
                    bg-[#111]
                "
            >

                <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-700
                        group-hover:scale-110
                    "
                />


                {/* Discount */}

                <span
                    className="
                        absolute
                        left-4
                        top-4
                        rounded-full
                        bg-[#FFD60A]
                        px-3
                        py-1
                        text-xs
                        font-black
                        text-black
                        shadow-[0_0_18px_rgba(255,214,10,.3)]
                    "
                >
                    -{product.discount}%
                </span>


                {/* Store */}

                <span
                    className="
                        absolute
                        right-4
                        top-4
                        rounded-full
                        border
                        border-white/20
                        bg-black/70
                        px-3
                        py-1
                        text-xs
                        text-white
                        backdrop-blur-md
                    "
                >
                    {product.store}
                </span>

            </div>


            <div className="p-5">

                <div
                    className="
                        mb-2
                        flex
                        items-center
                        justify-between
                    "
                >

                    <span
                        className="
                            text-xs
                            uppercase
                            tracking-widest
                            text-[#38BDF8]
                        "
                    >
                        {product.category}
                    </span>


                    <span
                        className="
                            flex
                            items-center
                            gap-1
                            text-sm
                            text-[#FFD60A]
                        "
                    >
                        <Star
                            size={14}
                            fill="currentColor"
                        />

                        {product.rating}
                    </span>

                </div>


                <h3
                    className="
                        mb-4
                        min-h-[48px]
                        text-lg
                        font-bold
                        text-white
                    "
                >
                    {product.name}
                </h3>


                <div
                    className="
                        flex
                        items-end
                        justify-between
                        gap-3
                    "
                >

                    <div>

                        <p
                            className="
                                text-2xl
                                font-black
                                text-[#22FF88]
                            "
                        >
                            ₹{product.price.toLocaleString("en-IN")}
                        </p>

                        <del
                            className="
                                text-sm
                                text-gray-500
                            "
                        >
                            ₹{product.oldPrice.toLocaleString("en-IN")}
                        </del>

                    </div>


                    <button
                        onClick={() => onAdd(product)}
                        aria-label={`Add ${product.name}`}
                        className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            bg-[#22FF88]
                            text-black
                            transition
                            hover:scale-110
                            hover:shadow-[0_0_25px_rgba(34,255,136,.4)]
                            focus:outline-none
                            focus:ring-2
                            focus:ring-[#38BDF8]
                        "
                    >

                        <Plus size={20} />

                    </button>

                </div>


                <button
                    onClick={openDeal}
                    className="
                        mt-5
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-[#38BDF8]/40
                        bg-[#38BDF8]/10
                        py-3
                        font-bold
                        text-[#38BDF8]
                        transition
                        hover:bg-[#38BDF8]
                        hover:text-black
                    "
                >

                    View Original Deal

                    <ExternalLink size={16} />

                </button>

            </div>

        </article>

    );

}

export default DealCard;

