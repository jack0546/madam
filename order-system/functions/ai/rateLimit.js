// ───────────────────────────────────────────────────────────────────────
// In-memory rate limiter for AI endpoints.
//
// Per-user sliding counters. Cloud Functions instances may be ephemeral, so
// this is best-effort (good enough to stop casual abuse). For stricter,
// shared enforcement, back this with Firestore/Redis — the interface is the
// same. Keyed by uid; anonymous callers share an "anon" bucket with a much
// smaller allowance.
// ───────────────────────────────────────────────────────────────────────

const buckets = new Map();

const WINDOW_MS = 60 * 1000; // 1 minute window

const PRESETS = {
  chat: { max: 12, windowMs: WINDOW_MS }, // chat messages / min
  search: { max: 20, windowMs: WINDOW_MS },
  recommend: { max: 15, windowMs: WINDOW_MS },
  describe: { max: 10, windowMs: WINDOW_MS },
  summarize: { max: 10, windowMs: WINDOW_MS },
  anon: { max: 3, windowMs: WINDOW_MS },
};

function now() {
  return Date.now();
}

// Returns { allowed: true } or { allowed: false, retryAfterSec, remaining }.
export function rateLimit(key, kind = "chat") {
  const preset = PRESETS[kind] || PRESETS.chat;
  const bucketKey = `${kind}:${key}`;
  const ts = now();
  const entry = buckets.get(bucketKey) || [];

  // Drop timestamps outside the window.
  const recent = entry.filter((t) => ts - t < preset.windowMs);

  if (recent.length >= preset.max) {
    const oldest = recent[0];
    const retryAfterSec = Math.ceil((preset.windowMs - (ts - oldest)) / 1000);
    buckets.set(bucketKey, recent);
    return { allowed: false, retryAfterSec, remaining: 0 };
  }

  recent.push(ts);
  buckets.set(bucketKey, recent);
  return { allowed: true, remaining: preset.max - recent.length };
}
