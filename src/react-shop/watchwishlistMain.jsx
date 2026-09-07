import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import "./watchshopApp.css";
import "./watchwishlist.css";


function WatchWishlist() {

    const [wishlist, setWishlist] = useState([]);


    useEffect(() => {

        const savedWishlist =
            JSON.parse(
                localStorage.getItem("watchWishlist")
            ) || [];

        setWishlist(savedWishlist);

    }, []);


    const removeFromWishlist = (productId) => {

        const updatedWishlist =
            wishlist.filter(
                (product) => product.id !== productId
            );

        setWishlist(updatedWishlist);

        localStorage.setItem(
            "watchWishlist",
            JSON.stringify(updatedWishlist)
        );

    };


    return (

        <div className="watch-wishlist-page">


            {/* HEADER */}

            <header className="watch-header">

                <div className="watch-logo">
                    KSAM <span>DEAL</span>
                </div>


                <nav className="watch-nav">

                    <a href="/KSAM-deal-ecommerce-website/">
                        HOME
                    </a>

                    <a href="/KSAM-deal-ecommerce-website/watchshop.html">
                        WATCHES
                    </a>

                    <a href="/KSAM-deal-ecommerce-website/watchwishlist.html">
                        WISHLIST
                    </a>

                </nav>


                <a
                    href="/KSAM-deal-ecommerce-website/addToCart.html"
                    className="watch-cart"
                >
                    🛒 CART
                </a>

            </header>



            {/* TITLE */}

            <section className="watch-wishlist-heading">

                <span>
                    YOUR FAVORITES
                </span>

                <h1>
                    MY WISHLIST
                </h1>

                <p>
                    {wishlist.length} saved watch
                    {wishlist.length !== 1 ? "es" : ""}
                </p>

            </section>



            {/* PRODUCTS */}

            {wishlist.length === 0 ? (

                <div className="watch-empty-wishlist">

                    <div className="watch-empty-icon">
                        ♡
                    </div>

                    <h2>
                        Your wishlist is empty
                    </h2>

                    <p>
                        Save your favorite watches
                        and find them here.
                    </p>

                    <a
                        href="/KSAM-deal-ecommerce-website/watchshop.html"
                        className="watch-wishlist-shop-button"
                    >
                        SHOP WATCHES →
                    </a>

                </div>

            ) : (

                <div className="watch-wishlist-grid">

                    {wishlist.map((product) => (

                        <article
                            className="watch-wishlist-card"
                            key={product.id}
                        >

                            <div className="watch-wishlist-image">

                                <img
                                    src={product.image}
                                    alt={product.name}
                                />

                            </div>


                            <div className="watch-wishlist-info">

                                <p>
                                    {product.category}
                                </p>

                                <h3>
                                    {product.name}
                                </h3>

                                <strong>
                                    ${product.price.toFixed(2)}
                                </strong>


                                <button
                                    onClick={() =>
                                        removeFromWishlist(
                                            product.id
                                        )
                                    }
                                >
                                    REMOVE ♡
                                </button>

                            </div>

                        </article>

                    ))}

                </div>

            )}

        </div>

    );

}


const root = createRoot(
    document.getElementById(
        "watchwishlist-root"
    )
);


root.render(
    <WatchWishlist />
);