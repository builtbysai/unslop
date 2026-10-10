# Slop Audit Findings

Checker: https://ai-slop-checker.vercel.app/ (engine: gemini 3.5 flash lite).
Method note from the checker run: verdict/roast text appears cached per root domain (builtbysai.com) — the score receipt and evidence are computed per URL. Scores below are each URL's own.

## Batch A (completed 2026-10-09)

### 1. https://builtbysai.com/ (portfolio)
- **Score: 61% slop** — "synthetic terminal styling trying very hard to look gritty."
- Flagged:
  - Round-number brag row (+10): "A row of round numbers with plus signs is the most generated element on the internet. Real proof has decimals and boring captions."
  - Emoji as icons (+10): "Emojis don't do the job of an icon system. They look like a shortcut, because they are."
  - "not just X" construction (+6)
  - Dark mode theme toggle (+3): "A dark mode toggle. The developer portfolio's secret handshake."
- Positives: no filler words, real imagery, chosen typeface.
- Fix advice: "drop the fake shell prompts and just write out what you built in plain sentences."

### 2. https://builtbysai.com/generative-doodles/
- **Score: 9% slop** — "surprisingly human work with actual taste."
- Flagged: one em dash nitpick (+2) — "Probably human. Still, the em dash is the model's favourite punctuation."
- Positives: no filler words (−6, "2001 words of copy and not one 'seamless' or 'unlock'"); real imagery (−4, "58 images of your own and not one stock photo").

### 3. https://builtbysai.com/QRix-Minter/
- **Score: 43% slop** — "another neon QR code generator for the void."
- Flagged:
  - Near-black with one neon accent (+7): "83% near-black, 1.3% neon. A dark page with a single glowing accent is the most copied look of the AI era."
  - 15 lucide icons (+5): "Lucide is the default icon set of shadcn and every AI builder. One on every item adds noise, not meaning."
  - Dark mode toggle nitpick (+3)
  - One em dash nitpick (+2)
- Positives: no filler words (−6); chosen typeface (−6, "Custom type: Dm Mono. Someone made a decision.").
- Fix advice: "replace the neon gradients with a stark black and white palette."

### 4. https://builtbysai.com/Ghost-Ball/
- **Score: 9% slop** — "surprisingly human work with actual taste."
- Flagged: one ↗ nitpick (+2) — "A single emoji in a heading is harmless, and also exactly what a model adds to sound friendly."
- Positives: no filler words (−6, "2 filler words in 1660 words. Basically clean.").

## Batch B (completed 2026-10-09)

### 5. https://builtbysai.com/air-hockey-online-test/
- **Score: 9% slop** — "surprisingly human work with actual taste."
- Flagged: one em dash nitpick (+2).
- Positives: no filler words (−6, "1 filler word in 867 words. Basically clean."); chosen typeface (−6, "Custom type: Var--Body, Var--Display. Someone made a decision.")

### 6. https://builtbysai.com/atelier-air-hockey/
- **Score: 9% slop** — "surprisingly human work with actual taste."
- Flagged: one em dash nitpick (+2).
- Positives: no filler words (−6); chosen typeface (−6, "Custom type: Var--Body, Var--Display.").

### 7. https://builtbysai.com/whistlebox/
- **Score: 9% slop** — "surprisingly human work with actual taste."
- Flagged: 2 em dashes nitpick (+2), quoting page copy "(no MIDI — internal synth only)".
- Positives: no filler words (−6, "392 words of copy and not one 'seamless' or 'unlock'.").

### 8. https://builtbysai.com/first-english/
- **Score: 29% slop** — "suspiciously polished template pretending to teach kids."
- Flagged: 120 emoji doing an icon's job (+10): "Emoji standing in for icons and bullets, at the start of card titles and list items, is a hallmark of [generated design]."
- Positives: no filler words (−6); chosen typeface (−6, "Custom type: Ui-Rounded, Sf Pro Rounded.").
- Fix advice: "Replace the generic emoji salad with custom vector icons and remove the game like level locks." Roast notes the owl mascot intro ("Hello! I'm Ollie") feels prompt-generated.

## Batch C (completed 2026-10-09 — 3 of 4 succeeded)

### 9. https://builtbysai.com/creative-experiments/
- **Score: 22% slop** — "a human was here. we can smell the coffee."
- Flagged: 2 em dashes nitpick (+2), quoting "A home for my creative coding experiments — generative art, visual studies, and works in progress."
- Positives: chosen typeface (−6, "Custom typeface: Var--Body, Var--Display. Someone made a decision.")

### 10. https://builtbysai.com/oath-citizenship/
- **Score: 53% slop** — "the AI is starting to show" / "pure generative template pretending to be civic software."
- Flagged:
  - Emoji as icons (+10): "160 emoji doing an icon's job. the designer was a group chat."
  - Five-star testimonials (+9): "five stars from 'sarah m., marketing director'. sure."
  - Default font Roboto (+4): "If the font could talk, it would say 'I gave up'."
- Positives: no filler words (−6, "Nobody said 'delve' or 'tapestry'. progress.")
- Roast: "using roboto for a civics app screams default generator output"; "George Washington reviews are a bold hallucination for a citizenship quiz."

### 11. https://builtbysai.com/rubiks-cube/
- **Score: 9% slop** — "surprisingly human work with actual taste."
- Flagged: 4 em dashes nitpick (+2), quoting "They disconnected — the table is yours again."
- Positives: chosen typeface (−6, "Custom type: Var--Body, Var--Display.").

### 12. https://builtbysai.com/atelier-ah-25d-preview/
- **Score: 9% slop** — "surprisingly human work with actual taste." (Retry succeeded; result verified against the page's own screenshot.)
- Flagged: one em dash nitpick (+2), quoting "They disconnected — the table is yours again."
- Positives: chosen typeface (−6, "Custom type: Var--Body, Var--Display. Someone made a decision.").

## Batch D (completed 2026-10-09)

### 13. https://builtbysai.com/cifellis/
- **Score: 33% slop** — "suspiciously polished for a grease stained pizzeria."
- Flagged:
  - Five-star testimonials (+9): "five stars from 'sarah m., marketing director'. sure." / "Star ratings over quotes from first names and job titles read as placeholders."
  - Dark mode toggle nitpick (+3): "adding a dark theme toggle to a pizza shop site is peak generator behavior."
- Positives: no filler words (−6); chosen typeface (−6, "Custom type: Work Sans, Rye.").

### 14. 4a0x1-study-guide — LIVE ON NETLIFY (was misread as dead)
- https://builtbysai.com/4a0x1-study-guide/ 404s, but the project is hosted on Netlify at https://4a0x1-cdc.netlify.app/ (verified 200). Re-checked there — see entry 28.
- Note: JotRelay also has a Netlify deployment (https://jotrelay.netlify.app) alongside GitHub Pages; Spiritual-Seasons-PWA likewise (https://spiritualseasons.netlify.app).

### 28. https://4a0x1-cdc.netlify.app/ (4a0x1-study-guide, Netlify-hosted)
- **Score: 54% slop** — "the AI is starting to show."
- Flagged:
  - Bold everything (+8): "every headline is shouting. font-bold is not a personality."
  - Lucide icon on every noun (+6): "27 lucide icons. we can read, we promise."
  - Soft corners (+3): "rounded-2xl, 35 times. the corners have never been softer."
  - Em dash nitpick (+2): from "Good morning — 200 questions loaded."
- Notable: "Generators default to heavy, tightly packed headlines. Studio-made sites usually set display type lighter and let size and space do the work."

### 15. https://builtbysai.com/Spiritual-Seasons-PWA/
- **Score: 3% slop** — "surprisingly clean for an ai world."
- Flagged: none. "We ran every check and came back empty handed."
- Positives: chosen typeface (−6, "Custom type: Cormorant Garamond, Source Sans 3.").

### 16. https://builtbysai.com/interactive-diploma/
- **Score: 3% slop** — "surprisingly clean for an ai world."
- Flagged: none.
- Positives: chosen typeface (−6, "Custom type: Cormorant Garamond, Great Vibes.").

### 17. https://builtbysai.com/JotRelay/
- **Score: 51% slop** — "pure generative template energy."
- Flagged:
  - 20 em dashes (+12): "the model left fingerprints on the copy."
  - 11 emoji as icons (+10): "the designer was a group chat."
- Positives: real imagery (−4, "5 images of your own and not one stock photo."); chosen typeface (−6, "Custom type: Dm Mono, Var--Font-Ui.").
- Fix advice: "Replace the generic unicode icons with custom SVGs and write actual product copy."

## Score ranking (worst → best)

| Score | Repo |
|-------|------|
| 61% | builtbysai.github.io (portfolio) |
| 54% | 4a0x1-study-guide |
| 53% | oath-citizenship |
| 51% | JotRelay |
| 43% | QRix-Minter |
| 33% | cifellis |
| 31% | NOD |
| 29% | first-english |
| 22% | creative-experiments |
| 17% (screenshot, visual-only) | Bridge, Beacon-Remote, Beacon-View, ColorTrace, helpdesk-ticket-analytics, phishing-email-analyzer, winlog-threat-hunter, muse |
| 9% | generative-doodles, Ghost-Ball, air-hockey-online-test, atelier-air-hockey, whistlebox, rubiks-cube, atelier-ah-25d-preview, log-correlator-siem |
| 3% | Spiritual-Seasons-PWA, interactive-diploma |
| 404 (dead) | 4a0x1-study-guide |
| unrunnable (documented) | fullframe, Extensible-Terminal, El-templato-d-amour, SonicSight, ad-automation-toolkit, ad-security-auditor |

## Non-web repos (slop check N/A — no visual UI for the checker to read)

muse, Bridge (no live deployment), ColorTrace (browser extension), Beacon-Remote, Beacon-View, fullframe, Extensible-Terminal, El-templato-d-amour, SonicSight, helpdesk-ticket-analytics, winlog-threat-hunter, ad-automation-toolkit, ad-security-auditor, phishing-email-analyzer.

## Screenshot batch 1 (completed 2026-10-09 — visual-only checks; the checker's screenshot mode skips markup analysis)

### 18. Bridge (screenshot of locally-served app landing page)
- **Score: 17% slop** — "a human was here. we can smell the coffee."
- Flagged: none — "nothing. suspiciously clean."
- Notable: "even without text you managed to radiate pure template energy from the palette"; fix advice "add some actual typography and ditch the generic background gradient."

### 19. Beacon-Remote (screenshot of locally-built sign-in page)
- **Score: 17% slop** — "a human was here. we can smell the coffee."
- Flagged: none. Notable: "only colour checks ran and somehow you managed to look fine."

### 20. Beacon-View (screenshot of locally-built marketing splash)
- **Score: 17% slop** — "a human was here. we can smell the coffee."
- Flagged: none. Notable: "the color picker clearly took a long lunch."

### 21. ColorTrace (screenshot of extension dashboard page)
- **Score: 17% slop** — "annoyingly restrained. we checked twice and found nothing to make fun of."
- Flagged: none — "nothing. suspiciously clean."

## Screenshot batch 2 (completed 2026-10-09 — visual-only checks)

### 22. helpdesk-ticket-analytics (screenshot of generated HTML report from 620-ticket sample CSV)
- **Score: 17% slop** — "surprisingly decent for once."
- Flagged: none — "nothing. suspiciously clean."
- Notable: "the color palette is surprisingly restrained instead of screaming purple"; "it actually looks like a tool built for humans to use."

### 23. phishing-email-analyzer (screenshot of dark HTML report from 7 sample .eml files, 4 flagged high/critical)
- **Score: 17% slop** — "surprisingly clean for once."
- Flagged: none. Notable: "only colour checks ran because you barely left any proof behind."

### 24. winlog-threat-hunter (screenshot of CLI output rendered as styled dark-terminal page)
- **Score: 17% slop** — "surprisingly clean for a threat hunting tool."
- Flagged: none. Notable: "the color palette feels suspiciously calm for something dealing with threats"; "low score means you actually wrote some real code."

### 25. muse (screenshot of generated styled index of 229 study notes)
- **Score: 17% slop** — "a human was here. we can smell the coffee."
- Flagged: none. Notable: "annoyingly restrained. we checked twice and found nothing to make fun of."

## Late additions (found via full API repo list — 2 repos missing from initial inventory)

### 26. https://builtbysai.com/NOD/ (URL shortener)
- **Score: 31% slop** — "mostly human. mildly suspicious."
- Flagged: default font Inter (+4): "inter. a fine font. so are the other 400,000 sites using it."; theme toggle (+3): "a dark mode toggle. the developer portfolio's secret handshake."; em dash (+2); stray emoji (+2).
- Positives: no filler words (−6, "661 words of copy and not one 'seamless' or 'unlock'").

### 27. https://builtbysai.com/log-correlator-siem/
- **Score: 9% slop** — "surprisingly human work with actual taste."
- Flagged: one em dash nitpick (+2), from "log-correlator-siem — Sample Run".
- Positives: no filler words (−6).

## Redesign re-checks

### Portfolio redesign (redesign/unslop branch)
- **Score: 17% slop** (was 61%) — "a human was here. we can smell the coffee."
- Flagged: none — "nothing. suspiciously clean." / "We ran every check and came back empty handed."
- Note: screenshot mode runs visual checks only; copy/markup checks need a live link.

## Genuinely unrunnable (no screenshot possible, documented with reasons)

- **fullframe** — Tauri/Rust native desktop screenshot tool; needs Rust toolchain + OS webview deps, can't build on this Linux VM.
- **Extensible-Terminal** — Rust workspace; no cargo on VM, native terminal emulator not quickly screenshotable.
- **El-templato-d-amour** — LÖVE2D Lua game template; needs LÖVE runtime + display, no web build.
- **SonicSight** — Kotlin/Gradle Android app; can't run on Linux.
- **ad-automation-toolkit** / **ad-security-auditor** — Windows-only PowerShell AD tools; can't execute on Linux.

## Audit complete

33/33 repos covered: 19 live URLs checked, 8 screenshots checked, 6 unrunnable with documented reasons. (4a0x1-study-guide was briefly misfiled as dead — it's live on Netlify.) Date: 2026-10-09.

- https://builtbysai.com/air-hockey-online-test/
- https://builtbysai.com/atelier-air-hockey/
- https://builtbysai.com/whistlebox/
- https://builtbysai.com/first-english/

## Batches C+D (not yet dispatched)

- https://builtbysai.com/creative-experiments/
- https://builtbysai.com/oath-citizenship/
- https://builtbysai.com/rubiks-cube/
- https://builtbysai.com/atelier-ah-25d-preview/
- https://builtbysai.com/cifellis/
- https://builtbysai.com/4a0x1-study-guide/
- https://builtbysai.com/Spiritual-Seasons-PWA/
- https://builtbysai.com/interactive-diploma/
- https://builtbysai.com/JotRelay/
