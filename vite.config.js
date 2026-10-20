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
                shop: resolve(__dirname, "shop.html"),

                contact: resolve(__dirname, "contact.html"),
                login: resolve(__dirname, "login.html"),
                product: resolve(__dirname, "Product.html"),
                signUp: resolve(__dirname, "signUp.html"),
                audio: resolve(__dirname, "audio.html"),
                moreChairProd: resolve(__dirname, "moreChairProd.html"),
                addToCart: resolve(__dirname, "addToCart.html"),
                beauty: resolve(__dirname, "beauty.html"),

                checkout: resolve(__dirname, "checkout.html"),
                orderSuccess: resolve(
                    __dirname,
                    "orderSuccess.html"
                ),
                Gadgets: resolve(__dirname, "fashionSpeaker.html"),
                shoes: resolve(__dirname, "shoes.html"),

                Watchshop: resolve(__dirname, "watchshop.html"),
                watchwishlist: resolve(
                    __dirname,
                    "watchwishlist.html"
                ),
                cloths: resolve(__dirname, "clothes.html"),
                profile: resolve(__dirname, "profile.html"),
                deal: resolve(__dirname, "deal.html"),
                forgotPassword: resolve(__dirname, "forgot-password.html"),
                resetPassword: resolve(__dirname, "reset-password.html"),
                verifyEmail: resolve(__dirname, "verify-email.html"),
                emailVerified: resolve(__dirname, "email-verified.html"),
                sessionExpired: resolve(__dirname, "session-expired.html"),
                accessDenied: resolve(__dirname, "access-denied.html"),
                contactUs: resolve(__dirname, "contact-us.html"),
                privacyPolicy: resolve(__dirname, "privacy-policy.html"),
                terms: resolve(__dirname, "terms.html"),
                affiliateDisclosure: resolve(__dirname, "affiliate-disclosure.html"),
            }
        }
    }
});