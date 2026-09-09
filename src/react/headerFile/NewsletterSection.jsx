import React, { useState } from "react";
import newsletterData from "../../api/newsletterSection.json";
import "./NewsletterSection.css";

function NewsletterSection() {
    const { section } = newsletterData;

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setMessage("Please enter your email address.");
            setIsSuccess(false);
            return;
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(trimmedEmail)) {
            setMessage("Please enter a valid email address.");
            setIsSuccess(false);
            return;
        }

        /*
         * Save subscribed email locally.
         * This can later be connected to a backend/email service.
         */
        const subscribers =
            JSON.parse(
                localStorage.getItem("ksamNewsletterSubscribers") || "[]"
            );

        if (!subscribers.includes(trimmedEmail)) {
            subscribers.push(trimmedEmail);

            localStorage.setItem(
                "ksamNewsletterSubscribers",
                JSON.stringify(subscribers)
            );
        }

        setMessage(section.successMessage);
        setIsSuccess(true);
        setEmail("");
    };

    return (
        <section className="newsletter-section">

            <div className="newsletter-container">

                {/* Decorative circles */}
                <div className="newsletter-decoration decoration-one" />
                <div className="newsletter-decoration decoration-two" />

                <div className="newsletter-content">

                    <span className="newsletter-eyebrow">
                        {section.eyebrow}
                    </span>

                    <h2>
                        {section.title}
                    </h2>

                    <p>
                        {section.description}
                    </p>


                    {/* Form */}
                    <form
                        className="newsletter-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="newsletter-input-wrapper">

                            <span className="newsletter-email-icon">
                                ✉
                            </span>

                            <input
                                type="email"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    setMessage("");
                                }}
                                placeholder="Enter your email address"
                                aria-label="Email address"
                            />

                        </div>

                        <button type="submit">
                            {section.buttonText}
                            <span>→</span>
                        </button>

                    </form>


                    {/* Message */}
                    {message && (
                        <div
                            className={`newsletter-message ${
                                isSuccess
                                    ? "success"
                                    : "error"
                            }`}
                        >
                            <span>
                                {isSuccess ? "✓" : "!"}
                            </span>

                            {message}
                        </div>
                    )}


                    <small className="newsletter-privacy">
                        🔒 {section.privacyText}
                    </small>

                </div>

            </div>

        </section>
    );
}

export default NewsletterSection;