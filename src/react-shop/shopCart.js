import "../auth/auth.js";
import {
    getNormalizedCart,
    resolveImagePath,
    DEFAULT_PLACEHOLDER_IMAGE,
    normalizeCartItem,
    CART_STORAGE_KEY
} from "../lib/cartHelper.js";

/* =========================================================
   KSAM DEAL - REACT SHOP CART
========================================================= */

const CART_KEY = CART_STORAGE_KEY;


/* =========================================================
   GET CART
========================================================= */

function getShopCart() {
    return getNormalizedCart();
}


/* =========================================================
   SAVE CART
========================================================= */

function saveShopCart(cart) {
    const normalized = (cart || []).map((item) => normalizeCartItem(item)).filter(Boolean);
    localStorage.setItem(
        CART_KEY,
        JSON.stringify(normalized)
    );
    window.dispatchEvent(new Event("cartUpdated"));
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


        const productName = product.name || product.title || "Product";
        const productImage = resolveImagePath(product.image);
        const rawOldPrice = Number(product.oldPrice || product.originalPrice || product.old_price || product.mrp || 0);
        const oldPrice = rawOldPrice > price ? rawOldPrice : 0;
        const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : (Number(product.discount || product.discount_percent) || 0);

        card.innerHTML = `

            <div class="shop-cart-image">

                <img
                    src="${productImage}"
                    alt="${productName}"
                    onerror="this.onerror=null; this.src='${DEFAULT_PLACEHOLDER_IMAGE}';"
                >

            </div>


            <div class="shop-cart-info">

                <span class="shop-cart-category">
                    ${product.category || "KSAM Deal"}
                </span>

                <h3>
                    ${productName}
                </h3>

                <div class="shop-cart-pricing">

                    <span class="shop-cart-price">
                        ₹${Math.round(price).toLocaleString("en-IN")}
                    </span>

                    ${oldPrice > price ? `
                        <span class="shop-cart-old-price">
                            ₹${Math.round(oldPrice).toLocaleString("en-IN")}
                        </span>
                    ` : ""}

                    ${discount > 0 ? `
                        <span class="shop-cart-discount-pill">
                            ${discount}% OFF
                        </span>
                    ` : ""}

                </div>

            </div>


            <div class="shop-cart-quantity">

                <button
                    class="shop-cart-minus"
                    data-id="${product.id}"
                    type="button"
                    aria-label="Decrease quantity"
                >
                    −
                </button>


                <span class="shop-cart-qty-val">
                    ${quantity}
                </span>


                <button
                    class="shop-cart-plus"
                    data-id="${product.id}"
                    type="button"
                    aria-label="Increase quantity"
                >
                    +
                </button>

            </div>


            <div class="shop-cart-total">

                ₹${Math.round(total).toLocaleString("en-IN")}

            </div>


            <button
                class="shop-cart-remove"
                data-id="${product.id}"
                type="button"
                aria-label="Remove ${productName} from cart"
            >
                <i class="fa-solid fa-trash-can"></i>
                <span>Remove</span>
            </button>

        `;



        container.appendChild(card);

    });



    attachCartEvents();

    addProceedToBuyButton();

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
   PROCEED TO BUY
========================================================= */

// function addProceedToBuyButton() {

//     const cart = getShopCart();

//     const container =
//         document.querySelector(
//             "#productCartContainer"
//         );

//     if (!container || cart.length === 0) {
//         return;
//     }

//     const existingButton =
//         document.querySelector(
//             ".shop-proceed-to-buy-wrapper"
//         );

//     if (existingButton) {
//         return;
//     }

//     const buttonWrapper =
//         document.createElement("div");

//     buttonWrapper.className =
//         "shop-proceed-to-buy-wrapper";

//     buttonWrapper.innerHTML = `

//         <button
//             class="shop-proceed-to-buy"
//             type="button"
//         >
//             Proceed to Buy
//         </button>

//     `;

//     container.parentElement.appendChild(
//         buttonWrapper
//     );

//     const button =
//         buttonWrapper.querySelector(
//             ".shop-proceed-to-buy"
//         );

//     button.addEventListener(
//         "click",
//         () => {

//             const currentCart =
//                 getShopCart();

//             if (currentCart.length === 0) {

//                 alert(
//                     "Your cart is empty."
//                 );

//                 return;
//             }

//             window.location.href =
//                 "./checkout.html";

//         }
//     );

// }



function addProceedToBuyButton() {
    const cart = getShopCart();

    const container = document.querySelector("#productCartContainer");

    if (!container || cart.length === 0) {
        return;
    }

    // Prevent duplicate button
    const existingButton = document.querySelector(
        ".shop-proceed-to-buy-wrapper"
    );

    if (existingButton) {
        return;
    }

    // Create wrapper
    const buttonWrapper = document.createElement("div");

    buttonWrapper.className = "shop-proceed-to-buy-wrapper";

    buttonWrapper.innerHTML = `
        <button
            type="button"
            class="shop-proceed-to-buy"
        >
            <span>Proceed to Checkout</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-left: 8px;"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        </button>
    `;

    // Add button below cart
    container.parentElement.appendChild(buttonWrapper);

    const button = buttonWrapper.querySelector(
        ".shop-proceed-to-buy"
    );

    button.addEventListener("click", () => {

        const currentCart = getShopCart();

        if (currentCart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        // Go to checkout page
        window.location.href = "./checkout.html";
    });
}

/* =========================================================
   UPDATE TOTALS
========================================================= */

function updateShopTotals() {

    const cart =
        getShopCart();


    let subtotal = 0;
    let originalTotal = 0;


    cart.forEach((product) => {

        const qty =
            Number(product.quantity || 1);

        const price =
            Number(product.price || 0);

        const rawOldPrice =
            Number(product.oldPrice || product.originalPrice || product.old_price || product.mrp || 0);

        const oldPrice =
            rawOldPrice > price ? rawOldPrice : price;

        subtotal +=
            price * qty;

        originalTotal +=
            oldPrice * qty;

    });


    const savings =
        originalTotal > subtotal ? (originalTotal - subtotal) : 0;

    const deliveryFee =
        (subtotal >= 999 || subtotal === 0) ? 0 : 49;

    const finalTotal =
        subtotal > 0 ? (subtotal + deliveryFee) : 0;


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
            `₹${Math.round(subtotal).toLocaleString("en-IN")}`;
    }


    if (taxElement) {
        taxElement.textContent =
            deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`;
    }


    if (finalElement) {
        finalElement.textContent =
            `₹${Math.round(finalTotal).toLocaleString("en-IN")}`;
    }


    const sumSub = document.getElementById("summarySubtotal");
    const sumSav = document.getElementById("summarySavings");
    const sumDel = document.getElementById("summaryDelivery");
    const sumTot = document.getElementById("summaryFinalTotal");

    if (sumSub) sumSub.textContent = `₹${Math.round(subtotal).toLocaleString("en-IN")}`;
    if (sumSav) sumSav.textContent = savings > 0 ? `-₹${Math.round(savings).toLocaleString("en-IN")}` : "₹0";
    if (sumDel) sumDel.textContent = deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`;
    if (sumTot) sumTot.textContent = `₹${Math.round(finalTotal).toLocaleString("en-IN")}`;

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