import React, {
    useEffect,
    useRef,
    useState
} from "react";

import horizontalProductsData
    from "../../api/horizontalProducts.json";
import { isInWishlist, toggleWishlist, subscribeWishlist } from "../../lib/wishlist.js";
import { addProductToCart } from "../../lib/cartHelper.js";
import "./HorizontalProducts.css";


function HorizontalProducts({
    products = [],
    onOpen,
    onAddToCart
}) {

    const sliderRef = useRef(null);
    const trackRef = useRef(null);
    const set1Ref = useRef(null);
    const set2Ref = useRef(null);

    const animationRef = useRef(null);
    const posRef = useRef(0);
    const targetOffsetRef = useRef(0);
    const isDraggingRef = useRef(false);
    const touchStartXRef = useRef(0);
    const touchStartPosRef = useRef(0);

    const [isPaused, setIsPaused] = useState(false);
    const [addedMap, setAddedMap] = useState({});
    const [, setWishlistVersion] = useState(0);

    const [windowWidth, setWindowWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1200
    );

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const unsub = subscribeWishlist(() => {
            setWishlistVersion((v) => v + 1);
        });
        return unsub;
    }, []);


    /* =====================================================
       SECTION SETTINGS
    ===================================================== */

    const sectionSettings =
        horizontalProductsData.section || {};


    const scrollSpeed =
        Number(
            sectionSettings.scrollSpeed || 0.6
        );


    /* =====================================================
       GET PRODUCTS FROM MAIN JSON
    ===================================================== */

    const horizontalProductIds =
        horizontalProductsData.products || [];


    const displayProducts =
        horizontalProductIds
            .map((productId) => {

                return products.find(
                    (product) =>
                        String(product.id) ===
                        String(productId)
                );

            })
            .filter(Boolean);


    /* =====================================================
       IMAGE PATH
    ===================================================== */

    const getImage =
        (image) => {

            if (!image) {
                return "";
            }


            if (
                image.startsWith("http://") ||
                image.startsWith("https://")
            ) {

                return image;

            }


            return (
                import.meta.env.BASE_URL +
                image.replace(
                    /^\/+/,
                    ""
                )
            );

        };


    /* =====================================================
       DISCOUNT
    ===================================================== */

    const getDiscount =
        (product) => {

            if (
                product.discount !== undefined &&
                product.discount !== null
            ) {

                return Number(
                    product.discount
                );

            }


            if (
                product.oldPrice &&
                product.price
            ) {

                return Math.round(
                    (
                        (
                            Number(
                                product.oldPrice
                            ) -
                            Number(
                                product.price
                            )
                        ) /
                        Number(
                            product.oldPrice
                        )
                    ) * 100
                );

            }


            return 0;

        };


    /* =====================================================
       AUTO SCROLL & SEAMLESS INFINITE LOOP (MOBILE & DESKTOP)
    ===================================================== */

    useEffect(() => {

        const isMobile = windowWidth <= 768;
        const slider = sliderRef.current;
        const track = trackRef.current;
        const set1 = set1Ref.current;
        const set2 = set2Ref.current;

        if (!slider || displayProducts.length === 0) {
            return;
        }

        let animId = null;
        let lastTime = performance.now();

        if (isMobile && track) {
            /* -------------------------------------------------
               MOBILE: Seamless Left-to-Right Infinite Carousel
               Speed: 40-50px/sec from --popular-speed (default 45px)
               Animates translateX from -L to 0 seamlessly
            ------------------------------------------------- */
            const checkReduced = () =>
                typeof window !== "undefined" &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            const getPeriod = () => {
                if (set2 && set1) {
                    const diff = set2.offsetLeft - set1.offsetLeft;
                    if (diff > 0) return diff;
                }
                if (set1 && set1.offsetWidth > 0) {
                    return set1.offsetWidth + 16;
                }
                return 0;
            };

            let L = getPeriod();

            // Read CSS variable --popular-speed
            const readSpeed = () => {
                if (typeof window === "undefined") return 45;
                const rootVal = getComputedStyle(document.documentElement).getPropertyValue("--popular-speed");
                const parsed = parseFloat(rootVal);
                return !isNaN(parsed) && parsed > 0 ? parsed : 45;
            };

            const speed = readSpeed();

            if (posRef.current === 0 && L > 0) {
                posRef.current = -L;
            }

            const loopMobile = (now) => {
                const dt = Math.min((now - lastTime) / 1000, 0.1);
                lastTime = now;

                if (L <= 0) {
                    L = getPeriod();
                    if (L > 0 && posRef.current === 0) {
                        posRef.current = -L;
                    }
                }

                if (L > 0) {
                    // Smoothly handle targetOffset from arrow clicks
                    if (Math.abs(targetOffsetRef.current) > 0.5) {
                        const step = targetOffsetRef.current * 0.18;
                        posRef.current += step;
                        targetOffsetRef.current -= step;
                    }

                    // Left-to-right auto movement (+X direction)
                    if (!isDraggingRef.current && !isPaused && !checkReduced()) {
                        posRef.current += speed * dt;
                    }

                    // Seamless modulo wrap within [-L, 0)
                    while (posRef.current >= 0) {
                        posRef.current -= L;
                    }
                    while (posRef.current < -L) {
                        posRef.current += L;
                    }

                    track.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
                }

                animId = requestAnimationFrame(loopMobile);
            };

            animId = requestAnimationFrame(loopMobile);

            return () => {
                if (animId) cancelAnimationFrame(animId);
            };

        } else {
            /* -------------------------------------------------
               DESKTOP: Existing native scrollLeft auto-scroll
            ------------------------------------------------- */
            if (track) {
                track.style.transform = "none";
            }

            if (!sectionSettings.autoScroll || displayProducts.length < 2) {
                return;
            }

            const loopDesktop = () => {
                if (!isPaused) {
                    slider.scrollLeft += scrollSpeed;

                    if (
                        slider.scrollLeft + slider.clientWidth >=
                        slider.scrollWidth - 2
                    ) {
                        slider.scrollLeft = 0;
                    }
                }

                animId = requestAnimationFrame(loopDesktop);
            };

            animId = requestAnimationFrame(loopDesktop);

            return () => {
                if (animId) cancelAnimationFrame(animId);
            };
        }

    }, [
        isPaused,
        scrollSpeed,
        sectionSettings.autoScroll,
        displayProducts.length,
        windowWidth
    ]);


    /* =====================================================
       MANUAL NAVIGATION (ARROWS)
    ===================================================== */

    const moveSlider = (direction) => {
        if (window.innerWidth <= 768) {
            // Mobile: 1 card step smoothly without breaking auto-move
            const cardStep =
                set1Ref.current && displayProducts.length > 0
                    ? set1Ref.current.offsetWidth / displayProducts.length
                    : Math.round(window.innerWidth * 0.76 + 16);

            // direction 1 = next (slide left by 1 card), -1 = prev (slide right by 1 card)
            targetOffsetRef.current += -direction * cardStep;
        } else {
            // Desktop: standard scrollBy
            const slider = sliderRef.current;
            if (!slider) return;

            const scrollStep = 398;
            slider.scrollBy({
                left: direction * scrollStep,
                behavior: "smooth"
            });
        }
    };


    /* =====================================================
       TOUCH HANDLING FOR MOBILE SWIPING
    ===================================================== */

    const handleTouchStart = (e) => {
        if (window.innerWidth > 768) return;
        setIsPaused(true);
        isDraggingRef.current = true;
        touchStartXRef.current = e.touches[0].clientX;
        touchStartPosRef.current = posRef.current;
    };

    const handleTouchMove = (e) => {
        if (!isDraggingRef.current || window.innerWidth > 768) return;
        const deltaX = e.touches[0].clientX - touchStartXRef.current;
        posRef.current = touchStartPosRef.current + deltaX;

        const L =
            set2Ref.current && set1Ref.current
                ? set2Ref.current.offsetLeft - set1Ref.current.offsetLeft
                : 0;

        if (L > 0) {
            while (posRef.current >= 0) posRef.current -= L;
            while (posRef.current < -L) posRef.current += L;
        }

        if (trackRef.current) {
            trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
        }
    };

    const handleTouchEnd = () => {
        if (window.innerWidth > 768) return;
        isDraggingRef.current = false;
        setIsPaused(false);
    };


    /* =====================================================
       RENDER PRODUCT CARD HELPER
    ===================================================== */

    const renderCard = (product, index, isClone = false) => {
        const discount = getDiscount(product);
        const cardKey = isClone
            ? `clone-${product.id}-${index}`
            : `orig-${product.id}-${index}`;

        return (
            <article
                key={cardKey}
                className="horizontal-product-card"
                aria-hidden={isClone ? "true" : undefined}
                onClick={() => onOpen && onOpen(product)}
            >
                {/* IMAGE */}
                <div className="horizontal-product-image">
                    {discount > 0 && (
                        <span className="horizontal-discount">
                            -{discount}%
                        </span>
                    )}

                    {product.badge && (
                        <span className="horizontal-badge">
                            {product.badge}
                        </span>
                    )}

                    <button
                        type="button"
                        tabIndex={isClone ? -1 : 0}
                        className={`horizontal-card-wishlist-btn ${isInWishlist(product.id) ? "is-active" : ""}`}
                        aria-label={
                            isInWishlist(product.id)
                                ? "Remove from wishlist"
                                : "Add to wishlist"
                        }
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product);
                        }}
                    >
                        {isInWishlist(product.id) ? "♥" : "♡"}
                    </button>

                    <img
                        src={getImage(product.image)}
                        alt={product.name || "Product"}
                        loading={index < 4 ? "eager" : "lazy"}
                        onError={(event) => {
                            event.currentTarget.style.opacity = "0";
                        }}
                    />
                </div>

                {/* PRODUCT INFORMATION */}
                <div className="horizontal-product-info">
                    <span className="horizontal-category">
                        {product.category}
                    </span>

                    <h3>{product.name}</h3>

                    {/* RATING */}
                    <div className="horizontal-rating">
                        <span>★</span>
                        {product.rating || 0}
                        <small>({product.reviews || 0})</small>
                    </div>

                    {/* PRICE */}
                    <div className="horizontal-price">
                        <strong>
                            ₹
                            {Number(
                                product.price || 0
                            ).toLocaleString("en-IN")}
                        </strong>

                        {product.oldPrice && (
                            <del>
                                ₹
                                {Number(
                                    product.oldPrice
                                ).toLocaleString("en-IN")}
                            </del>
                        )}
                    </div>

                    {/* CART BUTTON */}
                    <button
                        type="button"
                        tabIndex={isClone ? -1 : 0}
                        disabled={
                            product.stock !== undefined &&
                            Number(product.stock) <= 0
                        }
                        onClick={(event) => {
                            event.stopPropagation();

                            const pid = product.id;
                            setAddedMap((prev) => ({ ...prev, [pid]: true }));
                            setTimeout(() => {
                                setAddedMap((prev) => ({ ...prev, [pid]: false }));
                            }, 1500);

                            if (onAddToCart) {
                                onAddToCart(product, 1);
                            } else {
                                addProductToCart(product, 1);
                            }
                        }}
                    >
                        {product.stock !== undefined &&
                        Number(product.stock) <= 0
                            ? "OUT OF STOCK"
                            : addedMap[product.id]
                            ? "✓ ADDED"
                            : "+ ADD TO CART"}
                    </button>
                </div>
            </article>
        );
    };


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (displayProducts.length === 0) {
        return null;
    }


    return (
        <section className="horizontal-products-section">

            {/* =================================================
               HEADER
            ================================================= */}

            <div className="horizontal-products-header">
                <div>
                    <span className="horizontal-eyebrow">
                        {sectionSettings.eyebrow || "TRENDING NOW"}
                    </span>

                    <h2>
                        {sectionSettings.title || "Popular Products"}
                    </h2>

                    <p>
                        {sectionSettings.description ||
                            "Discover our popular products."}
                    </p>
                </div>

                {/* =================================================
                   CONTROLS
                ================================================= */}

                <div className="horizontal-controls">
                    <button
                        type="button"
                        aria-label="Previous products"
                        onClick={() => moveSlider(-1)}
                    >
                        ←
                    </button>

                    <button
                        type="button"
                        aria-label="Next products"
                        onClick={() => moveSlider(1)}
                    >
                        →
                    </button>
                </div>
            </div>


            {/* =================================================
               PRODUCT SLIDER
            ================================================= */}

            <div
                className="horizontal-slider-wrapper"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    ref={sliderRef}
                    className="horizontal-products-slider"
                >
                    <div
                        ref={trackRef}
                        className="horizontal-products-track"
                    >
                        {/* Cloned Set (Set 1 - positioned first for Left-to-Right translation) */}
                        <div
                            ref={set1Ref}
                            className="horizontal-products-set is-clone"
                            aria-hidden="true"
                        >
                            {displayProducts.map((product, index) =>
                                renderCard(product, index, true)
                            )}
                        </div>

                        {/* Original Set (Set 2) */}
                        <div
                            ref={set2Ref}
                            className="horizontal-products-set is-original"
                        >
                            {displayProducts.map((product, index) =>
                                renderCard(product, index, false)
                            )}
                        </div>
                    </div>
                </div>
            </div>


            {/* =================================================
               AUTO SCROLL STATUS
            ================================================= */}

            {sectionSettings.autoScroll && (
                <div className="horizontal-scroll-status">
                    <span className={isPaused ? "paused" : ""}></span>
                    {isPaused ? "PAUSED" : "AUTO SCROLLING"}
                </div>
            )}

        </section>
    );

}


export default HorizontalProducts;
