import { getCartProductFromLS } from "./getCartProducts";

export const addToCart = (event,id,stock) => {
    let arrLocalStorageProduct = getCartProductFromLS(); 



    const currentProdElem = document.querySelector(`#card${id}`);
    // console.log(currentProdElem);
    let quantity = currentProdElem.querySelector(".productQuantity").innerText;
    let price = currentProdElem.querySelector(".productPrice").innerText;

    //console.log(quantity,price);

    price = price.replace("$","");
    price = Number(price * quantity);
    quantity = Number(quantity);
    let updateCart = {id , quantity , price};
    arrLocalStorageProduct.push(updateCart);
    localStorage.setItem("cartProductLS",JSON.stringify(arrLocalStorageProduct));
};