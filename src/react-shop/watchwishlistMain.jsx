import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import "./watchshopApp.css";
import "./watchwishlist.css";
import Navbar from "../deals/components/Navbar.jsx";

const getImagePath = (image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) return image;
    const base = import.meta.env.BASE_URL || "/KSAM-deal-ecommerce-website/";
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const clean = image.replace(/^\/+/, "");
    if (image.startsWith(normalizedBase)) return image;
    return `${normalizedBase}${clean}`;
};

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


            {/* Shared Deals-style Navbar */}
            <Navbar />



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
                                    src={getImagePath(product.image)}
                                    alt={product.name}
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        const fb = document.createElement("div");
                                        fb.style.cssText = "width:100%;height:100%;min-height:140px;display:flex;align-items:center;justify-content:center;background:#18181b;color:#a1a1aa;font-size:12px;font-weight:700;text-align:center;padding:10px;border-radius:12px;";
                                        fb.textContent = product.name || "Product";
                                        if (e.currentTarget.parentElement) {
                                            e.currentTarget.parentElement.appendChild(fb);
                                        }
                                    }}
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