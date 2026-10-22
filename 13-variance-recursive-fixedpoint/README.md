# Found #13: recursive variance fixed point (missing TS2322 on `Listener<string>` -> `Listener<unknown>`)

## Result (tsrs default work-stealing, `--checkers 2`, 200 runs)

| output | runs | rate |
|---|---|---|
| all errors, including `g1/u2.ts(1,1): TS2322 Type 'Listener<string>' is not assignable to type 'Listener<unknown>'` | 168 | 84% |
| same, but **without** the u2.ts error (the assignment is accepted) | 32 | 16% |

Outputs in `outputs/`. Under `random:<seed>` the unpadded core gives the same 2 outputs (18 vs 102 of 120, N=2,3,4).

## Program (`g1/`)

`decl.ts` (script) declares `Store<T>`/`Listener<T>` (mutually recursive through `T[]`), `ColumnDef`/`Column`, `Tree`,
`Outer`/`Inner`, `GenericMethod`, `Method`, `Projected` and the variables. Each `uN.ts` has one assignment, e.g.
`u1: unknowns = strings;`, `u2: unknownListener = stringListener;`, `u3: unknownColumn = stringColumn;`, ... plus 2
ballast declarations.

## Why

The variances of `Store`/`Listener` are measured while computing each other; the first relation made on a checker
(`Store<string>` -> `Store<unknown>` in u1, or `Listener` in u2, ...) decides what the circular guess is, so
`Listener<string>` to `Listener<unknown>` is sometimes accepted.

## Setup

`gen2.js --core <dir> --k1 3 --k2 0 --skipLib --ghost 2000000 --padSize 5`, ballast 2 per use file.

## Reproduce

```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2
```
