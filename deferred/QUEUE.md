# Overnight queue — filed 2026-10-10 ~23:05 EDT

Hans's orders before sleep: organize everything scheduled for later, then work through it **one at a time** — one thing to completion, then the next. No parallel swarms. Understand each project's purpose first, visually review screen by screen, actually test by navigating, produce well-designed work.

## The bar (his words, keep them visible)
- "make sure you are actually understanding the purpose of the projects"
- "visually reviewing and actually testing by navigating from screen to screen"
- "actually producing a well designed item"
- No house style. No paper default. No marketing framing over serious work. No shortcuts.

## Queue (in order)

### 0. In-flight — verify, don't duplicate
- **muse v3 rebuild**: ✅ DONE in overnight shift. The spawned rebuild had silently failed, so it was re-done: v3 "quiet scholarly reading room" (porcelain `#f7f8f7`, Prussian blue `#10406b` accent, catalogue rows, 10 shelves, per-note pages, search) — PR #3 merged (`2fc0b0e2`), gh-pages `567c3554`, live 200 verified, "Steal the technique" absent. NOTE: a parallel sibling session also built a v3 ("The Print Room", PR #2 `7f87f0f`) — preserved in git history, documented in verdicts/muse.md. Hans should confirm which v3 stands in the verdict round.
- **Ghost-Ball responsive/bg/frames**: ✅ VERIFIED LANDED. PR #38 merged (`95809488`, 2026-10-11), live 200. Local-serve screenshots at 1920 and 390 confirm: no text/table collisions, per-table gallery frames (Observatory room verified), rethought star-chart background. No further work.

### 1. Rubiks-cube real UX review — ✅ DONE 2026-10-11
File: `deferred/rubiks-cube-ux-review.md`. Drove the cube via headless CDP (drag, keyboard, movepad, scramble, solver guide, timer, undo, help, net, glass skin, mobile 390). Found + fixed 6 no-human-in-the-loop flaws in the original: undo incremented the move counter (now takes the move back, quarter + 180°), undo-to-solved faked a win with bogus bests (suppressed), guide 180° moves leaked into the counter (split preserves count), guide playback rewound the timer (now kept), assisted solves polluted best stats (never recorded), busy taps were silent (status feedback). PR #6 merged `9b4eb75b`, live 200 verified, verdicts/rubiks-cube.md updated, hub pushed `fd839f76`. Tests pass.

### 2. Spiritual Seasons native-responsiveness rebuild
File: `deferred/spiritual-seasons-responsive-rebuild.md`. Screen-by-screen review FIRST: map every screen, state, and transition. Then a NEW repo, rebuilt from scratch for native fit on all devices. Keep the look; kill every scroll overflow and viewport misfit. Don't rewire his Netlify site without asking.

### 3. VOXMIDI Dubler-2 rebuild
File: `deferred/voxmidi-rebuild.md`. Research Dubler 2 (Vochlea), basicpitch.spotify.com, spotify/basic-pitch-ts, spotify/basic-pitch. Clone if needed. Build a complete, usable, user-friendly product. Ground-up.

### 4. Helpdesk-ticket-analytics program improvements
File: `deferred/helpdesk-ticket-analytics-improvements.md`. Real anonymized data validation, month-over-month trends, PDF export, README workflow demo.

### 5. Tyler Hobbs-inspired works
File: `deferred/tyler-hobbs-inspired-works.md`. Study Fidenza, create an original inspired piece + a couple more Hobbs-style works for the doodles backfill. Feeds the gallery mega-task; keep consistent with whatever display system emerges.

## Blocked — skip until Hans unblocks
- **Bridge make-it-work** (signaling deploy + end-to-end): needs his Render account.
- **4a0x1 study guide rework**: he said don't start until instructed.

## Parked — needs Hans's direction, not autonomous work
- Generative doodles "gallery museum big" mega-task + art backlog
- Creative-experiments incomplete pieces
- First English follow-ups
- Remaining verdict round: 6 code reviews, Beacon-Remote, Beacon-View, portfolio PR #14, log-correlator-siem-redesign, generative-doodles-redesign, JotRelay PR #141

## Standing rules for all of it
- Task instruction = authorization (modify originals, PRs, merges, new repos/deletions where specified). No chat confirmations.
- Every finished item: PR + merge, live verification (curl, not cached checker), verdict file update, hub push (`python3 ~/workspace/tools/push-dir.py builtbysai unslop main "<msg>" ~/workspace/unslop-hub`).
- GitHub via `~/workspace/skills/github-pat/` (dynamic_credentials, allowed_hosts=("api.github.com",)). `gitdata-push` hardcodes JotRelay — use sed-patched copies. Create branches via POST /git/refs first.
- Screenshots: `~/workspace/tools/cdp-shot.js` (watch for the shared-CDP-port collision; use a private copy on a unique port).
- Netlify: deploy previews + branch deploys stay OFF. Only deliberate main-branch builds.
