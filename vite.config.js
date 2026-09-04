import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

export default defineConfig({
    base: "/KSAM-deal-ecommerce-website/",

    plugins: [react()],

    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                contact: resolve(__dirname, "contact.html"),
                login: resolve(__dirname, "login.html"),
                product: resolve(__dirname, "Product.html"),
                signUp: resolve(__dirname, "signUp.html"),
                moreChairProd: resolve(__dirname, "moreChairProd.html"),
                addToCart: resolve(__dirname, "addToCart.html"),
                beauty: resolve(__dirname, "beauty.html")
            }
        }
    }
});