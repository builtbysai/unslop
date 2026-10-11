#!/usr/bin/env node
// v2 interactive states: quiz question/results, meditation modal, breathing modal,
// open accordion, dark mode.
const { spawn } = require('child_process');
const fs = require('fs');
const PORT = 19351;
const SHELL = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1194/chrome-linux/headless_shell';
const BASE = 'http://localhost:8032/';
const OUT = '/tmp/ss-v2';
const [wArg] = process.argv.slice(2);
const WIDTH = parseInt(wArg || '390', 10);
const HEIGHT = 844;
function rpc(ws, method, params = {}) { return new Promise((resolve, reject) => { const id = ++rpc.seq; rpc.handlers[id] = { resolve, reject }; ws.send(JSON.stringify({ id, method, params })); }); }
rpc.seq = 0; rpc.handlers = {};
async function shot(ws, name) {
  const s = await rpc(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${OUT}/v2-state-${name}-${WIDTH}.png`, Buffer.from(s.data, 'base64'));
  console.log('saved', name);
}
const DISMISS = `(function(){ const o=document.querySelector('.modal-overlay'); if(o) o.remove(); return 1; })()`;
(async () => {
  const browser = spawn(SHELL, ['--headless','--no-sandbox','--disable-gpu',`--remote-debugging-port=${PORT}`,`--window-size=${WIDTH},${HEIGHT}`,'about:blank'], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 2500));
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && rpc.handlers[m.id]) { const h = rpc.handlers[m.id]; delete rpc.handlers[m.id]; m.error ? h.reject(new Error(JSON.stringify(m.error))) : h.resolve(m.result); } };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  await rpc(ws, 'Page.enable'); await rpc(ws, 'Runtime.enable');
  await rpc(ws, 'Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: true });
  await rpc(ws, 'Runtime.evaluate', { expression: `localStorage.setItem('ss-v2-onboard','1')`, returnByValue: true });
  await rpc(ws, 'Page.navigate', { url: BASE + '#home' });
  await new Promise(r => setTimeout(r, 5000));
  await rpc(ws, 'Runtime.evaluate', { expression: DISMISS, returnByValue: true });
  await new Promise(r => setTimeout(r, 800));

  // quiz: start, answer one, screenshot question
  await rpc(ws, 'Page.navigate', { url: BASE + '#quiz' });
  await new Promise(r => setTimeout(r, 2500));
  await rpc(ws, 'Runtime.evaluate', { expression: `(function(){ document.getElementById('start-quiz').click(); return 1; })()`, returnByValue: true });
  await new Promise(r => setTimeout(r, 2000));
  await rpc(ws, 'Runtime.evaluate', { expression: `(function(){ document.querySelector('.quiz-option[data-val="4"]').click(); return 1; })()`, returnByValue: true });
  await new Promise(r => setTimeout(r, 1500));
  await shot(ws, 'quiz-question');
  // answer rest + submit via UI clicks
  await rpc(ws, 'Runtime.evaluate', { expression: `(function(){
    for (let i = 0; i < 20; i++) {
      const opt = document.querySelector('.quiz-option[data-val="3"]');
      if (!opt) break;
      opt.click();
      const next = document.getElementById('quiz-next');
      if (!next || next.disabled) break;
      next.click();
    }
    return location.hash;
  })()`, returnByValue: true });
  await new Promise(r => setTimeout(r, 2500));
  await shot(ws, 'quiz-results');

  // meditation modal
  await rpc(ws, 'Page.navigate', { url: BASE + '#home' });
  await new Promise(r => setTimeout(r, 2500));
  await rpc(ws, 'Runtime.evaluate', { expression: `(function(){ document.getElementById('tool-meditation').click(); return 1; })()`, returnByValue: true });
  await new Promise(r => setTimeout(r, 1500));
  await shot(ws, 'meditation-modal');
  await rpc(ws, 'Runtime.evaluate', { expression: DISMISS, returnByValue: true });

  // breathing modal
  await rpc(ws, 'Runtime.evaluate', { expression: `(function(){ document.getElementById('tool-breathe').click(); return 1; })()`, returnByValue: true });
  await new Promise(r => setTimeout(r, 1500));
  await shot(ws, 'breathing-modal');
  await rpc(ws, 'Runtime.evaluate', { expression: DISMISS, returnByValue: true });

  // contents accordion open (winter)
  await rpc(ws, 'Page.navigate', { url: BASE + '#contents?season=winter' });
  await new Promise(r => setTimeout(r, 2500));
  await shot(ws, 'contents-open');

  // dark mode home
  await rpc(ws, 'Runtime.evaluate', { expression: `(function(){ document.documentElement.dataset.theme='dark'; document.documentElement.dataset.season='autumn'; return 1; })()`, returnByValue: true });
  await rpc(ws, 'Page.navigate', { url: BASE + '#home' });
  await new Promise(r => setTimeout(r, 2500));
  await shot(ws, 'home-dark');

  ws.close(); browser.kill('SIGKILL');
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
