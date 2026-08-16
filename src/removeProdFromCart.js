import { getCartProductFromLS } from "./getCartProducts";

export const removeProdFromCart = (id) => {
    let cartProducts = getCartProductFromLS();
    cartProducts = cartProducts.filter((curProd) => curProd.id !== id);

    localStorage.setItem("cartProductLS",JSON.stringify(arrLocalStorageProduct));
};