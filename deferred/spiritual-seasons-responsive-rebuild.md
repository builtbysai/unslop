# Deferred: Spiritual Seasons native-responsiveness rebuild (filed 2026-10-10)

**Hans's order from the verdict round. Big one — he has tried multiple times and failed.**

## Goal
Make the Spiritual Seasons PWA feel **native on any device** — no scroll overflows, no parts that don't fit the viewport, no unnecessary scrolls. He likes how it looks; the design language stays. This is purely about viewport fit and native feel across phones, tablets, and desktops.

## Method (his explicit instruction)
1. **First, visually review the existing project screen by screen.** Understand the flow: how the app actually works, its actual states, and how you move from one part to another. Map every screen and transition before touching code.
2. **Then create a NEW repo** and build the responsive version there — rebuilding from scratch is allowed.
3. The current look is approved — don't redesign the aesthetic. Fix the fit.

## Context
- Original: https://github.com/builtbysai/Spiritual-Seasons-PWA (Netlify-hosted: spiritualseasons site; deploy previews + branch deploys OFF — keep it that way)
- Live: check the Netlify site URL
- 2026-10-10: the em-dash polish was a no-change pass (3%, zero flags); `Spiritual-Seasons-PWA-redesign` deleted as redundant.
- Hans's pain points: scroll overflow, content not fitting viewport, unnecessary scrolls on some devices.

## Note for later
Decide with Hans whether the new repo replaces the original (reconnect Netlify to it) or merges back — don't rewire his Netlify site without asking.
