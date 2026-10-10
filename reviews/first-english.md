# Review: first-english redesign

Redesigned in `builtbysai/first-english-redesign` (source on `main`, live build on `gh-pages` via GitHub Pages).
Live: https://builtbysai.com/first-english-redesign/ · Original: https://builtbysai.com/first-english/

## Design thesis
1. First English teaches absolute beginners, toddlers to adults, English from zero through pictures and sound in Jolly Phonics order; every word decodable, every mistake gentle.
2. Success is a small child tapping a picture, hearing a word, and beaming, plus a parent who trusts the method enough to hand over the phone daily.
3. The original's emoji were pedagogically right (pictures ARE the lesson) but visually wrong as UI: platform emoji are inconsistent across devices and the checker's top slop tell.
4. The redesign is a hand-illustrated storybook: a custom-drawn Ollie the owl guide, a hand-authored SVG icon system for all UI chrome, vocabulary pictures reframed as "sticker tiles", while the proven pedagogy, data, SRS, TTS, and offline behavior stay byte-identical.
5. Fredoka (display) + Nunito (body), self-hosted; the 9 levels become numbered chapters on a journey with a "start here" marker; deliberate radius/shadow system replaces 24px-everywhere.

## Bugs / flaws found (original and redesign)
- **Mobile horizontal overflow (original):** level cards overflowed ~390px viewports. Fixed in redesign with a dedicated small-screen card layout (smaller stickers, shrinking text column).
- **Hero decoration collision (redesign draft):** first pass placed the sun behind the parent-gate gear button and a cloud directly behind the mascot badge. Repositioned in iteration 2.
- **"Start here" pill clipping (redesign draft):** overlapped the chapter badge on narrow cards. Verified fitting after the mobile layout fix.
- No em dashes in copy (0, before and after). No lucide anywhere (0).
- Vocabulary emoji (151 unique, in LEVELS/SIGHT_WORDS/MIN_PAIRS data) intentionally kept as lesson content, presented as sticker tiles; all UI-chrome emoji (speaker, lock, star, mic, ear, target, flame, home, gear, etc., ~20 icons) replaced with hand-drawn SVGs.
- All JS logic, SRS, streaks, parent gate, TTS, and offline service worker unchanged and smoke-tested (home, level letters screen, mobile).

## Improvements made
- Custom Ollie owl SVG mascot replaces 🦉 everywhere (hero badge, guide rows, graduation).
- 23-symbol hand-drawn SVG icon set (sprout, speaker, lock, star, mic, ear, target, flame, home, check, arrows, chart, cap, eye, repeat, bulb, book, pencil, books, puzzle, abc, gear, play, tap).
- Storybook-sky hero (sun, clouds, hills) replaces the flat coral gradient.
- Chapter journey: numbered badges, per-chapter accent colors, star rewards, custom locks, "start here" marker.
- Section eyebrow labels ("Read in a flash", "Use your voice", "Train your ears").
- Chunky 3D storybook buttons, sticker-tile vocabulary pictures, self-hosted fonts (offline-safe).
- Copy: "Tap a chapter to begin", "Next: Build/Write/Story" with icons; human voice throughout.

## Scores
- Original: 29% slop.
- Redesign: pending parent's slop-checker re-run on the live URL.

## Checker re-run (2026-10-10)
- Redesign scored **29%** — same as the original, but the composition changed completely.
- Remaining flags: vocab emoji "doing an icon's job" (+10), locked tiers (+8), owl naming (+7), template layout (+6), generic visuals (+6).
- **Deliberate decision: the vocab emoji stay.** They are the lesson content (151 unique pictures in sticker-tile frames), not UI icons — all UI-chrome emoji were replaced with a 23-symbol hand-drawn SVG set. Removing them would remove the teaching material itself; that would be worse design, not better. The checker is measuring the pedagogy here, not slop. UI copy is clean: no filler words, chosen typeface credited.
