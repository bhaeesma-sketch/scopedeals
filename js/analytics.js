import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// Reusing the config from auth.js to ensure we point to the same project
const firebaseConfig = {
    apiKey: "AIzaSyCwCVf1MuczY-BDe8S_pf9TEp8IPBiLpuY",
    authDomain: "web-auth-d0b6b.firebaseapp.com",
    projectId: "web-auth-d0b6b",
    storageBucket: "web-auth-d0b6b.firebasestorage.app",
    messagingSenderId: "739979758800",
    appId: "1:739979758800:web:d4a22a2d4bf6f2aff962d5",
    measurementId: "G-Q8L2DFXL3L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Collection Reference
const logsCol = collection(db, 'site_logs');

/**
 * Log an event to Firestore
 * @param {string} type - 'click', 'pageview', 'error', etc.
 * @param {object} details - Additional data
 */
async function logEvent(type, details = {}) {
    try {
        // Enriched data
        const payload = {
            type,
            path: window.location.pathname,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent,
            ...details
        };

        // Use non-blocking write
        addDoc(logsCol, payload).catch(err => console.error("Analytics Error:", err));

    } catch (e) {
        console.error("Failed to log event", e);
    }
}

// 1. Track Pageview
logEvent('pageview', {
    title: document.title,
    referrer: document.referrer
});

// 2. Track Clicks (Global Delegate)
document.addEventListener('click', (e) => {
    const target = e.target;

    // meaningful interactions only (buttons, links, inputs, or elements with ID/Class)
    const interactive = target.closest('a, button, input, select, .btn, .clickable');

    if (interactive || target.id || target.className) {
        const elementInfo = {
            tag: target.tagName,
            id: target.id || null,
            classList: target.className || null,
            text: (target.innerText || "").substring(0, 50), // truncate
            href: interactive ? interactive.getAttribute('href') : null
        };

        logEvent('click', {
            element: elementInfo,
            x: e.clientX,
            y: e.clientY
        });
    }
}, true); // Capture phase

// Hidden Admin Shortcut (Ctrl + Shift + X)
// Hidden Admin Shortcut (Ctrl/Cmd + Shift + X)
document.addEventListener('keydown', (e) => {
    // Support both Ctrl (Windows/Linux) and Meta/Command (Mac)
    const isModifier = e.ctrlKey || e.metaKey;
    if (isModifier && e.shiftKey && (e.key === 'X' || e.key === 'x')) {
        e.preventDefault();
        window.location.href = 'admin-login.html';
    }
});

// Mobile Unlock: Tap Logo 5 times rapidly
let tapCount = 0;
let tapTimer = null;

// Use Event Delegation since .logo might be injected dynamically
document.addEventListener('click', (e) => {
    // Check if clicked element is the logo or inside the logo link
    const logoLink = e.target.closest('.logo');

    if (logoLink) {
        // Don't limit functionality for normal users (1 click works as link)
        // But store potential secret taps

        tapCount++;

        if (tapCount === 1) {
            tapTimer = setTimeout(() => {
                tapCount = 0;
            }, 2000); // Reset if 5 taps don't happen in 2 seconds
        }

        if (tapCount === 5) {
            e.preventDefault(); // Stop navigation on the 5th tap
            clearTimeout(tapTimer);
            tapCount = 0;

            // Visual feedback
            if (window.showNotification) {
                showNotification('Entering Secret Mode...', 'success');
            } else {
                alert('Entering Secret Mode...');
            }

            setTimeout(() => {
                window.location.href = 'admin-login.html';
            }, 500);
        }
    }
});

console.log("Analytics Initialized 🚀");
console.log("Admin panel is available at: /admin-login.html");

// Backup Unlock: Triple click the footer copyright
document.addEventListener('click', (e) => {
    if (e.target.closest('.footer-bottom')) {
        if (e.detail === 3) {
            window.location.href = 'admin-login.html';
        }
    }
});
