# 34: extra TS2589 in u2.ts (col 52) depends on whether u1.ts ran first on the same checker

## Project (found with `candidates\c3-fuzz\fuzz.js`, reduced by hand)
- `k.ts`: `export type K<T> = { [P in keyof T]: K<T[P]> }[keyof T] | T;`
- `j.ts`: `declare function join<T>(l: K<T>[]): K<T>; declare function mk<T>(x: T): K<T>;`
- `u1.ts`: `function f0<T>(l: K<T>[]): void { const x: K<T> | undefined = join(l); }` followed by 14 ballast statements (`_harness\ballast.js`).
- `u2.ts`: `function g0<T>(x: K<T>) { const y: K<T[]> = mk(x); return y; }`
- `pad0.ts`: one pad (gen.js, `--pads 1 --padSize 175`). `declaration: true`, `strict`.

## Result (default work-stealing, `--checkers 2`, 200 runs)
| Output | Count |
|---|---|
| `b4616973e0`: u2.ts TS2589 at 3:40, 3:52 and 3:55 | 123 (61.5%) |
| `367c51fed6`: u2.ts TS2589 at 3:40 and 3:55 only (3:52 missing) | 77 (38.5%) |

Recheck, 50 runs: 27 / 23 (46% minority). Rates over 30-run sweeps at nearby settings were 30-40%, so it is not tuned to one setting. Outputs in `outputs\`.

## Why
Random-mode triage (`placeout.js c3-r1 2 12 random`) shows the odd output appears exactly when `u1.ts` is checked before `u2.ts` on the same checker: `u2.ts` then takes about 9 ms instead of 17 ms, because the instantiations of `K<T>` made by `u1.ts` are cached, and the depth-limit error at 3:52 is never reached.
In steal mode the checker that owns `u1.ts` runs it while the other one is busy with the pad (~equal time). If the idle checker steals `u2.ts` from the back of the owner's queue, it checks it cold and reports all three errors; if the owner finishes `u1.ts` and goes on to `u2.ts`, the cached results suppress one. (Mechanism inferred, not traced in tsrs.)

## Reproduce
```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2
```
