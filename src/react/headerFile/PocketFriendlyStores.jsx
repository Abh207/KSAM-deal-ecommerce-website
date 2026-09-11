import React from "react";
import pocketData from "../../api/pocketFriendlyStores.json";
import "./PocketFriendlyStores.css";

function PocketFriendlyStores() {

    const getImagePath = (image) => {
        if (!image) {
            return "";
        }

        return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, "")}`;
    };

    const handleStoreClick = (store) => {
        if (!store.link) {
            return;
        }

        window.location.href = store.link;
    };

    return (
        <section className="pocket-friendly-section">

            {/* =========================
                HEADER
            ========================= */}

            <div className="pocket-friendly-header">

                <h2>
                    {pocketData.section.title}
                </h2>

                {pocketData.section.showArrow && (
                    <button
                        type="button"
                        className="pocket-header-arrow"
                        onClick={() => {
                            const firstStore =
                                pocketData.stores[0];

                            if (firstStore?.link) {
                                window.location.href =
                                    firstStore.link;
                            }
                        }}
                        aria-label="View pocket friendly products"
                    >
                        →
                    </button>
                )}

            </div>


            {/* =========================
                STORES
            ========================= */}

            <div className="pocket-friendly-grid">

                {pocketData.stores.map((store) => (

                    <article
                        className="pocket-store-card"
                        key={store.id}
                        onClick={() =>
                            handleStoreClick(store)
                        }
                        tabIndex="0"
                        role="link"
                        onKeyDown={(event) => {

                            if (
                                event.key === "Enter" ||
                                event.key === " "
                            ) {
                                event.preventDefault();

                                handleStoreClick(store);
                            }

                        }}
                    >

                        {/* Image */}

                        <div className="pocket-store-image-wrapper">

                            <img
                                src={getImagePath(store.image)}
                                alt={store.title}
                                className="pocket-store-image"
                                loading="lazy"
                            />

                        </div>


                        {/* Title */}

                        <div className="pocket-store-title">

                            {store.title}

                        </div>

                    </article>

                ))}

            </div>

        </section>
    );
}

export default PocketFriendlyStores;