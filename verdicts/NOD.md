# Hans's verdict — NOD redesign (2026-10-10)

Status: **rejected — "the redesign for this is horrible", prefers the original.** Redesign repo `builtbysai/NOD-redesign` deleted 2026-10-10.

## Task 1 — Netlify launch fix (DONE)

**Hans's symptom:** short links showed "NOD 404 / LOST PATH — Path not found. This NOD link does not exist."

**Root cause (two layers):**
1. **Stale deploy:** the last 5 production deploys (Sept 10–12) were all skipped with "account credit usage exceeded", so the live site was a month-old static-only deploy with **zero functions**. The short-link backend never made it to production.
2. **Broken rewrite rules:** once a fresh build shipped the functions, short links STILL 404'd. Netlify does not substitute `:slug` placeholders into the **query string** of 200-status rewrites to functions (`to = "/.netlify/functions/redirect?slug=:slug"`), so every function received an empty slug. Fix: pass the slug as a **path segment** (`/.netlify/functions/redirect/:slug`) with a shared `requestSlug()` helper (query param kept as fallback). A mid-pattern placeholder (`/api/links/:slug/stats`) also mis-captured, so the stats endpoint moved to `/api/link-stats?slug=X` (query strings pass through 200 rewrites automatically per Netlify docs).

**Changes (all merged to main):**
- PR #1 (squash `0717b327`): slug-as-path-segment rewrites + `requestSlug()` in `redirect.js`, `link-delete.js`, `link-stats.js`, `_shared.js`. https://github.com/builtbysai/NOD/pull/1
- PR #2 (squash `3b9d1fb4`): stats rewrite via splat (superseded by PR #3).
- PR #3 (squash `bd60dd15`): stats via `/api/link-stats?slug=` + frontend call sites + `[context.deploy-preview]`/`[context.branch-deploy]` ignore rules (production-only builds, protecting build credits). https://github.com/builtbysai/NOD/pull/3
- Direct commit `cb734b26`: README em dashes (no build triggered — README not in Netlify watched paths).

**Verified live on https://n0d.netlify.app/ (2026-10-10):**
- Create link via API → 201 ✓
- Short link resolves → **302** to destination ✓ (was 404 LOST PATH)
- Stats endpoint → 200 with real click data (redirect click recorded: country/device/referrer) ✓
- Bogus slug → clean 404 ✓; homepage → 200 ✓

**Credit note:** builds were blocked Sept 10–12 by exceeded credits; the monthly reset cleared before this fix, and builds were used deliberately per Hans's instruction to fix the launch. Deploy previews/branch deploys are now explicitly ignored in netlify.toml so only main builds consume credits.

## Task 2 — Text-only cleanup (DONE)

Scanned all user-facing copy (`docs/index.html`, `docs/app.js`, `docs/404.html`, function strings, README, SECURITY):
- **Em dashes:** 0 in app code; 2 in README.md (title + hero alt) → replaced with colons (commit `cb734b26`).
- **AI-signature phrasing / reassurance language:** none found. The copy was already clean ("A quiet tool for noisy URLs", "Less dashboard. More instrument.").
- **Zero UI/design/functionality changes.**
