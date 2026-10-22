# Found #12: deeply nested relation check order (missing/extra TS2322 for `A<{a:string}>` -> `A<{a:"lit"}>` assignments)

## Result (tsrs default work-stealing, `--checkers 2`, 200 runs)

Five distinct outputs; they differ in which of the assignments report TS2322.

| output | runs | rate |
|---|---|---|
| u1(A) u2(B) u3(A,B) u4(B,A) errors, 6 in total | 25 + 24 (two variants differing in the message text / d.ts) | 24.5% |
| u2 u3(A,B) u4(B,A) (u1's `a2 = a1` is accepted) | 81 | 40.5% |
| u2 u3(A,B) | 53 | 26.5% |
| u2 only | 17 | 8.5% |

Outputs are in `outputs/` (`87b103b5fc` and `2c9ac68979` have the same error lines but differ in the elaboration or emit).
Under `random:<seed>` the unpadded core gives 8 distinct outputs over 40 runs (N=2).

## Program (`g1/`)

```ts
// decl.ts (script)
type A<T> = { m0: (x: B<T>) => void; m1: { [K in keyof T]: B<T[K]> } };
type B<T> = { m0: A<T> };
declare let a1: A<{ a: string }>, a2: A<{ a: "lit" }>;
declare let b1: B<{ a: string }>, b2: B<{ a: "lit" }>;
// u1.ts: a2 = a1;   u2.ts: b2 = b1;   u3.ts: a2 = a1; b2 = b1;   u4.ts: b2 = b1; a2 = a1;
// each use file also has 2 declarations of ballast work
```

## Why

Relating the `A` instantiations first reaches the string -> "lit" comparison only after giving up on deeply nested
types, caching a (wrongly) successful result for the relation keyed by those types. A later `B` relation (or `A`) on
the same checker then succeeds or fails depending on that cache. So the errors at u1/u3/u4 depend on which files
this checker checked first, and in which order.

## Setup

`gen2.js --core <dir> --k1 3 --k2 0 --skipLib --ghost 2000000 --padSize 8`, ballast 2. Very racy: many padSize/k1
combos give 3-5 outputs per 10 runs.

## Reproduce

```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2
```
