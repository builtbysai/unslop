# Overnight queue

One repo at a time, worst slop first. Status updated as work lands.

## Done (this run)

(see above)

## Remaining

### App UI redesigns — DONE (4/4, all live as `<repo>-redesign` on Pages, decks in `decks/`, checker-verified)
- Bridge (17% → 17%, zero flags) → "The Signal Room" (encrypted-tunnel diagram, warm paper + signal orange)
- ColorTrace (17% → 3%) → "The Lab Notebook" (honest swatches, mono readouts)
- Beacon-Remote (17% → 3%) → "Mission Control, elevated" (conservative; luminous presence system, hand-drawn SVGs; demo-data harness stands in for private backend)
- Beacon-View (17% → 17%, zero flags) → "The Quiet Watchtower" (conservative; cinematic camera tiles, amber privacy badge; demo-data harness stands in for private backend)

### Reviews only — DONE (6/6, in `reviews/`)
- fullframe: HiDPI region-recording pixel mismatch (`main.rs:265`)
- Extensible-Terminal: per-byte parser-state clone in hot path (`terminal.rs:908`)
- El-templato-d-amour: `math.random` override breaks integer callers (private repo, read-only)
- SonicSight: ROI applied without coordinate transform — measures wrong patch (P0)
- ad-automation-toolkit: temp passwords generated but never recorded (`New-BulkADUsers.ps1:99`)
- ad-security-auditor: bare `[bool]::Parse` outside try/catch kills audit (`Test-StaleAccounts.ps1:19`)

### Report redesigns — DONE (4/4, all live as `<repo>-redesign` on Pages, decks in `decks/`)
- helpdesk-ticket-analytics → "The Weekly Ops Review" (printed ops handout)
- phishing-email-analyzer → "The Intercept Dossier" (SIGINT analyst briefing)
- winlog-threat-hunter → "The Morning Intel Brief" (new HTML report added via `--html-out`)
- muse → "The Commonplace Book" (229 notes on 10 thematic shelves, pre-rendered pages)

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
