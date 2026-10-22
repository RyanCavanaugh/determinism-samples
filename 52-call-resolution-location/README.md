# Found #52: TS2589 on `new Foo<...>(...)` is reported in `add()` or in `add2()`, depending on who resolved the call first

## Result (default work-stealing, `--checkers 2`, 200 runs)

| output | runs | rate |
|---|---|---|
| `g1/a.ts(10,12)` TS2589 (the call in `add2()`, whose return type is inferred) | 167 | 83.5% |
| `g1/a.ts(7,12)` TS2589 (the call in `add()`, declared return type) | 33 | 16.5% |

Recheck, 50 runs: 36 / 14 (28%). Rates depend on machine load (other agents were running tsrs concurrently). Outputs are in `outputs/`.
In `random:<seed>` mode the unpadded 2-file core (`a.ts` + `u.ts`) gives the same two outputs (about 35% minority at N=2).

## Program (`g1/`)

```ts
// a.ts
export class Foo<Elements extends readonly unknown[]> {
  public readonly elements: { [P in keyof Elements]: { bar: Elements[P] } };
  public constructor(...elements: { [P in keyof Elements]: { bar: Elements[P] } }) { this.elements = elements; }
  public add(): Foo<[...Elements, "abc"]> {
    return new Foo<[...Elements, "abc"]>(...this.elements, { bar: "abc" });   // line 7
  }
  public add2() {
    return new Foo<[...Elements, "abc"]>(...this.elements, { bar: "abc" });   // line 10
  }
}
// u.ts
import { Foo } from "./a";
declare const f: Foo<[1, 2]>;
export const y = f.add2();
```

## Why
Inferred from outputs (not traced in tsrs). `u.ts` asks for the inferred return type of `add2`, which resolves the `new Foo<...>` call in `add2` and hits the instantiation-depth limit. The error is reported once for the shared deep type, at whichever call/node resolved it first. A checker that reaches `u.ts` first pays it at `add2` (line 10) and then `add()` silently reuses the result; a checker that checks `a.ts` first in source order reports at `add` (line 7).

## Scheduling setup
`gen2.js --core <a.ts,u.ts> --k1 2 --k2 0 --skipLib --ghost 2000000 --padSize 2` (two 2 MB-comment pads; `a.ts` and `u.ts` go behind one pad each). `k1` 3 and 4 also race (~17%, ~5%); `padSize` ≥ 5 does not.

## Reproduce
```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2
```
