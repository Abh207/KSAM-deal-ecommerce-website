import React from "react";
import { createRoot } from "react-dom/client";
import DealDetail from "./DealDetail.jsx";
import "./tailwind-generated.css";
import "./deals.css";
import "./responsive-cards.css";

const rootEl = document.getElementById("deal-root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <DealDetail />
    </React.StrictMode>
  );
}

export default DealDetail;
