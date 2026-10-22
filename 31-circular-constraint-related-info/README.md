# 31: TS2313 circular-constraint related info depends on which file checks first

## Project
- `decl.ts`: `export function f<U extends U>(x: U): U { return x; }`
- `u1.ts`: `import { f } from "./decl"; export const r2 = f(1);`
- `pad0..pad5.ts`: independent padding (gen.js, `--pads 6 --padSize 40`).

## Result (default work-stealing, `--checkers 6`, `--pretty true`, 200 runs)
| Output | Count |
|---|---|
| `3e74dfbea3`: TS2313 on decl.ts with no related info | 162 (81%) |
| `8678aa70b2`: TS2313 plus related info "u1.ts:2:19 - Circularity originates in type at this location." | 38 (19%) |

Full outputs are in `outputs\`. In this project the race only shows up in the related info, so you need `--pretty true`. With `--pretty false` both outputs print the same one line.
Other layouts that raced: 8 pads at N=4 (12/60) and 8 pads at N=8 (6/60).

## Why
(This is inferred from the outputs; I did not trace it in tsrs.) The circular constraint of `U` is first resolved while checking either `decl.ts` or the call `f(1)` in `u1.ts`. If the checker that owns `u1.ts` resolves it first (because a thief stole `u1.ts` and ran it earlier), the cached circularity carries the call-site location as related info.

## Reproduce
```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 6 --args "--pretty true"
```
