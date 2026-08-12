const cartValue = document.querySelector("#cartValue");

export const updateCartValue = (cartProducts) => {
    return (cartValue.innerHTML = `<i class="fa-sharp fa-solid fa-cart-shopping">${cartProducts.length}</i>`);
};