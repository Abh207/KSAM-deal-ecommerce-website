import products from "./api/products.json";

import { getCartProductFromLS } from "./getCartProducts.js";

let cartProducts = getCartProductFromLS();

let filterProducts = products.filter((curProd) => {
  return cartProducts.some((curElem) => curElem.id === curProd.id);
});

console.log(filterProducts);



const cartElement = document.querySelector("#productCartContainer");
const templateContainer = document.querySelector("#productCartTemplate");


const showCartProduct = () => {
  filterProducts.forEach((curProd) => {
    const { category, id, image, name, stock, price } = curProd;

    let productClone = document.importNode(templateContainer.content, true);

    
        productClone.querySelector(".category").textContent = category;

        productClone.querySelector(".productName").textContent = name;

        productClone.querySelector(".productPrice").textContent = `$${price}`;

        productClone.querySelector(".productImage").src = image;
        productClone.querySelector(".productImage").alt = name;

        productClone
            .querySelector(".productQuantity")
            .setAttribute("data-quantity", "1");
    cartElement.appendChild(productClone);
  });
};


showCartProduct();









