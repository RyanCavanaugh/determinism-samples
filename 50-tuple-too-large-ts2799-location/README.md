# Found #50: TS2799 (tuple too large) is reported on the declaration or not, depending on who computed it first

## Result (default work-stealing, `--checkers 2`, 200 runs)

| output | runs | rate |
|---|---|---|
| `use1.ts(2,15)` TS2799 only | 96 | 48% |
| `decl.ts(15,19)` **and** `use1.ts(2,15)` TS2799 | 104 | 52% |

Both outputs are in `outputs/`. (In `random:<seed>` mode the unpadded core `use1+use2`, `decl+use2`, `use2`, `use1`, ... all appear.)

## Program (`g1/`)

```ts
// decl.ts
type T0 = [any];
type T1 = [...T0, ...T0];
export type T2 = [...T1, ...T1];
...
export type T14 = [...T13, ...T13];   // 2^14 > 10,000: TS2799 at the spread in decl.ts(15,19)
// use1.ts / use2.ts
import { T14 } from "./decl";
export let a: T14;
```

The error has no natural location, so it is reported at the node that first computes `T14` on a checker. Whether the
error appears in decl.ts, use1.ts or use2.ts (or several) depends on which files share a checker and in what order
(a checker that already resolved `T14` reuses it silently).

## Scheduling setup

`gen2.js --core <3-file core> --k1 2 --k2 0 --skipLib --ghost 2000000 --sizes 2,150`. Two pad files with 2 MB of comments
each (same cost estimate, so one pad per checker side). `pad1` is ~30 ms of real work (size 150) which is about as long as
the owner of the core files spends on `decl.ts` + `use1.ts`; the idle checker then either steals `use2.ts`/`use1.ts` from the
back of the owner's queue, or doesn't. The race point is machine dependent: sweep the second size over 100-200
(`2,100` ≈ always A, `2,180` ≈ always B on the dev machine).

## Reproduce

```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2
```
