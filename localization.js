/**
 * localization.js
 * Handles language switching and dynamic content updates.
 */

class LocalizationManager {
    constructor() {
        this.currentLang = localStorage.getItem('scopedeals_lang') || 'en';
        this.translations = translations; // Assumes translations.js is loaded
        this.init();
    }

    init() {
        this.setLanguage(this.currentLang);
        this.bindEvents();
    }

    setLanguage(lang) {
        if (!this.translations[lang]) return;

        this.currentLang = lang;
        localStorage.setItem('scopedeals_lang', lang);

        // Update HTML attributes
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

        // Update Content
        this.updateContent();

        // Update Button State if it exists
        this.updateSwitcherState();
    }

    updateContent() {
        // Update Text Content
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getValue(key);
            if (translation) {
                // If element has children (like icons), we might want to preserve them
                // But for simple text replacement:
                if (element.children.length === 0) {
                    element.innerText = translation;
                } else {
                    // For buttons with icons, we might need a specific structure
                    // For now, let's look for a text node or specific span?
                    // Simpler: Just replace inner text but keep icon if it's separate?
                    // Let's assume complex elements wrap text in a span or we handle them specifically.
                    // For this project, many buttons are icon + text.
                    // Let's try to find a text node to replace or use HTML if we trust it.

                    // Specific fix for font awesome icons followed by text
                    // We can check if there is an icon.
                    const icon = element.querySelector('i');
                    if (icon) {
                        // Keep icon, update text
                        // This is a bit hacky, safer to wrap text in <span>
                        element.childNodes.forEach(node => {
                            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                                node.textContent = " " + translation;
                            }
                        });
                    } else {
                        element.innerText = translation;
                    }
                }
            }
        });

        // Update Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getValue(key);
            if (translation) {
                element.placeholder = translation;
            }
        });
    }

    getValue(key) {
        // Allow nested keys if needed, but flat for now based on translations.js
        return this.translations[this.currentLang][key] || key;
    }

    toggleLanguage() {
        const newLang = this.currentLang === 'en' ? 'ar' : 'en';
        this.setLanguage(newLang);
    }

    bindEvents() {
        // Will be bound when navbar is injected
        document.addEventListener('click', (e) => {
            if (e.target.closest('#lang-switcher')) {
                this.toggleLanguage();
            }
        });
    }

    updateSwitcherState() {
        const switcher = document.getElementById('lang-switcher');
        if (switcher) {
            switcher.innerText = this.currentLang === 'en' ? 'العربية' : 'English';
        }
    }
}

// Initialize on load
// We need to wait for translations to be available if loaded async, 
// but since we include it as a script tag before this, it should be fine.
document.addEventListener('DOMContentLoaded', () => {
    window.localization = new LocalizationManager();
});
