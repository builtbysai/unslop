# Deferred: Bridge — make it actually work (filed 2026-10-10)

**After the audit.** Hans's words: "i dont think the concept was completed and the product was fully developed."

## Task
End-to-end functionality verification and completion of Bridge (browser-to-browser encrypted file transfer):
1. Understand the intended concept fully: pair two browsers (QR/link), transfer files over an encrypted tunnel (AES-256-GCM), disconnect. Relay-only privacy mode (TURN). Temporary sessions, no account, no permanent cloud drive.
2. Test the ACTUAL product flow with two real browsers: does pairing work? Does the signaling service work? Do files actually transfer? Does relay-only mode work?
3. Identify everything that's incomplete, stubbed, or broken — the "concept not completed" gaps.
4. Finish it: make the product actually work end to end.

## Context
- 2026-10-10: Bridge-redesign repo deleted per Hans; original (builtbysai/Bridge) made public with a Pages site. The redesign's warm-paper UI was rejected.
- The UI rework (non-paper, understand-the-product-first) is in the rework queue — coordinate, don't collide.
