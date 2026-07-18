import { db, collection, addDoc, serverTimestamp } from './firebase.js';
import { showToast } from './utils.js';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xgogkzgj';
const RATE_LIMIT_KEY = 'newsletter_rate_limit';
const RATE_LIMIT_MS = 60000;

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const initNewsletterForm = (formId = 'newsletter-form') => {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = form.querySelector('input[name="email"]');
        const submitBtn = form.querySelector('button[type="submit"]');
        const email = emailInput?.value.trim();

        if (!email) {
            showToast('Please enter your email address', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        const now = Date.now();
        const lastSubmit = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || '0', 10);
        if (now - lastSubmit < RATE_LIMIT_MS) {
            const remaining = Math.ceil((RATE_LIMIT_MS - (now - lastSubmit)) / 1000);
            showToast(`Please wait ${remaining} seconds before submitting again.`, 'error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';

        try {
            const formspreeRes = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const formspreeData = await formspreeRes.json().catch(() => ({}));

            if (!formspreeRes.ok) {
                throw new Error(formspreeData?.error || 'Formspree submission failed');
            }

            try {
                await addDoc(collection(db, 'subscribers'), {
                    email,
                    source: 'newsletter',
                    createdAt: serverTimestamp(),
                });
            } catch (firestoreError) {
                console.error('Failed to save subscriber to Firestore:', firestoreError);
            }

            localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
            showToast('Thank you for subscribing to Lexu updates!', 'success');
            form.reset();
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            showToast(error.message || 'Subscription failed. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Subscribe';
        }
    });
};
