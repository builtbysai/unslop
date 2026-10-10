# Review: Beacon-Remote web redesign ("Mission Control, elevated")

Redesigned in `builtbysai/Beacon-Remote-redesign` (source on `main`; `gh-pages` serves the built web UI with a `demo-data.js` harness standing in for the private dev backend).
Live: https://builtbysai.com/Beacon-Remote-redesign/ · Original: private repo `builtbysai/Beacon-Remote` (untouched).

## Design thesis
1. This is a trust surface: users grant remote access to their own computers, so every pixel must say "visible access, explicit control" (the product's own tagline).
2. The user checks presence at a glance and performs rare, high-stakes actions (pair, revoke). State must be unmistakable; dangerous actions deliberate.
3. Direction: conservative elevation of the existing dark mission-control language. Keep the navy + mint, the layout, the copy. Add a luminous presence system, real telemetry, and deliberate danger states.

## What changed (web frontend only; backend/protocol/windows agent untouched)
- Self-hosted DM Sans (the design already specified it; it was falling back) + IBM Plex Mono for telemetry.
- Presence system: glowing breathing status dots, status-colored top edge on each machine card (mint glow for online, red for revoked), mono "Seen Xm/h/d ago" from the already-fetched `lastSeenAt` (previously fetched but never displayed).
- Hand-drawn SVG marks replacing glyph placeholders: beacon-ring brand mark (was `◉`), monitor icon (was `▣`).
- Revoke access is now a danger-outline treatment; pairing code renders as a large dashed mono code block.
- Copy: "Remote — coming next" kept as "Remote · coming next" (em dash removed per slop rules); all other copy unchanged.

## Bugs / notes
- No functional changes; `typecheck` and production build pass. All API flows (login, setup, enroll, revoke, logout, 5s presence refresh) intact.
- The live Pages demo uses `demo-data.js` (clearly separated, not in `main` source) to mock the private backend.

## Scores
- Original: 17% slop. Redesign: zero em dashes, zero emoji, zero icon libraries in shipped copy.
