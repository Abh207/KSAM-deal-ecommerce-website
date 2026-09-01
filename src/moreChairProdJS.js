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

    if (!imagePath) {
        return "";
    }

    /*
       External image
    */

    if (
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://")
    ) {
        return imagePath;
    }


    /*
       IMPORTANT

       Your project is being served from:

       /KSAM-deal-ecommerce-website/

       Therefore keep:

       ./public/image.png

       Do NOT convert it to:

       /image.png
    */

    if (imagePath.startsWith("./")) {
        return imagePath;
    }


    /*
       If JSON accidentally contains:

       /moreprodimg1.png

       convert it to:

       ./public/moreprodimg1.png
    */

    if (imagePath.startsWith("/")) {

        return "./public" + imagePath;

    }


    /*
       If JSON contains:

       moreprodimg1.png

       convert it to:

       ./public/moreprodimg1.png
    */

    if (!imagePath.startsWith("public/")) {

        return "./public/" + imagePath;

    }


    /*
       If JSON contains:

       public/moreprodimg1.png
    */

    return "./" + imagePath;
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

                alert(
                    "Product added to cart"
                );

            }


            /* Wishlist */

            if (
                button.classList.contains(
                    "wishlist-btn"
                )
            ) {

                button.textContent = "♥";

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