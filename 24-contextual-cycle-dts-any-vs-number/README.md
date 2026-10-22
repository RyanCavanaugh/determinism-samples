# Found #24: declaration emit differs: `f4.d.ts` has `(x: number) => any` or `(x: number) => number`

## Result (default work-stealing, `--checkers 2`, 100 runs; 3 flat pads of size 10 from `gen.js`; `declaration` + `emitDeclarationOnly`, `outDir: out`)

| output | runs | rate |
|---|---|---|
| diagnostics identical; `f4.d.ts`: `export declare const v0: (x: number) => number;` | 72 | 72% |
| diagnostics identical; `f4.d.ts`: `export declare const v0: (x: number) => any;` | 28 | 28% |

Outputs in `outputs/` (the diagnostics are the same TS7022/TS7024 set in f1.ts and f2.ts in both; only the emitted .d.ts differs).

## Program

```ts
// f0.ts  export const v0 = fun(x => f3.v0, y => y, 1);  export const v1 = pipe(1, x => pipe(x, y => f2.v1));
// f1.ts  export const v0 = fun(x => x, y => f2.v0, 1);  export const v1 = 1;
// f2.ts  export const v0 = pipe(1, x => pipe(x, y => f1.v0));  export const v1 = 1;
// f3.ts  export const v0 = fun(x => x, y => f1.v0, 1);  export const v1 = pipe(f2.v0, x => id(x));
// f4.ts  export const v0 = (Math.random() < 0.5 ? (x: number) => f1.v0 : (x: number) => 1);
//        export const v1 = fun(x => x, y => f0.v1, 1);
```
(each file imports the others with `import * as fN`, and `lib.ts` declares `fun`, `pipe`, `id`, ...)

f1.v0 and f2.v0 are mutually circular through callbacks. `f4.v0`'s return type is cached as `any` on a
checker that reaches the cycle from f4, and `number` on a checker that resolved f1/f2 before.

## Reproduce

```
node ..\_harness\run.js . --mode steal --runs 100 --checkers 2
```
Generated with `node harness\gen.js <out> --core candidates\inst-fuzz\fz\p1020 --pads 3 --padSize 10`.
