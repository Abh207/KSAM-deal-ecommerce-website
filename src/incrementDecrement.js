import { getCartProductFromLS } from "./getCartProducts";
import { updateCartProductTotal } from "./updateCartProductTotal";

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

    localStoragePrice = price * quantity;
    localStoragePrice = Number(localStoragePrice.toFixed(2));


    let updatedCart = existingProd
        ? { ...existingProd, quantity, qty: quantity, price: localStoragePrice }
        : { id, quantity, qty: quantity, price: localStoragePrice };

    let updateCart = localCartProducts.map((curProd) => {
        return curProd.id === id ? updatedCart : curProd;
    });

    localStorage.setItem("cartProductLS", JSON.stringify(updateCart));
    window.dispatchEvent(new Event("cartUpdated"));

    
// also we can need to reflects the changes on the main screen

    productQuantity.innerText = quantity;
    productPrice.innerText = localStoragePrice;



    updateCartProductTotal();
};