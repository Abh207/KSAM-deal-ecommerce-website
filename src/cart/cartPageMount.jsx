import React from "react";
import { createRoot } from "react-dom/client";
import Navbar from "../deals/components/Navbar.jsx";

// Mount modern KSAM Deal Navbar only (Footer removed per design specification)
const navContainer = document.getElementById("cart-navbar-root");
if (navContainer) {
  createRoot(navContainer).render(<Navbar />);
}
