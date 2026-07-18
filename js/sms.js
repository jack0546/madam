import { functions, httpsCallable } from './firebase.js';

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
            error: error.message || 'SMS provider is not configured.',
        };
    }
};
