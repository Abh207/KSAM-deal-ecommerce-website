import React from "react";
import ReactDOM from "react-dom/client";

import ShopHome from "./ShopHome.jsx";

import "./ShopHome.css";
import "./ShopProductCard.css";

ReactDOM.createRoot(document.getElementById("shop-root")).render(
    <React.StrictMode>
        <ShopHome />
    </React.StrictMode>
);