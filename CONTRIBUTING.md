# Contributing to Oikos

The most useful contributions are corrections, sources and honest unknowns. A flow marked `unknown` is a good result, not a gap to hide.

## Adding an ecosystem

1. Copy `src/infrastructure/ecosystems/kelp-forest.ts` to a new file and fill it in. It exports an `EcosystemDto`, defined in `dto.ts`.
2. Export it from `src/infrastructure/ecosystems/index.ts` and add it to the list in `src/infrastructure/StaticCatalogue.ts`.
3. Run `bun run check`. The tests validate the data: every reference must exist, organisms must sit inside the canvas without overlapping, every scenario after the first must say what is unknown, and so on.

### Format

```ts
{
  id, name, habitat, place, intro,
  flowLabels?,                       // rename a flow type, for example seeds -> Larvae
  view: { w, h, sky, bands, lines, labels },
  nodes:  { id: { n, g, s, x, y, r, d, ks? } },
  flows:  [ [from, to, type, weight, evidence, label, note?] ],
  controls?: [ [from, to, 'release' | 'pressure', strength, evidence, label, note?] ],
  stories, questions, omitted, care, scenarios
}
```

- **type**: `energy`, `nitrogen`, `phosphorus` or `seeds`.
- **weight**: 1 to 5, a relative guess for comparison.
- **evidence**: `E` documented, `L` likely, `D` debated, `U` unknown.
- **Flow id**: `from>to:type`. **Control id**: `from>to:ctl`.
- **Control `release`**: when `from` (a predator or grazer) falls, `to` rises. **`pressure`**: when `from` rises above its reference level, `to` is pressed down. **`balance`**: both, for pairs where each direction is documented, such as water fleas and algae. These are not flows. Use them for top-down effects, competition and overgrowth.
- **`ks`**: what the literature claims about the species. `k` is `keystone`, `foundation`, `vector`, `symbiont`, `engineer` or `disperser`. `s` is `documented`, `proposed` or `contested`.
- **Scenario**: `abundance` multiplies an organism (`0` removes it), `factors` multiplies a flow or control by id, `assumes` is `[evidence, text]` pairs, and `unknowns` is plain sentences. The first scenario is the reference and stays empty.

## Evidence rules

- Mark a flow `E` only when it is documented for this system or a very close one.
- If the evidence comes from another biome, use `L` and say so in `note`.
- Put contested claims at `D` and say what is contested.
- Put the rest at `U`. Do not assign a weight you cannot defend.
- Add a short `note` with the kind of study or the source when you have one. Cite what you have read, not what you expect to exist.
- Say what is missing, in `omitted` and in each scenario's `unknowns`.

## Code rules

- Layers import inward only. Use `@domain`, `@application`, `@infrastructure`, `@presentation`.
- An alias import is at most two segments deep. Add a barrel instead of reaching deeper.
- Relative imports only for files in the same folder. Never `../`.
- Pure ecological logic goes in `src/domain`. Vue and Pinia stay in `src/presentation`.
- `bun run check` must pass.
