# muse: v3 rebuild (2026-10-11) — SHIPPED AND LIVE

Hans rejected v2 ("looks like slop and disrespectful to the idea"): the
hustle-culture marketing framing ("Steal the technique. Skip the trap.",
"243 stealable techniques" counters) trivialized genuine art scholarship.
v2 was removed from the live site; v1 ("Commonplace Book" reading room)
was restored as interim. v3 was then rebuilt on v1's architecture.

**Live:** https://builtbysai.com/muse-redesign/ (PR #2 merged as `7f87f0f`,
gh-pages deployed as `ce1e57c`, verified 200 serving the v3 palette.)

## Design rationale: "The Print Room"

A quiet, scholarly digital reading room. Every choice grounded:

- **Cool gallery white `#fbfbfa`, not paper.** Art-historical scholarship
  is read in museum print rooms and study centers: neutral white walls,
  precise light, nothing competing with the work. Deliberately not
  warm/cream (warm = the rejected paper). Not dark either: 229 long-form
  notes must be read, and light surfaces serve extended reading.
- **One accent: oxide red `#8c3b2e`.** The red of sanguine chalk and
  printers' ink, the color of the etched line's own tradition. It was
  v1's accent and it earned its keep; kept for continuity.
- **System serif kept** (Iowan Old Style, Palatino, Georgia). Long-form
  art-historical prose deserves a book serif. The notes are the heroes.
- **Minimal chrome.** The double rules and paper-texture gradients were
  fake-book signifiers; replaced with hairlines. Quieter masthead
  (smaller display size). The 10 shelf colors kept as small functional
  markers (shelf identity, not page palette). Catalogue cards kept from
  v1 (white, hairline borders, subtler shadows).
- **Drop caps kept** on real prose. Search, `?theme=`/`?q=` deep links,
  prev/next shelf navigation, catalogue blocks, all 10 shelves preserved.
- **Zero marketing copy.** No counters as hero content, no reductive
  language. The colophon states plain facts (229 notes, 410,981 words,
  10 shelves). (The word "stealable" appears in the search index only
  because it is Hans's own vocabulary inside his notes: his data, never
  rewritten.)

## What changed from v1 (code)

- `build_index.py`: v1's generator (recovered from `fda8c64`) with a
  rewritten CSS system (17 precise edits: palette, hairlines, quieter
  masthead, neutral code colors, small-screen padding) + docstring.
  All other logic byte-identical (markdown renderer, parsing, SLUG_THEME
  filing, search JS, deep links).
- `build_site.py` (v2's generator) deleted. README rewritten.
- `site/`: regenerated (229 note pages + index + before.html).
  Zero em dashes in generator copy (verified by grep).
- Constraints honored: stdlib-only, no CDN, inline CSS/JS, works from
  file://.

## Verification

- Live index + note page return 200; served HTML confirmed carrying
  `surface:#fbfbfa` (v3). Title "Muse, a Commonplace Book" kept.
- Screenshots: `screenshots/after/muse-v3-index.png`,
  `muse-v3-note.png`, `muse-v3-index-mobile.png`,
  `muse-v3-note-mobile.png` (all pixel-verified as the v3 site).
- Screenshot note: one capture in the batch picked up a sibling agent's
  page (known shared-CDP-port hazard on this VM); retaken on a private
  port and pixel-verified.
- Formal slop-checker run still to do via live browser by the parent
  (checker has no API; screenshot-mode floor is ~17%).

## Coordination note (2026-10-11)

A sibling agent appears to have built a *different* v3 in parallel
(porcelain `#f7f8f7` + Prussian blue `#10406b`, catalogue rows instead
of cards; screenshots `muse-v3-*-desktop.png`, described in the earlier
draft of this file's top section). It pushed a branch also named
`v3-reading-room` but did NOT touch main or gh-pages. What is live
right now is the gallery-white/oxide-red v3 described above. The parent
should reconcile: show Hans one, archive or discard the other. Do NOT
let both land on main/gh-pages.

---

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
