# Hans's verdict — Ghost-Ball (2026-10-10)

Status: **FIXED on the original — PR #38 merged, live verified.**

## Notes
1. The redesign was byte-identical — Hans: don't create empty repos with no change. `builtbysai/Ghost-Ball-redesign` deleted 2026-10-10.
2. **Responsiveness sucked (his screenshots):** the big "The Parlor" heading overlapped the pool table, "ROOM 01 · ESTABLISHED 1893" collided with the picture frame, mastery badge overlapped text, room-switcher arrows overlapped the table on mobile.

## What was done (authorized on original `builtbysai/Ghost-Ball`, PR #38, squash-merged `95809488`)
**1. Responsive overhaul.** The lobby was a tangle of absolute positions (details at `left:5%;top:37%`, panel flipping between flow and a floating card, switcher offset from the details box). Replaced with a real CSS grid (`src/lobby.css`, new): masthead / details+table row / panel bar row. Fluid type via `clamp()`; room names break at word boundaries only. Screenshot-verified **zero overlaps at 390 / 768 / 1280 / 1920 px**.
**2. Background rethink (same billiard-hall mood).** Warm spotlight pool over the table, brass-gilt corner inlays, deeper vignette, per-hall wallpaper accents: damask (Parlor), meridian star chart (Observatory), riveted iron panels (Foundry), conservatory glass ribs (Wintergarden), dark art-deco fan (Afterhours). Lamp + light beam re-centered over the table column (they sat at page-center while the table is right-of-center).
**3. Per-table picture frames.** The two frames moved into a "gallery wall" column beside the table (in-flow, can never collide). Each of the 5 halls gets fitting framed content: SVG motif (racked balls / star compass / gear / oak leaf / crescent) + hall name plate + curator note + established-year plaque with a star.
**Untouched:** game physics, rules, game functionality — visual/layout only.

## Verification
- Before/after screenshots (desktop 1920 + mobile 390): `screenshots/ghost-ball/`.
- Live at https://builtbysai.com/Ghost-Ball/ — curl-verified the deployed files contain the new code (`lobby.css` served 200, gallery-wall rules present, 5 motifs in `render.js`, frame render in `main.js`).
- Note: the sandbox's headless Chromium can't navigate to builtbysai.com (lands on `chrome-error://` — a sandbox network restriction, not a site problem); it renders fine in real browsers and in the local headless render of the identical code.
