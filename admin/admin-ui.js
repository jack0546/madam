// Shared admin command-center shell logic. Imported by each admin page.
import { getProfile, logout, isAuthenticated, isAdmin } from '../js/auth.js';
import { escapeHtml } from '../js/utils.js';

export const $ = (s, ctx = document) => ctx.querySelector(s);
export const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

/* ---------- Toast ---------- */
export function toast(msg, type = 'success') {
    const wrap = $('#toast-wrap');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '!' : 'ⓘ';
    el.innerHTML = `<div class="tk">${icon}</div><div class="tx"><div class="tt">${escapeHtml(msg)}</div><div class="ts">${new Date().toLocaleTimeString()}</div></div>`;
    wrap.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 340); }, 3200);
}

/* ---------- Theme ---------- */
const sunIcon = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
const moonIcon = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
export function initTheme() {
    const root = document.documentElement;
    const apply = (t) => {
        root.setAttribute('data-theme', t);
        const icon = $('#theme-icon');
        if (icon) icon.innerHTML = t === 'light' ? sunIcon : moonIcon;
        localStorage.setItem('lb-theme', t);
    };
    apply(localStorage.getItem('lb-theme') || 'dark');
    $('#theme-toggle')?.addEventListener('click', () => apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
}

/* ---------- Sidebar + account ---------- */
export function initShell() {
    const app = $('#app');
    $('#collapse-btn')?.addEventListener('click', () => app.classList.toggle('collapsed'));
    $('#burger')?.addEventListener('click', () => { app.classList.add('drawer'); $('#scrim').classList.add('open'); });
    $('#scrim')?.addEventListener('click', () => { app.classList.remove('drawer'); $('#scrim').classList.remove('open'); });

    const accBtn = $('#account-btn'), accMenu = $('#account-menu');
    const toggleAcc = (open) => {
        const willOpen = open ?? !accMenu.classList.contains('open');
        accMenu.classList.toggle('open', willOpen);
        accBtn.setAttribute('aria-expanded', String(willOpen));
    };
    accBtn?.addEventListener('click', () => toggleAcc());
    accBtn?.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAcc(); } });
    document.addEventListener('click', (e) => { if (accMenu && !accMenu.contains(e.target) && e.target !== accBtn && !accBtn.contains(e.target)) toggleAcc(false); });

    $('#acc-profile')?.addEventListener('click', () => { toggleAcc(false); toast('Profile — coming soon', 'info'); });
    $('#acc-settings')?.addEventListener('click', () => { toggleAcc(false); toast('Settings — coming soon', 'info'); });
    $('#notif-btn')?.addEventListener('click', () => toast('No new notifications', 'info'));
    $('#admin-logout')?.addEventListener('click', async (e) => {
        e.preventDefault();
        await logout();
        toast('Logged out', 'success');
        setTimeout(() => window.location.href = 'login.html', 600);
    });

    // clock
    setInterval(() => { const c = $('#clock'); if (c) c.textContent = new Date().toLocaleTimeString(); }, 1000);

    // global search hotkey
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#global-search')?.focus(); }
    });

    // reflect profile
    const profile = getProfile();
    if (profile) {
        const name = profile.displayName || profile.name || 'Admin';
        const initials = avatarText(name);
        $('#acc-name').textContent = name;
        $('#prof-av').textContent = initials;
        $('#acc-av').textContent = initials;
    }
}

export function avatarText(name) {
    return (name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

/* ---------- Slide-over helper ---------- */
export function initSlideover() {
    const ov = $('#overlay-sc'), so = $('#slideover');
    window.__closeSlideover = () => { ov.classList.remove('open'); so.classList.remove('open'); so.setAttribute('aria-hidden', 'true'); };
    ov.addEventListener('click', window.__closeSlideover);
    $('#so-close')?.addEventListener('click', window.__closeSlideover);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.__closeSlideover(); });
}
export function openSlideover(title, html) {
    $('#so-title').textContent = title;
    $('#so-body').innerHTML = html;
    $('#overlay-sc').classList.add('open');
    $('#slideover').classList.add('open');
    $('#slideover').setAttribute('aria-hidden', 'false');
}

/* ---------- Pagination helper ---------- */
export function renderPagination(container, infoEl, page, pages, onPage) {
    infoEl.textContent = infoEl.dataset.text || infoEl.textContent;
    let html = `<button ${page === 1 ? 'disabled' : ''} data-pg="prev">‹</button>`;
    for (let i = 1; i <= pages; i++) html += `<button class="${i === page ? 'active' : ''}" data-pg="${i}">${i}</button>`;
    html += `<button ${page === pages ? 'disabled' : ''} data-pg="next">›</button>`;
    container.innerHTML = html;
    container.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
        const v = b.dataset.pg;
        if (v === 'prev') onPage(page - 1);
        else if (v === 'next') onPage(page + 1);
        else onPage(+v);
    }));
}

/* ---------- Count-up ---------- */
export function countUp(el, target, opts = {}) {
    const dur = 1100, start = performance.now();
    const dec = opts.dec || 0, prefix = opts.prefix || '';
    const fmt = (v) => prefix + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    function frame(now) {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * eased);
        if (p < 1) requestAnimationFrame(frame);
        else el.textContent = fmt(target);
    }
    requestAnimationFrame(frame);
}
