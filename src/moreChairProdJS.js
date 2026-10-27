import "./auth/auth.js";
import { addProductToCart, normalizeCartItem, resolveImagePath } from "./lib/cartHelper.js";
import { isInWishlist, toggleWishlist, subscribeWishlist } from "./lib/wishlist.js";

/* =====================================================
   MORE PRODUCTS
===================================================== */

const moreProductContainer =
    document.querySelector("#moreProductContainer");

const moreProductTemplate =
    document.querySelector("#moreProductTemplate");

const productTabs =
    document.querySelectorAll(".product-tab");

let allProducts = [];


/* =====================================================
   CHECK ELEMENTS
===================================================== */

if (!moreProductContainer) {
    console.error(
        "ERROR: #moreProductContainer not found."
    );
}

if (!moreProductTemplate) {
    console.error(
        "ERROR: #moreProductTemplate not found."
    );
}


/* =====================================================
   LOAD JSON
===================================================== */

fetch("./src/api/moreChairProdjn.json")

    .then(function (response) {

        if (!response.ok) {
            throw new Error(
                "Failed to load JSON: " +
                response.status
            );
        }

        return response.json();
    })

    .then(function (products) {

        console.log(
            "Products loaded:",
            products.length
        );

        allProducts = products;

        // Show New Products initially
        showProducts("new");
    })

    .catch(function (error) {

        console.error(
            "Product loading error:",
            error
        );
    });


/* =====================================================
   IMAGE PATH
===================================================== */

function getImagePath(imagePath) {
    return resolveImagePath(imagePath);
}


/* =====================================================
   SHOW PRODUCTS
===================================================== */

function showProducts(category) {

    if (!moreProductContainer) {
        return;
    }

    if (!moreProductTemplate) {
        return;
    }


    /* Clear existing cards */

    moreProductContainer.innerHTML = "";


    /* Filter products */

    const filteredProducts =
        allProducts.filter(function (product) {

            return product.category === category;

        });


    console.log(
        "Category:",
        category,
        "Products:",
        filteredProducts.length
    );


    /* No products */

    if (filteredProducts.length === 0) {

        moreProductContainer.innerHTML = `
            <p class="no-products">
                No products available.
            </p>
        `;

        return;
    }


    /* Create cards */

    filteredProducts.forEach(function (product) {

        const card =
            moreProductTemplate.content.cloneNode(true);


        /* ---------------------------------------------
           Find elements
        --------------------------------------------- */

        const image =
            card.querySelector(".product-image");

        const badge =
            card.querySelector(".product-badge");

        const name =
            card.querySelector(".product-name");

        const currentPrice =
            card.querySelector(".current-price");

        const oldPrice =
            card.querySelector(".old-price");

        const rating =
            card.querySelector(".rating-number");


        /* ---------------------------------------------
           Check template
        --------------------------------------------- */

        if (!image) {

            console.error(
                "ERROR: .product-image missing."
            );

            return;
        }

        if (!name) {

            console.error(
                "ERROR: .product-name missing."
            );

            return;
        }


        /* =================================================
           IMAGE
        ================================================= */

        const imagePath =
            getImagePath(product.image);


        console.log(
            "Product:",
            product.name,
            "Image:",
            imagePath
        );


        image.src = imagePath;

        image.alt = product.name;


        /* Image loaded */

        image.onload = function () {

            console.log(
                "✓ IMAGE LOADED:",
                imagePath
            );

        };


        /* Image failed */

        image.onerror = function () {

            console.error(
                "✗ IMAGE NOT FOUND:",
                imagePath
            );

        };


        /* =================================================
           NAME
        ================================================= */

        name.textContent =
            product.name;


        /* =================================================
           CURRENT PRICE
        ================================================= */

        if (currentPrice) {

            currentPrice.textContent =
                "$" +
                Number(product.price).toFixed(2);

        }


        /* =================================================
           OLD PRICE
        ================================================= */

        if (oldPrice) {

            if (product.oldPrice) {

                oldPrice.textContent =
                    "$" +
                    Number(product.oldPrice).toFixed(2);

            } else {

                oldPrice.textContent = "";

            }

        }


        /* =================================================
           RATING
        ================================================= */

        if (rating) {

            rating.textContent =
                "(" +
                product.rating +
                ")";

        }


        /* =================================================
           BADGE
        ================================================= */

        if (badge) {

            if (product.discount) {

                badge.textContent =
                    "-" +
                    product.discount +
                    "%";

                badge.classList.add(
                    "discount"
                );

                badge.style.display =
                    "block";

            }

            else if (product.badge) {

                badge.textContent =
                    product.badge;

                badge.style.display =
                    "block";

            }

            else {

                badge.textContent = "";

                badge.style.display =
                    "none";

            }

        }


        const addCartBtn = card.querySelector(".add-cart-btn");
        if (addCartBtn) {
            addCartBtn.dataset.id = product.id;
        }

        const wishlistBtn = card.querySelector(".wishlist-btn");
        if (wishlistBtn) {
            wishlistBtn.dataset.id = product.id;
            const active = isInWishlist(product.id);
            wishlistBtn.textContent = active ? "♥" : "♡";
            if (active) {
                wishlistBtn.classList.add("active");
                wishlistBtn.style.color = "#ffffff";
            } else {
                wishlistBtn.classList.remove("active");
                wishlistBtn.style.color = "";
            }
        }

        /* =================================================
           ADD CARD
        ================================================= */

        moreProductContainer.appendChild(card);

    });


    console.log(
    "Cards created:",
    moreProductContainer.children.length
);

console.log(
    "Container:",
    moreProductContainer
);

console.log(
    "Container HTML:",
    moreProductContainer.innerHTML
);
}


/* =====================================================
   PRODUCT TABS
===================================================== */

productTabs.forEach(function (tab) {

    tab.addEventListener(
        "click",
        function () {

            /* Remove active */

            productTabs.forEach(
                function (item) {

                    item.classList.remove(
                        "active"
                    );

                }
            );


            /* Add active */

            tab.classList.add("active");


            /* Get category */

            const category =
                tab.getAttribute(
                    "data-category"
                );


            console.log(
                "Selected category:",
                category
            );


            /* Display products */

            showProducts(category);

        }
    );

});


/* =====================================================
   PRODUCT BUTTONS
===================================================== */

if (moreProductContainer) {

    moreProductContainer.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest("button");


            if (!button) {
                return;
            }


            /* Add to cart */

            if (
                button.classList.contains(
                    "add-cart-btn"
                )
            ) {
                const prodId = button.dataset.id;
                const prod = allProducts.find((p) => String(p.id) === String(prodId));
                if (prod) {
                    addProductToCart(prod, 1);
                    alert(`${prod.name} added to cart`);
                } else {
                    alert(
                        "Product added to cart"
                    );
                }
            }


            /* Wishlist */

            if (
                button.classList.contains(
                    "wishlist-btn"
                )
            ) {
                const prodId = button.dataset.id;
                const prod = allProducts.find((p) => String(p.id) === String(prodId));
                if (prod) {
                    toggleWishlist(prod).then((isSaved) => {
                        button.textContent = isSaved ? "♥" : "♡";
                        if (isSaved) {
                            button.classList.add("active");
                            button.style.color = "#14f1b2";
                        } else {
                            button.classList.remove("active");
                            button.style.color = "";
                        }
                    });
                }
            }


            /* Compare */

            if (
                button.classList.contains(
                    "compare-btn"
                )
            ) {

                alert(
                    "Product added to compare"
                );

            }

        }
    );

}

subscribeWishlist(() => {
    if (!moreProductContainer) return;
    const btns = moreProductContainer.querySelectorAll(".wishlist-btn");
    btns.forEach((btn) => {
        const id = btn.dataset.id;
        if (id) {
            const active = isInWishlist(id);
            btn.textContent = active ? "♥" : "♡";
            if (active) {
                btn.classList.add("active");
                btn.style.color = "#ffffff";
            } else {
                btn.classList.remove("active");
                btn.style.color = "";
            }
        }
    });
});