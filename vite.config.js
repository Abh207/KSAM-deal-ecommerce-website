// vite.config.js

import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

export default defineConfig({
    // GitHub Pages repository path
    base: "/KSAM-deal-ecommerce-website/",

    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                contact: resolve(__dirname, "contact.html"),
                login: resolve(__dirname, "login.html"),
                product: resolve(__dirname, "Product.html"),
                signUp: resolve(__dirname, "signUp.html"),
                moreChairProd: resolve(__dirname, "moreChairProd.html"),
                addToCart: resolve(__dirname, "addToCart.html")
            }
        }
    }
});