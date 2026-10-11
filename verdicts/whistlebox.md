# Hans's verdict — VOXMIDI (renamed from whistlebox) (2026-10-10)

Status: **renamed, em-dash cleanup merged, redesign deleted. Full rebuild deferred.**

## Done 2026-10-10
1. Repo renamed `whistlebox` → `VOXMIDI` (matches the app's own title).
2. Em-dash cleanup merged into the original: PR #1 (squash `ae3b1cd1`) — 5 substitutions in index.html (title, MIDI dropdown, status line, key result). No design/logic changes. The `Level —` no-data placeholder left as-is.
3. `whistlebox-redesign` deleted (204). Live verified: https://builtbysai.github.io/VOXMIDI/ (200).

## Deferred: VOXMIDI full rebuild (after full repo audit — Hans's order)
Hans confirmed the goal: a **Dubler 2 (Vochlea) clone**. Current state is far off — design, UX, UI all need a ground-up rebuild.
Plan when the audit is done:
1. Research Dubler 2 (Vochlea) — features, UX, pricing, positioning.
2. Research Spotify Basic Pitch: https://basicpitch.spotify.com/, https://github.com/spotify/basic-pitch-ts, https://github.com/spotify/basic-pitch.
3. Clone the Spotify repo if needed.
4. Build an actual complete product: good design, good UI, good UX, usable, user-friendly, easy to understand.

## Rebuild shipped — VOXMIDI v2 (2026-10-11, overnight queue item 3)

Hans's deferred order executed: ground-up rebuild as a **Dubler 2 (Vochlea) clone**, built in the original repo. PR #2 merged (squash `02850d4f`), follow-up copy PR #3 merged (`4d8fd283`, em dashes out of user-visible strings), live at https://builtbysai.github.io/VOXMIDI/ (200 + new title marker verified by direct curl, post-fix title re-verified).

### Research conclusions
- **Dubler 2** ($99, Vochlea): real-time voice-to-MIDI. Calibration (gain/pitch/timbre learning), beatbox triggers (8 sounds), scale quantization (14 scales), IntelliBend (note-anchored) vs TruBend (exact voice follow), vowel-to-CC mapping, ~10ms trigger latency, VST into any DAW.
- **Spotify Basic Pitch** (basicpitch.spotify.com, spotify/basic-pitch-ts): offline/file transcription neural net (22.05 kHz mono, seconds of CPU per clip). **Wrong vehicle for live play** — deliberately NOT used. The honest fit is real-time monophonic DSP.
- **Web MIDI**: Chrome/Edge/Opera yes, Firefox 108+ yes, Safari never, iOS Safari never (all browsers are WebKit there). Built-in synth fallback + .mid download cover the gaps.

### What shipped
- Onboarding that works: mic explainer BEFORE the browser prompt, live level meter, input device picker, hum-a-note lock check.
- Real-time pitch to MIDI: YIN detector + debounced note tracker (~80 fps), velocity from loudness, 14 scales with key quantization, octave shift, pitch bend Follow/Off, sensitivity slider.
- MIDI output: Web MIDI device picker; built-in Web Audio synth (mono lead + kick/snare/hat) when none; Panic button.
- Beatbox drums: onset detection + spectral-template classifier (kick/snare/hat), **trainable pads** (user teaches each pad 3 takes, saved on device).
- Session: piano-roll history, Record, Download MIDI (Type 0 .mid, drums on ch 10).
- Playable UI: piano keyboard and drum pads respond to taps (audition) even without a mic. Midnight-stage design, no paper, no slop copy.

### Machine-tested (this environment: no mic, no audio hardware)
- `node tests/test-dsp.js`: **29/29 pass**. YIN on synthesized sines 110-1174 Hz (exact MIDI notes, cents accurate), noise/silence rejected, note on/change/off state machine, wobble resistance, kick/snare/hat classification, onset fires once per hit, SMF bytes valid incl. drum channel.
- Headless Chromium with fake mic + fake permission UI: full flow clicked through with zero console errors. Fake tone locked **G4** in the hum test, studio showed live pitch trace, 10 notes recorded, Download MIDI enabled.
- Screenshots: `screenshots/voxmidi/` (01 welcome, 02 mic, 03 level, 04 hum, 05 studio desktop, 06 studio mobile, 07 help, 08 train, 09 recorded, 10 full page).

### Needs Hans's ears (cannot be machine-tested here)
- Real-mic latency and feel, tracking quality on his voice/whistle, drum template match for his beatboxing, Web MIDI to his actual DAW/devices, mobile Safari mic behavior.

### Bugs found and fixed during the build
- YIN scanned the difference array before it was fully computed (walk-ahead read zeros): every pitch read ~6% sharp. Fixed by separating compute and scan passes; caught by the unit tests.
- Drum classifier used brittle centroid thresholds: replaced with trainable nearest-template matching after measuring real feature vectors.
- Test synth regenerated random partials per sample (smeared spectrum): fixed recipe, documented in tests.
- Studio had no mic start after skipping onboarding: added mic controls to the OUTPUT panel. Null meter element crashed the analysis loop: fixed + guarded.
