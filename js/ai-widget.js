// AI Chat Widget — modern, responsive chat UI with typing indicator.
// Talks ONLY to the server-side `aiChat` callable (API key stays on server).

import { isAuthenticated, getUser } from './auth.js';
import { aiChat, loadChatHistory } from './ai.js';
import { escapeHtml } from './utils.js';

const SUGGESTIONS = [
  'Find a tote under ₵500',
  'Best handbag for work',
  'Recommend heels for a wedding',
  'What is your return policy?',
  'Do you deliver to Accra?',
  'How long does shipping take?',
];

let isOpen = false;
let isThinking = false;
let initialized = false;

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

function sparkIcon() {
  return `<svg class="ai-spark" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.6L19.5 9.5 14 11.4 12 17l-2-5.6L4.5 9.5l5.6-1.9L12 2z"/></svg>`;
}

function buildWidget() {
  const launcher = el('button', 'ai-launcher');
  launcher.id = 'ai-launcher';
  launcher.setAttribute('aria-label', 'Open AI shopping assistant');
  launcher.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;

  const window = el('div', 'ai-chat-window');
  window.id = 'ai-chat-window';
  window.innerHTML = `
    <div class="ai-chat-header">
      <div class="ai-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l1.9 5.6L19.5 9.5 14 11.4 12 17l-2-5.6L4.5 9.5l5.6-1.9L12 2z"/></svg>
      </div>
      <div>
        <div class="ai-title">LUXE Assistant</div>
        <div class="ai-status">Online · here to help you shop</div>
      </div>
      <button class="ai-close" id="ai-chat-close" aria-label="Close chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="ai-chat-messages" id="ai-chat-messages"></div>
    <div class="ai-suggestions" id="ai-suggestions"></div>
    <div class="ai-chat-input">
      <textarea id="ai-chat-text" rows="1" placeholder="Ask about products, shipping, returns…" maxlength="2000"></textarea>
      <button id="ai-chat-send" aria-label="Send">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
    <div class="ai-chat-foot">AI can make mistakes. Verify important details.</div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(window);

  const messages = window.querySelector('#ai-chat-messages');
  const textarea = window.querySelector('#ai-chat-text');
  const sendBtn = window.querySelector('#ai-chat-send');

  launcher.addEventListener('click', toggleChat);
  window.querySelector('#ai-chat-close').addEventListener('click', toggleChat);

  const send = () => handleSend();
  sendBtn.addEventListener('click', send);
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 96) + 'px';
  });

  renderSuggestions();
}

function toggleChat() {
  const window = document.getElementById('ai-chat-window');
  isOpen = !isOpen;
  window.classList.toggle('open', isOpen);
  if (isOpen) {
    document.getElementById('ai-chat-text').focus();
    maybeLoadHistory();
  }
}

function addMessage(role, text, products = []) {
  const messages = document.getElementById('ai-chat-messages');
  const bubble = el('div', `ai-msg ${role}`);
  bubble.textContent = text;

  if (role === 'assistant' && products && products.length) {
    products.forEach((p) => {
      const card = el('a', 'ai-product-card-mini');
      card.href = `product.html?id=${encodeURIComponent(p.id)}`;
      card.innerHTML = `
        <img src="${p.image || ''}" alt="${escapeHtml(p.name)}" onerror="this.style.display='none'">
        <div>
          <div class="ai-pm-name">${escapeHtml(p.name)}</div>
          <div class="ai-pm-price">₵${Number(p.price || 0).toFixed(2)}</div>
        </div>`;
      bubble.appendChild(card);
    });
  }

  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
  return bubble;
}

function showTyping() {
  const messages = document.getElementById('ai-chat-messages');
  const t = el('div', 'ai-typing');
  t.id = 'ai-typing';
  t.innerHTML = '<span></span><span></span><span></span>';
  messages.appendChild(t);
  messages.scrollTop = messages.scrollHeight;
}

function hideTyping() {
  document.getElementById('ai-typing')?.remove();
}

function renderSuggestions() {
  const box = document.getElementById('ai-suggestions');
  if (!box) return;
  if (document.getElementById('ai-chat-messages')?.children.length > 1) {
    box.style.display = 'none';
    return;
  }
  box.style.display = 'flex';
  box.innerHTML = '';
  SUGGESTIONS.forEach((s) => {
    const chip = el('button', 'ai-suggestion-chip', escapeHtml(s));
    chip.addEventListener('click', () => {
      document.getElementById('ai-chat-text').value = s;
      handleSend();
    });
    box.appendChild(chip);
  });
}

let conversationHistory = [];

async function handleSend() {
  if (isThinking) return;
  const textarea = document.getElementById('ai-chat-text');
  const text = textarea.value.trim();
  if (!text) return;

  textarea.value = '';
  textarea.style.height = 'auto';
  addMessage('user', text);
  conversationHistory.push({ role: 'user', content: text });

  // Persist to Firestore if logged in (server also appends the reply).
  const user = getUser();
  const threadId = 'main';

  showTyping();
  isThinking = true;
  setSendEnabled(false);
  document.getElementById('ai-suggestions').style.display = 'none';

  const res = await aiChat({
    message: text,
    history: conversationHistory.slice(-10),
    threadId,
  });

  hideTyping();
  isThinking = false;
  setSendEnabled(true);

  if (res.success) {
    addMessage('assistant', res.reply);
    conversationHistory.push({ role: 'assistant', content: res.reply });
    // The server (`aiChat`) is authoritative and already persisted both the
    // user message and the assistant reply, so we don't double-write here.
  } else {
    addMessage('assistant', res.error || 'Sorry, I could not respond right now.');
  }
}

function setSendEnabled(enabled) {
  const btn = document.getElementById('ai-chat-send');
  if (btn) btn.disabled = !enabled;
}

async function maybeLoadHistory() {
  const user = getUser();
  if (!user || conversationHistory.length) return;
  const history = await loadChatHistory(user.uid, 'main');
  if (history.length) {
    conversationHistory = history.slice(-10).map((m) => ({ role: m.role, content: m.content }));
    history.slice(-12).forEach((m) => addMessage(m.role, m.content));
    document.getElementById('ai-suggestions').style.display = 'none';
  } else {
    addMessage('assistant', "Hi there! I'm LUXE, your personal shopping assistant at LuxeBags. I'm here to help you find the perfect bag, answer questions about shipping or returns, or assist with anything else. What can I do for you today?");
  }
}

export function initAIWidget() {
  if (initialized) return;
  initialized = true;
  buildWidget();
}

// Tracks first-visit so future sessions can optionally surface the assistant.
// Intentionally does NOT auto-open, to avoid disrupting the shopping UX.
export function greetIfFirstVisit() {
  try {
    const store = window.localStorage;
    if (!store.getItem('ai_widget_seen')) {
      store.setItem('ai_widget_seen', '1');
    }
  } catch (_) {}
}
