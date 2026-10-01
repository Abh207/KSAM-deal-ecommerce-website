import React, {
    useEffect,
    useRef,
    useState
} from "react";

import {
    searchProducts,
    getSearchSuggestions,
    getSearchCategories,
    getSearchImagePath
} from "./productSearchIndex";

import "./global-search.css";


/* =========================================================
   STORAGE
   ========================================================= */

const CART_KEY = "cartProductLS";


/* =========================================================
   FORMAT PRICE
   ========================================================= */

const formatPrice = (price) => {

    return `₹${Number(price || 0).toLocaleString("en-IN")}`;

};


/* =========================================================
   MAIN COMPONENT
   ========================================================= */

function GlobalSearch() {

    const [query, setQuery] =
        useState("");

    const [isOpen, setIsOpen] =
        useState(false);

    const [results, setResults] =
        useState([]);

    const [suggestions, setSuggestions] =
        useState([]);

    const [activeCategory, setActiveCategory] =
        useState("All");

    const [sort, setSort] =
        useState("relevance");

    const [message, setMessage] =
        useState("");

    const searchRef =
        useRef(null);


    const categories =
        getSearchCategories();


    /* =====================================================
       SEARCH
       ===================================================== */

    useEffect(() => {

        const clean =
            query.trim();


        if (!clean) {

            setSuggestions([]);

            setResults([]);

            return;

        }


        const suggestionData =
            getSearchSuggestions(
                clean,
                6
            );


        setSuggestions(
            suggestionData
        );


        const searchData =
            searchProducts(
                clean,
                {
                    category:
                        activeCategory,

                    sort
                }
            );


        setResults(
            searchData
        );


    }, [
        query,
        activeCategory,
        sort
    ]);


    /* =====================================================
       OPEN SEARCH
       ===================================================== */

    const openSearch = () => {

        setIsOpen(true);

    };


    /* =====================================================
       CLOSE SEARCH
       ===================================================== */

    const closeSearch = () => {

        setIsOpen(false);

    };


    /* =====================================================
       ESC KEY
       ===================================================== */

    useEffect(() => {

        const handleKeyDown =
            (event) => {

                if (
                    event.key === "Escape"
                ) {

                    closeSearch();

                }

            };


        document.addEventListener(
            "keydown",
            handleKeyDown
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

        };

    }, []);


    /* =====================================================
       ADD TO CART
       ===================================================== */

    const addToCart = (product) => {

        try {

            const existing =
                JSON.parse(
                    localStorage.getItem(
                        CART_KEY
                    ) || "[]"
                );


            /*
               Adapt product to your
               existing cart format.
            */

            const cartProduct = {

                id: product.id,

                name: product.name,

                price: product.price,

                oldPrice:
                    product.oldPrice,

                image: product.image,

                quantity: 1,

                brand: product.brand,

                category:
                    product.category

            };


            const index =
                existing.findIndex(
                    item =>
                        item.id === product.id
                );


            if (index !== -1) {

                existing[index].quantity =
                    Number(
                        existing[index]
                            .quantity || 1
                    ) + 1;

            } else {

                existing.push(
                    cartProduct
                );

            }


            localStorage.setItem(
                CART_KEY,
                JSON.stringify(existing)
            );


            window.dispatchEvent(
                new Event("storage")
            );


            setMessage(
                `${product.name} added to cart`
            );


            setTimeout(() => {

                setMessage("");

            }, 2200);

        } catch (error) {

            console.error(
                "Cart error:",
                error
            );

        }

    };


    /* =====================================================
       VIEW PRODUCT
       ===================================================== */

    const viewProduct = (product) => {

        /*
           If product has its own URL,
           use it.

           Otherwise use its
           category page.
        */

        window.location.href =
            product.sourcePage;

    };


    /* =====================================================
       SUGGESTION CLICK
       ===================================================== */

    const selectSuggestion =
        (product) => {

            setQuery(
                product.name
            );

        };


    return (
        <>
            {/* =================================================
                SEARCH BAR
               ================================================= */}

            <div
                className="global-search-wrapper"
                ref={searchRef}
            >

                <button
                    className="global-search-bar"
                    onClick={openSearch}
                    type="button"
                >

                    <i className="fa-solid fa-magnifying-glass"></i>

                    <span>
                        Search products, brands and categories...
                    </span>

                    <kbd>
                        /
                    </kbd>

                </button>

            </div>


            {/* =================================================
                FULL SEARCH PANEL
               ================================================= */}

            {isOpen && (

                <div
                    className="global-search-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target.classList
                                .contains(
                                    "global-search-overlay"
                                )
                        ) {

                            closeSearch();

                        }

                    }}
                >

                    <div
                        className="global-search-panel"
                    >

                        {/* =====================================
                            HEADER
                           ===================================== */}

                        <div
                            className="global-search-header"
                        >

                            <div
                                className="global-search-input-wrapper"
                            >

                                <i className="fa-solid fa-magnifying-glass"></i>

                                <input
                                    autoFocus
                                    type="search"
                                    value={query}
                                    onChange={(event) =>
                                        setQuery(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search for products, brands, categories..."
                                />

                                {query && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuery("")
                                        }
                                        className="global-search-clear"
                                    >

                                        <i className="fa-solid fa-xmark"></i>

                                    </button>

                                )}

                            </div>


                            <button
                                type="button"
                                className="global-search-close"
                                onClick={closeSearch}
                            >

                                <i className="fa-solid fa-xmark"></i>

                                Close

                            </button>

                        </div>


                        {/* =====================================
                            SEARCH CONTENT
                           ===================================== */}

                        <div
                            className="global-search-content"
                        >

                            {/* =================================
                                EMPTY SEARCH
                               ================================= */}

                            {!query && (

                                <div
                                    className="global-search-start"
                                >

                                    <div
                                        className="global-search-start-icon"
                                    >

                                        <i className="fa-solid fa-magnifying-glass"></i>

                                    </div>


                                    <h2>
                                        What are you looking for?
                                    </h2>


                                    <p>
                                        Search across all KSAM Deal products,
                                        brands and categories.
                                    </p>


                                    <div
                                        className="global-search-category-list"
                                    >

                                        {categories
                                            .slice(0, 8)
                                            .map(
                                                category => (

                                                    <button
                                                        key={
                                                            category
                                                        }
                                                        type="button"
                                                        onClick={() => {

                                                            setActiveCategory(
                                                                category
                                                            );

                                                        }}
                                                    >

                                                        {category}

                                                    </button>

                                                )
                                            )}

                                    </div>

                                </div>

                            )}


                            {/* =================================
                                SUGGESTIONS
                               ================================= */}

                            {query &&
                                suggestions.length > 0 && (

                                    <div
                                        className="global-search-suggestions"
                                    >

                                        <h3>
                                            Suggestions
                                        </h3>


                                        {suggestions.map(
                                            product => (

                                                <button
                                                    type="button"
                                                    key={
                                                        product.id
                                                    }
                                                    className="global-search-suggestion"
                                                    onClick={() =>
                                                        selectSuggestion(
                                                            product
                                                        )
                                                    }
                                                >

                                                    <img
                                                        src={
                                                            getSearchImagePath(
                                                                product.image
                                                            )
                                                        }
                                                        alt={
                                                            product.name
                                                        }
                                                    />

                                                    <span>

                                                        <strong>
                                                            {product.name}
                                                        </strong>

                                                        <small>
                                                            {product.brand}
                                                            {" • "}
                                                            {product.category}
                                                        </small>

                                                    </span>


                                                    <b>
                                                        {formatPrice(
                                                            product.price
                                                        )}
                                                    </b>

                                                </button>

                                            )
                                        )}

                                    </div>

                                )}


                            {/* =================================
                                RESULTS
                               ================================= */}

                            {query && (

                                <div
                                    className="global-search-results"
                                >

                                    <div
                                        className="global-search-results-top"
                                    >

                                        <div>

                                            <strong>
                                                {results.length}
                                            </strong>

                                            {" "}
                                            products found

                                        </div>


                                        <div
                                            className="global-search-controls"
                                        >

                                            <select
                                                value={
                                                    activeCategory
                                                }
                                                onChange={event =>
                                                    setActiveCategory(
                                                        event.target.value
                                                    )
                                                }
                                            >

                                                {categories.map(
                                                    category => (

                                                        <option
                                                            key={
                                                                category
                                                            }
                                                            value={
                                                                category
                                                            }
                                                        >

                                                            {category}

                                                        </option>

                                                    )
                                                )}

                                            </select>


                                            <select
                                                value={sort}
                                                onChange={event =>
                                                    setSort(
                                                        event.target.value
                                                    )
                                                }
                                            >

                                                <option value="relevance">
                                                    Relevance
                                                </option>

                                                <option value="price-low">
                                                    Price: Low to High
                                                </option>

                                                <option value="price-high">
                                                    Price: High to Low
                                                </option>

                                                <option value="rating">
                                                    Customer Rating
                                                </option>

                                                <option value="discount">
                                                    Biggest Discount
                                                </option>

                                            </select>

                                        </div>

                                    </div>


                                    {results.length === 0 ? (

                                        <div
                                            className="global-search-empty"
                                        >

                                            <div>
                                                🔍
                                            </div>

                                            <h2>
                                                No products found
                                            </h2>

                                            <p>
                                                Try another product,
                                                brand or category.
                                            </p>

                                        </div>

                                    ) : (

                                        <div
                                            className="global-search-grid"
                                        >

                                            {results.map(
                                                product => (

                                                    <article
                                                        className="global-search-product"
                                                        key={
                                                            product.id
                                                        }
                                                    >

                                                        <div
                                                            className="global-search-product-image"
                                                        >

                                                            {product.badge && (

                                                                <span>
                                                                    {product.badge}
                                                                </span>

                                                            )}


                                                            {product.discount > 0 && (

                                                                <b>
                                                                    -{product.discount}%
                                                                </b>

                                                            )}


                                                            <img
                                                                src={
                                                                    getSearchImagePath(
                                                                        product.image
                                                                    )
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                            />

                                                        </div>


                                                        <div
                                                            className="global-search-product-info"
                                                        >

                                                            <small>
                                                                {product.brand}
                                                                {" • "}
                                                                {product.category}
                                                            </small>


                                                            <h3>
                                                                {product.name}
                                                            </h3>


                                                            {product.rating > 0 && (

                                                                <div
                                                                    className="global-search-rating"
                                                                >

                                                                    ★
                                                                    {" "}
                                                                    {product.rating}

                                                                    <span>
                                                                        (
                                                                        {product.reviews}
                                                                        )
                                                                    </span>

                                                                </div>

                                                            )}


                                                            <div
                                                                className="global-search-price"
                                                            >

                                                                <strong>
                                                                    {formatPrice(
                                                                        product.price
                                                                    )}
                                                                </strong>


                                                                {product.oldPrice > 0 && (

                                                                    <del>
                                                                        {formatPrice(
                                                                            product.oldPrice
                                                                        )}
                                                                    </del>

                                                                )}

                                                            </div>


                                                            <div
                                                                className="global-search-actions"
                                                            >

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        addToCart(
                                                                            product
                                                                        )
                                                                    }
                                                                >

                                                                    <i className="fa-solid fa-cart-plus"></i>

                                                                    Add to cart

                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className="view"
                                                                    onClick={() =>
                                                                        viewProduct(
                                                                            product
                                                                        )
                                                                    }
                                                                >

                                                                    <i className="fa-regular fa-eye"></i>

                                                                </button>

                                                            </div>

                                                        </div>

                                                    </article>

                                                )
                                            )}

                                        </div>

                                    )}

                                </div>

                            )}

                        </div>


                        {/* =====================================
                            MESSAGE
                           ===================================== */}

                        {message && (

                            <div
                                className="global-search-toast"
                            >

                                <i className="fa-solid fa-circle-check"></i>

                                {message}

                            </div>

                        )}

                    </div>

                </div>

            )}

        </>
    );
}


export default GlobalSearch;