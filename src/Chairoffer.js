const offerButtons =
    document.querySelectorAll(".offer-button");


offerButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        alert("Shop Now clicked");

    });

});