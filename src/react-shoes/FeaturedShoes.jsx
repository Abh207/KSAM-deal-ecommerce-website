import React, { useState } from "react";
import featuredData from "../api/featured-shoes.json";
import "./featured-shoes.css";


function FeaturedShoes() {

    const [wishlist, setWishlist] = useState([]);


    const toggleWishlist = (id) => {

        setWishlist((current) => {

            if (current.includes(id)) {

                return current.filter(
                    (item) => item !== id
                );

            }

            return [
                ...current,
                id
            ];

        });

    };


    const getImagePath = (image) => {

        if (!image) {
            return "";
        }

        return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, "")}`;

    };


    return (

        <section className="featured-shoes-section">


            {/* =====================================================
               SHOP BY CATEGORY
               ===================================================== */}

            <div className="featured-container">

                <div className="featured-section-title">

                    <span className="featured-title-line"></span>

                    <h2>
                        SHOP BY CATEGORY
                    </h2>

                    <span className="featured-title-line"></span>

                </div>


                <div className="featured-category-grid">

                    {featuredData.categories.map(
                        (category) => (

                            <button
                                type="button"
                                className="featured-category-card"
                                key={category.id}
                            >

                                <img
                                    src={getImagePath(
                                        category.image
                                    )}
                                    alt={category.name}
                                />


                                <div className="featured-category-overlay">

                                    <strong>
                                        {category.name}
                                    </strong>

                                    <span>
                                        {category.subtitle}
                                    </span>

                                </div>

                            </button>

                        )
                    )}

                </div>


                {/* =================================================
                   BEST SELLERS HEADER
                   ================================================= */}

                <div className="featured-products-header">

                    <h2>
                        BEST SELLERS
                    </h2>


                    <button
                        type="button"
                        className="featured-view-all"
                    >

                        VIEW ALL

                        <i className="fa-solid fa-arrow-right"></i>

                    </button>

                </div>


                {/* =================================================
                   PRODUCTS
                   ================================================= */}

                <div className="featured-product-grid">

                    {featuredData.products.map(
                        (product) => (

                            <article
                                className="featured-product-card"
                                key={product.id}
                            >


                                {/* IMAGE */}

                                <div className="featured-product-image">

                                    <img
                                        src={getImagePath(
                                            product.image
                                        )}
                                        alt={product.name}
                                    />


                                    {/* WISHLIST */}

                                    <button
                                        type="button"
                                        className={
                                            wishlist.includes(product.id)
                                                ? "featured-heart active"
                                                : "featured-heart"
                                        }
                                        onClick={() =>
                                            toggleWishlist(
                                                product.id
                                            )
                                        }
                                        aria-label="Wishlist"
                                    >

                                        <i
                                            className={
                                                wishlist.includes(
                                                    product.id
                                                )
                                                    ? "fa-solid fa-heart"
                                                    : "fa-regular fa-heart"
                                            }
                                        ></i>

                                    </button>


                                    {/* BADGE */}

                                    {product.badge && (

                                        <span className="featured-product-badge">

                                            {product.badge}

                                        </span>

                                    )}

                                </div>


                                {/* PRODUCT DETAILS */}

                                <div className="featured-product-content">

                                    <div className="featured-product-name">

                                        {product.name}

                                    </div>


                                    {/* RATING */}

                                    <div className="featured-rating">

                                        <span className="featured-stars">

                                            {"★".repeat(
                                                Math.round(
                                                    product.rating
                                                )
                                            )}

                                        </span>

                                        <span>
                                            {product.rating}
                                        </span>

                                        <small>
                                            ({product.reviews})
                                        </small>

                                    </div>


                                    {/* PRICE */}

                                    <div className="featured-price-row">

                                        <strong>

                                            ₹
                                            {Number(
                                                product.price
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </strong>


                                        <del>

                                            ₹
                                            {Number(
                                                product.oldPrice
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </del>

                                    </div>


                                    {/* COLORS */}

                                    <div className="featured-colors">

                                        {product.colors.map(
                                            (color, index) => (

                                                <span
                                                    key={index}
                                                    style={{
                                                        backgroundColor:
                                                            color
                                                    }}
                                                ></span>

                                            )
                                        )}

                                    </div>

                                </div>

                            </article>

                        )
                    )}

                </div>


                {/* =================================================
                   PROMOTIONAL BANNERS
                   ================================================= */}

                <div className="featured-promotions">

                    {featuredData.promotions.map(
                        (promo) => (

                            <article
                                key={promo.id}
                                className={
                                    promo.theme === "dark"
                                        ? "featured-promo dark"
                                        : "featured-promo light"
                                }
                            >

                                <div className="promo-text">

                                    <span className="promo-label">

                                        {promo.label}

                                    </span>


                                    <h3>

                                        {promo.title}

                                        <br />

                                        {promo.subtitle}

                                        {promo.extra && (
                                            <>
                                                <br />
                                                {promo.extra}
                                            </>
                                        )}

                                    </h3>


                                    <button type="button">

                                        {promo.button}

                                        <i className="fa-solid fa-arrow-right"></i>

                                    </button>

                                </div>


                                <div className="promo-image">

                                    <img
                                        src={getImagePath(
                                            promo.image
                                        )}
                                        alt=""
                                    />

                                </div>

                            </article>

                        )
                    )}

                </div>


                {/* =================================================
                   NEWSLETTER
                   ================================================= */}

                <div className="featured-newsletter">

                    <div className="newsletter-icon">

                        <i className="fa-regular fa-envelope"></i>

                    </div>


                    <div className="newsletter-text">

                        <strong>
                            STAY IN THE LOOP
                        </strong>

                        <span>
                            Sign up for exclusive offers,
                            new drops and more.
                        </span>

                    </div>


                    <form
                        className="newsletter-form"
                        onSubmit={(event) =>
                            event.preventDefault()
                        }
                    >

                        <input
                            type="email"
                            placeholder="Enter your email address"
                            required
                        />

                        <button type="submit">

                            SUBSCRIBE

                        </button>

                    </form>

                </div>

            </div>

        </section>

    );

}


export default FeaturedShoes;