import { ArrowUp } from "lucide-react";

function Footer() {
    function backToTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    return (
        <footer className="border-t border-white/10 bg-black">

            <div className="mx-auto max-w-7xl px-5 py-16">

                <div className="grid gap-10 md:grid-cols-4">

                    {/* Brand */}
                    <div className="md:col-span-2">

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                text-xl
                                font-black
                                text-white
                            "
                        >

                            <span
                                className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-[#22FF88]
                                    text-black
                                "
                            >
                                K
                            </span>

                            KSAM

                            <span className="text-[#22FF88]">
                                DEAL
                            </span>

                        </div>


                        <p
                            className="
                                mt-5
                                max-w-md
                                leading-7
                                text-gray-500
                            "
                        >
                            A deal discovery platform designed
                            to help shoppers find interesting
                            discounts across multiple stores.
                        </p>


                        {/* Social Links */}
                        <div className="mt-6 flex gap-3">

                            {/* GitHub */}
                            <a
                                href="https://github.com/Abh207"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="GitHub"
                                className="
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-white/10
                                    text-sm
                                    font-bold
                                    text-gray-400
                                    transition-all
                                    duration-300
                                    hover:border-[#22FF88]
                                    hover:bg-[#22FF88]/10
                                    hover:text-[#22FF88]
                                    hover:shadow-[0_0_20px_rgba(34,255,136,0.15)]
                                "
                            >
                                GH
                            </a>


                            {/* Instagram */}
                            <a
                                href="#"
                                aria-label="Instagram"
                                className="
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-white/10
                                    text-sm
                                    font-bold
                                    text-gray-400
                                    transition-all
                                    duration-300
                                    hover:border-[#22FF88]
                                    hover:bg-[#22FF88]/10
                                    hover:text-[#22FF88]
                                    hover:shadow-[0_0_20px_rgba(34,255,136,0.15)]
                                "
                            >
                                IG
                            </a>


                            {/* LinkedIn */}
                            <a
                                href="https://www.linkedin.com/in/abhay-chauhan-ab4a0937b"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="LinkedIn"
                                className="
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-white/10
                                    text-sm
                                    font-bold
                                    text-gray-400
                                    transition-all
                                    duration-300
                                    hover:border-[#38BDF8]
                                    hover:bg-[#38BDF8]/10
                                    hover:text-[#38BDF8]
                                    hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]
                                "
                            >
                                in
                            </a>

                        </div>

                    </div>


                    {/* Explore */}
                    <div>

                        <h3 className="font-bold text-white">
                            Explore
                        </h3>

                        <div className="mt-5 space-y-3">

                            <a
                                href="#deals"
                                className="
                                    block
                                    text-gray-500
                                    transition
                                    hover:text-[#22FF88]
                                "
                            >
                                Deals
                            </a>

                            <a
                                href="#features"
                                className="
                                    block
                                    text-gray-500
                                    transition
                                    hover:text-[#22FF88]
                                "
                            >
                                Features
                            </a>

                            <a
                                href="#how"
                                className="
                                    block
                                    text-gray-500
                                    transition
                                    hover:text-[#22FF88]
                                "
                            >
                                How It Works
                            </a>

                            <a
                                href="#faq"
                                className="
                                    block
                                    text-gray-500
                                    transition
                                    hover:text-[#22FF88]
                                "
                            >
                                FAQ
                            </a>

                        </div>

                    </div>


                    {/* KSAM Deal */}
                    <div>

                        <h3 className="font-bold text-white">
                            KSAM Deal
                        </h3>

                        <div className="mt-5 space-y-3">

                            <a
                                href="#"
                                className="
                                    block
                                    text-gray-500
                                    transition
                                    hover:text-[#38BDF8]
                                "
                            >
                                About
                            </a>

                            <a
                                href="#"
                                className="
                                    block
                                    text-gray-500
                                    transition
                                    hover:text-[#38BDF8]
                                "
                            >
                                Contact
                            </a>

                            <a
                                href="#"
                                className="
                                    block
                                    text-gray-500
                                    transition
                                    hover:text-[#38BDF8]
                                "
                            >
                                Privacy
                            </a>

                            <a
                                href="#"
                                className="
                                    block
                                    text-gray-500
                                    transition
                                    hover:text-[#38BDF8]
                                "
                            >
                                Terms
                            </a>

                        </div>

                    </div>

                </div>


                {/* Bottom */}
                <div
                    className="
                        mt-14
                        flex
                        flex-col
                        justify-between
                        gap-5
                        border-t
                        border-white/10
                        pt-6
                        text-sm
                        text-gray-600
                        sm:flex-row
                        sm:items-center
                    "
                >

                    <p>
                        © {new Date().getFullYear()}
                        {" "}KSAM Deal. All rights reserved.
                    </p>


                    {/* Back To Top */}
                    <button
                        onClick={backToTop}
                        className="
                            flex
                            items-center
                            gap-2
                            text-gray-400
                            transition
                            hover:text-[#22FF88]
                        "
                    >
                        Back to top

                        <ArrowUp size={16} />

                    </button>

                </div>

            </div>

        </footer>
    );
}

export default Footer;