import products from "./api/products.json";
import { getCartProductFromLS } from "./getCartProducts";


let cartProducts = getCartProductFromLS();

let filterProducts = products.filter((curProd) => {
  return cartProducts.some((curElem) => curElem.id === curProd.id);
});

console.log(filterProducts);



const cartElement = document.querySelector("#productCartContainer");
const templateContainer = document.querySelector("#productsCartTemplate");


const cartElement = document.querySelector("#productCartContainer");
const templateContainer = document.querySelector("#productCartTemplate");

const showCartProduct = () => {
  filterProducts.forEach((curProd) => {
    const { category, id, image, name, stock, price } = curProd;

    let productClone = document.importNode(templateContainer.content, true);

    productClone.querySelector(".category").textContent = category;

    cartElement.appendChild(productClone);
  });
};