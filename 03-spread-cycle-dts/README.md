# Found #3: cycle through JS namespace spreads changes the emitted .d.ts

## Result (tsrs `a4d4055`, default work-stealing, `--checkers 2`, 200 runs)

| output | `xa.d.ts` | `ia.d.ts` `v.pa` | runs | rate |
|---|---|---|---|---|
| `681b3525f3` | `{ v: { pb: {}; mb: 1 } }` | `{ pb: {}; mb: 1 }` | 183 | 91.5% |
| `14bda25b70` | `any` | `{ pb: {}; mb: 1 }` | 9 | 4.5% |
| `8363e9c75c` | `any` | `any` | 8 | 4% |

`xb.d.ts` is `any` in every run. There are no diagnostics, and the exit code is 0 in every run. Only the emitted declaration files differ.
Recheck: 2/50. Full outputs are in `outputs/`.
With random file-to-checker assignment the 5-file core gives 4 distinct outputs.

## Program

```js
// xa.js                                    // xb.js
/** @type {typeof import("./mb")} */        /* 20 JSDoc casts to slow mapped types from slow.ts */
const M = /** @type {any} */ (null);        /** @type {typeof import("./ma")} */
module.exports = { v: { ...M } };           const M = /** @type {any} */ (null);
                                            module.exports = { v: { ...M } };
// ma.js                                    // mb.js
export { v as pa } from "./xa";             export { v as pb } from "./xb";
export const ma = 1;                        export const mb = 1;
// ia.js same as xb.js without the casts
```
Settings: `allowJs`, `declaration`, `module: commonjs`. `slow.ts` declares the 20 mapped types that `xb.js` instantiates.
`pad.ts` is a filler file: 2 MB of comments plus 19 ballast statements.

## Why

`xa`'s export type spreads `mb`'s namespace, `mb` re-exports `xb.v`, `xb` spreads `ma`, and `ma` re-exports `xa.v`. That is a cycle.
The checker that enters the cycle first resolves the inner reference to `any`, and caches
the partial spread result. Which file enters first on each checker decides which export gets the degraded type.

## Scheduling setup

tsrs puts `pad.ts` on one checker and all core files on the other, with `xb.js` (slow, about 6 ms) at the front.
When the pad checker goes idle, it steals core files one by one from the back of the other queue (`ia.js`, `mb.js`, `slow.ts`, `ma.js`, `xa.js`).
Usually it steals all of them while `xb.js` is still being checked. If the pad runs long, `xb.js` finishes first and some files are checked after it on the same checker, which gives the minority outputs.

## Reproduce

```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2 --dump outputs
```
