import { useEffect, useState } from "react";


function CursorGlow() {

    const [position, setPosition] =
        useState({
            x: -100,
            y: -100
        });


    useEffect(() => {

        const move = event => {

            setPosition({
                x: event.clientX,
                y: event.clientY
            });

        };


        window.addEventListener(
            "mousemove",
            move
        );


        return () =>
            window.removeEventListener(
                "mousemove",
                move
            );

    }, []);


    return (

        <div
            className="
                pointer-events-none
                fixed
                z-[80]
                hidden
                h-40
                w-40
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-[#22FF88]/5
                blur-3xl
                lg:block
            "
            style={{
                left: position.x,
                top: position.y
            }}
        />

    );

}

export default CursorGlow;