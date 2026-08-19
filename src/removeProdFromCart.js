import { getCartProductFromLS } from "./getCartProducts.js";
import { showToast } from "./showToast.js";
import { updateCartValue } from "./updateCartValue.js";


export const removeProdFromCart = (id) => {
    let cartProducts = getCartProductFromLS();
    cartProducts = cartProducts.filter((curProd) => curProd.id !== Number(id));

    localStorage.setItem("cartProductLS",JSON.stringify(cartProducts));


    // to remove the div by clicked
    let removeDiv = document.getElementById(`card${id}`);
    if(removeDiv){
        removeDiv.remove();
        // show toast product delete to the cart message
        showToast("delete",id);
    }

    updateCartValue(cartProducts);
};