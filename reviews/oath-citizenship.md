# Review: oath-citizenship redesign

Redesigned in `builtbysai/oath-citizenship-redesign` (full site on `main`, served by GitHub Pages).
Live: https://builtbysai.com/oath-citizenship-redesign/ · Original: https://builtbysai.com/oath-citizenship/

## Bugs / flaws found
- **Original `build.py` was broken for anyone but the author.** It hardcoded absolute paths (`/home/hatch/workspace/citizenship-app/...`), so cloning the repo and running the documented build failed with `FileNotFoundError`. Fixed in the redesign: relative paths, outputs `index.html` at repo root.
- **Original buried its best feature.** The full mock interview (reading + dictation + civics + N-400) sat mid-page under a 128-card wall of identical question cards; most users would never scroll far enough to find it.
- **Emoji-as-icon throughout the original** (tab bar, headings, streak, buttons) plus bold-everything serif headings and default soft cards: the 53% slop signature.
- **Checklist duplication:** the interview-day checklist and the guide's packing list overlapped; kept both (they serve different moments) but the interview one now lives with the N-400 practice where it belongs.
- Verified in the redesign, zero console errors: EN/ES toggle, category study, card open/known-toggle, search, practice test flow (show answer, self-grade, advance), mock interview start (all 4 phases wired), interview countdown set/clear, checklist persistence.

## Improvements made
- New **Home dashboard**: readiness ring (% known), today's session (due review / weak spots / new questions / practice test), interview countdown, streak, mock-interview CTA, and the N-400 filing-date test selector.
- **Study by category**: 8 category cards with per-category progress meters instead of 128 stacked cards; search and 65/20 filter preserved.
- **"The certificate" design system**: warm paper, ink navy, gold; Fraunces (display serif) + Public Sans (the U.S. Web Design System typeface), both self-hosted — no CDN fonts.
- **Hand-drawn SVG icon set** (24 icons) and a custom seal; zero emoji in the UI, zero icon libraries.
- Human copy throughout; em-dash-stuffed strings removed in both languages.
- Process + Resources merged into a single **Guide** tab (6 tabs total, down from a scattered IA).

## Scores
- Original: 53% slop.
- Redesign: pending live re-check by parent (all previously flagged patterns — emoji icons, bold-everything, generic cards — were designed out).
