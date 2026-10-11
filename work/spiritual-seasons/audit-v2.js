#!/usr/bin/env node
// v2 audit: navigate routes, dismiss onboarding, viewport screenshots + overflow metrics.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const PORT = 19345;
const SHELL = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1194/chrome-linux/headless_shell';
const BASE = process.env.BASE || 'http://localhost:8032/';
const OUT = process.env.OUT || '/tmp/ss-v2';
const [wArg, hArg] = process.argv.slice(2);
const WIDTH = parseInt(wArg || '390', 10);
const HEIGHT = parseInt(hArg || (WIDTH >= 1024 ? 800 : 844), 10);
function rpc(ws, method, params = {}) { return new Promise((resolve, reject) => { const id = ++rpc.seq; rpc.handlers[id] = { resolve, reject }; ws.send(JSON.stringify({ id, method, params })); }); }
rpc.seq = 0; rpc.handlers = {};

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
  await rpc(ws, 'Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: WIDTH < 768 });
  await rpc(ws, 'Page.navigate', { url: BASE + '#home' });
  await new Promise(r => setTimeout(r, 5000));
  const dismiss = `(function(){ try { localStorage.setItem('ss-v2-state', JSON.stringify(Object.assign({settings:{theme:'light',seasonColor:'auto',fontSize:'medium',lineSpacing:'normal',translation:'NLT',readingSpeed:'normal',chime:true,onboardingDone:true},currentDay:1,completedDays:[],favorites:[],journal:{},reflections:{},quizResult:null,completionDates:{}}, JSON.parse(localStorage.getItem('ss-v2-state')||'{}'), {settings:Object.assign({theme:'light',seasonColor:'auto',fontSize:'medium',lineSpacing:'normal',translation:'NLT',readingSpeed:'normal',chime:true,onboardingDone:true}, (JSON.parse(localStorage.getItem('ss-v2-state')||'{}').settings||{}), {onboardingDone:true})}))); } catch(e){} const o=document.querySelector('.modal-overlay'); if(o) o.remove(); return 1; })()`;
  await rpc(ws, 'Runtime.evaluate', { expression: dismiss, returnByValue: true });
  await new Promise(r => setTimeout(r, 800));
  await rpc(ws, 'Page.navigate', { url: BASE + '#home' });
  await new Promise(r => setTimeout(r, 2500));
  await rpc(ws, 'Runtime.evaluate', { expression: dismiss, returnByValue: true });
  await new Promise(r => setTimeout(r, 1200));

  const routes = ['home', 'intro', 'contents', 'devotional', 'quiz', 'favorites', 'progress', 'reflections', 'search', 'privacy', 'settings'];
  for (const route of routes) {
    await rpc(ws, 'Page.navigate', { url: BASE + '#' + route });
    await new Promise(r => setTimeout(r, 3000));
    const m = await rpc(ws, 'Runtime.evaluate', { expression: `(function(){
      const main = document.querySelector('.app-main');
      const pg = document.querySelector('#page');
      const nav = document.querySelector('.bottom-nav');
      const hdr = document.querySelector('.app-header');
      const wide = [];
      document.querySelectorAll('#page *').forEach(el => {
        const r = el.getBoundingClientRect();
        if ((r.right > window.innerWidth + 1 || r.left < -1) && r.width > 0 && wide.length < 6)
          wide.push(el.tagName + '.' + String(el.className).split(' ').slice(0,2).join('.'));
      });
      // phantom scroll: bottom of last content vs scrollHeight
      let lastBottom = 0;
      const kids = pg.children;
      if (kids.length) { const r = kids[kids.length-1].getBoundingClientRect(); lastBottom = r.bottom - main.getBoundingClientRect().top + main.scrollTop; }
      return JSON.stringify({
        scrollH: main.scrollHeight, clientH: main.clientHeight,
        scrollable: main.scrollHeight > main.clientHeight + 1,
        contentBottom: Math.round(lastBottom),
        deadSpace: Math.round(main.scrollHeight - Math.max(lastBottom, main.clientHeight)),
        navH: nav.offsetHeight, hdrH: hdr.offsetHeight,
        navOverlaps: (function(){ const nr = nav.getBoundingClientRect(); const pr = pg.getBoundingClientRect(); return pr.bottom > nr.top + 1 && main.scrollTop + main.clientHeight >= main.scrollHeight - 2 ? 'at-end-check' : (pr.bottom > nr.top + 1 ? 'OVERLAP' : 'ok'); })(),
        wide
      });
    })()`, returnByValue: true });
    let d; try { d = JSON.parse(m.result.value); } catch (e) { d = { err: 1 }; }
    console.log(route.padEnd(12), 'scrollH=' + d.scrollH, 'clientH=' + d.clientH, 'deadSpace=' + d.deadSpace + 'px', 'wide=' + JSON.stringify(d.wide));
    const s = await rpc(ws, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT, `v2-${route}-${WIDTH}x${HEIGHT}.png`), Buffer.from(s.data, 'base64'));
  }
  ws.close(); browser.kill('SIGKILL');
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
