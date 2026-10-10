# Review: creative-experiments redesign

Redesigned in `builtbysai/creative-experiments-redesign` (source on `main`, live build on `gh-pages` via GitHub Pages).
Live: https://builtbysai.com/creative-experiments-redesign/ · Original: https://builtbysai.com/creative-experiments/

## What the original was
The original repo had no index page at all: 5 files (README, three single-file experiments). GitHub Pages served the Jekyll-rendered README, which was also stale (listed only one of three projects). Scored 22% slop.

## Bugs / flaws found
- **Stale README:** listed only "Too Big To Go Home"; jellyfish and salamander were invisible to visitors.
- **No index page:** the "site" was a default Jekyll theme, zero curation of the actual work.
- **jellyfish loads three.js from jsDelivr CDN** (`three@0.180.0` + addons). If the CDN is unreachable the piece sits on "deepening water" forever; there is no local fallback and no error message beyond a WebGL fallback div. Left as-is (art untouched), but the redesign's gallery does not depend on it.
- **too-big-to-go-home pulls Google Fonts from CDN** (Rye); also left as-is.

## Improvements made
- New hand-built gallery, "Field Notes": warm paper and ink, Fraunces + Plex Mono self-hosted woff2 (no CDN), three specimen plates (No. 01-03) with real captured posters, medium/interaction notes, custom SVG arrow icons, pinned-plate frames, hand-drawn divider, human copy.
- Slop greps on the new page: 0 em dashes, 0 emoji, 0 lucide references.
- The three studies are byte-identical to the original; only the gallery is new.
- 3 visual iteration passes (fixed: broken figcaption CSS from a bad edit, tbtgh poster letterboxing, mobile caption crowding).

## Scores
- Original: 22% slop.
- Redesign: pending parent's live re-check.
