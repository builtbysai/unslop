# Hans's verdict — log-correlator-siem (2026-10-10)

Status: **kept and improved — "make it earn its place" for job hunting.**

## Hans's questions and the answers given
- **What is it?** A SIEM log correlator: Python engine turning SSH/sudo auth logs + firewall flows into MITRE ATT&CK-mapped incidents, rendered as a self-contained HTML dashboard.
- **Does it help get a job?** Yes, more than most of his repos. For SOC/security roles, a working correlation engine is real signal: log analysis, detection logic, incident workflow.
- **Does it deserve showcasing?** Yes, as a detection engine, not a pretty website. The dark SOC-console aesthetic is the genre, not a flaw.
- **Is it useful?** As a learning artifact and portfolio proof, yes. Synthetic data, demo scope, honestly presented.

## Work done (authorized, on the ORIGINAL repo)
PR #1: https://github.com/builtbysai/log-correlator-siem/pull/1 — "Tell the detection story: worked attack example, em-dash cleanup, regenerated dashboard"
- Merge commit (squash): `ed2541fdd421344ae094f7d98c2405e09b001c0e`; branch `story/detection-writeup` deleted.
- README: new "What it catches: a worked example" section walking the 34-event sample dataset as a full intrusion (brute force 03:14, foothold 03:14:52, recon 03:16, persistence 03:25, exfiltration 23:47) with real log excerpts and actual engine output. Shows the kill chain, not just the rule table.
- README: all 14 em dashes removed; test count corrected 35 → 25 (actual suite size).
- docs/index.html: regenerated from the current engine (was stale, still carried the old em-dash title "log-correlator-siem — Sample Run"). Now byte-consistent with generator output, 0 em dashes.
- No engine, rule, or test code touched. 25/25 tests pass.
- Live verified: https://builtbysai.github.io/log-correlator-siem/ serves the new dashboard; raw README on main has the worked example and 0 em dashes.

## Tooling note
`push-dir.py`'s Contents-API branch-seed hack failed again ("could not establish branch"); created the ref directly via `POST /repos/{owner}/{repo}/git/refs` first, then push-dir.py worked. Same workaround as the QRix-Minter run.
