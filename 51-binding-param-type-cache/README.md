# Found #51: destructured parameter binding element types depend on whether the parameter's type was already cached

## Result (default work-stealing, `--checkers 2`, 200 runs)

| output | runs | rate |
|---|---|---|
| `f7`'s `x`/`y` (`{ a: { x = 0, y = 0 } } = { a: {} }`) report TS2339 "Property 'x' does not exist on type '{}'" | 180 | 90% |
| `f7`'s `x`/`y` are `number` (TS2322 number not assignable to string at decl.ts(7,65) and (7,86)) | 20 | 10% |

(`outputs/`; `random:<seed>` mode gives the same two outputs.)

## Program (`g1/`)

```ts
// decl.ts (strict)
export function f7({ a: { x = 0, y = 0 } } = { a: {} }) { const a: string = x; const b: string = y; }
... f1..f6, g1..g5 similar
// use1.ts / use2.ts
import * as d from "./decl";
d.f7({ a: {} }); d.f7(); ...
```

When a use file resolves the parameter's type through a call before decl.ts's body is checked, the binding elements get a
type derived from the cached parameter type; checked from the declaration alone they get another (e.g.
`f7({ a: {} })`).

## Scheduling setup

`gen2.js --k1 2 --k2 0 --skipLib --ghost 2000000 --sizes 2,22`. `pad1` is ~5 ms of real work; the core files are ~1 ms (decl)
and 7-20 ms (use1), so the idle checker steals `use1/use2` from the back of the owner's queue only sometimes (in the
window `2,14`..`2,38`, roughly 5-15%). Sweep the second size over 10-40.

## Reproduce

```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2
```
