# 61 — flow-analysis depth limit poisons an unrelated file

## What differs
- **Clean output** (`bf0c3dbff8`): only `decl.ts` TS2563 ("containing function or module body is too large for control flow analysis").
- **Errors output** (`98b93855e1`): the same TS2563, plus the true errors in `use2.ts`: TS2551 `toFixed` on `string` and TS2339 `toUpperCase` on `number`.

The clean output is wrong. It drops real errors.

## Mechanism
- `decl.ts` holds `f`, a function whose body overflows the flow-analysis depth limit.
- `use1.ts` calls `f()`. Inferring its return type runs flow analysis inside `f` and hits the limit.
- In typescript-go the limit (`flowAnalysisDisabled`) stays set on the checker. If `use1.ts` is checked before `use2.ts` **on the same checker**, `use2.ts`'s narrowing is disabled: `x` stays `string | number` and both errors vanish.

`use1.ts` contains an import, 100 ballast statements (`harness\ballast.js`) and then `export const r = f();`. The ballast makes `use1` take about as long as `decl` does on the other checker, so whether the idle checker steals `use2` is a timing race.

## Rates (`--checkers 2`, steal mode, default `--pretty false`)
| run | clean | errors |
|---|---|---|
| 200 runs | 80 | 120 (40% minority) |
| 50-run recheck | 25 | 25 |

## Reproduce
```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2 --dump outputs
```
