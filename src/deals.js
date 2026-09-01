const dealsProductContainer =
    document.querySelector("#dealsProductContainer");

const productTemplate =
    document.querySelector("#productTemplate");


fetch("./src/api/horizScrollProd.json")

    .then(function(response) {
        return response.json();
    })

    .then(function(products) {

        products.forEach(function(product) {

            const card =
                productTemplate.content.cloneNode(true);

            card.querySelector(".deal-image").src =
                product.image;

            card.querySelector(".deal-image").alt =
                product.name;

            card.querySelector(".deal-discount").textContent =
                product.discount + "% off";

            card.querySelector(".deal-category").textContent =
                product.category;

            card.querySelector(".deal-name").textContent =
                product.name;

            card.querySelector(".deal-current-price").textContent =
                "$" + product.price.toFixed(2);

            card.querySelector(".deal-old-price").textContent =
                "$" + product.oldPrice.toFixed(2);

            card.querySelector(".deal-rating-number").textContent =
                product.rating;

            dealsProductContainer.appendChild(card);

        });

        watchDealsSection();

    });


function watchDealsSection() {

    const observer =
        new IntersectionObserver(function(entries) {

            entries.forEach(function(entry) {

                if (entry.isIntersecting) {

                    autoScroll();

                }

            });

        }, {
            threshold: 0.5
        });


    observer.observe(dealsProductContainer);

}


function autoScroll() {

    setInterval(function() {

        dealsProductContainer.scrollLeft += 2;

    }, 20);

}
``