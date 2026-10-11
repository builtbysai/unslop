#!/usr/bin/env node
// Deep layout probe: children of app-main + active page box details.
const { spawn } = require('child_process');
const PORT = 19335;
const SHELL = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1194/chrome-linux/headless_shell';
const BASE = 'http://localhost:8031/';
const [wArg, route] = process.argv.slice(2);
const WIDTH = parseInt(wArg || '390', 10);
const HEIGHT = 844;

function rpc(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++rpc.seq;
    rpc.handlers[id] = { resolve, reject };
    ws.send(JSON.stringify({ id, method, params }));
  });
}
rpc.seq = 0; rpc.handlers = {};

(async () => {
  const browser = spawn(SHELL, ['--headless', '--no-sandbox', '--disable-gpu',
    `--remote-debugging-port=${PORT}`, `--window-size=${WIDTH},${HEIGHT}`, 'about:blank'], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 2500));
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && rpc.handlers[m.id]) { const h = rpc.handlers[m.id]; delete rpc.handlers[m.id]; m.error ? h.reject(new Error(JSON.stringify(m.error))) : h.resolve(m.result); } };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  await rpc(ws, 'Page.enable'); await rpc(ws, 'Runtime.enable');
  await rpc(ws, 'Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: true });
  await rpc(ws, 'Page.navigate', { url: BASE + '#home' });
  await new Promise(r => setTimeout(r, 5000));
  await rpc(ws, 'Runtime.evaluate', { expression: `(async function(){
    try { if (typeof Store !== 'undefined' && Store.saveSetting) { await Store.saveSetting('onboardingCompleted', true); } } catch(e){}
    const b = document.querySelector('.modal button.btn-primary, button[data-tour-action="skip"]');
    if (b) b.click();
    const o = document.querySelector('.modal-overlay, .tour-overlay'); if (o) o.remove();
    const m = document.querySelector('.modal'); if (m) m.remove();
    return 1; })()`, returnByValue: true, awaitPromise: true });
  await new Promise(r => setTimeout(r, 1200));
  await rpc(ws, 'Page.navigate', { url: BASE + '#' + route });
  await new Promise(r => setTimeout(r, 4000));

  const expr = `(function(){
    const am = document.querySelector('.app-main');
    const pg = document.querySelector('.page.active');
    const pcs = getComputedStyle(pg);
    const kids = [];
    for (const c of am.children) {
      const r = c.getBoundingClientRect();
      kids.push({ id: c.id, disp: getComputedStyle(c).display,
        top: Math.round(r.top + am.scrollTop), bottom: Math.round(r.bottom + am.scrollTop),
        h: Math.round(r.height), oh: c.offsetHeight });
    }
    const res = {
      amClientH: am.clientHeight, amScrollH: am.scrollHeight, amScrollTop: am.scrollTop,
      amKids: kids,
      pageOH: pg.offsetHeight,
      pageMarginTop: pcs.marginTop, pageMarginBottom: pcs.marginBottom,
      pageAnim: pcs.animation,
      pageTransform: pcs.transform,
      contentChildOH: pg.firstElementChild ? pg.firstElementChild.offsetHeight : null,
      contentChildMT: pg.firstElementChild ? getComputedStyle(pg.firstElementChild).marginTop : null
    };
    return JSON.stringify(res);
  })()`;
  const out = await rpc(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true });
  console.log(out.result.value);
  ws.close(); browser.kill('SIGKILL');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
