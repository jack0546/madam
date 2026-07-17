// Shared storefront navigation: hamburger (3-line) menu, Help Center
// submenu, and Order Protection. Injected into every page so the markup
// stays DRRY and consistent. Auth-aware: account/orders/notifications links
// are shown only when signed in.

import { isAuthenticated, getProfile, getUser } from './auth.js';
import { showToast, escapeHtml } from './utils.js';

const HELP_ITEMS = [
  { label: 'Buyer Help Center', href: 'help.html', icon: 'help' },
  { label: 'Live chat', href: '#', action: 'chat', icon: 'chat' },
  { label: 'File a trade dispute', href: 'dispute.html', icon: 'shield' },
  { label: 'Refunds & after-sales', href: 'refund.html', icon: 'refresh' },
  { label: 'Report IP infringement', href: 'ip.html', icon: 'copyright' },
  { label: 'Report a violation', href: 'violation.html', icon: 'flag' },
];

const ORDER_PROTECTION = [
  {
    title: 'Secure payments',
    text: 'Your payment details are encrypted end-to-end. We never store full card numbers.',
    icon: 'lock',
    href: 'protection.html#secure-payments',
  },
  {
    title: 'Money-back guarantee',
    text: 'Not satisfied? Get a full refund within 30 days of delivery, no questions asked.',
    icon: 'shield',
    href: 'protection.html#money-back',
  },
  {
    title: 'Guaranteed on-time delivery',
    text: 'If your order arrives late, we will make it right with store credit.',
    icon: 'truck',
    href: 'protection.html#guaranteed-delivery',
  },
  {
    title: 'After-sales protections',
    text: 'Dedicated support to resolve issues with defective or wrong items quickly.',
    icon: 'headset',
    href: 'protection.html#after-sales',
  },
];

const ICONS = {
  orders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
  copyright: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M14.59 14.59A2 2 0 1 1 12 10a2 2 0 0 1 2 2h1.59z"/><path d="M12 10v4"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 7 2 10 1 13 1 16 1v-4"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  headset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
};

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function buildProfileSection() {
  const authed = isAuthenticated();
  const profile = getProfile();
  const user = getUser();

  if (!authed) {
    const wrap = el(`<div class="nav-profile" id="nav-profile">
      <a href="login.html" class="nav-profile-signin">Sign In</a>
    </div>`);
    return wrap;
  }

  const avatar = profile?.photo || '';
  const name = escapeHtml(profile?.name || user?.email?.split('@')[0] || 'User');
  const email = escapeHtml(user?.email || '');

  const wrap = el(`<div class="nav-profile" id="nav-profile">
    <img class="nav-profile-avatar" src="${avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23f4f4f4'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='28' fill='%239ca3af' text-anchor='middle' dominant-baseline='central'%3EUser%3C/text%3E%3C/svg%3E"}" alt="${name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27600%27 height=%27600%27%3E%3Crect width=%27100%25%27 height=%27100%25%27 fill=%27%23f4f4f4%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 font-family=%27sans-serif%27 font-size=%2728%27 fill=%27%239ca3af%27 text-anchor=%27middle%27 dominant-baseline=%27central%27%3EUser%3C/text%3E%3C/svg%3E'">
    <div class="nav-profile-info">
      <div class="nav-profile-name">${name}</div>
      <div class="nav-profile-email">${email}</div>
    </div>
  </div>`);
  return wrap;
}

function buildMenuItems() {
  const authed = isAuthenticated();
  const orders = el(`<a class="nav-menu-item ${authed ? '' : 'hidden'}" href="orders.html" id="menu-orders">
    <span class="nav-ic">${ICONS.orders}</span> My Orders</a>`);
  const notif = el(`<a class="nav-menu-item ${authed ? '' : 'hidden'}" href="notifications.html" id="menu-notif">
    <span class="nav-ic">${ICONS.bell}</span> Notifications</a>`);
  const account = el(`<a class="nav-menu-item ${authed ? '' : 'hidden'}" href="account.html" id="menu-account">
    <span class="nav-ic">${ICONS.user}</span> My Account</a>`);

  const logoutItem = el(`<button class="nav-menu-item ${authed ? '' : 'hidden'}" id="menu-logout" type="button">
    <span class="nav-ic">${ICONS.logout}</span> Logout</button>`);

  const helpToggle = el(`<button class="nav-menu-item" id="menu-help-toggle" type="button">
    <span class="nav-ic">${ICONS.help}</span> Help Center
    <span class="nav-chev">${ICONS.chevron}</span></button>`);

  const helpSub = el(`<div class="nav-sub" id="menu-help-sub"></div>`);
  HELP_ITEMS.forEach((it) => {
    const item = el(`<a class="nav-menu-item" href="${it.href}" data-action="${it.action || ''}">
      <span class="nav-ic">${ICONS[it.icon]}</span> ${it.label}</a>`);
    helpSub.appendChild(item);
  });

  helpToggle.addEventListener('click', () => helpSub.classList.toggle('open'));

  return { orders, notif, account, logoutItem, helpToggle, helpSub };
}

function buildOrderProtection() {
  const wrap = el(`<div class="nav-menu-group"><div class="nav-menu-title">Order Protection</div><div class="op-grid"></div></div>`);
  const grid = wrap.querySelector('.op-grid');
  ORDER_PROTECTION.forEach((op) => {
    grid.appendChild(el(`<a class="op-card" href="${op.href}">
      <div class="op-ic">${ICONS[op.icon]}</div>
      <div><h5>${op.title}</h5><p>${op.text}</p></div>
    </a>`));
  });
  return wrap;
}

function injectMenu() {
  const actions = document.querySelector('.nav-actions');
  if (!actions) return;

  // Hamburger button
  const burger = el(`<button class="nav-burger" id="nav-burger" aria-label="Open menu" type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  </button>`);
  actions.insertBefore(burger, actions.firstChild);

  // Overlay + panel
  const overlay = el(`<div class="nav-panel-overlay" id="nav-panel-overlay"></div>`);
  const panel = el(`<aside class="nav-panel" id="nav-panel" aria-hidden="true"></aside>`);

  const head = el(`<div class="nav-panel-head">
    <span class="nav-brand-sm">LUXEBAGS</span>
    <button class="nav-close" id="nav-panel-close" aria-label="Close menu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>`);

  const body = el(`<div class="nav-panel-body"></div>`);

  const profile = buildProfileSection();
  const primary = el(`<div class="nav-menu-group" id="menu-primary"></div>`);
  const items = buildMenuItems();
  primary.append(items.orders, items.notif, items.account, items.logoutItem, items.helpToggle, items.helpSub);

  const op = buildOrderProtection();

  body.append(profile, primary, op);
  panel.append(head, body);
  document.body.append(overlay, panel);

  const open = () => {
    overlay.classList.add('open');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
  };
  const close = () => {
    overlay.classList.remove('open');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  };

  burger.addEventListener('click', open);
  overlay.addEventListener('click', close);
  head.querySelector('#nav-panel-close').addEventListener('click', close);

  // Logout handler
  const logoutBtn = document.getElementById('menu-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const { logout } = await import('./auth.js');
      await logout();
      window.location.href = 'index.html';
    });
  }

  // Delegate Help Center actions
  panel.addEventListener('click', (e) => {
    const link = e.target.closest('[data-action]');
    if (!link) return;
    const action = link.dataset.action;
    if (!action) return;
    e.preventDefault();
    close();
    handleHelpAction(action);
  });
}

function handleHelpAction(action) {
  switch (action) {
    case 'chat':
      document.getElementById('ai-launcher')?.click();
      break;
    case 'dispute':
      showHelpToast('Trade dispute: email support@luxebags.com with your order ID.');
      break;
    case 'refund':
      showHelpToast('Refunds: request within 30 days from My Orders → order details.');
      break;
    case 'ip':
      showHelpToast('IP infringement: email legal@luxebags.com with evidence.');
      break;
    case 'violation':
      showHelpToast('Report a violation: use the form at luxebags.com/report or contact support.');
      break;
  }
}

function showHelpToast(msg) {
  showToast(msg, 'success');
}

// Rebuild the footer into a clean Help Center + Order Protection layout,
// replacing dead "Customer Service" placeholder links.
function injectFooter() {
  const footer = document.querySelector('.footer .container');
  if (!footer) return;

  const helpCol = el(`<div>
    <h4>Help Center</h4>
    <a href="help.html">Buyer Help Center</a>
    <a href="#" data-action="chat">Live chat</a>
    <a href="dispute.html">File a trade dispute</a>
    <a href="refund.html">Refunds & after-sales</a>
    <a href="ip.html">Report IP infringement</a>
    <a href="violation.html">Report a violation</a>
  </div>`);

  const opCol = el(`<div>
    <h4>Order Protection</h4>
    <div class="op-foot-grid"></div>
  </div>`);
  const opGrid = opCol.querySelector('.op-foot-grid');
  ORDER_PROTECTION.forEach((op) => {
    opGrid.appendChild(el(`<a class="op-foot-item" href="${op.href}">
      <div class="op-ic">${ICONS[op.icon]}</div>
      <div><strong>${op.title}</strong><span>${op.text}</span></div>
    </a>`));
  });

  const brandCol = footer.querySelector('div');

  // Remove only the dead "Customer Service" placeholder links; keep
  // the legitimate Quick Links (Home / Shop / My Orders) block.
  const customerService = Array.from(footer.querySelectorAll('h4')).find((h) => h.textContent.trim() === 'Customer Service');
  if (customerService) customerService.parentElement.remove();

  footer.querySelector('.site-footer-help')?.remove();
  const helpWrap = el(`<div class="site-footer-help"></div>`);
  if (brandCol) helpWrap.appendChild(brandCol); // move existing brand block (no dup)
  helpWrap.appendChild(helpCol);
  helpWrap.appendChild(opCol);
  footer.appendChild(helpWrap);

  helpCol.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    e.preventDefault();
    handleHelpAction(a.dataset.action);
  });
}

let initialized = false;
export function initNavMenu() {
  if (initialized) return;
  initialized = true;
  injectMenu();
  injectFooter();
}
