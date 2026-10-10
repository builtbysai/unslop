# Hans's verdict — cifellis redesign (2026-10-10)

Status: **rejected — keep the original. Text cleanup + pizza fix both done.**

## Notes
1. **Redesign repo deleted** (`builtbysai/cifellis-redesign`) — done 2026-10-10.
2. **Text-only cleanup on the ORIGINAL, zero design changes** (his hard constraint).
3. **Spinning pizza:** Hans picked "confine the interactivity to the pizza itself." Implemented.

## Outcome
- **PR #2** (text cleanup): https://github.com/builtbysai/cifellis/pull/2 — merged as `76f0d56e`. 9 files, 59 insertions / 59 deletions, pure text swaps. Removed ~60 em dashes from user-facing copy (policies, kiosk, staff hub, catering, application pages), replacing with periods/colons/natural rephrasing. No AI-signature phrases or reassurance language were found — the copy was already human; only the dashes needed work. En dashes in hour ranges, placeholder — glyphs in empty data cells, and code comments intentionally untouched.
- **PR #3** (pizza fix): https://github.com/builtbysai/cifellis/pull/3 — merged as `56871c53`.
- **Live:** https://builtbysai.com/cifellis/ (custom domain; github.io redirects) verified serving both changes.
- Branch `cleanup/em-dash-slop` and `fix/pizza-scroll` deleted after merge.

## Pizza fix — implementation approach
The hero pizza is a `<model-viewer>` 3D element with `camera-controls`, absolutely positioned over a 440px hero area. Two scroll-trapping vectors:
1. **Touch:** model-viewer captures drag gestures, so a vertical swipe starting on the pizza rotated the model instead of scrolling the page (worst on mobile, where the hero sits at top).
2. **Wheel:** `camera-controls` zooms on wheel-over-canvas, trapping desktop scroll over the pizza.
Fix (CSS/attribute-only, no layout or CTA changes):
- `touch-action: pan-y` on the model-viewer (model-viewer's documented fix): the browser handles vertical swipes as page scroll; only horizontal drags directly on the pizza spin it.
- Locked camera radius (`min/max-camera-orbit` radius = 1.6m): wheel/pinch can no longer zoom, so scrolling over the pizza scrolls the page. Rotate/tilt still works within the existing 40–80° polar limits.
- Idle auto-rotate kept (playful), still disabled under `prefers-reduced-motion` via the existing JS.
- No overlay layers capture events beyond the pizza box itself (`pointer-events` was already scoped to the model-viewer element).
- CTA untouched: Order Online / View Full Menu / Call to Order exactly as before.
Caveat: interactive scroll testing (desktop + mobile scroll over the pizza) needs a live-browser check by the parent — subagents can't operate the browser. The fix follows model-viewer's documented behavior for exactly this problem.

## Follow-up fix — PR #4 (merged 2026-10-10 as 8833a005)
A live-browser scroll test proved PR #3's fix incomplete. Root causes found by reading the model-viewer 3.4.0 source:
1. **Wheel hijack:** model-viewer's wheel handler calls preventDefault unconditionally; the min/max orbit clamp didn't help. Fix: `disable-zoom` attribute — source-verified that with disableZoom the wheel listener is never attached, so wheel passes through to the page. Drag-rotate still works.
2. **Touch veto:** the internal input layer forced inline `touch-action:none`, which wins the touch-action intersection over the host's `pan-y`. Fix: `touch-action="pan-y"` attribute (a real model-viewer API) — its gesture logic then yields vertical drags to native scroll while keeping horizontal spin.
3. **Dead auto-rotate:** the inline script assigned `.autoRotate` before the custom element upgraded; the constructor clobbered it to `false` forever. Fix: setAttribute/removeAttribute for `auto-rotate` (reduced-motion handling unchanged). Same pre-upgrade hazard fixed for `src`.
Branch deleted. Live markup verified on https://builtbysai.com/cifellis/ (all three markers present).
