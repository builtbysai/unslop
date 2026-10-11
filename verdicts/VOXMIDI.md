# VOXMIDI build log (ongoing background development)

Repo: https://github.com/builtbysai/VOXMIDI · Live: https://builtbysai.github.io/VOXMIDI/
Goal: usable Dubler-2-style whistle-to-MIDI product. Hans's verdict 2026-10-11: "hurts my ears, not usable, long way to go."

## 2026-10-11 — PR #4: Wind voice (sound design, the "hurts my ears" fix)
- **Problem:** lead voice was dual detuned sawtooths with instant-on gain, 8-cent beating, no release, raw-RMS velocity. Harsh by construction.
- **Fix:** breathy wind-controller voice — sine fundamental + triangle warmth at -12dB (no detune), bandpassed breath noise following the player's blowing, real ADSR (25ms soft attack, breath-following sustain, 120ms release), tone filter that opens with velocity (Q 0.7), perceptual velocity curve, smoothed breath from RMS.
- **Also:** keyboard audition sets fixed breath (was silent without a mic).
- **Tests:** 36/36 (7 new curve tests). Drums untouched. Merge `d68884db`.
- **Listen for:** soft attacks, notes that end instead of being cut, dynamics that follow blowing, air instead of buzz.

## Earlier (2026-10-10/11)
- Renamed whistlebox → VOXMIDI; em-dash cleanup PR #1.
- PR #2: real-time YIN pitch→MIDI, trainable beatbox pads, Web MIDI + synth fallback, .mid recording, 29 DSP tests.

## Up next
- Pitch tracking: octave-jump rejection, onset/offset musicality, sensitivity defaults.
- Latency: measure input→sound path, minimize.
- UX: 30-second self-teaching onboarding, tuner feedback.
- Visual review: desktop + mobile, real instrument product feel.
