# Hans's verdict — oath-citizenship redesign (2026-10-10)

Status: **accepted — MERGED into original, redesign repo DELETED.**

## Notes (his verdict)
1. The after is better — merge into the original repo, delete the `-redesign` repo.
2. He didn't understand the color choices — research and improve palette, UI, UX, design.

## Outcome (all done 2026-10-10)
- **Researched palette** (v42, rationale in `reviews/oath-citizenship-palette.md`):
  - Old Glory Blue `#0A3161` (US flag spec PMS 282C — vigilance, perseverance, justice): primary brand, buttons, headings.
  - Old Glory Red `#B31942` (flag spec PMS 193C — valor): seal star, active tab, wrong answers. Same red as certificate numbers printed in red ink on naturalization certificates since 1906.
  - Parchment `#F5EEDA`: aged document stock, low-glare for long study sessions.
  - Iron-gall ink `#23211B`: body text.
  - Great Seal gold `#A8801F`: reserved for earned moments (progress, achievements, mock-interview card).
  - Certificate green `#2E6B3E`: correct answers (green guilloche on the certificate).
- **UI/UX rework**: bunting-rule header (crisp blue/red stripes), certificate double-rule masthead, navy mock-interview card (navy-and-gold certificate holder motif), red-star seal, sticky study-filter chips, blue focus rings, solid progress bars (no gradients).
- **PR**: https://github.com/builtbysai/oath-citizenship/pull/1 (branch `redesign/oath-v2` → `main`)
- **Merged**: commit `ace7483f` (merge commit).
- **Live original verified**: https://builtbysai.github.io/oath-citizenship/ serves the new design (byte-identical HTML to the built file).
- **Redesign repo deleted**: `builtbysai/oath-citizenship-redesign` returns 404.
- Legacy files removed in the merge: top-level `app.js`, `build.py`, `n400.js`, `template.html`, `oath_v2.html`, `qa/` (superseded by `src/` build layout; rebuild with `python3 src/build.py`).
- Self-check: 0 emoji, 0 em/en dashes, 0 lucide refs in visible copy; Fraunces + Public Sans self-hosted.
- Screenshots refreshed in `screenshots/after/oath-{home,study,mobile}.png`; decks updated (`decks/oath-citizenship.pptx`, master deck oath section now links the original's URL).
- Open item for parent: formal ai-slop-checker browser run on the merged live URL (subagent cannot spawn browser tasks).
