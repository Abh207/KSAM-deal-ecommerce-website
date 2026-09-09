import React from "react";
import benefitsData from "../../api/benefitsSection.json";
import "./BenefitsSection.css";

function BenefitsSection() {
    const { section, benefits } = benefitsData;

    return (
        <section className="benefits-section">

            {/* Header */}
            <div className="benefits-header">

                <span className="benefits-eyebrow">
                    {section.eyebrow}
                </span>

                <h2>
                    {section.title}
                </h2>

                <p>
                    {section.description}
                </p>

            </div>

            {/* Benefits */}
            <div className="benefits-grid">

                {benefits.map((benefit, index) => (
                    <div
                        className="benefit-card"
                        key={benefit.id}
                        style={{
                            "--benefit-delay": `${index * 0.1}s`
                        }}
                    >

                        <div className="benefit-icon">
                            {benefit.icon}
                        </div>

                        <div className="benefit-content">

                            <h3>
                                {benefit.title}
                            </h3>

                            <p>
                                {benefit.description}
                            </p>

                        </div>

                        <span className="benefit-arrow">
                            →
                        </span>

                    </div>
                ))}

            </div>

        </section>
    );
}

export default BenefitsSection;