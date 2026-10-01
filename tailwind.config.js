/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./Deals.html",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],

    theme: {
        extend: {

            colors: {
                neon: "#22FF88",
                yellow: "#FFD60A",
                sky: "#38BDF8",
                dark: "#000000",
                card: "#0A0A0A",
                panel: "#111111"
            },

            boxShadow: {
                neon:
                    "0 0 30px rgba(34,255,136,0.18)",

                blue:
                    "0 0 30px rgba(56,189,248,0.18)",

                yellow:
                    "0 0 30px rgba(255,214,10,0.16)"
            },

            animation: {

                "marquee-left":
                    "marquee-left 35s linear infinite",

                "marquee-right":
                    "marquee-right 35s linear infinite",

                float:
                    "float 6s ease-in-out infinite",

                pulse-glow:
                    "pulse-glow 2s ease-in-out infinite",

                "fade-up":
                    "fade-up .7s ease forwards"
            },

            keyframes: {

                "marquee-left": {
                    "0%": {
                        transform: "translateX(0)"
                    },

                    "100%": {
                        transform:
                            "translateX(-50%)"
                    }
                },

                "marquee-right": {
                    "0%": {
                        transform:
                            "translateX(-50%)"
                    },

                    "100%": {
                        transform:
                            "translateX(0)"
                    }
                },

                float: {
                    "0%, 100%": {
                        transform:
                            "translateY(0px)"
                    },

                    "50%": {
                        transform:
                            "translateY(-20px)"
                    }
                },

                "pulse-glow": {

                    "0%, 100%": {
                        opacity: ".5"
                    },

                    "50%": {
                        opacity: "1"
                    }
                },

                "fade-up": {

                    "0%": {
                        opacity: "0",
                        transform:
                            "translateY(30px)"
                    },

                    "100%": {
                        opacity: "1",
                        transform:
                            "translateY(0)"
                    }

                }
            }
        }
    },

    plugins: []
    
};