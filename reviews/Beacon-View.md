# Review: Beacon-View web-viewer redesign ("The Quiet Watchtower")

Redesigned in `builtbysai/Beacon-View-redesign` (source on `main`; `gh-pages` serves the built web viewer with a `demo-data.js` harness standing in for the private backend).
Live: https://builtbysai.com/Beacon-View-redesign/ · Original: private repo `builtbysai/Beacon-View` (untouched).

## Design thesis
1. A camera wall should feel like a watchtower, not a SaaS dashboard: the video surfaces are the product, so they should feel cinematic even before a stream starts.
2. Privacy is the product's #1 stated priority (per its AGENTS.md); privacy mode must be unmistakable at a glance, never a muted footnote.
3. Direction: conservative elevation of the mature token system. Keep the light theme, layout, and copy. Add cinematic tile surfaces, real type, and unmissable privacy states.

## What changed (web-viewer frontend only; Android app, backend, infra untouched)
- Self-hosted Inter (400/500/600/700) replacing the Google Fonts `@import` in `styles/global.css`, plus IBM Plex Mono; new `--font-mono` token in `styles/tokens.css`.
- Cinematic streaming/live surfaces on `FavoriteCameraCard` and `CameraTile`: layered vignette + faint scanline texture over a deep blue-black gradient (was flat `#172437`).
- Pulsing status dots on LIVE/streaming badges (with `prefers-reduced-motion` off-ramps).
- Privacy badge upgraded from muted gray to an amber wash with border on favorite cards; tile timestamps now in Plex Mono.
- Visible-copy em dashes removed (BrowserCameraMode options, ComputerCameraSetupDialog, GetBeaconSection; a null-count placeholder now uses an en dash). Code comments untouched.
- No lucide anywhere (the app already uses a hand-authored `Icon` component); only a typographic `✓` in a success state, which is not an emoji icon.

## Bugs / notes
- No functional changes; `tsc -b` and production build pass. All API flows intact.
- The live Pages demo uses `demo-data.js` (clearly separated, not in `main` source) to mock the private backend; index.html asset paths were rewritten to relative for project-Pages hosting.
- Demo data includes a privacy-mode camera to exercise the new privacy treatment.

## Scores
- Original: 17% slop. Redesign: zero em dashes in visible copy, zero emoji, zero icon libraries.
