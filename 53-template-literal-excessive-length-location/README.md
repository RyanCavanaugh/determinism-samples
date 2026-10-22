# Found #53: TS2589 for an exploding template-literal mapped type is reported in decl.ts and/or the use file

## Result (default work-stealing, `--checkers 2`, 200 runs)

| output | runs | rate |
|---|---|---|
| `use1.ts(2,15)` TS2589 only | 135 | 67.5% |
| `decl.ts(8,11)` **and** `use1.ts(2,15)` TS2589 | 65 | 32.5% |

Recheck, 50 runs: 31 / 19 (38% minority). The race window is narrow (padSize 3000 → ~0/14, 3080 → 5%, 3140 → 25-32%, 3500 → 0), so rates are load/machine dependent. Outputs in `outputs/`.
In `random:<seed>` mode the 3-file core gives 6 different outputs (TS2589 on decl and/or use1 and/or use2).

## Program
```ts
// decl.ts (strict)
type Dec<N extends number> = N extends 5 ? 4 : N extends 4 ? 3 : N extends 3 ? 2 : N extends 2 ? any : N extends 1 ? 0 : 0;
export type Recur<N extends number, S extends string> = N extends 0 ? S : Recur<Dec<N>, `${S}_${S}`>;
export type Explode = { [P in Recur<5, "a"> as `${P}_key`]: any; };   // TS2589 at (8,11)
// use1.ts / use2.ts
import { Explode } from "./decl";
export let a: Explode;
```
Computing `Explode` takes ~2 s and hits the instantiation limit. The error is located at the node that first drove the computation on a checker: the declaration (decl.ts), or the use file's annotation. A checker that already computed it reports nothing again.

## Scheduling setup
`gen.js --core <decl,use1,use2> --pads 1 --padSize 3140` at N=2 (`pad0.ts` is ~0.8 MB of padding work, taking ~2 s, about as long as `use1.ts`). Checker 1 runs `use1.ts` (2 s) while checker 0 runs the pad; when the pad ends at about the same time, the idle checker either steals `decl.ts` (own computation, error in decl.ts too) or finds nothing left.

## Reproduce
```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2
```

