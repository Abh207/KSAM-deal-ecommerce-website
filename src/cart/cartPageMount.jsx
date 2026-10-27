import React from "react";
import { createRoot } from "react-dom/client";
import Navbar from "../deals/components/Navbar.jsx";
import Footer from "../deals/components/Footer.jsx";

// Mount modern KSAM Deal Navbar
const navContainer = document.getElementById("cart-navbar-root");
if (navContainer) {
  createRoot(navContainer).render(<Navbar />);
}

// Mount modern KSAM Deal Footer
const footerContainer = document.getElementById("cart-footer-root");
if (footerContainer) {
  createRoot(footerContainer).render(<Footer />);
}
