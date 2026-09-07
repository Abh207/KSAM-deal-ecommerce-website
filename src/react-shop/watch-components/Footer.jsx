import React, { useState } from "react";
import "./Footer.css";

function Footer() {

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");


    const handleSubscribe = (event) => {

        event.preventDefault();

        if (!email.trim()) {
            setMessage("Please enter your email.");
            return;
        }

        setMessage("Thank you for subscribing!");

        setEmail("");
    };


    return (

        <footer className="watch-footer">

            {/* DARK OVERLAY */}
            <div className="watch-footer-overlay"></div>


            <div className="watch-footer-content">


                {/* ================= ABOUT ================= */}

                <div className="watch-footer-column">

                    <h3>
                        ABOUT US
                    </h3>

                    <div className="watch-footer-line"></div>

                    <ul>

                        <li>
                            <a href="#">
                                PRIVACY POLICY
                            </a>
                        </li>

                        <li>
                            <a href="#">
                                TERMS & CONDITIONS
                            </a>
                        </li>

                        <li>
                            <a href="#">
                                HELP & SUPPORT
                            </a>
                        </li>

                    </ul>


                    {/* SOCIAL ICONS */}

                    <div className="watch-social-icons">

                        <a
                            href="#"
                            aria-label="Twitter"
                        >
                            𝕏
                        </a>

                        <a
                            href="#"
                            aria-label="Facebook"
                        >
                            f
                        </a>

                        <a
                            href="#"
                            aria-label="Google Plus"
                        >
                            g+
                        </a>

                    </div>

                </div>



                {/* ================= CONTACT ================= */}

                <div className="watch-footer-column">

                    <h3>
                        CONTACT INFO
                    </h3>

                    <div className="watch-footer-line"></div>


                    <div className="watch-contact-item">

                        <span className="watch-contact-icon">
                            ◎
                        </span>

                        <span>
                            Lorem ipsum, version of Proin
                        </span>

                    </div>


                    <div className="watch-contact-item">

                        <span className="watch-contact-icon">
                            ✉
                        </span>

                        <span>
                            lorem.lpsum@gmail.in
                        </span>

                    </div>


                    <div className="watch-contact-item">

                        <span className="watch-contact-icon">
                            ☎
                        </span>

                        <span>
                            CALL US (000) 000-0000
                        </span>

                    </div>

                </div>



                {/* ================= NEWSLETTER ================= */}

                <div className="watch-footer-column watch-footer-signup">

                    <h3>
                        Sign up
                    </h3>


                    <form
                        onSubmit={handleSubscribe}
                        className="watch-newsletter-form"
                    >

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                        />

                        <button type="submit">
                            Sign up
                        </button>

                    </form>


                    {message && (

                        <p className="watch-newsletter-message">
                            {message}
                        </p>

                    )}

                </div>

            </div>


            {/* ================= COPYRIGHT ================= */}

            <div className="watch-footer-bottom">

                <p>
                    © {new Date().getFullYear()} KSAM Deal.
                    All Rights Reserved.
                </p>

            </div>

        </footer>

    );
}

export default Footer;