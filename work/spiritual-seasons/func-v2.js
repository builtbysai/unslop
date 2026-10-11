#!/usr/bin/env node
// v2 functional tests: journal save, favorite, complete, day nav, search, settings.
const { spawn } = require('child_process');
const PORT = 19353;
const SHELL = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1194/chrome-linux/headless_shell';
const BASE = 'http://localhost:8032/';
function rpc(ws, method, params = {}) { return new Promise((resolve, reject) => { const id = ++rpc.seq; rpc.handlers[id] = { resolve, reject }; ws.send(JSON.stringify({ id, method, params })); }); }
rpc.seq = 0; rpc.handlers = {};
(async () => {
  const browser = spawn(SHELL, ['--headless','--no-sandbox','--disable-gpu',`--remote-debugging-port=${PORT}`,'--window-size=390,844','about:blank'], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 2500));
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && rpc.handlers[m.id]) { const h = rpc.handlers[m.id]; delete rpc.handlers[m.id]; m.error ? h.reject(new Error(JSON.stringify(m.error))) : h.resolve(m.result); } };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  await rpc(ws, 'Page.enable'); await rpc(ws, 'Runtime.enable');
  await rpc(ws, 'Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await rpc(ws, 'Page.navigate', { url: BASE + '#devotional/1' });
  await new Promise(r => setTimeout(r, 5000));
  await rpc(ws, 'Runtime.evaluate', { expression: `(function(){ const o=document.querySelector('.modal-overlay'); if(o) o.remove(); return 1; })()`, returnByValue: true });
  await new Promise(r => setTimeout(r, 800));

  const t1 = await rpc(ws, 'Runtime.evaluate', { expression: `(function(){
    const ta = document.getElementById('journal-area');
    ta.value = 'Test journal entry about stillness and trust.';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    return 'typed';
  })()`, returnByValue: true });
  await new Promise(r => setTimeout(r, 1200));
  const t2 = await rpc(ws, 'Runtime.evaluate', { expression: `(function(){
    document.getElementById('fav-btn').click();
    return 'fav clicked';
  })()`, returnByValue: true });
  await new Promise(r => setTimeout(r, 1200));
  const t3 = await rpc(ws, 'Runtime.evaluate', { expression: `(function(){
    document.getElementById('done-btn').click();
    return 'done clicked';
  })()`, returnByValue: true });
  await new Promise(r => setTimeout(r, 1500));
  // reload -> verify persistence + day nav
  await rpc(ws, 'Page.navigate', { url: BASE + '#devotional/1' });
  await new Promise(r => setTimeout(r, 3500));
  const t4 = await rpc(ws, 'Runtime.evaluate', { expression: `(function(){
    const s = JSON.parse(localStorage.getItem('ss-v2-state'));
    return JSON.stringify({
      journalText: (s.journal['1']||{}).text,
      favs: s.favorites, done: s.completedDays, currentDay: s.currentDay,
      taValue: document.getElementById('journal-area').value.slice(0, 40),
      words: document.getElementById('journal-words').textContent,
      favActive: document.getElementById('fav-btn').classList.contains('active'),
      doneLabel: document.getElementById('done-btn').textContent.trim()
    });
  })()`, returnByValue: true });
  console.log('persist:', t4.result.value);
  // day nav
  await rpc(ws, 'Runtime.evaluate', { expression: `(function(){ document.getElementById('next-day').click(); return 1; })()`, returnByValue: true });
  await new Promise(r => setTimeout(r, 2000));
  const t5 = await rpc(ws, 'Runtime.evaluate', { expression: `JSON.stringify({hash: location.hash, ref: document.querySelector('.scripture-ref').textContent})`, returnByValue: true });
  console.log('daynav:', t5.result.value);
  // search
  await rpc(ws, 'Page.navigate', { url: BASE + '#search' });
  await new Promise(r => setTimeout(r, 2500));
  await rpc(ws, 'Runtime.evaluate', { expression: `(function(){
    const inp = document.getElementById('search-input');
    inp.value = 'still';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    return 1;
  })()`, returnByValue: true });
  await new Promise(r => setTimeout(r, 1500));
  const t6 = await rpc(ws, 'Runtime.evaluate', { expression: `JSON.stringify({results: document.querySelectorAll('.search-result').length, first: (document.querySelector('.search-result-title')||{}).textContent})`, returnByValue: true });
  console.log('search:', t6.result.value);
  // settings theme
  await rpc(ws, 'Page.navigate', { url: BASE + '#settings' });
  await new Promise(r => setTimeout(r, 2500));
  await rpc(ws, 'Runtime.evaluate', { expression: `(function(){
    const sel = document.getElementById('set-theme'); sel.value = 'dark'; sel.dispatchEvent(new Event('change', { bubbles: true }));
    const fs = document.getElementById('set-fontsize'); fs.value = 'large'; fs.dispatchEvent(new Event('change', { bubbles: true }));
    return document.documentElement.dataset.theme + '/' + document.documentElement.dataset.fontsize;
  })()`, returnByValue: true });
  await new Promise(r => setTimeout(r, 800));
  const t7 = await rpc(ws, 'Runtime.evaluate', { expression: `document.documentElement.dataset.theme + '/' + document.documentElement.dataset.fontsize`, returnByValue: true });
  console.log('settings:', t7.result.value);
  ws.close(); browser.kill('SIGKILL');
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
