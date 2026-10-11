# muse: v2 rethink (2026-10-10)

Hans's verdict on the v1 redesign ("i dont like the color and style. think
about a better way to present all of it") rejected the whole presentation
approach, not just the palette. Explicit authorization to rebuild. This
document records what was wrong, the new thinking, and what was built.

## What was wrong with v1

The v1 redesign ("MUSE & the Commonplace Book") treated the notes as texts
to be *read slowly in a reading room*: warm paper, ink, serif, drop caps,
shelves with poetic names ("Print & the Etched Line", "The Living Sketch").

That metaphor misreads the material. These 229 notes are not essays for
leisurely reading. They are a researcher's workbench: every note ends in
"Techniques to steal", "Avoid-list additions", "Palette and composition",
"Next doorways", "Honest gaps". The verbs of the corpus are *steal, avoid,
mix, follow, revisit*. A commonplace book optimizes for the wrong job: it
invites browsing shelves when the actual problem is **finding things in
411k words of working notes**.

Secondary problems: the card grid repeated the same boilerplate excerpts
("Hop-only session, queue exhausted..."), the shelf sections made the page
enormously long, and nothing in the design reflected that the subject is
*computational* art.

## The new IA: organize by function, not subject

The 10 hand-curated themes are kept (as filter facets), but the primary
structure is now a functional cross-cut derived from the section headings
the notes actually use:

- **Index** — all 229 notes as a dense, sortable/filterable list (title,
  theme, study date, read time, word count, and T/A/P/D/G chips showing
  which functional sections each note contains). Instant search across
  titles, headings, excerpts, and section bullets, with highlighted
  snippets. Command-K overlay with keyboard navigation.
- **Steal this** — 243 stealable techniques aggregated from every
  "Techniques to steal / Core techniques" section, each linked to its note.
- **The avoid-list** — 661 collected traps and overdone moves.
- **Palettes and composition** — the 25 notes with palette sections, full text.
- **Open doorways** — 291 research threads left open on purpose.
- **Honest gaps** — 225 admitted blind spots: a research backlog.

Findability is the core feature: search is the hero, every aggregate view
has its own filter, and deep links (`?theme=sound&q=molnar`) still work.

## Design language and why

Digital-native, grounded in the content's purpose. This is research *about*
computers that draw, so the site looks like the machine room, not the
library:

- Near-black substrate (`#0a0c10`), system grotesk headlines, mono for all
  metadata (dates, counts, spec sheets). No serif, no paper, no parchment.
- One signature accent: acid "plotter green" (`#b7f34b`), with per-view
  accents (avoid = signal orange, palettes = violet, doorways = cyan,
  gaps = amber) for orientation.
- The hero is a **generative flow-field canvas** (seeded, ~60 lines, no
  dependencies, respects reduced-motion): the site itself is a generative
  artifact, which is what the notes are about.
- Note pages are spec sheets: mono metadata grid (theme / studied / words /
  read / sections / contains), anchor TOC, dark code blocks, related notes
  in the same theme, newer/older navigation.

Still fully static, stdlib-only generator, no CDN, no fonts fetched, works
from file://.

## What was built

- New generator `build_site.py` (replaces `build_index.py`, deleted).
  Reuses the v1 markdown renderer and the hand-curated `SLUG_THEME` filing.
- `site/`: `index.html`, `techniques.html`, `avoid.html`,
  `palettes.html`, `doorways.html`, `gaps.html`, `notes/*.html` (229).
- Branch `v2-research-index` -> PR #1
  (https://github.com/builtbysai/muse-redesign/pull/1) -> squash-merged to
  `main` (merge sha `3f51a1b8`).
- Deployed to `gh-pages` as a fresh tree (exact copy of `site/` at branch
  root, commit `1783035d`; old build artifacts and vendored copies removed
  from the deploy branch).
  Live: https://builtbysai.com/muse-redesign/ (verified: new title,
  techniques view 200, note pages serving new content)
- Screenshots: `screenshots/before/muse-before-v1.png` (v1 baseline),
  `screenshots/after/muse-redesign-v2.png` (desktop),
  `screenshots/after/muse-redesign-v2-mobile.png` (390px).

## Why the redesign repo stays the standalone product

The original `builtbysai/muse` is 229 markdown notes with no UI at all;
its "interface" is the GitHub file listing. Merging a website into it
would mix a built artifact with the research source. The redesign repo
vendors the notes and owns the generator + generated site, so the original
stays a clean data source and reverting the site is deleting one repo.

## Verification

- All 229 notes parse; zero missing themes; stats: 410,981 words,
  243 techniques / 661 avoid / 291 doorways / 225 gaps / 25 palettes.
- Headless CDP tests, zero JS errors: search ("molnar" -> 2 results),
  theme chip filter (sound -> 23), contains filter (techniques -> 64),
  A-Z sort, command-K (9 hits for "flow field"), aggregate text filter
  ("gradient" -> 29 of 661), aggregate theme filter.
- Visual passes: index hero (canvas animating), rows, techniques view,
  palettes view, note page (spec sheet, TOC, code blocks, tables, related,
  prev/next), mobile 390px.
- Generator copy has zero em dashes (remaining ones are inside note
  titles, which are the researcher's data and were not rewritten).
- Slop-pattern self-scan: zero emoji, zero em dashes, zero AI-tell phrases
  in generator-authored copy across all six view pages.
- Formal slop-checker run (ai-slop-checker.vercel.app) still to do: the
  checker is a browser web app with no API, so it needs a live-browser pass
  by the parent. Note the standing caveat: the checker reads via r.jina.ai
  + microlink, which cache aggressively, so re-check a few minutes after
  deploy and treat an identical score as a stale cache.
