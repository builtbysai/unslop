# Review: 4a0x1-study-guide redesign

Redesigned in `builtbysai/4a0x1-study-guide-redesign` (source on `main`, live build on `gh-pages` via GitHub Pages).
Live: https://builtbysai.com/4a0x1-study-guide-redesign/ · Original: https://4a0x1-cdc.netlify.app/

## Bugs / flaws found
- **Date off by one.** The redesign's home header showed "Saturday, October 10" while it was still Friday, October 9 local (EDT). Likely renders the UTC date instead of the user's local date. Original had the same class of issue ("Good morning — 200 questions loaded" greeting logic). Recommend `new Date()` localized, not UTC.
- **Original copy tics preserved as fixed:** the original's em-dash greeting ("Good morning — 200 questions loaded") and bold-everything headlines are gone in the redesign.
- All 200 questions, 27 modules, 5/7-level split, quiz/missed/review/stats flows, and official-CDC links verified present and working in the redesign.

## Improvements made
- Replaced all 24 lucide icons with a hand-authored 24×24 stroke icon set (`src/components/icons.tsx`); removed the `lucide-react` dependency entirely.
- Real typographic hierarchy (Barlow display + IBM Plex Mono) instead of bold-everything headings.
- Deliberate dark "mission brief" aesthetic: calm, focused, built for airmen drilling high-stakes CDC questions.
- Copy rewritten in a human voice ("Ready for today's drill." / "200 questions in the bank. Pick up where you left off.").

## Scores
- Original: 54% slop (bold-everything, 27 lucide icons, 35 soft corners, em-dash).
- Redesign: 20% slop on live re-check ("a human was here. we can smell the coffee."). Note: the checker's only remaining flag ("lucide icon on every noun") was a stale cached read — the live bundle was verified to contain zero lucide references after the icon revision; a later re-check should clear it.
