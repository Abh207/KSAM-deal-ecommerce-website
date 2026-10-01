import {
    Store,
    Percent,
    Users,
    Zap
} from "lucide-react";

import { useEffect, useRef, useState } from "react";


const stats = [

    {
        value: 12000,
        suffix: "+",
        label: "Deals tracked",
        icon: Zap
    },

    {
        value: 250,
        suffix: "+",
        label: "Stores",
        icon: Store
    },

    {
        value: 89,
        suffix: "%",
        label: "Average savings",
        icon: Percent
    },

    {
        value: 50,
        suffix: "K+",
        label: "Deal hunters",
        icon: Users
    }

];


function Stats() {

    const ref = useRef(null);

    const [visible, setVisible] =
        useState(false);


    useEffect(() => {

        const observer =
            new IntersectionObserver(
                ([entry]) => {

                    if (entry.isIntersecting) {

                        setVisible(true);

                        observer.disconnect();

                    }

                },
                {
                    threshold: .25
                }
            );


        if (ref.current)
            observer.observe(ref.current);


        return () =>
            observer.disconnect();

    }, []);


    return (

        <section
            ref={ref}
            className="
                border-y
                border-white/10
                bg-[#050505]
            "
        >

            <div
                className="
                    mx-auto
                    grid
                    max-w-7xl
                    grid-cols-2
                    lg:grid-cols-4
                "
            >

                {stats.map(
                    stat => {

                        const Icon =
                            stat.icon;

                        return (

                            <div
                                key={stat.label}
                                className="
                                    border-r
                                    border-white/10
                                    p-8
                                    text-center
                                "
                            >

                                <Icon
                                    className="
                                        mx-auto
                                        mb-4
                                        text-[#22FF88]
                                    "
                                />

                                <p
                                    className="
                                        text-3xl
                                        font-black
                                        text-white
                                        sm:text-4xl
                                    "
                                >
                                    {visible
                                        ? stat.value.toLocaleString("en-IN")
                                        : "0"}

                                    {stat.suffix}
                                </p>

                                <p className="mt-2 text-sm text-gray-500">
                                    {stat.label}
                                </p>

                            </div>

                        );

                    }
                )}

            </div>

        </section>

    );

}

export default Stats;