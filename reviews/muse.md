# Review: muse redesign

Redesigned in `builtbysai/muse-redesign` (source on `main`, generated site on `gh-pages` via GitHub Pages).
Live: https://builtbysai.com/muse-redesign/ · Original: https://github.com/builtbysai/muse (a bare repo of 229 markdown notes; its "UI" was a GitHub file listing)

## Design thesis
muse is not an app; it is a researcher's shelf. The redesign treats it as a commonplace book, a reading room rather than a file listing: warm paper, ink, double rules, small caps, an editorial serif with real hierarchy. The generator (`build_index.py`, stdlib only) is a genuine repo feature: it parses all 229 notes, files each onto one of 10 hand-curated shelves (Print & the Etched Line, The First Programmers, Sound & Music Systems, The Living Sketch, Light Color & the Eye, Machines in Motion, Paint & Sculpture, Text Type & Concrete Poetry, The Playful Web, Scenes & Gatherings), and pre-renders every note to a standalone HTML page with a catalogue card, drop cap, and prev/next navigation. Search and shelf filtering are vanilla JS with no dependencies; the whole site is inline CSS/JS and works from file://.

## Bugs / flaws found
- **Drop cap landed on metadata.** The first body paragraph of most notes is a `**Date:** … **Artist:** …` metadata line, so the drop cap rendered as a lone "D" followed by "ate:". Fixed by extracting the leading metadata block into a styled catalogue card (`<dl>`), so the drop cap now falls on real prose.
- **Byline repeated the theme name** already shown in the theme tag above the title. Removed the duplication.
- **Card excerpts opened with boilerplate** ("Deep study, 2026-10-04. Hop-only session, queue exhausted…"). Stripped the leading study-status boilerplate from excerpts; the date already appears in the card meta line.
- **Four titles kept a mid-title "Study Notes"** ("jackrugile: Study Notes (deep, both pens)"). Added a mid-title strip rule; verified all 229 titles.
- **Search corpus was thin** (title + excerpt + date only). Enriched with section headings and theme names; index.html grew 214KB to 276KB, still trivial.
- **Catalogue extractor risk:** bold prose lead-ins (e.g. `**(Des)Ordres, 1974.** …`) could be mistaken for metadata labels. Guarded with a label heuristic (3 words max, 28 chars max, letters/spaces/slashes/hyphens only); verified against all 229 notes, including plain-prose openers (james-ensor) and stubs (tksiiii).

## Improvements made
- Hand-rolled markdown renderer (h1-h3, bold, italic, code, links, lists, fenced code blocks, blockquotes, rules, pipe tables); verified on table-heavy (hershey-fonts) and code-heavy (bit-101) notes.
- Per-note pages: catalogue card, drop cap, section rules, dark code blocks, styled tables, prev/next shelf navigation, back-to-shelves links.
- Index: masthead with colophon (229 notes, ~411k words, 10 shelves), live search with result counts and empty state, theme filter chips with counts, deep-link support (`?theme=sound&q=molnar`), theme sections with blurbs.
- Fully self-contained: no CDN, no fonts fetched, no JS framework; confirmed rendering from file:// as well as localhost.
- Zero em dashes and zero emoji in generator-authored copy (note content itself is the researcher's data and was not rewritten).

## Verification
- 3 visual passes: index top, card grids, note pages (top/mid), table rendering, code blocks, mobile 390px.
- Functional CDP tests: search ("molnar"), theme chip filtering (sound: 23 shown, 1 section visible), clear button, deep links, note page structure (h2/pre/table/nav counts), prev/next links.
- Before baseline: plain unstyled `<ul>` of all 229 titles screenshotted as `screenshots/before/muse-before.png`.
