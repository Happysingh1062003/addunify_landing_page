/* ================================================================
   ADDUNIFY LANDING PAGE - JAVASCRIPT
   Animated Background, Smooth Scroll, and Interactivity
   ================================================================ */

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
        this.particleCount = 50;
        this.mouse = { x: null, y: null };

        this.resize();
        this.init();
        this.animate();

        // Event listeners
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Visibility API to pause animation
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.paused = true;
            } else {
                this.paused = false;
                this.animate();
            }
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
                radius: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                // Monochrome colors: black to dark gray
                color: 'rgba(0, 0, 0,'
            });
        }
    }

    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color + particle.opacity + ')';
        this.ctx.fill();
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    const opacity = (1 - distance / 150) * 0.15;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    updateParticle(particle) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Mouse interaction - subtle attraction
        if (this.mouse.x && this.mouse.y) {
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 200) {
                particle.x += dx * 0.002;
                particle.y += dy * 0.002;
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

        // Draw connections first (behind particles)
        this.drawConnections();

        // Update and draw particles
        for (const particle of this.particles) {
            this.updateParticle(particle);
            this.drawParticle(particle);
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize animated background
if (bgCanvas) {
    new AnimatedBackground(bgCanvas);
}

// ===================== NAVBAR SCROLL EFFECT =====================

function handleNavbarScroll() {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
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

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===================== FORM HANDLING =====================
// ===================== FORM HANDLING WITH EMAILJS =====================
function handleFormSubmit(form, inputId) {
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

        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Joining...';

        // EmailJS Configuration - REPLACE THESE WITH YOUR ACTUAL IDS
        const serviceID = "service_uttryev";
        const templateID_Owner = "template_45llkdq"; // For sending to you
        const templateID_User = "template_zd3oz44";   // For auto-reply to user

        // Parameters to send to the templates
        const templateParams = {
            user_email: email,  // Common convention
            to_email: email,    // Specific for our guide
            email: email,       // Fallback if they used {{email}}
            reply_to: email,    // For "Reply-To" field
            message: "New waitlist signup from " + email
        };

        // Send Email to Owner
        const sendToOwner = emailjs.send(serviceID, templateID_Owner, templateParams);

        // Send Auto-reply to User (optional, depends on your plan/setup but requested by user)
        // If you only have one template, you can rely on the first one if configured correctly,
        // but here we explicitily call twice for clear separation as requested.
        const sendToUser = emailjs.send(serviceID, templateID_User, templateParams);

        // Wait for both emails to be sent (or at least the owner notification)
        Promise.all([sendToOwner, sendToUser])
            .then(() => {
                showFormSuccess(form);
                emailInput.value = '';
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Joined!';

                // Reset button after success message fades
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnContent;
                }, 5000);
            })
            .catch((error) => {
                console.error('FAILED...', error);
                // Show detailed error for debugging
                let errorMsg = 'Something went wrong.';
                if (error.text) errorMsg += ' ' + error.text;
                else if (error.message) errorMsg += ' ' + error.message;

                showFormError(form, errorMsg);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
            });
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showFormSuccess(form) {
    // Create success message
    const existingMsg = form.parentNode.querySelector('.form-message');
    if (existingMsg) existingMsg.remove();

    const successMsg = document.createElement('div');
    successMsg.className = 'form-message form-success';
    successMsg.innerHTML = '<i class="fas fa-check-circle"></i> You\'re on the list! We\'ll be in touch soon.';
    successMsg.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 12px;
        padding: 12px 20px;
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 12px;
        color: #22c55e;
        font-size: 0.9rem;
        font-weight: 500;
    `;

    form.parentNode.insertBefore(successMsg, form.nextSibling);

    // Remove message after 5 seconds
    setTimeout(() => {
        successMsg.style.opacity = '0';
        successMsg.style.transition = 'opacity 0.3s ease';
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
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 12px;
        padding: 12px 20px;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 12px;
        color: #ef4444;
        font-size: 0.9rem;
        font-weight: 500;
    `;

    form.parentNode.insertBefore(errorMsg, form.nextSibling);

    // Remove message after 3 seconds
    setTimeout(() => {
        errorMsg.style.opacity = '0';
        errorMsg.style.transition = 'opacity 0.3s ease';
        setTimeout(() => errorMsg.remove(), 300);
    }, 3000);
}

// Initialize form handlers
if (waitlistForm) handleFormSubmit(waitlistForm);
if (ctaForm) handleFormSubmit(ctaForm);

// ===================== INTERSECTION OBSERVER FOR ANIMATIONS =====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Add animation to cards
document.querySelectorAll('.bento-card, .step-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeInObserver.observe(card);
});

// ===================== STAGGER ANIMATION FOR BENTO CARDS =====================
const bentoCards = document.querySelectorAll('.bento-card');
bentoCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.2}s`;
});

const stepCards = document.querySelectorAll('.step-card');
stepCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.15}s`;
});

// ===================== CONSOLE MESSAGE =====================
console.log('%c🚀 Addunify', 'font-size: 24px; font-weight: bold; color: #111111;');
console.log('%cBuilt for the future of marketing.', 'font-size: 14px; color: #666;');
