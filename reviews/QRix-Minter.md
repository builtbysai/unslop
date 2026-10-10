# Review: QRix-Minter redesign

Redesigned in `builtbysai/QRix-Minter-redesign` (source on `main`, live build on `gh-pages` via GitHub Pages).
Live: https://builtbysai.com/QRix-Minter-redesign/ · Original: https://builtbysai.github.io/QRix-Minter/

## Bugs / flaws found in the original
- **Dead enhancement scripts on the live site.** `index.html` loads `/final-polish.css` and `/final-polish.js` with root-absolute paths, but the app deploys under `/QRix-Minter/` on Pages, so both 404 on the live deployment. The "mint card" randomizer (random QR art, tilt, float animation on the landing hero) never runs in production. Only visible when served from domain root.
- **No validation messaging for barcodes.** Typing letters into UPC-A/EAN-13 silently failed to render with a generic "Could not render" state. The redesign validates up front with specific guidance (digits only, 11/12 or 12/13 digits).
- **Theme toggle as decoration.** The dark/light toggle existed, but the checker flagged it as portfolio-slop shorthand. The redesign commits to a single light print-room aesthetic as a design decision, not a toggle.

## Improvements made
- **New visual world: "The Press Room."** Warm paper, ink, press-red accent, hairline rules, tabular mono spec labels, crop marks and a PROOF stamp on the hero proof card. A QR tool is about print, so the UI speaks print: job tickets, order forms, proof sheets, press runs.
- **All 40+ lucide icons replaced** with a hand-drawn 24px stroke icon set (`src/icons.jsx`); `lucide-react` removed from dependencies.
- **Self-hosted type** (Space Grotesk / Inter / IBM Plex Mono via Fontsource). No Google Fonts CDN, no render-blocking.
- **Scan-confidence QC checklist** on the proof sheet: contrast ratio, quiet zone, error correction, payload density (or checksum/print-size for barcodes), each with pass/warn states and plain-language guidance.
- **Real QR art on the landing hero**, generated at runtime by the app's own engine, presented as a press proof with crop marks.
- **Copy rewritten**, zero em dashes, zero emoji, zero SaaS filler. ("Codes that scan. Every time.")
- **Avery 5160 print path**: batch output prints as a 30-up label sheet via a dedicated print stylesheet.
- **Draft recovery, history/favorites, stats, undo/redo, keyboard shortcuts** all preserved. Keyboard shortcut set kept (1-4, D, Enter, Z).
- **PWA kept**: manifest, icons, and service worker updated for the new path and theme.

## Deliberately dropped
- Comparison mode (QR vs Code 128 side-by-side) and the ⌘K command palette: rarely used, added UI weight. The core flows are faster without them.
- Scan keeps single-result decode (camera or upload, native BarcodeDetector with ZXing fallback) rather than the original's multi-result scan session. Torch toggle dropped.

## Scores
- Original: 43% slop (near-black + one neon accent, 15 lucide icons, dark-mode toggle, em-dash nitpicks).
- Redesign: pending parent checker re-run.
