import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

export default defineConfig({
    base: "/KSAM-deal-ecommerce-website/",

    plugins: [
        react(),
        compression({
            algorithm: "gzip",
            ext: ".gz"
        }),
        compression({
            algorithm: "brotliCompress",
            ext: ".br"
        }),
        visualizer({
            filename: "dist/stats.html",
            title: "KSAM Deal Bundle Visualizer",
            gzipSize: true,
            brotliSize: true,
            open: false
        })
    ],

    build: {
        target: "es2020",
        cssCodeSplit: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                shop: resolve(__dirname, "shop.html"),
                heardeprod: resolve(__dirname, "heardeprod.html"),
                contact: resolve(__dirname, "contact.html"),
                login: resolve(__dirname, "login.html"),
                product: resolve(__dirname, "Product.html"),
                signUp: resolve(__dirname, "signUp.html"),
                audio: resolve(__dirname, "audio.html"),
                moreChairProd: resolve(__dirname, "moreChairProd.html"),
                addToCart: resolve(__dirname, "addToCart.html"),
                beauty: resolve(__dirname, "beauty.html"),
                beautyProduct: resolve(__dirname, "beauty-product.html"),

                checkout: resolve(__dirname, "checkout.html"),
                orderSuccess: resolve(__dirname, "orderSuccess.html"),
                electronics: resolve(__dirname, "electronics.html"),
                Gadgets: resolve(__dirname, "fashionSpeaker.html"),
                shoes: resolve(__dirname, "shoes.html"),

                Watchshop: resolve(__dirname, "watchshop.html"),
                watchwishlist: resolve(__dirname, "watchwishlist.html"),
                wishlist: resolve(__dirname, "wishlist.html"),
                cloths: resolve(__dirname, "clothes.html"),
                profile: resolve(__dirname, "profile.html"),
                deal: resolve(__dirname, "deal.html"),
                deals: resolve(__dirname, "deals.html"),
                forgotPassword: resolve(__dirname, "forgot-password.html"),
                resetPassword: resolve(__dirname, "reset-password.html"),
                verifyEmail: resolve(__dirname, "verify-email.html"),
                emailVerified: resolve(__dirname, "email-verified.html"),
                sessionExpired: resolve(__dirname, "session-expired.html"),
                accessDenied: resolve(__dirname, "access-denied.html"),
                contactUs: resolve(__dirname, "contact-us.html"),
                privacyPolicy: resolve(__dirname, "privacy-policy.html"),
                terms: resolve(__dirname, "terms.html"),
                affiliateDisclosure: resolve(__dirname, "affiliate-disclosure.html")
            },
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/scheduler")) {
                        return "vendor-react";
                    }
                    if (id.includes("node_modules/@supabase")) {
                        return "vendor-supabase";
                    }
                    if (id.includes("node_modules/lucide-react")) {
                        return "vendor-lucide";
                    }
                    if (id.includes("node_modules/gsap")) {
                        return "vendor-gsap";
                    }
                }
            }
        }
    }
});