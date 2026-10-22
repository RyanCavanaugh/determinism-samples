# 33: `.d.ts` of `a = c2` prints `{ foo: any }` or `{ foo: typeof c2.foo }` (circular accessor annotation)

## Project
- `d.ts`: `c1`/`c2`/`c3` (object literal types with get/set accessors whose annotation is `typeof cN.foo`) and `T1`/`T2`/`T3` (`T1["foo"]` self references), all exported.
- `u1.ts`: reads `c1.foo`, `c3.foo`, `T1["foo"]`, `T3["foo"]`.
- `u2.ts`: `export const a = c2;` plus uses of `T2["foo"]`.
- `pad0..pad5.ts`: flat padding (gen.js, `--pads 6 --padSize 120`).
- `declaration: true`, `outDir: out`, `strict`.

## Result (default work-stealing, `--checkers 2`, 200 runs)
| Output | Count |
|---|---|
| `7ee6726d24`: `u2.d.ts` has `export declare const a: { foo: any; }` | 110 (55%) |
| `9835c238e7`: `u2.d.ts` has `import { c2, T2 }` and `foo: typeof c2.foo` | 90 (45%) |

Both print the same TS2502 diagnostics; only the emitted `u2.d.ts` differs. Full outputs are in `outputs\`.
Recheck, 50 runs: 27 / 23 (54% / 46%), same as the first measurement. Also raced: the bare 3-file core (7/75 over N=2..8), pads 8 at N=2 and N=8.

## Why
(Inferred from the outputs; not traced in tsrs.) Whether the circular accessor annotation of `c2.foo` has already been resolved on that checker's cache when `u2.ts` is emitted decides whether the declaration emitter sees the circular type (`any`) or can still print `typeof c2.foo`. That depends on whether the checker that emits `u2.ts` also checked `d.ts` first, which is placement dependent under stealing.

## Reproduce
```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2 --dump outputs
```
