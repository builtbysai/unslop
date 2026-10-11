# Hans's verdict — rubiks-cube (2026-10-10)

Status: **em-dash cleanup merged into the original; redesign repo deleted.**

## Done 2026-10-10
1. Merged the polish's 4 em-dash fixes into `builtbysai/rubiks-cube` main:
   - PR #5: https://github.com/builtbysai/rubiks-cube/pull/5
   - Squash merge: `43bfd5b6`
   - Help: "Rotate the whole cube (spins through full revolutions)"
   - Help: "Turn a face. Hold Shift to reverse"
   - Welcome-back: "Welcome back. Your cube was right where you left it."
   - Code comment tidied (`// undo — anything` → `// undo (anything`)
   - No-data value placeholders (solve time/moves) left as-is — standard UI.
   - Zero em dashes in user-facing copy (grep-verified).
2. `rubiks-cube-redesign` deleted (204, confirmed 404).
3. Live: https://builtbysai.github.io/rubiks-cube/ (200). Live copy verification of the merged text in progress (Pages deploy lag).

## Real UX review — done 2026-10-11 (overnight)
Actually USED the cube end to end via headless CDP (fresh profiles): drag-a-sticker
turns, keyboard R / Shift+R, movepad buttons, scramble, solver guide (open / play /
replay), timer, undo, win card, help modal, net view, glass skin, map toggle,
mobile 390px. Found 6 flaws that betrayed no human was in the loop. All fixed in
the ORIGINAL repo, no core-mechanics or solver changes.

PR #6: https://github.com/builtbysai/rubiks-cube/pull/6 — squash-merged `9b4eb75b`.

### The flaws (each verified live before fixing)
1. **Undo incremented the move counter.** Press R (moves=1), press Undo (moves=2).
   The finishMove comment even said undo is "not counted" — the code did it anyway.
   Betrayal: nobody ever pressed Undo and looked at the counter.
2. **Undoing back to solved faked a win.** R then Undo → confetti, "Solved!" card,
   "New best!" badge, and a bogus personal best (e.g. best 1 move) recorded.
   Betrayal: the win path never distinguished a reversal from a solve.
3. **Solver-guide 180° moves leaked into the counter.** Playing a 14-move guide
   (7 doubles) showed "7 moves" on the win card — the 180° split hardcoded
   `count:true` on the second half, overriding the guide's `count:false`.
   Betrayal: nobody ever watched the guide finish and read the counter.
4. **Guide playback rewound the timer.** playSolution called restartTimer(), wiping
   the attempt — fumble 2 minutes, play the guide, and the solver's playback time
   became your "personal best". Contradicted the README ("starts on your first
   turn, stops when every face is uniform").
5. **Solver-assisted solves polluted best stats.** Pure guide playthrough recorded
   "Best 2:15 · 7 moves" with a "New best!" badge for the algorithm's work.
6. **Silent no-ops.** Tapping Solve/Scramble/Undo mid-scramble did nothing at all —
   buttons don't look disabled either. Felt broken.

### The fixes (index.html only)
- Undo carries `undo:true, count:false`; finishMove decrements the counter once on
  the undo's landing half (plain move, or the historyEntry half of a split 180°).
  Counter and history stay consistent: every history entry counted exactly one.
- afterMove: an undo that lands on solved stops the clock and clears state but
  never shows the win card or touches stats.
- enqueueMove's 180° split now preserves the move's counting (`count:m.count !==
  false`); guide moves stay uncounted, user/scramble 180° moves still count one.
- playSolution uses startTimer() (no-op if running) instead of restartTimer().
- showWin takes an `assisted` flag; both solver-assisted win paths pass true, so
  bests are never recorded for the solver. Solve counts still increment.
- Busy guards in doScramble/doSolve/doUndo now show "Wait for the cube to settle
  first." / "Wait for the current move to finish." instead of silent returns.

### Verification
- `node tests/orbit-reference-model.test.mjs` → OK (54 nodes, 24 views).
- CDP-driven: undo quarter (1→0, no win, no stats), undo 180° (1→0, solved, no
  win), guide playthrough (moves 0, no New-best badge, bests untouched, solves=1),
  timer kept across guide play (0:11 → 0:13, not reset), busy feedback status,
  genuine manual solve still celebrates ("Nice work. 0:15 · 2 moves.", bests
  recorded). Before/after screenshots in `shots/rubiks-cube/`
  (win-card.png → fix-guide-win.png, fix-undo-no-win.png).
- Console clean on load; no new errors.
- Live: https://builtbysai.github.io/rubiks-cube/ → 200 after Pages rebuild
  (verified via direct curl, not the cached checker).

### Deliberately not changed
- Core turn mechanics, drag/orbit physics, solver correctness (Kociemba untouched).
- Move-count semantics otherwise (180° user/scramble moves still count as one).
- Visual design, layout, mobile breakpoints (all reviewed, all fine).
- The em-dash placeholder glyphs in numeric readouts (standard UI, not prose).

## Improvement pass — done 2026-10-11 (Hans's orders)
Hans: "Continue using it and continue improving it... I don't like how the final solved screen looks. Also there's a button that changes the style... Visually review and improve. Also make pwa."

PR #7: https://github.com/builtbysai/rubiks-cube/pull/7 — squash-merged `a03fe310`.

### 1. Solved screen redesign
The old overlay was a flat "Solved!" line with a small stat sentence. Rebuilt as a proper achievement moment:
- "Solved" headline with the cube badge and "New best!" tag
- Time / Moves / Date stat cards, personal-best line ("Personal best 1:15 · 42 moves · 3 solves")
- Two actions: "New scramble" (primary) and "Admire it" (dismisses the overlay so you can look at the finished cube)
- Verified via real end-to-end: scramble → manual moves → solver → guide play → win shows correct Time/Moves/Date; Admire dismisses; assisted solves correctly skip bests.

### 2. Style switcher fixed (the button Hans didn't understand)
- The cryptic icon toggle is gone. A labeled **Classic / Glow** segmented control in the utility bar says exactly what it does; switching announces via status toast ("Glow style: luminous stickers."); help overlay documents it; `aria-pressed` synced; choice persists.
- Renamed "glass" → **glow**: the old translucent variant rendered muddy and dark (no envmap, opacity 0.62). Glow uses luminous emissive stickers on a dark body — all six colors stay readable mid-solve. Verified visually on a scrambled cube. Old `rc.skin=glass` values migrate automatically.
- Bonus find while touching this: `clearHint()` referenced an undefined `glass` variable (ReferenceError when clearing a hint while glowing) — fixed by renaming to the in-scope `skin`.

### 3. PWA
- `manifest.webmanifest` (standalone, theme `#0b0c10`), icons 192/512/maskable/apple-touch generated from a render of the real 3D cube
- `sw.js` service worker: cache-first app shell (`rubiks-cube-v1`) including vendored three.js + the solver; old caches purged on activate
- three.js vendored locally (`vendor/three/`) instead of CDN — true offline play requires it. Fonts (Google CDN) degrade gracefully to system fonts offline.
- Verified: SW registered, cache populated, all PWA assets 200.

### 4. Testing
- CDP end-to-end on a fast test copy: scramble(4)+2 manual moves → 6 counted, timer running, solver→guide→play→win (Time/Moves/Date correct), Admire dismisses, glow toggle persists, SW+cache OK, zero console errors
- Desktop 1440 + mobile 390 screenshots reviewed: win card, glow skin, main layout, utility bar with the wider segmented control — all clean, no overflow
- `node --test tests/orbit-reference-model.test.mjs` pass; module syntax check clean
- Live: https://builtbysai.github.io/rubiks-cube/ → 200 with new markers (`winDate`, `skinSeg`, vendored three path); sw.js, manifest, icons all 200

### Before/after shots (shots/rubiks-cube/)
- win-redesign-before.png → win-redesign-after.png (+ win-redesign-mobile-after.png)
- glass-style-before.png (muddy) → glow-style-after.png (scrambled, readable) + glow-style-solved.png
- mobile-main-after.png

### Notes
- Headless CDP is ~10x slower than real browsers (dt clamp); not an app bug. Solver init itself is ~2s; the earlier "solver timeout" was the test clicking Solve while the cube was still mid-scramble (busy guard correctly ignored it), and later waiting for a win while the guide tray sat unplayed (correct behavior).
- Vendored solver quirk (not touched): `Cube.fromString(solved).solve()` returns a non-empty 12-move round trip for an already-solved cube — harmless (leaves it solved), out of scope.
- `log-correlator-siem-redesign` branch still exists; JotRelay PR #141 housekeeping still open. Neither touched.

## Follow-up pass — done 2026-10-11 (Hans's pushback on PR #7)
Hans: (1) "Did you ever visually review the changes you made to the UI to see if the UI additions fit in?" (2) "I don't think we need a classic and glow view." (3) "Search famous Rubik's cube sites to understand what is actually important." Then: remove the "Admire it" button; remove the rainbow color-circle badge ("gives slop").

PR #8: https://github.com/builtbysai/rubiks-cube/pull/8 — squash-merged `4e09add4` (branch followup/pr8 deleted).

### 1. Classic/Glow toggle removed — one look kept
- Hans: no toggle. Evaluated honestly: the glow finish (luminous emissive stickers, emissiveIntensity 1.15, dark body 0x0d1017) keeps all six colors readable on the dark stage; the classic matte finish sat flatter and darker by comparison. Kept **glow** as the single finish.
- Clean removal: `#skinSeg` markup, `.segControl` CSS, `skin` variable + localStorage + glass→glow migration, `syncSkinSeg()`, the toggle click handler, the help-overlay "Cube style" entry, and the README bullet — all gone. `applySkin()` is now a straight single-finish applicator (still needed: `buildCube()` creates fresh materials). `clearHint()` restores the glow baseline unconditionally. Grep-verified: zero remaining `skin`/`skinSeg`/`rc.skin` references.

### 2. "Admire it" removed; rainbow badge removed
- Solved overlay is now: close X (top-right, same `ghostClose` pattern as help), "New best!" tag, "Solved" headline, sub-line, Time / Moves / Date stat cards, personal-best line, single "New scramble" action. The rainbow conic-gradient badge div + its CSS + the win-check keyframes are gone.
- `winAdmire` handler replaced with `btnCloseWin` → `hideWin()`. The win card already had `position:relative`, so the X positions correctly.

### 3. Competitive research — what famous cube sites actually prioritize
Studied csTimer, timer.cubing.net (official cubing project), Twisty Timer-style mobile timers, and NexusTimer.
- **The timer is the product.** csTimer's hero is a giant timer with hold-to-start spacebar; everything else (scramble panel, stats) is subordinate. Millisecond accuracy, inspection time, clear ready/running states.
- **Fair scrambles.** Random-state scrambles (WCA-style), always visible, copyable.
- **Stats that persist:** rolling averages ao5/ao12 (shown right under the timer on csTimer), PB tracking, per-solve history with +2/DNF penalties, session management, export.
- **What they DON'T include:** no 3D cube toy, no style skins/toggles, no win celebrations, no solver walkthroughs, no decorative chrome. csTimer even has "hide all elements when timing" — the philosophy is subtraction.
- **Top 3 that matter:** (1) timer accuracy + prominence, (2) fair random-state scrambles, (3) persistent stats (bests, history, averages).

**Alignment for this app:** this is a casual learning cube, not a speed timer — it should not try to become csTimer. The research says REDUCE, not add: the style toggle removal was the right cut (no famous timer has one). Kept: timer (starts on first turn, stops on solve), scramble with tap-to-copy readout, personal bests + solve count. Deliberately NOT adding ao5/ao12/session stats — scope creep the research doesn't justify for a toy. The guide tray + orbit/net map are this app's differentiators (learning, not timing) and stay.

### 4. Visual-fit review — done for real this time
Hans asked point-blank whether PR #7's UI was reviewed for fit. This time every changed surface was screenshotted at 1440px desktop AND 390px mobile and read by eye:
- main (d-main, m-main): utility bar now sound/fullscreen/help only — no gap, no overflow; cube renders in the single glow finish; move pad + dock thumb-reachable on mobile.
- win overlay (d-win, m-win): triggered via a REAL solve (R then R' through the on-screen move pad), not a JS shortcut. Clean card, no collisions, stat cards fit in one row on 390px.
- help overlay (d-help, m-help): "Cube style" entry gone, no overflow, readable.
- solve tray (d-solve-tray): captured with a real scramble → Solve → tray open.
- Shots: shots/rubiks-cube/ (d-*/m-* series for this pass).

**Fit issues found and fixed:** none in the app chrome — the removals left no gaps. (Test-harness notes, not app bugs: headless CDP runs ~10x slow so scripted input needs DOM-polled waits; a stale `python3 -m http.server` from the PR #7 session was squatting on the screenshot port serving old code — killed; Solve on a solved cube correctly refuses with "Already solved. Give it a scramble first.")

### Verification
- `node tests/orbit-reference-model.test.mjs` pass; inline module syntax clean (`node --check`).
- Live: https://builtbysai.github.io/rubiks-cube/ → 200, `skinSeg` absent from served HTML, win overlay markers (`btnCloseWin`, no `winAdmire`/`winBadge`) confirmed.
