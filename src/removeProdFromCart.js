import { getCartProductFromLS } from "./getCartProducts";
import { updateCartValue } from "./updateCartValue";

export const removeProdFromCart = (id,name) => {
    let cartProducts = getCartProductFromLS();
    cartProducts = cartProducts.filter((curProd) => curProd.id !== id);

    localStorage.setItem("cartProductLS",JSON.stringify(cartProducts));


    // to remove the div by clicked
    let removeDiv = document.getElementById(`card${id}`);
    if(removeDiv){
        removeDiv.remove();
        // show toast product delete to the cart message
        showToast("delete",name);
    }

    updateCartValue(cartProducts);
};