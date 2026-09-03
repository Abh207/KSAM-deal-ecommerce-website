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


export const getCartProductFromLS = () => {

    try {

        const storedProducts =
            localStorage.getItem("cartProductLS");


        if (!storedProducts) {

            updateCartValue([]);

            return [];
        }


        const cartProducts =
            JSON.parse(storedProducts);


        if (!Array.isArray(cartProducts)) {

            updateCartValue([]);

            return [];
        }


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