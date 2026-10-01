import { useState } from "react";

import { ArrowRight, Mail } from "lucide-react";


function Newsletter() {

    const [email, setEmail] =
        useState("");

    const [message, setMessage] =
        useState("");


    function handleSubmit(event) {

        event.preventDefault();


        if (!email.includes("@")) {

            setMessage(
                "Please enter a valid email."
            );

            return;

        }


        setMessage(
            "You're on the deal list! 🔥"
        );

        setEmail("");

    }


    return (

        <section className="bg-[#050505] py-24">

            <div
                className="
                    mx-auto
                    max-w-5xl
                    px-5
                "
            >

                <div
                    className="
                        relative
                        overflow-hidden
                        rounded-[2rem]
                        border
                        border-[#22FF88]/20
                        bg-gradient-to-br
                        from-[#22FF88]/10
                        via-[#0a0a0a]
                        to-[#38BDF8]/10
                        p-8
                        sm:p-14
                    "
                >

                    <div
                        className="
                            absolute
                            -right-20
                            -top-20
                            h-60
                            w-60
                            rounded-full
                            bg-[#22FF88]/10
                            blur-[80px]
                        "
                    />


                    <div
                        className="
                            relative
                            max-w-2xl
                        "
                    >

                        <Mail
                            className="text-[#22FF88]"
                            size={30}
                        />

                        <h2
                            className="
                                mt-5
                                text-3xl
                                font-black
                                text-white
                                sm:text-5xl
                            "
                        >
                            Never miss
                            <span className="text-[#22FF88]">
                                {" "}a deal.
                            </span>
                        </h2>

                        <p
                            className="
                                mt-4
                                leading-7
                                text-gray-500
                            "
                        >
                            Get interesting discounts and
                            product discoveries delivered to
                            your inbox.
                        </p>


                        <form
                            onSubmit={handleSubmit}
                            className="
                                mt-8
                                flex
                                flex-col
                                gap-3
                                sm:flex-row
                            "
                        >

                            <input
                                type="email"
                                value={email}
                                onChange={event =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="you@example.com"
                                aria-label="Email address"
                                className="
                                    min-w-0
                                    flex-1
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-black/50
                                    px-5
                                    py-4
                                    text-white
                                    outline-none
                                    focus:border-[#22FF88]
                                "
                            />

                            <button
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-[#22FF88]
                                    px-6
                                    py-4
                                    font-black
                                    text-black
                                    transition
                                    hover:shadow-[0_0_30px_rgba(34,255,136,.25)]
                                "
                            >
                                Subscribe

                                <ArrowRight
                                    size={18}
                                />

                            </button>

                        </form>


                        {message && (

                            <p
                                className="
                                    mt-4
                                    text-sm
                                    text-[#FFD60A]
                                "
                            >
                                {message}
                            </p>

                        )}

                    </div>

                </div>

            </div>

        </section>

    );

}

export default Newsletter;