import './style.css';

import products from "./api/products.json";
import { showProductContainer } from '../public/homeproductcard';

//call the function to display all the items of productin a cards .

showProductContainer(products);
