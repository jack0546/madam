import { functions, httpsCallable } from './firebase.js';

const isValidPhoneNumber = (to) => {
  if (!to || typeof to !== 'string') return false;
  const cleaned = to.replace(/[^\d+]/g, '');
  return /^\+?\d{7,15}$/.test(cleaned);
};

const normalizePhoneNumber = (to) => {
  const cleaned = to.replace(/[^\d+]/g, '');
  return cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;
};

export const sendSMS = async (to, message) => {
    if (!to) {
        return { success: false, error: 'Recipient phone number is missing.' };
    }

    if (!isValidPhoneNumber(to)) {
        return { success: false, error: 'Invalid phone number format. Use international format like +233532340875.' };
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
        return { success: false, error: 'Message must be a non-empty string.' };
    }

    if (message.length > 1600) {
        return { success: false, error: 'Message too long. SMS limit is 1600 characters.' };
    }

    try {
        const sendSmsFn = httpsCallable(functions, 'sendSMS');
        const result = await sendSmsFn({ to: normalizePhoneNumber(to), message: message.trim() });
        return { success: true, data: result.data };
    } catch (error) {
        console.error('SMS send error:', error);
        return {
            success: false,
            error: error.message || 'Failed to send SMS',
        };
    }
};
