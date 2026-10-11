/* ==========================================================================
   Spiritual Seasons v2 — application logic
   Vanilla JS, no build step. Single scroll container (#app-main); the shell
   chrome (header/nav) is in-flow, so pages need no clearance padding.
   Season titles keep the ' — ' data contract: short names come from
   season.title.split(' — ')[0].
   ========================================================================== */
(function () {
'use strict';

/* ---------------- utilities ---------------- */
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const SEASON_EMOJI = { winter: '❄️', spring: '🌱', summer: '☀️', autumn: '🍂' };
const SEASON_START = { winter: 1, spring: 31, summer: 61, autumn: 91 };

/* ---------------- store (localStorage, stays on device) ---------------- */
const Store = (() => {
  const KEY = 'ss-v2-state';
  const defaults = () => ({
    settings: {
      theme: 'light', seasonColor: 'auto', fontSize: 'medium', lineSpacing: 'normal',
      translation: 'NLT', readingSpeed: 'normal', chime: true, onboardingDone: false,
    },
    currentDay: 1,
    completedDays: [],
    favorites: [],
    journal: {},
    reflections: {},
    quizResult: null,
    completionDates: {},
  });
  let state = defaults();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = Object.assign(defaults(), JSON.parse(raw));
  } catch (e) { /* fresh state */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  return {
    get: (k) => state[k],
    set: (k, v) => { state[k] = v; save(); },
    getSetting: (k) => state.settings[k],
    setSetting: (k, v) => { state.settings[k] = v; save(); applySettings(); },
    all: () => state,
    reset: () => { state = defaults(); save(); },
  };
})();

function applySettings() {
  const s = Store.all().settings;
  const root = document.documentElement;
  const hour = new Date().getHours();
  const theme = s.theme === 'auto' ? (hour >= 19 || hour < 7 ? 'dark' : 'light') : s.theme;
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')
    .setAttribute('content', theme === 'dark' ? '#171717' : '#4A90A4');
  root.dataset.fontsize = s.fontSize === 'small' ? 'small' : (s.fontSize === 'large' ? 'large' : 'medium');
  root.dataset.linespacing = s.lineSpacing;
  applySeasonColor();
}
function seasonShort(title) { return String(title).split(' — ')[0]; }
function applySeasonColor() {
  const s = Store.all().settings;
  let season = 'winter';
  if (s.seasonColor === 'auto') {
    const day = Store.get('currentDay') || 1;
    season = Data.seasonForDay(day).id;
  } else {
    season = s.seasonColor;
  }
  document.documentElement.dataset.season = season;
}

/* ---------------- data ---------------- */
const Data = (() => {
  let book = null, quiz = null;
  async function load() {
    const [b, q] = await Promise.all([
      fetch('content/book.json').then((r) => r.json()),
      fetch('content/quiz.json').then((r) => r.json()),
    ]);
    book = b; quiz = q;
  }
  const seasons = () => book.seasons;
  const seasonById = (id) => book.seasons.find((s) => s.id === id);
  function seasonForDay(day) {
    const idx = Math.min(3, Math.max(0, Math.floor((day - 1) / 30)));
    return book.seasons[idx];
  }
  function dayInSeason(day) { return ((day - 1) % 30) + 1; }
  function getDay(day) {
    const season = seasonForDay(day);
    return { day, season, data: season.days[dayInSeason(day) - 1] };
  }
  function flatQuestions() {
    const out = [];
    quiz.seasons.forEach((season) => {
      season.questions.forEach((text, i) => out.push({ id: season.id + '-' + i, seasonId: season.id, text }));
    });
    return out;
  }
  return { load, seasons, seasonById, seasonForDay, dayInSeason, getDay, flatQuestions,
    get book() { return book; }, get quiz() { return quiz; } };
})();

/* ---------------- toast ---------------- */
function toast(msg) {
  const root = $('#toast-root');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 350); }, 2600);
}

/* ---------------- modal ---------------- */
const Modal = (() => {
  const root = () => $('#modal-root');
  function open({ title, body, footer, wide, onClose }) {
    close();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal-dialog' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      '<div class="modal-header"><div class="modal-title">' + esc(title) + '</div>' +
      '<button class="btn-icon" data-close aria-label="Close dialog"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>' +
      '<div class="modal-body"></div>' +
      (footer ? '<div class="modal-footer"></div>' : '') +
      '</div>';
    const bodyEl = $('.modal-body', overlay);
    if (typeof body === 'string') bodyEl.innerHTML = body; else if (body) bodyEl.appendChild(body);
    if (footer) {
      const f = $('.modal-footer', overlay);
      if (typeof footer === 'string') f.innerHTML = footer; else f.appendChild(footer);
    }
    const cleanup = () => { document.removeEventListener('keydown', onKey); if (onClose) onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') { close(); } };
    document.addEventListener('keydown', onKey);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('[data-close]')) close();
    });
    overlay._cleanup = cleanup;
    root().appendChild(overlay);
    return overlay;
  }
  function close() {
    const ov = $('.modal-overlay', root());
    if (ov) { if (ov._cleanup) ov._cleanup(); ov.remove(); }
  }
  function confirm({ title, message, confirmText, cancelText }) {
    return new Promise((resolve) => {
      const footer = document.createElement('div');
      footer.style.cssText = 'display:flex;flex-direction:column;gap:12px;';
      footer.innerHTML =
        '<button class="btn btn-secondary btn-block" data-cancel>' + esc(cancelText || 'Cancel') + '</button>' +
        '<button class="btn btn-primary btn-block" data-ok>' + esc(confirmText || 'Confirm') + '</button>';
      const ov = open({ title, body: '<p class="prose">' + esc(message) + '</p>', footer, onClose: () => resolve(false) });
      $('[data-ok]', ov).addEventListener('click', () => { close(); resolve(true); });
      $('[data-cancel]', ov).addEventListener('click', () => { close(); resolve(false); });
    });
  }
  return { open, close, confirm };
})();

/* ---------------- TTS ---------------- */
const TTS = (() => {
  const rates = { slow: 0.8, normal: 1, fast: 1.25 };
  function speak(text) {
    try {
      stop();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rates[Store.getSetting('readingSpeed')] || 1;
      speechSynthesis.speak(u);
    } catch (e) { toast('Speech is not available on this device'); }
  }
  function stop() { try { speechSynthesis.cancel(); } catch (e) {} }
  return { speak, stop };
})();

/* ---------------- chime (WebAudio) ---------------- */
function playChime() {
  if (!Store.getSetting('chime')) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 528;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);
    osc.start(); osc.stop(ctx.currentTime + 1.5);
  } catch (e) {}
}

/* ---------------- router ---------------- */
const Router = (() => {
  const routes = {};
  let current = null;
  function register(name, fn) { routes[name] = fn; }
  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const [pathPart, queryPart] = h.split('?');
    const segs = pathPart.split('/').filter(Boolean);
    const params = {};
    if (segs.length > 1) params.day = parseInt(segs[1], 10);
    if (queryPart) queryPart.split('&').forEach((kv) => {
      const [k, v] = kv.split('='); params[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
    return { name: segs[0] || 'home', params };
  }
  async function render() {
    TTS.stop();
    const { name, params } = parseHash();
    const fn = routes[name] || routes.home;
    current = name;
    const main = $('#app-main');
    const page = $('#page');
    page.innerHTML = '<div class="loading-wrap"><div class="spinner" aria-label="Loading"></div></div>';
    main.scrollTop = 0;
    try { await fn(page, params); } catch (e) {
      page.innerHTML = '<div class="empty-state"><div class="empty-title">Something did not load</div>' +
        '<p class="empty-text">Please check your connection and try again.</p>' +
        '<button class="btn btn-primary" data-route="home">Go Home</button></div>';
    }
    $$('#bottom-nav .nav-item').forEach((b) => {
      b.classList.toggle('active', b.dataset.route === name ||
        (name === 'devotional' && b.dataset.route === 'devotional'));
    });
  }
  function navigate(name, params) {
    let url = '#' + name;
    if (params && params.day) url += '/' + params.day;
    if (location.hash === url) render(); else location.hash = url;
  }
  window.addEventListener('hashchange', render);
  return { register, render, navigate, get current() { return current; } };
})();

/* delegated navigation for [data-route] */
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-route]');
  if (!t) return;
  if (t.dataset.introPage) {
    const url = '#intro?page=' + t.dataset.introPage;
    if (location.hash === url) Router.render(); else location.hash = url;
    return;
  }
  let url = '#' + t.dataset.route;
  if (t.dataset.day) url += '/' + t.dataset.day;
  if (t.dataset.seasonOpen) url += '?season=' + t.dataset.seasonOpen;
  if (location.hash === url) Router.render(); else location.hash = url;
});

/* ---------------- shared screen helpers ---------------- */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}
function dateStr(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
function isDone(day) { return Store.get('completedDays').includes(day); }
function isFav(day) { return Store.get('favorites').includes(day); }
function toggleDone(day) {
  const arr = Store.get('completedDays');
  const i = arr.indexOf(day);
  if (i >= 0) arr.splice(i, 1); else arr.push(day);
  Store.set('completedDays', arr);
  const dates = Store.get('completionDates');
  const today = new Date().toISOString().slice(0, 10);
  if (i < 0) dates[today] = (dates[today] || 0) + 1; else if (dates[today]) dates[today] = Math.max(0, dates[today] - 1);
  Store.set('completionDates', dates);
}
function toggleFav(day) {
  const arr = Store.get('favorites');
  const i = arr.indexOf(day);
  if (i >= 0) arr.splice(i, 1); else arr.push(day);
  Store.set('favorites', arr);
}
function streak() {
  const dates = Store.get('completionDates');
  let count = 0;
  const d = new Date();
  if (!dates[d.toISOString().slice(0, 10)]) d.setDate(d.getDate() - 1);
  while (dates[d.toISOString().slice(0, 10)]) { count++; d.setDate(d.getDate() - 1); }
  return count;
}
function wordCount(text) {
  const w = String(text || '').trim().split(/\s+/).filter(Boolean);
  return w.length === 1 && w[0] === '' ? 0 : w.length;
}
function timeAgo(ts) {
  if (!ts) return '';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 10) return 'just now';
  if (s < 60) return s + 's ago';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return new Date(ts).toLocaleDateString();
}
function autoGrow(ta) {
  ta.style.height = 'auto';
  ta.style.height = Math.max(140, ta.scrollHeight) + 'px';
}
function seasonProgress(id) {
  const done = Store.get('completedDays').filter((d) => Data.seasonForDay(d).id === id).length;
  return { done, total: 30 };
}

/* ---------------- screens ---------------- */
const Screens = {};

/* ---- home ---- */
Screens.home = async function (page) {
  const day = Store.get('currentDay') || 1;
  const { season, data } = Data.getDay(day);
  const short = seasonShort(season.title);
  const completed = Store.get('completedDays').length;
  const pct = Math.round((completed / 120) * 100);
  const dayInSeason = Data.dayInSeason(day);

  page.innerHTML =
    '<div class="home-hero">' +
      '<p class="home-greeting">📅 ' + esc(greeting()) + '</p>' +
      '<h1 class="home-date">' + esc(dateStr(new Date())) + '</h1>' +
      '<div><span class="season-badge">' + SEASON_EMOJI[season.id] + ' ' + esc(short) + '</span></div>' +
    '</div>' +

    '<div class="card today-card">' +
      '<div class="today-card-header"><span class="today-label">📖 TODAY\'S DEVOTIONAL</span>' +
      '<span class="today-progress">DAY ' + day + ' OF 120</span></div>' +
      '<p class="today-dayline">Day ' + dayInSeason + ' of 30 in ' + esc(short) + '</p>' +
      '<div class="progress-track" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
      '<h2 class="today-scripture">' + esc(data.scriptureRef) + '</h2>' +
      '<p class="today-text">"' + esc(data.scriptureText) + '"</p>' +
      '<button class="btn btn-primary btn-block" data-route="devotional" data-day="' + day + '">Read Day ' + day + ' →</button>' +
    '</div>' +

    '<h2 class="section-title text-center">Quick Wellness Tools</h2>' +
    '<div class="tools-grid mb-6">' +
      '<button class="tool-card tool-meditation" id="tool-meditation"><span class="tool-icon">⏱️</span><span class="tool-name">5 Min Meditation</span><span class="tool-sub">Timed quiet reflection</span></button>' +
      '<button class="tool-card tool-breathe" id="tool-breathe"><span class="tool-icon">🌬️</span><span class="tool-name">Breathe</span><span class="tool-sub">Box pattern 4-4-4-4</span></button>' +
    '</div>' +

    '<h2 class="section-title text-center">Your Journey</h2>' +
    '<div class="stack">' +
      Data.seasons().map((s) => {
        const p = seasonProgress(s.id);
        const sp = Math.round((p.done / p.total) * 100);
        const dotColor = { winter: '#4A90A4', spring: '#8BC34A', summer: '#FFA726', autumn: '#D32F2F' }[s.id];
        return '<button class="card season-journey-card" data-route="contents" data-season-open="' + s.id + '" style="width:100%;text-align:left">' +
          '<span class="season-dot" style="background:' + dotColor + '"></span>' +
          '<span class="season-journey-info"><span class="season-journey-name">' + esc(seasonShort(s.title)) + '</span><br>' +
          '<span class="season-journey-count">' + p.done + '/' + p.total + ' complete</span></span>' +
          '<span class="season-journey-count">' + sp + '%</span>' +
        '</button>';
      }).join('') +
    '</div>';

  $('#tool-meditation', page).addEventListener('click', Practice.meditation);
  $('#tool-breathe', page).addEventListener('click', Practice.breathing);
};

/* ---- intro pages ---- */
Screens.intro = async function (page, params) {
  const fm = Data.book.frontMatter;
  const sub = params.page || 'toc';
  if (sub === 'toc') {
    page.innerHTML =
      '<h1 class="page-title">Introduction</h1>' +
      '<p class="page-subtitle">Begin your 120-day journey</p>' +
      '<div class="card text-center mb-6"><img src="assets/images/book-cover.webp" alt="Spiritual Seasons book cover" style="border-radius:12px;max-height:280px;width:auto;margin:0 auto"></div>' +
      '<h2 class="section-title">Getting Started</h2>' +
      '<div class="stack">' +
      '<button class="card season-journey-card" data-route="intro" data-intro-page="introduction" style="width:100%;text-align:left"><span class="season-journey-info"><span class="season-journey-name">Welcome</span><br><span class="season-journey-count">What this journey is about</span></span><span aria-hidden="true">→</span></button>' +
      '<button class="card season-journey-card" data-route="intro" data-intro-page="howToUse" style="width:100%;text-align:left"><span class="season-journey-info"><span class="season-journey-name">How to Use This Book</span><br><span class="season-journey-count">A simple daily rhythm</span></span><span aria-hidden="true">→</span></button>' +
      '<button class="card season-journey-card" data-route="contents" style="width:100%;text-align:left"><span class="season-journey-info"><span class="season-journey-name">Table of Contents</span><br><span class="season-journey-count">Browse all 120 days</span></span><span aria-hidden="true">→</span></button>' +
      '</div>';
    return;
  }
  if (sub === 'introduction') {
    const intro = fm.introduction;
    page.innerHTML =
      '<h1 class="page-title">Welcome</h1><p class="page-subtitle">An invitation to the journey</p>' +
      '<div class="card stack-lg"><div class="prose"><p>' + esc(intro.text) + '</p></div>' +
      '<div class="reflection-card" style="margin:0"><div class="reflection-label">SCRIPTURE</div>' +
      '<p class="reflection-text" style="font-size:var(--text-lg)">' + esc(intro.scripture.text) + '</p>' +
      '<p class="text-secondary mt-4">From ' + esc(intro.scripture.reference) + '</p></div>' +
      '<div><h2 class="section-title">Purpose</h2><div class="prose"><p>' + esc(intro.purpose) + '</p></div></div>' +
      '<div><h2 class="section-title">The Four Seasons</h2><div class="prose"><p>' + esc(intro.structure.intro) + '</p></div>' +
      '<div class="stack mt-4">' + intro.structure.seasons.map((s) =>
        '<div><strong>' + esc(s.title) + '</strong><p class="text-secondary">' + esc(s.description) + '</p></div>').join('') + '</div></div>' +
      '<div><h2 class="section-title">Each Day Includes</h2><div class="prose"><p>' + esc(intro.dailyFormat.intro) + '</p><ul style="padding-left:1.25rem;margin-top:.5rem">' +
      intro.dailyFormat.elements.map((e) => '<li>' + esc(e) + '</li>').join('') + '</ul></div></div>' +
      '<div class="prose"><p>' + esc(intro.closing) + '</p></div>' +
      '<button class="btn btn-primary btn-block" data-route="contents">Browse the 120 Days →</button></div>';
    return;
  }
  if (sub === 'howToUse') {
    const htu = fm.howToUse;
    page.innerHTML =
      '<h1 class="page-title">' + esc(htu.title) + '</h1><p class="page-subtitle">A simple daily rhythm</p>' +
      '<div class="card stack">' +
      htu.steps.map((st, i) =>
        '<div style="display:flex;gap:var(--space-4)"><div class="season-dot" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:var(--season-light);color:var(--season-dark);font-weight:700">' + (i + 1) + '</div>' +
        '<div><strong>' + esc(st.title) + '</strong><p class="text-secondary">' + esc(st.description) + '</p></div></div>').join('') +
      '</div>' +
      '<button class="btn btn-primary btn-block mt-6" data-route="devotional" data-day="' + (Store.get('currentDay') || 1) + '">Start Day ' + (Store.get('currentDay') || 1) + ' →</button>';
    return;
  }
  location.hash = '#intro';
};

/* ---- contents ---- */
Screens.contents = async function (page) {
  const openSeason = (location.hash.match(/season=([a-z]+)/) || [])[1];
  let html = '<h1 class="page-title">Table of Contents</h1><p class="page-subtitle">Navigate your devotional journey</p>';

  html += '<div class="toc-season' + (openSeason === 'intro' ? ' open' : '') + '" data-season-acc="intro">' +
    '<button class="toc-season-head" style="background:var(--bg-secondary)" aria-expanded="' + (openSeason === 'intro') + '">' +
    '<span class="toc-season-text"><span class="toc-season-title">Introduction</span></span>' +
    '<svg class="toc-season-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></button>' +
    '<div class="toc-season-body"><div class="stack">' +
    '<button class="btn btn-secondary btn-block" data-route="intro" data-intro-page="introduction">Welcome</button>' +
    '<button class="btn btn-secondary btn-block" data-route="intro" data-intro-page="howToUse">How to Use This Book</button>' +
    '</div></div></div>';

  Data.seasons().forEach((s) => {
    const p = seasonProgress(s.id);
    const open = openSeason === s.id;
    const light = { winter: '#E3F2FD', spring: '#DCEDC8', summer: '#FFE0B2', autumn: '#FFCDD2' }[s.id];
    const dark = { winter: '#2E6171', spring: '#558B2F', summer: '#E65100', autumn: '#B71C1C' }[s.id];
    const startDay = SEASON_START[s.id];
    const currentDay = Store.get('currentDay') || 1;
    const overview = (Data.book.seasonalOverviews && Data.book.seasonalOverviews[s.id] && Data.book.seasonalOverviews[s.id].introduction) || '';
    let cells = '';
    for (let d = 0; d < 30; d++) {
      const day = startDay + d;
      const cls = 'day-cell' + (isDone(day) ? ' done' : '') + (day === currentDay ? ' current' : '');
      cells += '<button class="' + cls + '" data-route="devotional" data-day="' + day + '" aria-label="Day ' + day + (isDone(day) ? ', completed' : '') + '">' +
        (isDone(day) ? '✓' : (d + 1)) + '</button>';
    }
    html += '<div class="toc-season' + (open ? ' open' : '') + '" data-season-acc="' + s.id + '">' +
      '<button class="toc-season-head" style="background:' + light + '" aria-expanded="' + open + '">' +
      '<span class="toc-season-text"><span class="toc-season-title" style="color:' + dark + '">' + esc(s.title) + '</span>' +
      '<span class="toc-season-count">' + p.done + '/' + p.total + ' complete</span></span>' +
      '<svg class="toc-season-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></button>' +
      '<div class="toc-season-body">' +
      (overview ? '<p class="toc-overview">' + esc(overview) + '</p>' : '') +
      '<div class="days-grid">' + cells + '</div></div></div>';
  });

  page.innerHTML = html;
  $$('[data-season-acc] > .toc-season-head', page).forEach((head) => {
    head.addEventListener('click', () => {
      const acc = head.parentElement;
      const wasOpen = acc.classList.contains('open');
      $$('[data-season-acc]', page).forEach((a) => { a.classList.remove('open'); $('.toc-season-head', a).setAttribute('aria-expanded', 'false'); });
      if (!wasOpen) { acc.classList.add('open'); head.setAttribute('aria-expanded', 'true'); }
    });
  });
};

/* ---- devotional reader ---- */
Screens.devotional = async function (page, params) {
  let day = parseInt(params.day, 10);
  if (!day || day < 1 || day > 120) day = Store.get('currentDay') || 1;
  const { season, data } = Data.getDay(day);
  const short = seasonShort(season.title);
  const dayInSeason = Data.dayInSeason(day);
  const journal = Store.get('journal')[day] || { text: '', updatedAt: null };
  const done = isDone(day);
  const fav = isFav(day);
  const version = Store.getSetting('translation') || 'NLT';
  const bibleUrl = 'https://www.biblegateway.com/passage/?search=' + encodeURIComponent(data.scriptureRef) + '&version=' + encodeURIComponent(version);

  page.innerHTML =
    '<div class="devotional-top">' +
      '<span class="devotional-badge">' + esc(short).toUpperCase() + ' • DAY ' + dayInSeason + ' OF 30</span>' +
      '<h1 class="scripture-ref">' + esc(data.scriptureRef) + '</h1>' +
      '<p class="scripture-text">"' + esc(data.scriptureText) + '"</p>' +
      '<div class="scripture-actions">' +
        '<button class="scripture-action" id="listen-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg><span>Listen</span></button>' +
        '<a class="scripture-action" href="' + bibleUrl + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14L21 3"/></svg><span>Read Full Chapter</span></a>' +
      '</div>' +
      '<div class="devotional-divider" aria-hidden="true"></div>' +
    '</div>' +

    '<div class="reflection-card">' +
      '<div class="reflection-label">TODAY\'S REFLECTION</div>' +
      '<p class="reflection-text">' + esc(data.prompt) + '</p>' +
    '</div>' +

    '<div class="journal-head"><h2 class="journal-title">Your Journal Entry</h2>' +
    '<span class="journal-words" id="journal-words">' + wordCount(journal.text) + ' words</span></div>' +
    '<textarea class="journal-area" id="journal-area" placeholder="Write your reflections here. Your entries are automatically saved as you type." aria-label="Journal entry for day ' + day + '">' + esc(journal.text) + '</textarea>' +
    '<p class="journal-saved" id="journal-saved">' + (journal.updatedAt ? 'Saved ' + esc(timeAgo(journal.updatedAt)) : '') + '</p>' +

    '<div class="day-actions">' +
      '<button class="btn btn-favorite' + (fav ? ' active' : '') + '" id="fav-btn" aria-pressed="' + fav + '">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="' + (fav ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>' +
        '<span>' + (fav ? 'Favorited' : 'Favorite') + '</span></button>' +
      '<button class="btn ' + (done ? 'btn-secondary' : 'btn-primary') + '" id="done-btn" aria-pressed="' + done + '">' +
        '<span>' + (done ? '✓ Completed' : 'Mark Complete') + '</span></button>' +
    '</div>' +

    '<div class="day-nav">' +
      '<button class="btn btn-secondary" id="prev-day"' + (day <= 1 ? ' disabled' : '') + '>← Day ' + (day - 1) + '</button>' +
      '<button class="btn btn-secondary" id="next-day"' + (day >= 120 ? ' disabled' : '') + '>Day ' + (day + 1) + ' →</button>' +
    '</div>';

  const ta = $('#journal-area', page);
  autoGrow(ta);
  const wordsEl = $('#journal-words', page);
  const savedEl = $('#journal-saved', page);
  const persist = debounce(() => {
    const all = Store.get('journal');
    all[day] = { text: ta.value, updatedAt: Date.now() };
    Store.set('journal', all);
    savedEl.textContent = 'Saved ' + timeAgo(Date.now());
  }, 600);
  ta.addEventListener('input', () => {
    autoGrow(ta);
    wordsEl.textContent = wordCount(ta.value) + ' words';
    savedEl.textContent = 'Saving…';
    persist();
  });

  $('#listen-btn', page).addEventListener('click', () => {
    TTS.speak(data.scriptureRef + '. ' + data.scriptureText);
    toast('Reading aloud');
  });
  $('#fav-btn', page).addEventListener('click', (e) => {
    toggleFav(day);
    Router.render();
    toast(isFav(day) ? 'Added to favorites' : 'Removed from favorites');
  });
  $('#done-btn', page).addEventListener('click', () => {
    toggleDone(day);
    if (isDone(day) && day < 120) Store.set('currentDay', day + 1);
    Router.render();
    toast(isDone(day) ? 'Day ' + day + ' complete' : 'Marked incomplete');
  });
  const prev = $('#prev-day', page), next = $('#next-day', page);
  if (day > 1) prev.addEventListener('click', () => Router.navigate('devotional', { day: day - 1 }));
  if (day < 120) next.addEventListener('click', () => Router.navigate('devotional', { day: day + 1 }));
};

/* ---- quiz ---- */
const QuizFlow = (() => {
  let questions = [], idx = 0, answers = {};
  function start() { questions = Data.flatQuestions(); idx = 0; answers = {}; }
  function answer(v) { answers[questions[idx].id] = v; }
  function scores() {
    const s = { winter: 0, spring: 0, summer: 0, autumn: 0 };
    questions.forEach((q) => { s[q.seasonId] += answers[q.id] || 0; });
    return s;
  }
  function winners() {
    const s = scores();
    const max = Math.max(s.winter, s.spring, s.summer, s.autumn);
    return Object.keys(s).filter((k) => s[k] === max);
  }
  return { start, answer, scores, winners,
    get questions() { return questions; }, get idx() { return idx; }, set idx(v) { idx = v; },
    get answers() { return answers; } };
})();

Screens.quiz = async function (page, params) {
  const stage = params.stage || 'welcome';

  if (stage === 'welcome') {
    const qd = Data.quiz;
    page.innerHTML =
      '<div class="quiz-wrap text-center">' +
      '<div style="font-size:3.5rem;margin-bottom:var(--space-4)">🌱</div>' +
      '<h1 class="page-title">' + esc(qd.title) + '</h1>' +
      '<p class="page-subtitle">' + esc(qd.description) + '</p>' +
      '<div class="card text-center mb-6"><p class="prose">' + esc(qd.instructions) + '</p>' +
      '<div class="quiz-scale-legend">' +
      Object.entries(qd.scale.labels).map(([k, v]) => '<span>' + k + ' = ' + esc(v) + '</span>').join('') +
      '</div></div>' +
      '<button class="btn btn-primary btn-block" id="start-quiz">Discover Your Season →</button></div>';
    $('#start-quiz', page).addEventListener('click', () => {
      QuizFlow.start();
      location.hash = '#quiz?stage=question';
    });
    return;
  }

  if (stage === 'question') {
    if (!QuizFlow.questions.length) { location.hash = '#quiz'; return; }
    const q = QuizFlow.questions[QuizFlow.idx];
    const total = QuizFlow.questions.length;
    const pct = Math.round(((QuizFlow.idx + 1) / total) * 100);
    const labels = Data.quiz.scale.labels;
    const sel = QuizFlow.answers[q.id];
    page.innerHTML =
      '<div class="quiz-wrap">' +
      '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="quiz-progress-meta"><span>Question ' + (QuizFlow.idx + 1) + ' of ' + total + '</span><span>' + pct + '% complete</span></div>' +
      '<p class="quiz-question-text">"' + esc(q.text) + '"</p>' +
      '<div class="quiz-options" role="radiogroup" aria-label="Your answer">' +
      Object.entries(labels).map(([v, label]) =>
        '<button class="quiz-option' + (sel === parseInt(v, 10) ? ' selected' : '') + '" data-val="' + v + '" role="radio" aria-checked="' + (sel === parseInt(v, 10)) + '">' +
        '<span class="quiz-radio" aria-hidden="true"></span><span>' + esc(label) + '</span></button>').join('') +
      '</div>' +
      '<div class="quiz-nav">' +
      '<button class="btn btn-secondary" id="quiz-prev"' + (QuizFlow.idx === 0 ? ' disabled' : '') + '>← Previous</button>' +
      '<button class="btn btn-primary" id="quiz-next"' + (sel == null ? ' disabled' : '') + '>' +
      (QuizFlow.idx === total - 1 ? 'See Results →' : 'Next →') + '</button>' +
      '</div></div>';
    $$('.quiz-option', page).forEach((b) => b.addEventListener('click', () => {
      QuizFlow.answer(parseInt(b.dataset.val, 10));
      Router.render();
    }));
    if (QuizFlow.idx > 0) $('#quiz-prev', page).addEventListener('click', () => { QuizFlow.idx--; Router.render(); });
    const nextBtn = $('#quiz-next', page);
    if (sel != null) nextBtn.addEventListener('click', () => {
      if (QuizFlow.idx === total - 1) location.hash = '#quiz?stage=results';
      else { QuizFlow.idx++; Router.render(); }
    });
    return;
  }

  if (stage === 'results') {
    const w = QuizFlow.winners();
    if (!w.length) { location.hash = '#quiz'; return; }
    const results = Data.quiz.results;
    const seasonInfo = (id) => Data.quiz.seasons.find((s) => s.id === id);
    const choose = (id) => {
      Store.set('quizResult', { season: id, at: Date.now() });
      Store.set('currentDay', SEASON_START[id]);
      applySeasonColor();
      toast('Your journey begins in ' + seasonShort(Data.seasonById(id).title));
      Router.navigate('devotional', { day: SEASON_START[id] });
    };
    if (w.length === 1) {
      const id = w[0], r = results[id], info = seasonInfo(id);
      page.innerHTML =
        '<div class="quiz-wrap"><div class="card result-card">' +
        '<div style="font-size:3.5rem">' + SEASON_EMOJI[id] + '</div>' +
        '<h1 class="result-season">' + esc(r.title) + '</h1>' +
        '<p class="result-message">' + esc(r.message) + '</p>' +
        '<p class="result-encouragement">"' + esc(r.encouragement) + '"</p>' +
        '<button class="btn btn-primary btn-block" id="begin-btn">Begin in ' + esc(info.shortTitle) + ' →</button>' +
        '<button class="btn btn-ghost btn-block mt-4" id="retake-btn">Retake the Quiz</button>' +
        '</div></div>';
      $('#begin-btn', page).addEventListener('click', () => choose(id));
      $('#retake-btn', page).addEventListener('click', () => { location.hash = '#quiz'; });
    } else {
      page.innerHTML =
        '<div class="quiz-wrap text-center">' +
        '<div style="font-size:3rem;margin-bottom:var(--space-4)">✨</div>' +
        '<h1 class="page-title">You\'re Between Seasons</h1>' +
        '<p class="page-subtitle">Your responses point to more than one season. That is completely normal: spiritual life does not always fit neatly into one category.</p>' +
        '<h2 class="section-title">You scored equally for:</h2>' +
        w.map((id) => {
          const info = seasonInfo(id), r = results[id];
          return '<div class="card tie-card"><div class="fav-meta">' + SEASON_EMOJI[id] + ' ' + esc(info.shortTitle) + '</div>' +
            '<h3 class="fav-ref">' + esc(info.title) + '</h3>' +
            '<p class="fav-snippet" style="-webkit-line-clamp:4">' + esc(info.description) + '</p>' +
            '<button class="btn btn-primary btn-block mt-4" data-choose="' + id + '">Choose This Season</button></div>';
        }).join('') +
        '<button class="btn btn-ghost btn-block" id="retake-btn">Retake the Quiz</button></div>';
      $$('[data-choose]', page).forEach((b) => b.addEventListener('click', () => choose(b.dataset.choose)));
      $('#retake-btn', page).addEventListener('click', () => { location.hash = '#quiz'; });
    }
    return;
  }
  location.hash = '#quiz';
};

/* ---- favorites ---- */
Screens.favorites = async function (page) {
  const favs = Store.get('favorites').slice().sort((a, b) => a - b);
  let html = '<h1 class="page-title">Favorites</h1><p class="page-subtitle">' + favs.length + ' saved devotional' + (favs.length === 1 ? '' : 's') + '</p>';
  if (!favs.length) {
    html += '<div class="empty-state"><div class="empty-icon">🤍</div>' +
      '<h2 class="empty-title">No Favorites Yet</h2>' +
      '<p class="empty-text">Mark devotionals as favorites to find them here quickly.</p>' +
      '<button class="btn btn-primary" data-route="contents">Browse Devotionals</button></div>';
  } else {
    html += favs.map((day) => {
      const { season, data } = Data.getDay(day);
      return '<div class="card fav-card"><div class="fav-meta">' + SEASON_EMOJI[season.id] + ' ' + esc(seasonShort(season.title)).toUpperCase() + ' • DAY ' + Data.dayInSeason(day) + ' OF 30</div>' +
        '<h3 class="fav-ref">' + esc(data.scriptureRef) + '</h3>' +
        '<p class="fav-snippet">"' + esc(data.scriptureText) + '"</p>' +
        '<div class="fav-actions"><button class="btn btn-primary btn-sm" data-route="devotional" data-day="' + day + '">Read</button>' +
        '<button class="btn btn-secondary btn-sm" data-unfav="' + day + '">Remove</button></div></div>';
    }).join('');
  }
  page.innerHTML = html;
  $$('[data-unfav]', page).forEach((b) => b.addEventListener('click', () => {
    toggleFav(parseInt(b.dataset.unfav, 10));
    Router.render();
    toast('Removed from favorites');
  }));
};

/* ---- progress ---- */
Screens.progress = async function (page) {
  const completed = Store.get('completedDays').length;
  const pct = Math.round((completed / 120) * 100);
  const remaining = 120 - completed;
  const st = streak();
  const R = 70, C = 2 * Math.PI * R;
  const dates = Store.get('completionDates');
  const weekDots = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    weekDots.push('<span class="week-dot' + (dates[d.toISOString().slice(0, 10)] ? ' done' : '') + '" title="' + d.toLocaleDateString() + '"></span>');
  }
  page.innerHTML =
    '<h1 class="page-title">Your Progress</h1><p class="page-subtitle">Every day counts</p>' +

    '<div class="card mb-6"><h2 class="section-title">Overall Journey</h2>' +
    '<div class="progress-ring-wrap">' +
    '<svg class="progress-ring" viewBox="0 0 160 160" role="img" aria-label="' + pct + '% complete">' +
    '<circle cx="80" cy="80" r="' + R + '" fill="none" stroke="var(--border-primary)" stroke-width="14"/>' +
    '<circle cx="80" cy="80" r="' + R + '" fill="none" stroke="var(--season-primary)" stroke-width="14" stroke-linecap="round" ' +
    'stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - pct / 100)).toFixed(1) + '" transform="rotate(-90 80 80)"/>' +
    '<text x="80" y="76" text-anchor="middle" font-size="28" font-weight="700" fill="var(--text-primary)">' + pct + '%</text>' +
    '<text x="80" y="100" text-anchor="middle" font-size="13" fill="var(--text-secondary)">Complete</text></svg>' +
    '<div class="progress-stats mt-4">' +
    '<div class="progress-stat"><div class="progress-stat-value">' + completed + '</div><div class="progress-stat-label">Days Completed</div></div>' +
    '<div class="progress-stat"><div class="progress-stat-value">' + remaining + '</div><div class="progress-stat-label">Days Remaining</div></div>' +
    '</div></div></div>' +

    '<div class="card mb-6"><h2 class="section-title">🔥 Streak</h2>' +
    '<div class="text-center"><div class="streak-flame" aria-hidden="true">🔥</div>' +
    '<div class="progress-stat-value">' + st + ' day' + (st === 1 ? '' : 's') + '</div>' +
    '<p class="text-secondary">Complete a devotional each day to grow your streak.</p>' +
    '<div class="week-dots">' + weekDots.join('') + '</div></div></div>' +

    '<div class="card mb-6"><h2 class="section-title">By Season</h2>' +
    Data.seasons().map((s) => {
      const p = seasonProgress(s.id);
      const sp = Math.round((p.done / p.total) * 100);
      return '<div class="season-bar-row"><div class="season-bar-head"><strong>' + SEASON_EMOJI[s.id] + ' ' + esc(seasonShort(s.title)) + '</strong><span>' + p.done + '/' + p.total + '</span></div>' +
        '<div class="progress-track" style="margin:0"><div class="progress-fill" style="width:' + sp + '%"></div></div></div>';
    }).join('') + '</div>' +

    '<button class="btn btn-secondary btn-block" data-route="reflections">Weekly Reflections →</button>';
};

/* ---- weekly reflections ---- */
function reflectionWeeks() {
  const weeks = [];
  for (let w = 0; w < 18; w++) {
    const start = w * 7 + 1, end = Math.min(120, start + 6);
    const done = Store.get('completedDays').filter((d) => d >= start && d <= end).length;
    if (done > 0 || w === 0) weeks.push({ week: w + 1, start, end, done });
  }
  return weeks;
}
const REFLECTION_PROMPTS = [
  'What stood out to you most this week?',
  'Where did you notice God at work in ordinary moments?',
  'What is one thing you want to carry into next week?',
];
Screens.reflections = async function (page) {
  const weeks = reflectionWeeks();
  const saved = Store.get('reflections');
  const hasAny = weeks.some((w) => saved[w.week]);
  let html = '<h1 class="page-title">Weekly Reflections</h1>' +
    '<p class="page-subtitle">Pause and look back every seven days</p>';
  if (!hasAny && !Store.get('completedDays').length) {
    html += '<div class="empty-state"><div class="empty-icon">📝</div>' +
      '<h2 class="empty-title">No Reflections Yet</h2>' +
      '<p class="empty-text">Weekly reflections will appear here as you complete each week of devotions. You will be prompted to reflect after every 7 days you complete.</p>' +
      '<button class="btn btn-primary" data-route="devotional" data-day="' + (Store.get('currentDay') || 1) + '">Start Reading</button></div>';
  } else {
    html += '<div class="stack">' + weeks.map((w) => {
      const r = saved[w.week] || { text: '', updatedAt: null };
      const prompt = REFLECTION_PROMPTS[(w.week - 1) % REFLECTION_PROMPTS.length];
      return '<div class="card"><div class="fav-meta">WEEK ' + w.week + ' • DAYS ' + w.start + '–' + w.end + ' • ' + w.done + '/7 COMPLETE</div>' +
        '<p class="reflection-text" style="font-size:var(--text-lg);margin-bottom:var(--space-3)">' + esc(prompt) + '</p>' +
        '<textarea class="journal-area" data-week="' + w.week + '" placeholder="Write your weekly reflection…" aria-label="Reflection for week ' + w.week + '">' + esc(r.text) + '</textarea>' +
        '<p class="journal-saved" data-saved="' + w.week + '">' + (r.updatedAt ? 'Saved ' + esc(timeAgo(r.updatedAt)) : '') + '</p></div>';
    }).join('') + '</div>';
  }
  page.innerHTML = html;
  const persist = debounce((ta) => {
    const w = ta.dataset.week;
    const all = Store.get('reflections');
    all[w] = { text: ta.value, updatedAt: Date.now() };
    Store.set('reflections', all);
    const s = $('[data-saved="' + w + '"]', page);
    if (s) s.textContent = 'Saved ' + timeAgo(Date.now());
  }, 600);
  $$('textarea[data-week]', page).forEach((ta) => {
    autoGrow(ta);
    ta.addEventListener('input', () => { autoGrow(ta); persist(ta); });
  });
};

/* ---- search ---- */
Screens.search = async function (page, params) {
  const q = params.q || '';
  const seasonFilter = params.season || 'all';
  const favOnly = params.fav === '1';
  const doneOnly = params.done === '1';
  let html =
    '<h1 class="page-title">Search</h1><p class="page-subtitle">Find devotions, journal entries, and reflections</p>' +
    '<input class="search-input" id="search-input" type="search" placeholder="Search for scripture, topics, or keywords…" value="' + esc(q) + '" aria-label="Search">' +
    '<div class="filter-row"><select class="select" id="search-season" aria-label="Filter by season">' +
    '<option value="all">All Seasons</option>' +
    Data.seasons().map((s) => '<option value="' + s.id + '"' + (seasonFilter === s.id ? ' selected' : '') + '>' + esc(seasonShort(s.title)) + '</option>').join('') +
    '</select></div>' +
    '<div class="chip-row">' +
    '<button class="chip' + (favOnly ? ' active' : '') + '" id="chip-fav">🤍 Favorites</button>' +
    '<button class="chip' + (doneOnly ? ' active' : '') + '" id="chip-done">✓ Completed</button>' +
    '</div><div id="search-results"></div>';
  page.innerHTML = html;

  const input = $('#search-input', page);
  const runSearch = () => {
    const term = input.value.trim().toLowerCase();
    const season = $('#search-season', page).value;
    const results = [];
    if (term.length >= 2) {
      for (let day = 1; day <= 120; day++) {
        const { season: s, data } = Data.getDay(day);
        if (season !== 'all' && s.id !== season) continue;
        if (favOnly && !isFav(day)) continue;
        if (doneOnly && !isDone(day)) continue;
        const hay = (data.scriptureRef + ' ' + data.scriptureText + ' ' + data.prompt).toLowerCase();
        if (hay.includes(term)) {
          const idx = hay.indexOf(term);
          results.push({ type: 'Devotional', day, title: 'Day ' + day + ': ' + data.scriptureRef,
            snippet: data.scriptureText.slice(Math.max(0, idx - 30), idx + 90) });
        }
      }
      Object.entries(Store.get('journal')).forEach(([day, j]) => {
        if (!j.text || !j.text.toLowerCase().includes(term)) return;
        const d = parseInt(day, 10);
        const { season: s } = Data.getDay(d);
        if (season !== 'all' && s.id !== season) return;
        results.push({ type: 'Journal', day: d, title: 'Journal: Day ' + d, snippet: j.text.slice(0, 120) });
      });
      Object.entries(Store.get('reflections')).forEach(([wk, r]) => {
        if (!r.text || !r.text.toLowerCase().includes(term)) return;
        results.push({ type: 'Reflection', day: null, title: 'Weekly Reflection: Week ' + wk, snippet: r.text.slice(0, 120) });
      });
    }
    const box = $('#search-results', page);
    if (!term) { box.innerHTML = ''; return; }
    if (!results.length) {
      box.innerHTML = '<div class="empty-state"><div class="empty-title">No matches</div><p class="empty-text">Try a different word or phrase.</p></div>';
      return;
    }
    box.innerHTML = '<p class="text-secondary mb-4">' + results.length + ' result' + (results.length === 1 ? '' : 's') + '</p>' +
      results.slice(0, 40).map((r) =>
        '<button class="card search-result"' + (r.day ? ' data-route="devotional" data-day="' + r.day + '"' : ' data-route="reflections"') + '>' +
        '<div class="search-result-type">' + esc(r.type) + '</div>' +
        '<div class="search-result-title">' + esc(r.title) + '</div>' +
        '<div class="search-result-snippet">' + esc(r.snippet) + '…</div></button>').join('');
  };
  const syncHash = () => {
    const parts = [];
    if (input.value.trim()) parts.push('q=' + encodeURIComponent(input.value.trim()));
    const season = $('#search-season', page).value;
    if (season !== 'all') parts.push('season=' + season);
    if (favOnly) parts.push('fav=1');
    if (doneOnly) parts.push('done=1');
    const url = '#search' + (parts.length ? '?' + parts.join('&') : '');
    history.replaceState(null, '', url);
  };
  input.addEventListener('input', debounce(() => { runSearch(); syncHash(); }, 300));
  $('#search-season', page).addEventListener('change', () => { runSearch(); syncHash(); });
  $('#chip-fav', page).addEventListener('click', () => {
    location.hash = '#search' + (input.value.trim() ? '?q=' + encodeURIComponent(input.value.trim()) : '') +
      (favOnly ? '' : (input.value.trim() ? '&' : '?') + 'fav=1');
  });
  $('#chip-done', page).addEventListener('click', () => {
    location.hash = '#search' + (input.value.trim() ? '?q=' + encodeURIComponent(input.value.trim()) : '') +
      (doneOnly ? '' : (input.value.trim() ? '&' : '?') + 'done=1');
  });
  if (q) runSearch();
};

/* ---- settings ---- */
Screens.settings = async function (page) {
  const s = Store.all().settings;
  const opt = (val, cur, label) => '<option value="' + val + '"' + (val === cur ? ' selected' : '') + '>' + label + '</option>';
  page.innerHTML =
    '<h1 class="page-title">Settings</h1><p class="page-subtitle">Customize your devotional experience</p>' +

    '<div class="setting-group-title">Display and Reading</div>' +
    '<div class="card"><div class="setting-row"><div><div class="setting-label">Theme</div><div class="setting-sub">Light, dark, or automatic</div></div>' +
    '<select class="select" id="set-theme">' + opt('light', s.theme, 'Light') + opt('dark', s.theme, 'Dark') + opt('auto', s.theme, 'Auto') + '</select></div>' +
    '<div class="setting-row"><div><div class="setting-label">Font Size</div><div class="setting-sub">Adjust text size for readability</div></div>' +
    '<select class="select" id="set-fontsize">' + opt('small', s.fontSize, 'Small') + opt('medium', s.fontSize, 'Medium') + opt('large', s.fontSize, 'Large') + '</select></div>' +
    '<div class="setting-row"><div><div class="setting-label">Line Spacing</div><div class="setting-sub">Space between lines of text</div></div>' +
    '<select class="select" id="set-linespacing">' + opt('compact', s.lineSpacing, 'Compact') + opt('normal', s.lineSpacing, 'Normal') + opt('relaxed', s.lineSpacing, 'Relaxed') + '</select></div>' +
    '<div class="setting-row"><div><div class="setting-label">Bible Translation</div><div class="setting-sub">Preferred version for scripture links</div></div>' +
    '<select class="select" id="set-translation">' + ['NLT', 'NIV', 'ESV', 'KJV', 'MSG'].map((t) => opt(t, s.translation, t)).join('') + '</select></div>' +
    '<div class="setting-row"><div><div class="setting-label">Season Colors</div><div class="setting-sub">Color theme for your current season</div></div>' +
    '<select class="select" id="set-seasoncolor">' + opt('auto', s.seasonColor, 'Auto (Follow Journey)') +
    Data.seasons().map((sn) => opt(sn.id, s.seasonColor, seasonShort(sn.title))).join('') + '</select></div>' +
    '<div class="setting-row"><div><div class="setting-label">Reading Speed</div><div class="setting-sub">Pace for Listen-along audio</div></div>' +
    '<select class="select" id="set-readingspeed">' + opt('slow', s.readingSpeed, 'Slow') + opt('normal', s.readingSpeed, 'Normal') + opt('fast', s.readingSpeed, 'Fast') + '</select></div></div>' +

    '<div class="setting-group-title">Practice</div>' +
    '<div class="card"><div class="setting-row"><div><div class="setting-label">Chime sounds</div><div class="setting-sub">Play a chime when the meditation timer ends</div></div>' +
    '<label class="toggle"><input type="checkbox" id="set-chime"' + (s.chime ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
    '<div class="setting-row"><div><div class="setting-label">App tour</div><div class="setting-sub">Replay the guided tour</div></div>' +
    '<button class="btn btn-secondary btn-sm" id="replay-tour">Start Tour</button></div></div>' +

    '<div class="setting-group-title">Your Data</div>' +
    '<div class="card"><div class="setting-row"><div><div class="setting-label">Export data</div><div class="setting-sub">Download journal, progress, and settings as JSON</div></div>' +
    '<button class="btn btn-secondary btn-sm" id="export-json">Export</button></div>' +
    '<div class="setting-row"><div><div class="setting-label">Print journal</div><div class="setting-sub">Open a printable view of all entries</div></div>' +
    '<button class="btn btn-secondary btn-sm" id="print-journal">Print</button></div>' +
    '<div class="setting-row"><div><div class="setting-label">Privacy</div><div class="setting-sub">See what is stored on this device</div></div>' +
    '<button class="btn btn-secondary btn-sm" data-route="privacy">View</button></div>' +
    '<div class="setting-row"><div><div class="setting-label">Reset everything</div><div class="setting-sub">Clear all journal entries, progress, and settings</div></div>' +
    '<button class="btn btn-secondary btn-sm" id="reset-all" style="color:#D32F2F;border-color:#D32F2F">Reset</button></div></div>' +

    '<div class="setting-group-title">About</div>' +
    '<div class="card"><p class="text-secondary">Spiritual Seasons v2: a 120-day devotional journey through Winter, Spring, Summer, and Autumn.</p>' +
    '<p class="text-secondary mt-4">Devotional content by Dr. Jacqueline Ghee, MSW, MPCC, DMIN. App built by Hans Sai.</p></div>';

  $('#set-theme', page).addEventListener('change', (e) => Store.setSetting('theme', e.target.value));
  $('#set-fontsize', page).addEventListener('change', (e) => Store.setSetting('fontSize', e.target.value));
  $('#set-linespacing', page).addEventListener('change', (e) => Store.setSetting('lineSpacing', e.target.value));
  $('#set-translation', page).addEventListener('change', (e) => Store.setSetting('translation', e.target.value));
  $('#set-seasoncolor', page).addEventListener('change', (e) => Store.setSetting('seasonColor', e.target.value));
  $('#set-readingspeed', page).addEventListener('change', (e) => Store.setSetting('readingSpeed', e.target.value));
  $('#set-chime', page).addEventListener('change', (e) => Store.setSetting('chime', e.target.checked));
  $('#replay-tour', page).addEventListener('click', () => Onboarding.startTour());
  $('#export-json', page).addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(Store.all(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'spiritual-seasons-data.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('Data exported');
  });
  $('#print-journal', page).addEventListener('click', () => {
    const w = window.open('', '_blank');
    if (!w) { toast('Pop-up blocked: allow pop-ups to print'); return; }
    const journal = Store.get('journal');
    const days = Object.keys(journal).map(Number).sort((a, b) => a - b).filter((d) => journal[d].text.trim());
    w.document.write('<html><head><title>My Spiritual Seasons Journal</title><style>body{font-family:Georgia,serif;max-width:40rem;margin:2rem auto;line-height:1.7;padding:0 1rem}h1{text-align:center}h2{margin-top:2rem;border-bottom:1px solid #ccc;padding-bottom:.25rem}</style></head><body>');
    w.document.write('<h1>My Spiritual Seasons Journal</h1>');
    if (!days.length) w.document.write('<p>No journal entries yet.</p>');
    days.forEach((d) => {
      const { season, data } = Data.getDay(d);
      w.document.write('<h2>Day ' + d + ': ' + esc(data.scriptureRef) + ' <small>(' + esc(seasonShort(season.title)) + ')</small></h2>');
      w.document.write('<p><em>"' + esc(data.scriptureText) + '"</em></p>');
      w.document.write('<p><strong>Reflection:</strong> ' + esc(data.prompt) + '</p>');
      w.document.write('<p>' + esc(journal[d].text).replace(/\n/g, '<br>') + '</p>');
    });
    w.document.write('</body></html>');
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  });
  $('#reset-all', page).addEventListener('click', async () => {
    const ok = await Modal.confirm({
      title: 'Reset everything?',
      message: 'This clears all journal entries, favorites, progress, and settings on this device. This cannot be undone.',
      confirmText: 'Yes, reset everything', cancelText: 'Keep my data',
    });
    if (ok) { Store.reset(); applySettings(); Router.render(); toast('All data cleared'); }
  });
};

/* ---- privacy ---- */
Screens.privacy = async function (page) {
  const journalCount = Object.values(Store.get('journal')).filter((j) => j.text && j.text.trim()).length;
  const reflectionCount = Object.values(Store.get('reflections')).filter((r) => r.text && r.text.trim()).length;
  const favCount = Store.get('favorites').length;
  const doneCount = Store.get('completedDays').length;
  let bytes = 0;
  try { bytes = (localStorage.getItem('ss-v2-state') || '').length * 2; } catch (e) {}
  const kb = (bytes / 1024).toFixed(1);
  page.innerHTML =
    '<h1 class="page-title">Privacy and Data</h1><p class="page-subtitle">Manage your data and privacy settings</p>' +
    '<div class="reflection-card mb-6" style="border-left-color:var(--season-primary)">' +
    '<p style="font-weight:700;margin-bottom:var(--space-2)">🔒 Your data stays on this device</p>' +
    '<p class="text-secondary" style="font-size:var(--text-sm)">All your journal entries, progress, and reflections are stored only in your browser. Nothing is sent to any server.</p>' +
    '<p class="text-secondary mt-4" style="font-size:var(--text-sm)">📶 <strong>Works offline:</strong> all 120 devotionals are cached on your device. Once you have opened the app, you can read, journal, and track progress without an internet connection.</p></div>' +
    '<h2 class="section-title">Your Data</h2>' +
    '<div class="two-col mb-6" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)">' +
    [['📝', journalCount, 'Journal Entries'], ['💭', reflectionCount, 'Weekly Reflections'], ['🤍', favCount, 'Favorites'], ['✓', doneCount, 'Days Completed']]
      .map(([icon, val, label]) => '<div class="card text-center" style="padding:var(--space-4)"><div style="font-size:1.75rem">' + icon + '</div><div class="progress-stat-value">' + val + '</div><div class="progress-stat-label">' + label + '</div></div>').join('') +
    '</div>' +
    '<h2 class="section-title">Storage Usage</h2>' +
    '<div class="card mb-6"><div class="season-bar-head"><strong>This device</strong><span>' + kb + ' KB</span></div>' +
    '<div class="progress-track" style="margin:0"><div class="progress-fill" style="width:' + Math.min(100, (bytes / (5 * 1024 * 1024)) * 100).toFixed(2) + '%"></div></div>' +
    '<p class="text-secondary mt-4" style="font-size:var(--text-sm)">Your data uses a tiny fraction of typical browser storage (about 5 MB available).</p></div>' +
    '<button class="btn btn-secondary btn-block" data-route="settings">Back to Settings</button>';
};

/* ---------------- practice: meditation + breathing ---------------- */
const Practice = (() => {
  const PRESETS = { short: { label: '5 minutes', min: 5 }, medium: { label: '10 minutes', min: 10 }, long: { label: '20 minutes', min: 20 }, custom: { label: 'Custom', min: null } };
  let timerId = null, remaining = 0, paused = false;

  function meditation() {
    let selected = 'medium', customMin = 15;
    const body = document.createElement('div');
    body.innerHTML =
      '<div id="timer-setup"><p style="text-align:center;font-weight:600;margin-bottom:var(--space-3)">Duration</p>' +
      '<div class="preset-grid">' +
      Object.entries(PRESETS).map(([k, p]) => '<button class="preset-btn' + (k === selected ? ' selected' : '') + '" data-preset="' + k + '">' + p.label + '</button>').join('') +
      '</div>' +
      '<div id="custom-wrap" style="display:none;margin-bottom:var(--space-5)"><label style="display:block;text-align:center;font-weight:600;margin-bottom:var(--space-2)">Custom Duration (minutes)</label>' +
      '<input class="search-input" style="margin:0;text-align:center" type="number" id="custom-min" min="1" max="60" value="15"></div>' +
      '<label style="display:flex;align-items:center;gap:var(--space-3);justify-content:center;cursor:pointer;margin-bottom:var(--space-2)"><span>Play chime sounds</span><span class="toggle"><input type="checkbox" id="chime-toggle"' + (Store.getSetting('chime') ? ' checked' : '') + '><span class="toggle-slider"></span></span></label></div>' +
      '<div id="timer-active" style="display:none;text-align:center">' +
      '<div class="timer-display" id="timer-display">10:00</div>' +
      '<div class="timer-status" id="timer-status">Meditation in progress…</div>' +
      '<div class="timer-controls"><button class="btn btn-secondary" id="timer-pause">Pause</button><button class="btn btn-ghost" id="timer-stop">Stop</button></div></div>';
    const footer = document.createElement('div');
    footer.innerHTML = '<button class="btn btn-secondary btn-block" data-close>Cancel</button><button class="btn btn-primary btn-block" id="timer-start">Start Meditation</button>';
    const ov = Modal.open({ title: 'Meditation Timer', body, footer, onClose: stopTimer });

    const fmt = (s) => String(Math.floor(s / 60)).padStart(1, '0') + ':' + String(s % 60).padStart(2, '0');
    $$('.preset-btn', body).forEach((b) => b.addEventListener('click', () => {
      $$('.preset-btn', body).forEach((x) => x.classList.remove('selected'));
      b.classList.add('selected');
      selected = b.dataset.preset;
      $('#custom-wrap', body).style.display = selected === 'custom' ? 'block' : 'none';
    }));
    $('#chime-toggle', body).addEventListener('change', (e) => Store.setSetting('chime', e.target.checked));

    const tick = () => {
      if (paused) return;
      remaining--;
      if (remaining <= 0) { stopTimer(); $('#timer-display', body).textContent = '0:00'; $('#timer-status', body).textContent = 'Complete. Well done.'; playChime(); toast('Meditation complete'); return; }
      $('#timer-display', body).textContent = fmt(remaining);
    };
    function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
    $('#timer-start', ov).addEventListener('click', () => {
      const mins = selected === 'custom' ? Math.max(1, Math.min(60, parseInt($('#custom-min', body).value, 10) || 15)) : PRESETS[selected].min;
      remaining = mins * 60; paused = false;
      $('#timer-setup', body).style.display = 'none';
      $('#timer-active', body).style.display = 'block';
      $('.modal-footer', ov).style.display = 'none';
      $('#timer-display', body).textContent = fmt(remaining);
      stopTimer();
      timerId = setInterval(tick, 1000);
    });
    $('#timer-pause', body).addEventListener('click', (e) => {
      paused = !paused;
      e.target.textContent = paused ? 'Resume' : 'Pause';
      $('#timer-status', body).textContent = paused ? 'Paused' : 'Meditation in progress…';
    });
    $('#timer-stop', body).addEventListener('click', () => Modal.close());
  }

  const PATTERNS = {
    box: { name: 'Box Breathing (4-4-4-4)', desc: '4s in, 4s hold, 4s out, 4s hold', phases: [['Breathe in', 4, 1.15], ['Hold', 4, 1.15], ['Breathe out', 4, 0.85], ['Hold', 4, 0.85]] },
    relax: { name: '4-7-8 Technique', desc: '4s in, 7s hold, 8s out', phases: [['Breathe in', 4, 1.1], ['Hold', 7, 1.1], ['Breathe out', 8, 0.8]] },
    calm: { name: 'Calming Breath (4-6)', desc: '4s in, 6s out', phases: [['Breathe in', 4, 1.1], ['Breathe out', 6, 0.85]] },
    energy: { name: 'Energizing Breath (6-2)', desc: '6s in, 2s out', phases: [['Breathe in', 6, 1.2], ['Breathe out', 2, 0.85]] },
  };
  let breathTimers = [];

  function breathing() {
    let selected = 'box', cycles = 5;
    const body = document.createElement('div');
    body.innerHTML =
      '<div id="breath-setup"><p style="text-align:center;font-weight:600;margin-bottom:var(--space-3)">Choose a Breathing Pattern</p>' +
      '<div class="pattern-list">' +
      Object.entries(PATTERNS).map(([k, p]) => '<button class="pattern-btn' + (k === selected ? ' selected' : '') + '" data-pattern="' + k + '"><div class="pattern-name">' + p.name + '</div><div class="pattern-desc">' + p.desc + '</div></button>').join('') +
      '</div>' +
      '<label style="display:block;text-align:center;font-weight:600;margin-bottom:var(--space-2)">Number of Cycles</label>' +
      '<input class="search-input" style="text-align:center" type="number" id="breath-cycles" min="1" max="20" value="5"></div>' +
      '<div id="breath-active" style="display:none"><div class="breath-stage">' +
      '<div class="breath-circle" id="breath-circle"></div>' +
      '<div class="breath-phase" id="breath-phase">Get ready…</div>' +
      '<div class="breath-count" id="breath-count"></div>' +
      '<p class="text-secondary" id="breath-cycle-label" style="margin-top:var(--space-2)"></p>' +
      '</div><div class="timer-controls"><button class="btn btn-ghost" id="breath-stop">Stop</button></div></div>';
    const footer = document.createElement('div');
    footer.innerHTML = '<button class="btn btn-secondary btn-block" data-close>Cancel</button><button class="btn btn-primary btn-block" id="breath-start">Start Breathing</button>';
    const ov = Modal.open({ title: 'Guided Breathing', body, footer, onClose: stopBreath });
    function stopBreath() { breathTimers.forEach(clearTimeout); breathTimers = []; }

    $$('.pattern-btn', body).forEach((b) => b.addEventListener('click', () => {
      $$('.pattern-btn', body).forEach((x) => x.classList.remove('selected'));
      b.classList.add('selected');
      selected = b.dataset.pattern;
    }));
    $('#breath-start', ov).addEventListener('click', () => {
      cycles = Math.max(1, Math.min(20, parseInt($('#breath-cycles', body).value, 10) || 5));
      $('#breath-setup', body).style.display = 'none';
      $('#breath-active', body).style.display = 'block';
      $('.modal-footer', ov).style.display = 'none';
      const phases = PATTERNS[selected].phases;
      const circle = $('#breath-circle', body), phaseEl = $('#breath-phase', body),
        countEl = $('#breath-count', body), cycleEl = $('#breath-cycle-label', body);
      let t = 800;
      const schedule = (fn, ms) => { t += ms; breathTimers.push(setTimeout(fn, t)); };
      schedule(() => { phaseEl.textContent = 'Get ready…'; }, 0);
      for (let c = 0; c < cycles; c++) {
        const cn = c + 1;
        phases.forEach(([label, secs, scale]) => {
          schedule(() => {
            phaseEl.textContent = label;
            cycleEl.textContent = 'Cycle ' + cn + ' of ' + cycles;
            circle.style.transform = 'scale(' + scale + ')';
            countEl.textContent = secs;
          }, 0);
          for (let s = secs - 1; s >= 1; s--) {
            const left = s;
            schedule(() => { countEl.textContent = left; }, 1000);
          }
          schedule(() => {}, (secs - 1) * 1000);
        });
      }
      schedule(() => {
        phaseEl.textContent = 'Complete';
        countEl.textContent = '✨';
        cycleEl.textContent = 'Well done. ' + cycles + ' cycles finished.';
        circle.style.transform = 'scale(1)';
        playChime();
      }, 0);
    });
    $('#breath-stop', body).addEventListener('click', () => Modal.close());
  }

  return { meditation, breathing };
})();

/* ---------------- onboarding ---------------- */
const Onboarding = (() => {
  const STEPS = [
    { title: 'Welcome', text: 'Spiritual Seasons is a 120-day devotional journey through Winter, Spring, Summer, and Autumn.' },
    { title: 'Read', text: 'Open Read for today\'s devotional: scripture, a reflection prompt, and space to journal.' },
    { title: 'Contents', text: 'Browse all 120 days in Contents, and track completed days with check marks.' },
    { title: 'Progress', text: 'Watch your journey grow in Progress: streaks, seasons, and weekly reflections.' },
  ];
  function maybeShow() {
    if (Store.getSetting('onboardingDone')) return;
    setTimeout(() => {
      if (Store.getSetting('onboardingDone')) return;
      const footer = document.createElement('div');
      footer.innerHTML = '<button class="btn btn-secondary btn-block" id="tour-skip">Skip for now</button>' +
        '<button class="btn btn-primary btn-block" id="tour-yes">Yes, show me around</button>';
      const ov = Modal.open({
        title: 'Welcome to Spiritual Seasons! 🌱',
        body: '<p class="prose">Would you like a quick tour to learn about the app features?</p>',
        footer,
      });
      const done = (takeTour) => {
        Store.setSetting('onboardingDone', true);
        Modal.close();
        if (takeTour) startTour();
        else toast('You can start the tour anytime from Settings');
      };
      $('#tour-skip', ov).addEventListener('click', () => done(false));
      $('#tour-yes', ov).addEventListener('click', () => done(true));
    }, 1200);
  }
  function startTour() {
    let i = 0;
    const show = () => {
      Modal.close();
      if (i >= STEPS.length) { toast('Tour complete'); return; }
      const s = STEPS[i];
      const body = document.createElement('div');
      body.innerHTML = '<div class="tour-dots">' + STEPS.map((_, n) => '<span class="tour-dot' + (n === i ? ' on' : '') + '"></span>').join('') + '</div>' +
        '<h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p>';
      const footer = document.createElement('div');
      footer.innerHTML = '<button class="btn btn-ghost btn-block" id="tour-end">Skip tour</button>' +
        '<button class="btn btn-primary btn-block" id="tour-next">' + (i === STEPS.length - 1 ? 'Finish' : 'Next →') + '</button>';
      const ov = Modal.open({ title: 'Tour (' + (i + 1) + ' of ' + STEPS.length + ')', body, footer });
      $('#tour-next', ov).addEventListener('click', () => { i++; show(); });
      $('#tour-end', ov).addEventListener('click', () => Modal.close());
    };
    show();
  }
  return { maybeShow, startTour };
})();

/* ---------------- boot ---------------- */
async function boot() {
  try {
    await Data.load();
  } catch (e) {
    $('#page').innerHTML = '<div class="empty-state"><div class="empty-title">Could not load content</div>' +
      '<p class="empty-text">The devotional content failed to load. Check your connection and reload.</p></div>';
    hideSplash();
    return;
  }
  applySettings();
  Router.register('home', Screens.home);
  Router.register('intro', Screens.intro);
  Router.register('contents', Screens.contents);
  Router.register('devotional', Screens.devotional);
  Router.register('quiz', Screens.quiz);
  Router.register('favorites', Screens.favorites);
  Router.register('progress', Screens.progress);
  Router.register('reflections', Screens.reflections);
  Router.register('search', Screens.search);
  Router.register('privacy', Screens.privacy);
  Router.register('settings', Screens.settings);
  if (!location.hash) location.hash = '#home';
  await Router.render();
  hideSplash();
  Onboarding.maybeShow();
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
}
function hideSplash() {
  const sp = $('#splash');
  if (!sp) return;
  setTimeout(() => {
    sp.classList.add('fade-out');
    setTimeout(() => sp.remove(), 600);
  }, 400);
}
$('#splash-logo').addEventListener('error', function () { this.style.display = 'none'; });
$('#header-logo').addEventListener('error', function () { this.style.display = 'none'; });

document.addEventListener('DOMContentLoaded', boot);
})();
