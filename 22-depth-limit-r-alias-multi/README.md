# Found #22: TS5114 on `R<[]>` appears in a.ts and/or c.ts depending on which checker has cached the chain

## Result (default work-stealing, `--checkers 4`, 150 runs; 3 flat pads of size 40 from `gen.js`)

| output | runs | rate |
|---|---|---|
| decl.ts TS5114 (`ReturnType`) only | 96 | 64% |
| decl.ts + `a.ts(2,14)` TS5114 `R` | 32 | 21% |
| decl.ts + `c.ts(2,14)` TS5114 `R` | 15 | 10% |
| decl.ts + `a.ts` + `c.ts` | 7 | 5% |

Four distinct outputs, in `outputs/`. At `--checkers 2` and 8 two outputs were seen in 12 runs.

## Program

```ts
// decl.ts
export declare function rec<N extends 0[]>(n?: N): N["length"] extends 60 ? never : ReturnType<typeof rec<[...N, 0]>> | N["length"];
export type R<N extends 0[]> = N["length"] extends 60 ? never : R<[...N, 0]> | N["length"];
export type Id<T> = T extends infer U ? U : never;
// a.ts  export const a = null as any as R<[]>;
// b.ts  export const b = null as any as R<[0 x30]>;
// c.ts  export const c = null as any as Id<R<[]>>;
// d.ts  export const d = null as any as Id<R<[0 x40]>>;
```

## Why

`R<[]>` is 60 nested instantiations deep plus unions, past the 100 stack limit unless the checker already holds a
cached tail (`b.ts` warms `R<[0 x30]>`, `d.ts` a deeper one). Each checker's cache differs by which of a/b/c/d it
checked first and in which order, so the TS5114 shows up in a.ts, c.ts, both or neither. Random mode gives the same 4 outputs.

## Reproduce

```
node ..\_harness\run.js . --mode steal --runs 150 --checkers 4
```
Generated with `node harness\gen.js <out> --core candidates\inst-callrec --pads 3 --padSize 40`.
