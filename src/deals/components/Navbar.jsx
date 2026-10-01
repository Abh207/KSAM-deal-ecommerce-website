import {
    Menu,
    X,
    ShoppingBag,
    Search
} from "lucide-react";

import { useState } from "react";


function Navbar({ cartCount }) {

    const [open, setOpen] =
        useState(false);


    const links = [
        ["Home", "#home"],
        ["Deals", "#deals"],
        ["How It Works", "#how"],
        ["Features", "#features"],
        ["FAQ", "#faq"]
    ];


    return (

        <header
            className="
                fixed
                left-0
                right-0
                top-0
                z-50
                border-b
                border-white/10
                bg-black/70
                backdrop-blur-xl
            "
        >

            <nav
                className="
                    mx-auto
                    flex
                    max-w-7xl
                    items-center
                    justify-between
                    px-5
                    py-4
                "
            >

                {/* Logo */}

                <a
                    href="#home"
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
                            bg-gradient-to-br
                            from-[#22FF88]
                            to-[#38BDF8]
                            text-black
                        "
                    >
                        K
                    </span>

                    KSAM
                    <span className="text-[#22FF88]">
                        DEAL
                    </span>

                </a>


                {/* Desktop */}

                <div
                    className="
                        hidden
                        items-center
                        gap-7
                        lg:flex
                    "
                >

                    {links.map(
                        ([label, href]) => (

                            <a
                                key={label}
                                href={href}
                                className="
                                    text-sm
                                    font-medium
                                    text-gray-300
                                    transition
                                    hover:text-[#22FF88]
                                "
                            >
                                {label}
                            </a>

                        )
                    )}

                </div>


                {/* Actions */}

                <div className="flex items-center gap-3">

                    <button
                        aria-label="Search"
                        className="
                            hidden
                            rounded-xl
                            border
                            border-white/10
                            p-2.5
                            text-gray-300
                            hover:border-[#38BDF8]/50
                            hover:text-[#38BDF8]
                            sm:block
                        "
                    >
                        <Search size={19} />
                    </button>


                    <button
                        aria-label="Cart"
                        className="
                            relative
                            rounded-xl
                            bg-[#22FF88]
                            p-2.5
                            text-black
                            transition
                            hover:scale-105
                        "
                    >

                        <ShoppingBag size={19} />

                        {cartCount > 0 && (

                            <span
                                className="
                                    absolute
                                    -right-2
                                    -top-2
                                    flex
                                    h-5
                                    min-w-5
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#FFD60A]
                                    px-1
                                    text-xs
                                    font-black
                                "
                            >
                                {cartCount}
                            </span>

                        )}

                    </button>


                    <button
                        onClick={() =>
                            setOpen(!open)
                        }
                        aria-label="Menu"
                        className="
                            rounded-xl
                            border
                            border-white/10
                            p-2.5
                            text-white
                            lg:hidden
                        "
                    >

                        {open
                            ? <X />
                            : <Menu />
                        }

                    </button>

                </div>

            </nav>


            {/* Mobile menu */}

            {open && (

                <div
                    className="
                        border-t
                        border-white/10
                        bg-[#050505]
                        px-5
                        py-5
                        lg:hidden
                    "
                >

                    <div className="flex flex-col gap-5">

                        {links.map(
                            ([label, href]) => (

                                <a
                                    key={label}
                                    href={href}
                                    onClick={() =>
                                        setOpen(false)
                                    }
                                    className="
                                        text-gray-200
                                        hover:text-[#22FF88]
                                    "
                                >
                                    {label}
                                </a>

                            )
                        )}

                    </div>

                </div>

            )}

        </header>

    );

}

export default Navbar;