# Hans's verdict — QRix-Minter redesign (2026-10-10)

Status: **rejected — prefers the original.**

## Notes
1. **Delete the redesign repo** (`builtbysai/QRix-Minter-redesign`) — done 2026-10-10.
2. **Text-only cleanup on the ORIGINAL** (`builtbysai/QRix-Minter`): remove em dashes, AI text signatures, and AI insecurities/need-for-reassurance language (hedging, "rest assured", over-explaining, "it's important to note", etc.).
3. **Hard constraint:** do NOT change anything he didn't ask for — text only, zero UI/design changes.

## Plan (authorized) — COMPLETE 2026-10-10
- **PR:** https://github.com/builtbysai/QRix-Minter/pull/2 — "Remove em dashes and AI-signature phrasing from user-facing copy" (merged, squash commit `10920121ae50c54e2e84a9eba864475d4da2d004`)
- **Branch** `cleanup/text-slop` deleted after merge.
- **Files changed (3, 7 insertions / 7 deletions — pure text swaps):**
  - `index.html`: title → "QRix Minter: Code Studio"; meta description dash → "is a private…"
  - `src/main.jsx`: "Download failed. Please try again." / "ZIP export failed. Please try again."; "locations, without memorizing payload syntax"; "scalable SVG" (was "infinitely scalable SVG")
  - `README.md`: dropped "premium," / "infinitely scalable" / "gracefully" intensifiers
- **Scan results:** no AI-signature phrases (delve, seamless, unlock, elevate, etc.), no "simply/just", no reassurance language ("rest assured", "don't worry", "important to note") found anywhere — copy was already clean beyond the dashes.
- **Left intentionally:** single `—` glyph as empty-data placeholder in the stats panel (typographic convention, not prose; same call as JotRelay cleanup).
- **Live verified:** https://builtbysai.github.io/QRix-Minter/ — GitHub Pages rebuilt from main (workflow success 2026-10-10T22:56:02Z); served HTML and JS bundle confirmed to carry cleaned strings and none of the old dash copy.
