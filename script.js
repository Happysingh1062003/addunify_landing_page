/* ================================================================
   ADDUNIFY LANDING PAGE - JAVASCRIPT
   Animated Background, Smooth Scroll, and Interactivity
   ================================================================ */

// ===================== UTILITIES =====================
const isMobile = () => window.innerWidth < 768;

// ===================== DOM ELEMENTS =====================
const navbar = document.getElementById('navbar');
const bgCanvas = document.getElementById('bg-canvas');
const waitlistForm = document.getElementById('waitlist-form');
const ctaForm = document.getElementById('cta-form');

// ===================== ANIMATED BACKGROUND =====================
class AnimatedBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        // Optimize: Reduce particles on mobile devices
        this.particleCount = isMobile() ? 60 : 180;
        this.mouse = { x: null, y: null };
        this.colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8B5CF6']; // Colorful palette

        this.resize();
        this.init();
        this.animate();

        // Event listeners
        window.addEventListener('resize', () => {
            this.resize();
            // Re-initialize to adjust particle count if crossing breakpoint
            const newCount = isMobile() ? 60 : 180;
            if (this.particleCount !== newCount) {
                this.particleCount = newCount;
                this.init();
            }
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Visibility API to pause animation when tab is inactive
        document.addEventListener('visibilitychange', () => {
            this.paused = document.hidden;
            if (!this.paused) this.animate();
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 0.5,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
            });
        }
    }

    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color;
        this.ctx.fill();
    }

    updateParticle(particle) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Mouse interaction - subtle repulsion
        if (this.mouse.x && this.mouse.y) {
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 250) {
                const force = (250 - distance) / 250;
                const directionX = (dx / distance) * force * 0.6;
                const directionY = (dy / distance) * force * 0.6;
                particle.x -= directionX;
                particle.y -= directionY;
            }
        }

        // Wrap around edges
        if (particle.x < 0) particle.x = this.canvas.width;
        if (particle.x > this.canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.canvas.height;
        if (particle.y > this.canvas.height) particle.y = 0;
    }

    animate() {
        if (this.paused) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const particle of this.particles) {
            this.updateParticle(particle);
            this.drawParticle(particle);
        }
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize animated background
if (bgCanvas) new AnimatedBackground(bgCanvas);

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
        const templateID_Owner = "template_45llkdq"; // Send to YOU
        const templateID_User = "template_zd3oz44";   // Send to USER

        // 1. Owner Notification Params (No 'to_email' ensures it goes to default/you)
        const ownerParams = {
            user_email: email,
            from_email: email,
            reply_to: email,
            message: "New waitlist signup from " + email
        };

        // 2. User Auto-Reply Params
        // NOTE: Since you are receiving two emails, your User Template is likely CC'ing you.
        // We will send ONLY the user template to prevent duplicates.
        const userParams = {
            to_email: email,
            user_email: email,
            email: email,
            reply_to: "your-email@addunify.com"
        };

        // Send ONLY to User (Owner receives copy via CC/BCC in EmailJS dashboard)
        // const sendToOwner = emailjs.send(serviceID, templateID_Owner, ownerParams);
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
