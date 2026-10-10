# Code Review: ad-security-auditor

**Repo:** https://github.com/builtbysai/ad-security-auditor
**Reviewed:** 2026-10-10 (read-only; shallow clone, no modifications)
**Scope:** All source files (~430 lines of PowerShell total across 9 files)

---

## What it does

A PowerShell 5.1 toolkit that audits Active Directory security posture from **offline CSV exports** (users, groups, computers) instead of querying a live domain. It runs seven modular `Test-*` check functions (stale accounts, password-never-expires, old password age, privileged group membership, outdated OS, duplicate SPNs) and emits dark-themed HTML plus CSV/JSON reports. The audience is IT admins / auditors who want to analyze exported AD data, plus students learning AD security concepts — the synthetic sample dataset in `SampleData/` makes it runnable with zero setup.

**Overall verdict: genuinely solid for its size.** The logic is correct in the common cases, the HTML report properly escapes output (XSS-safe), the functions are modular and testable, and the sample data is thoughtfully constructed with planted findings. It reads like a careful human-authored small utility, not slop. The issues below are real but none are showstoppers.

---

## Bugs / flaws (with file:line citations)

1. **`Test-StaleAccounts.ps1:19` — unhandled `[bool]::Parse` can crash the audit.**
   `if ([string]::IsNullOrWhiteSpace($acc.Enabled) -or [bool]::Parse($acc.Enabled) -eq $true)` calls `[bool]::Parse` *outside* the try/catch (the try only wraps the date parse below). A non-boolean value in the `Enabled` column (e.g. `Yes`, `1`, `Enabled`) throws an unhandled `FormatException` and kills the entire audit run. Every other check function (`Test-OldPasswordAge.ps1:15`, `Test-OutdatedOS.ps1:14`, `Test-PasswordNeverExpires.ps1:13-14`, `Test-PrivilegedGroupMembership.ps1:31`) uses the safe `[bool]::TryParse(...) -and [bool]::Parse(...)` pattern — this one file was left inconsistent.

2. **`Invoke-ADSecurityAudit.ps1:36-38` — `GroupsCsv` is imported and then never used.**
   `$groups = Import-Csv -Path $GroupsCsv` is loaded, but no check consumes it. The group export is mandatory CLI input that does nothing — wasted parameter and a misleading contract.

3. **README advertises "16 findings across 7 checks" — the sample data now produces 17.**
   Sample dates are fixed but thresholds are rolling (`(Get-Date).AddDays(-365)`). `srogers` has `PasswordLastSet = 2025-10-01`, which is now 374 days ago, so `Test-OldPasswordAge` flags it today: 2 + 1 + 2 + 5 + 3 + 2 + 2 = **17** findings, not the advertised 16 (README + `assets/terminal-demo.svg` + commit message). Any hardcoded finding count in docs/assets will keep drifting. Either generate sample dates relative to "today" at run time or drop the exact number.

4. **`Test-DuplicateSPNs.ps1:26-33` — a duplicated SPN *within a single account* is a false positive.**
   `$allSPNs[$spn] += $acc.SamAccountName` appends the account name once per SPN occurrence, so `ServicePrincipalNames = "HTTP/x;HTTP/x"` on one account yields `Count = 2` → flagged as "Duplicate SPN". Should dedupe per-account (e.g. `Select-Object -Unique` before the cross-account count).

5. **`Test-PrivilegedGroupMembership.ps1:19` — `MemberOf` split assumption doesn't match real `Export-Csv` output.**
   The code splits on `';'`, which matches the synthetic sample data but **not** what `Get-ADUser -Properties * | Export-Csv` actually produces (multi-valued properties aren't semicolon-delimited). Detection still works by accident — `-match "CN=Domain Admins,"` is a substring regex over the whole blob — but the per-group loop is meaningless on real exports and the logic is fragile. Parse DNs properly or document the expected delimiter.

6. **`Test-PrivilegedGroupMembership.ps1:7` — default allowlist is tuned to the sample data.**
   `-AllowedUsers = @("Administrator", "jsmith", "svc_sql")` are names from the *sample dataset*. Anyone running this against a real export gets sample-specific defaults baked in — a real admin's service accounts will all flag Critical until they discover and override this parameter. The orchestrator calls it without overriding (`Invoke-ADSecurityAudit.ps1:42`).

7. **`New-HtmlReport.ps1:10-11` — unknown severity sorts to the top.**
   `$severityMap[$_.Severity]` returns `$null` for any severity not in the map, and `$null` sorts *before* `Critical = 1`. Any future check emitting a new severity string silently lands above Critical.

8. **Zero-findings run produces empty/corrupt report files (`Invoke-ADSecurityAudit.ps1:53-58`).**
   `@() | Export-Csv` writes a headerless/empty file and `@() | ConvertTo-Json` emits nothing, so a clean audit yields a 0-byte JSON and a degenerate CSV while the HTML works fine. Minor, but a "clean" report should still be well-formed.

9. **`Test-StaleAccounts.ps1:23` / `Test-OldPasswordAge.ps1:20` — bare `catch {}` silently swallows date-parse failures.**
   Malformed `LastLogonDate`/`PasswordLastSet` values are skipped with no warning, so a bad export column format silently produces *fewer findings than reality* — the worst failure mode for an audit tool (fail-open). Should at least `Write-Warning` the count of skipped rows.

10. **`Tests/ADSecurityAuditor.Tests.ps1` — Pester v3 legacy syntax (`Should Be`).**
    Works on the Pester 3.4 bundled with Windows PowerShell 5.1, but breaks on Pester 5+ (legacy assertions removed). No `Requires -Modules` pin, so behavior depends on whichever Pester happens to be installed. Also: no tests at all for `New-HtmlReport`.

---

## Design / code quality issues

- **Copy-pasted boolean coercion in 4 files.** The `[string]::IsNullOrWhiteSpace($x.Enabled) -or ([bool]::TryParse($x.Enabled,[ref]$null) -and [bool]::Parse($x.Enabled))` idiom appears verbatim in `Test-OldPasswordAge.ps1:15`, `Test-OutdatedOS.ps1:14`, `Test-PasswordNeverExpires.ps1:13`, `Test-PrivilegedGroupMembership.ps1:31` — and a *broken variant* in `Test-StaleAccounts.ps1:19` (see bug #1; the duplication is exactly how the inconsistency crept in). This belongs in one private helper, e.g. `Private/Test-IsEnabled.ps1`.
- **Magic numbers in the orchestrator:** `90` and `365` day thresholds are hardcoded (`Invoke-ADSecurityAudit.ps1:40,43`) instead of being script parameters. The outdated-OS pattern list (`Test-OutdatedOS.ps1:12`) is hardcoded too — as of 2026 it misses end-of-life-but-common platforms (Server 2016 hits EOL Jan 2027; Windows 10 EOL'd Oct 2025 but isn't flagged at all).
- **README claims CSV/JSON inputs; only CSV is implemented.** First paragraph: "audit Active Directory security posture from exported data (CSV/JSON)" — there is no JSON import path.
- **README claims "Duplicate or stale Service Principal Names" — only duplicates are checked.** There is no stale-SPN detection (SPN pointing at a deleted/renamed host); the feature list overstates the implementation.
- **Repeated `Where-Object` severity counting in `New-HtmlReport.ps1:34-37`** — four full scans; `Group-Object` would do it in one. Trivial, but it's the kind of thing a helper would clean up.
- **Inconsistent enabled-default semantics are undocumented.** Blank `Enabled` = treated as enabled everywhere (fail-open default). Defensible, but it's a security-relevant assumption that should be stated in the README or as comment-based help.

---

## Improvements (prioritized)

1. **Fix the `[bool]::Parse` crash** (`Test-StaleAccounts.ps1:19`) — highest priority because it's a runtime crash on realistic input; extract the shared `Test-IsEnabled` helper at the same time to prevent recurrence.
2. **Warn on skipped rows** — count rows skipped by bare `catch {}` and `Write-Warning` the totals; an audit tool must never silently under-report.
3. **Make thresholds parameters** (`-DaysInactive`, `-MaxPasswordAgeDays`) on the orchestrator; move the outdated-OS list to a config/data file so it can be updated without code changes, and add Server 2016 / Windows 10.
4. **Remove the sample-data-specific allowlist default** — default `AllowedUsers` to `@()` (or require it), so out-of-the-box runs don't inherit demo names.
5. **Either use `GroupsCsv` or drop it** — e.g. validate privileged-group existence against it, or remove the mandatory parameter.
6. **Fix the duplicate-SPN self-duplicate false positive** and make SPN keying explicitly case-insensitive-normalized (`.ToLower().Trim()`) rather than relying on PowerShell hashtable case-insensitivity by accident.
7. **Parse `MemberOf` robustly** (handle real `Export-Csv` multi-value formatting) and document the expected export format precisely in the README.
8. **Add `New-HtmlReport` Pester tests** and migrate assertions to `Should -Be` with a Pester version requirement; pin or document the tested Pester version.
9. **Derive sample data dates relative to run date** (or regenerate per run) so the documented "16 findings" claim stops drifting.
10. **Small robustness:** `ValidateScript({Test-Path $_})` on CSV params; guard the empty-findings export path; include audit timestamp + source file names in the HTML report header.

---

## Slop assessment

**Low slop. This does not read like bulk AI-generated code.**

- No em dashes, no curly quotes anywhere in `.ps1` files; comment density is minimal (~1–2 comments per file, mostly synopsis headers).
- Naming is consistent and domain-appropriate (`Test-StaleAccounts`, `New-HtmlReport`), the Public/Private module layout is deliberate, and the sample dataset is carefully hand-built with meaningful planted findings (disabled DA member, duplicate SPN across user+computer, 2008 R2 file server) — that kind of coherent fixture design is a human tell.
- The code has *earned* quirks rather than generated ones: the HTML-encoding of report fields shows real security awareness, and the bugs found (inconsistent bool parsing across copy-pasted helpers, time-drifted doc counts) are the kind a human introduces through iteration.
- One mild AI-ish tell: the conversational inline comment in `New-HtmlReport.ps1:9` — `"...though alphabetical isn't perfect for severity, let's map them"` — reads like a thinking-aloud artifact. One line; not a pattern.
- The repetitive `[bool]::TryParse(...,[ref]$null)` idiom repeated verbatim across files is a code smell but not a slop marker — it's consistent human copy-paste, complete with the human error of the one file that diverged.

**Bottom line:** a competent, genuinely useful small tool with a handful of real bugs (one crash-grade) and honest documentation drift. Fix the `Test-StaleAccounts` parse crash and the silent-skip failure mode, and it's solid.
