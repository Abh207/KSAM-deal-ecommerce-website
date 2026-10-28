import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const BackToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <button
            type="button"
            className={`beauty-back-to-top${visible ? " is-visible" : ""}`}
            onClick={scrollToTop}
            title="Back to Top"
            aria-label="Scroll back to top of the page"
        >
            <ArrowUp size={20} />
        </button>
    );
};

export default BackToTop;
