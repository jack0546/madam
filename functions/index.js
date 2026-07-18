const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const INFOBIP_BASE_URL = 'https://d829qr.api.infobip.com';
const INFOBIP_API_KEY = functions.config().infobip.api_key;
const INFOBIP_SENDER = '447491163443';
const SMS_LOG_COLLECTION = 'smsLogs';
const MAX_MESSAGE_LENGTH = 1600;
const ADMIN_EMAIL = 'narhsnazzisco@gmail.com';

const isValidPhoneNumber = (to) => {
  if (!to || typeof to !== 'string') return false;
  const cleaned = to.replace(/[^\d+]/g, '');
  return /^\+?\d{7,15}$/.test(cleaned);
};

const normalizePhoneNumber = (to) => {
  const cleaned = to.replace(/[^\d+]/g, '');
  return cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;
};

const logSmsAttempt = async (userId, to, message, success, error = null) => {
  try {
    await admin.firestore().collection(SMS_LOG_COLLECTION).add({
      userId,
      to,
      message,
      success,
      error,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (logError) {
    console.error('Failed to log SMS attempt:', logError);
  }
};

exports.sendSMS = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }

  const { to, message } = data;
  if (!to || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing to or message');
  }

  if (!isValidPhoneNumber(to)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid phone number format');
  }

  if (typeof message !== 'string' || message.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Message must be a non-empty string');
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new functions.https.HttpsError('invalid-argument', `Message too long. Max ${MAX_MESSAGE_LENGTH} characters.`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${INFOBIP_BASE_URL}/sms/3/messages`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': INFOBIP_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        messages: [{
          destinations: [{ to: normalizePhoneNumber(to) }],
          sender: INFOBIP_SENDER,
          content: { text: message },
        }],
      }),
    });

    clearTimeout(timeoutId);

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = result?.messages?.[0]?.status?.description || result?.error || 'SMS failed';
      await logSmsAttempt(context.auth.uid, to, message, false, errorMessage);
      throw new functions.https.HttpsError('unknown', errorMessage);
    }

    await logSmsAttempt(context.auth.uid, to, message, true);
    return { success: true, data: result };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      await logSmsAttempt(context.auth.uid, to, message, false, 'Request timeout');
      throw new functions.https.HttpsError('deadline-exceeded', 'SMS provider request timed out');
    }

    await logSmsAttempt(context.auth.uid, to, message, false, error.message);
    throw error;
  }
});
