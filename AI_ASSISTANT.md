# AI Shopping Assistant

An integrated AI shopping assistant for LuxeBags: chat widget, AI product search,
personalised recommendations, AI-generated product descriptions, and review summaries.

## Security model (important)

- **API keys never reach the browser.** All LLM calls happen in Firebase Cloud
  Functions (`order-system/functions/ai/`). The client only ever calls `httpsCallable`
  endpoints, so the provider key stays server-side.
- **Prompt-injection defense (defense in depth):**
  - The system prompt locks the assistant's identity/scope and forbids adopting
    alternate personas or revealing instructions (`order-system/functions/ai/config.js`).
  - User/tool content is wrapped with strict `<<<BEGIN/END (untrusted)>>>` delimiters
    so the model treats it as data, not commands.
  - Inputs are regex-validated and length-capped before hitting the model
    (`order-system/functions/ai/prompts.js`). Obvious injection attempts are rejected
    with HTTP 400 (`invalid-argument`).
- **Rate limiting:** per-user sliding-window counters for every endpoint
  (`order-system/functions/ai/rateLimit.js`). Anonymous users get a tiny allowance.
- **Auth + Firestore rules:** chat threads, reviews, and AI content are protected in
  `firestore.rules`. Clients may only create their own `user` chat messages and their
  own reviews (rating 1–5). Assistant replies and AI content are written by the
  trusted Functions (admin context).
- **Grounded answers:** the model is only given the real product catalog from
  Firestore, so it cannot invent products/prices.

## Files

- `order-system/functions/ai/config.js` — system prompt + store profile (server only)
- `order-system/functions/ai/prompts.js` — injection validation + input limits
- `order-system/functions/ai/rateLimit.js` — per-user rate limiter
- `order-system/functions/ai/llm.js` — OpenAI-compatible chat client (key from server config)
- `order-system/functions/ai/index.js` — callable functions: `aiChat`, `aiSearch`,
  `aiRecommend`, `aiDescribe`, `aiSummarizeReviews`, `submitReview`
- `js/ai.js` — browser wrapper around the callable functions
- `js/ai-widget.js` — chat widget UI (typing indicator, responsive, suggestions)
- `css/ai.css` — chat widget + AI panel styles

## Deploy

1. Install Functions dependencies (one time):
   ```bash
   cd order-system/functions
   npm install
   ```
2. Set the LLM provider key (server-side only — do NOT commit it):
   ```bash
   firebase functions:config:set \
     ai.api_key="sk-..." \
     ai.base_url="https://api.openai.com/v1" \
     ai.model="gpt-4o-mini"
   ```
   Or export env vars `OPENAI_API_KEY` / `AI_BASE_URL` / `AI_MODEL`.
3. Deploy Firestore rules + indexes + functions:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,functions
   ```
4. The chat widget auto-loads on every page; the product page shows the AI
   description, review summary, recommendations, and review form.

## Provider swap

To use a different OpenAI-compatible provider (Azure OpenAI, OpenRouter, Together,
etc.), change only `ai.base_url` / `ai.api_key`. No code changes required.
