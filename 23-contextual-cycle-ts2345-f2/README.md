# Found #23: cross-file const cycle through contextually typed callbacks; a TS2345 in f2.ts appears or not

## Result (default work-stealing, `--checkers 2`, 150 runs; 3 flat pads of size 10 from `gen.js`)

| output | runs | rate |
|---|---|---|
| TS7022/TS7024 in f1.ts and f3.ts, **plus** `f2.ts(5,23): TS2345 Argument of type '(x: number) => (x: number) => any' is not assignable ...` | 133 | 89% |
| same TS7022/TS7024, no TS2345 in f2.ts | 17 | 11% |

Outputs in `outputs/`. Random mode (`--checkers 2,3`, 10 seeds) gives the same two outputs (13 and 7).

## Program (`f*.ts`, `lib.ts` declares `fun`, `pipe`, `call`, `both`; each f imports the others as namespaces)

```ts
// f0.ts  export const v0 = call(() => f3.v0);                  export const v1 = 1;
// f1.ts  export const v0 = both(x => f3.v0, y => 1);           export const v1 = pipe(f0.v0, x => [x]);
// f2.ts  export const v0 = fun(x => f3.v0, y => y, 1);         export const v1 = both(x => f1.v1, y => 1);
// f3.ts  export const v0 = (Math.random() < 0.5 ? (x: number) => f1.v0 : (x: number) => 1);   export const v1 = 1;
// lib.ts
export declare function fun<T>(g: (x: T) => T, h: (y: T) => T, x: T): T;
export declare function pipe<A, B>(a: A, f: (a: A) => B): B;
export declare function call<T>(f: () => T): T;
export declare function both<T, U>(f: (t: T) => U, g: (u: U) => T): [T, U];
```

The cycle f1.v0 -> f3.v0 -> f1.v0 goes through a context-sensitive callback. Which declaration is entered first on a
checker decides the type cached for `f3.v0` while it is circular, and so whether `fun(x => f3.v0, ...)` in f2.ts
sees an incompatible argument.

## Reproduce

```
node ..\_harness\run.js . --mode steal --runs 150 --checkers 2
```
Generated with `node harness\gen.js <out> --core candidates\inst-fuzz\fz\p127 --pads 3 --padSize 10`.
