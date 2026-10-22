# Found #21: the TS5114 depth-limit error for `Z` lands in `decl.ts` or only in the use files

## Result (default work-stealing, `--checkers 4`, 150 runs; 3 flat pads of size 10 from `gen.js`)

| output | runs | rate |
|---|---|---|
| `use1.ts(2,18)` + `use2.ts(2,22)` TS5114 only | 140 | 93% |
| **plus** `decl.ts(2,17): error TS5114` | 10 | 7% |

Also seen at `--checkers 5` (3/50) and `--checkers 6` (7/50); 0/50 at N=3, 0/12 at N=2. Both outputs are in `outputs/`.
In random mode (`--checkers 2,3,4`, 25 seeds) the same core gives 8 distinct outputs: the error appears in any subset of
`decl.ts`, `use1.ts`, `use2.ts` (and in none of them).

## Program

```ts
// decl.ts
export type Deep<N extends 0[]> = N["length"] extends 60 ? never : Deep<[...N, 0]> | N["length"];
export type Z = Deep<[]>;
// use1.ts
import { Z } from "./decl";  export const z1: Z = null as any;
// use2.ts
import { Z } from "./decl";  export function f(z: Z): Z { return z; }
// use3.ts
import { Deep } from "./decl";  export type Half = Deep<[0 x30]>;   // warms the cache for the tail of the chain
```

## Why

`Deep<[]>` needs 60 nested instantiations plus union members, past the 100-deep stack limit, but only if no checker
cache already holds the tail of the chain. Which checker holds what (`use3.ts`'s `Half`, or `Z` already resolved by
`decl.ts`) decides whether the limit is hit, and at which node it is reported: the alias declaration in `decl.ts`
when `decl.ts` is checked first, the reference in a use file when a use file asks first.

## Reproduce

```
node ..\_harness\run.js . --mode steal --runs 150 --checkers 4
```
Generated with `node harness\gen.js <out> --core candidates\inst-locfile --pads 3 --padSize 10`. gen2.js with k1 3-4 pads gave nothing here.

## Recheck (quiet machine)
1/50 differing at N=4, which is lower than the rate measured under load.

