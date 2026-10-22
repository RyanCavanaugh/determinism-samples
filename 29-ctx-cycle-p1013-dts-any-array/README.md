# 29: `.d.ts` of f3.v0 (`id(f0.v1)`) is `any[]` or `any[][]` in a contextual cycle

## Project
`lib.ts` (generic helpers, `arr: { map<U>(f: (x: number) => U): U[] }`) plus `f0..f4.ts`, e.g.
`f0: v0 = call(() => f2.v1); v1 = arr.map(x => f4.v1)`, `f1: v0 = arr.map(x => f4.v1)`, `f2: v0 = ({ p: f0.v0 })`, `f3: v0 = id(f0.v1)`, `f4: v0 = id(id(x => f1.v0)); v1 = arr.map(x => f1.v0)`.
`tsconfig.json`: `declaration`, `emitDeclarationOnly`, `outDir: out`. Diagnostics (TS7022/TS7024/TS7006) are identical in both outputs; only the emitted `f3.d.ts` differs.

## Result (default work-stealing, `--checkers 4`, 200 runs)
| Output | Count | Rate |
|---|---|---|
| `14fcbac008`: `f3.d.ts` `export declare const v0: any[][];` | 101 | 50.5% |
| `391bd9db3f`: `f3.d.ts` `export declare const v0: any[];` | 99 | 49.5% |

Outputs in `outputs\`. Recheck, 50 runs: 26 / 24. At N=2 and N=3 only one output appeared (25 runs each).

## Why (inferred)
`f0.v1 = arr.map(x => f4.v1)` is inside a cycle through f4/f1. If the checker that emits `f3.d.ts` has already resolved `f0.v1` to `any[][]` (via f4.v1 `any` wrapped by `map`), `id(f0.v1)` copies it; if `f0.v1` is computed during the cycle from `f3`'s entry point it is `any[]`. Not traced in tsrs. Differs from #24 (function return `any` vs `number`): here the array nesting depth of an `any` element changes.

## Reproduce
```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 4 --dump outputs
```
