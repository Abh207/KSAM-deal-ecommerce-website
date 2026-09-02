import "./style.css";

import products from "./api/products.json";

import { showProductContainer } from "./homeproductcard.js";

// Display all products
showProductContainer(products);