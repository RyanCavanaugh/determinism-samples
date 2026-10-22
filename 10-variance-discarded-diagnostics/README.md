# Found #10: variance-cycle diagnostics (TS7022 vs TS2339 on `decl.ts`)

## Result (tsrs default work-stealing, `--checkers 2`, 200 runs)

| output | runs | rate |
|---|---|---|
| `g1/decl.ts(7,5): error TS7022: 'Value' implicitly has type 'any' ...` plus u3/u4 TS2322 | 125 | 62.5% |
| `g1/decl.ts(7,33): error TS2339: Property 'foo' does not exist on type 'A'.` plus u3/u4 TS2322 | 75 | 37.5% |

(Both differ in the emitted `decl.d.ts` and `u*.d.ts` as well.) Outputs are in `outputs/`.
Under `random:<seed>` assignments the unpadded core gives 10 distinct outputs over 50 runs (N=2,3).

## Program (`g1/`)

```ts
// decl.ts (script)
interface A { a: string }  interface B { foo: string }
declare function pick(x: Foo<number>): A;
declare function pick(x: object): B;
class Bar<T> { x!: T; Value = pick(new Foo(this)).foo; }
class Foo<T> { bar!: Bar<T>; constructor(bar: Bar<T>) { this.bar = bar; } }
// u1.ts: export const v: number = new Bar<string>().Value;
// u2.ts: export const w = new Bar<number>().Value;
// u3.ts: declare let f1: Foo<string>, f2: Foo<number>; f1 = f2; export const y = new Foo(new Bar<string>());
// u4.ts: declare let b1: Bar<string>, b2: Bar<number>; b1 = b2; export const ww = b1.Value;
```
Each `u*.ts` also carries 15 mapped-type declarations of real checking work (small text, slow to check).

## Why

Resolving `Value` picks an overload by relating `Foo<T>` to `Foo<number>`, which needs the variances of `Foo`, which need
`Bar`, which needs `Value` again. Whether `Value` is first reached from u1/u2 (property access), u3 (relation of Foo)
or u4 (relation of Bar) decides where the cycle is cut: either the outer `Value` is reported circular (TS7022)
or the overload picks `A` and `.foo` is reported (TS2339).

## Setup

`gen2.js --core <dir> --k1 4 --k2 0 --skipLib --ghost 2000000 --padSize 15`; pads fill both checkers, and the
core files `decl.ts, u1..u4` are at the back of one checker's queue, being heavy in practice but light by estimate. The idle checker
steals some of them from the back. The `u*` ballast makes each core file slow enough that the steal happens at a varying point.

## Reproduce

```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2
```
