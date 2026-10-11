#!/usr/bin/env node
// Spiritual Seasons audit: navigate hash routes, take VIEWPORT screenshots,
// and measure scroll overflow per page. Private CDP port 19331.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SHELL = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1194/chrome-linux/headless_shell';
const PORT = 19331;
const BASE = process.env.BASE || 'http://localhost:8031/';
const OUT = process.env.OUT || '/tmp/ss-audit';
const [wArg] = process.argv.slice(2);
const WIDTH = parseInt(wArg || '390', 10);
const HEIGHT = WIDTH >= 1024 ? 800 : 844;

function rpc(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++rpc.seq;
    rpc.handlers[id] = { resolve, reject };
    ws.send(JSON.stringify({ id, method, params }));
  });
}
rpc.seq = 0; rpc.handlers = {};

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = spawn(SHELL, [
    '--headless', '--no-sandbox', '--disable-gpu',
    `--remote-debugging-port=${PORT}`, `--window-size=${WIDTH},${HEIGHT}`, 'about:blank',
  ], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 2500));

  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = targets.find(t => t.type === 'page');
  if (!page) throw new Error('no page target');

  const ws = new WebSocket(page.webSocketDebuggerUrl, { maxPayload: 256 * 1024 * 1024 });
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && rpc.handlers[m.id]) {
      const h = rpc.handlers[m.id]; delete rpc.handlers[m.id];
      m.error ? h.reject(new Error(JSON.stringify(m.error))) : h.resolve(m.result);
    }
  };
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  await rpc(ws, 'Page.enable');
  await rpc(ws, 'Runtime.enable');
  await rpc(ws, 'Emulation.setDeviceMetricsOverride', {
    width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: WIDTH < 768 });

  const routes = ['home', 'intro', 'contents', 'devotional', 'quiz', 'favorites', 'progress', 'reflections', 'search', 'privacy', 'settings'];
  const report = [];

  await rpc(ws, 'Page.navigate', { url: BASE + '#home' });
  await new Promise(r => setTimeout(r, 5000));

  // Dismiss onboarding welcome modal if present
  await rpc(ws, 'Runtime.evaluate', { expression: `(async function(){
    try { if (typeof Store !== 'undefined' && Store.saveSetting) { await Store.saveSetting('onboardingCompleted', true); } } catch(e){}
    const btn = document.querySelector('.modal button.btn-primary, button[data-tour-action="skip"]');
    if (btn) btn.click();
    const overlay = document.querySelector('.modal-overlay, .tour-overlay');
    if (overlay) overlay.remove();
    const m = document.querySelector('.modal');
    if (m) m.remove();
    return 'dismissed';
  })()`, returnByValue: true, awaitPromise: true });
  await new Promise(r => setTimeout(r, 2000));

  for (const route of routes) {
    await rpc(ws, 'Page.navigate', { url: BASE + '#' + route });
    await new Promise(r => setTimeout(r, 4500));

    const evalJs = `(function(){
      const out = {};
      const body = document.body, html = document.documentElement;
      out.viewportW = window.innerWidth; out.viewportH = window.innerHeight;
      out.htmlScrollH = html.scrollHeight; out.bodyScrollH = body.scrollHeight;
      const appMain = document.querySelector('.app-main');
      if (appMain) {
        out.appMainScrollH = appMain.scrollHeight;
        out.appMainClientH = appMain.clientHeight;
        out.appMainScrollW = appMain.scrollWidth;
        out.appMainClientW = appMain.clientWidth;
        out.appMainScrollable = appMain.scrollHeight > appMain.clientHeight + 1;
      }
      const page = document.getElementById('page-' + '${route}');
      out.pageVisible = !!(page && page.classList.contains('active'));
      out.pageRect = page ? page.getBoundingClientRect().toJSON() : null;
      out.bodyOverflows = html.scrollHeight > window.innerHeight + 1 || html.scrollWidth > window.innerWidth + 1;
      out.bodyFixed = getComputedStyle(body).position === 'fixed';
      // find wide elements
      const wide = [];
      document.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if ((r.right > window.innerWidth + 1 || r.left < -1) && r.width > 0 && wide.length < 12) {
          wide.push(el.tagName + '.' + (el.className && el.className.baseVal !== undefined ? '' : String(el.className).split(' ').slice(0,2).join('.')) + ' rect=' + JSON.stringify(r.toJSON()));
        }
      });
      out.wideEls = wide;
      out.splashGone = !document.getElementById('splash') || getComputedStyle(document.getElementById('splash')).opacity === '0';
      return JSON.stringify(out);
    })()`;

    const res = await rpc(ws, 'Runtime.evaluate', { expression: evalJs, returnByValue: true });
    let data;
    try { data = JSON.parse(res.result.value); } catch (e) { data = { err: String(res.result.value).slice(0, 300) }; }
    data.route = route;
    report.push(data);

    const shot = await rpc(ws, 'Page.captureScreenshot', { format: 'png' });
    const fname = path.join(OUT, `orig-${route}-${WIDTH}.png`);
    fs.writeFileSync(fname, Buffer.from(shot.data, 'base64'));
    console.log(`saved ${fname}  scrollH(app-main)=${data.appMainScrollH} clientH=${data.appMainClientH} scrollable=${data.appMainScrollable}`);
  }

  fs.writeFileSync(path.join(OUT, `report-${WIDTH}.json`), JSON.stringify(report, null, 2));
  ws.close();
  browser.kill('SIGKILL');
  console.log('DONE');
}
main().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
