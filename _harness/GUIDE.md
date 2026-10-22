# Guide: finding tsrs work-stealing non-determinism (shared context for subagents)

## Goal
tsrs (`Q:\tsrs-nondet\tsrs`) is a Rust port of typescript-go. It type-checks files with N checkers in parallel. Each checker has its own type cache, and idle checkers *steal* files from the back of other checkers' queues, which makes file-to-checker placement timing dependent.
The TypeScript type checker is order-dependent: the diagnostics and the emitted .d.ts can depend on which files a checker has already checked. So under stealing, one project can give different output from run to run.
**Our goal:** for each known order dependence in the checker, a synthetic multi-file project where the default tsrs (stealing on) gives different output across runs. Each confirmed case goes in its own folder under `Q:\tsrs-nondet\found\NN-name\` with a README.md.

## Tools (Windows, PowerShell; use `cd Q:\tsrs-nondet` first)
- tsrs binary (already built): `Q:\tsrs-nondet\tsrs\target\debug\tsrs.exe -p <dir> --incremental false --pretty false --checkers N`.
  Do NOT rebuild tsrs (other agents are using the binary).
- `node harness\run.js <dir> --mode steal|random|both --runs R --checkers 1,2,4 [--lines 30] [--dump <dir>]`
  runs tsrs repeatedly and prints a histogram of distinct outputs (stdout, exit code, and every file under `<dir>\out\`, so set `outDir: "out"` to compare emitted .d.ts).
  - `random` mode sets `TSRS_CHECKER_ASSIGNMENT=random:<seed>` (seeds 1..R). Each seed puts each file on a random checker with a random visit order. It is deterministic and has no stealing.
    **This is the triage tool:** if a project's output differs across seeds, stealing can produce those outputs too.
  - `steal` mode is the real default behaviour (a timing race).
  - `--dump` writes each distinct output to a file, so you can diff them.
- `node harness\fromtest.js <test.ts> <outDir>` converts a TS compiler test file (`// @option: value`, `// @filename: x.ts`) into a project dir with a tsconfig.json.
- `node harness\gen2.js <outDir> --core <coreDir> --k1 4 --k2 0 --skipLib --ghost 2000000 --padSize 5`
  wraps a core project (its files + tsconfig) into `<outDir>\g1\...` and adds k1 "pad" files.
  This **turns a random-mode hit into a steal-mode race**:
  - Each pad does a bit of real checking work (padSize ≈ 0.2 ms per unit) plus `ghost` characters of comments.
  - The comments inflate tsrs's cost estimate, so the pads split evenly between the 2 checkers, with the core files at the back of one checker's queue.
  - The other checker finishes its pads and steals a core file, or doesn't, depending on timing.
  - Sweep `--k1 3,4,5` × `--padSize 3,5,10,15,20` at `--checkers 2`, 10 runs each, and look for configurations with 2+ outputs. Then measure about 200 runs.
  - `--sizes 5,5,6,...` sets per-pad sizes.
  - `--skipLib` matters: otherwise checking lib.dom.d.ts (~190 ms) dominates the schedule.
  - Core files are placed in g1 in their tsconfig `files` order; empty files are dropped.
- `node harness\gen.js <outDir> --core <dir> --pads 6 --padSize 40` is the older flat padding. Sweeping it with `--checkers 2..8` also worked sometimes, but those races drifted over time (#2 and #3 were later re-tuned with the ballast recipe below).
- `node harness\place.js <dir> N [runs]` shows which checker checked each file (reverse completion order).

## Method
1. Pick an order-dependent checker behaviour (a cache, a depth guard, a circularity check, a diagnostic that is reported only once). Work out the order dependence: which query, made first from which context, changes the result (cached type, diagnostic location, union member order, circularity error, depth-limit error, ...).
2. Build a small **cross-file** project. tsrs steals whole files, so the order dependence has to come from *which file is checked first on a fresh checker*. Typical shapes:
   - `decl.ts` holds the shared declaration.
   - `use1.ts` and `use2.ts` each trigger the order-sensitive computation from different entry points.
   - Same checker: the second file reuses the first file's cached result. Different checkers: both compute from their own entry.
   - Things that show up in output: diagnostics (TS2589 depth limits, circularity errors TS2456/TS2502/TS7022/TS2716 landing on a different declaration, errors that appear or not), union/intersection member order in error messages or .d.ts, `declaration: true` emit.
   - Single-file compiler tests need to be **split** into declaration file + use files.
3. Triage: `node harness\run.js <dir> --mode random --runs 20 --checkers 2,3,4`. If more than one distinct output appears, it's a hit. Also check `--mode steal` at `--checkers 2..8` directly.
4. For a hit: wrap with gen2.js (or gen.js), find a racy configuration, measure about 200 runs in steal mode, and dump the outputs.
5. **Immediately** set it aside: copy the project to `Q:\tsrs-nondet\found\NN-<short-name>\` (NN from your assigned range), plus an `outputs\` dir from `--dump`, plus a README.md.
   See `Q:\tsrs-nondet\found\04-recursive-indexed-access-ts2589\README.md` for the format: title, a result table with counts and rates, the program, why it happens, the setup, and the reproduce command (`node ..\_harness\run.js . --mode steal --runs 200 --checkers 2`).
6. Iterate. Rates may be low; keep trying variants: different entry points, more files, declaration emit, different checker counts.

## Notes
- tsrs claims "canonical-mode" determinism for many cases and already fixed several channels. Read `tsrs\notes\open-history-dependence.md`, `tsrs\notes\perf-order-independence.md` and `tsrs\upstream\determinism-*.md` for what is known to still be open and for ready-made reductions.
- tsrs's checker sources are in `tsrs\crates\tsrs_checker\src\` (mirrors typescript-go's internal/checker). Use them to check whether tsrs already canonicalizes something (e.g. union ordering).
- Small projects default to 1 checker, so always pass `--checkers N`.
- Other agents run tsrs at the same time. Keep run counts moderate (≤ 200 per measurement) and don't kill other processes.
- Don't modify `harness\*.js` (shared). Copy a script into your own work dir if you need changes.
- Work in `Q:\tsrs-nondet\candidates\<your-prefix>-*`.
- Existing finds: 01 base-constraint depth, 02 circular defaults, 03 spread cycle, 04 recursive indexed access.

## Converting a random-only hit into a steal race: the "slow front file" (ballast) recipe
This produced found #26, #60, #61, #62 and #63.
1. Run `node placeout.js <dir> 2 12 random` to find the rule: which per-checker file order gives which output hash. Typically "victim checked after poison on the same checker" gives one output, and "victim stolen or checked alone" gives the other.
2. Run `node placeout.js <dir> 2 4` (steal) to see the default placement. Core files sit at the front of their owner's queue; a thief takes from the back of the busiest queue.
3. Make the file the owner checks first slow. Prepend `node ballast.js <file> <count>` ballast statements BEFORE its triggering statement (keep imports first).
4. Give the other checker something of equal duration: one gen.js pad (`--pads 1 --padSize 40` is about 5 ms) or a ballast-only pad file (about 0.25 ms per ballast statement). Then sweep the ballast count. Placement changes are sharp, so the window that races is narrow; measure 16–30 runs per step.
5. Very small projects may never use the second checker. If checker 1 never runs anything, add a second pad.
