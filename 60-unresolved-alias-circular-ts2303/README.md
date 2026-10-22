# 60: "Circular definition of import alias" (TS2303) appears or not, depending on whether use2.ts resolves the alias first

## Project
- `decl.ts`: `import Foo = SomeNonExistingName; export { Foo };`
- `use2.ts`: `import { Foo } from "./decl";` + 40 slow mapped-type statements (ballast, `_harness\ballast.js`) + `export default Foo;`
- `pad0.ts`: one padding file (gen.js, `--pads 1 --padSize 40`).
- tsconfig has `declaration: true`.

## Result (default work-stealing, `--checkers 2`, 200 runs)
| Output | Count |
|---|---|
| `41d04acef2`: TS2304, TS2503 + two TS2303 "Circular definition of import alias 'Foo'" | 115 (57.5%) |
| `d7c0b5aa57`: only TS2304, TS2503 | 85 (42.5%) |

Full outputs are in `outputs\`.

## Why
Checker 0's queue is `[use2.ts, decl.ts]`, and checker 1's queue is `[pad0.ts]`. `use2.ts` and `pad0.ts` take about the same time (~10 ms). `TSRS_FILE_TIMES` placement (`_harness\placeout.js . 2 5`) shows the two schedules:
- Checker 1 finishes the pad first, steals `decl.ts` from the back of checker 0's queue, and checks it cold. The spelling-suggestion lookup for `SomeNonExistingName` re-enters the alias `Foo` while it is being resolved, so TS2303 is reported twice.
- Checker 0 finishes `use2.ts` first. `Foo` was already resolved through the import in use2, so checking decl.ts gives no TS2303.

## Reproduce
```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2
```
How it was built: the random-only hit `candidates\diag-unkimport` was turned into a race by moving the slow part into the use file. That makes the owner busy while the thief goes idle, and the thief then steals the light `decl.ts` from the back of the queue.
