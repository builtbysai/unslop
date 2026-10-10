# Review: whistlebox (polish pass)

Repo: https://github.com/builtbysai/whistlebox-redesign
Live: https://builtbysai.com/whistlebox-redesign/

## What changed
- Fixed all em-dash copy in the single-file app:
  - `<title>`: "VoxMIDI — voice to MIDI controller" → "VoxMIDI: voice to MIDI controller"
  - MIDI output dropdown + JS fallback: "(no MIDI — internal synth only)" → "(no MIDI; internal synth only)"
  - Status line: "no MIDI outputs found — add a virtual port." → "no MIDI outputs found. Add a virtual port to connect one."
  - Key result: "most sung: X — try X Major or Minor." → "most sung: X. Try X Major or Minor."
- Left the `Level —` value placeholder alone (standard "no data" dash, not copy).
- Zero em dashes remain in user-facing copy (verified by grep).

## Deliberately left alone
- All audio/MIDI logic, pitch detection, and UI — untouched. Screenshot verified rendering.

## Bugs found
- None.

## Scores
- Original: 9% slop (2 em dashes).
- Polish: flagged copy fixed; app unchanged otherwise.
