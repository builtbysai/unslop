# Hans's verdict — Spiritual-Seasons-PWA (2026-10-10)

Status: **no-change pass confirmed; redesign deleted.**

- Original scored 3%, zero flagged patterns. All em dashes legitimate (JS splits season titles on " — "; verse attributions use correct typography; published scripture content must not be altered).
- Nothing to merge. `Spiritual-Seasons-PWA-redesign` deleted 2026-10-10.

---

# Responsive rebuild — v2 (2026-10-11, overnight queue item 2)

**New repo:** https://github.com/builtbysai/spiritual-seasons-pwa-v2
**Live demo (GitHub Pages):** https://builtbysai.com/spiritual-seasons-pwa-v2/ (verified 200)
**Original untouched.** Netlify site `spiritualseasons` not rewired. Decision pending Hans: whether v2 replaces the original.

## What was wrong (screen-by-screen review, 390/768/1280/1920 + landscape)

The root cause of every "unnecessary scroll" complaint: **double bottom-clearance**.
- `css/components.css:60` — `.app-main { padding-bottom: 64px }` ("base clearance for fixed bottom nav")
- `css/layout.css` — `.page { padding-bottom: 88px }` ("clears fixed bottom nav (64px) + safe-area + breathing room")
- The fixed bottom nav is 73px tall. Every page carried 152px of dead clearance, so **every screen scrolled ~79px past its content into empty cream space**. Measured: quiz welcome, favorites empty, search, and reflections empty states all scrolled 65–100px with zero content below the fold.
- Secondary: journal textarea at the end of the devotional page sat behind the fixed nav on tablets until scrolled; progress "Overall Journey" card had an oversized ring pushing stats below the fold; Contents season cards wrapped titles awkwardly around the inline "0/30 complete".

## What v2 does

Rebuilt from scratch, same approved look (same seasonal palette, Cormorant Garamond + Source Sans 3, same cards/badges/modals), same content (book.json/quiz.json copied verbatim, `title.split(' — ')[0]` contract preserved).

Responsive architecture:
- App shell is one in-flow column: header / main / bottom nav. **Nothing is `position: fixed`** — content can never slide under chrome, no clearance padding hacks.
- `<main>` is the only scroll container (`overflow-y: auto`, `overscroll-behavior: contain`). Pages add 32px breathing room only.
- Safe areas handled on the chrome (header/nav padding), never as scrollable dead space.
- `interactive-widget=resizes-content` so the phone keyboard resizes the layout instead of covering the journal.
- Fluid type (`clamp()`), `overflow-x: clip`, modals with internal scroll (`max-height: calc(100dvh - safe areas)`), slim icon-only nav in short landscape.
- Measured result: short screens have **0px phantom scroll** at 390/768/1280/1920; long screens end exactly 32px past content. No horizontal overflow anywhere.

Feature parity (vanilla JS, no build step, localStorage stays on-device): home, intro pages, contents with day grids, devotional reader (TTS listen, Bible Gateway chapter link, auto-saving journal, favorites, complete, prev/next day), 16-question season quiz with tie-break, progress dashboard with streak, weekly reflections, search, settings (theme, season colors, font size, line spacing, translation, reading speed, export/print/reset), privacy dashboard, meditation timer with chime, guided breathing, onboarding tour, PWA manifest + offline service worker.

## Screenshots

`~/workspace/unslop-hub/screenshots/spiritual-seasons-v2/` — before (orig-*) and after (v2-*) at phone/tablet/desktop/landscape, plus quiz, meditation modal, open accordion, dark mode states.
