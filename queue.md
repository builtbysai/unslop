# Overnight queue

One repo at a time, worst slop first. Status updated as work lands.

## Pending

7. first-english (29%) → `first-english-redesign`
8. creative-experiments (22%) → `creative-experiments-redesign`
9. log-correlator-siem (9%) → light polish
10. generative-doodles (9%) → light polish
11. Ghost-Ball (9%) → light polish
12. air-hockey-online-test (9%) → light polish
13. atelier-air-hockey (9%) → light polish
14. whistlebox (9%) → light polish
15. rubiks-cube (9%) → light polish
16. atelier-ah-25d-preview (9%) → light polish
17. Spiritual-Seasons-PWA (3%) → light polish
18. interactive-diploma (3%) → light polish

## App UI redesigns (newer/private — bigger lifts, after the web batch)

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
