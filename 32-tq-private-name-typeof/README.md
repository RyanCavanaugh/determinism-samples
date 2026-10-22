# 32: typeof a.#a vs number in declaration emit (ParameterInTypeQuery)

Project `g1\`: c2.ts (class C2 with `#a`, method returning a local class whose methods use `typeof a.#a` / `typeof a.p`),
u1.ts (uses the result, exports r/f1/f2), plus padding files (gen2, k1=4, pad 3).

Outputs (`outputs\`): u1.d.ts prints either `typeof a.#a` / `typeof a.p` or `number`.

Rates over 200 runs each (default steal mode):
- N=2: 11/200 (5.5%) minority output `07fe39392a`
- N=4: 133/200 (66%)
- N=1: 0/200
Random mode also differs (`random:<seed>` N=2,3,4).

## Reproduce
```
node ..\_harness\run.js . --mode steal --runs 200 --checkers 4
```

Rechecked: 4/50 at N=2 and 32/50 at N=4. The `outputs\` file counts are totals across the agent's sweeps, not one 200-run measurement.

