# 01: base constraint cut short by the depth guard

**Result:** non-deterministic under tsrs's default work-stealing scheduler.

| command | runs | `b.ts(3,12): error TS2339` | no errors |
| --- | --- | --- | --- |
| `tsrs -p . --checkers 2 --incremental false --pretty false` | 200 | 88 (44%) | 112 (56%) |
| same, `--checkers 3` | 40 | 12 (30%) | 28 (70%) |
| same, `--checkers 4` | 40 | 11 (28%) | 29 (72%) |
| same, `--checkers 1` | 20 | 20 (100%) | 0 |

(tsrs main `a4d4055`, dev profile, Windows, 16 cores.) The project is 18 files, so tsrs's default checker count is 1;
pass `--checkers N` to get several checkers.

## The program

- `a.ts` (poison): `const f: typeof victim = <U extends Box>(x: U, y: { b: string }) => x.b;`
- `b.ts` (victim): `function victim<T extends Box>(x: T, y: T["a"]["a"]...x10) { return x.b; }`
- `pad*.ts`: independent padding files that do real checking work, so the two checkers finish at about the same time.

No import between `a.ts` and `b.ts`.

## Why

Relating `a.ts`'s arrow function to `typeof victim` resolves the base constraint of the ten-deep `T["a"]...` chain from
the top. Ten levels down the depth guard (`getResolvedBaseConstraint`) meets `T`'s recursion identity on the stack, cuts,
and caches `noConstraintType` for `T`. If the same checker later checks `b.ts`, `x.b` sees `T`'s apparent type as
`unknown` and reports TS2339; on a fresh checker it does not.

Locality puts `a.ts` and `b.ts` (the lightest files) at the back of one checker's queue. Whether the other checker
runs out of padding first and steals `b.ts` from the back of that queue is a timing race, so the error comes and goes.

This is the "open" case in tsrs's notes/open-history-dependence.md section 1 (results computed under a cut or
a cycle must not be cached for unrelated callers).

## Reproduce

```powershell
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2
```
