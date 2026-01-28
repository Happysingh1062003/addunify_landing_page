/* ================================================================
   ADDUNIFY LANDING PAGE - JAVASCRIPT
   Animated Background, Smooth Scroll, and Interactivity
   ================================================================ */

// ===================== UTILITIES =====================


// ===================== DOM ELEMENTS =====================
const navbar = document.getElementById('navbar');

const waitlistForm = document.getElementById('waitlist-form');
const ctaForm = document.getElementById('cta-form');



// ===================== HERO TITLE TYPEWRITER ANIMATION (Smooth 60FPS) =====================
(function () {
    const heroTitle = document.querySelector('.hero-title');
    const badge = document.querySelector('.hero-brand-badge');
    const actions = document.querySelector('.hero-actions');

    if (!heroTitle) return;

    // Store original HTML content
    const originalHTML = heroTitle.innerHTML;
    const originalText = heroTitle.textContent.trim();

    // Clear the title initially
    heroTitle.innerHTML = '';
    heroTitle.style.minHeight = heroTitle.offsetHeight + 'px'; // Prevent layout shift

    let charIndex = 0;
    let lastTime = 0;
    const typingDelay = 40; // ms per character (faster for smooth feel)

    function typeWriter(timestamp) {
        if (!lastTime) lastTime = timestamp;

        // Control speed
        if (timestamp - lastTime >= typingDelay) {
            // Add characters until we catch up or finish
            while (timestamp - lastTime >= typingDelay && charIndex < originalText.length) {
                const char = originalText.charAt(charIndex);

                // Handle line breaks
                if (charIndex === originalText.indexOf('Next-Gen') + 'Next-Gen'.length) {
                    heroTitle.innerHTML += '<br>';
                }

                heroTitle.innerHTML += char === ' ' ? '&nbsp;' : char;
                charIndex++;
                lastTime += typingDelay;
            }

            // Check if complete
            if (charIndex >= originalText.length) {
                heroTitle.innerHTML = originalHTML;
                heroTitle.classList.add('typing-complete');

                // Reveal other elements smoothly
                if (badge) {
                    badge.style.opacity = '1';
                    badge.style.transform = 'translateY(0)';
                }
                if (actions) {
                    actions.style.opacity = '1';
                    actions.style.transform = 'translateY(0)';
                }
                return; // Stop animation
            }
        }

        requestAnimationFrame(typeWriter);
    }

    // Start typing after a short delay
    setTimeout(() => {
        requestAnimationFrame(typeWriter);
    }, 500);
})();

// ===================== NAVBAR SCROLL EFFECT =====================

let scrollTicking = false;
function handleNavbarScroll() {
    if (!scrollTicking) {
        window.requestAnimationFrame(() => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
            scrollTicking = false;
        });
        scrollTicking = true;
    }
}
window.addEventListener('scroll', handleNavbarScroll, { passive: true });

// ===================== SMOOTH SCROLL =====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navbarHeight = navbar.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});

// ===================== FORM HANDLING WITH EMAILJS =====================
function handleFormSubmit(form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnContent = submitBtn.innerHTML;

        if (!email || !validateEmail(email)) {
            showFormError(form, 'Please enter a valid email address.');
            return;
        }

        // UX: Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Joining...';

        // Custom EmailJS Configuration
        const serviceID = "service_uttryev";
        const templateID_User = "template_zd3oz44";   // Send to USER (Owner gets CC via EmailJS dashboard)

        // User Auto-Reply Params
        const userParams = {
            to_email: email,
            user_email: email,
            email: email,
            reply_to: "your-email@addunify.com"
        };

        // Send email to User (Owner receives copy via CC/BCC configured in EmailJS dashboard)
        const sendToUser = emailjs.send(serviceID, templateID_User, userParams);

        // Wait for user email
        sendToUser
            .then(() => {
                showFormSuccess(form);
                emailInput.value = '';
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Joined!';

                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnContent;
                }, 5000);
            })
            .catch((error) => {
                console.error('EmailJS Error:', error);
                showFormError(form, 'Something went wrong. Please try again.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
            });
    });
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFormSuccess(form) {
    const existingMsg = form.parentNode.querySelector('.form-message');
    if (existingMsg) existingMsg.remove();

    const successMsg = document.createElement('div');
    successMsg.className = 'form-message form-success';
    successMsg.innerHTML = '<i class="fas fa-check-circle"></i> You\'re on the list! We\'ll be in touch soon.';
    // Styles moved to CSS class ideally, but keeping inline for strict adherence to request
    successMsg.style.cssText = `
        display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 12px;
        padding: 12px 20px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 12px; color: #22c55e; font-size: 0.9rem; font-weight: 500;
        opacity: 0; transition: opacity 0.3s ease;
    `;

    form.parentNode.insertBefore(successMsg, form.nextSibling);

    // Animate in
    requestAnimationFrame(() => successMsg.style.opacity = '1');

    setTimeout(() => {
        successMsg.style.opacity = '0';
        setTimeout(() => successMsg.remove(), 300);
    }, 5000);
}

function showFormError(form, message) {
    const existingMsg = form.parentNode.querySelector('.form-message');
    if (existingMsg) existingMsg.remove();

    const errorMsg = document.createElement('div');
    errorMsg.className = 'form-message form-error';
    errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorMsg.style.cssText = `
        display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 12px;
        padding: 12px 20px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 12px; color: #ef4444; font-size: 0.9rem; font-weight: 500;
        opacity: 0; transition: opacity 0.3s ease;
    `;

    form.parentNode.insertBefore(errorMsg, form.nextSibling);
    requestAnimationFrame(() => errorMsg.style.opacity = '1');

    setTimeout(() => {
        errorMsg.style.opacity = '0';
        setTimeout(() => errorMsg.remove(), 300);
    }, 3000);
}

// Initialize forms
if (waitlistForm) handleFormSubmit(waitlistForm);
if (ctaForm) handleFormSubmit(ctaForm);

// ===================== INTERSECTION OBSERVER FOR ANIMATIONS =====================
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            fadeInObserver.unobserve(entry.target); // Stop observing once animated
        }
    });
}, observerOptions);

document.querySelectorAll('.bento-card, .step-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeInObserver.observe(card);
});

// Stagger delays
document.querySelectorAll('.bento-card').forEach((card, index) => card.style.transitionDelay = `${index * 0.1}s`);
document.querySelectorAll('.step-card').forEach((card, index) => card.style.transitionDelay = `${index * 0.15}s`);

// Console Signature
console.log('%c🚀 Addunify', 'font-size: 24px; font-weight: bold; color: #111111;');
console.log('%cBuilt for the future of marketing.', 'font-size: 14px; color: #666;');
