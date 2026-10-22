# Found #54: TS5115 (infinitely circular alias instantiations) is reported on use1.ts, use2.ts or both

## Result (default work-stealing, `--checkers 2`, 200 runs)

| output | runs | rate |
|---|---|---|
| `use1.ts(2,40)` TS5115 present, `use2.ts(2,42)` TS5115 absent | 148 | 74% |
| `use1.ts(2,40)` **and** `use2.ts(2,42)` TS5115 | 52 | 26% |

Recheck, 50 runs: 38 / 12 (24% minority). Load dependent, narrow ballast window (b=10: 1/14, b=20: 5/14, b=30: 3/14, b=40: 0/14). Outputs in `outputs/`.
In `random:<seed>` mode (unpadded 3-file core, N=2,3) there are 3 outputs: TS5115 only in use1, only in use2, or in both (rule: on one checker the use file checked first reports it; on different checkers both do).

## Program
```ts
// decl.ts
export type A<T extends string> = B<T> | C<T>;
export type B<T extends string> = T extends "x" ? A<T> : [A<number>];
export type C<T extends string> = D<T>[keyof D<T>];
export type D<T extends string> = { [K in T]: C<number> | A<K> };
// use1.ts  (preceded by 20 ballast statements)
import { A, B, C, D } from "./decl";
export let a: A<number>; export let b: B<"x">; export let c: C<number>; export let d: D<number>;
// use2.ts
import { A, B, C, D } from "./decl";
export let a2: B<number>; export let b2: A<"x">; export let c2: D<number>; export let d2: C<"q">;
```
(The same decl with more aliases also produced TS2315 "Type 'J' is not generic" variants in random mode, 9 outputs.)

## Scheduling setup
Ballast recipe: `ballast.js use1.ts 20` (slow front file) + `gen.js --pads 1 --padSize 40` at N=2. The owner is busy in use1.ts while the idle checker steals use2.ts from the back (both report) or not (use1 first, use2 reuses silently).

## Reproduce
```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2
```
