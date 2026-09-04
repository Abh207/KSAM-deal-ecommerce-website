const greenBeautyProducts = [

    {
        id: 201,
        name: "Green Glow Cleanser",
        category: "Skin Care",
        description: "Gentle botanical cleanser for fresh and healthy skin.",
        price: 399,
        actualPrice: 599,
        stock: 20,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80"
    },

    {
        id: 202,
        name: "Vitamin C Serum",
        category: "Skin Care",
        description: "Brightening serum for naturally radiant skin.",
        price: 499,
        actualPrice: 799,
        stock: 15,
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80"
    },

    {
        id: 203,
        name: "Hydrating Moisturizer",
        category: "Skin Care",
        description: "Lightweight moisturizer for soft and hydrated skin.",
        price: 449,
        actualPrice: 699,
        stock: 25,
        image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=600&q=80"
    },

    {
        id: 204,
        name: "Daily Sunscreen SPF 50",
        category: "Skin Care",
        description: "Lightweight daily sunscreen for everyday protection.",
        price: 549,
        actualPrice: 799,
        stock: 18,
        image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=600&q=80"
    },

    {
        id: 205,
        name: "Natural Face Mask",
        category: "Skin Care",
        description: "Refreshing botanical face mask for glowing skin.",
        price: 299,
        actualPrice: 449,
        stock: 30,
        image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=600&q=80"
    },

    {
        id: 206,
        name: "Natural Lip Tint",
        category: "Makeup",
        description: "Soft natural lip tint with a comfortable finish.",
        price: 249,
        actualPrice: 399,
        stock: 35,
        image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80"
    },

    {
        id: 207,
        name: "Herbal Hair Shampoo",
        category: "Hair Care",
        description: "Nourishing herbal shampoo for healthier hair.",
        price: 349,
        actualPrice: 499,
        stock: 22,
        image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80"
    },

    {
        id: 208,
        name: "Green Bloom Perfume",
        category: "Fragrance",
        description: "Fresh botanical fragrance inspired by nature.",
        price: 699,
        actualPrice: 999,
        stock: 12,
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80"
    }

];


const GB_CART_KEY = "cartProductLS";


function gbGetCart() {

    try {

        const cart =
            JSON.parse(
                localStorage.getItem(GB_CART_KEY)
            );

        return Array.isArray(cart)
            ? cart
            : [];

    } catch {

        return [];

    }

}


function gbSaveCart(cart) {

    localStorage.setItem(
        GB_CART_KEY,
        JSON.stringify(cart)
    );

    gbUpdateCartCount();

}


function gbUpdateCartCount() {

    const cart = gbGetCart();

    const total =
        cart.reduce(
            (sum, item) =>
                sum + Number(item.quantity || 0),
            0
        );

    /*
       Update existing KsamDeal cart icon
       if it exists.
    */

    const existingCart =
        document.querySelector("#cartValue");

    if (existingCart) {

        existingCart.innerHTML = `
            <i class="fa-sharp fa-solid fa-cart-shopping"></i>
            ${total}
        `;

    }


    /* Update Green Beauty cart if added later */

    const gbCartCount =
        document.querySelector("#gb-cart-count");

    if (gbCartCount) {

        gbCartCount.textContent =
            total;

    }

}


function gbAddToCart(product) {

    const cart = gbGetCart();

    const existing =
        cart.find(
            item =>
                Number(item.id) ===
                Number(product.id)
        );


    if (existing) {

        existing.quantity =
            Number(existing.quantity) + 1;

        existing.price =
            Number(product.price);

    } else {

        cart.push({

            id: Number(product.id),

            quantity: 1,

            price: Number(product.price)

        });

    }


    gbSaveCart(cart);


    gbShowToast(
        `✓ ${product.name} added to cart`
    );

}


function gbDisplayProducts(productList) {

    const grid =
        document.querySelector(
            "#gb-product-grid"
        );

    if (!grid) return;


    grid.innerHTML = "";


    if (productList.length === 0) {

        grid.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 50px;
            ">
                <h3>No products found</h3>
                <p>Try another search.</p>
            </div>
        `;

        return;

    }


    productList.forEach(product => {

        const discount =
            Math.round(
                (
                    (
                        product.actualPrice -
                        product.price
                    )
                    /
                    product.actualPrice
                ) * 100
            );


        const card =
            document.createElement(
                "article"
            );


        card.className =
            "gb-product-card";


        card.innerHTML = `

            <div class="gb-product-card-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >

                <span class="gb-discount">
                    ${discount}% OFF
                </span>

            </div>


            <div class="gb-product-card-content">

                <small>
                    ${product.category}
                </small>

                <h3>
                    ${product.name}
                </h3>

                <p>
                    ${product.description}
                </p>


                <div class="gb-product-price">

                    <span class="gb-current-price">
                        ₹${product.price}
                    </span>

                    <span class="gb-old-price">
                        ₹${product.actualPrice}
                    </span>

                </div>


                <button
                    class="gb-add-cart"
                    data-product-id="${product.id}"
                >
                    🛒 Add to Cart
                </button>

            </div>

        `;


        grid.appendChild(card);

    });

}


function gbFilterProducts() {

    const searchInput =
        document.querySelector(
            "#gb-product-search"
        );

    const filter =
        document.querySelector(
            "#gb-product-filter"
        );


    const search =
        searchInput
            ?.value
            .trim()
            .toLowerCase() || "";


    const category =
        filter?.value || "All";


    const filtered =
        greenBeautyProducts.filter(
            product => {

                const matchesSearch =
                    product.name
                        .toLowerCase()
                        .includes(search) ||

                    product.category
                        .toLowerCase()
                        .includes(search) ||

                    product.description
                        .toLowerCase()
                        .includes(search);


                const matchesCategory =
                    category === "All" ||
                    product.category === category;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    gbDisplayProducts(filtered);

}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        gbDisplayProducts(
            greenBeautyProducts
        );


        const search =
            document.querySelector(
                "#gb-product-search"
            );

        const filter =
            document.querySelector(
                "#gb-product-filter"
            );


        search?.addEventListener(
            "input",
            gbFilterProducts
        );


        filter?.addEventListener(
            "change",
            gbFilterProducts
        );


        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        ".gb-add-cart"
                    );


                if (!button) return;


                const id =
                    Number(
                        button.dataset.productId
                    );


                const product =
                    greenBeautyProducts.find(
                        item =>
                            Number(item.id) === id
                    );


                if (product) {

                    gbAddToCart(product);

                }

            }
        );


        gbUpdateCartCount();


        gbStartCountdown();

    }
);


/* ==========================================
   TOAST
========================================== */

function gbShowToast(message) {

    const toast =
        document.querySelector(
            "#gb-toast"
        );


    if (!toast) return;


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.gbToastTimer
    );


    window.gbToastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* ==========================================
   COUNTDOWN
========================================== */

const GB_SALE_KEY =
    "ksam_green_beauty_sale_end";


function gbStartCountdown() {

    let end =
        Number(
            localStorage.getItem(
                GB_SALE_KEY
            )
        );


    if (
        !end ||
        end <= Date.now()
    ) {

        end =
            Date.now() +
            (
                5 *
                24 *
                60 *
                60 *
                1000
            );

        localStorage.setItem(
            GB_SALE_KEY,
            end
        );

    }


    function update() {

        let remaining =
            end - Date.now();


        if (remaining <= 0) {

            end =
                Date.now() +
                (
                    5 *
                    24 *
                    60 *
                    60 *
                    1000
                );


            localStorage.setItem(
                GB_SALE_KEY,
                end
            );


            remaining =
                end - Date.now();

        }


        const totalSeconds =
            Math.floor(
                remaining / 1000
            );


        const days =
            Math.floor(
                totalSeconds / 86400
            );


        const hours =
            Math.floor(
                (
                    totalSeconds % 86400
                ) / 3600
            );


        const minutes =
            Math.floor(
                (
                    totalSeconds % 3600
                ) / 60
            );


        const seconds =
            totalSeconds % 60;


        const set =
            (id, value) => {

                const element =
                    document.querySelector(
                        id
                    );

                if (element) {

                    element.textContent =
                        String(value)
                            .padStart(2, "0");

                }

            };


        set("#gb-days", days);
        set("#gb-hours", hours);
        set("#gb-minutes", minutes);
        set("#gb-seconds", seconds);

    }


    update();

    setInterval(
        update,
        1000
    );

}