# Hans's verdict — NOD redesign (2026-10-10)

Status: **rejected — "the redesign for this is horrible", prefers the original.**

## Notes
1. **Delete the redesign repo** (`builtbysai/NOD-redesign`) — done 2026-10-10.
2. **Original is broken on Netlify:** visiting links shows "NOD 404 / LOST PATH — Path not found. This NOD link does not exist." Hans believes it wasn't correctly launched. Diagnose and fix so short links actually resolve (likely SPA redirect rule and/or Functions backend issue).
3. **Text-only cleanup on the ORIGINAL** (`builtbysai/NOD`): em dashes, AI signatures, reassurance language. No design changes.

## Plan (authorized)
- Diagnose Netlify deploy (site n0d): netlify.toml, _redirects, functions dir, build settings. Fix + redeploy (explicitly authorized; keep deploy previews/branch deploys off).
- Text cleanup: PR against original main, merge, verify live.
