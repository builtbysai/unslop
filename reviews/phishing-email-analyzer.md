# Redesign review: phishing-email-analyzer report

## What was redesigned
Only `phishing_email_analyzer/reporting.py` (the HTML report renderer). The analyzer engine
(rules, scoring, risk bands, JSON export, CLI) is untouched. All 46 tests pass after the change.

## Bugs / issues found in the original report
- **Generic dark-neon SaaS aesthetic.** Radial blue gradient background, glowing accent blue,
  four different risk colors plus blue: the severity signal competes with decoration.
- **Critical evidence hidden behind `<details>` disclosure.** The most important content
  (findings, auth trail) is collapsed by default for low-risk messages, which is fine, but the
  collapsed card gives no reason to open it and no recommended action.
- **No analyst read.** The original lists findings but never synthesizes them into "what this
  means" or "what to do", which is what a triager actually needs.
- **Auth badges are tiny and easy to miss**, and pass/fail carry equal visual weight.
- **URLs and attachments are dumped in two boxes** with no handling warning beyond the footer.
- **No index.** With 7 messages the analyst must scroll every card to find the dangerous ones.

## What changed (the Intercept Dossier)
- **Briefing-document structure:** cover strip with offline notice and UTC timestamp, serif
  masthead ("The Intercept Dossier"), executive read with batch stats, case index table with
  anchor links, one case file per message, methodology footer.
- **Verdict up top in every case:** severity-stamped verdict word, mono risk score, thin meter.
- **Severity is the only color:** critical red and high amber; everything else is ink, bone,
  and gray. Auth PASS renders quiet, FAIL red, SOFTFAIL/NONE amber.
- **Analyst read:** a short human-voice paragraph per case composed from the top findings
  (credential ask, link-text mismatch, lookalike domain, display-name spoof, and 6 more
  patterns), plus a band-specific closing line. Low cases get a plain "no indicators" read.
- **Authentication trail:** SPF/DKIM/DMARC as a labeled mono grid with the raw reported value.
- **Findings:** numbered, weight-labeled (+22 points), categorized, with quoted monospace
  evidence blocks.
- **Exhibits:** links shown as plain non-clickable text with a "do not open" warning;
  attachments listed alongside.
- **Recommended action:** a directive box per case, copy tuned per risk band.
- **Cleared messages** get compact case files (verdict, signal, auth trail, action) instead of
  empty finding tables.
- **Print stylesheet** for analysts who print the dossier; responsive down to mobile widths.
- **Constraints honored:** inline CSS only, no external assets, no `<script>`, no clickable
  URLs (test suite asserts all of these), every message-derived value HTML-escaped,
  zero em dashes, zero emoji, one hand-authored SVG sigil, no icon library.

## Verification
- `python3 run_tests.py`: 46 passed, 0 failed.
- Report HTML checked: `<style>` present, no `<link>`, no `<script>`, no `<a href="http"`,
  no em dashes, no emoji.
- Visual passes: 2 full reviews of locally served screenshots (segmented CDP capture;
  the stock `cdp-shot.js` full-page capture duplicates content on pages taller than ~9k px,
  so a segmented capture helper was added at `~/workspace/tools/cdp-shot-segments.js`).
- Pass 2 fixes: cleared cases now show "Risk 0/100" (previously no score shown); the
  exhibits "do not open" warning now only renders when links exist.

## Artifacts
- Before: `~/workspace/slop-audit/screenshots/before/phishing-email-analyzer-before.png`
- After: `~/workspace/slop-audit/screenshots/after/phishing-email-analyzer-report.png`
- Live: https://builtbysai.com/phishing-email-analyzer-redesign/
- Repo: https://github.com/builtbysai/phishing-email-analyzer-redesign
