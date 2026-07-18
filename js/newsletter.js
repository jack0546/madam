import { db, collection, addDoc, serverTimestamp } from './firebase.js';
import { showToast } from './utils.js';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xgogkzgj';

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

        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';

        try {
            // Submit to Formspree
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

            // Save to Firestore subscribers collection
            try {
                await addDoc(collection(db, 'subscribers'), {
                    email,
                    source: 'newsletter',
                    createdAt: serverTimestamp(),
                });
            } catch (firestoreError) {
                console.error('Failed to save subscriber to Firestore:', firestoreError);
                // Don't fail the whole operation if Firestore save fails
            }

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
