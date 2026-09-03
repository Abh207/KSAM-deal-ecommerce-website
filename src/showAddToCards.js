// import products from "./api/products.json";
// import { fetchQuantityFromCartLS } from "./fetchQuantityFromCartLS.js";

// import { getCartProductFromLS } from "./getCartProducts.js";
// import { incrementDecrement } from "./incrementDecrement.js";
// import { removeProdFromCart } from "./removeProdFromCart.js";
// import { updateCartProductTotal } from "./updateCartProductTotal.js";

// let cartProducts = getCartProductFromLS();

// let filterProducts = products.filter((curProd) => {
//   return cartProducts.some((curElem) => curElem.id === curProd.id);
// });

// console.log(filterProducts);



// const cartElement = document.querySelector("#productCartContainer");
// const templateContainer = document.querySelector("#productCartTemplate");


// const showCartProduct = () => {
//   filterProducts.forEach((curProd) => {
//     const { category, id, image, name, stock, price } = curProd;

//     let productClone = document.importNode(templateContainer.content, true);

//     const LSActualData = fetchQuantityFromCartLS(id , price);

    
//         productClone.querySelector(".category").textContent = category;

//         productClone.querySelector("#cardValue").setAttribute("id",`card${id}`);

//         productClone.querySelector(".productName").textContent = name;

//         productClone.querySelector(".productPrice").textContent = LSActualData.price;
//         productClone.querySelector(".productQuantity").textContent = LSActualData.quantity;


//         productClone.querySelector(".stockElement").addEventListener("click",(event) => {
//           incrementDecrement(event,id,stock,price);
//         });

//         productClone.querySelector(".productImage").src = image;
//         productClone.querySelector(".productImage").alt = name;

//         productClone
//             .querySelector(".productQuantity")
//             .setAttribute("data-quantity", "1");

//     productClone.querySelector(".remove-to-cart-button").addEventListener("click", () => removeProdFromCart(id));
//     cartElement.appendChild(productClone);
//   });
// };


// showCartProduct();


// updateCartProductTotal();
























import products from "./api/products.json";

import { getCartProductFromLS } from "./getCartProducts.js";
import { incrementDecrement } from "./incrementDecrement.js";
import { removeProdFromCart } from "./removeProdFromCart.js";
import { updateCartProductTotal } from "./updateCartProductTotal.js";


/* =========================================
   CART ELEMENTS
========================================= */

const cartElement =
    document.querySelector("#productCartContainer");

const templateContainer =
    document.querySelector("#productCartTemplate");


/* =========================================
   CHECK HTML
========================================= */

if (!cartElement) {
    console.error(
        "ERROR: #productCartContainer not found."
    );
}

if (!templateContainer) {
    console.error(
        "ERROR: #productCartTemplate not found."
    );
}


/* =========================================
   LOAD CART
========================================= */

const showCartProduct = () => {

    if (!cartElement || !templateContainer) {
        return;
    }


    /* Clear old cards */

    cartElement.innerHTML = "";


    /* Get products from localStorage */

    const cartProducts =
        getCartProductFromLS();


    console.log(
        "Cart products from localStorage:",
        cartProducts
    );


    /* =========================================
       EMPTY CART
    ========================================= */

    if (cartProducts.length === 0) {

        cartElement.innerHTML = `
            <p class="empty-cart">
                Your cart is empty.
            </p>
        `;

        updateCartProductTotal();

        return;
    }


    /* =========================================
       CREATE PRODUCT CARDS
    ========================================= */

    cartProducts.forEach((cartProduct) => {

        /*
           Find complete product information
           using the ID saved in localStorage.
        */

        const product =
            products.find(
                (item) =>
                    Number(item.id) ===
                    Number(cartProduct.id)
            );


        /* Product not found */

        if (!product) {

            console.error(
                "Product not found for cart ID:",
                cartProduct.id
            );

            return;
        }


        console.log(
            "Cart product found:",
            product
        );


        /* Clone template */

        const productClone =
            document.importNode(
                templateContainer.content,
                true
            );


        /* =========================================
           CARD ID
        ========================================= */

        const card =
            productClone.querySelector("#cardValue");

        if (card) {

            card.setAttribute(
                "id",
                `card${product.id}`
            );
        }


        /* =========================================
           PRODUCT INFORMATION
        ========================================= */

        const category =
            productClone.querySelector(".category");

        const name =
            productClone.querySelector(".productName");

        const image =
            productClone.querySelector(".productImage");

        const price =
            productClone.querySelector(".productPrice");

        const quantity =
            productClone.querySelector(".productQuantity");


        if (category) {
            category.textContent =
                product.category;
        }


        if (name) {
            name.textContent =
                product.name;
        }


        if (image) {

            image.src =
                product.image;

            image.alt =
                product.name;
        }


        if (price) {

            price.textContent =
                `$${Number(cartProduct.price).toFixed(2)}`;
        }


        if (quantity) {

            quantity.textContent =
                cartProduct.quantity;

            quantity.setAttribute(
                "data-quantity",
                cartProduct.quantity
            );
        }


        /* =========================================
           QUANTITY BUTTONS
        ========================================= */

        const stockElement =
            productClone.querySelector(
                ".stockElement"
            );


        if (stockElement) {

            stockElement.addEventListener(
                "click",
                (event) => {

                    incrementDecrement(
                        event,
                        product.id,
                        product.stock,
                        product.price
                    );

                }
            );
        }


        /* =========================================
           REMOVE BUTTON
        ========================================= */

        const removeButton =
            productClone.querySelector(
                ".remove-to-cart-button"
            );


        if (removeButton) {

            removeButton.addEventListener(
                "click",
                () => {

                    removeProdFromCart(
                        product.id
                    );

                }
            );
        }


        /* =========================================
           ADD TO PAGE
        ========================================= */

        cartElement.appendChild(
            productClone
        );

    });


    /* Update total */

    updateCartProductTotal();

};


/* =========================================
   START CART
========================================= */

showCartProduct();




