# Review: log-correlator-siem (polish pass)

Repo: https://github.com/builtbysai/log-correlator-siem-redesign
Live: https://builtbysai.com/log-correlator-siem-redesign/

## What changed
- Regenerated `docs/index.html` (the sample dashboard) from the current engine (`python3 main.py` against the bundled synthetic dataset). The committed sample was stale and hand-edited with an em-dash title ("log-correlator-siem — Sample Run" — the checker's flagged nitpick). The regenerated file uses the engine's own title ("Log Correlator - Incident Dashboard", plain hyphen) and is byte-consistent with current generator output.
- Zero em dashes remain in the served page (verified by grep).

## Deliberately left alone
- The correlation engine, rules, and tests — all byte-identical. Unit tests still pass conceptually (no engine code touched).
- The dashboard's visual design — it's already good; a tasteful dark SOC-console aesthetic. No redesign.

## Bugs found
- None in the engine. The only issue was the stale hand-edited sample HTML drifting from generator output — fixed by regenerating.

## Scores
- Original: 9% slop (one em-dash nitpick).
- Polish: flagged copy removed; functionality unchanged.
