import React from "react";

import "./AnnouncementBar.css";

function AnnouncementBar() {
    return (
        <div className="announcement-bar">

            <div className="announcement-content">

                <span className="announcement-icon">
                    ⚡
                </span>

                <span className="announcement-text">
                    MEGA DEALS ARE LIVE — GET UP TO 60% OFF
                </span>

                <button
                    type="button"
                    className="announcement-button"
                    onClick={() => {
                        document
                            .querySelector(".home-products-grid")
                            ?.scrollIntoView({
                                behavior: "smooth"
                            });
                    }}
                >
                    SHOP NOW →
                </button>

            </div>

        </div>
    );
}

export default AnnouncementBar;