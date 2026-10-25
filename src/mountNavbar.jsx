import React from "react";
import { createRoot } from "react-dom/client";
import Navbar from "./deals/components/Navbar.jsx";

const rootEl = document.getElementById("navbar-root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <Navbar />
    </React.StrictMode>
  );
}
