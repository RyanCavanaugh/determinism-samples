# Found #14: cached results during a variance cycle (`get g(): Box2<number> | Box2<boolean>` vs `Box2<number>` in .d.ts)

## Result (tsrs default work-stealing, `--checkers 2`, 200 runs)

| output | runs | rate |
|---|---|---|
| `decl.d.ts`: `get g(): Box2<number>;` | 116 | 58% |
| `decl.d.ts`: `get g(): Box2<number> | Box2<boolean>;` | 84 | 42% |

Both outputs have the same diagnostics (TS7023 on `g`, TS2322 for u1/u3/u6/u8, TS2345 for u7), only the emitted
declaration differs. Outputs in `outputs/`. Under random assignments, the unpadded core gives the same 2 outputs (15 vs 75 of 90).

## Program (`g1/`)

```ts
// decl.ts (script)
declare let a1: Box<string>; declare let a2: Box<number>; declare const cond: boolean;
class Box<T>  { value!: T; m() { if (cond) return a1; return a2; } }
class Box2<T> { value!: T;
    n() { if (cond) return new Box2<string>(); return new Box2<number>(); }
    get g() { return cond ? new Box2<boolean>() : new Box2<number>(); } }
// u1: Box<string> = Box<number>; u2: new Box<boolean>().m(); u3: Box2<string> = Box2<number>;
// u4: new Box2<boolean>().n(); u5: new Box2<string>().g; u6: Box<string>[] = Box<number>[] ...
```

## Why

`g`'s return type is the union of two `Box2` instantiations; subtype reduction relates `Box2<boolean>` to `Box2<number>`
which needs the variances of `Box2`. Depending on whether the variances were measured already (from u3/u8) or the
relation is made during the measurement, the union is reduced or not.

## Setup

`gen2.js --core <dir> --k1 4 --k2 0 --skipLib --ghost 2000000 --padSize 5`, ballast 8 per use file.

## Reproduce

```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2
```
