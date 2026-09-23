document.addEventListener('DOMContentLoaded', () => {
    // 1. Dynamic Copyright Year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 2. Mobile Accordion Logic
    const initAccordions = () => {
        const accordionCols = document.querySelectorAll('.accordion-col');
        
        const handleAccordionClick = (e) => {
            if (window.innerWidth <= 768) {
                const col = e.currentTarget.parentElement;
                const isActive = col.classList.contains('active');
                
                accordionCols.forEach(c => c.classList.remove('active'));
                
                if (!isActive) {
                    col.classList.add('active');
                }
            }
        };

        accordionCols.forEach(col => {
            const title = col.querySelector('.col-title');
            if (title) {
                title.removeEventListener('click', handleAccordionClick);
                title.addEventListener('click', handleAccordionClick);
            }
        });
    };

    initAccordions();
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            document.querySelectorAll('.accordion-col.active').forEach(col => col.classList.remove('active'));
        }
    });

    // 3. Scroll Reveal Animation (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    
    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optional: stop observing once revealed
                    // observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for reduced motion or old browsers
        revealElements.forEach(el => el.classList.add('visible'));
    }

    // 4. Live Statistics Counters
    const counters = document.querySelectorAll('.counter');
    
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        let hasCounted = false;
        
        const counterObserver = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !hasCounted) {
                hasCounted = true;
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000; // ms
                    const increment = target / (duration / 16); // 60fps
                    let current = 0;
                    
                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counter.innerText = Math.ceil(current).toLocaleString();
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.innerText = target.toLocaleString();
                        }
                    };
                    updateCounter();
                });
            }
        }, { threshold: 0.5 });
        
        const statsSection = document.querySelector('.footer-stats');
        if (statsSection) {
            counterObserver.observe(statsSection);
        }
    } else {
        counters.forEach(counter => {
            counter.innerText = (+counter.getAttribute('data-target')).toLocaleString();
        });
    }

    // 5. Back to Top Button & Scroll Progress Ring
    const backToTopBtn = document.getElementById('back-to-top');
    const progressCircle = document.querySelector('.progress-ring-circle');
    
    if (backToTopBtn && progressCircle) {
        const radius = progressCircle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference;

        const setProgress = (percent) => {
            const offset = circumference - percent / 100 * circumference;
            progressCircle.style.strokeDashoffset = offset;
        };

        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.offsetHeight;
            const winHeight = window.innerHeight;
            
            // Show button after 300px
            if (scrollTop > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
            
            // Calculate progress (0 to 100)
            const scrollPercent = scrollTop / (docHeight - winHeight) * 100;
            setProgress(Math.max(0, Math.min(100, scrollPercent)));
        };

        let isScrolling = false;
        window.addEventListener('scroll', () => {
            if (!isScrolling) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    isScrolling = false;
                });
                isScrolling = true;
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            document.body.focus({ preventScroll: true });
        });
    }

    // 6. Interactive Background Blobs (Mouse Parallax)
    const siteFooter = document.getElementById('site-footer');
    const blob1 = document.querySelector('.blob-1');
    const blob2 = document.querySelector('.blob-2');
    
    if (siteFooter && blob1 && blob2 && !prefersReducedMotion) {
        siteFooter.addEventListener('mousemove', (e) => {
            // Only trigger on desktop devices with hover capabilities
            if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
                const rect = siteFooter.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Calculate subtle movement
                const moveX1 = (x - rect.width / 2) * 0.05;
                const moveY1 = (y - rect.height / 2) * 0.05;
                
                const moveX2 = (x - rect.width / 2) * -0.03;
                const moveY2 = (y - rect.height / 2) * -0.03;
                
                blob1.style.transform = `translate(${moveX1}px, ${moveY1}px)`;
                blob2.style.transform = `translate(${moveX2}px, ${moveY2}px)`;
            }
        });
        
        // Reset on leave
        siteFooter.addEventListener('mouseleave', () => {
            blob1.style.transform = 'translate(0px, 0px)';
            blob2.style.transform = 'translate(0px, 0px)';
        });
    }

    // 7. Easter Egg (Click logo 5 times quickly)
    const brandLogo = document.getElementById('brand-logo');
    const toast = document.getElementById('easter-egg-toast');
    
    if (brandLogo && toast) {
        let clickCount = 0;
        let clickTimeout = null;
        
        brandLogo.addEventListener('click', (e) => {
            e.preventDefault(); // prevent default jump
            clickCount++;
            
            if (clickCount >= 5) {
                toast.classList.add('show');
                clickCount = 0;
                
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            }
            
            clearTimeout(clickTimeout);
            clickTimeout = setTimeout(() => {
                clickCount = 0;
            }, 500); // 500ms window to click again
        });
    }

    // 8. Newsletter Form Handling
    const newsletterForm = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('email-input');
    const subscribeBtn = document.getElementById('subscribe-btn');
    const btnText = document.querySelector('.btn-text');
    const messageEl = document.getElementById('newsletter-message');

    if (newsletterForm && emailInput && messageEl && subscribeBtn) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            
            if (!email) {
                showMessage('Please enter an email address.', 'error');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }

            // Simulate loading
            newsletterForm.classList.add('loading');
            messageEl.style.opacity = '0';
            emailInput.disabled = true;

            setTimeout(() => {
                // Success State
                newsletterForm.classList.remove('loading');
                subscribeBtn.classList.add('success-state');
                btnText.textContent = 'Subscribed!';
                
                emailInput.value = '';
                emailInput.disabled = false;
                
                showMessage("You're subscribed! 🎉", 'success');
                
                // Reset form button after 3 seconds
                setTimeout(() => {
                    subscribeBtn.classList.remove('success-state');
                    btnText.textContent = 'Subscribe';
                }, 3000);
                
            }, 1500);
        });

        emailInput.addEventListener('input', () => {
            messageEl.style.opacity = '0';
        });

        function showMessage(msg, type) {
            messageEl.textContent = msg;
            messageEl.className = `newsletter-message ${type}`;
            void messageEl.offsetWidth; // trigger reflow
        }
    }
});
