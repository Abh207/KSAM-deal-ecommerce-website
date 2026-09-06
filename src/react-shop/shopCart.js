/* =========================================================
   KSAM DEAL - REACT SHOP CART
========================================================= */

const CART_KEY = "cartProductLS";


/* =========================================================
   GET CART
========================================================= */

function getShopCart() {

    try {

        return JSON.parse(
            localStorage.getItem(CART_KEY)
        ) || [];

    } catch (error) {

        console.error(
            "Unable to read cart:",
            error
        );

        return [];

    }

}


/* =========================================================
   SAVE CART
========================================================= */

function saveShopCart(cart) {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}


/* =========================================================
   RENDER CART
========================================================= */

function renderShopCart() {

    const container =
        document.querySelector(
            "#productCartContainer"
        );


    if (!container) {

        return;

    }


    const cart = getShopCart();


    container.innerHTML = "";


    if (cart.length === 0) {

        container.innerHTML = `

            <div class="shop-empty-cart">

                <div class="shop-empty-cart-icon">
                    🛒
                </div>

                <h2>
                    Your Cart Is Empty
                </h2>

                <p>
                    Add some products from our shop.
                </p>

                <a href="./shop.html">
                    Continue Shopping
                </a>

            </div>

        `;

        updateShopTotals();

        return;

    }


    cart.forEach((product) => {

        const quantity =
            Number(product.quantity || 1);


        const price =
            Number(product.price || 0);


        const total =
            price * quantity;


        const card =
            document.createElement("article");


        card.className =
            "shop-cart-product";


        card.dataset.id =
            product.id;


        card.innerHTML = `

            <div class="shop-cart-image">

                <img
                    src="${product.image || ""}"
                    alt="${product.name || "Product"}"
                >

            </div>


            <div class="shop-cart-info">

                <span class="shop-cart-category">
                    ${product.category || "Electronics"}
                </span>

                <h3>
                    ${product.name || "Product"}
                </h3>

                <p class="shop-cart-price">
                    $${price.toFixed(2)}
                </p>

            </div>


            <div class="shop-cart-quantity">

                <button
                    class="shop-cart-minus"
                    data-id="${product.id}"
                    type="button"
                >
                    −
                </button>


                <span>
                    ${quantity}
                </span>


                <button
                    class="shop-cart-plus"
                    data-id="${product.id}"
                    type="button"
                >
                    +
                </button>

            </div>


            <div class="shop-cart-total">

                $${total.toFixed(2)}

            </div>


            <button
                class="shop-cart-remove"
                data-id="${product.id}"
                type="button"
            >
                Remove
            </button>

        `;


        container.appendChild(card);

    });


    attachCartEvents();

    updateShopTotals();

}


/* =========================================================
   CART EVENTS
========================================================= */

function attachCartEvents() {

    document
        .querySelectorAll(".shop-cart-plus")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    changeQuantity(
                        button.dataset.id,
                        1
                    );

                }
            );

        });


    document
        .querySelectorAll(".shop-cart-minus")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    changeQuantity(
                        button.dataset.id,
                        -1
                    );

                }
            );

        });


    document
        .querySelectorAll(".shop-cart-remove")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    removeFromCart(
                        button.dataset.id
                    );

                }
            );

        });

}


/* =========================================================
   CHANGE QUANTITY
========================================================= */

function changeQuantity(
    productId,
    change
) {

    const cart =
        getShopCart();


    const product =
        cart.find(
            (item) =>
                String(item.id) ===
                String(productId)
        );


    if (!product) {

        return;

    }


    product.quantity =
        Number(product.quantity || 1) +
        change;


    if (product.quantity <= 0) {

        const newCart =
            cart.filter(
                (item) =>
                    String(item.id) !==
                    String(productId)
            );

        saveShopCart(newCart);

    } else {

        saveShopCart(cart);

    }


    renderShopCart();

}


/* =========================================================
   REMOVE PRODUCT
========================================================= */

function removeFromCart(productId) {

    const cart =
        getShopCart();


    const newCart =
        cart.filter(
            (item) =>
                String(item.id) !==
                String(productId)
        );


    saveShopCart(newCart);


    renderShopCart();

}


/* =========================================================
   UPDATE TOTALS
========================================================= */

function updateShopTotals() {

    const cart =
        getShopCart();


    let subtotal = 0;


    cart.forEach((product) => {

        subtotal +=
            Number(product.price || 0) *
            Number(product.quantity || 1);

    });


    const tax =
        subtotal * 0.05;


    const finalTotal =
        subtotal + tax;


    const subtotalElement =
        document.querySelector(
            ".productSubTotal"
        );


    const taxElement =
        document.querySelector(
            ".ProductTax"
        );


    const finalElement =
        document.querySelector(
            ".productFinalTotal"
        );


    if (subtotalElement) {

        subtotalElement.textContent =
            `$${subtotal.toFixed(2)}`;

    }


    if (taxElement) {

        taxElement.textContent =
            `$${tax.toFixed(2)}`;

    }


    if (finalElement) {

        finalElement.textContent =
            `$${finalTotal.toFixed(2)}`;

    }

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderShopCart();

    }
);


/* =========================================================
   UPDATE WHEN RETURNING TO CART TAB
========================================================= */

window.addEventListener(
    "storage",
    () => {

        renderShopCart();

    }
);