/* =====================================================
   LOAD PRODUCTS
===================================================== */

let products = [];

const productContainer =
    document.querySelector("#productContainer");

const filterButtons =
    document.querySelectorAll(".filterButton");


/* =====================================================
   GET PRODUCTS FROM JSON
===================================================== */

fetch("../src/api/productsBox2.json")
    .then(response => {

        if (!response.ok) {
            throw new Error("Unable to load productsBox2.json");
        }

        return response.json();

    })

    .then(data => {

        products = data;

        showProducts(products);

    })

    .catch(error => {

        console.error(
            "Product loading error:",
            error
        );

    });


/* =====================================================
   SHOW PRODUCTS
===================================================== */

function showProducts(productList) {

    productContainer.innerHTML = "";


    productList.forEach(product => {

        const card =
            document.createElement("div");

        card.className = "productCard";


        /* ---------------------------------------------
           TIMER
        --------------------------------------------- */

        let timerHTML = "";

        if (product.timer) {

            timerHTML = `
                <div class="productTimer">
                    ${product.timer}
                </div>
            `;

        }


        /* ---------------------------------------------
           PRODUCT CARD
        --------------------------------------------- */

        card.innerHTML = `

            <div class="productImageContainer">

                <span class="discountBadge">
                    ${product.discount}% off
                </span>


                <img
                    class="productImage"
                    src="${product.image}"
                    alt="${product.name}"
                >


                <div class="productActions">

                    <button
                        class="actionButton favoriteButton"
                        title="Add to wishlist"
                    >
                        ♡
                    </button>

                    <button
                        class="actionButton"
                        title="Quick view"
                    >
                        ⛶
                    </button>

                </div>


                ${timerHTML}

            </div>


            <div class="productInfo">

                <p class="productCategory">
                    ${product.category}
                </p>


                <h2 class="productName">
                    ${product.name}
                </h2>


                <div class="productRating">

                    <span class="stars">
                        ★★★★★
                    </span>

                    <span class="ratingNumber">
                        ${product.rating}
                    </span>

                </div>


                <div class="productPrice">

                    <span class="currentPrice">
                        $${product.price.toFixed(2)}
                    </span>

                    <span class="oldPrice">
                        $${product.oldPrice.toFixed(2)}
                    </span>

                </div>

            </div>

        `;


        productContainer.appendChild(card);

    });

}


/* =====================================================
   FILTER PRODUCTS
===================================================== */

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        /* Remove active class */

        filterButtons.forEach(btn => {

            btn.classList.remove("active");

        });


        /* Add active class */

        button.classList.add("active");


        const filter =
            button.dataset.filter;


        let filteredProducts;


        /* ---------------------------------------------
           ALL PRODUCTS
        --------------------------------------------- */

        if (filter === "all") {

            filteredProducts = products;

        }


        /* ---------------------------------------------
           LATEST PRODUCTS
        --------------------------------------------- */

        else if (filter === "latest") {

            filteredProducts =
                products.filter(
                    product => product.isLatest
                );

        }


        /* ---------------------------------------------
           BEST SELLERS
        --------------------------------------------- */

        else if (filter === "best") {

            filteredProducts =
                products.filter(
                    product => product.isBestSeller
                );

        }


        /* ---------------------------------------------
           FEATURED PRODUCTS
        --------------------------------------------- */

        else if (filter === "featured") {

            filteredProducts =
                products.filter(
                    product => product.isFeatured
                );

        }


        showProducts(filteredProducts);

    });

});



/* =====================================================
   DRAG TO SCROLL
===================================================== */

let isDragging = false;

let startX = 0;

let startScrollLeft = 0;


productContainer.addEventListener(
    "mousedown",
    event => {

        isDragging = true;

        productContainer.classList.add(
            "dragging"
        );

        startX = event.pageX;

        startScrollLeft =
            productContainer.scrollLeft;

    }
);


productContainer.addEventListener(
    "mouseleave",
    () => {

        isDragging = false;

        productContainer.classList.remove(
            "dragging"
        );

    }
);


productContainer.addEventListener(
    "mouseup",
    () => {

        isDragging = false;

        productContainer.classList.remove(
            "dragging"
        );

    }
);


productContainer.addEventListener(
    "mousemove",
    event => {

        if (!isDragging) {
            return;
        }

        event.preventDefault();

        const currentX =
            event.pageX;

        const distance =
            currentX - startX;

        productContainer.scrollLeft =
            startScrollLeft - distance;

    }
);


/* =====================================================
   FAVORITE BUTTON
===================================================== */

productContainer.addEventListener(
    "click",
    event => {

        if (
            event.target.classList.contains(
                "favoriteButton"
            )
        ) {

            const button =
                event.target;

            if (button.textContent === "♡") {

                button.textContent = "♥";

            } else {

                button.textContent = "♡";

            }

        }

    }
);


// This uses the DOM directly with:

// document.createElement()
// innerHTML
// querySelector()
// appendChild()
// addEventListener()