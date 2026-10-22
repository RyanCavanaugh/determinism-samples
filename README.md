# tsrs work-stealing nondeterminism: index of found cases

Each folder is a small TypeScript project. Compiled repeatedly with tsrs (default work-stealing scheduler, `--checkers N`), it produces more than one distinct output (diagnostics and/or emitted `.d.ts`). Each README gives the project, the outputs, the rate, and the command to reproduce. Tooling is in `_harness\` (`run.js` measures, `gen.js`/`gen2.js` add padding to turn an ordering difference into a timing race, `place.js` shows file→checker placement, `GUIDE.md` describes the method).

Rates are the minority share over 100-200 runs on a 16-core Windows machine, debug-profile tsrs (opt-level 3). They depend on the machine and its load. "Recheck" is the rate measured again on a quiet machine.

| # | What differs | N | Rate (minority) | Recheck |
|---|---|---|---|---|
| 01 | base constraint cut short by depth guard | 2 | 44% | — |
| 02 | TS2716 circular default reported or not | 2 | 49.5% | 26/50 |
| 03 | `.d.ts` of JS namespace-spread cycle: `any` vs object types | 2 | 8.5% (3 outputs) | 2/50 |
| 04 | extra TS2589 on join.ts | 2 | 42% | 17/40 |
| 10 | TS7022 vs TS2339 (variance cycle discarded diagnostics) | 2 | 37.5% | 10/30 |
| 11 | extra TS2322 on `g(a)` (maybe-related keyof mapped) | 2 | 27% | 4/30 |
| 12 | which of 4 assignments report TS2322 (deeply nested) | 2 | 5 outputs | 5 outputs/30 |
| 13 | missing TS2322 `Listener<string>`→`Listener<unknown>` | 2 | 16% | 7/30 |
| 14 | `.d.ts` getter type `Box2<number>` vs union | 2 | 42% | 12/30 |
| 20 | TS5114 present/absent (deep instantiation) | 8 | 6% under load | **0/50, weak** |
| 21 | TS5114 location decl.ts vs use files | 4 | 7% | 1/50 |
| 22 | TS5114 on `R<[]>` in a.ts and/or c.ts | 4 | 4 outputs, 36% | 3 outputs, 20/50 |
| 23 | TS2345 in f2.ts present/absent (contextual cycle) | 2 | 11% | 3/50 |
| 24 | `.d.ts` `(x:number)=>any` vs `=>number` | 2 | 28% | 8/50 |
| 25 | `.d.ts` `Effect<100,never,XXX>` vs `never` (single-signature this cache) | 2 | 28.5% | 9/50 |
| 26 | extra TS2322 `{v:any}`→`number` in f1.ts (contextual cycle, fuzz p171, ballast) | 2 | 34.5% | 20/50 |
| 27 | `.d.ts` f1.v0/f4.v0 `unknown` vs `number` (fuzz p1048) | 2 | 4 outputs, 42% majority | 4 outputs |
| 28 | extra TS2322 `{p:any}`→`number` in f2.ts (fuzz p198) | 2 | 18.5% | 13/50 |
| 29 | `.d.ts` `any[]` vs `any[][]` (fuzz p1013) | 4 | 49.5% | 24/50, 10/30 |
| 30 | which file reports TS2615 (circular mapped, emit before check) | 2 | 3% | 5/100 |
| 31 | TS2313 with/without related info (needs `--pretty true`) | 6 | 19% | — |
| 32 | `.d.ts` `typeof a.#a` vs `number` | 4 | 66% (5.5% at N=2) | 32/50 |
| 33 | `.d.ts` `{ foo: any }` vs `{ foo: typeof c2.foo }` (circular accessor annotations) | 2 | 45% | 23/50 |
| 34 | extra TS2589 at u2.ts 3:52 (recursive keyof K<T>) | 2 | 38.5% | 23/50 |
| 40 | union order of binding-pattern param types | 2 | 41.5% | 15/30 |
| 50 | TS2799 reported on declaration or not | 2 | 48% | 12/30 |
| 51 | TS2339 on `{}` vs TS2322 (binding param type cache) | 2 | 10% | 3/30 |
| 52 | TS2589 reported at a.ts line 10 vs line 7 | 2 | 16.5% | 14/50, 5/30 |
| 53 | TS2589 on decl.ts+use1.ts vs use1.ts only (template literal length) | 2 | 32.5% | 19/50, 8/30 |
| 54 | TS5115 circular alias instantiation reported in use1 / use2 / both | 2 | 26% | 12/50 |
| 60 | TS2303 circular alias reported or not | 2 | 42.5% | — |
| 61 | flow depth limit hides use2.ts TS2551/TS2339 | 2 | 40% | 25/50 |
| 62 | TS5114 reported once vs at use1+use2 | 2 | 29.5% | 14/50 |
| 63 | TS2589 present/absent, exit 0 vs 2 (Wide2) | 2 | 46.5% | 32/50 |

## Other notes
- Hits that differed only under `TSRS_CHECKER_ASSIGNMENT=random:<seed>` were turned into steal-mode races (#26, #60–63) with the "slow front file" ballast recipe in `_harness\GUIDE.md`.
- Type-identity / creation-order variations (union member order, object literal identity, etc.) produced no differences, even under random assignment. tsrs's `compare_types` breaks ties by content before type id, so the printed output does not change.
- **A tsrs bug found along the way:** a circular-type fuzzer hit `as_mapped_type: wrong type data` panics (exit 5) under random assignment. The projects were not kept.

## Leads left behind
`..\candidates\inst-fuzz\` has a cross-file contextual-cycle fuzzer (`fuzz.js`) and about 20 unraced random-mode hits in `fz\` (p155, p193, p1001, p1014, ...).
