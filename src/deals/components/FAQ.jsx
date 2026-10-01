import { useState } from "react";

import { Plus } from "lucide-react";


const questions = [

    {
        q: "What is KSAM Deal?",
        a: "KSAM Deal is designed as a product discovery platform where users can discover deals and then continue to the original seller."
    },

    {
        q: "Do I buy products directly from KSAM Deal?",
        a: "The current version redirects users to the original product website. KSAM Deal is designed to act as a discovery layer."
    },

    {
        q: "Can I compare different stores?",
        a: "Yes. The planned deal system allows products from multiple stores to be discovered and compared."
    },

    {
        q: "Are the displayed prices live?",
        a: "The current prototype uses demonstration data. Live prices require a permitted API, affiliate feed or another approved product-data source."
    },

    {
        q: "Will KSAM Deal have AI recommendations?",
        a: "Yes. The architecture can later support text, image and voice based product recommendations."
    }

];


function FAQ() {

    const [open, setOpen] =
        useState(null);


    return (

        <section
            id="faq"
            className="
                bg-black
                py-28
            "
        >

            <div
                className="
                    mx-auto
                    max-w-4xl
                    px-5
                "
            >

                <div className="text-center">

                    <p
                        className="
                            text-sm
                            font-bold
                            uppercase
                            tracking-[.3em]
                            text-[#FFD60A]
                        "
                    >
                        FAQ
                    </p>

                    <h2
                        className="
                            mt-4
                            text-4xl
                            font-black
                            text-white
                        "
                    >
                        Questions,
                        <span className="text-[#38BDF8]">
                            {" "}answered.
                        </span>
                    </h2>

                </div>


                <div className="mt-12 space-y-3">

                    {questions.map(
                        (item, index) => {

                            const isOpen =
                                open === index;


                            return (

                                <div
                                    key={item.q}
                                    className="
                                        overflow-hidden
                                        rounded-2xl
                                        border
                                        border-white/10
                                        bg-[#0a0a0a]
                                    "
                                >

                                    <button
                                        onClick={() =>
                                            setOpen(
                                                isOpen
                                                    ? null
                                                    : index
                                            )
                                        }
                                        aria-expanded={
                                            isOpen
                                        }
                                        className="
                                            flex
                                            w-full
                                            items-center
                                            justify-between
                                            gap-5
                                            p-6
                                            text-left
                                            text-white
                                        "
                                    >

                                        <span className="font-bold">
                                            {item.q}
                                        </span>

                                        <Plus
                                            size={20}
                                            className={`
                                                shrink-0
                                                text-[#22FF88]
                                                transition
                                                ${
                                                    isOpen
                                                        ? "rotate-45"
                                                        : ""
                                                }
                                            `}
                                        />

                                    </button>


                                    <div
                                        className={`
                                            grid
                                            transition-all
                                            duration-300
                                            ${
                                                isOpen
                                                    ? "grid-rows-[1fr]"
                                                    : "grid-rows-[0fr]"
                                            }
                                        `}
                                    >

                                        <div className="overflow-hidden">

                                            <p
                                                className="
                                                    px-6
                                                    pb-6
                                                    leading-7
                                                    text-gray-500
                                                "
                                            >
                                                {item.a}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            );

                        }
                    )}

                </div>

            </div>

        </section>

    );

}

export default FAQ;