document.addEventListener('DOMContentLoaded', () => {
    console.log('ScopeDeals Logic Loaded');

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form Submission (Formspree)
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const data = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;

        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending...';

        try {
            const response = await fetch("https://formspree.io/f/xanrjbzq", {
                method: "POST",
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                showNotification('Thank you! Booking request sent. We will contact you shortly.', 'success');
                form.reset();
                if (form.id === 'modalBookingForm') {
                    const modal = document.getElementById('bookingModal');
                    if (modal) modal.classList.remove('show');
                }
            } else {
                const result = await response.json();
                if (Object.hasOwn(result, 'errors')) {
                    showNotification(result["errors"].map(error => error["message"]).join(", "), 'error');
                } else {
                    showNotification("Oops! There was a problem submitting your form", 'error');
                }
            }
        } catch (error) {
            showNotification("Oops! Network error. Please try again.", 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    };

    // WhatsApp Submission Logic
    const handleWhatsAppSubmit = (event) => {
        event.preventDefault();
        const btn = event.target.closest('.whatsapp-btn'); // Ensure we get the button even if icon clicked
        if (!btn) return;

        const form = btn.closest('form');

        if (!form) return;

        // Get form values
        const name = form.querySelector('[name="name"]')?.value || '';
        const phone = form.querySelector('[name="phone"]')?.value || '';
        const service = form.querySelector('[name="service"]')?.value || '';
        const country = form.querySelector('[name="country"]')?.value || '';
        const message = form.querySelector('[name="message"]')?.value || '';

        // Validate required fields (basic)
        if (!name || !phone) {
            showNotification('Please fill in your Name and Phone number.', 'error');
            return;
        }

        // Construct Message
        let text = `*New Booking Request*\n\n`;
        text += `*Name:* ${name}\n`;
        text += `*Phone:* ${phone}\n`;
        text += `*Service:* ${service}\n`;
        if (country) text += `*Country:* ${country}\n`;
        if (message) text += `*Message:* ${message}\n`;

        // Encode URL
        const encodedText = encodeURIComponent(text);
        const phoneNumber = "96891978441";
        const url = `https://wa.me/${phoneNumber}?text=${encodedText}`;

        // Open WhatsApp
        window.open(url, '_blank');
    };

    // Attach WhatsApp handlers
    document.querySelectorAll('.whatsapp-btn').forEach(btn => {
        btn.addEventListener('click', handleWhatsAppSubmit);
    });

    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Scroll Animation Observer
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    setTimeout(() => {
        document.querySelectorAll('.service-card, .feature-item, .country-card, .testimonial-card').forEach(el => {
            // el.classList.add('animate-hidden'); // CSS handles initial opacity
            observer.observe(el);
        });
    }, 100);

    // Modal Logic
    const modal = document.getElementById('bookingModal');
    const closeBtn = document.querySelector('.close-modal');
    // Select both direct links and buttons that might be used for 'Book Now'
    const bookBtns = document.querySelectorAll('a[href="contact.html"]');

    // Function to open modal
    const openModal = (e) => {
        // Only intercept if we are on a page where the modal exists and screen is large enough
        // For now, let's keep it simple: if it's a "Book Now" flow on index, show modal.
        if (modal && window.innerWidth > 768) {
            e.preventDefault();
            modal.classList.add('show');
        }
    };

    // Attach to "Book Now" buttons
    bookBtns.forEach(btn => {
        // We only want to intercept if it's NOT the actual contact page we are already on
        if (!window.location.pathname.includes('contact.html')) {
            btn.addEventListener('click', openModal);
        }
    });

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }

    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }

    // Handle Modal Form
    const modalForm = document.getElementById('modalBookingForm');
    if (modalForm) {
        modalForm.addEventListener('submit', handleFormSubmit);
    }

    // ========== GLOBAL WHATSAPP WIDGET ==========
    // Check if button already exists to prevent duplicates
    if (!document.querySelector('.whatsapp-float') && !document.querySelector('.sticky-whatsapp')) {
        // If components.js failed or wasn't used, fallback
        const waBtn = document.createElement('a');
        waBtn.href = "https://wa.me/96891978441";
        waBtn.className = "whatsapp-float";
        waBtn.target = "_blank";
        waBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';
        document.body.appendChild(waBtn);
    }
});

// ========== TOAST NOTIFICATION SYSTEM ==========
window.showNotification = function (message, type = 'info') {
    // Create container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        // Add styles dynamically if not in CSS
        container.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 9999;";
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Inline styles for toast in case CSS is missing
    toast.style.cssText = `
        background-color: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;

    // Icon based on type
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    // Add to container
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    });

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
};
