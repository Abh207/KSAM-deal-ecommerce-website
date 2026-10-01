import {
    Search,
    GitCompare,
    ExternalLink,
    ArrowDown
} from "lucide-react";


const steps = [

    {
        number: "01",
        icon: Search,
        title: "Search",
        text: "Tell KSAM Deal what product you are looking for."
    },

    {
        number: "02",
        icon: GitCompare,
        title: "Compare",
        text: "Explore available prices and discounts."
    },

    {
        number: "03",
        icon: ExternalLink,
        title: "Visit Store",
        text: "Click the deal and continue on the original store."
    }

];


function HowItWorks() {

    return (

        <section
            id="how"
            className="bg-black py-28"
        >

            <div
                className="
                    mx-auto
                    max-w-5xl
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
                        SIMPLE PROCESS
                    </p>

                    <h2
                        className="
                            mt-4
                            text-4xl
                            font-black
                            text-white
                            sm:text-5xl
                        "
                    >
                        Three steps.
                        <span className="text-[#22FF88]">
                            {" "}That's it.
                        </span>
                    </h2>

                </div>


                <div className="mt-20">

                    {steps.map(
                        (step, index) => {

                            const Icon =
                                step.icon;

                            return (

                                <div
                                    key={step.number}
                                    className="
                                        relative
                                        flex
                                        gap-6
                                        pb-16
                                    "
                                >

                                    <div
                                        className="
                                            relative
                                            z-10
                                            flex
                                            h-16
                                            w-16
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            border
                                            border-[#22FF88]/30
                                            bg-[#0a0a0a]
                                            text-[#22FF88]
                                        "
                                    >

                                        <Icon size={25} />

                                    </div>


                                    {index !==
                                        steps.length - 1 && (

                                        <div
                                            className="
                                                absolute
                                                left-8
                                                top-16
                                                h-full
                                                w-px
                                                bg-gradient-to-b
                                                from-[#22FF88]
                                                to-transparent
                                            "
                                        />

                                    )}


                                    <div>

                                        <span
                                            className="
                                                text-xs
                                                font-black
                                                tracking-[.3em]
                                                text-[#38BDF8]
                                            "
                                        >
                                            STEP {step.number}
                                        </span>

                                        <h3
                                            className="
                                                mt-2
                                                text-2xl
                                                font-black
                                                text-white
                                            "
                                        >
                                            {step.title}
                                        </h3>

                                        <p
                                            className="
                                                mt-3
                                                max-w-xl
                                                leading-7
                                                text-gray-500
                                            "
                                        >
                                            {step.text}
                                        </p>

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

export default HowItWorks;