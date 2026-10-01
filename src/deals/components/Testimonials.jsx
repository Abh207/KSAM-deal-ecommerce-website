import { useEffect, useState } from "react";

import {
    Quote,
    Star
} from "lucide-react";


const testimonials = [

    {
        name: "Aarav Sharma",
        role: "Student",
        image:
            "https://i.pravatar.cc/150?img=12",
        text:
            "I like the idea of finding products from different stores without opening ten different tabs."
    },

    {
        name: "Priya Singh",
        role: "Designer",
        image:
            "https://i.pravatar.cc/150?img=47",
        text:
            "The deal discovery experience makes comparing products much easier."
    },

    {
        name: "Rohan Verma",
        role: "Developer",
        image:
            "https://i.pravatar.cc/150?img=33",
        text:
            "A clean way to discover discounts before going to the original shopping website."
    }

];


function Testimonials() {

    const [index, setIndex] =
        useState(0);


    useEffect(() => {

        const timer =
            setInterval(() => {

                setIndex(
                    current =>
                        (current + 1) %
                        testimonials.length
                );

            }, 4500);


        return () =>
            clearInterval(timer);

    }, []);


    const testimonial =
        testimonials[index];


    return (

        <section className="bg-black py-28">

            <div
                className="
                    mx-auto
                    max-w-4xl
                    px-5
                    text-center
                "
            >

                <Quote
                    className="
                        mx-auto
                        text-[#38BDF8]
                    "
                    size={40}
                />


                <p
                    className="
                        mt-8
                        text-2xl
                        font-bold
                        leading-relaxed
                        text-white
                        sm:text-4xl
                    "
                >
                    "{testimonial.text}"
                </p>


                <div className="mt-10">

                    <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="
                            mx-auto
                            h-14
                            w-14
                            rounded-full
                            border-2
                            border-[#22FF88]
                        "
                    />

                    <h3
                        className="
                            mt-4
                            font-bold
                            text-white
                        "
                    >
                        {testimonial.name}
                    </h3>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-gray-500
                        "
                    >
                        {testimonial.role}
                    </p>


                    <div
                        className="
                            mt-3
                            flex
                            justify-center
                            gap-1
                            text-[#FFD60A]
                        "
                    >

                        {[1, 2, 3, 4, 5].map(
                            number => (

                                <Star
                                    key={number}
                                    size={15}
                                    fill="currentColor"
                                />

                            )
                        )}

                    </div>

                </div>

            </div>

        </section>

    );

}

export default Testimonials;