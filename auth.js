// auth.js – Firebase email/password authentication

// 1. Import Firebase SDK (CDN)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// 2. Firebase Config (YOU WILL REPLACE THIS IN NEXT STEP)
const firebaseConfig = {
    apiKey: "AIzaSyCwCVf1MuczY-BDe8S_pf9TEp8IPBiLpuY",
    authDomain: "web-auth-d0b6b.firebaseapp.com",
    projectId: "web-auth-d0b6b",
    storageBucket: "web-auth-d0b6b.firebasestorage.app",
    messagingSenderId: "739979758800",
    appId: "1:739979758800:web:d4a22a2d4bf6f2aff962d5",
    measurementId: "G-Q8L2DFXL3L"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Tell other scripts we've loaded the Firebase auth module so mock auth does not attach duplicate handlers
window.USE_FIREBASE_AUTH = true;

// Helper: Get Friendly Error Message
function getFriendlyErrorMessage(error) {
    const code = error.code;
    const message = error.message;

    switch (code) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please login instead.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection.';
        default:
            // If it's a custom error message (not a firebase code), return it
            if (!code && message) return message;
            return 'An error occurred. Please try again.';
    }
}

// Helper: Show Notification (Wrapper for main.js function)
function notify(message, type = 'info') {
    if (window.showNotification) {
        window.showNotification(message, type);
    } else {
        // Fallback if main.js hasn't loaded yet
        alert(message);
    }
}

// ========== SIGNUP ==========
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;

        // Validate password confirmation if field exists
        if (confirmPassword && password !== confirmPassword) {
            notify('Passwords do not match!', 'error');
            return;
        }

        // Validate password strength
        if (password.length < 6) {
            notify('Password must be at least 6 characters long.', 'error');
            return;
        }

        const btn = document.getElementById('signupBtn');
        const originalText = btn?.textContent;
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Creating Account...';
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);

            // Store basic user data in localStorage
            const userData = { email };
            localStorage.setItem('scopeDealsUser', JSON.stringify(userData));

            notify('Signup successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        } catch (err) {
            notify(getFriendlyErrorMessage(err), 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }
    });
}

// ========== FORGOT PASSWORD ==========
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    // Import sendPasswordResetEmail
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js')
        .then(({ sendPasswordResetEmail }) => {
            forgotPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const email = document.getElementById('resetEmail').value;
                const btn = document.getElementById('resetBtn');
                const originalText = btn?.textContent;

                if (btn) {
                    btn.disabled = true;
                    btn.textContent = 'Sending...';
                }

                try {
                    await sendPasswordResetEmail(auth, email,);

                    notify('Password reset email sent! Check your inbox.', 'success');

                    // Clear form
                    forgotPasswordForm.reset();
                } catch (err) {
                    notify(getFriendlyErrorMessage(err), 'error');
                } finally {
                    if (btn) {
                        btn.disabled = false;
                        btn.textContent = originalText;
                    }
                }
            });
        });
}

// ========== LOGIN ==========
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Support existing page input IDs (`email` / `password`) to avoid mismatch
        const emailEl = document.getElementById('loginEmail') || document.getElementById('email');
        const passwordEl = document.getElementById('loginPassword') || document.getElementById('password');
        const email = emailEl ? emailEl.value : '';
        const password = passwordEl ? passwordEl.value : '';

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Navigate to home after successful login
            notify('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        } catch (err) {
            notify(getFriendlyErrorMessage(err), 'error');
        }
    });
}

// ========== LOGOUT ==========
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            notify('Logged out!', 'info');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (err) {
            notify(getFriendlyErrorMessage(err), 'error');
        }
    });
}

// ========== AUTH STATE ==========
onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed:", user ? "Logged in" : "Logged out");
    // Public access - no redirects or navbar injection needed for customers
});