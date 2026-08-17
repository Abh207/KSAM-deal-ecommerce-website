import { getCartProductFromLS } from "./getCartProducts";

export const incrementDecrement = (event,id,stock,price) => {
    const currentCardElement = document.querySelector(`#card${id}`);
    // console.log(currentCardElement);
    const productQuantity = currentCardElement.querySelector(".productQuantity");
    const productPrice = currentCardElement.querySelector(".productPrice");


    let quantity = 1;
    let localStoragePrice =0;

    let localCartProducts = getCartProductFromLS(); 

    let existingProd = localCartProducts.find((curProd) => curProd.id === id);

    if(existingProd){
        quantity = existingProd.quantity;
        localStoragePrice = existingProd.price;
    }else{
        localStoragePrice = price;
        price = price;
    }


    if(event.target.className === "cartIncrement"){
        if(quantity < stock){
            quantity += 1;
        }else if (quantity === stock){
            quantity == stock;
            localStoragePrice = price * stock;
        }
    }
    if(event.target.className === "cartDecrement"){
        if(quantity > 1){
            quantity -= 1;
        }
    }


    // finally we will update the price in localStorage

    


};