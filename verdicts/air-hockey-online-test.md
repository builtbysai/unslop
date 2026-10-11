# Hans's verdict — air-hockey repos (2026-10-10/11)

Status: **all done — defaults retuned + scrollbars fixed (PR #1 merged), 4 obsolete repos deleted.**

## Part 1 — Inventory + open PRs
All 6 air-hockey repos under builtbysai checked via API. **Zero open PRs** on any of the 3 originals (air-hockey-online-test, atelier-air-hockey, atelier-ah-25d-preview).

## Part 2 — air-hockey-online-test: defaults + scrollbars (PR #1, merged)
Hans: "don't change the game, just the default settings — find the happy middle."

**Confirming the earlier polish:** the 9% em-dash flag was not in served code (only in docs/development-tracker.md, internal notes). Nothing visible changed in the polish pass — correct call.

**Default changes** (new players only; saved choices of returning players untouched; zero physics/feature changes):
| Setting | Before | After | Rationale |
|---|---|---|---|
| Screen shake | full | subtle | Full trauma shake + rotation on every hard hit is disorienting for first-timers; subtle (0.45x) keeps hits punchy without the quease |
| Effects (spectacle) | full | subtle | Full particle bursts are visual noise for new eyes; subtle keeps goal celebrations readable and fun |
| SFX volume | 100 | 80 | 100 on first load is startling; 80 is comfortable, still punchy, user can crank it |
| Music volume | 70 | 70 (unchanged) | already the calibrated unity point |
| Haptics | on | on (unchanged) | harmless mobile feedback, adds feel |
| First to / pace / replay / goal width / camera / controls | — | unchanged | already sensible middles |

Also fixed: `syncReducedMotionPreference()` in ui.js would have overridden the new shake default back to 'full' for users without reduced-motion — now honors the subtle default while still never overriding an explicit user choice. The visual-QA harness's forced full-effects scene (`goal-rival`) is not user-facing; left alone.

**Scrollbars:** the modal dialogs (`.overlay`/`.card` — Preferences, How to play, Rules, etc.) had unstyled default grey scrollbars. Now thin brass-on-dark scrollbars matching the noir aesthetic (`scrollbar-width: thin` + webkit rules, `#8a6d2f` thumb). Carousels/awards already hid theirs.

**Verification:** PR https://github.com/builtbysai/air-hockey-online-test/pull/1 (branch tune/defaults-scrollbars, squash-merged as efe9c574, branch deleted). Full test suite: 417 tests, 396 pass, 21 fail — identical to the pre-change baseline (all 21 pre-existing: netcode prediction, wake-lock, etc.; none related). Two tests that pinned old defaults updated (runtime-quality, music-config). Preferences modal screenshot on a fresh profile shows Subtle/Subtle/80% selected. Live at https://builtbysai.com/air-hockey-online-test/ verified serving the new code (Pages build completed).

## Part 3 — Obsolete assessment + deletions
| Repo | Verdict | Evidence |
|---|---|---|
| atelier-ah-25d-preview | **DELETED** | Desc: "Temporary preview of the 2.5D camera views (PR #12) for playtesting". PR #12 merged into atelier-air-hockey 2026-09-26. No README, untouched since 2026-09-25. Unambiguously obsolete. |
| atelier-ah-25d-preview-redesign | **DELETED** | One-line em-dash fix on the obsolete preview above. |
| air-hockey-online-test-redesign | **DELETED** | No-change pass (confirmed). Redundant. |
| atelier-air-hockey-redesign | **DELETED** | No-change pass (confirmed). Redundant. |
| air-hockey-online-test | **KEPT** | Active online-playability testbed (latest commit "Deploy online-playability branch for two-browser test"); Hans ordered work on it. |
| atelier-air-hockey | **KEPT** | The main game — full content, ten tables, distinct project. |

All 4 deletions: 204 via API.

## Screenshots
- screenshots/after/air-hockey-prefs-after.png — Preferences modal with new defaults selected.
