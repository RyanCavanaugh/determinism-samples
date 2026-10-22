# 62 — TS5114 "infinitely circular" reported once per checker

## What differs
- **Variant A** (`abb5609d38`): `use1.ts(75,16): error TS5114: Instantiations of type 'Foo' appear infinitely circular.`
- **Variant B** (`90c026edb1`): the same error, plus `use2.ts(2,16): error TS5114 ...`

## Mechanism
- `decl.ts` declares `type Foo<T extends "true", B> = { "true": Foo<T, Foo<T, B>> }[T]` and `type Alias = Foo<"true", {}>`.
- `use1.ts` and `use2.ts` each declare `export let fN: Alias;`.
- The instantiation result for `Alias` is cached per checker, and TS5114 is reported only at the node that first computes it.
- So each checker reports one error, at whichever of these files it checks first.
- The number and location of errors therefore depends on how many checkers touch the files, and in which order.

**Layout:**
- `use1.ts` has 24 ballast statements (`harness\ballast.js`) before the trigger line.
- `pad0.ts` (gen.js, padSize 40) takes about as long on the other checker.
- Under steal, the core files are queued on one checker and `pad0` on the other. If `pad0` finishes before the owner gets to `use2.ts`, that idle checker steals `use2.ts` (from the back of the queue) and reports a second TS5114 there.

## Rates (`--checkers 2`, steal mode)
| run | A | B |
|---|---|---|
| 200 runs | 141 | 59 (29.5%) |
| 50-run recheck | 36 | 14 (28%) |

## Reproduce
```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2 --dump outputs
```
