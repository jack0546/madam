// ───────────────────────────────────────────────────────────────────────
// AI Shopping Assistant — Cloud Functions (callable)
//
// All LLM access happens HERE, on the server. The browser only ever calls
// these functions, so the API key stays secret and every request is:
//   - authenticated (or rate-limited as anonymous)
//   - rate-limited
//   - validated against prompt-injection
//   - scoped to the real product catalog from Firestore
//
// Requires Firebase Functions config:
//   firebase functions:config:set ai.api_key="sk-..." ai.base_url="https://api.openai.com/v1"
//   (or set OPENAI_API_KEY / AI_BASE_URL env vars)
// ───────────────────────────────────────────────────────────────────────

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const llm = require("./llm");
const {
  SYSTEM_PROMPT,
  STORE_PROFILE,
  wrapUntrusted,
} = require("./config");
const {
  validateUserMessage,
  validateSearchQuery,
  sanitizeProductContext,
  LIMITS,
} = require("./prompts");
const { rateLimit } = require("./rateLimit");

admin.initializeApp();
const db = admin.firestore();

// ─── Auth / user helper ─────────────────────────────────────────────
function getCaller(context) {
  if (context.auth && context.auth.uid) {
    return { uid: context.auth.uid, isAnon: false };
  }
  return { uid: "anon", isAnon: true };
}

function requireAuth(context) {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError("unauthenticated", "Please sign in to use the assistant.");
  }
  return context.auth.uid;
}

// ─── Catalog helpers ────────────────────────────────────────────────
async function loadCatalog() {
  const snap = await db.collection("products").limit(300).get();
  const products = [];
  snap.forEach((d) => products.push({ id: d.id, ...d.data() }));
  return products;
}

// Robustly parse a model response that should be JSON. Strips markdown
// code fences (```json ... ```) and any surrounding prose, then parses.
// Falls back to `fallback` on any failure (never throws to the caller).
function parseJson(text, fallback) {
  if (typeof text !== "string" || !text.trim()) return fallback;
  let cleaned = text.trim();
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fence) cleaned = fence[1];
  const start = cleaned.search(/[{\[]/);
  const end = cleaned.lastIndexOf(cleaned.includes("[") ? "]" : "}");
  if (start !== -1 && end > start) cleaned = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    return fallback;
  }
}

// Build a compact text catalog for the model, optionally pre-filtered.
async function buildCatalogContext(filterFn) {
  const all = await loadCatalog();
  const filtered = filterFn ? all.filter(filterFn) : all;
  return sanitizeProductContext(filtered);
}

function catalogToText(products) {
  return products
    .map(
      (p) =>
        `- ${p.name} | ${p.category} | ${STORE_PROFILE.currencySymbol}${p.price} | rating ${p.rating} | ${p.description}`
    )
    .join("\n");
}

// ─── Chat ───────────────────────────────────────────────────────────
exports.aiChat = functions.https.onCall(async (data, context) => {
  const caller = getCaller(context);

  // Guests are allowed but heavily rate-limited.
  if (caller.isAnon) {
    const r = rateLimit("anon", "anon");
    if (!r.allowed) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        `Too many requests. Try again in ${r.retryAfterSec}s.`
      );
    }
  } else {
    const r = rateLimit(caller.uid, "chat");
    if (!r.allowed) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        `Slow down — too many messages. Try again in ${r.retryAfterSec}s.`
      );
    }
  }

  const userMessage = typeof data?.message === "string" ? data.message : "";
  const check = validateUserMessage(userMessage);
  if (!check.ok) {
    throw new functions.https.HttpsError("invalid-argument", check.reason);
  }

  // Conversation history (already persisted by the client to Firestore).
  const history = Array.isArray(data?.history) ? data.history : [];
  const safeHistory = history
    .slice(-LIMITS.maxConversationMessages)
    .filter((m) => m && m.role && typeof m.content === "string")
    .map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: String(m.content).slice(0, LIMITS.maxMessageLength),
    }));

  // Provide the model with the real catalog context (scoped to category if
  // the user mentioned one, otherwise a sample). This keeps answers grounded
  // in actual products and prices.
  const categoryHint = data?.category || null;
  const catalog = await buildCatalogContext(
    categoryHint ? (p) => p.category === categoryHint : null
  );
  const catalogText = catalogToText(catalog.slice(0, LIMITS.maxProductsContext));

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "system",
      content:
        "Current store catalog (use ONLY these for recommendations):\n" +
        (catalogText || "(no products available)"),
    },
    ...safeHistory,
    { role: "user", content: wrapUntrusted("USER MESSAGE", userMessage) },
  ];

  const reply = await llm.chat(messages, { temperature: 0.4, maxTokens: 500 });

  // Persist the exchange to the user's chat thread (server-authoritative).
  if (!caller.isAnon) {
    try {
      const threadId = data?.threadId || "main";
      const threadRef = db
        .collection("chats")
        .doc(caller.uid)
        .collection("threads")
        .doc(threadId);
      await threadRef.set(
        { updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
      const col = threadRef.collection("messages");
      await col.add({
        role: "user",
        content: userMessage.slice(0, LIMITS.maxMessageLength),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      await col.add({
        role: "assistant",
        content: String(reply).slice(0, 4000),
        model: process.env.AI_MODEL || "gpt-4o-mini",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (e) {
      console.error("Failed to persist chat:", e.message);
    }
  }

  return { reply: String(reply).slice(0, 4000) };
});

// ─── AI Product Search ──────────────────────────────────────────────
exports.aiSearch = functions.https.onCall(async (data, context) => {
  requireAuth(context);
  const caller = getCaller(context);
  const r = rateLimit(caller.uid, "search");
  if (!r.allowed) {
    throw new functions.https.HttpsError(
      "resource-exhausted",
      `Too many searches. Try again in ${r.retryAfterSec}s.`
    );
  }

  const query = typeof data?.query === "string" ? data.query : "";
  const check = validateSearchQuery(query);
  if (!check.ok) {
    throw new functions.https.HttpsError("invalid-argument", check.reason);
  }

  const catalog = await buildCatalogContext();
  const catalogText = catalogToText(catalog);

  const messages = [
    {
      role: "system",
      content:
        "You are a product search engine for LuxeBags. Given a customer query and the product catalog, return the IDs of the most relevant products as a JSON object. Respond with ONLY JSON: {\"productIds\": [\"id1\",\"id2\"], \"explanation\": \"short reason\"}. Match on name, category, description, style and use-case. If nothing is relevant return an empty array.",
    },
    {
      role: "user",
      content:
        wrapUntrusted("CATALOG", catalogText) +
        wrapUntrusted("QUERY", query),
    },
  ];

  let parsed;
  try {
    const raw = await llm.chat(messages, { json: true, temperature: 0.1, maxTokens: 400 });
    parsed = parseJson(raw, { productIds: [] });
  } catch (e) {
    console.error("aiSearch parse error:", e.message);
    parsed = { productIds: [] };
  }

  const ids = Array.isArray(parsed.productIds) ? parsed.productIds.slice(0, 12) : [];
  const full = await loadCatalog();
  const byId = new Map(full.map((p) => [p.id, p]));
  const results = ids.map((id) => byId.get(id)).filter(Boolean).slice(0, 12);

  return {
    results: results.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      rating: p.rating,
      image: (p.images && p.images[0]) || null,
      description: (p.description || "").slice(0, 200),
    })),
    explanation: String(parsed.explanation || "").slice(0, 300),
  };
});

// ─── Recommendations ────────────────────────────────────────────────
exports.aiRecommend = functions.https.onCall(async (data, context) => {
  requireAuth(context);
  const caller = getCaller(context);
  const r = rateLimit(caller.uid, "recommend");
  if (!r.allowed) {
    throw new functions.https.HttpsError(
      "resource-exhausted",
      `Too many requests. Try again in ${r.retryAfterSec}s.`
    );
  }

  const catalog = await buildCatalogContext();
  const catalogText = catalogToText(catalog);
  const excludeId = data?.productId || null;
  const preferences = typeof data?.preferences === "string" ? data.preferences : "";

  const messages = [
    {
      role: "system",
      content:
        "You are a personal shopper for LuxeBags. Recommend products from the catalog that best match the customer's current product or stated preferences. Return ONLY JSON: {\"productIds\": [\"id1\",\"id2\",\"id3\"], \"reason\": \"short personalised reason\"}. Do not recommend the product the customer is already viewing.",
    },
    {
      role: "user",
      content:
        wrapUntrusted("CATALOG", catalogText) +
        wrapUntrusted(
          "CONTEXT",
          `Currently viewing product id: ${excludeId || "none"}\nCustomer preferences: ${preferences || "none"}`
        ),
    },
  ];

  let parsed = { productIds: [] };
  try {
    const raw = await llm.chat(messages, { json: true, temperature: 0.5, maxTokens: 400 });
    parsed = parseJson(raw, { productIds: [] });
  } catch (e) {
    console.error("aiRecommend parse error:", e.message);
  }

  const ids = Array.isArray(parsed.productIds) ? parsed.productIds : [];
  const full = await loadCatalog();
  const byId = new Map(full.map((p) => [p.id, p]));
  const results = ids
    .map((id) => byId.get(id))
    .filter(Boolean)
    .filter((p) => p.id !== excludeId)
    .slice(0, 6);

  return {
    recommendations: results.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      rating: p.rating,
      image: (p.images && p.images[0]) || null,
    })),
    reason: String(parsed.reason || "").slice(0, 300),
  };
});

// ─── AI-generated product description ───────────────────────────────
exports.aiDescribe = functions.https.onCall(async (data, context) => {
  requireAuth(context);
  const caller = getCaller(context);
  const r = rateLimit(caller.uid, "describe");
  if (!r.allowed) {
    throw new functions.https.HttpsError(
      "resource-exhausted",
      `Too many requests. Try again in ${r.retryAfterSec}s.`
    );
  }

  const productId = typeof data?.productId === "string" ? data.productId : "";
  if (!productId) {
    throw new functions.https.HttpsError("invalid-argument", "productId is required.");
  }

  const doc = await db.collection("products").doc(productId).get();
  if (!doc.exists) {
    throw new functions.https.HttpsError("not-found", "Product not found.");
  }
  const p = doc.data();

  const seed = sanitizeProductContext([{ id: productId, ...p }])[0];

  const messages = [
    {
      role: "system",
      content:
        `Write a persuasive, accurate, SEO-friendly product description for LuxeBags in 2-3 short paragraphs. Use only the provided product facts. No invented specs. Tone: premium, confident, feminine. Return ONLY the description text.`,
    },
    {
      role: "user",
      content: wrapUntrusted(
        "PRODUCT",
        `Name: ${seed.name}\nCategory: ${seed.category}\nPrice: ${STORE_PROFILE.currencySymbol}${seed.price}\nExisting description: ${seed.description}`
      ),
    },
  ];

  const description = await llm.chat(messages, { temperature: 0.7, maxTokens: 400 });

  // Persist as an AI draft so it can be reviewed by an admin before publishing.
  try {
    await db
      .collection("products")
      .doc(productId)
      .collection("aiContent")
      .doc("description")
      .set(
        {
          description: String(description).slice(0, 2000),
          model: process.env.AI_MODEL || "gpt-4o-mini",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: "draft",
        },
        { merge: true }
      );
  } catch (e) {
    console.error("Failed to store AI description:", e.message);
  }

  return { description: String(description).slice(0, 2000), productId };
});

// ─── Reviews summary ────────────────────────────────────────────────
exports.aiSummarizeReviews = functions.https.onCall(async (data, context) => {
  requireAuth(context);
  const caller = getCaller(context);
  const r = rateLimit(caller.uid, "summarize");
  if (!r.allowed) {
    throw new functions.https.HttpsError(
      "resource-exhausted",
      `Too many requests. Try again in ${r.retryAfterSec}s.`
    );
  }

  const productId = typeof data?.productId === "string" ? data.productId : "";
  if (!productId) {
    throw new functions.https.HttpsError("invalid-argument", "productId is required.");
  }

  const reviewsSnap = await db
    .collection("products")
    .doc(productId)
    .collection("reviews")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  if (reviewsSnap.empty) {
    return { summary: "No reviews yet for this product.", productId, count: 0 };
  }

  const reviews = reviewsSnap.docs.map((d) => {
    const rv = d.data();
    return {
      rating: rv.rating || 0,
      text: String(rv.text || rv.comment || "").slice(0, LIMITS.maxReviewChars),
    };
  });

  const reviewsText = reviews
    .map((rv, i) => `Review ${i + 1} (${rv.rating}/5): ${rv.text}`)
    .join("\n")
    .slice(0, LIMITS.maxReviewChars);

  const messages = [
    {
      role: "system",
      content:
        "Summarise customer reviews for a LuxeBags product. Return ONLY JSON: {\"summary\": \"2-3 sentence friendly summary\", \"pros\": [\"up to 3 short bullets\"], \"cons\": [\"up to 3 short bullets\"], \"avgRating\": number}. Be balanced and base claims only on the reviews. If reviews are too short, say so.",
    },
    { role: "user", content: wrapUntrusted("REVIEWS", reviewsText) },
  ];

  let parsed = { summary: "Unable to summarise these reviews." };
  try {
    const raw = await llm.chat(messages, { json: true, temperature: 0.3, maxTokens: 400 });
    parsed = parseJson(raw, { summary: "Unable to summarise these reviews." });
  } catch (e) {
    console.error("aiSummarizeReviews parse error:", e.message);
  }

  try {
    await db
      .collection("products")
      .doc(productId)
      .collection("aiContent")
      .doc("reviewSummary")
      .set(
        {
          summary: String(parsed.summary || "").slice(0, 1000),
          pros: Array.isArray(parsed.pros) ? parsed.pros.slice(0, 3) : [],
          cons: Array.isArray(parsed.cons) ? parsed.cons.slice(0, 3) : [],
          avgRating: typeof parsed.avgRating === "number" ? parsed.avgRating : 0,
          count: reviews.length,
          model: process.env.AI_MODEL || "gpt-4o-mini",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
  } catch (e) {
    console.error("Failed to store review summary:", e.message);
  }

  return {
    summary: String(parsed.summary || "").slice(0, 1000),
    pros: Array.isArray(parsed.pros) ? parsed.pros.slice(0, 3) : [],
    cons: Array.isArray(parsed.cons) ? parsed.cons.slice(0, 3) : [],
    count: reviews.length,
    productId,
  };
});

// ─── Record a customer review (server-authoritative) ────────────────
exports.submitReview = functions.https.onCall(async (data, context) => {
  const uid = requireAuth(context);
  const { getUserProfile } = require("../users");
  const productId = typeof data?.productId === "string" ? data.productId : "";
  const rating = Number(data?.rating);
  const text = typeof data?.text === "string" ? data.text.slice(0, 1000) : "";

  if (!productId) {
    throw new functions.https.HttpsError("invalid-argument", "productId is required.");
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new functions.https.HttpsError("invalid-argument", "Rating must be 1-5.");
  }

  const productRef = db.collection("products").doc(productId);
  const productSnap = await productRef.get();
  if (!productSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Product not found.");
  }

  let name = "Customer";
  try {
    const profile = await getUserProfile(uid);
    name = profile?.name || profile?.email?.split("@")[0] || "Customer";
  } catch (_) {}

  const reviewRef = productRef.collection("reviews").doc();
  await reviewRef.set({
    userId: uid,
    authorName: name,
    rating,
    text,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Recompute aggregate rating (bounded transaction).
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(productRef);
    const reviews = snap.data().reviewsCount || 0;
    const oldRating = snap.data().rating || 0;
    const newCount = reviews + 1;
    const newRating = (oldRating * reviews + rating) / newCount;
    tx.update(productRef, {
      rating: Math.round(newRating * 10) / 10,
      reviewsCount: newCount,
    });
  });

  return { success: true, reviewId: reviewRef.id };
});
