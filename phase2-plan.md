# Phase 2 Plan — Unsloppify

## Branch + revert strategy
- All redesign work happens on a branch named `redesign/unslop` in each repo. `main` is never touched.
- Revert = `git checkout main` (or delete the branch). The original stays intact until Hans explicitly approves a merge.
- One repo at a time, in the order below. Each repo ships before the next starts.

## Per-repo deliverables
1. `redesign/unslop` branch with the redesigned version (no shortcuts — full designer-quality pass: typography, color, spacing, iconography, copy).
2. Before/after screenshots.
3. Full PowerPoint (.pptx) presentation per repo — IMAGES ONLY: before/after screenshots with minimal captions (no text walls). Build the deck only AFTER the redesign passes the slop checker; recursively revise + re-check until the score is good.
4. `review.md` in `~/workspace/slop-audit/reviews/<repo>.md`: bugs, broken/missing functionality, flaws, areas of improvement found during the review.

## Order (worst slop first, dead site early since it's broken)
1. builtbysai.github.io — portfolio, 61%. Highest impact: it's the front door.
2. oath-citizenship — 53%. Emoji-as-icons, fake testimonials, Roboto.
3. JotRelay — 51%. Emoji-as-icons, em-dash-heavy copy. (Codebase already familiar.)
4. 4a0x1-study-guide — site DOWN (404). First restore Pages deployment, then redesign.
5. QRix-Minter — 43%. Neon-on-black starter-pack look.
6. cifellis — 33%. Fake testimonials, dark-toggle on a pizza site.
7. first-english — 29%. Emoji salad for icons.
8. creative-experiments — 22%. Light touch.
9. The 9% club (generative-doodles, Ghost-Ball, air-hockey-online-test, atelier-air-hockey, whistlebox, rubiks-cube, atelier-ah-25d-preview) — checker-verified clean; proportional polish pass + bug review only.
10. The 3% club (Spiritual-Seasons-PWA, interactive-diploma) — same as above.
11. Non-visual tools (Bridge, ColorTrace, CLIs, etc.) — no visual redesign applicable; bug/improvement review writeups only.

## Design principles for the redesigns
- No neon-on-black gradients, no purple/blue default gradients, no emoji-as-icons (custom SVG icon set per project), no em-dash-stuffed marketing copy, no round-number brag rows, no fake testimonials, no dark-mode toggle unless the project genuinely needs one.
- Real typeface choices with intent, restrained palettes, generous whitespace, copy written like a human explaining the thing.
- Every redesign gets re-run through the checker before delivery; target: under 15%.
