import { useEffect, useState } from "react";


function ScrollProgress() {

    const [progress, setProgress] =
        useState(0);


    useEffect(() => {

        const update = () => {

            const scrollTop =
                window.scrollY;

            const height =
                document.documentElement
                    .scrollHeight -
                window.innerHeight;

            const percentage =
                height > 0
                    ? (scrollTop / height) * 100
                    : 0;

            setProgress(percentage);

        };


        window.addEventListener(
            "scroll",
            update,
            { passive: true }
        );


        update();


        return () =>
            window.removeEventListener(
                "scroll",
                update
            );

    }, []);


    return (

        <div
            className="
                fixed
                left-0
                right-0
                top-0
                z-[100]
                h-[3px]
                bg-transparent
            "
        >

            <div
                className="
                    h-full
                    bg-gradient-to-r
                    from-[#22FF88]
                    to-[#38BDF8]
                "
                style={{
                    width: `${progress}%`
                }}
            />

        </div>

    );

}

export default ScrollProgress;