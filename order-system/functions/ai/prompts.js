// ───────────────────────────────────────────────────────────────────────
// Prompt-injection & input hardening
//
// Defense in depth: even though the system prompt tells the model to ignore
// injected instructions, we also refuse obviously malicious input before it
// ever reaches the model, and we constrain message volume/length.
// ───────────────────────────────────────────────────────────────────────

// Patterns that indicate an attempt to override the assistant's behaviour.
// NOTE: these must match the real words users type ("instructions", not a typo),
// otherwise obvious injection attempts slip straight through to the model.
const INJECTION_PATTERNS = [
  /ignore (all |any |the )?(previous|prior|above|earlier) (instructions|prompts?|rules?|system)/i,
  /disregard (the )?(previous|prior|above|system)/i,
  /you are now|act as|pretend to be|roleplay as/i,
  /repeat your (instructions|system prompt|prompt)/i,
  /reveal (your )?(system prompt|instructions|api key|secret)/i,
  /developer mode|jailbreak|dt\s?,\s?mode/i,
  /system prompt:/i,
  /<\|?(system|assistant|user|developer)\|?>/i,
];

const LIMITS = {
  maxMessageLength: 2000,
  maxConversationMessages: 40, // oldest are trimmed server-side
  maxProductsContext: 30,
  maxSearchQueryLength: 200,
  maxReviewChars: 8000,
};

// Returns { ok: true } or { ok: false, reason }.
function validateUserMessage(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { ok: false, reason: "Message is empty." };
  }
  if (text.length > LIMITS.maxMessageLength) {
    return { ok: false, reason: "Message is too long." };
  }
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return { ok: false, reason: "Message rejected: potential prompt-injection attempt." };
    }
  }
  return { ok: true };
}

function validateSearchQuery(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { ok: false, reason: "Search query is empty." };
  }
  if (text.length > LIMITS.maxSearchQueryLength) {
    return { ok: false, reason: "Search query is too long." };
  }
  return { ok: true };
}

function sanitizeProductContext(products) {
  if (!Array.isArray(products)) return [];
  return products.slice(0, LIMITS.maxProductsContext).map((p) => ({
    id: p.id,
    name: String(p.name || "").slice(0, 200),
    category: String(p.category || "").slice(0, 80),
    price: typeof p.price === "number" ? p.price : 0,
    rating: typeof p.rating === "number" ? p.rating : 0,
    description: String(p.description || "").slice(0, 400),
  }));
}

module.exports = {
  LIMITS,
  validateUserMessage,
  validateSearchQuery,
  sanitizeProductContext,
};
