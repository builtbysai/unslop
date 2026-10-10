# SonicSight — Code/Design Review

**Repo:** https://github.com/builtbysai/SonicSight · **Reviewed:** 2026-10-10 · **Scope:** read-only, shallow clone at commit `902535f` · **Verdict below**

## What it does

SonicSight is an experimental Android app for **optical vibrometry** ("visual microphone"): it records video only (no microphone or network permission), then offline-decodes the clip, estimates sub-pixel horizontal motion per luminance scanline inside a user-drawn ROI via zero-mean normalized cross-correlation, assigns each row a timestamp from the rolling-shutter readout skew, resamples the non-uniform row-time series to PCM, conditions it, and reports the dominant FFT peak — aiming to recover known test tones (100/200/440 Hz) from visibly vibrating targets like foil or speaker cones. The scientific framing is admirably honest: it explicitly does *not* claim speech recovery, defines a validation milestone, and documents required controls (source-off, damped-target, rigid-background ROI) in `TESTING.md`.

## Bugs / flaws (by reading the code)

### 1. ROI coordinates are applied to the decoded frame without any coordinate mapping — the analyzed rows are not the rows the user selected (HIGH)
`MainActivity.kt:134` captures `lastRoi` from the overlay in **PreviewView view coordinates**, and `VideoVibrationAnalyzer.lumaRows()` (`VideoVibrationAnalyzer.kt:196–215`) applies those normalized fractions directly to the **decoded video frame** dimensions. Three unhandled transforms break this mapping:
- **Rotation:** the activity is portrait-locked (`AndroidManifest.xml`), so the decoded `Image` is in sensor-native landscape orientation while the overlay is portrait. `lumaRows` never consults `MediaFormat.KEY_ROTATION` or rotates the frame. The selected region is effectively transposed.
- **Preview crop:** `PreviewView` uses `app:scaleType="fillCenter"` (`activity_main.xml`), which crops the sensor image to the view aspect ratio. Overlay fractions span the *cropped* view, not the full frame, so rows are offset even ignoring rotation.
- Net effect: every experiment analyzes the wrong patch of the scene. The ROI overlay is cosmetic until a `PreviewView` → sensor-frame transform (via `PreviewView.getOutputTransform()` / `CoordinateTransform`) is applied and rotation is honored. This undermines all measurement claims.

### 2. Analysis cost scales catastrophically with HFR clips (HIGH, performance)
`RowShiftEstimator.estimate()` runs ZNCC over the full row width for 7 shifts with 2 passes each, per row, per frame. `lumaRows` allows up to 256 rows (`VideoVibrationAnalyzer.kt:207`, `stepY`), and row width can be ~1000+ px for a wide ROI: ≈ 256 × 7 × 2 × 1000 ≈ **3.6M float ops/frame**. A 10 s clip at 240 fps = 2400 frames → on the order of **8–9 GFLOP on the phone CPU**, single-threaded, plus no early-exit or progress granularity finer than 8 frames. Analysis of a full HFR clip will likely take many minutes and risk ANR-adjacent UX (the UI only shows "Analyzing… N frames"). Suggest: estimate shift on a strided column subset, or estimate per-row on every Nth row for the timebase and average; alternatively move heavy frames to RenderScript/NNAPI later.

### 3. `lumaRows` clamping can throw `IllegalArgumentException` on degenerate inputs (MEDIUM)
`VideoVibrationAnalyzer.kt:202–205`: `left = ….coerceIn(0, w - 16)` throws when `w < 16` (min > max), and `right = ….coerceIn(left + 16, w)` throws when `left + 16 > w`. Normal phones never produce <16 px wide frames, but a corrupt/short decode or an extreme ROI (e.g., `roi.left ≈ roi.right` after float rounding) can trigger it mid-analysis, surfacing as a crash inside the worker thread. Clamp with `coerceIn(0, max(0, w - 16))` and enforce `right > left` explicitly.

### 4. Row timestamps use decoder presentation timestamps, not sensor capture timestamps (MEDIUM, scientific)
`VideoVibrationAnalyzer.kt:106,127`: `rowTime = info.presentationTimeUs * 1000 + yFraction * skew`. Presentation timestamps are container/decode timeline values, not `SENSOR_TIMESTAMP`. A constant offset is harmless for FFT, but any encoder-introduced timestamp jitter or HFR retiming directly corrupts the rolling-shutter timebase the whole method depends on. The app already collects `sensorTimestampNs` in `CameraTimingCollector` (`CameraTimingCollector.kt:36`) — it is stored in the snapshot and then **never used**. Either wire sensor timestamps through (they'd need per-frame capture-result ↔ encoded-frame correlation, which is genuinely hard) or document why pts is acceptable.

### 5. Skew is measured on the preview stream, applied to the video stream (MEDIUM, scientific)
`CameraTimingCollector` is attached via `Camera2Interop` to the **Preview** builder (`MainActivity.kt:80`) in both the HFR and fallback paths. In a combined preview+HFR session the sensor mode is shared so this is probably fine, but in fallback mode the preview and video streams can run at different resolutions/crops, and `SCALER_CROP_REGION` scaling (`CameraTimingCollector.kt:28–34`) is computed from preview capture results, then applied to decoded video rows. If the crop regions differ, the skew and the y-fraction mapping disagree. At minimum, log both streams' crop regions in the experiment JSON so a bad run is diagnosable.

### 6. Reference frame is frozen from frame 0 and never refreshed (MEDIUM)
`RollingShutterExtractor.kt:14–21`: the reference rows come from the first decoded frame for the entire clip. Over a 5–10 s recording, auto-exposure/white-balance drift, thermal noise, or slow phone creep degrades correlation against a stale reference, raising the noise floor exactly in the long captures the protocol recommends. The 60 Hz high-pass hides slow drift, but correlation *quality* loss does not show up anywhere — no per-frame correlation score is recorded, so a degraded run looks identical to a clean run in the JSON. Suggest: exponential moving-average reference, or at least record mean ZNCC per frame as a quality metric.

### 7. Hard-coded 60 Hz high-pass vs. the project's own 80–100 Hz entry milestone (LOW–MEDIUM)
`SignalConditioner.kt:14–16`: first-order high-pass at 60 Hz. `TESTING.md` starts validation at 80–100 Hz ("easiest mechanical sanity check") — a first-order 60 Hz cutoff attenuates an 80 Hz tone by ~20% and adds phase distortion near the band of interest. For a frequency-recovery experiment the cutoff should be a parameter (default ~30–40 Hz), not a constant, and the README milestone (100 Hz within 2%) deserves a test that runs the *actual* pipeline, not just the DSP units.

### 8. Miscellaneous smaller issues
- `MainActivity.kt`: `timingCollector` is recreated on every `startCamera()` call; the collector from a previous session is silently discarded — fine in practice, but `analyzeLastClip` reads `timingCollector?.snapshot()` which may belong to a *different* session than `lastClip` if the user re-records after a camera restart. Snapshot timing at record time, not analysis time.
- `MainActivity.kt:126`: fallback path sets `selectedFps = 60`, but standard `Recorder` output is commonly 30 fps or variable — `nominalFps` is only a fallback for skew estimation (observed deltas take precedence), so impact is small, but the reported `selectedFps` in the JSON is then wrong.
- `ExperimentReportWriter.kt`: records `wavPath = result.wav.name` (filename only) — fine locally, but the JSON is the only provenance record; include absolute path or a content hash for experiment traceability.
- Cache hygiene: every recording lands in `cacheDir` (`MainActivity.kt:133`) and is never deleted; repeated experiments fill storage. WAV/JSON accumulate in `filesDir` likewise.
- `RoiOverlayView.kt`: ROI can be moved but not resized; `onTouchEvent` doesn't call `performClick()` (accessibility lint); no `ACTION_UP` handling — harmless but unfinished-feeling for the app's single most important control.
- `NonUniformResampler.kt`: `preferredRate` parameter is never passed by the only caller — dead API surface; either use it or drop it.
- `VideoVibrationAnalyzer.kt:112–115`: `median(frameDeltas)` re-sorts the whole delta list on **every frame** — O(n log n) per frame for up to ~2400 frames. Trivial cost today, but it's inside the hot loop for no reason; compute once after decode or maintain a running estimate.

## Design / code quality

**What's genuinely good:**
- Clean separation: `dsp/` (pure JVM, unit-tested) vs `video/` (Android decode) vs camera glue. The DSP objects are stateless and testable; the decision to decode offline rather than fight CameraX constrained-HFR ImageAnalysis is the right architectural call and is documented (`ARCHITECTURE.md`, class KDoc).
- Privacy posture is real, not decorative: manifest has only `CAMERA`, `beginRecording` explicitly avoids `withAudioEnabled()` with a comment explaining why, no network permission.
- Error handling in the decode loop is careful: `require()` with human-readable messages for no-video-track / no-CPU-frames / non-monotonic-timebase, `try/finally` releasing codec/extractor, null-`Image` tolerated.
- `CameraTimingCollector` correctly notes that skew scales with sensor crop, not video downscale — a subtlety many would get wrong.
- The skew coercion (`VideoVibrationAnalyzer.kt:121–123`, clamped to ≤98% of observed frame period, ≥1 ns) prevents timebase folding — defensive and correct.

**What needs work:**
- **No integration test of the pipeline.** `DspAlgorithmsTest` covers the DSP primitives in isolation (good), but the most failure-prone code — ROI mapping, timebase assembly, resampling of gappy timelines — has zero tests. A synthetic test feeding `RollingShutterExtractor` + `NonUniformResampler` + `SpectrumAnalyzer` a known 440 Hz row-motion series would catch timebase bugs without a phone. `tools/DspSmokeTest.kt` duplicates the unit tests as a `main()` instead of extending them — merge it into the test suite.
- **Magic numbers everywhere:** `maxShift = 3`, `estimatedReadoutFraction = 0.75f`, `coerceIn(0.2f, 0.98f)`, `0.98` clamp, 256-row cap, 16_384 FFT cap, 60 Hz cutoff, `minHz = 50`, `maxHz = 5000`. Each is defensible, but none is named, centralized, or logged into the experiment JSON — so a result can't be reproduced from the JSON alone. A single `ExperimentConfig` data class, serialized into the JSON, would fix provenance in one move.
- **Inconsistent math style:** `SignalConditioner` uses `Math.PI`; everything else uses `kotlin.math.PI`. Trivial, but it signals the files were written at different times without a style pass.
- **Tight coupling to file naming:** `recovered-<ts>.wav` / `experiment-<ts>.json` via `System.currentTimeMillis()` — two calls can collide within the same millisecond on fast devices; use one timestamp per run.

## Improvements (prioritized)

1. **Fix the ROI→decoded-frame transform** (P0 — nothing else matters until this works). Apply `PreviewView.getOutputTransform()`/`CoordinateTransform` to map overlay rect to sensor coordinates, then handle `KEY_ROTATION` when extracting rows. Validate with a synthetic test: draw a known pattern, confirm analyzed rows match the selection.
2. **Add a pipeline-level synthetic test** (P0): 440 Hz sinusoidal row shifts → extractor → resampler → conditioner → spectrum, assert peak within 2%. This is the project's own milestone as a regression test.
3. **Cut analysis cost** (P1): estimate ZNCC on strided columns (e.g., every 4th pixel); keep per-row timebase. Measure and report analysis time in the JSON.
4. **Record signal-quality metrics** (P1): mean ZNCC per frame, frames dropped by the monotonic filter, effective sample rate, exposure time — into the JSON. Currently a bad run is indistinguishable from a clean one.
5. **Make DSP parameters a serializable config** (P1): `ExperimentConfig` with all magic numbers, written into every experiment JSON for reproducibility.
6. **Refresh or quality-gate the reference frame** (P2): EMA reference or per-frame correlation floor that flags degraded runs.
7. **Parameterize the high-pass cutoff** (P2): default 30–40 Hz so the 80–100 Hz validation band is unattenuated.
8. **Cache/file hygiene** (P2): cap stored clips, one timestamp per run, hash in JSON.
9. **Build fragility** (P2): `compileSdk = 37` + CI installing `platforms;android-37.0` from canary channel — pin and document; the README's "regenerate the wrapper" note means the repo can't build from a fresh clone without extra steps (wrapper JAR absent). Ship the wrapper.

## Slop assessment

**Low slop.** No em dashes anywhere in source, tests, or scripts. Comments are sparse KDoc headers explaining *why* (e.g., why offline decode, why no audio, why not to synthesize `[upper, upper]` ranges) rather than narrating *what* each line does — the opposite of the over-commenting tell. Naming is domain-specific (`rollingShutterSkewNs`, `zncc`, `peakToMedianDb`), not generic `Manager`/`Helper`/`Util` soup. The code shows signs of a human who understands the physics: the skew-vs-downscale distinction, the refusal to synthesize fixed FPS ranges, the explicit privacy comments, and the honest "does not claim" scientific boundary in the README. Weak spots that *could* read as AI-generated: the duplicated smoke test vs. unit test, magic numbers without provenance, and `Math.PI` vs `kotlin.math.PI` inconsistency — all consistent with iterative human+assistant development rather than a single slop dump. The `assets/signal-pipeline.svg` was just restyled per the commit log; not evaluated here.

## Bottom line

This is a **genuinely well-conceived prototype** — honest science, clean DSP/core separation, real privacy posture, and careful decode-loop engineering. But it has one **P0 functional bug** (ROI coordinates never mapped to the decoded frame, so it analyzes the wrong image region — compounded by unhandled video rotation in portrait) and one **P1 scalability wall** (full-width ZNCC per row per frame makes HFR analysis impractically slow). Fix the coordinate transform, add the synthetic 440 Hz pipeline test as the project's own milestone in CI, and this becomes a credible measurement tool.
