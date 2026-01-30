/**
 * components.js
 * Handles dynamic injection of shared components (Navbar, Footer)
 * and their associated logic.
 */

const SiteConfig = {
    phone: "+968 9197 8441",
    email: "aliambrose25@gmail.com",
    whatsappLink: "https://wa.me/96891978441"
};

const NavbarHTML = `
<nav class="navbar">
    <div class="container nav-container">
        <a href="index.html" class="logo">
            <h2 style="color: var(--color-primary); margin: 0; font-size: 1.5rem;">ScopeDeals</h2>
        </a>
        <button class="mobile-menu-btn" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <ul class="nav-links">
            <li><a href="index.html" data-i18n="nav.home">Home</a></li>
            <li><a href="services.html" data-i18n="nav.services">Services</a></li>
            <li><a href="countries.html" data-i18n="nav.countries">Countries</a></li>
            <li><a href="about.html" data-i18n="nav.about">About Us</a></li>
            <li><button id="lang-switcher" class="btn btn-outline lang-switcher-btn">العربية</button></li>
            <li><a href="contact.html" class="btn btn-primary" data-i18n="nav.book">Book Now</a></li>
        </ul>
    </div>
</nav>
`;

const FooterHTML = `
<footer class="footer">
    <div class="container">
        <div class="footer-content">
            <div class="footer-column">
                <h3>ScopeDeals</h3>
                <p data-i18n="footer.desc">Your trusted partner for premium home services across Oman, Bahrain, Nigeria, and India.</p>
            </div>
            <div class="footer-column">
                <h3 data-i18n="footer.quick">Quick Links</h3>
                <ul class="footer-links">
                    <li><a href="index.html" data-i18n="nav.home">Home</a></li>
                    <li><a href="services.html" data-i18n="nav.services">Services</a></li>
                    <li><a href="countries.html" data-i18n="nav.countries">Countries</a></li>
                    <li><a href="about.html" data-i18n="nav.about">About Us</a></li>
                </ul>
            </div>
            <div class="footer-column">
                <h3 data-i18n="footer.contact">Contact</h3>
                <p><strong>Phone:</strong> <a href="tel:${SiteConfig.phone.replace(/\s/g, '')}">${SiteConfig.phone}</a></p>
                <p><strong>Email:</strong> <a href="mailto:${SiteConfig.email}">${SiteConfig.email}</a></p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; ${new Date().getFullYear()} <span data-i18n="footer.rights">ScopeDeals. All rights reserved.</span></p>
        </div>
    </div>
</footer>
`;

const StickyWhatsAppHTML = `
<a href="${SiteConfig.whatsappLink}" class="sticky-whatsapp" aria-label="Chat on WhatsApp" target="_blank">
    <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
</a>
`;

function injectComponents() {
    // 1. Navbar Injection
    const navPlaceholder = document.getElementById('navbar-app');
    if (navPlaceholder) {
        navPlaceholder.innerHTML = NavbarHTML;
        highlightActiveLink();
        initMobileMenu();
    }

    // 2. Footer Injection
    const footerPlaceholder = document.getElementById('footer-app');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = FooterHTML;
    }

    // 3. Sticky WhatsApp
    if (!document.querySelector('.sticky-whatsapp')) {
        document.body.insertAdjacentHTML('beforeend', StickyWhatsAppHTML);
    }

    // 4. Trigger Localization Update if available
    if (window.localization) {
        window.localization.updateContent();
        window.localization.updateSwitcherState();
    }
}

function highlightActiveLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-links a');

    links.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileBtn.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileBtn.classList.remove('active');
            });
        });
    }
}

// Run injection on load
document.addEventListener('DOMContentLoaded', injectComponents);
