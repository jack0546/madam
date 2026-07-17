// Client-side wrapper for the AI Shopping Assistant Cloud Functions.
//
// SECURITY: the browser NEVER talks to the LLM directly and never sees the API
// key. Every call goes through a Firebase callable function that authenticates
// the user, rate-limits, validates against prompt-injection, and grounds the
// model in the real product catalog. This module just calls those functions
// and surfaces user-friendly errors.

import { functions, httpsCallable, db, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from './firebase.js';

const call = (name) => httpsCallable(functions, name);

// Convert a Firebase HttpsError into a readable message.
function readableError(err) {
  if (!err) return 'Something went wrong. Please try again.';
  if (err.code === 'unauthenticated') return 'Please sign in to use the assistant.';
  if (err.code === 'resource-exhausted') return err.message || 'Too many requests. Please slow down.';
  if (err.code === 'invalid-argument') return err.message || 'Invalid request.';
  if (err.code === 'failed-precondition') return err.message || 'Request could not be completed.';
  return err.message || 'The assistant is unavailable right now.';
}

// ─── AI Chat ────────────────────────────────────────────────────────
export async function aiChat({ message, history = [], category = null, threadId = 'main' }) {
  try {
    const res = await call('aiChat')({ message, history, category, threadId });
    return { success: true, reply: res.data.reply };
  } catch (err) {
    return { success: false, error: readableError(err) };
  }
}

// Persist a user message locally to Firestore (server appends the reply).
export async function saveChatMessage(userId, message, role = 'user', threadId = 'main') {
  if (!userId) return;
  try {
    await addDoc(
      collection(db, 'chats', userId, 'threads', threadId, 'messages'),
      { role, content: message, createdAt: serverTimestamp() }
    );
  } catch (err) {
    // Non-fatal: assistant reply is still returned to the UI.
    console.error('saveChatMessage failed', err);
  }
}

// Load a user's chat history for continuity.
export async function loadChatHistory(userId, threadId = 'main') {
  if (!userId) return [];
  try {
    const snap = await getDocs(
      query(
        collection(db, 'chats', userId, 'threads', threadId, 'messages'),
        orderBy('createdAt', 'asc')
      )
    );
    return snap.docs.map((d) => d.data());
  } catch (err) {
    return [];
  }
}

// ─── AI Product Search ──────────────────────────────────────────────
export async function aiSearch(queryText) {
  try {
    const res = await call('aiSearch')({ query: queryText });
    return { success: true, ...res.data };
  } catch (err) {
    return { success: false, error: readableError(err) };
  }
}

// ─── Recommendations ────────────────────────────────────────────────
export async function aiRecommend({ productId = null, preferences = '' } = {}) {
  try {
    const res = await call('aiRecommend')({ productId, preferences });
    return { success: true, ...res.data };
  } catch (err) {
    return { success: false, error: readableError(err) };
  }
}

// ─── AI-generated product description ───────────────────────────────
export async function aiGenerateDescription(productId) {
  try {
    const res = await call('aiDescribe')({ productId });
    return { success: true, ...res.data };
  } catch (err) {
    return { success: false, error: readableError(err) };
  }
}

// ─── Reviews summary ────────────────────────────────────────────────
export async function aiSummarizeReviews(productId) {
  try {
    const res = await call('aiSummarizeReviews')({ productId });
    return { success: true, ...res.data };
  } catch (err) {
    return { success: false, error: readableError(err) };
  }
}

// ─── Submit a review (server-authoritative) ─────────────────────────
export async function submitReview({ productId, rating, text }) {
  try {
    const res = await call('submitReview')({ productId, rating, text });
    return { success: true, ...res.data };
  } catch (err) {
    return { success: false, error: readableError(err) };
  }
}

// ─── Load persisted AI content for a product (description / summary) ─
export async function loadAiContent(productId) {
  try {
    const [descSnap, sumSnap] = await Promise.all([
      getDocs(collection(db, 'products', productId, 'aiContent')),
    ]);
    const data = {};
    descSnap.forEach((d) => { data[d.id] = d.data(); });
    return { success: true, content: data };
  } catch (err) {
    return { success: false, error: readableError(err) };
  }
}

export async function loadReviews(productId) {
  try {
    const snap = await getDocs(
      query(collection(db, 'products', productId, 'reviews'), orderBy('createdAt', 'desc'))
    );
    return { success: true, reviews: snap.docs.map((d) => d.data()) };
  } catch (err) {
    return { success: false, error: readableError(err) };
  }
}
