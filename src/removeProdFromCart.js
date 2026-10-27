import { getCartProductFromLS } from "./getCartProducts.js";
import { showToast } from "./showToast.js";
import { updateCartValue } from "./updateCartValue.js";


export const removeProdFromCart = (id) => {
    cartProducts = cartProducts.filter((curProd) => String(curProd.id) !== String(id));

    localStorage.setItem("cartProductLS", JSON.stringify(cartProducts));
    window.dispatchEvent(new Event("cartUpdated"));


    // to remove the div by clicked
    let removeDiv = document.getElementById(`card${id}`);
    if(removeDiv){
        removeDiv.remove();
        // show toast product delete to the cart message
        showToast("delete",id);
    }

    updateCartValue(cartProducts);
};