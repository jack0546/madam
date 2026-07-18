const functions = require('firebase-functions');
const fetch = require('node-fetch');
const admin = require('firebase-admin');

admin.initializeApp();

const INFOBIP_BASE_URL = 'https://d829qr.api.infobip.com';
const INFOBIP_API_KEY = functions.config().infobip.api_key;
const INFOBIP_SENDER = '447491163443';

exports.sendSMS = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }

  const { to, message } = data;
  if (!to || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing to or message');
  }

  const response = await fetch(`${INFOBIP_BASE_URL}/sms/3/messages`, {
    method: 'POST',
    headers: {
      'Authorization': INFOBIP_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      messages: [{
        destinations: [{ to: to.startsWith('+') ? to.slice(1) : to }],
        sender: INFOBIP_SENDER,
        content: { text: message },
      }],
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new functions.https.HttpsError('unknown', result?.messages?.[0]?.status?.description || 'SMS failed');
  }

  return { success: true, data: result };
});
