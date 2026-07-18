const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const rateLimits = new Map();

const checkRateLimit = (adminId) => {
  const now = Date.now();
  const entry = rateLimits.get(adminId);

  if (!entry || now > entry.resetTime) {
    rateLimits.set(adminId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
};

exports.sendSMS = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }

  if (!checkRateLimit(context.auth.uid)) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Try again later.');
  }

  throw new functions.https.HttpsError('failed-precondition', 'SMS provider is not configured.');
});
