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


export const addToCart =
    (event, id, stock) => {

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


    /* =========================================
       CHECK EXISTING PRODUCT
    ========================================= */

    const existingProduct =
        cartProducts.find(
            (product) =>
                Number(product.id) ===
                Number(id)
        );


    /* =========================================
       PRODUCT ALREADY EXISTS
    ========================================= */

    if (existingProduct) {

        existingProduct.quantity =
            Number(existingProduct.quantity) +
            quantity;


        existingProduct.price =
            price;


        localStorage.setItem(
            "cartProductLS",
            JSON.stringify(cartProducts)
        );


        updateCartValue(
            cartProducts
        );


        showToast(
            "add",
            id
        );


        return;
    }


    /* =========================================
       NEW PRODUCT
    ========================================= */

    const newProduct = {

        id: Number(id),

        quantity: quantity,

        price: price
    };


    cartProducts.push(
        newProduct
    );


    /* =========================================
       SAVE
    ========================================= */

    localStorage.setItem(
        "cartProductLS",
        JSON.stringify(cartProducts)
    );


    /* =========================================
       UPDATE CART ICON
    ========================================= */

    updateCartValue(
        cartProducts
    );


    /* =========================================
       TOAST
    ========================================= */

    showToast(
        "add",
        id
    );
};