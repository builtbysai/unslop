#!/usr/bin/env node
// Capture interactive states: quiz question, quiz results, meditation modal, breathing modal.
const { spawn } = require('child_process');
const fs = require('fs');
const PORT = 19339;
const SHELL = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1194/chrome-linux/headless_shell';
const BASE = 'http://localhost:8031/';
const OUT = '/tmp/ss-states';
const [wArg] = process.argv.slice(2);
const WIDTH = parseInt(wArg || '390', 10);
const HEIGHT = 844;
function rpc(ws, method, params = {}) { return new Promise((resolve, reject) => { const id = ++rpc.seq; rpc.handlers[id] = { resolve, reject }; ws.send(JSON.stringify({ id, method, params })); }); }
rpc.seq = 0; rpc.handlers = {};

async function shot(ws, name) {
  const s = await rpc(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${OUT}/orig-state-${name}-${WIDTH}.png`, Buffer.from(s.data, 'base64'));
  console.log('saved', name);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = spawn(SHELL, ['--headless','--no-sandbox','--disable-gpu',`--remote-debugging-port=${PORT}`,`--window-size=${WIDTH},${HEIGHT}`,'about:blank'], { stdio: 'ignore' });
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
  const dismiss = `(async function(){ try { if (typeof Store !== 'undefined' && Store.saveSetting) { await Store.saveSetting('onboardingCompleted', true); } } catch(e){} const b = document.querySelector('.modal-footer .btn-secondary'); if (b) b.click(); const o = document.querySelector('.modal-overlay, .tour-overlay'); if (o) o.remove(); const m = document.querySelector('.modal'); if (m) m.remove(); return 1; })()`;
  await rpc(ws, 'Runtime.evaluate', { expression: dismiss, returnByValue: true, awaitPromise: true });
  await new Promise(r => setTimeout(r, 1200));

  // Quiz: start + answer a few questions
  await rpc(ws, 'Page.navigate', { url: BASE + '#quiz' });
  await new Promise(r => setTimeout(r, 3500));
  await rpc(ws, 'Runtime.evaluate', { expression: `(function(){ const b = document.getElementById('start-quiz'); if (b) b.click(); return !!b; })()`, returnByValue: true });
  await new Promise(r => setTimeout(r, 2500));
  await shot(ws, 'quiz-question');
  // answer all questions quickly via module API
  await rpc(ws, 'Runtime.evaluate', { expression: `(async function(){
    try {
      for (let i = 0; i < 40 && !Quiz.isComplete(); i++) {
        Quiz.answerQuestion(3);
        Quiz.next();
      }
      Quiz.render('quiz-content');
      await new Promise(r => setTimeout(r, 300));
      const sb = document.getElementById('quiz-submit');
      if (sb) sb.click();
    } catch(e) { return 'err:' + e.message; }
    return 'done';
  })()`, returnByValue: true, awaitPromise: true });
  await new Promise(r => setTimeout(r, 2500));
  await shot(ws, 'quiz-results');

  // Meditation timer modal
  await rpc(ws, 'Page.navigate', { url: BASE + '#home' });
  await new Promise(r => setTimeout(r, 3000));
  await rpc(ws, 'Runtime.evaluate', { expression: `(async function(){ try { await MeditationTimer.showTimer(); } catch(e){ return 'err:'+e.message; } return 'ok'; })()`, returnByValue: true, awaitPromise: true });
  await new Promise(r => setTimeout(r, 2000));
  await shot(ws, 'meditation-modal');
  await rpc(ws, 'Runtime.evaluate', { expression: `(function(){ if (typeof Modal !== 'undefined' && Modal.close) Modal.close(); document.querySelectorAll('.modal-overlay,.modal').forEach(e=>e.remove()); return 1; })()`, returnByValue: true });

  // Breathing modal
  await rpc(ws, 'Runtime.evaluate', { expression: `(async function(){ try { await GuidedBreathing.showBreathing(); } catch(e){ return 'err:'+e.message; } return 'ok'; })()`, returnByValue: true, awaitPromise: true });
  await new Promise(r => setTimeout(r, 2000));
  await shot(ws, 'breathing-modal');

  ws.close(); browser.kill('SIGKILL');
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
