# Code/Design Review — ad-automation-toolkit

Reviewed 2026-10-10. Read-only review against the original repo (cloned shallow;
no changes pushed). Repo: https://github.com/builtbysai/ad-automation-toolkit

## What it does

A set of four PowerShell admin scripts (plus a shared logging module) for
routine Active Directory / endpoint administration work: bulk user provisioning
from CSV (`New-BulkADUsers.ps1`), stale-account disabling (`Disable-InactiveADUsers.ps1`),
account-hygiene reporting (`Get-ADAccountComplianceReport.ps1`), and per-device
compliance sweeps over CIM/WinRM (`Get-EndpointComplianceAudit.ps1`). Targeted
at IT admins / help-desk staff doing batch work that is usually done by hand,
with an emphasis on safety rails (`-WhatIf`, `-ReportOnly`, per-run logs and
CSV evidence for change tickets).

## Bugs / flaws (file:line)

1. **Temp passwords are generated and then lost forever** —
   `scripts/New-BulkADUsers.ps1:99,108`. `New-TempPassword` creates a random
   temp password, it is set on the account via `ConvertTo-SecureString`, and
   it is never written anywhere — not the log, not the summary CSV, not the
   console. The single most important output of an onboarding batch (the
   credentials to hand to new hires) is unrecoverable after the run. Either
   write it to a restricted file / secure delivery channel, or take the temp
   password as an input parameter so the admin controls it. **This is the
   most important finding in the repo.**

2. **Never-logged-on accounts are auto-disabled by default** —
   `scripts/Disable-InactiveADUsers.ps1:92`. The candidate filter includes
   `LastLogon -eq $null`, and without `-ReportOnly` those accounts get
   *disabled* (and possibly moved). A brand-new account provisioned Friday
   afternoon that hasn't logged on yet is indistinguishable from a stale
   account and will be disabled on the next run. Should be opt-in (a
   `-IncludeNeverLoggedOn` switch) or gated on account age
   (`whenCreated` older than `InactiveDays`).

3. **Partial failure is mislabeled "Failed"** —
   `scripts/Disable-InactiveADUsers.ps1:104-114`. `Disable-ADAccount` and
   `Move-ADObject` share one try/catch. If the disable succeeds but the move
   throws, the account *is* disabled but the report records `'Failed'`,
   implying nothing happened. Split the try blocks so the report records
   `'Disabled'` with a separate move-failure flag; otherwise recovery is
   confusing (the account exists in the old OU, disabled, but the report
   says it failed).

4. **Case-sensitive HashSets for exclusion/privilege lists** —
   `scripts/Disable-InactiveADUsers.ps1:64`,
   `scripts/Get-ADAccountComplianceReport.ps1:53`.
   `System.Collections.Generic.HashSet[string]` uses ordinal case-sensitive
   comparison, but AD SamAccountNames are case-insensitive. In practice AD
   returns canonical casing so this usually works, but a mixed-case entry in
   `-ExcludeGroups` members could slip past the exclusion. Use
   `[StringComparer]::OrdinalIgnoreCase` on construction.

5. Minor: `scripts/Get-EndpointComplianceAudit.ps1` — the whole per-device
   query is one try/catch. If `Get-CimInstance Win32_OperatingSystem`
   succeeds but the `Win32_LogicalDisk` query fails, the machine is reported
   "Unreachable" even though it was reachable; disk-query failure deserves
   its own finding, not an unreachable verdict.

## Design / code quality issues

- **Password RNG is not cryptographic** (`New-BulkADUsers.ps1:63-75`).
  `Get-Random` is backed by `System.Random` — predictable output seeded by
  clock if called in rapid succession. For generated credentials, use
  `RNGCryptoServiceProvider` / `RandomNumberGenerator`.
- **Report-summary counts use regex matching on free text**
  (`Get-ADAccountComplianceReport.ps1:111-117`). The summary counts
  `'PasswordNeverExpires (any)'` via `$_.Findings -match 'PasswordNeverExpires'`.
  This works today but is brittle: any rewording of the reason strings
  silently breaks the summary. Track counters while building reasons, or
  emit structured finding codes alongside the human text.
- **`Get-EndpointComplianceAudit.ps1` has no `-WhatIf`** — defensible since
  it's read-only, but note the README's blanket claim ("every write action
  supports -WhatIf/-Confirm") is only vacuously true here. Fine as-is;
  just don't add write semantics later without it.
- **`New-RunLogPath` name-collision risk** (`Modules/Logging.psm1:40`):
  two runs in the same second overwrite the same log. Unlikely in practice;
  a `-f '%fffffff'` or a GUID fragment would remove it.
- Overall structure is genuinely good: shared logging module, consistent
  parameter style, `SupportsShouldProcess` on the two mutating scripts,
  per-row error isolation in the bulk provisioner, sample data + testable
  examples in the README. Nothing here is a real structural problem.

## Improvements (prioritized)

1. **Fix the temp-password delivery** (finding #1 above). Options in order
   of preference: (a) write per-row passwords to a separate
   `<run>_credentials.csv` with restrictive ACL guidance in the README,
   (b) accept `-TempPassword` per-run instead of generating, or
   (c) integrate a "communicate to manager" hook. Without this, the script's
   primary output is unusable.
2. **Gate never-logged-on disabling** behind `-IncludeNeverLoggedOn` or
   `whenCreated` age (finding #2). This is the difference between a scary
   script and a safe one in production.
3. **Use `RandomNumberGenerator`** for `New-TempPassword`.
4. **Split the disable/move try blocks** and record granular action states
   (finding #3): `Disabled`, `Disabled+Moved`, `DisabledMoveFailed`.
5. **Case-insensitive comparers** on both HashSets (finding #4).
6. **Structured finding codes** in the compliance report instead of regex
   on display text (design issue #2).
7. Nice-to-have: validate `-UpnSuffix` format and `-CsvPath` encoding
   (BOM handling for CSVs exported from Excel), and add `-MinBuildNumber`
   or an OS-build compliance check to the endpoint audit (the `OSBuild`
   field is collected but never evaluated against anything — dead data).

## Slop assessment

Notably clean. No em dashes in strings, no emoji, no placeholder
comments, no "// TODO"-style scaffolding. Comment-based help (`<#...#>`)
is thorough but functional — it documents parameters that genuinely need
it. Inline comments explain *why* (e.g. `LastLogonTimestamp` vs `LastLogon`
replication, `Get-Random` complexity guarantee) rather than narrating
obvious code. There is a mild "LLM house style" in the perfectly uniform
parameter blocks and the symmetrical HashSet/exclusion patterns across
scripts, and the README's "Built out of real day-to-day work" framing
reads like polished positioning — but the code itself shows real admin
instincts (per-row isolation, replicated-timestamp choice, WhatIf support).
Verdict: probably AI-assisted, definitely human-reviewed.

## Bottom line

This is one of the better-built small admin toolkits in the batch:
consistent safety rails, good logging/reporting discipline, and real
domain knowledge. The temp-password hole (#1) is the one finding that
blocks real-world use — everything else is hardening. With that fixed,
plus the never-logged-on guard (#2), this is production-ready for a
delegated admin to run.
