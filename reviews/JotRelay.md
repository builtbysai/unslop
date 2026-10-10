# Review: JotRelay redesign

Redesigned in `builtbysai/JotRelay-redesign` (source on `main`, live site on `gh-pages` via GitHub Pages).
Live: https://builtbysai.com/JotRelay-redesign/ · Original: https://jotrelay.netlify.app/ (also https://builtbysai.github.io/JotRelay/)

## Design thesis
JotRelay is a relay, not a destination: its job is to move words between devices in ~250ms and then get out of the way. Users are mid-task and impatient. Success feels invisible — open, write, done. The old dark-neon "developer tool" aesthetic fought the product's intimacy, so the redesign speaks the visual language of a courier envelope: warm paper, ink, a postmark-red accent, editorial serif headlines. A notepad should feel like paper on a desk, not a cockpit.

## Bugs / flaws found
- **Base-path handling assumed only two deployments.** `index.html` hardcoded `/JotRelay` in two places (the `<base>` writer and `SYNCPAD_CONFIG.basePath`). Fixed with a segment-based check supporting both `/JotRelay` and `/JotRelay-redesign`.
- **Theme picker label drift:** the default theme entry was labeled "Midnight Blue" while rendering the new paper theme. Relabeled "Relay Paper" with matching swatch (id `midnight-blue` kept for stored-pref compatibility).
- **Feature-panel screenshots clashed:** the presskit captures show the app's dark themes. Gave them a "pinned photo" treatment (paper frame, slight tilt, warm grade) so they read as intentional.
- No JS logic touched: the Supabase data model, sync contract, Broadcast/Presence lanes, encryption, and all 40+ modules are byte-identical to the original.

## Improvements made
- New default "Relay Paper" theme: warm paper `#f3eee1`, ink text, postmark-red `#b23a22` accent, deliberate small radii (3/6/10/16px), warm shadows.
- Self-hosted Fraunces (display serif) + Inter (UI) via `@font-face`; removed the Google Fonts CDN link (works offline, no render-blocking).
- Landing page rewritten around "Write it here. Read it there." — human copy, no em-dash stuffing, no gradient-text headline, postmark-style eyebrow stamps, serif italic step numbers.
- Intro typewriter taglines de-coded: "notes and files, synced instantly" etc. instead of `/* code comments */`.
- All 10 themes still work (opt-in dark themes untouched); the whole app shell is CSS-variable-driven so the editor, modals, panels, and mobile bottom bar inherit the new language automatically.
- Hand-authored SVG icon set was already in place (no lucide dependency) — kept.

## Verification
- Served locally with the `/JotRelay-redesign` base path; landing, hero, features, steps, trust, CTA, footer, `/app` create/join screen, and mobile 390px all screenshotted and reviewed across 3 visual passes.
- Room creation flow verified: generates a room URL client-side and navigates correctly (full Supabase round-trip not testable here — the test browser has no external network; data layer untouched so the contract is unchanged).
- `document.styleSheets` clean, zero console errors on landing.

## Scores
- Original: 51% slop. Redesign: pending parent's live checker re-run.
