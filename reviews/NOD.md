# Review: NOD redesign ("The Wire Room")

Redesigned in `builtbysai/NOD-redesign` (source on `main`, live build on `gh-pages` via GitHub Pages).
Live: https://builtbysai.com/NOD-redesign/ · Original: https://n0d.netlify.app/

## Design thesis
1. NOD's emotional core is the click: someone, somewhere, tapped your link. A nod back across the wire.
2. Users are sharers in a hurry who also want proof their link lived a life. Success feels like a well-kept ledger, not a SaaS dashboard.
3. The original's generic "instrument" framing (decorative orbit rings, numbered editorial sections, metric cards, theme toggle) could belong to any product.
4. New direction: the telegraph office. Short links as telegrams dispatched; clicks as replies on the wire. Paper, ink, postmark vermilion, rubber stamps, perforated ticket stubs, ledger rules.
5. One confident paper theme, no toggle. Barlow Condensed display + IBM Plex Mono for links/data, all self-hosted woff2.

## Bugs / flaws found (original and redesign)
- **Options panel `hidden` override (fixed in redesign):** the new CSS set `display: grid` on `.options-panel`, which overrode the `hidden` attribute and left envelope options expanded on load. Fixed with `.options-panel[hidden] { display: none; }`.
- **Backend-dependent UI on Pages:** the redesign's live Pages deployment has no Netlify Functions backend, so the wire form shows "Service unavailable" and Dispatch is disabled there. This is the app's own graceful degradation (same as the original's offline state), not a redesign bug. Full function requires the Netlify backend.
- **Original nits carried over as fixed:** removed the decorative orbit animation, the theme toggle (☼/◐ glyphs), and generic "link intelligence" jargon. Copy rewritten without em dashes.

## Improvements made
- Newspaper-masthead header with live dateline, giant condensed NOD nameplate.
- "Compose a wire" telegram form with WIRE Nº header, line-status indicator, and a perforated ticket-stub result card (ink-black stub, vermilion accents).
- Metrics reframed as a ledger strip: "Nods received / Wires live / Loudest device / Line state".
- Link library reframed as "the wire log" ledger book with stamp-style status marks.
- Principles reframed as "House rules" posted notices with slight rotations.
- Custom SVG icons only (search, dispatch arrow); zero emoji, zero icon libraries, zero em dashes in copy.
- 404 page rewritten in the same voice ("Dead wire").

## Verification
- CDP smoke test: envelope options toggle opens/closes, command palette opens with 6 commands, zero console errors.
- Desktop (1280) and mobile (390) full-page screenshots verified.
- Original scored 31% slop; redesign ready for checker re-run.
