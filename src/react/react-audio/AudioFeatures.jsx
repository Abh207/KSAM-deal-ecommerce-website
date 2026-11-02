import React from "react";

export default function AudioFeatures({ features }) {
    if (!features || !features.length) return null;

    return (
        <section className="audio-features" id="why-ksam-audio" aria-label="Why KSAM Audio">
            <div className="audio-features-heading-block">
                {/* Glass pill eyebrow with pulsing neon dot */}
                <div className="audio-features-eyebrow">
                    <span className="audio-features-dot" aria-hidden="true" />
                    <span>WHY KSAM AUDIO</span>
                </div>

                {/* Clamp sized bold title */}
                <h2 className="audio-features-title">
                    <span className="audio-features-title-white">Better sound.</span>{" "}
                    <span className="audio-features-title-neon">Better everyday.</span>
                </h2>

                {/* Glowing neon underline */}
                <div className="audio-features-underline" aria-hidden="true" />

                {/* Subtitle */}
                <p className="audio-features-subtitle">
                    Four reasons thousands choose KSAM Audio.
                </p>
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
