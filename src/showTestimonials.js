import testimonials from "./api/testimonial.json";

const testimonialContainer =
    document.querySelector("#testimonialContainer");

const testimonialTemplate =
    document.querySelector("#testimonialTemplate");

const showTestimonials = () => {

    testimonials.forEach((testimonial) => {

        const {
            company,
            comment,
            name,
            description,
            image,
            theme
        } = testimonial;

        const testimonialClone =
            document.importNode(
                testimonialTemplate.content,
                true
            );

        testimonialClone.querySelector(".companyName")
            .textContent = company;

        testimonialClone.querySelector(".productComment")
            .textContent = `"${comment}"`;

        testimonialClone.querySelector(".customerImage")
            .src = image;

        testimonialClone.querySelector(".customerImage")
            .alt = name;

        testimonialClone.querySelector(".customerName")
            .textContent = name;

        testimonialClone.querySelector(".custdescrib")
            .textContent = description;

        const card =
            testimonialClone.querySelector(".testimonialCard");

        if (theme === "dark") {
            card.classList.add("dark");
        }

        testimonialContainer.appendChild(
            testimonialClone
        );
    });
};

showTestimonials();