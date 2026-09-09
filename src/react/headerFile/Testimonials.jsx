import React, { useEffect, useState } from "react";
import testimonialsData from "../../api/testimonialsSection.json";
import "./Testimonials.css";

function TestimonialsSection() {
    const { section, testimonials } = testimonialsData;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    /*
     * Auto slide
     */
    useEffect(() => {
        if (!section.autoSlide || isPaused || testimonials.length <= 1) {
            return;
        }

        const interval = setInterval(() => {
            setCurrentIndex((previous) =>
                (previous + 1) % testimonials.length
            );
        }, section.slideInterval || 5000);

        return () => clearInterval(interval);
    }, [
        section.autoSlide,
        section.slideInterval,
        isPaused,
        testimonials.length
    ]);

    /*
     * Previous testimonial
     */
    const previousTestimonial = () => {
        setCurrentIndex((previous) =>
            previous === 0
                ? testimonials.length - 1
                : previous - 1
        );
    };

    /*
     * Next testimonial
     */
    const nextTestimonial = () => {
        setCurrentIndex((previous) =>
            (previous + 1) % testimonials.length
        );
    };

    /*
     * Safety check
     */
    if (!testimonials.length) {
        return null;
    }

    const testimonial = testimonials[currentIndex];

    return (
        <section className="testimonials-section">

            {/* Header */}
            <div className="testimonials-header">

                <span className="testimonials-eyebrow">
                    {section.eyebrow}
                </span>

                <h2>
                    {section.title}
                </h2>

                <p>
                    {section.description}
                </p>

            </div>


            {/* Slider */}
            <div
                className="testimonials-slider"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            >

                {/* Previous */}
                <button
                    type="button"
                    className="testimonial-control testimonial-prev"
                    onClick={previousTestimonial}
                    aria-label="Previous testimonial"
                >
                    ←
                </button>


                {/* Card */}
                <div
                    className="testimonial-card"
                    key={testimonial.id}
                >

                    <div className="testimonial-quote">
                        “
                    </div>

                    {/* Rating */}
                    <div className="testimonial-rating">
                        {Array.from(
                            { length: 5 },
                            (_, index) => (
                                <span
                                    key={index}
                                    className={
                                        index < testimonial.rating
                                            ? "star active"
                                            : "star"
                                    }
                                >
                                    ★
                                </span>
                            )
                        )}
                    </div>


                    {/* Review */}
                    <p className="testimonial-review">
                        {testimonial.review}
                    </p>


                    {/* Customer */}
                    <div className="testimonial-customer">

                        <div className="testimonial-avatar">
                            {testimonial.avatar ||
                                testimonial.name
                                    .split(" ")
                                    .map((word) => word[0])
                                    .join("")
                                    .slice(0, 2)}
                        </div>

                        <div className="testimonial-info">

                            <h3>
                                {testimonial.name}
                            </h3>

                            <span>
                                {testimonial.role}
                            </span>

                        </div>

                        <div className="verified-badge">
                            ✓
                        </div>

                    </div>

                </div>


                {/* Next */}
                <button
                    type="button"
                    className="testimonial-control testimonial-next"
                    onClick={nextTestimonial}
                    aria-label="Next testimonial"
                >
                    →
                </button>

            </div>


            {/* Dots */}
            <div className="testimonial-dots">

                {testimonials.map((item, index) => (
                    <button
                        type="button"
                        key={item.id}
                        className={`testimonial-dot ${
                            index === currentIndex
                                ? "active"
                                : ""
                        }`}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Go to testimonial ${
                            index + 1
                        }`}
                    />
                ))}

            </div>


            {/* Counter */}
            <div className="testimonial-counter">
                {currentIndex + 1} / {testimonials.length}
            </div>

        </section>
    );
}

export default TestimonialsSection;