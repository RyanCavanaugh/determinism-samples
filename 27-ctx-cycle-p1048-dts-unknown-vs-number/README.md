# 27: `.d.ts` of f1.v0 (`[number, number]` vs `[unknown, number]`) and f4.v0 (`unknown` vs `number` inside) in a contextual cycle

## Project
`lib.ts` (generic helpers `fun`, `pipe`, `id`, `call`, `wrap`, `both`, `mk`) and five files `f0..f4.ts` that import each other and export context-sensitive calls, e.g.
`f0: v0 = fun(x => f4.v0, y => y, 1)`, `f1: v0 = both(x => f0.v0, y => 1)`, `f2: v0 = both(x => f0.v1, y => 1)`, `f3: v1 = both(x => f1.v0, y => 1)`, `f4: v0 = pipe(f2.v0, x => id(x))`.
`tsconfig.json`: `declaration` with `emitDeclarationOnly`, `outDir: out` (so emitted `.d.ts` are compared). Diagnostics are identical in all outputs.

## Result (default work-stealing, `--checkers 2`, 200 runs)
| Output | Count | Rate | Difference vs majority |
|---|---|---|---|
| `4c7debeabf` | 84 | 42% | (base) f1 `[number, number]`; f4 `[unknown, (x:any)=>[unknown,[unknown,number]]]` |
| `33af240322` | 69 | 34.5% | f4.v0 is `[unknown, (x:any)=>[number,[number,number]]]` |
| `dbc425fd00` | 37 | 18.5% | f1.v0 `[unknown, number]` and f4.v0 as in `33af...` |
| `63fd5ced6d` | 10 | 5% | f1.v0 `[unknown, number]` only |

Outputs in `outputs\`. Recheck, 50 runs: 24 / 19 / 5 / 2 (same four outputs). At N=3 and N=4 there were up to 7 outputs across N, but mostly deterministic per N; the N=2 race is the clean one.

## Why (inferred)
Two independent cycle-dependent types, f1.v0 and f4.v0, resolve to `any`/`unknown` or concrete types depending on which file's initializer a checker evaluates first and whether the other checker has already cached it. Random mode also gives several outputs. Not traced in tsrs. This differs from #23/#24 in that two separate declarations flip independently, giving four combinations.

## Reproduce
```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2 --dump outputs
```
