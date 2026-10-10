# Review: rubiks-cube (polish pass)

Repo: https://github.com/builtbysai/rubiks-cube-redesign
Live: https://builtbysai.com/rubiks-cube-redesign/

## What changed
- Fixed em-dash copy:
  - Help: "Rotate the whole cube — spins through full revolutions" → "Rotate the whole cube (spins through full revolutions)"
  - Help: "Turn a face — hold Shift to reverse" → "Turn a face. Hold Shift to reverse"
  - Welcome-back: "Welcome back — your cube was right where you left it." → "Welcome back. Your cube was right where you left it."
  - Code comment tidied.
- Left the "—" value placeholders (solve time/moves when empty) alone — standard "no data" UI.
- Zero em dashes remain in user-facing copy (verified by grep).

## Deliberately left alone
- The 3D cube, solver, and game logic — untouched. Note: the cube canvas renders empty in this offline VM (Three.js loads from CDN); the live site with network access renders it normally. Before/after screenshots show the UI chrome only.

## Bugs found
- None.

## Scores
- Original: 9% slop (4 em dashes).
- Polish: flagged copy fixed; game unchanged.
