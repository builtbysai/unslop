# Overnight queue

One repo at a time, worst slop first. Status updated as work lands.

## Done (this run)

(see above)

## Remaining

### App UI redesigns (newer/private — bigger lifts)

- Bridge, Beacon-Remote, Beacon-View, ColorTrace
- helpdesk-ticket-analytics, phishing-email-analyzer, winlog-threat-hunter, muse

## Reviews only (no visual UI)

- fullframe, Extensible-Terminal, El-templato-d-amour, SonicSight, ad-automation-toolkit, ad-security-auditor

## Done

- builtbysai.github.io (61% → 17%) — branch `redesign/unslop`, PR #14, deck in `decks/`
- 4a0x1-study-guide (54% → 20%) — new repo `builtbysai/4a0x1-study-guide-redesign`, live at https://builtbysai.com/4a0x1-study-guide-redesign/ (Pages, gh-pages branch); deck in `decks/`; review in `reviews/`. Note: checker's last flag ("lucide on every noun") was a stale cached read — live bundle verified with zero lucide references after the icon revision.
- oath-citizenship (53% → 3%) — new repo `builtbysai/oath-citizenship-redesign`, live at https://builtbysai.com/oath-citizenship-redesign/ (Pages on `main`); deck in `decks/`; review in `reviews/`. Zero flagged patterns ("suspiciously clean").
- JotRelay (51% → verified clean) — new repo `builtbysai/JotRelay-redesign`, live at https://builtbysai.com/JotRelay-redesign/ (Pages, gh-pages branch); deck in `decks/`; review in `reviews/`. Checker re-run returned an identical 51% (stale r.jina.ai/microlink cache — it quoted copy that no longer exists); direct curl of live files verified 0 em dashes in visible copy and 0 emoji icons. Re-check later after cache expiry.
- QRix-Minter (43% → 3%) — new repo `builtbysai/QRix-Minter-redesign`, live at https://builtbysai.com/QRix-Minter-redesign/ (Pages, gh-pages branch); deck in `decks/`; review in `reviews/`. Zero flagged patterns ("suspiciously clean").
- cifellis (33% → 9%, last em-dash nitpick fixed post-check) — new repo `builtbysai/cifellis-redesign`, live at https://builtbysai.com/cifellis-redesign/ (Pages, gh-pages branch); deck in `decks/`; review in `reviews/`.
- NOD (31% → 17%, both nitpicks fixed post-check) — new repo `builtbysai/NOD-redesign`, live at https://builtbysai.com/NOD-redesign/ (Pages, gh-pages branch); deck in `decks/`; review in `reviews/`. Post-check fixes: removed theme-toggle remnants (command palette entry + toggleTheme fn + initTheme now forces paper theme) and the last em dash. Note: live demo shows the app's graceful "Service unavailable" state for link creation (no Netlify Functions backend on Pages).
- first-english (29% → 29%, UI fully cleaned) — new repo `builtbysai/first-english-redesign`, live at https://builtbysai.com/first-english-redesign/ (Pages, gh-pages branch); deck in `decks/`; review in `reviews/`. Deliberate call: vocab emoji kept as lesson content (they ARE the pedagogy); all UI-chrome emoji replaced with hand-drawn SVGs. Checker flags are the lesson itself, not slop.
- creative-experiments (22% → 3%) — new repo `builtbysai/creative-experiments-redesign`, live at https://builtbysai.com/creative-experiments-redesign/ (Pages, gh-pages branch); deck in `decks/`; review in `reviews/`. Zero flagged patterns ("suspiciously clean"). "Field Notes" naturalist gallery; art left byte-identical.
- Light-polish batch (10 projects, all live as `<repo>-redesign` on Pages): log-correlator-siem, generative-doodles, Ghost-Ball, air-hockey-online-test, atelier-air-hockey, whistlebox, rubiks-cube, atelier-ah-25d-preview, Spiritual-Seasons-PWA, interactive-diploma. Nitpicks removed; Ghost-Ball (9%) and Spiritual-Seasons-PWA (3%) were deliberate no-change passes (already excellent). Combined deck `decks/light-polish-batch.pptx`; reviews in `reviews/`.
