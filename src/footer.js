const footerHTML = `
 <footer class="section-footer">
  <div class="footer-container container">
    <div class="content_1">
      <img src="./ksam-deal logo.png" alt="logo" class="foot-logo">
      <p>
        Welcome to the Ksamdeal store , your ultimate 
         destination for all your shopping needs.
      </p>
      <a href="www.linkedin.com/in/abhay-chauhan-ab4a0937b" class="linkedin">
        <i class="fa-brands fa-square-linkedin"></i>
      </a>
      <a href="www.youtube.com/@KsamDeal" class="youtube">
        <i class="fa-brands fa-youtube"></i>
      </a>
      <a href="" class="instagram">
        <i class="fa-brands fa-square-instagram"></i>
      </a>
    </div>
    <div class="content_2">
      <h4>
        SHOPPING
      </h4>
      <a href="">Computer Store</a><br>
      <a href="">Laptop Store</a><br>
      <a href="">Mobile Store</a><br>
      <a href="">Accessories</a><br>
    </div>
    <div class="content_3">
      <h4>
        Experience
      </h4>
      <a href="" target="_blank">Contact Us</a><br>
      <a href="" target="_blank">Payment Methods</a><br>
      <a href="" target="_blank">Delivery Information</a><br>
      <a href="" target="_blank">Returns & Exchanges</a><br>
    </div>
    <div class="content_4">
      <h4>
        Newsletter
      </h4>
      <p>
        Be the first to know about new sales and Discounts. 
      </p>
      <div class="f-email">
        <i class="fa-solid fa-envelope"></i>
        <input type="email" placeholder="Your Email" class="email">
      </div>
    </div>
  </div>
  <hr class="foot-hr">
  <div class="f-design">
    <div class="f-design-txt">
      <p>
        <span class="copy">&copy;</span> Design and code by Abhay Chauhan.
      </p>
    </div>
  </div>
</footer>`;

const footerElem = document.querySelector(".section-footer");
footerElem.insertAdjacentHTML("afterbegin",footerHTML);