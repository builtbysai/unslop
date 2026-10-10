# Redesign review: helpdesk-ticket-analytics

Redesign repo: https://github.com/builtbysai/helpdesk-ticket-analytics-redesign
Live sample report: https://builtbysai.com/helpdesk-ticket-analytics-redesign/
Original: https://github.com/builtbysai/helpdesk-ticket-analytics (untouched)

## What changed

Only the presentation layer changed. `metrics.py`, `loader.py`, `models.py`,
`cli.py`, the CSV summary, and all 14 tests are untouched and passing.

- **`ticket_analytics/charts.py`** rewritten: new `hbars()` (thin gridlines,
  label column, per-bar colors, optional value labels), `weekly_trend()`
  (thin ink line with a washed area, sparse date axis), `hour_strip()` (24 thin
  bars for staffing reads, peak hour highlighted), and `sla_band()` for the
  green/amber/red data palette. No default chartjunk: no rounded rainbow bars,
  no duplicated chart titles.
- **`ticket_analytics/report.py`** `write_html_report` rewritten as "The Weekly
  Ops Review": a printed operations-review handout. Warm paper (#f7f3e9),
  ink text, Noto Serif headlines with Liberation Sans body, one accent family
  (SLA green/amber/red used as data colors only). Inline CSS, zero CDN
  dependencies, works offline and prints cleanly (@media print rules included).
- Report structure now answers the three questions in order: executive summary
  (the 4 numbers that matter: SLA compliance, median resolution, open backlog,
  High-priority breaches), SLA by priority, resolution times, volume trend
  (weekly line, top categories, day-of-week, hour-of-day staffing strip), and
  backlog aging with a triage callout.
- Copy is in a human voice, zero em dashes, zero emoji, no lucide; the only
  icon is a hand-authored SVG ticket mark in the masthead.

## Bugs found during the build

1. **Day-of-week chart rendered with a huge empty gap** (pass 1). Root cause:
   not a chart bug, the figure sat in a stretched CSS grid cell next to the
   taller categories table. Fixed with `align-items: start` on `.grid-2`.
2. **Weekly trend showed a false crash at the left edge.** The first ISO week
   was partial (period starts May 1, mid-week). Now partial weeks at both
   edges are excluded and the caption says so.
3. **Value labels collided with axis ticks** on the day-of-week chart in its
   narrow column. Fixed by abbreviating labels (Mon..Sun), dropping per-bar
   value labels there (`show_values=False`), and keeping the exact numbers in
   the staffing callout.
4. **Shared-browser race on this VM:** the stock `cdp-shot.js` uses a fixed
   CDP port that other concurrent agents also use, and one screenshot came
   back as another agent's page entirely. Used a private copy on port 19301
   (`~/workspace/stage/helpdesk/cdp-shot-hta.js`) for all subsequent shots.

## Improvements over the original

- The original was a generic gray dashboard: 5 stat cards, one table, four
  rainbow bar charts with duplicated titles, no narrative. The redesign leads
  with a verdict ("We are meeting SLA, except where it matters most") and
  numbers a director can act on.
- SLA compliance is now color-banded (green >=95, amber 85-94, red <85) with a
  legend, plus a per-priority resolved/met/breached table, so the pain
  (High at 81.2%, 18 breaches) is unmissable.
- Staffing reads the original never had: hour-of-day strip with the peak hour
  called out ("Volume peaks at 1 pm, which is where coverage has to be") and
  a weekday/weekend collapse chart.
- Backlog aging gets a red "watch item" callout for the 21 tickets older than
  a week.

## Verification

- `pytest -q`: 14 passed.
- Console report and CSV summary output unchanged.
- No em/en dashes or emoji in the generated HTML (grepped, 0 matches).
- Served locally on port 8131, full-page screenshots at 1280px for
  before/after comparison.
- GitHub: source pushed to `main`, sample report as `index.html` on
  `gh-pages`, Pages enabled. https://builtbysai.com/helpdesk-ticket-analytics-redesign/
  returns 200 and serves the new report (title verified).
