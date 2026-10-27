// import { getCartProductFromLS } from "./getCartProducts.js";
// import { showToast } from "./showToast.js";
// import { updateCartValue } from "./updateCartValue.js";

// getCartProductFromLS();
// export const addToCart = (event,id,stock) => {
//     let arrLocalStorageProduct = getCartProductFromLS(); 



//     const currentProdElem = document.querySelector(`#card${id}`);
//     // console.log(currentProdElem);
//     let quantity = currentProdElem.querySelector(".productQuantity").innerText;
//     let price = currentProdElem.querySelector(".productPrice").innerText;

//     //console.log(quantity,price);

//     price = price.replace("$","");

//     let existingProd = arrLocalStorageProduct.find((curProd) => curProd.id === Number(id));

//     console.log(existingProd);

//     if(existingProd && quantity > 1){
//         quantity = Number(existingProd.quantity) + Number(quantity);
//         price = Number(price * quantity);
//         let updatedCart = {id , quantity,price};

//         updatedCart=arrLocalStorageProduct.map((curProd) => {
//             return curProd.id === id ? updatedCart : curProd;

//         });
//         console.log(updatedCart);
//         localStorage.setItem("cartProductLS",JSON.stringify(updatedCart));
//         showToast("add",id);
//     }

//     if (existingProd){
//         return false;
//     }


//     price = Number(price * quantity);
//     quantity = Number(quantity);
//     let updateCart = {id , quantity , price};
//     arrLocalStorageProduct.push(updateCart);
//     localStorage.setItem("cartProductLS",JSON.stringify(arrLocalStorageProduct));

//     updateCartValue(arrLocalStorageProduct);

//     showToast("add",id);
// };













import { getCartProductFromLS } from "./getCartProducts.js";
import { showToast } from "./showToast.js";
import { updateCartValue } from "./updateCartValue.js";
import { requireAuth } from "./auth/auth.js";
import { addProductToCart, findProductInCatalog, normalizeCartItem } from "./lib/cartHelper.js";


export const addToCart =
    (event, id, stock) => {

    if (!requireAuth({ type: "add_to_cart", productId: id })) {
        return false;
    }

    /* =========================================
       GET CURRENT CART
    ========================================= */

    let cartProducts =
        getCartProductFromLS();


    /* =========================================
       GET CURRENT PRODUCT CARD
    ========================================= */

    const currentProdElem =
        document.querySelector(
            `#card${id}`
        );


    if (!currentProdElem) {

        console.error(
            "Product card not found:",
            id
        );

        return;
    }


    /* =========================================
       GET QUANTITY
    ========================================= */

    let quantity =
        Number(
            currentProdElem
                .querySelector(
                    ".productQuantity"
                )
                .innerText
        ) || 1;


    /* =========================================
       GET PRICE
    ========================================= */

    let price =
        currentProdElem
            .querySelector(
                ".productPrice"
            )
            .innerText
            .replace("$", "");


    price =
        Number(price);


    const catalogItem = findProductInCatalog(id) || {};
    const nameElem = currentProdElem.querySelector(".productName");
    const imgElem =
        currentProdElem.querySelector(".productImage") ||
        currentProdElem.querySelector("img");
    const catElem = currentProdElem.querySelector(".category");

    const productPayload = {
        id: id,
        name: catalogItem.name || (nameElem ? nameElem.innerText.trim() : "Product"),
        price: price || catalogItem.price || 0,
        oldPrice: catalogItem.oldPrice || price,
        image: catalogItem.image || (imgElem ? imgElem.getAttribute("src") : ""),
        category: catalogItem.category || (catElem ? catElem.innerText.trim() : "Deals"),
        quantity: quantity
    };

    const updatedCart = addProductToCart(productPayload, quantity);

    updateCartValue(updatedCart);

    showToast("add", id);
};