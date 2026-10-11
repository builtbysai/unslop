# Spiritual Seasons PWA — Screen Map (Phase 1 notes)

Walkthrough of the ORIGINAL app (`builtbysai/Spiritual-Seasons-PWA`), done 2026-10-11 by
navigating every screen at 390x844 in headless Chromium, clicking every control, with
screenshots in `~/workspace/unslop-hub/screenshots/spiritual-seasons-v2/` (45 captures,
numbered in walkthrough order).

## What the app is

120-day Christian devotional PWA, companion to the physical book "Spiritual Seasons:
Daily Devotional Workbook" by Dr. Jacqueline Ghee. Flow: quiz -> discover your spiritual
season (Winter / Spring / Summer / Autumn) -> 30 devotional entries per season (days
1-120). Each day: a scripture reference + quote, a reflection prompt, a journal textarea,
audio notes, mark-complete, favorites, share tools. Progress tracking with streaks,
milestones, weekly reflections, and data export.

## Tech & dev choices (his, to preserve)

- **Vanilla JS, no framework.** 28 synchronous `<script>` tags, IIFE modules exposing
  globals (~40 on `window`: `Store`, `Quiz`, `Utils`, `Toast`, `Devotional`, `Progress`,
  `Search`, `Settings`, `Sharing`, `TTS`, `Audio`, `MeditationTimer`, `GuidedBreathing`,
  `AmbientSound`, `VerseImages`, `WeeklyReflection`, `OnboardingTour`, `DataExport`,
  `PDFExport`, `Notifications`, `Haptics`, `CalendarIntegration`, `ErrorHandler`...).
- **All pages exist in the DOM simultaneously** as hidden `<div id="page-*">` elements;
  the router shows/hides them and calls each module's render. Verified: `querySelectorAll`
  on the live page returns buttons from every route at once.
- **Hash routing.** Routes: `#intro` (welcome + `?page=<season>` season intros),
  `#quiz`, `#home`, `#devotional` / `#devotional/<day>`, `#contents`, `#progress`,
  `#settings`, `#search`, `#favorites`, `#reflections`, `#privacy`. Bottom nav anchors are
  `<a class="nav-item" data-route="...">` ("Read" maps to route `devotional`).
- **IndexedDB** `spiritual-seasons-db` v1, 8 stores: `user`, `journal`, `progress`,
  `favorites`, `settings`, `audioNotes`, `weeklyReflections`, `streaks`. Quiz answers live
  in module memory until submitted, then persisted to `user`.
- **Content**: `content/book.json` (seasons, 120 days, intros), `content/quiz.json`
  (16 questions, 4 per season, 5-point Likert). Book cover: `assets/images/book-cover.webp`.
- **CSS custom properties** for theming; seasonal color themes; dark mode via settings.
  Fonts: Cormorant Garamond (display) + Source Sans 3 (body). Strict CSP. Hand-written
  service worker. jsPDF 2.5.1 bundled locally for PDF export.
- **Toast system**: bottom-above-nav toasts, variants success (green check) / warning /
  error (red), dismissible X, auto-dismiss. Used pervasively as action feedback.
- **Icons**: inline SVG throughout; emoji used for season badges and wellness tools.

## Global shell

- **Header** (all screens): season-themed logo tile, "Spiritual Seasons" wordmark,
  search icon (magnifier -> `#search`), settings gear (-> `#settings`). The header logo
  is clickable (goes home).
- **Bottom nav** (all screens, 5 items): Home, Read, Contents, Progress, Settings.
  Active item highlighted teal.
- **Onboarding tour**: modal "Welcome to Spiritual Seasons! 🌱 — Would you like a quick
  tour to learn about the app features?" with "Skip for now" / "Yes, show me around".
  Appears ~1s after first load AND reappears on later route changes until the tour is
  completed; "Skip for now" shows toast "You can start the tour anytime from Settings"
  and asks again later. The tour itself is 6 spotlight steps ("1 of 6" ... "6 of 6",
  each with Next / Skip Tour), ends with toast "Welcome aboard! Enjoy your journey! 🌱".
  **Bug found**: starting the tour mid-quiz resets the quiz to its welcome screen,
  losing answered questions.
- **Install prompt**: PWA install handling exists (not exercised headless).

## Screen-by-screen

### 1. Splash / launch (fresh profile)
- 800ms branded splash, then routes to `#intro` when no quiz result exists, `#home`
  otherwise. Screenshot `01a`.
- **Scroll verdict: N/A** (transient).

### 2. Intro welcome (`#intro`, no quiz results) — `01c`
- Purpose: first impression + entry point. Book cover image (large, rounded, shadow),
  "Spiritual Seasons Daily Devotional", "A 120-Day Journey Through Winter, Spring,
  Summer, and Fall", "by Dr. Jacqueline Ghee, MSW, MPCC, DMIN", CTA "Discover Your
  Season →" (teal, -> `#quiz`). Clicking the **book cover itself** also goes to `#quiz`.
- States: default; + tour modal overlay; + "tour available" toast after skipping.
- Measured: main 908px vs 775px visible = **scrolls ~133px**. For a welcome screen this
  is borderline; the rebuild should fit it exactly (cover can scale).
- **Scroll verdict: fit viewport, zero scroll.** It is a launch/welcome screen.

### 3. Quiz welcome (`#quiz`, pre-start) — `02a`, `05a`
- Season icon, "Spiritual Seasons" / "Daily Devotional Workbook" / "by Dr. Jacqueline
  Ghee", explainer text, "Discover Your Season →" starts the quiz.
- **Scroll verdict: fit viewport, zero scroll.**

### 4. Quiz questions (`#quiz`, 16 questions) — `02b`
- Progress bar + "Question N of 16" + "N% complete". Question text in quotes, 5
  Likert options as radio cards: Not True / A Little True / Somewhat True / Mostly
  True / Very True. "Previous" (disabled on Q1) / "Next" (disabled until answered;
  becomes "See Results →" on Q16). Keyboard accessible (radiogroup, arrow keys).
- Verified: real clicks select options, Next advances, Previous goes back preserving
  the answer.
- **Scroll verdict: fit viewport, zero scroll.** One question per screen, natively.

### 5. Quiz tiebreaker (`#quiz`, on score tie) — `03`
- "You're Between Seasons", one card per tied season ("Spring — Renewal & Planting",
  "Score: 8"), each with "Choose This Season". Also "Answer a Few More Questions"
  (extra tiebreak questions) and "Retake Full Quiz".
- Measured 1803px tall — scrolls a lot. Content is a short list of cards; should be
  compact.
- **Scroll verdict: fit viewport if possible** (2-4 cards fit easily at 390x844 with
  tighter layout); scrolling only if many seasons tie.

### 6. Quiz results (`#quiz`, decisive) — `05b`
- Season icon, "You are in a Winter Season", season description paragraph, encouragement
  quote card ("Be still and know that He is God. Your waiting is not wasted."),
  "Begin Your Journey →" (-> `#intro?page=winter`) + "Retake Quiz" (secondary).
- Measured 1009px vs 775px = scrolls ~234px.
- **Scroll verdict: fit viewport, zero scroll.** Celebration/result screen.

### 7. Season intro (`#intro?page=<season>`) — `05c`
- "← Back to Contents", "Winter – A Season of Stillness & Trust (Days 1-30)",
  description, "Characteristics of Winter" cards (Stillness and Reflection / Trust
  and Surrender / ...), more sections below (very tall, 2773px).
- This is chapter/front-matter content, like a book's season opener.
- **Scroll verdict: scrolling is LEGITIMATE.** Long-form reading content.

### 8. Home (`#home`, returning user) — `07a`, `10e`
- "📅 Good Afternoon" (time-of-day greeting; note the calendar emoji is a static
  July-17 glyph while the date below is live — minor inconsistency), "Sunday,
  October 11", season badge "❄ Winter".
- **Today's Devotional card**: "📖 TODAY'S DEVOTIONAL" / "DAY 1 OF 120", "Day 1 of 30
  in Winter", scripture ref "Psalm 46:10", quote preview, CTA "Read Day N →"
  (-> `#devotional/<currentDay>`).
- **Quick Wellness Tools** (2x2 colorful tiles): "⏱ 5 Min Meditation / Peace &
  stillness" (teal), "💨 Breathe / Box pattern 4-4-4-4" (purple), "🎵 Ambient Sounds /
  Calming soundscape" (green), "❤️ Favorites / View saved days" (red).
- Daily verse footer: ""Be still, and know that I am God" — Psalm 46:10".
- States: pre-quiz home is not reachable (no-results -> intro). After day 120 the card
  presumably shows completion (not exercised).
- Measured 1248px vs 775px = **scrolls ~473px**.
- **Scroll verdict: MUST fit viewport, zero scroll.** This is the daily landing screen.
  (Requires real design work: compact greeting, devotional card, 2x2 tools, verse —
  all in 844px. The current page wastes vertical space on greeting/date/badge.)

### 9. Devotional / Read (`#devotional`, `#devotional/<day>`) — `07b`, `09a`, `09b`
- Day badge "WINTER • DAY 1 OF 30", scripture ref (teal serif, large), scripture quote
  (italic serif), "🔊 Listen" (TTS, uses reading-speed setting) / "↗ Read Full
  Chapter" (opens Bible Gateway with the saved translation).
- **"TODAY'S REFLECTION" prompt card** (teal left border, thought-bubble icon).
- **"Your Journal Entry"**: textarea, live "N words" / "N characters" counter,
  **auto-save debounced 2s** (verified: typed text persisted across navigation).
- **Record Audio Note** button ("Add a voice reflection for this day (max 5
  minutes)") — opens recorder UI (mic permission; not fully exercised headless).
- **Share Verse** (Web Share API; headless -> red toast "Failed to share" — graceful)
  / **Create Shareable Image** (modal: Template [Minimal Typography], Size [Medium],
  Font [Elegant Serif], Ratio [Square (1:1)], Align [Center], Text Color picker +
  Reset, Close, Download — renders verse to canvas image).
- Day nav row: "‹ Day 0" (disabled on day 1 — **bug**: label says "Day 0", should be
  hidden or say nothing), heart favorite toggle (fills red, toast feedback), "✓
  Completed" toggle button (teal when done; clicking again marks incomplete with
  warning toast "Day marked as incomplete"), "Day 2 ›".
- **Completion card** (inserted above day nav after marking complete): three variants
  in code — normal ("Well done completing Day N." + "Continue to Day N+1 →"), season
  end (days 30/60/90: "Season Complete" + next-season teaser + "Begin <Season> →"),
  day 120 ("🎉 Journey Complete!" + "View My Journey" + "Export My Journal").
  Plus success toast "Day completed! Keep up the great work."
- Mark-complete advances `currentDay`, updates streaks, persists to `progress` store.
- Measured 1604-1767px tall — scrolls a lot.
- **Scroll verdict: MUST fit viewport, zero scroll.** This is Hans's core complaint and
  the hardest screen: badge, verse, prompt, journal, toolbar, day-nav all in 844px.
  Design implication: journal becomes a fixed-height flex region; verse/prompt compact;
  possibly tabs or a collapsible journal. The verse text length varies per day, so the
  layout must be resilient (fluid type / clamping).

### 10. Contents (`#contents`) — `07e`, `10g`
- "Table of Contents / Navigate your devotional journey". "Introduction" collapsible
  section + 4 season sections, each season-colored: "Winter — A Season of Stillness
  and Trust  1/30 complete" with chevron. Expanding a season lists its 30 day links
  (verified 120 day-links in DOM). Day rows show completion state.
- **Scroll verdict: scrolling is LEGITIMATE.** It is a 120-item index.

### 11. Progress (`#progress`) — `07f`, `10c`, `10d`
- "Your Progress". Sections: **Overall Journey** (SVG progress ring, "1% Complete",
  "1 Days Completed", "119 Days Remaining"), **Streak** (current/best), **Milestones**
  (7/30/60/90/120-day badges), per-season rings (Winter/Spring/Summer/Autumn),
  **Activity Summary** (Journal Entries / Audio Notes / Favorites counts),
  **Share & Export** ("Share Progress", "Export Data" buttons).
- Measured 2771px — scrolls enormously.
- **Scroll verdict: MUST fit viewport, zero scroll.** Hans named progress explicitly.
  Design implication: this needs a dashboard redesign — ring + key stats + streak on
  one screen; season rings become a compact row; milestones/activity/share move to a
  second "details" area or a horizontally paged layout. The requirement is the
  at-a-glance dashboard fits; deeper detail may live behind taps.

### 12. Search (`#search`) — `08a`, `09c`
- "Search / Find devotions, journal entries, and reflections". Input
  (`#search-query`, "Search for scripture, topics, or keywords..."), "All Types" /
  "All Seasons" dropdowns, toggle chips: Has Journal, Has Audio, Favorites,
  Completed. Live results: "Found N results", cards ("Winter • Day 1" / "Devotion",
  scripture ref, excerpt with **highlighted match**, "View Devotional →").
- **Scroll verdict: scrolling is LEGITIMATE** for the results list; the search
  controls themselves should fit the top of the viewport.

### 13. Favorites (`#favorites`) — `09d`
- "Favorites / N saved devotionals". Cards: "Winter • Day 1", filled heart (tap to
  remove), scripture ref + quote, "Read Devotional →" + "Add Note". Empty state:
  "No Favorites Yet" + "Browse Devotionals".
- **Scroll verdict: scrolling is LEGITIMATE** (a saved-items list).

### 14. Reflections (`#reflections`) — `08d`
- Weekly reflections journal. Empty state: "No Reflections Yet / Weekly reflections
  will appear here as you complete each week of devotions. You'll be prompted to
  reflect after every 7 days you complete." + "Start Reading". After each 7 completed
  days, a modal prompts a weekly reflection (stored in `weeklyReflections`).
- **Scroll verdict: scrolling is LEGITIMATE** (a journal list).

### 15. Settings (`#settings`) — `07g`, `10a`, `10b`
- "Settings / Customize your devotional experience". 7 sections, 3210px tall:
  - **Display & Reading**: Dark Mode (Light/Dark/System), Font Size (S/M/L/XL —
    scales verse/journal text), Line Spacing (Normal/Relaxed), Bible Translation
    (NLT/KJV/ESV/NIV... — drives "Read Full Chapter" links), Season Colors (Auto
    (Follow Journey)/per-season), Reading Speed (for TTS).
  - **Audio & Sounds**: TTS voice choice, ambient volume default.
  - **Notifications & Reminders**: daily reminder toggle + time (Notification API).
  - **Journal Settings**: auto-save indicator, default sort.
  - **Meditation & Practice Tools**: default durations, chime on/off.
  - **Data Management**: Export as PDF (journal -> jsPDF), Export All Data (JSON),
    Import Data, Retake Quiz (-> `#quiz`, clears season), per-store Clear buttons
    (journal/audio/reflections/progress/favorites/settings), **Reset All Data**
    (red, confirm-guarded, wipes IndexedDB).
  - **About & Legal**: "All your data is stored only on this device. Nothing is sent
    to any server." App card: "Spiritual Seasons / Daily Devotional Workbook by Dr.
    Jacqueline Ghee / Version 1.0.1".
- Every setting persists to the `settings` store and applies live.
- **Scroll verdict: scrolling is LEGITIMATE.** Settings are a form list.

### 16. Privacy (`#privacy`) — `08e`
- Long-form privacy policy page (2619px): local-only data, no account, no tracking,
  contact. Linked from Settings / About.
- **Scroll verdict: scrolling is LEGITIMATE.** Legal reading content.

### 17. Wellness tool modals (from Home) — `11a`, `11b`, `11c`
- **Meditation Timer**: duration presets 5/10/20 min + custom minutes, "Play chime
  sounds" toggle, big countdown (10:00), Start/Pause/Stop, "Meditation in progress..."
  state.
- **Guided Breathing**: patterns 4-7-8 Technique / Box Breathing (4-4-4-4) / Calming
  Breath (4-6) / Energizing Breath (6-2); cycles selector; animated "Breathe In (4s)"
  phase display, "Cycle 1 of 5", Start/Stop Breathing.
- **Ambient Sounds**: 9 soundscapes (Winter Breeze, Spring Garden, Summer Warmth,
  Autumn Rustling, Gentle Rain, Ocean Waves, Deep Forest, Peaceful Night, White
  Noise), Volume 70% slider. WebAudio-generated (no audio files).
- All are modal dialogs; all fit the viewport already.

## Bugs / quirks found in the original (do NOT silently drop; decide deliberately)

1. Tour resets in-progress quiz answers (starts tour mid-quiz -> quiz welcome).
2. Devotional day-1 "previous day" button labeled "Day 0" (disabled, but wrong label).
3. Home greeting calendar emoji is a static 📅 (July 17) while the date line is live.
4. Web Share failure shows "Failed to share" toast — acceptable graceful fallback,
   keep the pattern.
5. Quiz tiebreak "Answer a Few More Questions" path not exercised (only manual
   "Choose This Season" path seen); keep both.
6. Results screen scrolls ~234px; intro welcome scrolls ~133px — both should be
   zero-scroll in rebuild.

## No-scroll verdict summary (the core requirement)

| Screen | Verdict | Current (390x844) |
|---|---|---|
| Splash | N/A (transient) | fits |
| Intro welcome | **Zero scroll** | scrolls 133px |
| Quiz welcome | **Zero scroll** | fits |
| Quiz question | **Zero scroll** | fits |
| Quiz tiebreaker | **Zero scroll** (compact cards) | scrolls ~1000px |
| Quiz results | **Zero scroll** | scrolls 234px |
| Season intro | Scroll OK (chapter content) | scrolls (fine) |
| Home | **Zero scroll** | scrolls 473px |
| Devotional (Read) | **Zero scroll** | scrolls ~830px |
| Contents | Scroll OK (120-item index) | scrolls (fine) |
| Progress | **Zero scroll** (dashboard) | scrolls ~2000px |
| Search | Controls fit; results scroll OK | fits |
| Favorites | Scroll OK (list) | fits |
| Reflections | Scroll OK (list) | fits |
| Settings | Scroll OK (form) | scrolls (fine) |
| Privacy | Scroll OK (legal text) | scrolls (fine) |
| Wellness modals | **Zero scroll** | fit |

Rule of thumb Hans gave: if it is a *destination screen you land on and act on*
(home/read/progress/quiz/results), it must fit like a native app screen. If it is a
*collection or document* (contents/search results/favorites/settings/privacy/season
intros), scrolling is legitimate content flow.

## Feature inventory (parity checklist for the rebuild)

Quiz (16 Q, Likert 5pt, progress bar, prev/next, tiebreak choose/extra-questions/
retake, results, season mapping); tour (6 steps, skip/defer, settings relaunch);
season intros; home (greeting, date, season badge, today's card, 4 wellness tools,
verse footer); devotional (badge, verse, TTS listen, full-chapter link w/ translation
setting, reflection prompt, journal w/ autosave + word/char counts, audio notes max
5min, share verse, verse-image generator, favorites toggle, complete/incomplete
toggle, completion cards x3 variants, day prev/next incl. season-boundary routing to
`#intro?page=<next>`); contents (intro + 4 seasons x30 days, completion states);
progress (ring, counts, streak, milestones, season rings, activity, share/export);
search (text + type/season filters + 4 chips, highlighting); favorites (cards, add
note, remove); reflections (weekly prompt modal, list); settings (7 sections, ~20
controls, export PDF/JSON, import, per-store clear, reset, retake quiz); privacy
page; notifications (daily reminder); haptics; keyboard shortcuts; calendar
integration hooks; PWA install + offline (service worker); dark mode; font/line
spacing; season color themes; error boundary + error toasts.

## Data model (keep compatible)

IndexedDB `spiritual-seasons-db` v1: `user` (quiz result, season, currentDay,
onboarding flags), `journal` (day -> text, updatedAt), `progress` (day -> completed,
completedAt), `favorites` (day), `settings` (all prefs), `audioNotes` (day ->
blob), `weeklyReflections` (week -> text), `streaks` (current, best, lastDate).
Day numbering 1-120 global; seasons: Winter 1-30, Spring 31-60, Summer 61-90,
Autumn 91-120.
