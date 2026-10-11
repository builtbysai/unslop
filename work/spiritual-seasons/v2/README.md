# Spiritual Seasons PWA — v2 (Responsive Rebuild)

A 120-day devotional journey through Winter, Spring, Summer, and Autumn, as an offline-first progressive web app.

**Live demo:** https://builtbysai.github.io/spiritual-seasons-pwa-v2/

This is a ground-up rebuild of [Spiritual-Seasons-PWA](https://github.com/builtbysai/Spiritual-Seasons-PWA) focused on one thing: **native viewport fit on every device**. Same approved design language, same palette and typography, same devotional content. The difference is architectural:

- The app shell is a single in-flow column (header / main / bottom nav). Nothing is `position: fixed`, so content can never slide under the chrome and no "clearance padding" hacks are needed.
- `<main>` is the only scroll container. Pages add breathing room only, so short screens never get phantom scroll space.
- Safe areas are handled on the chrome itself (header/nav padding), never as scrollable dead space on content.
- `interactive-widget=resizes-content` so the on-screen keyboard resizes the layout instead of covering the journal.

Devotional content by Dr. Jacqueline Ghee, MSW, MPCC, DMIN. App built by Hans Sai.

## What's inside

- 120 daily devotionals across four themed seasons (Winter, Spring, Summer, Autumn)
- Season identification quiz with tie-break handling
- Personal journal with favorites, weekly reflections, and reading streaks
- Practice tools: meditation timer with chime, guided breathing patterns
- Listen-along text-to-speech readings
- Progress dashboard with per-season tracking
- Full-text search across devotionals, journal entries, and reflections
- Export your data as JSON, print your journal
- Light/dark/auto themes, per-season color themes, font size and line spacing options
- Offline-first: installable on phone and desktop, works without a connection

## Privacy

Everything personal stays on your device. Journal entries, progress, favorites, settings, and reflections live in the browser's localStorage. There is no account and no server collecting your data.

## Run locally

Any static file server works — there is no build step:

```bash
npx serve .
# or
python3 -m http.server 8000
```
