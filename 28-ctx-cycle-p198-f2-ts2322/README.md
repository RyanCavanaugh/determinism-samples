# 28: extra TS2322 in f2.ts (`{ p: any }` not assignable to `number`) in a 4-file contextual cycle

## Project
`lib.ts` (generic helpers) plus `f0..f3.ts` importing each other, e.g.
`f0: v0 = pipe(f3.v1, x => id(x)); v1 = mk(x => ({ a: f1.v0 }))`, `f1: v0 = id(id(x => f0.v0)); v1 = both(x => f2.v0, y => 1)`,
`f2: v0 = fun(x => f3.v1, y => y, 1)`, `f3: v0 = (Math.random() < 0.5 ? (x: number) => f0.v0 : (x: number) => 1); v1 = ({ p: f0.v0 })`.

## Result (default work-stealing, `--checkers 2`, 200 runs)
| Output | Count | Rate |
|---|---|---|
| `6cfdb723bf`: TS7022 f0.v0, TS7006 f1, TS7022 f3.v1 | 163 | 81.5% |
| `7fa4677d76`: the same plus `f2.ts(5,28): TS2322 Type '{ p: any; }' is not assignable to type 'number'` | 37 | 18.5% |

Outputs in `outputs\`. Recheck, 50 runs: 13 minority (26%); earlier 100-run probe 36%. At N=3 only the first output was seen, at N=4 only the second (30 runs each, deterministic per N).

## Why (inferred)
Same family as #26: whether `f3.v1` (`{ p: f0.v0 }`) is resolved with `f0.v0` already circular-`any` or as a real type when `f2.v0`'s `fun(...)` call is inferred. That depends on which files the checker has evaluated first. Random mode gives the same two outputs. Not traced in tsrs.

## Reproduce
```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2 --dump outputs
```
