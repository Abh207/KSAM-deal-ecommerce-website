/* =====================================================
   MORE PRODUCTS CONTAINER
===================================================== */

const moreProductContainer =
    document.querySelector("#moreProductContainer");


const moreProductTemplate =
    document.querySelector("#moreProductTemplate");


const productTabs =
    document.querySelectorAll(".product-tab");


let allProducts = [];



/* =====================================================
   LOAD PRODUCTS FROM JSON
===================================================== */

fetch("../src/api/moreChairProdjn.json")

    .then(function(response) {

        if (!response.ok) {

            throw new Error(
                "Failed to load products JSON"
            );

        }

        return response.json();

    })

    .then(function(products) {

        allProducts = products;

        showProducts("new");

    })

    .catch(function(error) {

        console.log(
            "Error loading products:",
            error
        );

    });



/* =====================================================
   SHOW PRODUCTS
===================================================== */

function showProducts(category) {

    /* Clear old products */

    moreProductContainer.innerHTML = "";


    /* Filter products */

    const filteredProducts =
        allProducts.filter(function(product) {

            return product.category === category;

        });


    /* Create product cards */

    filteredProducts.forEach(function(product) {


        /* Create template copy */

        const card =
            moreProductTemplate.content.cloneNode(true);


        /* =================================================
           GET ELEMENTS
        ================================================= */

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



        /* =================================================
           IMAGE
        ================================================= */

        image.src =
            product.image;

        image.alt =
            product.name;



        /* =================================================
           NAME
        ================================================= */

        name.textContent =
            product.name;



        /* =================================================
           CURRENT PRICE
        ================================================= */

        currentPrice.textContent =
            "$" + product.price.toFixed(2);



        /* =================================================
           OLD PRICE
        ================================================= */

        if (product.oldPrice) {

            oldPrice.textContent =
                "$" + product.oldPrice.toFixed(2);

        }
        else {

            oldPrice.textContent = "";

        }



        /* =================================================
           RATING
        ================================================= */

        rating.textContent =
            "(" + product.rating + ")";



        /* =================================================
           BADGE
        ================================================= */

        if (product.discount) {

            badge.textContent =
                "-" + product.discount + "%";

            badge.classList.add("discount");

        }

        else if (product.badge) {

            badge.textContent =
                product.badge;

        }

        else {

            badge.style.display = "none";

        }



        /* =================================================
           ADD CARD
        ================================================= */

        moreProductContainer.appendChild(card);

    });

}



/* =====================================================
   PRODUCT TABS
===================================================== */

productTabs.forEach(function(tab) {

    tab.addEventListener(
        "click",
        function() {


            /* Remove active */

            productTabs.forEach(function(item) {

                item.classList.remove("active");

            });


            /* Add active */

            tab.classList.add("active");


            /* Get category */

            const category =
                tab.getAttribute(
                    "data-category"
                );


            /* Show products */

            showProducts(category);

        }
    );

});



/* =====================================================
   PRODUCT BUTTONS
===================================================== */

moreProductContainer.addEventListener(
    "click",
    function(event) {


        /* ADD TO CART */

        if (
            event.target.classList.contains(
                "add-cart-btn"
            )
        ) {

            alert("Product added to cart");

        }


        /* WISHLIST */

        if (
            event.target.classList.contains(
                "wishlist-btn"
            )
        ) {

            event.target.textContent = "♥";

        }


        /* COMPARE */

        if (
            event.target.classList.contains(
                "compare-btn"
            )
        ) {

            alert("Product added to compare");

        }

    }
);