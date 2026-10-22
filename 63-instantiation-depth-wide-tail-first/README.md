# 63 — TS2589 "excessively deep" appears or not depending on check order

## What differs
The exit code flips between the two outputs.

| output | result |
|---|---|
| `3b179c8b3f` | no errors, exit 0 |
| `68153fc123` | `all.ts(2,24): error TS2589: Type instantiation is excessively deep and possibly infinite.`, exit 2 |

## Mechanism
- `decl.ts` defines `Wide2<N, I>`, a 1000-way-wide recursive mapped type six levels deep.
- `tail.ts` instantiates `Wide2<[0,0,0], "">`, which takes about 230 ms.
- `all.ts` instantiates `Wide2<[], "">`.
- If `all.ts` is checked on a cold checker, the instantiation depth/count limit is hit and TS2589 is reported.
- If the same checker has already checked `tail.ts`, the inner instantiations are cached, `all.ts` stays under the limit, and there is no error.

**Layout:**
- `pad0.ts` holds 900 slow ballast statements (`harness\ballast.js`), about 225 ms, the same as `tail.ts`.
- Under steal, checker 1 owns `tail.ts` and then `all.ts`; checker 0 owns `pad0.ts` and `decl.ts`.
- If `pad0` and `decl` finish before `tail.ts`, the idle checker 0 steals `all.ts` and checks it cold, which gives TS2589.

## Rates (`--checkers 2`, steal mode)
| run | no error | TS2589 |
|---|---|---|
| 200 runs | 107 | 93 (46.5%) |
| 50-run recheck | 18 | 32 |

The rate is sensitive to machine load, since it is a 230 ms vs 225 ms race.

## Reproduce
```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 2 --dump outputs
```
