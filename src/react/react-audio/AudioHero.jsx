import React, {
    useEffect,
    useState
} from "react";

const getImagePath = (image) => {

    if (!image) return "";

    return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, "")}`;
};


function AudioHero({
    hero,
    onExplore
}) {

    const slides =
        hero?.slides ||
        hero?.images?.map(
            (image, index) => ({
                id: index,
                image,
                eyebrow:
                    "NEW AUDIO COLLECTION",
                kicker:
                    "PREMIUM SOUND",
                title:
                    "Sound",
                highlight:
                    "without limits.",
                description:
                    "Discover immersive earbuds, powerful headphones and smart audio devices designed for your everyday sound.",
                discount:
                    "60%",
                category:
                    "WIRELESS AUDIO"
            })
        ) ||
        [];


    const [active, setActive] =
        useState(0);


    useEffect(() => {

        if (slides.length <= 1) return;

        const timer =
            setInterval(() => {

                setActive(
                    (current) =>
                        (current + 1) %
                        slides.length
                );

            }, 5500);

        return () =>
            clearInterval(timer);

    }, [slides.length]);


    if (!slides.length) {

        return (

            <section className="audio-hero">

                <div className="audio-hero-inner">

                    <div>

                        <span className="audio-lime-label">
                            KSAM DEAL • AUDIO
                        </span>

                        <h1>
                            Premium sound.
                            <br />
                            <strong>
                                Better everyday.
                            </strong>
                        </h1>

                        <p>
                            Discover earbuds,
                            headphones, speakers
                            and more.
                        </p>

                        <button
                            className="audio-lime-button"
                            onClick={onExplore}
                        >
                            Explore audio
                            <i className="fa-solid fa-arrow-right"></i>
                        </button>

                    </div>

                </div>

            </section>

        );
    }


    const slide =
        slides[
            active %
            slides.length
        ];


    return (

        <section className="audio-hero">

            <div className="audio-hero-grid"></div>


            <div className="audio-hero-inner">


                {/* LEFT */}

                <div className="audio-hero-copy">

                    <span className="audio-lime-label">

                        ● {slide.eyebrow ||
                            "NEW AUDIO COLLECTION"}

                    </span>


                    <small>
                        {slide.kicker ||
                            "PREMIUM SOUND"}
                    </small>


                    <h1>

                        {slide.title ||
                            "Sound"}

                        <br />

                        <strong>
                            {slide.highlight ||
                                "without limits."}
                        </strong>

                    </h1>


                    <p>
                        {slide.description ||
                            "Discover premium audio products designed for your everyday."}
                    </p>


                    <div className="audio-hero-actions">

                        <button
                            className="audio-lime-button"
                            onClick={onExplore}
                        >

                            {slide.buttonText ||
                                "Shop collection"}

                            <i className="fa-solid fa-arrow-right"></i>

                        </button>


                        <button
                            className="audio-hero-outline"
                            onClick={onExplore}
                        >
                            Explore categories
                        </button>

                    </div>


                    <div className="audio-hero-benefits">

                        <span>
                            <b>
                                50%
                            </b>
                            OFF
                        </span>

                        <span>
                            Fresh audio.
                        </span>

                        <span>
                            Fast delivery.
                        </span>

                    </div>

                </div>


                {/* RIGHT PRODUCT */}

                <div className="audio-hero-product">

                    <div className="audio-hero-product-label">
                        KSAM
                    </div>


                    <img
                        src={getImagePath(
                            slide.image
                        )}
                        alt={
                            slide.title ||
                            "Audio product"
                        }
                    />


                    <div className="audio-hero-sale">

                        UP TO
                        <strong>
                            {slide.discount ||
                                "60%"}
                        </strong>
                        OFF

                    </div>


                    <div className="audio-hero-category">

                        <small>
                            PREMIUM AUDIO
                        </small>

                        <strong>
                            {slide.category ||
                                "WIRELESS AUDIO"}
                        </strong>

                    </div>

                </div>

            </div>


            {/* SLIDER */}

            <div className="audio-hero-controls">

                {slides.map(
                    (_, index) => (

                        <button
                            key={index}
                            className={
                                active === index
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setActive(index)
                            }
                        ></button>

                    )
                )}

            </div>

        </section>

    );
}


export default AudioHero;