# Montado Metabolism

An explorable map of how energy, nitrogen, phosphorus and seeds move through an ecosystem, from mycorrhizal fungi to lynx. The first ecosystem is a cork oak montado in southern Portugal.

Open `index.html` in a browser. No build step, no server, no dependencies.

## What you can do

- **Switch scenarios.** Rabbit collapse, drought year, root disease decline, heavy stocking with dewormers. Line weights, particles and each organism's supply index change, and a shadow under every line shows the reference state.
- **Follow one organism.** Click it to see what it takes in and gives out, with a confidence tag on every flow.
- **Remove an organism** and see who is left short.
- **Read the stories** (the underground trade, the acorn economy, one rabbit and many predators) or the **open questions**.

## Honest about what is not known

Every flow carries a confidence level:

| Code | Meaning |
| --- | --- |
| `E` | Documented in this or a closely related system |
| `L` | Likely: documented elsewhere, plausible here, not measured here |
| `D` | Debated: published claims exist and are contested |
| `U` | Unknown: suspected, asked about, no solid evidence |

Weights (1 to 5) are relative guesses for comparison and are not measured fluxes. Only `E` and `L` flows enter the scenario model. `D` and `U` flows are drawn dashed or dotted with a question mark and never touch the arithmetic. Each ecosystem also lists what it leaves out.

The scenario model is a toy. It multiplies each flow by the supply of its source and marks an organism short when a type of input it receives falls. It shows direction and exposure. It does not predict biomass, and it has no alternative prey, no seasonality and no people.

## Add an ecosystem or a scenario

Everything the UI draws comes from a data file in `data/`. See [CONTRIBUTING.md](CONTRIBUTING.md) for the format. A new file that pushes onto `window.ECOSYSTEMS` and a `<script>` tag in `index.html` is enough; a selector appears when there is more than one ecosystem.

## One-file build

```sh
python3 scripts/build-single-file.py
```

Writes `dist/montado-metabolism.html` with the styles, data and script inlined, for sharing as a single file.

## Licence

MIT. See [LICENSE](LICENSE).
