# 26: extra TS2322 in f1.ts (`{ v: any }` not assignable to `number`) in a contextual cycle

## Project
- `lib.ts`: generic helper declarations (`fun`, `pipe`, `id`, `call`, `wrap`, `mk`, ...).
- `f0.ts`, `f1.ts`, `f2.ts`: three files whose exports reference each other through context-sensitive lambdas (e.g. `f1.ts`: `export const v0 = fun(x => f0.v0, y => y, 1)`; `f0.ts`: `v0 = wrap(pipe(f1.v1, z => z))`; `f2.ts`: `v0 = mk(x => ({ a: f0.v0 }))`).
- `f0.ts` has 40 ballast statements appended (`ballast.js`) so it is slow; `pad0.ts` is one pad (`gen.js --pads 1 --padSize 40`).

## Result (default work-stealing, `--checkers 2`, 200 runs)
| Output | Count | Rate |
|---|---|---|
| `106617cf97`: TS7022/TS7006/TS7024 only (f0.v0 is `any`) | 69 | 34.5% |
| `1748596109`: the same plus `f1.ts(4,28): TS2322 Type '{ v: any; }' is not assignable to type 'number'` | 131 | 65.5% |

Outputs in `outputs\`. Recheck, 50 runs: 20 vs 30 (40% minority). Load-dependent like all timing races, but both outputs are common.

## Why (inferred)
Whether `f0.v0` is already resolved (as `{ v: any }`) when `f1.ts` is checked decides if the circular lambda return is `any` or the wrapped object, which then fails against `number`. Random mode gives the same two outputs depending on file order. Here the slow f0.ts at the front of one checker's queue leaves f1/f2 at the back, so the idle checker steals them about half the time. Not traced in tsrs. The difference (extra assignability error from a cycle-dependent type) is of a different kind from #23 (TS2345 presence in f2) and #24 (`.d.ts`).

## Reproduce
```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2 --dump outputs
```
