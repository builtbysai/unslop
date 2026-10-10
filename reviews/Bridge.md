# Review: Bridge redesign ("The Signal Room")

Redesigned in `builtbysai/Bridge-redesign` (source on `main`, live build on `gh-pages` via GitHub Pages).
Live: https://builtbysai.com/Bridge-redesign/ · Original: private repo `builtbysai/Bridge` (untouched).

## Design thesis
1. Bridge is a moment, not a place: two devices briefly shake hands, move something, vanish. The UI should feel like a temporary airlock: luminous, precise, then gone.
2. Users are mid-task and privacy-anxious. The design radiates ephemerality and cryptographic honesty: session codes, expiry, and route transparency set in mono type.
3. Direction: warm paper, ink, one decisive signal-orange accent, Space Grotesk display + IBM Plex Mono (both self-hosted) for all cryptographic labels, a live "encrypted tunnel" diagram as the centerpiece.

## What changed
- Full light-theme rewrite of `style.css` ("The Signal Room"): paper `#f4f0e5`, ink `#1d1811`, signal orange `#d9480f`, hairline rules, 6px radii.
- New animated connection diagram (this browser → encrypted tunnel → paired device, labeled AES-256-GCM) between hero and pairing card; stacks vertically on mobile.
- Self-hosted Space Grotesk + IBM Plex Mono; removed system-font stack.
- Scrubbed slop tells: "Device found — connecting" em dash → comma; "⚡ Direct"/"↪ Relayed" glyphs → plain "Direct"/"Relayed" text with CSS dot.
- All functionality preserved: session hosting/joining, QR pairing, transfer queue, request panels, receive portal, relay-only privacy mode, device rename, progress/drop-zone/keyboard support. No JS logic changes except copy strings and the route-pill labels.

## Bugs / notes
- Toolchain pin (`npm@10.9.8`, node `>=22 <23`) blocked building on this machine; relaxed to `npm@10.9.4` / `>=22` in the redesign repo only. Original untouched.
- QR code and "Connection problem" states in screenshots are environmental (no signaling service / no external network in the sandbox), not design defects.
- GitHub Pages needed a `.nojekyll` file on `gh-pages` (Vite build); added via Contents API after the first Pages build errored.

## Scores
- Original: 17% slop. Redesign: visual redesign, no slop tells remain (zero em dashes, zero emoji, zero icon libraries in shipped copy).
