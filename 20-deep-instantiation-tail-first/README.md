# Found #20: depth-limit TS5114 on `deepall.ts` only if `deeptail.ts` was not checked first

## Result (default work-stealing, `--checkers 8`, 100 runs; padding 6 files x size 40)

| output | runs | rate |
|---|---|---|
| `deepall.ts(2,23): error TS5114: Instantiations of type 'Deep' appear infinitely circular.` (exit 2) | 94 | 94% |
| no diagnostics (exit 0) | 6 | 6% |

Also seen at `--checkers 5` (1/30) and `--checkers 10` (1/30); other pad counts at N=8 gave 1-2 in 30.
Both outputs are in `outputs/`. At N=2 no padding, tail and all share a checker and the project is clean;
at N=3 and N=4 they land on different checkers every run (always the error).

## Program

```ts
// decl.ts
export type Deep<N extends 0[]> = N["length"] extends 60 ? never : Deep<[...N, 0]> | N["length"];
// deeptail.ts
import { Deep } from "./decl";
export type DeepTail = Deep<[0 x30]>;
// deepall.ts
import { Deep } from "./decl";
export type DeepAll = Deep<[]>;
```

(`decl.ts` also holds `Wide2` etc., unused here.) `DeepAll` is 60 nested instantiations plus the union members
(over the 100 stack limit). When a checker has already instantiated `Deep<[0 x30]>` from `deeptail.ts`, the
chain from `deepall.ts` hits the cache halfway and stays under the limit. On a checker that has not, it hits the limit.

## Random-mode triage

`node harness\run.js <dir> --mode random --runs 20 --checkers 2,3,4` gives: error on deepall (most seeds) / clean
(about 15%). A single-file variant additionally shows `Wide2All` TS2589 (5M instantiations)
only without `Wide2Tail` first, a much bigger hit in random mode (4 distinct outputs), but 300-700 ms files made the race
unreachable with gen2.js.

## Reproduce

```
node ..\_harness\run.js . --mode steal --runs 100 --checkers 8
```
Generated with `node harness\gen.js <out> --core <inst-core2> --pads 6 --padSize 40` (flat padding, no gen2).

## Recheck (quiet machine)
With no other load: 0 differing runs out of 50 at N=8, and 0 out of 30 at each of N=2-7, 9, 10 and 12. Flat (gen.js) and ghost (gen2.js) padding sweeps also found no race. `place.js` shows that `deepall.ts` and `deeptail.ts` always land on different checkers, and the clean output needs them on the same checker with `deeptail` checked first. The 6% above was measured while 4 other agents were loading the machine, so treat this case as **load-dependent / weak**. It is still a real difference under `random:<seed>` assignment (11/60 clean). See #21 and #22 for reliable races of the same mechanism.

