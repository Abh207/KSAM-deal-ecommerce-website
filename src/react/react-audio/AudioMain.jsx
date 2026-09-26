import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import { createRoot } from "react-dom/client";

import AudioCard from "./AudioCard";
import AudioHero from "./AudioHero";

import audioData from "../../api/audio-products.json";

import "./audio.css";

const CART_KEY = "cartProductLS";
const WISHLIST_KEY = "audioWishlist";

const getImagePath = (image) => {
    if (!image) return "";

    return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, "")}`;
};







function AudioFooter({
    cartCount = 0,
    wishlistCount = 0,
    onBackToTop,
    onThemeToggle
}) {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [openSection, setOpenSection] = useState(null);
    const [currentYear] = useState(new Date().getFullYear());

    const handleNewsletter = (event) => {
        event.preventDefault();

        const cleanEmail = email.trim();

        if (!cleanEmail) {
            setMessage("Please enter your email address.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(cleanEmail)) {
            setMessage("Please enter a valid email address.");
            return;
        }

        localStorage.setItem("ksamAudioNewsletter", cleanEmail);

        setMessage("You're on the list. Welcome to KSAM Deal!");

        setEmail("");

        setTimeout(() => {
            setMessage("");
        }, 4000);
    };

    const toggleSection = (section) => {
        setOpenSection(
            openSection === section
                ? null
                : section
        );
    };

    const scrollToTop = () => {
        if (onBackToTop) {
            onBackToTop();
        } else {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    };

    const footerLinks = {
        shop: [
            "Earbuds",
            "Headphones",
            "Neckbands",
            "Speakers",
            "Gaming Audio",
            "Wireless Mics"
        ],

        help: [
            "Contact Us",
            "Shipping",
            "Returns",
            "Track Order",
            "FAQ",
            "Payment Methods"
        ],

        company: [
            "About KSAM",
            "Our Story",
            "Careers",
            "Privacy Policy",
            "Terms & Conditions",
            "Refund Policy"
        ]
    };

    return (
        <>
            <style>{`


/* ============================================================
   KSAM DEAL AUDIO
   PREMIUM FULL-WIDTH FOOTER
   ============================================================ */


/* ============================================================
   RESET
   ============================================================ */

.audio-footer,
.audio-footer *,
.audio-footer *::before,
.audio-footer *::after {
    box-sizing: border-box;
}


/* ============================================================
   FOOTER ROOT
   ============================================================ */

.audio-footer {
    position: relative;

    width: 100%;

    margin: 0;
    padding: 0;

    overflow: hidden;

    color: #ffffff;

    background:
        radial-gradient(
            circle at 85% 8%,
            rgba(140, 255, 0, 0.075),
            transparent 28%
        ),
        radial-gradient(
            circle at 5% 75%,
            rgba(75, 55, 220, 0.055),
            transparent 28%
        ),
        linear-gradient(
            180deg,
            #070707 0%,
            #050505 50%,
            #030303 100%
        );

    border-top:
        1px solid rgba(255, 255, 255, 0.08);

    font-family:
        Inter,
        Arial,
        Helvetica,
        sans-serif;
}


/* subtle grid */

.audio-footer::before {
    content: "";

    position: absolute;

    inset: 0;

    pointer-events: none;

    background-image:
        linear-gradient(
            rgba(255, 255, 255, 0.018) 1px,
            transparent 1px
        ),
        linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.018) 1px,
            transparent 1px
        );

    background-size: 72px 72px;

    opacity: 0.8;
}


/* ============================================================
   FULL WIDTH CONTAINER
   ============================================================ */

.audio-footer-container {
    position: relative;

    z-index: 2;

    width: 100%;

    max-width: none;

    margin: 0;

    padding-left:
        clamp(28px, 5.5vw, 110px);

    padding-right:
        clamp(28px, 5.5vw, 110px);
}


/* ============================================================
   CTA SECTION
   ============================================================ */

.audio-footer-cta {
    position: relative;

    width: 100%;

    min-height: 470px;

    display: grid;

    grid-template-columns:
        minmax(0, 1fr)
        minmax(430px, 0.75fr);

    align-items: center;

    column-gap:
        clamp(60px, 9vw, 170px);

    padding-top: 75px;
    padding-bottom: 75px;

    border-bottom:
        1px solid rgba(255, 255, 255, 0.075);
}


/* green glow */

.audio-footer-cta::after {
    content: "";

    position: absolute;

    width: 420px;
    height: 420px;

    right: -180px;
    top: -100px;

    border-radius: 50%;

    background:
        rgba(140, 255, 0, 0.055);

    filter: blur(100px);

    pointer-events: none;
}


/* ============================================================
   CTA EYEBROW
   ============================================================ */

.audio-footer-eyebrow {
    display: inline-flex;

    align-items: center;

    gap: 10px;

    margin-bottom: 20px;

    color: #8cff00;

    font-size: 13px;

    font-weight: 900;

    letter-spacing: 0.18em;

    text-transform: uppercase;
}


.audio-footer-eyebrow-dot {
    width: 9px;
    height: 9px;

    flex: 0 0 9px;

    border-radius: 50%;

    background: #8cff00;

    box-shadow:
        0 0 0 7px rgba(140, 255, 0, 0.07),
        0 0 25px rgba(140, 255, 0, 0.65);

    animation:
        audioFooterPulse 2s ease-in-out infinite;
}


@keyframes audioFooterPulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.3);
    }
}


/* ============================================================
   CTA HEADING
   ============================================================ */

.audio-footer-cta h2 {
    position: relative;

    z-index: 2;

    max-width: 850px;

    margin: 0;

    color: #ffffff;

    font-size:
        clamp(55px, 6.2vw, 105px);

    font-weight: 950;

    line-height: 0.9;

    letter-spacing: -0.065em;
}


.audio-footer-cta h2 span {
    color: #8cff00;
}


/* ============================================================
   CTA DESCRIPTION
   ============================================================ */

.audio-footer-cta-text {
    max-width: 650px;

    margin: 30px 0 0;

    color:
        rgba(255, 255, 255, 0.58);

    font-size:
        clamp(15px, 1.1vw, 18px);

    line-height: 1.8;
}


/* ============================================================
   NEWSLETTER CARD
   ============================================================ */

.audio-footer-newsletter {
    position: relative;

    z-index: 3;

    width: 100%;

    max-width: 620px;

    justify-self: end;

    padding: 42px;

    border:
        1px solid rgba(255, 255, 255, 0.11);

    border-radius: 26px;

    background:
        linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.065),
            rgba(255, 255, 255, 0.018)
        );

    box-shadow:
        0 35px 100px rgba(0, 0, 0, 0.38),
        inset 0 1px 0
            rgba(255, 255, 255, 0.045);
}


.audio-footer-newsletter h3 {
    margin: 0 0 12px;

    color: #8cff00;

    font-size:
        clamp(26px, 2.2vw, 36px);

    font-weight: 900;

    line-height: 1.05;

    letter-spacing: -0.03em;
}


.audio-footer-newsletter p {
    max-width: 520px;

    margin: 0 0 25px;

    color:
        rgba(255, 255, 255, 0.52);

    font-size: 14px;

    line-height: 1.7;
}


/* ============================================================
   NEWSLETTER FORM
   ============================================================ */

.audio-footer-form {
    width: 100%;

    display: grid;

    grid-template-columns:
        minmax(0, 1fr)
        auto;

    gap: 10px;
}


.audio-footer-input {
    width: 100%;

    min-width: 0;

    height: 56px;

    padding:
        0 18px;

    border:
        1px solid rgba(255, 255, 255, 0.11);

    border-radius: 13px;

    outline: none;

    color: #ffffff;

    background:
        rgba(0, 0, 0, 0.32);

    font-size: 14px;

    transition:
        border-color 0.25s ease,
        box-shadow 0.25s ease;
}


.audio-footer-input::placeholder {
    color:
        rgba(255, 255, 255, 0.38);
}


.audio-footer-input:focus {
    border-color: #8cff00;

    box-shadow:
        0 0 0 4px
        rgba(140, 255, 0, 0.08);
}


.audio-footer-submit {
    min-width: 145px;

    height: 56px;

    padding:
        0 24px;

    border: none;

    border-radius: 13px;

    color: #050505;

    background: #8cff00;

    font-size: 14px;

    font-weight: 900;

    cursor: pointer;

    transition:
        transform 0.25s ease,
        box-shadow 0.25s ease;
}


.audio-footer-submit:hover {
    transform: translateY(-3px);

    box-shadow:
        0 15px 35px
        rgba(140, 255, 0, 0.22);
}


.audio-footer-message {
    margin-top: 12px;

    color: #8cff00;

    font-size: 12px;

    font-weight: 700;
}


/* ============================================================
   TRUST / BENEFITS
   ============================================================ */

.audio-footer-trust {
    width: 100%;

    display: grid;

    grid-template-columns:
        repeat(4, minmax(0, 1fr));

    gap: 16px;

    padding:
        35px 0;

    border-bottom:
        1px solid rgba(255, 255, 255, 0.075);
}


.audio-footer-trust-item {
    min-width: 0;

    min-height: 105px;

    display: flex;

    align-items: center;

    gap: 15px;

    padding: 20px;

    border:
        1px solid rgba(255, 255, 255, 0.08);

    border-radius: 18px;

    background:
        rgba(255, 255, 255, 0.018);

    transition:
        transform 0.25s ease,
        border-color 0.25s ease,
        background 0.25s ease;
}


.audio-footer-trust-item:hover {
    transform: translateY(-5px);

    border-color:
        rgba(140, 255, 0, 0.25);

    background:
        rgba(140, 255, 0, 0.035);
}


.audio-footer-trust-icon {
    width: 50px;
    height: 50px;

    flex: 0 0 50px;

    display: grid;

    place-items: center;

    border-radius: 15px;

    color: #8cff00;

    background:
        rgba(140, 255, 0, 0.10);

    font-size: 18px;
}


.audio-footer-trust strong {
    display: block;

    margin-bottom: 5px;

    color: #ffffff;

    font-size: 14px;

    font-weight: 800;
}


.audio-footer-trust span {
    color:
        rgba(255, 255, 255, 0.42);

    font-size: 12px;

    line-height: 1.5;
}


/* ============================================================
   MAIN FOOTER GRID
   ============================================================ */

.audio-footer-main {
    width: 100%;

    display: grid;

    grid-template-columns:
        minmax(270px, 1.65fr)
        minmax(130px, 0.9fr)
        minmax(130px, 0.9fr)
        minmax(130px, 0.9fr)
        minmax(145px, 0.8fr);

    gap:
        clamp(25px, 4vw, 75px);

    padding:
        75px 0 70px;
}


/* ============================================================
   BRAND
   ============================================================ */

.audio-footer-brand {
    min-width: 0;

    max-width: 420px;
}


.audio-footer-logo {
    display: inline-flex;

    align-items: center;

    gap: 3px;

    margin-bottom: 22px;

    text-decoration: none;
}


.audio-footer-logo-main,
.audio-footer-logo-accent {
    font-size:
        clamp(30px, 2.4vw, 40px);

    font-weight: 950;

    line-height: 1;

    letter-spacing: -0.065em;
}


.audio-footer-logo-main {
    color: #ffffff;
}


.audio-footer-logo-accent {
    color: #8cff00;
}


.audio-footer-description {
    max-width: 360px;

    margin: 0;

    color:
        rgba(255, 255, 255, 0.48);

    font-size: 14px;

    line-height: 1.85;
}


/* ============================================================
   CART / WISHLIST STATS
   ============================================================ */

.audio-footer-brand > .audio-footer-stats {
    margin-top: 24px;
}


/* ============================================================
   STAT CARDS
   ============================================================ */

.audio-footer-stats {
    display: grid;

    gap: 12px;
}


.audio-footer-stat {
    width: 100%;

    min-height: 82px;

    padding: 17px;

    border:
        1px solid rgba(255, 255, 255, 0.075);

    border-radius: 15px;

    background:
        rgba(255, 255, 255, 0.018);

    transition:
        transform 0.25s ease,
        border-color 0.25s ease;
}


.audio-footer-stat:hover {
    transform: translateY(-3px);

    border-color:
        rgba(140, 255, 0, 0.20);
}


.audio-footer-stat strong {
    display: block;

    margin-bottom: 7px;

    color: #8cff00;

    font-size: 23px;

    font-weight: 950;

    line-height: 1;
}


.audio-footer-stat span {
    color:
        rgba(255, 255, 255, 0.42);

    font-size: 10px;

    line-height: 1.5;

    letter-spacing: 0.08em;

    text-transform: uppercase;
}


/* ============================================================
   FOOTER HEADINGS
   ============================================================ */

.audio-footer-heading {
    margin:
        0 0 23px;

    color: #ffffff;

    font-size: 13px;

    font-weight: 900;

    letter-spacing: 0.14em;

    line-height: 1.3;

    text-transform: uppercase;
}


/* ============================================================
   FOOTER COLUMNS
   ============================================================ */

.audio-footer-column {
    min-width: 0;
}


.audio-footer-links {
    display: flex;

    flex-direction: column;

    gap: 13px;
}


.audio-footer-link {
    width: fit-content;

    padding: 0;

    border: none;

    outline: none;

    color:
        rgba(255, 255, 255, 0.47);

    background: transparent;

    font-size: 14px;

    line-height: 1.45;

    text-align: left;

    cursor: pointer;

    transition:
        color 0.2s ease,
        transform 0.2s ease;
}


.audio-footer-link:hover {
    color: #8cff00;

    transform: translateX(5px);
}


/* ============================================================
   SOCIAL ICONS
   ============================================================ */

.audio-footer-socials {
    display: flex;

    flex-wrap: wrap;

    gap: 10px;

    margin-top: 28px;
}


.audio-footer-social {
    width: 45px;
    height: 45px;

    flex: 0 0 45px;

    display: grid;

    place-items: center;

    border:
        1px solid rgba(255, 255, 255, 0.09);

    border-radius: 50%;

    color:
        rgba(255, 255, 255, 0.62);

    background:
        rgba(255, 255, 255, 0.025);

    text-decoration: none;

    transition:
        transform 0.25s ease,
        color 0.25s ease,
        background 0.25s ease,
        border-color 0.25s ease;
}


.audio-footer-social:hover {
    transform:
        translateY(-4px);

    color: #050505;

    background: #8cff00;

    border-color: #8cff00;
}


/* ============================================================
   MOBILE TOGGLE
   ============================================================ */

.audio-footer-mobile-toggle {
    display: none;

    width: 100%;

    align-items: center;

    justify-content: space-between;

    padding: 15px 0;

    border: none;

    border-bottom:
        1px solid rgba(255, 255, 255, 0.08);

    color: #ffffff;

    background: transparent;

    font-size: 14px;

    font-weight: 850;

    cursor: pointer;
}


.audio-footer-mobile-content {
    display: block;
}


/* ============================================================
   BOTTOM
   ============================================================ */

.audio-footer-bottom {
    width: 100%;

    min-height: 80px;

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 30px;

    padding:
        23px 0 27px;

    border-top:
        1px solid rgba(255, 255, 255, 0.075);
}


.audio-footer-copy {
    color:
        rgba(255, 255, 255, 0.38);

    font-size: 12px;

    line-height: 1.6;
}


.audio-footer-copy strong {
    color: #ffffff;
}


.audio-footer-bottom-links {
    display: flex;

    align-items: center;

    flex-wrap: wrap;

    gap: 24px;
}


.audio-footer-bottom-links button {
    padding: 0;

    border: none;

    color:
        rgba(255, 255, 255, 0.40);

    background: transparent;

    font-size: 12px;

    cursor: pointer;

    transition: color 0.2s ease;
}


.audio-footer-bottom-links button:hover {
    color: #8cff00;
}


/* ============================================================
   BACK TO TOP
   ============================================================ */

.audio-footer-top {
    position: fixed;

    right: 28px;
    bottom: 28px;

    z-index: 9999;

    width: 56px;
    height: 56px;

    display: grid;

    place-items: center;

    border: none;

    border-radius: 50%;

    color: #050505;

    background: #8cff00;

    font-size: 17px;

    font-weight: 900;

    cursor: pointer;

    box-shadow:
        0 12px 40px
        rgba(140, 255, 0, 0.25);

    transition:
        transform 0.25s ease,
        box-shadow 0.25s ease;
}


.audio-footer-top:hover {
    transform: translateY(-5px);

    box-shadow:
        0 18px 50px
        rgba(140, 255, 0, 0.35);
}


/* ============================================================
   LARGE DESKTOP
   ============================================================ */

@media (min-width: 1600px) {

    .audio-footer-container {
        padding-left: 6vw;
        padding-right: 6vw;
    }


    .audio-footer-main {
        grid-template-columns:
            minmax(320px, 1.7fr)
            minmax(160px, 1fr)
            minmax(160px, 1fr)
            minmax(160px, 1fr)
            minmax(180px, 0.9fr);

        gap: 5vw;
    }


    .audio-footer-cta {
        grid-template-columns:
            minmax(0, 1fr)
            minmax(500px, 0.72fr);

        column-gap: 8vw;
    }
}


/* ============================================================
   TABLET
   ============================================================ */

@media (max-width: 1150px) {

    .audio-footer-cta {
        grid-template-columns:
            1fr 0.85fr;

        column-gap: 40px;
    }


    .audio-footer-main {
        grid-template-columns:
            repeat(3, minmax(0, 1fr));

        row-gap: 50px;
    }


    .audio-footer-brand {
        grid-column: 1 / -1;

        max-width: 650px;
    }
}


/* ============================================================
   MOBILE
   ============================================================ */

@media (max-width: 760px) {

    .audio-footer-container {
        padding-left: 20px;
        padding-right: 20px;
    }


    /* CTA */

    .audio-footer-cta {
        grid-template-columns: 1fr;

        min-height: auto;

        row-gap: 35px;

        padding:
            60px 0 50px;
    }


    .audio-footer-cta h2 {
        font-size:
            clamp(46px, 13vw, 68px);

        line-height: 0.92;
    }


    .audio-footer-cta-text {
        margin-top: 22px;

        font-size: 14px;

        line-height: 1.75;
    }


    /* newsletter */

    .audio-footer-newsletter {
        max-width: none;

        justify-self: stretch;

        padding: 27px;

        border-radius: 20px;
    }


    .audio-footer-form {
        grid-template-columns: 1fr;
    }


    .audio-footer-submit {
        width: 100%;
    }


    /* trust */

    .audio-footer-trust {
        grid-template-columns:
            repeat(2, minmax(0, 1fr));

        gap: 12px;

        padding: 28px 0;
    }


    .audio-footer-trust-item {
        min-height: 95px;

        padding: 15px;

        gap: 11px;
    }


    .audio-footer-trust-icon {
        width: 42px;
        height: 42px;

        flex-basis: 42px;

        font-size: 15px;
    }


    /* main */

    .audio-footer-main {
        display: block;

        padding:
            45px 0 35px;
    }


    .audio-footer-brand {
        max-width: none;

        margin-bottom: 30px;
    }


    .audio-footer-column {
        border-bottom:
            1px solid
            rgba(255, 255, 255, 0.07);
    }


    .audio-footer-heading {
        display: none;
    }


    .audio-footer-mobile-toggle {
        display: flex;
    }


    .audio-footer-mobile-content {
        display: none;

        padding:
            0 0 18px;
    }


    .audio-footer-mobile-content.open {
        display: block;
    }


    .audio-footer-stats {
        margin-top: 22px;
    }


    /* bottom */

    .audio-footer-bottom {
        flex-direction: column;

        align-items: flex-start;

        gap: 15px;

        padding:
            22px 0 25px;
    }


    .audio-footer-bottom-links {
        gap: 16px;
    }


    .audio-footer-top {
        right: 18px;
        bottom: 18px;

        width: 48px;
        height: 48px;
    }
}


/* ============================================================
   SMALL MOBILE
   ============================================================ */

@media (max-width: 480px) {

    .audio-footer-container {
        padding-left: 16px;
        padding-right: 16px;
    }


    .audio-footer-cta h2 {
        font-size: 46px;
    }


    .audio-footer-newsletter {
        padding: 22px;
    }


    .audio-footer-trust {
        grid-template-columns: 1fr;
    }


    .audio-footer-main {
        padding-top: 40px;
    }


    .audio-footer-social {
        width: 41px;
        height: 41px;

        flex-basis: 41px;
    }
}


/* ============================================================
   REDUCED MOTION
   ============================================================ */

@media (prefers-reduced-motion: reduce) {

    .audio-footer *,
    .audio-footer *::before,
    .audio-footer *::after {
        animation: none !important;

        transition: none !important;

        scroll-behavior: auto !important;
    }
}

                
            `}</style>

            <footer className="audio-footer">

                <div className="audio-footer-container">

                    {/* =============================================
                        CTA + NEWSLETTER
                    ============================================== */}

                    <section className="audio-footer-cta">

                        <div>

                            <div className="audio-footer-eyebrow">
                                <span className="audio-footer-eyebrow-dot"></span>
                                KSAM DEAL AUDIO
                            </div>

                            <h2>
                                Sound that
                                <span> moves.</span>
                            </h2>

                            <p className="audio-footer-cta-text">
                                Discover premium earbuds, headphones,
                                speakers and audio accessories designed
                                for music, gaming, work and everyday life.
                            </p>

                        </div>

                        <div className="audio-footer-newsletter">

                            <h3>
                                Get the next drop.
                            </h3>

                            <p>
                                Subscribe for new products, limited
                                offers and exclusive audio deals.
                            </p>

                            <form
                                className="audio-footer-form"
                                onSubmit={handleNewsletter}
                            >

                                <input
                                    className="audio-footer-input"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="Enter your email"
                                    aria-label="Email address"
                                />

                                <button
                                    className="audio-footer-submit"
                                    type="submit"
                                >
                                    Join us
                                    <i
                                        className="fa-solid fa-arrow-right"
                                        style={{
                                            marginLeft: "8px"
                                        }}
                                    ></i>
                                </button>

                            </form>

                            {message && (
                                <div className="audio-footer-message">
                                    <i className="fa-solid fa-circle-check"></i>
                                    {" "}
                                    {message}
                                </div>
                            )}

                        </div>

                    </section>


                    {/* =============================================
                        TRUST STRIP
                    ============================================== */}

                    <section className="audio-footer-trust">

                        <div className="audio-footer-trust-item">

                            <div className="audio-footer-trust-icon">
                                <i className="fa-solid fa-truck-fast"></i>
                            </div>

                            <div>
                                <strong>Fast Delivery</strong>
                                <span>Across India</span>
                            </div>

                        </div>


                        <div className="audio-footer-trust-item">

                            <div className="audio-footer-trust-icon">
                                <i className="fa-solid fa-shield-halved"></i>
                            </div>

                            <div>
                                <strong>Secure Checkout</strong>
                                <span>Protected payments</span>
                            </div>

                        </div>


                        <div className="audio-footer-trust-item">

                            <div className="audio-footer-trust-icon">
                                <i className="fa-solid fa-rotate-left"></i>
                            </div>

                            <div>
                                <strong>Easy Returns</strong>
                                <span>Simple return process</span>
                            </div>

                        </div>


                        <div className="audio-footer-trust-item">

                            <div className="audio-footer-trust-icon">
                                <i className="fa-solid fa-headset"></i>
                            </div>

                            <div>
                                <strong>Audio Support</strong>
                                <span>We're here to help</span>
                            </div>

                        </div>

                    </section>


                    {/* =============================================
                        MAIN FOOTER LINKS
                    ============================================== */}

                    <section className="audio-footer-main">


                        {/* BRAND */}

                        <div className="audio-footer-brand">

                            <a
                                href="#top"
                                className="audio-footer-logo"
                                onClick={(event) => {
                                    event.preventDefault();
                                    scrollToTop();
                                }}
                            >

                                <span className="audio-footer-logo-main">
                                    KSAM
                                </span>

                                <span className="audio-footer-logo-accent">
                                    DEAL
                                </span>

                            </a>

                            <p className="audio-footer-description">
                                Your destination for modern audio.
                                Shop headphones, earbuds, speakers,
                                gaming gear and wireless accessories
                                built for better everyday sound.
                            </p>


                            <div className="audio-footer-stats">

                                <div className="audio-footer-stat">
                                    <strong>
                                        {cartCount}
                                    </strong>
                                    <span>
                                        Items in cart
                                    </span>
                                </div>

                                <div className="audio-footer-stat">
                                    <strong>
                                        {wishlistCount}
                                    </strong>
                                    <span>
                                        Wishlist items
                                    </span>
                                </div>

                            </div>


                            <div className="audio-footer-socials">

                                <a
                                    href="https://www.instagram.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="audio-footer-social"
                                    aria-label="Instagram"
                                >
                                    <i className="fa-brands fa-instagram"></i>
                                </a>

                                <a
                                    href="https://www.youtube.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="audio-footer-social"
                                    aria-label="YouTube"
                                >
                                    <i className="fa-brands fa-youtube"></i>
                                </a>

                                <a
                                    href="https://www.linkedin.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="audio-footer-social"
                                    aria-label="LinkedIn"
                                >
                                    <i className="fa-brands fa-linkedin-in"></i>
                                </a>

                                <a
                                    href="https://x.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="audio-footer-social"
                                    aria-label="X"
                                >
                                    <i className="fa-brands fa-x-twitter"></i>
                                </a>

                                <a
                                    href="mailto:support@ksamdeal.com"
                                    className="audio-footer-social"
                                    aria-label="Email"
                                >
                                    <i className="fa-solid fa-envelope"></i>
                                </a>

                            </div>

                        </div>


                        {/* SHOP */}

                        <div className="audio-footer-column">

                            <h4 className="audio-footer-heading">
                                Shop
                            </h4>

                            <button
                                className="audio-footer-mobile-toggle"
                                onClick={() =>
                                    toggleSection("shop")
                                }
                            >
                                Shop

                                <i
                                    className={
                                        openSection === "shop"
                                            ? "fa-solid fa-minus"
                                            : "fa-solid fa-plus"
                                    }
                                ></i>
                            </button>

                            <div
                                className={
                                    "audio-footer-mobile-content " +
                                    (openSection === "shop"
                                        ? "open"
                                        : "")
                                }
                            >

                                <div className="audio-footer-links">

                                    {footerLinks.shop.map(
                                        (item) => (
                                            <button
                                                key={item}
                                                className="audio-footer-link"
                                                onClick={() =>
                                                    window.scrollTo({
                                                        top: 0,
                                                        behavior: "smooth"
                                                    })
                                                }
                                            >
                                                {item}
                                            </button>
                                        )
                                    )}

                                </div>

                            </div>

                        </div>


                        {/* HELP */}

                        <div className="audio-footer-column">

                            <h4 className="audio-footer-heading">
                                Help
                            </h4>

                            <button
                                className="audio-footer-mobile-toggle"
                                onClick={() =>
                                    toggleSection("help")
                                }
                            >
                                Help

                                <i
                                    className={
                                        openSection === "help"
                                            ? "fa-solid fa-minus"
                                            : "fa-solid fa-plus"
                                    }
                                ></i>
                            </button>

                            <div
                                className={
                                    "audio-footer-mobile-content " +
                                    (openSection === "help"
                                        ? "open"
                                        : "")
                                }
                            >

                                <div className="audio-footer-links">

                                    {footerLinks.help.map(
                                        (item) => (
                                            <button
                                                key={item}
                                                className="audio-footer-link"
                                                onClick={() =>
                                                    window.scrollTo({
                                                        top: 0,
                                                        behavior: "smooth"
                                                    })
                                                }
                                            >
                                                {item}
                                            </button>
                                        )
                                    )}

                                </div>

                            </div>

                        </div>


                        {/* COMPANY */}

                        <div className="audio-footer-column">

                            <h4 className="audio-footer-heading">
                                Company
                            </h4>

                            <button
                                className="audio-footer-mobile-toggle"
                                onClick={() =>
                                    toggleSection("company")
                                }
                            >
                                Company

                                <i
                                    className={
                                        openSection === "company"
                                            ? "fa-solid fa-minus"
                                            : "fa-solid fa-plus"
                                    }
                                ></i>
                            </button>

                            <div
                                className={
                                    "audio-footer-mobile-content " +
                                    (openSection === "company"
                                        ? "open"
                                        : "")
                                }
                            >

                                <div className="audio-footer-links">

                                    {footerLinks.company.map(
                                        (item) => (
                                            <button
                                                key={item}
                                                className="audio-footer-link"
                                                onClick={() =>
                                                    window.scrollTo({
                                                        top: 0,
                                                        behavior: "smooth"
                                                    })
                                                }
                                            >
                                                {item}
                                            </button>
                                        )
                                    )}

                                </div>

                            </div>

                        </div>


                        {/* LIVE STATS */}

                        <div>

                            <h4 className="audio-footer-heading">
                                KSAM Audio
                            </h4>

                            <div className="audio-footer-stats">

                                <div className="audio-footer-stat">
                                    <strong>12+</strong>
                                    <span>
                                        Audio products
                                    </span>
                                </div>

                                <div className="audio-footer-stat">
                                    <strong>60%</strong>
                                    <span>
                                        Maximum discount
                                    </span>
                                </div>

                                <div className="audio-footer-stat">
                                    <strong>24/7</strong>
                                    <span>
                                        Online shopping
                                    </span>
                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =============================================
                        BOTTOM
                    ============================================== */}

                    <div className="audio-footer-bottom">

                        <div className="audio-footer-copy">

                            © {currentYear}{" "}
                            <strong>KSAM Deal</strong>.
                            All rights reserved.

                        </div>

                        <div className="audio-footer-bottom-links">

                            <button
                                onClick={() =>
                                    window.scrollTo({
                                        top: 0,
                                        behavior: "smooth"
                                    })
                                }
                            >
                                Privacy
                            </button>

                            <button
                                onClick={() =>
                                    window.scrollTo({
                                        top: 0,
                                        behavior: "smooth"
                                    })
                                }
                            >
                                Terms
                            </button>

                            <button
                                onClick={() =>
                                    window.scrollTo({
                                        top: 0,
                                        behavior: "smooth"
                                    })
                                }
                            >
                                Refunds
                            </button>

                            <button
                                onClick={scrollToTop}
                            >
                                Back to top ↑
                            </button>

                        </div>

                    </div>

                </div>

            </footer>


            {/* =============================================
                FLOATING BACK TO TOP
            ============================================== */}

            <button
                className="audio-footer-top"
                onClick={scrollToTop}
                aria-label="Back to top"
                title="Back to top"
            >
                <i className="fa-solid fa-arrow-up"></i>
            </button>

        </>
    );
}










function AudioMain() {

    const products = audioData.products || [];
    const categories = audioData.categories || [];
    const offers = audioData.offers || [];
    const features = audioData.featureHighlights || [];

    const store = audioData.store || {};

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("featured");
    const [maxPrice, setMaxPrice] = useState(store.maxPrice || 15000);

    const [wishlist, setWishlist] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem(WISHLIST_KEY) || "[]"
            );
        } catch {
            return [];
        }
    });

    const [cartCount, setCartCount] = useState(0);

    const [visibleProducts, setVisibleProducts] = useState(
        store.defaultVisibleProducts || 8
    );

    const [spotlightIndex, setSpotlightIndex] = useState(0);

    const [offerIndex, setOfferIndex] = useState(0);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [toast, setToast] = useState("");

    const [showTop, setShowTop] = useState(false);


    /* =====================================================
       CART COUNT
    ===================================================== */

    const updateCartCount = () => {

        try {

            const cart =
                JSON.parse(
                    localStorage.getItem(CART_KEY) || "[]"
                );

            const count = cart.reduce(
                (total, item) =>
                    total + Number(item.quantity || 1),
                0
            );

            setCartCount(count);

        } catch {
            setCartCount(0);
        }
    };


    useEffect(() => {

        updateCartCount();

        window.addEventListener(
            "storage",
            updateCartCount
        );

        return () => {
            window.removeEventListener(
                "storage",
                updateCartCount
            );
        };

    }, []);


    /* =====================================================
       WISHLIST
    ===================================================== */

    useEffect(() => {

        localStorage.setItem(
            WISHLIST_KEY,
            JSON.stringify(wishlist)
        );

    }, [wishlist]);


    const toggleWishlist = (product) => {

        setWishlist((current) => {

            if (current.includes(product.id)) {

                showMessage("Removed from wishlist");

                return current.filter(
                    (id) => id !== product.id
                );
            }

            showMessage("Added to wishlist ❤️");

            return [...current, product.id];

        });
    };


    /* =====================================================
       ADD TO CART
    ===================================================== */

    const addToCart = (product) => {

        try {

            const cart =
                JSON.parse(
                    localStorage.getItem(CART_KEY) || "[]"
                );

            const existing =
                cart.find(
                    (item) => item.id === product.id
                );

            if (existing) {

                existing.quantity =
                    Number(existing.quantity || 1) + 1;

            } else {

                cart.push({
                    ...product,
                    quantity: 1
                });

            }

            localStorage.setItem(
                CART_KEY,
                JSON.stringify(cart)
            );

            updateCartCount();

            showMessage(
                `${product.name} added to cart`
            );

        } catch {

            showMessage(
                "Unable to add product"
            );

        }
    };


    /* =====================================================
       TOAST
    ===================================================== */

    const showMessage = (message) => {

        setToast(message);

        setTimeout(() => {
            setToast("");
        }, 2200);

    };


    /* =====================================================
       FILTER PRODUCTS
    ===================================================== */

    const filteredProducts = useMemo(() => {

        let result = [...products];

        const searchText =
            search.trim().toLowerCase();

        if (searchText) {

            result = result.filter((product) => {

                return (
                    product.name
                        ?.toLowerCase()
                        .includes(searchText) ||

                    product.brand
                        ?.toLowerCase()
                        .includes(searchText) ||

                    product.category
                        ?.toLowerCase()
                        .includes(searchText)
                );

            });
        }


        if (category !== "All") {

            result = result.filter(
                (product) =>
                    product.category === category
            );

        }


        result = result.filter(
            (product) =>
                Number(product.price) <=
                Number(maxPrice)
        );


        switch (sort) {

            case "price-low":
                result.sort(
                    (a, b) =>
                        a.price - b.price
                );
                break;

            case "price-high":
                result.sort(
                    (a, b) =>
                        b.price - a.price
                );
                break;

            case "rating":
                result.sort(
                    (a, b) =>
                        b.rating - a.rating
                );
                break;

            case "discount":
                result.sort(
                    (a, b) =>
                        b.discount - a.discount
                );
                break;

            case "newest":
                result.sort(
                    (a, b) =>
                        Number(b.newArrival) -
                        Number(a.newArrival)
                );
                break;

            default:
                result.sort(
                    (a, b) =>
                        Number(b.featured) -
                        Number(a.featured)
                );
        }

        return result;

    }, [
        products,
        search,
        category,
        maxPrice,
        sort
    ]);


    /* =====================================================
       SPOTLIGHT
    ===================================================== */

    const spotlightProducts =
        products.filter(
            (product) =>
                product.featured
        );

    const spotlightProduct =
        spotlightProducts[
            spotlightIndex %
            Math.max(spotlightProducts.length, 1)
        ] || products[0];


    useEffect(() => {

        if (!spotlightProducts.length) return;

        const timer =
            setInterval(() => {

                setSpotlightIndex(
                    (current) =>
                        current + 1
                );

            }, 6000);

        return () => clearInterval(timer);

    }, [spotlightProducts.length]);


    /* =====================================================
       OFFER ROTATION
    ===================================================== */

    const currentOffer =
        offers[
            offerIndex %
            Math.max(offers.length, 1)
        ];


    useEffect(() => {

        if (!offers.length) return;

        const timer =
            setInterval(() => {

                setOfferIndex(
                    (current) =>
                        (current + 1) %
                        offers.length
                );

            }, 12000);

        return () => clearInterval(timer);

    }, [offers.length]);


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    useEffect(() => {

        const handleScroll = () => {

            setShowTop(
                window.scrollY > 600
            );

        };

        window.addEventListener(
            "scroll",
            handleScroll
        );

        return () =>
            window.removeEventListener(
                "scroll",
                handleScroll
            );

    }, []);


    const scrollToProducts = () => {

        document
            .getElementById("audio-products")
            ?.scrollIntoView({
                behavior: "smooth"
            });

    };


    const resetFilters = () => {

        setSearch("");
        setCategory("All");
        setSort("featured");
        setMaxPrice(
            store.maxPrice || 15000
        );
        setVisibleProducts(
            store.defaultVisibleProducts || 8
        );

    };


    return (

        <div className="audio-page">

            {/* =================================================
                ANNOUNCEMENT BAR
            ================================================= */}

            <div className="audio-announcement">

                <div>
                    FREE DELIVERY ABOVE ₹999
                </div>

                <span>•</span>

                <div>
                    30 DAY EASY RETURNS
                </div>

                <span>•</span>

                <div>
                    SECURE CHECKOUT
                </div>

                <span>•</span>

                <div>
                    NEW AUDIO COLLECTION
                </div>

                <span>•</span>

                <div>
                    FREE DELIVERY ABOVE ₹999
                </div>

            </div>


            {/* =================================================
                NAVBAR
            ================================================= */}

            <header className="audio-navbar">

                <a
                    href="./index.html"
                    className="audio-brand"
                >
                    <span>KSAM</span>
                    <strong>DEAL</strong>
                </a>


                <nav className="audio-nav">

                    <a href="#audio-products">
                        NEW IN
                    </a>

                    <a href="#audio-categories">
                        EARBUDS
                    </a>

                    <a href="#audio-categories">
                        HEADPHONES
                    </a>

                    <a href="#audio-categories">
                        SPEAKERS
                    </a>

                    <a href="#audio-offers">
                        SALE
                    </a>

                </nav>


                <div className="audio-nav-right">

                    <div className="audio-nav-search">

                        <i className="fa-solid fa-magnifying-glass"></i>

                        <input
                            type="text"
                            placeholder="Search audio, brands..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>


                    <button
                        className="audio-nav-icon"
                        title="Wishlist"
                    >
                        <i className="fa-regular fa-heart"></i>

                        {wishlist.length > 0 && (
                            <span>
                                {wishlist.length}
                            </span>
                        )}

                    </button>


                    <a
                        href="./addToCart.html"
                        className="audio-cart-button"
                    >

                        <i className="fa-solid fa-bag-shopping"></i>

                        <span>
                            {cartCount}
                        </span>

                    </a>

                </div>

            </header>


            {/* =================================================
                HERO
            ================================================= */}

            <AudioHero
                hero={audioData.hero}
                onExplore={scrollToProducts}
            />


            {/* =================================================
                MOVING PRODUCT STRIP
            ================================================= */}

            <section className="audio-moving-strip">

                <div className="audio-moving-track">

                    {[...products, ...products].map(
                        (product, index) => (

                            <div
                                className="audio-moving-item"
                                key={`${product.id}-${index}`}
                            >

                                <img
                                    src={getImagePath(
                                        product.image
                                    )}
                                    alt=""
                                />

                                <div>

                                    <strong>
                                        {product.name}
                                    </strong>

                                    <span>
                                        ₹
                                        {Number(
                                            product.price
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </span>

                                </div>

                            </div>

                        )
                    )}

                </div>

            </section>


            {/* =================================================
                CATEGORIES
            ================================================= */}

            <section
                className="audio-categories"
                id="audio-categories"
            >

                <div className="audio-section-heading">

                    <span>
                        EXPLORE AUDIO
                    </span>

                    <h2>
                        Find your sound.
                    </h2>

                    <p>
                        Choose the audio experience
                        that matches your lifestyle.
                    </p>

                </div>


                <div className="audio-category-list">

                    <button
                        className={
                            category === "All"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setCategory("All")
                        }
                    >
                        <i className="fa-solid fa-layer-group"></i>
                        All Audio
                        <small>
                            {products.length}
                        </small>
                    </button>


                    {categories.map(
                        (item) => {

                            const count =
                                products.filter(
                                    (product) =>
                                        product.category ===
                                        item.name
                                ).length;

                            return (

                                <button
                                    key={item.id}
                                    className={
                                        category ===
                                        item.name
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setCategory(
                                            item.name
                                        )
                                    }
                                >

                                    <i
                                        className={
                                            item.icon
                                        }
                                    ></i>

                                    {item.name}

                                    <small>
                                        {count}
                                    </small>

                                </button>

                            );

                        }
                    )}

                </div>

            </section>


            {/* =================================================
                OFFER
            ================================================= */}

            {currentOffer && (

                <section
                    className="audio-offer"
                    id="audio-offers"
                >

                    <div className="audio-offer-inner">

                        <div className="audio-offer-copy">

                            <span className="audio-lime-label">
                                ⚡ LIMITED TIME
                            </span>

                            <h2>
                                {currentOffer.title}
                            </h2>

                            <p>
                                {currentOffer.subtitle}
                            </p>

                            <strong className="audio-offer-discount">
                                {currentOffer.discount}
                            </strong>

                            <div className="audio-countdown">

                                <div>
                                    <strong>
                                        100
                                    </strong>
                                    <span>DAYS</span>
                                </div>

                                <div>
                                    <strong>
                                        04
                                    </strong>
                                    <span>HOURS</span>
                                </div>

                                <div>
                                    <strong>
                                        16
                                    </strong>
                                    <span>MIN</span>
                                </div>

                                <div>
                                    <strong>
                                        49
                                    </strong>
                                    <span>SEC</span>
                                </div>

                            </div>

                            <button
                                className="audio-lime-button"
                                onClick={scrollToProducts}
                            >
                                Shop this offer
                                <i className="fa-solid fa-arrow-right"></i>
                            </button>

                        </div>


                        <div className="audio-offer-products">

                            {products
                                .filter(
                                    (product) =>
                                        currentOffer.productIds?.includes(
                                            product.id
                                        )
                                )
                                .slice(0, 3)
                                .map((product) => (

                                    <div
                                        className="audio-offer-product"
                                        key={product.id}
                                    >

                                        <div className="audio-offer-product-image">

                                            <img
                                                src={getImagePath(
                                                    product.image
                                                )}
                                                alt={product.name}
                                            />

                                        </div>

                                        <strong>
                                            {product.name}
                                        </strong>

                                        <div>

                                            <b>
                                                ₹
                                                {Number(
                                                    product.price
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </b>

                                            <del>
                                                ₹
                                                {Number(
                                                    product.oldPrice
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </del>

                                        </div>

                                    </div>

                                ))}

                        </div>

                    </div>

                </section>

            )}


            {/* =================================================
                SPOTLIGHT
            ================================================= */}

            {spotlightProduct && (

                <section className="audio-spotlight">

                    <div className="audio-section-heading light">

                        <span>
                            FEATURED SPOTLIGHT
                        </span>

                        <h2>
                            Built for your sound.
                        </h2>

                    </div>


                    <div className="audio-spotlight-box">

                        <div className="audio-spotlight-image">

                            <img
                                src={getImagePath(
                                    spotlightProduct.image
                                )}
                                alt={
                                    spotlightProduct.name
                                }
                            />

                        </div>


                        <div className="audio-spotlight-info">

                            <span className="audio-product-brand">
                                {spotlightProduct.brand}
                            </span>

                            <h2>
                                {spotlightProduct.name}
                            </h2>

                            <p>
                                {spotlightProduct.description}
                            </p>


                            <div className="audio-rating">

                                <span>
                                    ★
                                </span>

                                <strong>
                                    {spotlightProduct.rating}
                                </strong>

                                <small>
                                    ({spotlightProduct.reviews}
                                    reviews)
                                </small>

                            </div>


                            <div className="audio-spotlight-price">

                                ₹
                                {Number(
                                    spotlightProduct.price
                                ).toLocaleString(
                                    "en-IN"
                                )}

                                <del>
                                    ₹
                                    {Number(
                                        spotlightProduct.oldPrice
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </del>

                                <b>
                                    {spotlightProduct.discount}%
                                    OFF
                                </b>

                            </div>


                            <div className="audio-feature-tags">

                                {spotlightProduct.features
                                    ?.slice(0, 4)
                                    .map(
                                        (
                                            feature,
                                            index
                                        ) => (

                                            <span
                                                key={index}
                                            >
                                                ✓ {feature}
                                            </span>

                                        )
                                    )}

                            </div>


                            <div className="audio-spotlight-buttons">

                                <button
                                    className="audio-lime-button"
                                    onClick={() =>
                                        addToCart(
                                            spotlightProduct
                                        )
                                    }
                                >
                                    <i className="fa-solid fa-bag-shopping"></i>
                                    Add to cart
                                </button>


                                <button
                                    className="audio-outline-button"
                                    onClick={() =>
                                        toggleWishlist(
                                            spotlightProduct
                                        )
                                    }
                                >
                                    <i className="fa-regular fa-heart"></i>
                                </button>

                            </div>

                        </div>

                    </div>

                </section>

            )}


            {/* =================================================
                FEATURES
            ================================================= */}

            <section className="audio-features">

                <div className="audio-section-heading">

                    <span>
                        WHY KSAM AUDIO
                    </span>

                    <h2>
                        Better sound.
                        <br />
                        Better everyday.
                    </h2>

                </div>


                <div className="audio-feature-grid">

                    {features.map(
                        (feature, index) => (

                            <div
                                className="audio-feature"
                                key={feature.id}
                            >

                                <small>
                                    0
                                    {index + 1}
                                </small>

                                <div className="audio-feature-icon">

                                    <i
                                        className={
                                            feature.icon
                                        }
                                    ></i>

                                </div>

                                <h3>
                                    {feature.title}
                                </h3>

                                <p>
                                    {feature.description}
                                </p>

                            </div>

                        )
                    )}

                </div>

            </section>


            {/* =================================================
                PRODUCTS
            ================================================= */}

            <section
                className="audio-products"
                id="audio-products"
            >

                <div className="audio-products-heading">

                    <div>

                        <span>
                            SHOP AUDIO
                        </span>

                        <h2>
                            Find your next sound.
                        </h2>

                        <p>
                            {filteredProducts.length}
                            {" "}products
                        </p>

                    </div>


                    <div className="audio-sort">

                        <select
                            value={sort}
                            onChange={(e) =>
                                setSort(
                                    e.target.value
                                )
                            }
                        >

                            <option value="featured">
                                Featured
                            </option>

                            <option value="newest">
                                Newest
                            </option>

                            <option value="rating">
                                Top Rated
                            </option>

                            <option value="discount">
                                Biggest Discount
                            </option>

                            <option value="price-low">
                                Price Low
                            </option>

                            <option value="price-high">
                                Price High
                            </option>

                        </select>

                    </div>

                </div>


                <div className="audio-filter-row">

                    <div className="audio-main-search">

                        <i className="fa-solid fa-magnifying-glass"></i>

                        <input
                            type="text"
                            placeholder="Search earbuds, headphones..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    <label>

                        Category

                        <select
                            value={category}
                            onChange={(e) =>
                                setCategory(
                                    e.target.value
                                )
                            }
                        >

                            <option value="All">
                                All
                            </option>

                            {categories.map(
                                (item) => (
                                    <option
                                        key={item.id}
                                        value={item.name}
                                    >
                                        {item.name}
                                    </option>
                                )
                            )}

                        </select>

                    </label>


                    <label className="audio-price-filter">

                        Maximum price

                        <strong>
                            ₹
                            {Number(
                                maxPrice
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </strong>

                        <input
                            type="range"
                            min="500"
                            max={
                                store.maxPrice ||
                                15000
                            }
                            step="100"
                            value={maxPrice}
                            onChange={(e) =>
                                setMaxPrice(
                                    Number(
                                        e.target.value
                                    )
                                )
                            }
                        />

                    </label>


                    <button
                        className="audio-reset"
                        onClick={resetFilters}
                    >
                        Reset
                    </button>

                </div>


                <div className="audio-product-grid">

                    {filteredProducts
                        .slice(
                            0,
                            visibleProducts
                        )
                        .map((product) => (

                            <AudioCard
                                key={product.id}
                                product={product}
                                isWishlisted={
                                    wishlist.includes(
                                        product.id
                                    )
                                }
                                onWishlist={
                                    toggleWishlist
                                }
                                onAddToCart={
                                    addToCart
                                }
                                onViewProduct={
                                    setSelectedProduct
                                }
                            />

                        ))}

                </div>


                {visibleProducts <
                    filteredProducts.length && (

                    <div className="audio-load-more">

                        <button
                            onClick={() =>
                                setVisibleProducts(
                                    (value) =>
                                        value +
                                        (
                                            store.productsPerLoad ||
                                            4
                                        )
                                )
                            }
                        >
                            Load more products
                            <i className="fa-solid fa-arrow-down"></i>
                        </button>

                    </div>

                )}

            </section>


            {/* =================================================
    FOOTER
================================================= */}

<AudioFooter
    cartCount={cartCount}
    wishlistCount={wishlist.length}
    onBackToTop={() =>
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }
/>

            {selectedProduct && (

                <div
                    className="audio-modal-overlay"
                    onClick={() =>
                        setSelectedProduct(null)
                    }
                >

                    <div
                        className="audio-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <button
                            className="audio-modal-close"
                            onClick={() =>
                                setSelectedProduct(null)
                            }
                        >
                            ×
                        </button>


                        <div className="audio-modal-image">

                            <img
                                src={getImagePath(
                                    selectedProduct.image
                                )}
                                alt={
                                    selectedProduct.name
                                }
                            />

                        </div>


                        <div className="audio-modal-content">

                            <span>
                                {selectedProduct.brand}
                            </span>

                            <h2>
                                {selectedProduct.name}
                            </h2>

                            <p>
                                {selectedProduct.description}
                            </p>

                            <div className="audio-modal-price">

                                ₹
                                {Number(
                                    selectedProduct.price
                                ).toLocaleString(
                                    "en-IN"
                                )}

                                <del>
                                    ₹
                                    {Number(
                                        selectedProduct.oldPrice
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </del>

                            </div>


                            <button
                                className="audio-lime-button"
                                onClick={() => {

                                    addToCart(
                                        selectedProduct
                                    );

                                    setSelectedProduct(
                                        null
                                    );

                                }}
                            >
                                Add to cart
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                TOAST
            ================================================= */}

            {toast && (

                <div className="audio-toast">

                    <i className="fa-solid fa-check"></i>

                    {toast}

                </div>

            )}


            {/* =================================================
                TOP BUTTON
            ================================================= */}

            {showTop && (

                <button
                    className="audio-top-button"
                    onClick={() =>
                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        })
                    }
                >
                    ↑
                </button>

            )}

        </div>

    );
}


const rootElement = document.getElementById("audio-root");

if (rootElement) {
    createRoot(rootElement).render(
        <AudioMain />
    );
}