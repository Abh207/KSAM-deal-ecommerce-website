import React from "react";
import footerData from "../../api/homeFooter.json";
import "./HomeFooter.css";

function HomeFooter() {
    const currentYear = new Date().getFullYear();

    const scrollToSection = (action) => {
        const sectionMap = {
            products: ".home-products-grid",
            categories: ".category-section",
            deals: ".flash-deals-section",
            "new-arrivals": ".home-products-grid"
        };

        const selector = sectionMap[action];

        if (selector) {
            document
                .querySelector(selector)
                ?.scrollIntoView({
                    behavior: "smooth"
                });
        }
    };

    const handleLinkClick = (link) => {
        if (link.action) {
            scrollToSection(link.action);
        }
    };

    return (
        <footer className="home-footer">

            {/* =========================
                MAIN FOOTER
            ========================= */}

            <div className="home-footer-main">

                {/* Brand */}
                <div className="home-footer-brand">

                    <div className="home-footer-logo">
                        {footerData.brand.name}
                    </div>

                    <p>
                        {footerData.brand.description}
                    </p>

                    <strong>
                        {footerData.brand.tagline}
                    </strong>

                </div>


                {/* Footer Columns */}
                {footerData.columns.map((column) => (
                    <div
                        className="home-footer-column"
                        key={column.title}
                    >

                        <h3>
                            {column.title}
                        </h3>

                        <ul>
                            {column.links.map((link) => (
                                <li key={link.label}>

                                    {link.url ? (
                                        <a href={link.url}>
                                            {link.label}
                                        </a>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleLinkClick(link)
                                            }
                                        >
                                            {link.label}
                                        </button>
                                    )}

                                </li>
                            ))}
                        </ul>

                    </div>
                ))}


                {/* Contact */}
                <div className="home-footer-contact">

                    <h3>
                        {footerData.contact.title}
                    </h3>

                    <a
                        href={`mailto:${footerData.contact.email}`}
                    >
                        ✉ {footerData.contact.email}
                    </a>

                    <a
                        href={`tel:${footerData.contact.phone.replace(
                            /\s/g,
                            ""
                        )}`}
                    >
                        ☎ {footerData.contact.phone}
                    </a>

                    <span>
                        📍 {footerData.contact.location}
                    </span>

                </div>

            </div>


            {/* =========================
                SOCIAL + PAYMENT
            ========================= */}

            <div className="home-footer-middle">

                <div className="home-footer-social">

                    <span>
                        Follow Us
                    </span>

                    <div className="social-list">

                        {footerData.social.map((social) => (
                            <a
                                key={social.name}
                                href={social.url}
                                aria-label={social.name}
                                title={social.name}
                            >
                                {social.icon}
                            </a>
                        ))}

                    </div>

                </div>


                <div className="home-footer-payments">

                    <span>
                        We Accept
                    </span>

                    <div className="payment-list">

                        {footerData.paymentMethods.map(
                            (method) => (
                                <span key={method}>
                                    {method}
                                </span>
                            )
                        )}

                    </div>

                </div>

            </div>


            {/* =========================
                BOTTOM
            ========================= */}

            <div className="home-footer-bottom">

                <p>
                    {footerData.bottom.copyright.replace(
                        "{year}",
                        currentYear
                    )}
                </p>

                <div>

                    {footerData.bottom.links.map((link) => (
                        <button
                            type="button"
                            key={link.label}
                            onClick={() =>
                                handleLinkClick(link)
                            }
                        >
                            {link.label}
                        </button>
                    ))}

                </div>

            </div>

        </footer>
    );
}

export default HomeFooter;