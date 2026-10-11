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
