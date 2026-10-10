# Hans's verdict — cifellis redesign (2026-10-10)

Status: **rejected — keep the original.**

## Notes
1. **Delete the redesign repo** (`builtbysai/cifellis-redesign`) — done 2026-10-10.
2. **Text-only cleanup on the ORIGINAL** (`builtbysai/cifellis`): em dashes, AI signatures, reassurance language. No design changes.
3. **Spinning pizza UX issue (needs Hans's decision):** the interactive spinning pizza sometimes hijacks scroll, making the page hard to scroll for some users. Goal of the site = get people to order/visit; the CTA must never fight the decoration. Recommendation given: keep the pizza playful but confine interactivity to the pizza element itself (hover/touch the pizza only), so page scroll works everywhere else + respect prefers-reduced-motion. Alternatives: gentle auto-spin with no interaction, or remove it entirely. Awaiting his pick.

## Plan (authorized)
- Text cleanup: PR against original main, merge, verify live.
- Pizza fix: implement once Hans chooses.
