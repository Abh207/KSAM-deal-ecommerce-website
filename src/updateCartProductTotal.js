// import { getCartProductFromLS } from "./getCartProducts";

// export const updateCartProductTotal = () => {
//     let productSubTotal = document.querySelector(".productSubTotal");
//     let productFinalTotal = document.querySelector(".productFinalTotal");
//     let localCartProducts = getCartProductFromLS(); 
//     let initialValue = 0;
//     let totalProductPrice = localCartProducts.reduce((accum,curElem) => {
//         let productPrice = parseInt(curElem.price) || 0;
//         return accum + productPrice;
//     },initialValue);
//     // console.log(totalProductPrice);

//     productSubTotal.textContent = `$${totalProductPrice.toFixed(2)}`;
// productFinalTotal.textContent = `$${(totalProductPrice + 50).toFixed(2)}`;
// };


















import { getCartProductFromLS } from "./getCartProducts.js";


export const updateCartProductTotal = () => {

    const productSubTotal =
        document.querySelector(".productSubTotal");

    const productFinalTotal =
        document.querySelector(".productFinalTotal");

    const productTax =
        document.querySelector(".ProductTax");


    if (!productSubTotal || !productFinalTotal) {
        console.error(
            "Cart total elements not found."
        );

        return;
    }


    const localCartProducts =
        getCartProductFromLS();


    /* =========================================
       CALCULATE SUBTOTAL
    ========================================= */

    const totalProductPrice =
        localCartProducts.reduce(
            (total, product) => {

                const price =
                    Number(product.price) || 0;

                const quantity =
                    Number(product.quantity) || 1;

                return total + (price * quantity);

            },
            0
        );


    /* =========================================
       TAX / DELIVERY
    ========================================= */

    const tax = 50;


    const finalTotal =
        totalProductPrice + tax;


    /* =========================================
       DISPLAY
    ========================================= */

    productSubTotal.textContent =
        `$${totalProductPrice.toFixed(2)}`;


    if (productTax) {

        productTax.textContent =
            `$${tax.toFixed(2)}`;
    }


    productFinalTotal.textContent =
        `$${finalTotal.toFixed(2)}`;

};