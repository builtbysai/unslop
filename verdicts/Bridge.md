# Hans's verdict — Bridge (2026-10-10, updated 2026-10-11)

Status: **reskinned in the original repo; PR #5 merged into builtbysai/Bridge main.**

## What Bridge is
Browser-to-browser encrypted file transfer. No account, no permanent cloud drive. Pair two browsers via QR/link, move files/text/links/clipboard over an encrypted tunnel (AES-256-GCM over WebRTC DataChannel), disconnect. Relay-only privacy mode (TURN). Temporary sessions: the session exists, then it is gone. A PRIVACY TOOL for moving files between your own devices. Audience: someone sending sensitive files who needs to trust the tool. Design must feel trustworthy, precise, ephemeral.

## Screen-by-screen review (2026-10-11, real local runs against the actual app)
Hans's correction ("not actually visually reviewing the sites") was taken literally: installed deps, ran the real signaling server, and walked the app.
- **Host/landing:** QR + session code + expiry render once signaling is up; big headline; action buttons disabled until paired.
- **Guest join (?session=#key=):** clean "Joining device" state with session code from the link.
- **Receive portal (?portal=receive):** distinct "Send something to this device." hero; four send actions.
- **Invalid link:** clear error state.
- **Mobile 390px:** tunnel diagram stacks vertically; no overflow; QR centers.
- **Connected/transfer states:** could NOT be screenshot live — this sandbox blocks UDP loopback, so WebRTC ICE never completes here. Verified the connected-state CSS by driving the same `data-state` attributes `setState` sets, via CDP.
- **Real E2E pairing works at the signaling layer** (guest reached host, "pairing confirmation" flow started); only the UDP media path is sandbox-blocked.

### Findings that drove the reskin
1. The rejected paper palette was wrong for a privacy tool: warm paper reads "cafe loyalty card", not "my tax documents cross this wire".
2. The original dark-navy design was the product's own identity but generic dark-SaaS: 20px-radius cards, blue glows, Inter, gradient buttons. No point of view for a *privacy* instrument.
3. **Dishonest UI:** the connection status dot was always amber regardless of state; disabled "Send files" looked like an active CTA (both in paper and original versions).
4. Copy: em dash in "Device found — connecting", emoji in route pill ("⚡ Direct" / "↪ Relayed"), em dash in PWA manifest name. All fixed.
5. Portal lede spacing ("send.It") was a redesign-only bug; the original was correct.

## The new direction: "The Night Switchboard" — and WHY it fits
Deliberate return to the product's own dark-navy identity (#070a10, steel blue #70a9ff, the QR code's own colors), but tuned like **lab equipment instead of marketing software**. The argument Hans demanded:
- Trust in a privacy tool comes from *instrument honesty*, not warmth or gloss. Signal earns trust through restraint and clarity; this applies the same principle in Bridge's own navy.
- **Color only ever reports a system state.** Amber = waiting, green = encrypted channel live, red = problem. No decorative gradients, no glows.
- **The tunnel diagram is a live instrument, not decoration:** the packet travels only when the data channel is genuinely open; the track goes solid green and the cipher pill lights up on connect. AES-256-GCM is always labeled because the crypto is the product.
- **Typography does trust work:** Space Grotesk display + IBM Plex Mono for everything cryptographic (session codes, tunnel labels, route pills, expiry). Mono for key material reads "engineered".
- **Ephemerality is visible:** session code + expiry in mono, "no account, no permanent storage" kept front and center.
- **Honest disabled states:** inert buttons look inert (flat, faint), never like CTAs.

## What changed (builtbysai/Bridge, PR #5, squash-merged as ef80eedf)
- `src/style.css`: full reskin (token names preserved: --bg, --surface, --text, --accent, --border, --focus, --radius-md etc. per e2e/design-system.spec.ts; h1 copy untouched per e2e).
- `src/main.ts`: tunnel-diagram section added; `setState` now drives `data-state` on the diagram + status dot; copy fixes (no em dashes/emoji).
- `src/privacy-controls.css`: flat primary buttons (no gradients).
- `src/fonts/`: Space Grotesk + IBM Plex Mono woff2 (OFL) bundled for the offline PWA.
- `public/manifest.webmanifest`: PWA name em dash removed.
- `e2e/recovery-accessibility.spec.ts`: assertion updated to the new connecting copy.

## Verification
- `npm run typecheck`: clean. `npm test`: 178/178 pass.
- Screenshots (all in `screenshots/`): `Bridge-v2-before-original.png` (original design, before record), `Bridge-v2-before-paper.png` (rejected paper, for the record), `Bridge-v2-after-host.png`, `Bridge-v2-after-connected.png`, `Bridge-v2-after-guest.png`, `Bridge-v2-after-portal.png`, `Bridge-v2-after-mobile.png`.
- Branch `reskin/night-switchboard` deleted after merge.

## Open follow-ups (for parent)
- The Bridge Pages/demo site is being set up by a separate worker. If it lands on a subpath (e.g. builtbysai.com/Bridge/), the Vite `base` is still `/` and will blank-screen exactly like the Bridge-redesign bug did; the site worker must set base to the subpath or serve from root.
- Slop checker: run against the live URL after the site is up (screenshot-mode floor noted); no deck was requested for this task.
- Note: Hans ordered builtbysai/Bridge-redesign deleted; this reskin went into the original public repo instead, per the updated brief.
