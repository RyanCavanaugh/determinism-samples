# Found #11: keyof mapped-type relation, `g(a)` overload picked depends on a prior `h(a)` relation (extra TS2322 in decl.ts)

## Result (tsrs default work-stealing, `--checkers 2`, 200 runs)

| output | runs | rate |
|---|---|---|
| `g1/decl.ts(3,32) TS2322 B not assignable to string|number|symbol` + `g1/decl.ts(11,11) TS2322 Type '2' is not assignable to type '1'` | 146 | 73% |
| only the `decl.ts(3,32)` error | 54 | 27% |

Outputs are in `outputs/`. Under `random:<seed>`, the unpadded core gives the same 2 outputs (24 vs 16 of 40, N=2).

## Program (`g1/`)

```ts
// decl.ts (script)
interface A { next: A; v: "a" }
interface B { next: B; v: string }
type M<T> = { [K in keyof T as B]: 1 };
declare const a: A;
declare function h(x: B): 1;
declare function h(x: unknown): 2;
function f<T>() {
    function g(x: keyof M<T>): 1;
    function g(x: unknown): 2;
    function g(x: unknown) { return 1 as any; }
    const r: 1 = g(a);          // (11,11): TS2322 when g picks the 2nd overload
}
// u1.ts, u2.ts: const w: 1 = h(a);   (+ ballast of 2 mapped-type declarations each)
```

## Why

Whether `A` relates to `B` (via `next`, assuming itself) is already cached as a success (from `h(a)` in u1/u2) when
`g(a)` is resolved decides whether the "maybe" result is kept when relating to `keyof M<T>`. So the overload chosen for
`g(a)` depends on whether the file with `h(a)` was checked on this checker before `decl.ts`.

## Setup

`gen2.js --core <dir> --k1 4 --k2 0 --skipLib --ghost 2000000 --padSize 5`; core files in the back of one checker's
queue; the other checker steals from the back (u2/u1) at a time that varies.

## Reproduce

```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2
```
