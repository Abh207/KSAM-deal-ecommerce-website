// import { useMemo, useState } from "react";

// import { Search, SlidersHorizontal } from "lucide-react";

// import DealCard from "./DealCard.jsx";

// import { deals } from "../data/dealsData";


// function FeaturedDeals({ onAdd }) {

//     const [category, setCategory] =
//         useState("All");

//     const [search, setSearch] =
//         useState("");


//     const categories = [
//         "All",
//         "Electronics",
//         "Furniture",
//         "Fashion",
//         "Gaming",
//         "Home"
//     ];


//     const filtered = useMemo(() => {

//         return deals.filter(
//             product => {

//                 const matchesCategory =
//                     category === "All" ||
//                     product.category === category;


//                 const matchesSearch =
//                     product.name
//                         .toLowerCase()
//                         .includes(
//                             search.toLowerCase()
//                         );


//                 return (
//                     matchesCategory &&
//                     matchesSearch
//                 );

//             }
//         );

//     }, [
//         category,
//         search
//     ]);


//     return (

//         <section
//             id="deals"
//             className="
//                 bg-[#050505]
//                 py-28
//             "
//         >

//             <div
//                 className="
//                     mx-auto
//                     max-w-7xl
//                     px-5
//                 "
//             >

//                 <div
//                     className="
//                         flex
//                         flex-col
//                         justify-between
//                         gap-8
//                         lg:flex-row
//                         lg:items-end
//                     "
//                 >

//                     <div>

//                         <p
//                             className="
//                                 text-sm
//                                 font-bold
//                                 uppercase
//                                 tracking-[.3em]
//                                 text-[#22FF88]
//                             "
//                         >
//                             FEATURED DEALS
//                         </p>

//                         <h2
//                             className="
//                                 mt-4
//                                 text-4xl
//                                 font-black
//                                 text-white
//                                 sm:text-5xl
//                             "
//                         >
//                             Deals worth
//                             <span className="text-[#FFD60A]">
//                                 {" "}checking.
//                             </span>
//                         </h2>

//                     </div>


//                     {/* Search */}

//                     <div
//                         className="
//                             flex
//                             w-full
//                             items-center
//                             gap-3
//                             rounded-2xl
//                             border
//                             border-white/10
//                             bg-[#0a0a0a]
//                             px-4
//                             py-3
//                             lg:max-w-sm
//                         "
//                     >

//                         <Search
//                             size={19}
//                             className="text-[#38BDF8]"
//                         />

//                         <input
//                             value={search}
//                             onChange={event =>
//                                 setSearch(
//                                     event.target.value
//                                 )
//                             }
//                             placeholder="Search deals..."
//                             className="
//                                 w-full
//                                 bg-transparent
//                                 text-white
//                                 outline-none
//                                 placeholder:text-gray-600
//                             "
//                         />

//                     </div>

//                 </div>


//                 {/* Categories */}

//                 <div
//                     className="
//                         mt-10
//                         flex
//                         gap-3
//                         overflow-x-auto
//                         pb-2
//                     "
//                 >

//                     <SlidersHorizontal
//                         className="
//                             mt-2
//                             shrink-0
//                             text-[#FFD60A]
//                         "
//                         size={18}
//                     />

//                     {categories.map(
//                         item => (

//                             <button
//                                 key={item}
//                                 onClick={() =>
//                                     setCategory(item)
//                                 }
//                                 className={`
//                                     shrink-0
//                                     rounded-full
//                                     px-5
//                                     py-2.5
//                                     text-sm
//                                     font-bold
//                                     transition
//                                     ${
//                                         category === item
//                                             ? "bg-[#22FF88] text-black"
//                                             : "border border-white/10 bg-[#0a0a0a] text-gray-400 hover:text-white"
//                                     }
//                                 `}
//                             >
//                                 {item}
//                             </button>

//                         )
//                     )}

//                 </div>


//                 {/* Grid */}

//                 <div
//                     className="
//                         mt-12
//                         grid
//                         gap-6
//                         sm:grid-cols-2
//                         lg:grid-cols-3
//                         xl:grid-cols-4
//                     "
//                 >

//                     {filtered.map(
//                         product => (

//                             <DealCard
//                                 key={product.id}
//                                 product={product}
//                                 onAdd={onAdd}
//                             />

//                         )
//                     )}

//                 </div>


//                 {filtered.length === 0 && (

//                     <div
//                         className="
//                             py-24
//                             text-center
//                         "
//                     >

//                         <h3
//                             className="
//                                 text-2xl
//                                 font-black
//                                 text-white
//                             "
//                         >
//                             No deals found
//                         </h3>

//                         <p
//                             className="
//                                 mt-2
//                                 text-gray-500
//                             "
//                         >
//                             Try another search or category.
//                         </p>

//                     </div>

//                 )}

//             </div>

//         </section>

//     );

// }

// export default FeaturedDeals;


import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, RefreshCw } from "lucide-react";

import DealCard from "./DealCard.jsx";
import { getDeals } from "../services/productService.js";


function FeaturedDeals({ onAdd }) {

    // ==========================================
    // STATE
    // ==========================================

    const [products, setProducts] = useState([]);

    const [category, setCategory] =
        useState("All");

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ==========================================
    // FETCH PRODUCTS FROM SUPABASE
    // ==========================================

    async function loadDeals() {

        try {

            setLoading(true);
            setError("");

            const data = await getDeals();

            console.log(
                "KSAM DEAL - Supabase products:",
                data
            );

            setProducts(data || []);

        } catch (err) {

            console.error(
                "Failed to load deals:",
                err
            );

            setError(
                "Unable to load deals right now."
            );

            setProducts([]);

        } finally {

            setLoading(false);

        }

    }


    // ==========================================
    // LOAD WHEN COMPONENT MOUNTS
    // ==========================================

    useEffect(() => {

        loadDeals();

    }, []);


    // ==========================================
    // CREATE CATEGORIES FROM SUPABASE PRODUCTS
    // ==========================================

    const categories = useMemo(() => {

        const uniqueCategories =
            products
                .map(product => product.category)
                .filter(Boolean);

        return [
            "All",
            ...new Set(uniqueCategories)
        ];

    }, [products]);


    // ==========================================
    // SEARCH + CATEGORY FILTER
    // ==========================================

    const filtered = useMemo(() => {

        const searchText =
            search
                .trim()
                .toLowerCase();


        return products.filter(product => {

            const matchesCategory =
                category === "All" ||
                product.category === category;


            const matchesSearch =
                !searchText ||
                product.name
                    ?.toLowerCase()
                    .includes(searchText) ||

                product.store
                    ?.toLowerCase()
                    .includes(searchText) ||

                product.category
                    ?.toLowerCase()
                    .includes(searchText);


            return (
                matchesCategory &&
                matchesSearch
            );

        });

    }, [
        products,
        category,
        search
    ]);


    // ==========================================
    // RESET FILTERS
    // ==========================================

    function resetFilters() {

        setSearch("");
        setCategory("All");

    }


    // ==========================================
    // UI
    // ==========================================

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

                {/* =================================
                    HEADER
                ================================= */}

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
                            LIVE DEALS
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

                            <span
                                className="
                                    text-[#FFD60A]
                                "
                            >
                                {" "}checking.
                            </span>

                        </h2>


                        <p
                            className="
                                mt-4
                                max-w-2xl
                                text-gray-500
                            "
                        >
                            Discover discounted products collected
                            from multiple stores and marketplaces.
                        </p>

                    </div>


                    {/* =============================
                        SEARCH
                    ============================== */}

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
                            transition
                            focus-within:border-[#22FF88]/50
                            focus-within:shadow-[0_0_30px_rgba(34,255,136,.08)]
                            lg:max-w-sm
                        "
                    >

                        <Search
                            size={19}
                            className="
                                shrink-0
                                text-[#38BDF8]
                            "
                        />


                        <input
                            value={search}
                            onChange={event =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search products, stores..."
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


                {/* =================================
                    SUPABASE STATUS
                ================================= */}

                <div
                    className="
                        mt-8
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-4
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            text-sm
                            text-gray-500
                        "
                    >

                        <span
                            className="
                                h-2
                                w-2
                                animate-pulse
                                rounded-full
                                bg-[#22FF88]
                            "
                        />

                        <span>
                            {loading
                                ? "Fetching latest deals..."
                                : `${products.length} deals available`
                            }
                        </span>

                    </div>


                    {!loading && !error && (

                        <button
                            onClick={loadDeals}
                            className="
                                flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-white/10
                                bg-white/[0.03]
                                px-4
                                py-2
                                text-sm
                                font-bold
                                text-gray-400
                                transition
                                hover:border-[#22FF88]/40
                                hover:text-[#22FF88]
                            "
                        >

                            <RefreshCw
                                size={15}
                            />

                            Refresh deals

                        </button>

                    )}

                </div>


                {/* =================================
                    CATEGORIES
                ================================= */}

                {!loading && !error && (

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


                        {categories.map(item => (

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

                                            ? `
                                                bg-[#22FF88]
                                                text-black
                                                shadow-[0_0_20px_rgba(34,255,136,.18)]
                                            `

                                            : `
                                                border
                                                border-white/10
                                                bg-[#0a0a0a]
                                                text-gray-400
                                                hover:border-[#22FF88]/30
                                                hover:text-white
                                            `
                                    }
                                `}
                            >

                                {item}

                            </button>

                        ))}

                    </div>

                )}


                {/* =================================
                    ERROR
                ================================= */}

                {error && (

                    <div
                        className="
                            mt-12
                            rounded-2xl
                            border
                            border-red-500/20
                            bg-red-500/[0.05]
                            p-10
                            text-center
                        "
                    >

                        <p
                            className="
                                text-lg
                                font-bold
                                text-white
                            "
                        >
                            Unable to load deals
                        </p>


                        <p
                            className="
                                mt-2
                                text-sm
                                text-gray-500
                            "
                        >
                            {error}
                        </p>


                        <button
                            onClick={loadDeals}
                            className="
                                mt-6
                                rounded-xl
                                bg-[#22FF88]
                                px-6
                                py-3
                                font-bold
                                text-black
                                transition
                                hover:scale-105
                            "
                        >
                            Try Again
                        </button>

                    </div>

                )}


                {/* =================================
                    LOADING
                ================================= */}

                {loading && (

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

                        {[1, 2, 3, 4].map(item => (

                            <div
                                key={item}
                                className="
                                    h-[430px]
                                    animate-pulse
                                    rounded-2xl
                                    border
                                    border-white/5
                                    bg-[#0a0a0a]
                                "
                            />

                        ))}

                    </div>

                )}


                {/* =================================
                    PRODUCTS GRID
                ================================= */}

                {!loading &&
                    !error &&
                    filtered.length > 0 && (

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

                        {filtered.map(product => (

                            <DealCard
                                key={product.id}
                                product={product}
                                onAdd={onAdd}
                            />

                        ))}

                    </div>

                )}


                {/* =================================
                    NO RESULTS
                ================================= */}

                {!loading &&
                    !error &&
                    filtered.length === 0 && (

                    <div
                        className="
                            py-24
                            text-center
                        "
                    >

                        <div
                            className="
                                mx-auto
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-white/10
                                bg-[#0a0a0a]
                                text-2xl
                            "
                        >
                            🔎
                        </div>


                        <h3
                            className="
                                mt-6
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


                        <button
                            onClick={resetFilters}
                            className="
                                mt-6
                                rounded-xl
                                bg-[#22FF88]
                                px-6
                                py-3
                                font-bold
                                text-black
                                transition
                                hover:scale-105
                            "
                        >
                            Clear filters
                        </button>

                    </div>

                )}

            </div>

        </section>

    );

}


export default FeaturedDeals;