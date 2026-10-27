// import { updateCartValue } from "./updateCartValue.js";

// export const getCartProductFromLS = () => {
//     let cartProducts = localStorage.getItem("cartProductLS");
//     if(!cartProducts){
//         return [];
//     }
//     cartProducts = JSON.parse(cartProducts);

//     updateCartValue(cartProducts);


//     return cartProducts;
// };








import { updateCartValue } from "./updateCartValue.js";
import { getNormalizedCart } from "./lib/cartHelper.js";


export const getCartProductFromLS = () => {

    try {
        const cartProducts = getNormalizedCart();
        updateCartValue(cartProducts);
        return cartProducts;
    } catch (error) {

        console.error(
            "Error reading cart:",
            error
        );

        updateCartValue([]);

        return [];
    }
};