import { useMemo, useState } from "react";

import { Search, SlidersHorizontal } from "lucide-react";

import DealCard from "./DealCard.jsx";

import { deals } from "../data/dealsData";


function FeaturedDeals({ onAdd }) {

    const [category, setCategory] =
        useState("All");

    const [search, setSearch] =
        useState("");


    const categories = [
        "All",
        "Electronics",
        "Furniture",
        "Fashion",
        "Gaming",
        "Home"
    ];


    const filtered = useMemo(() => {

        return deals.filter(
            product => {

                const matchesCategory =
                    category === "All" ||
                    product.category === category;


                const matchesSearch =
                    product.name
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        );


                return (
                    matchesCategory &&
                    matchesSearch
                );

            }
        );

    }, [
        category,
        search
    ]);


    return (

        <section
            id="deals"
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

                <div
                    className="
                        flex
                        flex-col
                        justify-between
                        gap-8
                        lg:flex-row
                        lg:items-end
                    "
                >

                    <div>

                        <p
                            className="
                                text-sm
                                font-bold
                                uppercase
                                tracking-[.3em]
                                text-[#22FF88]
                            "
                        >
                            FEATURED DEALS
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
                            Deals worth
                            <span className="text-[#FFD60A]">
                                {" "}checking.
                            </span>
                        </h2>

                    </div>


                    {/* Search */}

                    <div
                        className="
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-2xl
                            border
                            border-white/10
                            bg-[#0a0a0a]
                            px-4
                            py-3
                            lg:max-w-sm
                        "
                    >

                        <Search
                            size={19}
                            className="text-[#38BDF8]"
                        />

                        <input
                            value={search}
                            onChange={event =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search deals..."
                            className="
                                w-full
                                bg-transparent
                                text-white
                                outline-none
                                placeholder:text-gray-600
                            "
                        />

                    </div>

                </div>


                {/* Categories */}

                <div
                    className="
                        mt-10
                        flex
                        gap-3
                        overflow-x-auto
                        pb-2
                    "
                >

                    <SlidersHorizontal
                        className="
                            mt-2
                            shrink-0
                            text-[#FFD60A]
                        "
                        size={18}
                    />

                    {categories.map(
                        item => (

                            <button
                                key={item}
                                onClick={() =>
                                    setCategory(item)
                                }
                                className={`
                                    shrink-0
                                    rounded-full
                                    px-5
                                    py-2.5
                                    text-sm
                                    font-bold
                                    transition
                                    ${
                                        category === item
                                            ? "bg-[#22FF88] text-black"
                                            : "border border-white/10 bg-[#0a0a0a] text-gray-400 hover:text-white"
                                    }
                                `}
                            >
                                {item}
                            </button>

                        )
                    )}

                </div>


                {/* Grid */}

                <div
                    className="
                        mt-12
                        grid
                        gap-6
                        sm:grid-cols-2
                        lg:grid-cols-3
                        xl:grid-cols-4
                    "
                >

                    {filtered.map(
                        product => (

                            <DealCard
                                key={product.id}
                                product={product}
                                onAdd={onAdd}
                            />

                        )
                    )}

                </div>


                {filtered.length === 0 && (

                    <div
                        className="
                            py-24
                            text-center
                        "
                    >

                        <h3
                            className="
                                text-2xl
                                font-black
                                text-white
                            "
                        >
                            No deals found
                        </h3>

                        <p
                            className="
                                mt-2
                                text-gray-500
                            "
                        >
                            Try another search or category.
                        </p>

                    </div>

                )}

            </div>

        </section>

    );

}

export default FeaturedDeals;