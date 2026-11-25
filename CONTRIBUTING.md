# Contributing

The most useful contributions are corrections, sources and honest unknowns. A flow that is marked `U` is a good result, not a gap to hide.

## Data format

An ecosystem is one object in `data/<name>.js`, pushed onto `window.ECOSYSTEMS`. See `data/montado.js` for a full example.

```js
(window.ECOSYSTEMS = window.ECOSYSTEMS || []).push({
  id, name, place, intro,
  view:   { w, h, soilY, ground, labels },   // canvas size and the ground line
  nodes:  { id: { n, g, s, x, y, r, d } },   // g: plant|fungus|invert|bird|mammal|pool, s: c (circle) | s (square)
  edges:  [ [from, to, type, weight, confidence, label, note?], ... ],
  stories:   [ { t, nodes, x } ],            // nodes: ids to spotlight, or null for all
  unknowns:  [ { t, x, edges: ['from>to:type'] } ],
  omitted:   'what the map leaves out',
  scenarios: [ { id, name, summary, abundance, edges, changes, unknowns } ]
});
```

- **type**: `energy`, `nitrogen`, `phos` or `seeds`.
- **weight**: 1 to 5, a relative guess for comparison.
- **confidence**: `E`, `L`, `D` or `U` as in the README.
- **Edge id**: `from>to:type`.
- **Scenario `abundance`**: multiplier on an organism (`{ rab: 0.1 }`). `0` removes it, values above 1 raise it.
- **Scenario `edges`**: multiplier on one flow by edge id (`{ 'sun>grass:energy': 0.5 }`).
- **Scenario `changes`**: `[confidence, text]` pairs saying what the scenario assumes and how sure we are.
- **Scenario `unknowns`**: plain sentences about what the scenario cannot tell us. Every scenario should have some.
- The first scenario is the reference state. Leave its `abundance` and `edges` empty.

## Evidence rules

- Mark a flow `E` only when it is documented for this system or a very close one.
- If the evidence comes from another biome, use `L` and say so in `note`.
- Put contested claims at `D` and say what is contested.
- Put the rest at `U`. Do not assign a weight you cannot defend as "bigger than X, smaller than Y".
- Add a short `note` with the study type or source when you have one. Please give a citation you have read, not one you expect to exist.
- Say what is missing. Add it to `omitted` or an `unknowns` entry.

## Checks before a pull request

- Open `index.html`. Click every scenario. Hover a few flows. Toggle the confidence chip.
- Open in light and dark mode.
- Resize to phone width. The map scrolls sideways inside its own box, the page must not.
