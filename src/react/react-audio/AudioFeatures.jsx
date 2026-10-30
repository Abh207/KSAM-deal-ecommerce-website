import React from "react";

export default function AudioFeatures({ features }) {
    if (!features || !features.length) return null;

    return (
        <section className="audio-features">
            <div className="audio-section-heading">
                <span>WHY KSAM AUDIO</span>
                <h2>
                    Better sound.
                    <br />
                    Better everyday.
                </h2>
            </div>

            <div className="audio-feature-grid">
                {features.map((feature, index) => (
                    <div className="audio-feature" key={feature.id}>
                        <small>0{index + 1}</small>
                        <div className="audio-feature-icon">
                            <i className={feature.icon}></i>
                        </div>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
