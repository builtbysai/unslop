# Code/Design Review — fullframe (builtbysai/fullframe)

**Reviewed:** 2026-10-10 · shallow clone of `main` · read-only review, no changes made.
**Scope:** README, docs/PLAN.md, all of `src-tauri/src` (main.rs, recording/{mod,pipeline,capture,encoder,encoder_cpu,mp4_muxer}.rs),
all of `src/` (editor.js, overlay.js, main.js, shared.js, recording.html), `extension/` (background.js, popup.js, manifest.json).

---

## What it does

FullFrame is a cross-platform (Tauri v2: Rust + vanilla JS) screenshot utility aiming for Snipping Tool parity and beyond: region/fullscreen/window/delayed capture, a full canvas annotation editor (shapes, text, blur/pixelate, crop, step badges, undo/redo), pin-to-screen, clipboard/save, tray + global hotkeys, a screen recorder (hand-rolled H.264/OpenH264 pipeline + hand-written MP4 muxer, no ffmpeg dependency), and a companion MV3 browser extension that captures full web pages via CDP `Page.captureScreenshot` (with tiled fallback for pages >16384 px).

**Verdict: genuinely well-built.** This is one of the stronger small-codebase projects I've reviewed — real architecture thinking (trait seams for future HW encoders, pull-model window init to kill a push-before-ready race, per-monitor HiDPI math), honest edge-case handling in comments, a working test for the MP4 muxer, and verification notes in PLAN.md describing bugs actually found and fixed during testing. It is a dev-stage v0.2, not a finished product, and the findings below are proportional to that.

---

## Bugs / flaws (by severity)

### 1. Mixed logical/physical pixel units on the region-recording path (real bug on HiDPI multi-monitor)
`src-tauri/src/main.rs:265` — in `finish_region_capture`'s record-mode branch:
```rust
let region = recording::pipeline::RecordSource::Region {
    x: geo.x + px as i32,   // geo.x is LOGICAL (MonitorGeo comment: "logical px")
    y: geo.y + py as i32,   // px is PHYSICAL (logical selection × scale)
    ...
```
`geo.x` is documented as logical virtual-desktop coordinates (`MonitorGeo`, main.rs:26-34), while `px`/`py` are physical pixels (logical selection multiplied by `geo.scale`). The recording pipeline works in desktop *physical* pixels (`crop_region`, pipeline.rs:64; `capturer.origin()` from `xcap` physical coords). On any monitor with scale ≠ 1 (or any negative-offset layout where the logical/physical origins diverge), the recorded region starts at the wrong place — mixing a logical origin with a physical offset. The screenshot path is unaffected (crop is within-monitor), which is likely why it survived testing.

**Related inconsistency:** overlay windows are positioned with `position(g.x, g.y)` (main.rs:206) — correct only if `g.x` is logical — while `open_indicator` (recording/mod.rs:110-115) divides `mon.position()` by `scale_factor`, implying physical. The two call sites assume opposite units; at least one is wrong on HiDPI multi-monitor. Pick one convention, assert it, and convert at the boundary.

### 2. `overlay_open` flag is set before overlays exist, contradicting the code's own comments
`src-tauri/src/main.rs:176` sets `overlay_open = true` immediately after monitor captures, while the comments at :178 ("keep the flag false until every overlay is up") and :224-225 ("Only now mark capturing") claim it stays false until all overlay windows are built — and :225 sets it true a *second* time. The failure path (`close_overlays` → sets false) saves it from wedging, but the comment is stale and the double-set is confusing. Either move the single set to after the loop or fix the comments.

### 3. Starting "Record region" while a screenshot overlay is already open silently hijacks the in-progress selection
`src/main.js:10` — `btnRecRegion` calls `begin_region_record` with no error handling; `begin_region_record` (main.rs) calls `set_record_mode(Some(fps))` and then `begin_region_capture`, which early-returns `Ok(())` if an overlay is already open (main.rs:143-145). The user thinks they started a *new* recording flow, but their pending screenshot selection will now feed the recording pipeline (`finish_region_capture` takes `record_mode`, main.rs:258). Fix: `begin_region_record` should refuse (or `cancel_capture` first) when `overlay_open` is already true in screenshot mode.

### 4. Unhandled promise rejections in `main.js` for recording commands
`src/main.js:10` (`btnRecRegion`) and `btnDelay` have no `try/catch` — unlike `btnRecFull` which does. If `begin_region_record` fails (e.g. "already recording", or `create_capturer` failing on Wayland — see #6), nothing tells the user. Add the same `toast('Recording failed: ' + err)` treatment.

### 5. Delayed capture can leave the app with no visible window
`capture_delayed` (main.rs:400-431) hides the main window before the shot and only re-shows it on *error* (:427). On success via region mode, if the user then presses Esc, `cancel_capture` closes overlays but never re-shows main — the app is tray-only with no indication. Either re-show main after cancel, or emit a notification. (On success → editor path it's arguably fine since the editor is visible.)

### 6. Recording almost certainly doesn't work on Wayland, and failure surfacing is weak
`capture.rs` on Linux uses raw `x11rb` (`X11Capturer::new` → `x11rb::connect`). On a pure-Wayland session (no XWayland) this fails; README documents Wayland screenshot support via portal but nothing about recording. The failure path: `capture_loop` prints to stderr and returns → `encode_loop` gets zero frames → `stop_recording` returns `"no frames were captured"` → `stopFlow` in recording.html shows `Error: ...` with the indicator stuck open (the error branch re-enables the button, so it's recoverable — good). But the *start* path gives no immediate feedback (see #4). At minimum, probe `create_capturer()` in `begin()` before opening the indicator and surface a clear "recording needs X11/XWayland" error.

### 7. `save_data_url` silently writes PNG bytes under non-PNG/JPEG extensions
`src-tauri/src/main.rs` `save_data_url`: only `jpg`/`jpeg` are special-cased; anything else (`.webp`, `.bmp`, `.tif`) writes the PNG data URL bytes as-is. README claims "format follows the file extension you pick." Either restrict the save-dialog filters to png/jpg (frontend already does — editor.js:417) and validate server-side, or convert. A `.webp` file that is actually PNG will confuse other tools.

### Minor / edge cases
- **Undo stack memory:** `snapshot()` (editor.js:35) stores a full PNG data URL per undo entry, up to 40 deep. A 4K capture's PNG can be 10-20 MB → undo history alone can hold hundreds of MB. Bounded, but worth a cap on bytes or fewer entries for large images.
- **`begin_region_capture` holds the `previews` lock while building overlay windows** (main.rs:180-222). No deadlock today (overlay JS pulls asynchronously), but a blocking window-creation call while holding a lock that `overlay_ready` needs is fragile. Restructure to clone the needed PNGs and drop the lock before the loop.
- **`crop_png` (main.rs:78):** `x.min(iw - 1)` is safe only because of the earlier `iw == 0` check — correct but subtle; a comment would help the next reader.
- **capture_loop pacing** (pipeline.rs:113-125): after the resync branch, `n += 1` runs unconditionally — off-by-one after resync, harmless in practice.
- **Linux `get_image` uses `x as i16`** (capture.rs:146): monitors positioned beyond ±32767 physical px will fail capture. Absurd today; fine to note.
- **`temp_output`** (recording/mod.rs:44): second-granularity timestamp — two recordings started within the same second collide. Add PID or a counter.
- **`tray-rec-stop` when idle** just shows the main window (main.rs:666-669) — reasonable, but a disabled menu item would communicate state better (menu items can't easily toggle; acceptable).
- **Delayed capture thread** (main.rs:402): uses `std::thread::sleep` countdown with no cancellation — if the user quits mid-countdown, the thread still fires captures against a dying app. Low risk (process exit kills it), but a stop flag would be cleaner.
- **Extension:** `captureTiled` (background.js:40) draws tiles at `scale: 1` regardless of `deviceScaleFactor` — output is CSS pixels, not device pixels. Fine for consistency, but the stitched image is lower-res than a real screenshot on HiDPI displays. Also `preScroll` resolves `false` on the 15 s timeout but `captureFullPage` ignores the return value — infinite-scroll pages capture whatever loaded; acceptable, but the status message doesn't say so.
- **popup.js:** after a successful capture the button just re-enables with no confirmation — `setStatus` only fires via background messages; the "Saved!" message does arrive via `setStatus`, so this is fine.

---

## Design / code quality

**Good:**
- Clean module separation in `recording/` (capture → pipeline → encoder → muxer), with the `VideoEncoder` trait as a genuine extension seam for future HW encoders.
- Pull-model init (`overlay_ready`, `pin_ready`) instead of push events — the comments explain the race it fixes.
- Hand-rolled MP4 muxer is well-structured (box writer with size patching, two-pass stco) *and has a real unit test* (`structure_is_sound` verifies stco→mdat linkage and stss entries). Rare and commendable for hand-written binary formats.
- `close_overlays` + `cancel_capture` consistently reset state; `stop_recording` restores the main window even on finalization failure ("the user must never be left with no visible UI").
- `save_recording`/`delete_recording` refuse paths outside the temp dir — good TOCTOU-adjacent hygiene for a command taking frontend-supplied paths.
- Frontend is vanilla JS, no build step — appropriate for a utility.

**Could be better:**
- **Magic numbers:** JPEG quality `92` (main.rs), blur factor `0.06` / pixelate `14` (editor.js:313-329), overlay dblclick threshold `5px` vs cancel threshold (`overlay.js` `w < 5 || h < 5` vs 350 ms double-click window), indicator `220px` height fudge (mod.rs:105), `max = 640.0` pin cap (main.rs:592), bitrate `0.12 bpp` clamped `[400k, 16M]` (encoder_cpu.rs:30). Most are fine as literals, but the bitrate formula and blur/pixelate factors deserve named constants since they're tuning knobs.
- **Duplication:** the multi-monitor stitch loop exists three times (main.rs `capture_fullscreen`, capture.rs `X11Capturer::capture`, capture.rs `XcapCapturer::capture`) with slightly different geometry sources. A shared `fn stitch_monitors()` in the lib would kill two of them.
- **`finish_region_capture` is doing two jobs** (screenshot crop + recording-region handoff) behind the `record_mode` flag — the mode check at main.rs:258-270 would read better as a separate command (`finish_region_record`).
- **`AppState` mutex-per-field** (`previews`, `geos`, `capture`, `overlay_open`, `record_mode`, `pending_pin`) — six locks invites lock-ordering bugs as the codebase grows. It's consistent today (never held nested except `previews` across the build loop — see minor note), but a single `Mutex<AppStateInner>` would be safer long-term.
- **The `#[allow(dead_code)] temp_path`** (recording/mod.rs:19) is a smell: the temp path is re-derived from the `stop_recording` return value instead. Either use the stored field or remove it.
- **Frontend:** `recording.html` inlines its script while other pages use separate `.js` files — inconsistent; harmless.
- **Error type:** everything is `Result<_, String>` — fine at this scale, but the recording pipeline's string errors make programmatic handling (e.g. distinguishing "Wayland unsupported" from "encoder failed") impossible. Consider a small error enum for the recording module.

---

## Improvements (prioritized)

1. **Fix the logical/physical unit mismatch** (#1): decide once whether `xcap` monitor origins are logical or physical, document it in one place, and convert at the boundary. This is the single most likely source of a real user-facing bug (wrong recording region on HiDPI multi-monitor).
2. **Guard `begin_region_record` against an already-open screenshot overlay** (#3) and add error toasts for all recording entry points (#4).
3. **Probe the capturer at `begin()` time** and fail fast with a clear message on Wayland (#6) — don't open the indicator and discover zero frames at stop time.
4. **Re-show (or notify) after delayed-capture cancel** (#5); make the countdown cancellable.
5. **Cap undo memory** (editor.js): bound total bytes (e.g. drop oldest snapshots past ~150 MB) rather than just count 40.
6. **Validate the save extension server-side** in `save_data_url` (#7) — reject or convert anything that isn't png/jpg/jpeg.
7. **Dedupe the monitor-stitch loops** and split `finish_region_capture`'s two modes into two commands.
8. **Temp filename uniqueness** — add PID/counter to `temp_output`.
9. Longer-term: HW encoders behind the existing trait (the seam is ready), native-messaging app↔extension link (already on the roadmap), settings UI for hotkeys/save location (already on the roadmap).

---

## Slop assessment

**Light slop, mostly in UI copy — the code itself reads human.**

- **Em dashes in user-facing strings** (the classic tell): `main.js:5` ("folder — see notes below"), `main.js:35` ("ready — get your menus"), `main.html:100` ("only — no system audio"), `popup.html` (two of them). A human *can* write these, but the density across toast/status strings is the pattern. Zero em dashes in code comments, which is the more common AI-tell location — notable.
- **Commenting:** heavy but *substantive*. Comments explain non-obvious decisions (why the pull model, why the first frame is forced to a keyframe, why stco needs two passes, the Wayland hotkey caveat) and document bugs found during verification (PLAN.md's notes on the textarea-blur and double-commit fixes). This is the opposite of generic filler — it reads like someone who debugged these paths. A few comments restate the obvious (`// Cap the pin window at a sane size, keep aspect`), but they're short.
- **Structure:** no generic `utils.js` dumping ground, no placeholder abstractions, no `// TODO` anywhere in the codebase. The trait seam, the hand-written muxer with tests, and the platform-specific capture backends are all *choices*, not templates.
- **One genuinely AI-ish artifact:** `#[allow(dead_code)] temp_path` — storing a field then suppressing the warning instead of using or removing it. Minor.
- **Emoji:** one in the extension popup button (`📜 Capture full page`) — user-facing chrome, intentional.

Net: if this was AI-assisted, it was directed by someone who understands the domain (the HiDPI/multi-monitor rules in PLAN.md are the kind of thing you only write after being burned). The main slop signal is em-dash density in UI strings.

---

## Files of note for follow-up

- `src-tauri/src/main.rs` — entry point, capture commands, tray, hotkeys (725 lines, the densest file)
- `src-tauri/src/recording/` — the recording subsystem; `mp4_muxer.rs` has the only unit tests
- `src/editor.js` — annotation editor (483 lines, solid)
- `extension/background.js` — CDP full-page capture, tiled fallback
- `docs/PLAN.md` — architecture, roadmap, and unusually honest verification notes
