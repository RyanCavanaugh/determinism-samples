# Found #2: circular type-parameter defaults (TS2716 reported or not)

## Result (tsrs `a4d4055`, default work-stealing, `--checkers 2`, 200 runs)

| output | runs | rate |
|---|---|---|
| `979a971e07`: `a.ts(2,24): error TS2716: Type parameter 'T' has a circular default.`, exit 2 | 101 | 50.5% |
| `477d24d824`: no errors, exit 0 | 99 | 49.5% |

Recheck: 24/26 over 50 runs. Full outputs are in `outputs/`.

With random file-to-checker assignment (`TSRS_CHECKER_ASSIGNMENT=random:<seed>`) the two-file core gives 3 outputs: error on `a.ts` (same checker, a.ts first), no error (same checker, b.ts first), and error on `b.ts` (separate checkers).

## Program

```ts
// a.ts
import type { B } from "./b";
export interface A<T = B> { a: T }
export declare const a: A;
// b.ts
import type { A } from "./a";
/* 20 slow mapped-type "ballast" statements */
export interface B<U = A> { b: U }
export declare const b: B;
```
`pad.ts` is a filler file: 2 MB of comments plus 20 ballast statements.

## Why

The defaults `A<T = B>` and `B<U = A>` form a cycle. The checker reports TS2716 on
whichever default it is resolving when it detects the cycle, and caches the result.
If one checker checks `b.ts` and then `a.ts`, the lookup from `a.ts` hits the cached default
and nothing is reported. If `a.ts` is checked on its own checker, it detects the cycle from its side and reports TS2716.

## Scheduling setup

tsrs puts `pad.ts` on one checker and `b.ts`, `a.ts` (in that order) on the other.
The ballast in `b.ts` sits before its interface, so `b.ts` takes about as long as `pad.ts`.
If the pad checker finishes first, it steals `a.ts` from the back of the other queue and checks it cold (TS2716).
Otherwise `a.ts` is checked after `b.ts` on the same checker (no error).

## Reproduce

```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2
```
