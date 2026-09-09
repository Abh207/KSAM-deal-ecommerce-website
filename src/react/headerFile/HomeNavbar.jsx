import React, {
    useEffect,
    useState
} from "react";

import "./HomeNavbar.css";


const CART_KEY = "cartProductLS";
const WISHLIST_KEY = "headerProductsWishlist";


function getCount(key) {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(key)
            ) || [];

        return data;

    } catch (error) {

        console.error(
            `Unable to read ${key}`,
            error
        );

        return [];

    }

}


function HomeNavbar() {

    const [menuOpen, setMenuOpen] =
        useState(false);

    const [searchOpen, setSearchOpen] =
        useState(false);

    const [cartCount, setCartCount] =
        useState(0);

    const [wishlistCount, setWishlistCount] =
        useState(0);


    /* =====================================================
       LOAD COUNTS
    ===================================================== */

    const updateCounts = () => {

        const cart =
            getCount(CART_KEY);

        const wishlist =
            getCount(WISHLIST_KEY);


        const totalCartItems =
            cart.reduce(
                (total, item) =>
                    total +
                    Number(item.quantity || 1),
                0
            );


        setCartCount(
            totalCartItems
        );

        setWishlistCount(
            wishlist.length
        );

    };


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        updateCounts();

        const handleCartUpdate =
            () => {
                updateCounts();
            };


        window.addEventListener(
            "cartUpdated",
            handleCartUpdate
        );


        window.addEventListener(
            "storage",
            updateCounts
        );


        return () => {

            window.removeEventListener(
                "cartUpdated",
                handleCartUpdate
            );

            window.removeEventListener(
                "storage",
                updateCounts
            );

        };

    }, []);


    /* =====================================================
       CLOSE MOBILE MENU
    ===================================================== */

    const closeMenu = () => {

        setMenuOpen(false);

    };


    /* =====================================================
       SCROLL
    ===================================================== */

    const scrollToProducts = () => {

        closeMenu();

        document
            .querySelector(
                ".home-products-grid"
            )
            ?.scrollIntoView({
                behavior: "smooth"
            });

    };


    return (

        <>

            {/* =================================================
               NAVBAR
            ================================================= */}

            <header className="home-navbar">

                <div className="home-navbar-container">


                    {/* =================================================
                       LOGO
                    ================================================= */}

                    <button
                        type="button"
                        className="home-navbar-logo"
                        onClick={() => {
                            window.scrollTo({
                                top: 0,
                                behavior: "smooth"
                            });

                            closeMenu();
                        }}
                    >

                        <span className="logo-main">
                            KSAM
                        </span>

                        <span className="logo-sub">
                            DEAL
                        </span>

                    </button>


                    {/* =================================================
                       DESKTOP NAVIGATION
                    ================================================= */}

                    <nav className="home-navbar-links">

                        <button
                            type="button"
                            onClick={() => {
                                window.scrollTo({
                                    top: 0,
                                    behavior: "smooth"
                                });
                            }}
                        >
                            HOME
                        </button>


                        <button
                            type="button"
                            onClick={scrollToProducts}
                        >
                            PRODUCTS
                        </button>


                        <button
                            type="button"
                            onClick={scrollToProducts}
                        >
                            CATEGORIES
                        </button>


                        <button
                            type="button"
                            className="nav-deals"
                            onClick={scrollToProducts}
                        >
                            DEALS
                            <span>
                                HOT
                            </span>
                        </button>


                        <button
                            type="button"
                            onClick={scrollToProducts}
                        >
                            NEW ARRIVALS
                        </button>

                    </nav>


                    {/* =================================================
                       DESKTOP ACTIONS
                    ================================================= */}

                    <div className="home-navbar-actions">


                        {/* SEARCH */}

                        <button
                            type="button"
                            className="navbar-icon-button"
                            aria-label="Search"
                            onClick={() =>
                                setSearchOpen(
                                    !searchOpen
                                )
                            }
                        >
                            🔍
                        </button>


                        {/* WISHLIST */}

                        <button
                            type="button"
                            className="navbar-icon-button navbar-count-button"
                            aria-label="Wishlist"
                            onClick={() => {
                                window.location.href =
                                    "./watchwishlist.html";
                            }}
                        >

                            ♡

                            {wishlistCount > 0 && (

                                <span className="navbar-count">

                                    {wishlistCount}

                                </span>

                            )}

                        </button>


                        {/* CART */}

                        <button
                            type="button"
                            className="navbar-icon-button navbar-count-button"
                            aria-label="Cart"
                            onClick={() => {
                                window.location.href =
                                    "./addToCart.html";
                            }}
                        >

                            🛒

                            {cartCount > 0 && (

                                <span className="navbar-count">

                                    {cartCount}

                                </span>

                            )}

                        </button>


                        {/* ACCOUNT */}

                        <button
                            type="button"
                            className="navbar-account-button"
                            onClick={() => {
                                window.location.href =
                                    "./login.html";
                            }}
                        >
                            👤
                        </button>

                    </div>


                    {/* =================================================
                       MOBILE MENU BUTTON
                    ================================================= */}

                    <button
                        type="button"
                        className="mobile-menu-button"
                        aria-label="Open menu"
                        onClick={() =>
                            setMenuOpen(
                                !menuOpen
                            )
                        }
                    >

                        {menuOpen
                            ? "✕"
                            : "☰"}

                    </button>

                </div>


                {/* =================================================
                   SEARCH PANEL
                ================================================= */}

                {searchOpen && (

                    <div className="navbar-search-panel">

                        <div className="navbar-search-inner">

                            <span>
                                🔍
                            </span>

                            <input
                                type="search"
                                placeholder="Search products..."
                                autoFocus
                                onChange={(event) => {

                                    const searchInput =
                                        document.querySelector(
                                            '.products-search-box input[type="search"]'
                                        );

                                    if (searchInput) {

                                        searchInput.value =
                                            event.target.value;

                                        searchInput.dispatchEvent(
                                            new Event(
                                                "input",
                                                {
                                                    bubbles: true
                                                }
                                            )
                                        );

                                    }

                                }}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setSearchOpen(false)
                                }
                            >
                                ✕
                            </button>

                        </div>

                    </div>

                )}


            </header>


            {/* =====================================================
               MOBILE MENU
            ===================================================== */}

            <div
                className={
                    `mobile-navbar-menu ${
                        menuOpen
                            ? "mobile-menu-open"
                            : ""
                    }`
                }
            >

                <button
                    type="button"
                    onClick={() => {
                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });

                        closeMenu();
                    }}
                >
                    HOME
                </button>


                <button
                    type="button"
                    onClick={scrollToProducts}
                >
                    PRODUCTS
                </button>


                <button
                    type="button"
                    onClick={scrollToProducts}
                >
                    CATEGORIES
                </button>


                <button
                    type="button"
                    onClick={scrollToProducts}
                >
                    🔥 DEALS
                </button>


                <button
                    type="button"
                    onClick={scrollToProducts}
                >
                    NEW ARRIVALS
                </button>


                <button
                    type="button"
                    onClick={() => {
                        window.location.href =
                            "./addToCart.html";
                    }}
                >
                    🛒 CART
                    {cartCount > 0 &&
                        ` (${cartCount})`}
                </button>


                <button
                    type="button"
                    onClick={() => {
                        window.location.href =
                            "./login.html";
                    }}
                >
                    👤 ACCOUNT
                </button>

            </div>

        </>

    );

}


export default HomeNavbar;