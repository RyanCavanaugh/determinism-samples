# Found #30 — circular mapped-type property: which file reports TS2615

## Result (tsrs default work-stealing, `--checkers 2`, 200 runs)

| output | runs | rate |
|---|---|---|
| `g1/types.ts` TS2502 + `g1/u1.ts` TS2615 only | 194 | 97% |
| `g1/types.ts` TS2502 + `g1/types.ts(3,11)` TS2615 + `g1/u1.ts` TS2615 | 6 | 3% |

(Earlier 100-run samples: 1% and 4%.) Under `TSRS_CHECKER_ASSIGNMENT=random:<seed>` the
unpadded 2-file core (`..\..\candidates\circ-emit2`) gives 3 distinct outputs in 30 seeds, and the
3-file variant gives 7. `outputs\` holds both distinct outputs.

## Program (core)

```ts
// types.ts
export interface Widget { type: "list"; each: Child<Widget>; }
export type NonOptionalKeys<T> = { [P in keyof T]: undefined extends T[P] ? never : P }[keyof T];
export type Child<T> = { [P in NonOptionalKeys<T>]: T[P] }
export type ListChild = Child<Widget>;
// u1.ts
import { ListChild } from "./types";
declare let x: ListChild;
x.type;
export const a = x;
```
`g1/pad*.ts` are filler files (gen2.js, k1=4, padSize=5, skipLib) that make stealing a timing race.

## Why

`Widget.each: Child<Widget>` is circular through the mapped type. The error is blamed on
the declaration (types.ts) if a checker that has checked types.ts first reaches it; a
checker that enters via `u1.ts`'s `x.type` (or declaration emit) blames the use. Whether
`u1.ts` is checked by the same checker after `types.ts` or is stolen by the idle checker
changes which TS2615 locations are reported.

## Reproduce

```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2
```
