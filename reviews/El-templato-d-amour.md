# Code Review — El-templato-d-amour
**Repo:** `builtbysai/El-templato-d-amour` (note: actually **private**, not public) · branch `main` @ `943738b` · 29 files, ~2,300 lines of Lua
**Reviewed:** 2026-10-10 · read-only review, no changes made

## What it does
A starter template for 2D games built on the LÖVE framework (pinned to LÖVE 11.4). It auto-discovers and loads modules at boot (`src/init.lua`), and ships a small standard library: Lua language extensions (table/string/math/OO class/signal/strict-mode/filesystem helpers), a virtual-resolution display manager (`utils/display.lua`, a push.lua-style letterbox scaler), a unified keyboard/mouse/touch input handler with per-frame press/release tracking, and asset loaders for audio, graphics, fonts, shaders, and video.

## Bugs / flaws (by severity)

### Critical — code that cannot run as written
1. **`math` extension references four undeclared globals** — `extensions/math.lua:17` (`math_floor`, `math_ceil`), `:35` (`math_abs`), `:42` (`math_sqrt`), `:46` (`math_atan2`). These look like lume-derived code where the `local math_floor = math.floor` aliases were lost. Under the repo's own strict mode this throws "undeclared variable"; without it, it's a nil call. `math.round`, `math.pingpong`, `math.distance`, `math.angle` are all dead on arrival.
2. **`math.random` is overridden with float semantics, breaking every integer caller** — `extensions/math.lua:48-53` redefines `math.random(a,b)` to return `a + love.math.random()*(b-a)` (a float). But `table.randomChoice` (`extensions/table.lua:163`: `t[math.random(#t)]`), `table.shuffle`, `table.weightedChoice`, `string.shuffle`, `string.random`, and `string.uuid` (`("..."):sub(r, r)` with float `r`) all depend on the standard integer `math.random`. After `extensions` loads, `t[2.7]` → `nil`, so random selection silently returns nothing and UUID generation breaks. This is the single most corrosive bug: one override poisons half the utility library.
3. **Bare `self` in dot-defined functions (nil/undeclared)** — `assets/init.lua:11,15` (`assets.load`/`assets.get`), `assets/audio/init.lua:14-15,19,25-26`, `assets/graphics/init.lua:18`, `assets/fonts/init.lua:17-21,26-29` all use `self` inside `function mod.name(...)` (dot, not colon) definitions. `self` is never a parameter and never declared → strict-mode error, or "index nil" without it. None of the asset `load`/`get`/`onFileDrop` APIs work.
4. **`table.deepcopy` calls undefined global `DeepCopy`** — `extensions/table.lua:455`. Should recurse as `table.deepcopy`. Strict mode turns this into an "undeclared variable" error at call time.
5. **`table.getValues` inserts `k` instead of `v`** — `extensions/table.lua:128`: loop is `for _, v in getiter(t)` but writes `values[#values+1] = k`. `k` doesn't exist → assigns nil → silently returns an empty table. (The trailing comment even says `-- table.insert(values, v)`.)
6. **`tostr` concatenates strings with `+`** — `extensions/table.lua:487`: `predent + key + value ...` is an arithmetic error. `table.print` is broken.
7. **`display:getOffsetX/Y` typo** — `utils/display.lua:171-172` return `self.offet.x` ("offet"). Any caller (including `display:getOffset`) crashes on nil index.
8. **`display:getScale` drops the colon** — `utils/display.lua:177`: `self.getScaleX()` calls without `self` → "index nil" inside.
9. **`keyboard:unbindSequence` calls a nonexistent method** — `utils/inputHandler/keyboard.lua:139`: `self.sequences:remove()` on a plain array table → "attempt to call nil". (The `table.remove` on the line above already did the job; this line is pure leftover.)
10. **`mouse:registerSignal`/`removeSignal` reference undeclared `btn`, `presses`** — `utils/inputHandler/mouse.lua:142,146`. Neither is a parameter; strict mode errors, otherwise `btn` is nil and the signal name silently degrades.
11. **`mouse:move` uses undefined `self.pos`** — `utils/inputHandler/mouse.lua:192`: `self.pos.x` → nil index error.
12. **`graphics` loader references undefined `file`** — `assets/graphics/init.lua:37`: `(path.."/"..file)` should be `v`. Any image placed under `assets/graphics/` crashes the boot-time asset scan.
13. **`string.trim` calls undefined `patternescape`** — `extensions/string.lua:112`. Should be a local escape helper or inline pattern.

### High — wrong behavior, no crash (or crash on edge input)
14. **File-drop handler is triply broken** — `assets/init.lua:20-29`: (a) `file:getExtension()` is not a LÖVE `DroppedFile` method (the API has `getFilename`, no `getExtension`) → error on any drop; (b) `table.contain` (line 24) doesn't exist — it's `table.contains` → nil call; (c) the loop `for i = 1, #{"audio","graphics"}` indexes `assets[subDirectories[i]]`, but `subDirectories` comes from `pairs()`-ordered `getDirectories` (audio, fonts, graphics, shaders, video in arbitrary order) — so it checks the wrong modules, and would hit modules without `.formats` (fonts has one, shaders/video don't) → nil-index on `.formats`.
15. **`display:getFlags` ignores explicit `false` settings** — `utils/display.lua:63`: `if self.settings[k]` skips falsy values, so `applySettings({resizable=false})` can never turn a flag off. Should test `~= nil`.
16. **`display:resize` highdpi branch is dead code** — `utils/display.lua:198-201`: sets `self.width/height` from DPI scale, then unconditionally overwrites with `w, h` on the next line.
17. **`display:init` / `toggleFullscreen` assume a non-empty resolution list** — `utils/display.lua:91-92` (`[1][1]` on possibly-empty table) and `:152` (`unpack(nil)`). `getAvailableResolutions` can return `{}` on unusual displays → boot crash.
18. **`table.merge` discards nested merges** — `extensions/table.lua:469`: `table.merge(rtn[k], v)` throws away the return value; nested tables are never actually merged.
19. **`touch:getX(id)`/`getY(id)` pass a touch id where an index is expected** — `utils/inputHandler/touch.lua:86-103`: `getPosition(n)` matches `i == n` against the 1-based loop index, so passing a LÖVE touch id (lightuserdata) never matches → always returns nil.
20. **`audio.load` never forwards the source type** — `assets/audio/init.lua:14`: `love.audio.newSource(filepath)` omits the `SourceType` the signature just accepted, so "stream"-intended music loads as the default type.
21. **`weightedChoice` boundary skew** — `extensions/table.lua`: `math.random(sum)` returns 1..sum but the cumulative test is `rnd < v` (strict); combined with the float `math.random` override (#2), distribution is wrong on two counts.

### Medium / low
- `mouse:wasPressed`/`wasReleased` return `nil` instead of `false` on no-press (`mouse.lua:78-84,110-116`) — falsy so mostly harmless, but inconsistent with the boolean contract.
- `touch:wasPressed(id, pressure)` (`touch.lua:75`) compares `nil >= pressure` → error when a pressure threshold is passed but that id was never pressed.
- `display:grabMouse` mixes real/window coordinates against virtual bounds; clamp logic is suspect (`display.lua:205-219`).
- `getAvailableResolutions` calls `love.window.getDesktopDimensions()` inside the loop on every iteration (`display.lua:72`) — hoist it.
- `extensions/strict.lua:10`: `print(key, value)` debug leftover inside `register()` — prints every allowed name on every `lock()` call.
- `utils/inputHandler/init.lua:28`: stray `print(filename)` in `load()`.
- `sequence:remove()` (`keyboard.lua:131`) assigns `self = nil` — a no-op on a parameter; dead code.
- `getCurrentFolder` fallback `require("util/filesystem")` in all five asset sub-inits (`assets/*/init.lua:1-2`) points at a path that doesn't exist (`utils/`, not `util/`). Latent — only reachable if `_G.filesystem` is missing.
- `assets/shaders/README.md` references `asset.shaders.lua`, which doesn't exist; the shaders module (`assets/shaders/init.lua`) is an empty stub that loads nothing.
- `main.lua:6-7`: header comment exposes a personal Gmail address and links the old `Spairkie/El-templato-d-amour` URL (repo now lives under `builtbysai`).
- `conf.lua` pins `t.version = "11.4"`; LÖVE 12 is current — fine as a floor, but worth a conscious decision note.

## Design / code quality issues
- **Global-namespace pollution as architecture.** `extensions/init.lua` `rawset`s every helper (`Class`, `signal`, `filesystem`, `strict`, plus the mutated `table`/`string`/`math` libraries) into `_G`, and `src/init.lua` adds a global `dependencies` table that input modules reach into (`mouse.lua`, `touch.lua` guard on `dependencies.utils.display`). It works, but it makes load order invisible, defeats the strict-mode safety it's paired with, and turns every module into spooky action at a distance. A single returned context table passed explicitly would be cleaner and testable.
- **Callback hijacking.** `keyboard.lua`, `mouse.lua`, `touch.lua`, and `display.lua` define `love.keypressed`, `love.mousepressed`, `love.resize`, etc. at require time. A template user's own `love.keypressed` in `main.lua` silently replaces the tracker's and breaks `wasPressed` — the exact failure mode the module exists to prevent. These should compose (chain to a previous handler) or be opt-in.
- **Nondeterministic boot order.** `src/init.lua`, `assets/init.lua`, `utils/init.lua`, and `extensions/init.lua` all iterate `pairs()` over directory listings to decide require order. `string.random` "depends on table module" per its own comment — today that's only safe because the dependency is call-time, not load-time, but any load-time cross-dependency becomes order-dependent heisenbugs. Sort the directory lists.
- **Massive copy-paste across init.lua loaders.** The blacklist/require-submodule loop is duplicated nearly verbatim in `src`, `utils`, `utils/inputHandler`, `assets`, and (varied) in `extensions` — a shared `filesystem.requireAll` already exists (`extensions/filesystem.lua`) but isn't used by any of them.
- **Inconsistent `self` discipline** is the root cause of bug #3: some modules use `:` correctly (`display`, `keyboard`), others use `.` with bare `self` (`audio`, `fonts`, `graphics.onFileDrop`, `assets`). Pick one and lint it.
- **`getDirectories`/`getDirectoryItems` re-stat the filesystem repeatedly** and mix string/table values in one table keyed inconsistently (dirs as keys, files as values) — the dual representation is what enables the `assets/init.lua:23` index mismatch.
- **README is a stub.** For a *template* whose entire value proposition is its helper libraries, the README is one sentence plus a diagram: no setup instructions, no module catalog, no usage examples, no API surface. The SVG diagram is nice, but docs are the product here.
- Magic values: `display.lua` clamps window dragging at 80%/20% (`minX = -0.8 * self.width` etc.), resolution filter `desktop/2.25` (`display.lua:74`) — unexplained constants that deserve names or comments.
- `math.sign(0)` returns `1`; `math.clamp` argument order `(x, min, max)` is fine but undocumented vs. alternatives. Minor.

## Improvements (prioritized)
1. **Fix the `math` extension first** — restore `local math_floor = math.floor` (etc.) aliases, and *do not* override `math.random` with float semantics. If a float random is wanted, name it `math.randomf` and leave the stdlib contract intact. This single fix un-breaks six downstream modules.
2. **Enforce colon/dot consistency** — change all bare-`self` functions to `:` methods (or qualify `audio.`/`fonts.` explicitly like `video.load` already does correctly). A one-pass lint for `self` inside `function x.y(` definitions catches all of #3.
3. **Rewrite `assets/init.lua:love.filedropped`** — derive the extension from `file:getFilename()` with a pattern match, use `table.contains`, and iterate the literal `{"audio","graphics"}` list instead of `subDirectories[i]`.
4. **Make love-callback modules composable** — wrap rather than replace: `local prev = love.keypressed; function love.keypressed(...) tracker(...); if prev then prev(...) end end`, or document that users must call `inputHandler` hooks.
5. **Deterministic load order** — `table.sort` the directory listings in `src/init.lua`/`extensions/init.lua` (and use the existing `filesystem.requireAll` everywhere to kill the duplicated loader loops).
6. **Fix the small crashers**: `self.offet` → `self.offset`, `self.getScaleX()` → `self:getScaleX()`, `table.contain` → `table.contains`, `file` → `v` in graphics loader, `DeepCopy` → `table.deepcopy`, `patternescape` → local helper, `+` → `..` in `tostr`, `k` → `v` in `getValues`, `btn`/`presses` params in mouse signal helpers, `self.pos` → track actual mouse pos, `getFlags` nil-check.
7. **Guard the resolution-list edge cases** in `display:init`/`toggleFullscreen` (fall back to current window size when the list is empty) and delete the dead highdpi line in `resize`.
8. **Write the README the template deserves**: module catalog, 5-line quickstart (`display:init(800,600,384,216)` + `inputHandler` wiring), and the input/display conventions. Docs are the deliverable for a template repo.
9. **Housekeeping**: remove debug `print`s, fix the stale `Spairkie` URL, drop the personal email from `main.lua` (or move to a profile link), finish or delete the shaders stub, decide on LÖVE 11.4 vs 12.
10. **Add a smoke test**: even a headless `love --console` boot that requires every module would have caught bugs #1–#13 before any human read them.

## Slop assessment
Moderate AI-generation tells, but the bugs cut against pure-AI authorship in an interesting way:
- **For AI-assisted**: the decorative ASCII banner in `src/init.lua:1-3`, the copy-pasted `-- localized helper functions` header on five files, em-dash-free but heavy use of `--` explanatory comments restating the code ("`-- keep track of the current key pressed`" on the obvious line), the TODO placeholders (`joystick.lua` is literally `local joystick = {} -- TODO`), commented-out dead code blocks (the entire `map` binding system in keyboard/mouse), and the inconsistent `self` discipline characteristic of stitched-together snippets.
- **Against pure slop**: no em dashes anywhere in Lua sources, third-party libs are properly attributed (hump.signal, rxi classic, Yonaba strictness, bartbes Meta, push.lua lineage), and several modules (`display.lua`, `signal.lua`, `table.lua`'s lume-style set) show genuine domain understanding.
- Verdict: reads like a human assembling a personal toolkit over time from blog/tutorial snippets (Sheepolution, Ulydev, rxi, vrld all cited), with AI help on some passes — ambitious scaffolding, but it was never executed end-to-end, which is why ~20 runtime bugs survived. The single most telling detail: `joystick.lua` is an empty TODO stub while `conf.lua` enables the joystick module — the template was published before it was finished.

## Bottom line
Good bones, never run. The architecture (auto-loader + extensions + display + input + assets) is a sensible LÖVE starter kit and the third-party picks are solid, but the repo as committed cannot boot a game that touches `math.round`, asset `load`/`get`, file drops, mouse-signal registration, or half the display getters. Fix the `math` module and the `self` discipline first; everything else is cleanup.
