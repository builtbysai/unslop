# ColorTrace — deep-dive research (2026-10-11)

Research only. No code changed, no repos touched. Hans gives the verdict after using it himself.

## What it is

ColorTrace is a browser extension for front-end developers and designers that captures
forensically careful records of the colors a web page actually renders. You point it at
an element (a button, a link, a border), and it saves a "trace": the resolved CSS color
value plus bounded evidence about where that color came from (which CSS declaration,
which design token, under what page state), all stored locally in the browser. Later you
can open the dashboard, pick two traces as baseline and candidate, and get a measured
comparison (channel deltas, state/environment differences, reproduction guidance) to
prove whether a deploy changed a color, and export a privacy-bounded regression report.
It never takes screenshots, never reads page text, and never sends anything anywhere;
page identity is reduced to the origin domain.

## The full user flow

1. **Install** the extension (Chromium: load unpacked from `apps/extension/.output/chrome-mv3`;
   Firefox: temporary add-on). Declares only `activeTab` + `scripting`.
2. **Capture**: on any page, activate via the extension action or `Alt+Shift+C`. A picker
   is injected. Hover and click an element (pointer) or Tab to a focus target and press
   Enter (keyboard); choose foreground/background/border/fill/stroke. Escape cancels.
3. **Quick Trace** records the browser's resolved computed CSS value (schema v1 labels it
   `resolved-style`; it is explicitly NOT a rendered-pixel sample after opacity/blending).
4. The trace passes an evidence firewall and strict zod schema, then is stored only in
   extension-origin IndexedDB (`colortrace` database, `traces` store, keyed by `traceId`).
5. **Dashboard** (`dashboard.html`, published statically to
   https://builtbysai.com/ColorTrace/): lists saved traces newest-first, each with
   property, origin, capture date, collapsible source evidence and token candidates,
   plus Compare checkbox, Export .colortrace, Delete. Import .colortrace re-validates
   through the same strict schema; re-importing an existing `traceId` replaces it.
6. **Compare**: check two traces; first becomes Baseline, second Candidate. The dashboard
   shows max channel delta, state/environment differences, "reproduce baseline
   conditions" guidance, evidence changes, and an Export regression report button.
   The report derives only from the two traces (no screenshots, no causal claims).
7. This was all verified working end-to-end in a headless browser against the published
   dashboard build: seeded 4 schema-valid traces (button baseline #635bff, post-deploy
   candidate #4f46e5, a link color, a border color), compared baseline vs candidate
   (max channel delta 0.1020 reported correctly), imported a `.colortrace` file through
   the real file-input path, and confirmed invalid files are rejected with a clear
   message. Schema strictness verified: malformed seeds are dropped on read with a
   "N unreadable local records were ignored" recovery notice, not a crash.

Screenshots (populated states): `screenshots/colortrace/populated.png`,
`screenshots/colortrace/comparison.png`, `screenshots/colortrace/empty-state.png`.

## Why the empty state confuses users

The live page shows: eyebrow "LOCAL-ONLY COLOR EVIDENCE", title "ColorTrace", one line
"No saved traces yet. Activate ColorTrace on a page to capture one.", and two buttons
(Import .colortrace / Clear local history). Then a vast white void. A stranger learns:

- Nothing about what ColorTrace is or what a "trace" is.
- That they need a browser extension they don't have (no link, no install hint).
- That on this public demo page they can literally do nothing to get a trace.
- "Import .colortrace" means nothing without a trace file, and there is no sample file.

Hans is right: it is a dead end for anyone who hasn't installed the extension, and it
explains nothing to those who have it open for the first time.

### What the empty state should become (NOT implemented — awaiting verdict)

1. One plain sentence under the title: what ColorTrace does and what a trace is.
2. A 3-step getting-started strip: install the extension (link to repo/releases) →
   press Alt+Shift+C on any page and click an element → come back here to compare.
3. A "Load sample traces" button that seeds 2-3 demo traces (the baseline/candidate
   pair above) so the dashboard is explorable without the extension. This alone fixes
   the dead-end for every visitor.
4. Keep the privacy contract visible (local-only, no screenshots, no page text) since
   that is the product's core trust argument.

## Bugs and rough edges found while using it

1. **Trace cards show no color.** The card header is "SRGB" (the color space, not the
   color); there is no swatch and no hex value visible. The actual color (#635bff) is
   buried inside the collapsed "Source evidence" section. For a color debugger, the
   color is invisible at a glance. (The separate -redesign repo fixed this with
   swatch-first cards.)
2. **Annotations are captured but never displayed.** The schema supports annotation
   notes; the dashboard's card renderer never renders them, so a note attached to a
   trace is silently swallowed. (Also fixed in -redesign.)
3. **Card title "SRGB" reads as the color name.** A non-technical user will think the
   color is called SRGB.
4. **The public demo is a one-way door.** Without the extension installed there is no
   path to ever seeing a trace; combined with (1)-(2) above, a visitor cannot evaluate
   the product at all.
5. **Recovery message wording**: "4 unreadable local records were ignored. Valid traces
   remain available. Use Clear local history to remove unreadable records." is good
   behavior (no crash), but a non-technical user won't know what an "unreadable local
   record" is.
6. **Compare UX is decent**: selecting one trace says "Baseline selected. Choose a
   candidate trace to compare."; a third selection is blocked with "Choose at most two
   traces to compare."; checkboxes relabel to Baseline/Candidate. No issues found.
7. **Export works without a `downloads` permission** (Blob/object-URL download) — good
   privacy-preserving design, verified present in code.
8. **Import replace-not-duplicate** is communicated clearly in the status line. Good.

## Standing questions for Hans's verdict

- Is the -redesign repo (swatch-first "Lab Notebook" cards, annotations visible)
  the direction, or should the original dashboard get the empty-state fix + swatches
  directly? Redesign repo still exists: https://builtbysai.com/ColorTrace-redesign/
- Should the public demo page get the "Load sample traces" button (it would make the
  page self-demonstrating without weakening the local-only story)?
