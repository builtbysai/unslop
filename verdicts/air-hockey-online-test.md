# Hans's verdict — air-hockey repos (2026-10-10/11)

Status: **consolidated to ONE repo — atelier-air-hockey kept, air-hockey-online-test deleted.**

## 2026-10-11 — Sharpened directive: one atelier repo (SUPERSEDES the keep-both call below)
Hans: multiple atelier repos shouldn't exist — figure out what's actually different, keep the ONE real one, delete the rest.

**What's actually different (full tree diff of both mains):**
- `atelier-air-hockey` = the real project. 140+ PRs of history (Game Feel V3, Online V2 resilience, ten tables). README is self-consistent (points to its own live URL `builtbysai.com/atelier-air-hockey/`). Latest commit `85625c5` (2026-10-03) is Hans's own **"Revert to #132 state"** — deliberate: "The Game Feel V3 rework removed the slow-mo beats that gave hits their weight; this returns the game to its last known-good feel. History preserved, fully reversible."
- `air-hockey-online-test` = a 3-commit testbed: `seed` (copy of an experimental **online-playability branch** containing sim-time-dilation netcode — snapshot flag bits 64/128 syncing hit-stop freeze + smash slow-mo to the guest's dead reckoning, 8KB realtime buffer, honest drop reporting), `Deploy online-playability branch for two-browser test`, and my defaults/scrollbars PR #1. Its README points AWAY from itself to `builtbysai.com/atelier-air-hockey/` — a fork signature, not a product.
- The sim-time-dilation netcode was part of the same experimental direction Hans reverted on Oct 3, so it was NOT ported. Preserved as a recoverable patch: `verdicts/sim-time-dilation-experiment.patch` (165 lines, net.js only).

**Decision: KEEP `atelier-air-hockey`, DELETE `air-hockey-online-test`.** Evidence: mainline history + self-consistent README/live URL vs. 3-commit testbed whose own README defers to the main repo; Hans's revert marks atelier main as the curated state.

**Ported Hans's requested work before deleting:** the defaults/scrollbars changes (his explicit order) were re-applied to atelier-air-hockey as PR **#142** (`bugfix/comfortable-defaults-noir-scrollbars`), squash-merged as `1fb0899d`, branch deleted. Changes are byte-identical to the onlinetest PR: `src/game.js` (shake full→subtle, effects full→subtle, SFX 100→80, validation fallbacks), `src/ui.js` (session default honors subtle), `src/styles.css` (noir brass dialog scrollbars), 2 test updates, CHANGELOG entry, rebuilt `sw.js` cache name.
- Tests: 416 unit, 395 pass / 21 fail — failure set **byte-identical** to the unmodified atelier baseline (timings stripped, sorted diff empty). Zero new failures. `npm run syntax` passes; repo's `check.mjs` fails identically on baseline (stale `/guestOwnsRight/` guard, pre-existing).
- Live verified at https://builtbysai.com/atelier-air-hockey/ : `src/game.js` serves `shake: 'subtle'`, `src/styles.css` serves `scrollbar-color:#8a6d2f`.
- Screenshot: `screenshots/after/atelier-prefs-after.png` — Preferences modal (Feel tab) with Screen shake: Subtle, Effects: Subtle selected. (Headless shell has no outbound network — `ERR_TUNNEL_CONNECTION_FAILED` — so the shot was taken against a local serve of the exact merged tree; live files verified separately via curl above.)
- Deletion: `DELETE /repos/builtbysai/air-hockey-online-test` → 204, confirmed 404.

## Earlier 2026-10-10/11 work (kept for history)

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
