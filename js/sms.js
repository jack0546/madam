import { functions, httpsCallable } from './firebase.js';

/**
 * Send SMS via Firebase Cloud Function (Infobip).
 * The API key is stored securely in Firebase Functions config — never in the browser.
 *
 * @param {string} to - Recipient phone number (e.g. +233532340875 or 233532340875)
 * @param {string} message - SMS message body
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendSMS = async (to, message) => {
    if (!to) {
        return { success: false, error: 'Recipient phone number is missing.' };
    }

    try {
        const sendSmsFn = httpsCallable(functions, 'sendSMS');
        const result = await sendSmsFn({ to, message });
        return { success: true, data: result.data };
    } catch (error) {
        console.error('SMS send error:', error);
        return {
            success: false,
            error: error.message || 'Failed to send SMS',
        };
    }
};
