# Deferred: helpdesk-ticket-analytics program improvements (filed 2026-10-10)

**After the full repo audit.** Hans's order: redesign merged into the original 2026-10-10 (PR + merge; redesign repo deleted). Now improve the whole program.

## Improvement list (from the verdict conversation)
1. **Real data validation:** run it against a real (anonymized) ticket export so the story is genuine, not just the synthetic `generate_sample_data.py` output.
2. **Month-over-month trend comparison:** the current report is a single-period snapshot; directors want deltas.
3. **PDF export:** directors print these things — the HTML has @media print rules, but a one-click PDF would be better.
4. **README workflow demo:** show the actual workflow (CSV in → report out) so a hiring manager gets it in 30 seconds.

## Why it matters
Hans asked if this project deserves showcasing / helps with jobs. Assessment: yes for IT specialist / support roles — it turns raw helpdesk CSV exports into SLA answers a manager acts on. Python, data analysis, CLI design, tested code (14 tests). Not flashy, but employable.
