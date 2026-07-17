// Shared user helpers used by AI functions.
const admin = require("firebase-admin");

const db = admin.firestore();

async function getUserProfile(uid) {
  const snap = await db.collection("users").doc(uid).get();
  return snap.exists ? snap.data() : null;
}

module.exports = { getUserProfile };
