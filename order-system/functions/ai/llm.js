// ───────────────────────────────────────────────────────────────────────
// LLM client — OpenAI-compatible chat completions.
//
// The API key is read from Firebase Functions config / environment only.
// It is NEVER sent to the client. Swap the base URL + key to use any
// OpenAI-compatible provider (Azure OpenAI, OpenRouter, Together, etc.).
// ───────────────────────────────────────────────────────────────────────

const https = require("https");
const { URL } = require("url");

function getConfig() {
  // firebase-functions v6 style: functions.config() may be undefined locally.
  try {
    const fnConfig = require("firebase-functions").config();
    if (fnConfig && fnConfig.ai && fnConfig.ai.api_key) {
      return {
        apiKey: fnConfig.ai.api_key,
        baseUrl: fnConfig.ai.base_url || "https://api.openai.com/v1",
      };
    }
  } catch (_) {
    /* not on functions runtime */
  }
  return {
    apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY || "",
    baseUrl: process.env.AI_BASE_URL || "https://api.openai.com/v1",
  };
}

function postJson(urlStr, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const data = JSON.stringify(body);
    const req = https.request(
      {
        method: "POST",
        hostname: u.hostname,
        path: u.pathname + u.search,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${headers.apiKey}`,
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch (e) {
            reject(new Error("Invalid JSON from LLM: " + raw));
          }
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(25000, () => req.destroy(new Error("LLM request timed out")));
    req.write(data);
    req.end();
  });
}

// messages: [{ role: 'system'|'user'|'assistant', content: string }]
// options: { json?: boolean, temperature?, maxTokens? }
async function chat(messages, options = {}) {
  const { apiKey, baseUrl } = getConfig();
  if (!apiKey) {
    throw new Error("AI provider API key is not configured on the server.");
  }

  const body = {
    model: options.model || process.env.AI_MODEL || "gpt-4o-mini",
    messages,
    temperature: options.temperature ?? 0.4,
    max_tokens: options.maxTokens || 600,
  };
  if (options.json) body.response_format = { type: "json_object" };

  const res = await postJson(`${baseUrl}/chat/completions`, { apiKey }, body);

  if (res.status !== 200) {
    const msg = res.body?.error?.message || JSON.stringify(res.body);
    throw new Error(`LLM error ${res.status}: ${msg}`);
  }

  const choice = res.body.choices && res.body.choices[0];
  if (!choice) throw new Error("LLM returned no completion.");

  return choice.message.content;
}

module.exports = { chat };
