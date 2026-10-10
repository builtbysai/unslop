# Hans's verdict — JotRelay redesign (2026-10-10)

Status: **rejected — prefers the original.**

## Notes
1. **Delete the redesign repo** (`builtbysai/JotRelay-redesign`) — done 2026-10-10.
2. **Instead of a redesign:** go through the ORIGINAL site and remove em dashes + review all text to remove AI signature language/indicators. (Explicit authorization to modify the original; PR + merge pattern as with #142.)

## Outcome (completed 2026-10-10)
- **PR:** https://github.com/builtbysai/JotRelay/pull/143 — "Phase 70: remove em dashes from all user-facing copy (text-only cleanup)"
- **Merge commit:** `31b79bdeae318ae9b95226636fdd96ce8a82f741` (branch `cleanup/em-dash-slop`, pushed via Git Data API)
- Replaced em dashes (U+2014) in all user-facing copy across 21 files: landing page (`index.html`), app toasts/dialogs/confirms, onboarding tour, settings labels, template descriptions, admin dashboard text, PWA manifest, README. Rewrites use periods, colons, or commas.
- AI-signature phrase scan (delve/tapestry/seamless/cutting-edge/unlock/elevate/etc.): nothing found in user-facing copy beyond the dashes.
- No functionality, layout, or design changes. Intentionally untouched: placeholder `—` glyphs in empty table cells, the smart-dash editor feature (`--` → `—`), code comments, tests.
- CHANGELOG entry added under [Unreleased] as Phase 70 (repo convention).
- **Live verification:** https://jotrelay.netlify.app/ serves the cleaned copy (new h1/meta confirmed, old dash copy gone). Netlify built from main as expected; deploy previews/branch deploys untouched.
