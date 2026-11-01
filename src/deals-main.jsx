import React from "react";
import { createRoot } from "react-dom/client";
import Deals from "./deals/Deals.jsx";
import "./deals/tailwind-generated.css";
import "./deals/deals.css";
import "./deals/components/dealCardV2.css";

const root = document.getElementById("deals-root") || document.getElementById("deal-root");

if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <Deals />
    </React.StrictMode>
  );
}
