# Code/Design Review: Extensible-Terminal

**Repo:** https://github.com/builtbysai/Extensible-Terminal (default branch `main`)
**Reviewed:** 2026-10-10 · read-only, via GitHub API (anonymous `git clone` is blocked on this VM; source pulled file-by-file with the user's PAT)
**Scope:** all 39 files — `terminal-core` (VT grid/parser, extension policy, composition, transitions, compatibility), `local-pty` (native PTY/ConPTY, SSH, tmux), `user-config` (Lua), `terminal-cli` (crossterm frontend), docs, scripts, tests.

## What it does

A minimal, cross-platform terminal emulator in Rust. `terminal-core` implements a compact but genuinely careful VT state machine (grid, SGR, scroll regions, alt screen, tabs, mouse-mode negotiation, Unicode/emoji width handling); `local-pty` attaches real processes via the OS PTY/ConPTY (plus thin wrappers that shell out to the system `ssh`/`tmux` binaries rather than reimplementing protocols); `terminal-cli` is a raw-mode frontend with damage-based rendering. Trusted user config is Lua; third-party extensions are capability-scoped data contracts only — no plugin runtime exists yet.

**Verdict: genuinely well-built.** This is the most careful "small core" codebase I've reviewed in this batch: bounded everything, fail-closed parsers, honest docs, and regression tests that actually pin the tricky semantics (DECSTBM edge cases, wide-cell normalization, overflow guards). The flaws below are real but mostly edges and layering warts, not rot.

## Bugs / flaws (with locations)

1. **Per-byte `Vec` allocation in the hot feed path** — `crates/terminal-core/src/terminal.rs:908`: `feed_byte` does `match self.parser.clone()` where `ParserState::Csi { params: Vec<u16>, .. }`. Every input byte while inside a CSI sequence clones a heap `Vec`. This is the project's own measured hot path (`release_metrics.rs` publishes feed-throughput as release evidence). Fix: `match` on `&mut self.parser` with `mem::replace`, or make the inner parser use the same fixed `[u16; 16]` array the two wrapper parsers already use.

2. **`finish()` can leak U+FFFD into the grid from inside a control string** — `crates/terminal-core/src/terminal.rs` (`feed_utf8_continuation`, ~line 1000): on an invalid continuation byte it calls `put_char('\u{fffd}')` *before* consulting parser state. `TerminalState::finish` (`terminal_state.rs:717`) feeds `[0x00, 0x1b, b'\\']`; if the stream ends as `\x1b]0;title\xc2<EOF>`, the NUL triggers the UTF-8 recovery while the parser is still mid-OSC, so the replacement char is rendered even though OSC payload must never produce cells. Contradicts the documented rule ("cancelled … without leaking retained payload text", `docs/KNOWN_LIMITATIONS.md`). Fix: in `finish`, cancel control-string state before running UTF-8 recovery.

3. **Inner grid parser leaks CSI finals of unsupported sequences when used directly** — `crates/terminal-core/src/terminal.rs` (`feed_csi`, `_ =>` arm ~line 955): an intermediate byte (e.g. `0x20`) drops the parser to `Ground`, so a following final like `q` is printed as text. The *wrapper* (`terminal_state.rs`) papers over this with its own discard state machine, and the inner `terminal::TerminalState` isn't publicly exported (`lib.rs` only re-exports the wrapper), so no public caller hits it — but correctness currently depends on "always enter through the wrapper," which is fragile layering. The docs describe consume-through-final as a property of the terminal; it should live in the inner parser.

4. **No producer for `EndpointEvent::Bell` / `TitleChanged`** — nothing in any crate ever constructs these variants (only test code in `event_queue.rs`); BEL (`0x07`) in `feed_ground` falls into `_ => {}` and is silently dropped. The CLI's bell/title handling in `main.rs` (`run()`) is therefore dead code, and OSC title sequences are consumed-and-discarded by design. Either wire BEL through or remove the variants — as-is they're misleading API surface.

5. **Windows: resize after child exit errors the whole app** — `crates/local-pty/src/lib.rs` (`poll_event`, `#[cfg(windows)]` block): after the child exits, `runtime.master.take()` releases the ConPTY handle (correct, documented ownership-loop workaround). But a subsequent host `Event::Resize` in `main.rs` calls `endpoint.resize(size)?`, which now fails with "transport is closed", and `run()` propagates it as a fatal error instead of exiting gracefully. Narrow race, Windows-only.

6. **Theoretical u16 overflow panic in `put_char`** — `crates/terminal-core/src/terminal.rs` (~line 560): `self.cursor.col + 1 >= self.size.cols` in the auto-wrap branch. With `cols = 65535` and a delayed-wrap cursor at 65535, `65535 + 1` overflows `u16` (panic in debug). Requires a 4-billion-cell allocation to reach, so purely theoretical — noted for completeness, not action.

7. **`--config` repeatable, `--ssh`/`--tmux` not** — `crates/terminal-cli/src/main.rs` (`parse_options_from`): passing `--ssh` twice is an error, but `--config` twice silently takes the last. Trivial inconsistency.

8. **`DEFAULT_TERM` is exported but unused** — `crates/terminal-core/src/compatibility.rs:7`; nothing outside that module references it. If no TERM is configured, the child just inherits the host's — which is fine, but then the constant is aspirational.

## Design / code quality issues

- **~1000 lines of un-consumed "small core" model.** `Composition`, `TransitionTracker`, `Surface`, `Command`, `Annotation`, the entire extension capability/inbox/host system, and the compatibility diagnostics are *not used by `terminal-cli` at all* (verified by grep — the CLI imports only `Cell/CellStyle/Endpoint*/TerminalColor/TerminalState/MouseTrackingMode`). They're coherent, well-tested abstractions for a multiplexer UI that doesn't exist yet. For an MVP this is speculative generality; either the next milestone wires them up or they should be cut to keep the "small core" claim honest.
- **Three CSI param machines with subtly different overflow semantics.** `terminal.rs` (Vec-based, truncates to 16 and *executes* the prefix), `terminal_state.rs` tab tracker and mouse tracker (fixed arrays, fail-closed with discard). The wrapper's existence is largely to compensate for the inner parser's looseness (see bug 3). Unifying on one bounded parser would delete a whole class of "which layer guards what" reasoning.
- **Duplicated mouse/tab observer parsers** (~250 lines each in `terminal_state.rs`) share ~80% structure (Ground/Escape/Csi/ControlString). A single parameterized observer parser would halve it.
- **`BoundedEventQueue::push` byte-budget check runs before the capacity check** (`event_queue.rs:88`): a single `Output` chunk larger than `max_output_bytes` is *permanently* backpressured even on an empty queue. That's arguably correct ("never silently drop"), but it means a host that configures the byte budget below the PTY reader's 16 KiB chunk size (`local-pty/src/lib.rs:26`) will disconnect every extension on the first burst. Worth a doc line or a clamp.
- **Magic numbers**: `READER_EVENT_CAPACITY = 64`, `SCROLLBACK_LIMIT = 10_000`, `LOOP_IDLE = 5ms`, `MAX_SESSION_NAME_BYTES = 128`, `MAX_GRAPHEME_SUFFIX_SCALARS = 15` — all reasonable, but only some are explained. Minor.
- **Positive notes**: error types are exemplary (`SshPtySpec`/`TmuxPtySpec` validation rejects option-injection, whitespace, control chars); `Drop` impls actually reap children (with cross-platform tests proving it); replies are never buffered inside the terminal (anti-amplification); `#[must_use]`/`forbid(unsafe_code)`/locked deps/pinned `unicode-width` throughout.

## Improvements (prioritized)

1. **Fix the per-byte parser clone** (bug 1) — it's the one change that affects the project's own headline metric. Restructure `feed_byte` to avoid cloning; measure with `release_metrics` before/after.
2. **Move consume-through-final into the inner parser** (bug 3) — delete the wrapper's compensating discard machine once the inner parser is correct on its own; then collapse the three CSI machines into one.
3. **Decide the fate of the unused model layer** — either build the multiplexer UI that consumes `Composition`/`Surface`/`ExtensionHost`, or move them to a clearly-marked `future/` module so "minimal" stays true.
4. **Wire or remove `Bell`/`TitleChanged`** (bug 4) — BEL → emit the event; OSC title → `TitleChanged`. Five lines each, and it deletes the dead CLI branches' mystery.
5. **Fix `finish()` ordering** (bug 2) and the Windows post-exit resize race (bug 5).
6. **Document the extension byte-budget vs. PTY chunk-size interaction**, or clamp `max_output_bytes` ≥ reader chunk at inbox construction.
7. Small: unify `--config` repeat behavior; use or remove `DEFAULT_TERM`; consider `?1047`/`?1048` alt-screen variants (some apps still emit them); clamp SGR mouse coordinates to terminal size instead of forwarding 65536.

## Slop assessment

Low. No em-dashes or emoji in code strings, no generic filler comments — the comments that exist explain genuinely non-obvious invariants (the ConPTY handle ownership loop, cmd.exe `/C` quoting, why `finish` feeds `[0, ESC, \]`). Doc comments are thorough to the point of verbosity, and `KNOWN_LIMITATIONS.md` is unusually long and defensive, which *could* suggest AI-assisted writing — but every substantive claim in it has a corresponding regression test, which is the opposite of slop. The main AI-shaped smell is structural, not textual: the large unused abstraction layer (extension host, composition, transitions) reads like "designed for completeness" rather than "grown from need." Tests are specific and adversarial (overflow, chunk-boundary, interleaving cases), not happy-path padding.

## Test/CI notes

- `cargo test --workspace --locked` + clippy `-D warnings` in CI on Ubuntu and Windows; `Cargo.lock` committed; smoke scripts drive the real binary through `less` on Unix and ConPTY on Windows.
- Could not run the suite here (read-only review; deps would need network fetch), but tests were read in full and are consistent with the implementation.
