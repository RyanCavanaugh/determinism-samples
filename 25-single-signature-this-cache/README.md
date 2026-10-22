# 25: `.d.ts` type of `outer.log(100)` is `Effect<100,never,XXX>` or `Effect<100,never,never>`

## Project
- `decl.ts`: the test's declarations (Effect, `implement`, `class XXX { log = implement<this>()(<N extends number>(n: N) => succeed(n)); }`, `inner: XXX`, `outer: ProxyMap<XXX>`), all exported.
- `a.ts`: `export const a = inner.log(100);`
- `b.ts`: `export const b = outer.log(100);`
- `tsconfig.json`: `declaration: true`, `outDir: out` so emitted `.d.ts` are compared. No padding needed.

## Result (default work-stealing, `--checkers 2`, 200 runs)
| Output | Count | Rate |
|---|---|---|
| `fba38a9108`: a.d.ts `Effect<100,never,never>`, b.d.ts `Effect<100,never,never>` | 143 | 71.5% |
| `63312c9044`: a.d.ts `Effect<100,never,never>`, b.d.ts `Effect<100,never,XXX>` | 57 | 28.5% |

Outputs in `outputs\`. Recheck, 50 runs at N=2: 9 minority (18%), 41 majority. At N=3 and N=4 (15 runs each) only the second output was seen. Random mode at N=2,3 (30 seeds) gives 3 outputs; the third (`b` = XXX, `a` = XXX) is not reached under stealing.

## Why (inferred)
The single-signature instantiation of `log` was cached by outer type args only, so `inner.log` and `outer.log` (which differ in the `this` type) shared whichever was computed first on that checker. Which of a.ts / b.ts a checker handles first (and whether a thief took one) decides the type of `b`. Race is only between the two small files, so no pads were needed.

## Reproduce
```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2 --dump outputs
```
