import React from "react";
import { createRoot } from "react-dom/client";
import SearchPage from "./search/Search.jsx";

const root = document.getElementById("search-root");

if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <SearchPage />
    </React.StrictMode>
  );
}
