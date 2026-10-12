# VOXMIDI design review, from the design guide (2026-10-12)

Repo: https://github.com/builtbysai/VOXMIDI (main @ a053826)
Live: https://builtbysai.com/VOXMIDI/
Method: the permanent design standard in ~/AGENTS.md, applied in order.
Research first, thesis second, evaluation third. Screenshots reused from the
2026-10-12 evidence set: ~/workspace/unslop-hub/screenshots/voxmidi/design-check-2026-10-12/
(1280x900 desktop, 390x844 mobile, headless Chromium, zero console errors).
Findings only. No code changed.

## 1. Research: exceptional interfaces and why they work

**Vochlea Dubler 2** (the product VOXMIDI imitates). Five tabbed pages, and it
opens on the Play tab, the main performance view: beat-boxing pane on the
left, pitch and vowel tracking on the right. An idiot-proof setup wizard gets
you playing. Built-in sounds mean it makes noise on first launch with no DAW
configured. What it teaches: the performance view is the home screen and
configuration lives elsewhere. The first sound should happen within a minute
of launch. Dubler 2 moved from a single crowded screen (v1) to tabs precisely
because setup and performance are different attention modes.

**Teenage Engineering OP-1.** Power on and it is a playable instrument. No
menu diving. Four main screens, the essential creative ones first, settings on
separate screens. Visual semiotics over words: animated graphics show what a
parameter does instead of labeling it. Constraints accelerate decisions; the
color-coded interface removes the need to read. What it teaches: the
instrument IS the interface. Remove written language wherever a visual
metaphor works. Decide for the user instead of exposing every option.

**Ableton Push.** "Head down, don't look at your monitor." Set a scale and
play; out-of-scale notes are removed so a novice plays in-key melodies in
minutes. Navigation gets out of the way of the musical moment. What it
teaches: a performance surface must work at a glance, in peripheral vision.
Key and scale are constraints that make you musical, not a settings panel to
admire.

**TonalEnergy tuner.** One dominant visual surface: the needle against its
target, big and unambiguous, with playful encouragement when you land the
pitch. What it teaches: pitch feedback is one question, am I on the note?
Show it large, show it fast, make landing it feel good.

The common thread: every one of these treats performance and configuration as
different rooms. The performer looks at one thing. VOXMIDI currently shows
seven things at once.

## 2. Design thesis for VOXMIDI

VOXMIDI is an instrument played with the mouth and watched with the eyes. The
screen is a mirror, not a cockpit. Mid-performance, the singer needs exactly
one answer: what note am I on, and am I in the key. Everything else is setup
or capture, and neither belongs on the performance surface.

Three attention modes, three rooms:

- **PLAY** is the default and the home. One feedback surface: the note named
  large, the pitch trace drawn against the note lanes of the chosen key and
  scale, so you see where you are and where you are going. The keyboard below
  lights the key you are singing. No settings visible. One primary action:
  Record. Panic stays, quiet, because a stuck note is a performance
  emergency.
- **SETUP** is a separate screen visited once: key, scale, mic, sensitivity,
  train pads. Dubler 2 puts Play first and settings in tabs; the OP-1 puts the
  synth first and settings on other screens. Same move.
- **CAPTURE** is a drawer, not a panel. The session list and MIDI download
  appear after a recording exists. An empty box waiting for content is not a
  feature.

Visual language: the voice made visible. The trace is the hero, not a thin
line in a box. Color does work: one accent for the live voice, one for record
state, and the scale lanes themselves carry the in-key information so the eye
never reads a label mid-song. Typography: one display face for the note, one
quiet face for labels. The letterspaced-caps-everywhere default is a costume,
not a voice.

The representative screen to perfect first is the studio performance surface.
Nothing else gets redesigned until that screen is right.

## 3. Evaluation of the current UI against the thesis and the standard

**Originality through reasoning.** No product-specific visual identity.
Nothing in the UI says "voice." A microphone instrument has an obvious visual
vocabulary (breath, waveform, vocal energy) and none of it is used. The trace
is thin and clinical; the note readout is the best element in the app but sits
in a card identical to every other card. Changing the theme would not change
the design because there is no design idea underneath the theme.

**Hierarchy.** Flat. The PITCH trace, the note readout, the keyboard, PITCH
settings, DRUMS, and OUTPUT all carry equal visual weight. The eye has seven
competing panels and no instruction about where to look. Against the thesis,
this is the central failure: the performance surface competes with its own
settings.

**Typography.** Unconsidered. System sans plus letterspaced caps is the
default "pro audio" costume. The note readout (G4, +36 ct) works because it is
big, not because it is designed. Nothing distinguishes a label from a value
from a heading except size.

**Interaction.** The meaningful interactions are real: record, train, panic,
download, keyboard audition all function. But the layout asks the user to
interact with setup while performing. "Train pads to my voice" is setup work
sitting on the performance screen. The sensitivity slider, key/scale selects,
and mic picker are all performance-screen residents that belong in Setup.

**Restraint and subtraction.** The weakest area. All settings are visible at
once. Empty chrome is shown for empty states: the session box sits empty
before any recording, the DRUMS card is half dead space, the top bar shows
"Now: ..." as a placeholder. Seven pill buttons, nine distinct border-radius
values, no system. Subtraction has not happened yet.

**No fake completeness.** Passes. Everything on screen works. This is to the
app's credit and it matters: the redesign is a design problem, not a honesty
problem.

**The harsh-critic questions.** Does it look AI-generated? In structure, yes:
the uniform card grid is the tell. Is anything unnecessary? The empty session
box, the "Now: ..." placeholder, the always-visible settings, four of the
seven pills. Does it solve the actual problem? Functionally yes, but the
interface fights the performance moment it exists to serve. Distinctive or
merely polished? Merely tidy. Would a skilled designer defend these
decisions? The cards, the pills, the flat hierarchy: no.

**What passes and should be kept.** The microcopy is genuinely good ("Panic
kills all sound instantly if a note sticks", "Locked on. Nice."). The privacy
footer ("Audio never leaves your device.") is a real differentiator, well
placed. Onboarding is four steps, every step skippable, with satisfying
lock-on feedback on the hum test. The help modal is real documentation. The
note readout concept is the seed of the thesis. Mobile stacks without
breakage at 390px.

## 4. Prioritized fix list, grounded in the thesis

P0 (thesis-level; do these first, in this order)
1. Split the studio into Play and Setup. Play shows the merged feedback
   surface, the live keyboard, Record, and a quiet Panic. Key, scale, mic,
   sensitivity, and pad training move to Setup.
2. Merge the note readout and the pitch trace into one feedback instrument:
   the trace drawn against the note lanes of the selected key and scale, the
   current note named large at the trace head. This is the mirror. The
   separate G4 card disappears into it.
3. One button language, two radii maximum. Record keeps the primary
   treatment. Everything else shares one quieter style.

P1 (the thesis, applied outward)
4. Capture becomes a drawer: the session list and Download MIDI appear only
   after a recording exists. "Now: ..." becomes the live note or goes away.
5. The keyboard becomes the visual echo of the voice: highlight the key being
   sung. On mobile, fold octaves or scroll horizontally; 15 keys at ~26px
   each is not tappable.
6. Drums: the three pads belong to Play as playable pads; training them is
   Setup work and moves there with the wizard.

P2 (finish work)
7. Typography: one display face for the note, one quiet face for labels.
   Retire the letterspaced-caps default.
8. Copy nit: onboarding says "raise the input gain" but the studio control is
   labeled "Sensitivity." One name.
9. Real-mic validation (cannot be done headless): trace legibility while
   actually singing, and the populated session-list UI.

## Caveats

Headless review only. Hans's real-device and real-mic verdict is the gate,
per the standing rule. No code was changed, no branches touched, nothing
merged. Do not implement without his direction on the thesis.

## Footnote

A slop-checker pass on the same evidence scored ~12%, entirely from
visual-structure tells (card grid, pills, radius inconsistency); the copy
audit was clean. Kept here as a footnote because the design guide, not the
meter, is the method.
