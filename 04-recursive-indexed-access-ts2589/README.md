# Found #4: recursive indexed access, extra TS2589 on join.ts

## Result (tsrs `a4d4055`, default work-stealing, `--checkers 2`, 200 runs)

| output | runs | rate |
|---|---|---|
| a.ts TS2589, join.ts TS2322, recur.ts TS4109/TS2536 | 116 | 58% |
| same **plus** `g1/join.ts(3,12): error TS2589: Type instantiation is excessively deep and possibly infinite.` | 84 | 42% |

Both outputs are in `outputs/`.

## Program (`g1/`)

```ts
// recur.ts
export type Recur<T> =
    (T extends (unknown[]) ? {} : { [K in keyof T]?: Recur<T[K]> }) |
    [...Recur<T>[number][]];
// join.ts
import { Recur } from "./recur";
export function join<T>(l: Recur<T>[]): Recur<T> { return ['marker', ...l]; }
// a.ts
import { Recur } from "./recur";
import { join } from "./join";
function a<T>(l: Recur<T>[]): void { const x: Recur<T> | undefined = join(l); }
```

## Scheduling setup

- `pad0..3.ts` each hold 5 small mapped-type declarations plus about 2 MB of comments.
- The comments only inflate tsrs's file-cost estimate (`text_len/100`). They make the pads weigh the same, so locality assignment splits them evenly, with the core files on one checker.
- The core files are cheap by estimate but slow in practice (`a.ts` takes 5-10 ms because it hits the instantiation limit), and they are at the back of their owner's queue.
- The other checker finishes its pads around the time the owner reaches `a.ts`. Whether it steals `a.ts` is a timing race.
- When `a.ts` and `join.ts` are checked by different checkers, `join.ts` hits the
instantiation depth limit by itself and reports TS2589. When one checker checks `a.ts` and then `join.ts`, the instantiations are already cached and there's no TS2589 on join.ts.
- `skipLibCheck` is set so that checking `lib.dom.d.ts` (about 190 ms) doesn't dominate the schedule.

## Reproduce

```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2
```
To regenerate: `node _harness\gen2.js <out> --core <test dir> --k1 4 --k2 0 --skipLib --ghost 2000000 --padSize 5`.
The race point depends on the machine. If the rate is 0% or 100%, try padSize 3-15 or 3-5 pads.
