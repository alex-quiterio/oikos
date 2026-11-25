<p align="center">
  <img src="docs/logo.svg" alt="Oikos logo: four arrows in the colours of energy, nitrogen, phosphorus and seeds circling a seedling" width="120" />
</p>

<h1 align="center">Oikos</h1>

<p align="center"><em>The household accounts of living places.</em></p>

<p align="center"><a href="https://alex-quiterio.github.io/oikos/"><b>Open the live atlas</b></a></p>

Explorable maps of how energy, nitrogen, phosphorus and seeds move through ecosystems. From root fungi to lynx, from kelp to otters, from the ocean into the forest by way of a salmon. The name is the Greek root of both _ecology_ and _economy_: the household.

Eleven ecosystems so far:

| Ecosystem                       | Habitat      | What it is about                                                              |
| ------------------------------- | ------------ | ----------------------------------------------------------------------------- |
| Cork oak montado                | Land         | Root fungi, acorns, rabbits, and who depends on whom                          |
| Veluwe heath and forest         | Land         | Heather, grazers, a returning wolf, and the nitrogen falling from the sky     |
| Westerpark pond and lawns       | Urban        | A city-park pond: herons, bread, and the clear-or-green tipping point         |
| East African savanna            | Land         | Grass, herds, fire, elephants, termites and vultures                          |
| Amazon upland forest            | Land         | Poor soil, fast recycling, and Saharan dust as a phosphorus gift              |
| Arctic tundra                   | Land         | Lemming cycles, scarce nitrogen, and frozen carbon beginning to thaw          |
| Salmon river and coastal forest | Land and sea | Marine nutrients carried into a rainforest by fish, bears and wolves          |
| Wadden Sea tidal flats          | Land and sea | Mud algae, shellfish, and the birds that fly in from the Arctic               |
| Northeast Pacific kelp forest   | Marine       | Otters, urchins and kelp, and the cascade between them                        |
| Caribbean coral reef            | Marine       | A coral and alga partnership, grazers, and the algae that compete with it     |
| Deep-sea hydrothermal vent      | Marine       | A food web that runs on chemistry, not sunlight, though not quite without sun |

## What you can do

- **Run scenarios.** Rabbit collapse, heat bleaching, nitrogen deposition, permafrost thaw, seafloor mining and more. Line weights and flow particles change, and a shadow shows the reference state.
- **Watch the system fail.** A health bar stays in view and counts organisms by stress level while it falls. Nodes on the map turn from green through yellow and orange to red as supply drops. Blue means surging, as when urchins boom after otters go.
- **Play the collapse.** Remove organisms one after another, most depended-on first, and see whether the web slopes down or falls off a cliff.
- **Find the keystones.** Remove each organism in turn and rank how much of the web moves. The keystone lens rings each organism, and the panel sets the result beside what the literature claims, flagging where they disagree.
- **Follow one organism.** See what it takes in and gives out, with an evidence tag on every flow.
- **Read the evidence.** A table of every flow with its confidence level and notes.
- **Share a view.** The URL hash holds the ecosystem, scenario and panel, for example `#kelp-forest--otter-loss--keystones`.

## Honest about what is not known

Every flow carries an evidence level.

| Level        | Meaning                                                 |
| ------------ | ------------------------------------------------------- |
| `documented` | Documented in this or a closely related system          |
| `likely`     | Documented elsewhere, plausible here, not measured here |
| `debated`    | Published claims exist and are contested                |
| `unknown`    | Suspected or asked about, with no solid evidence        |

Weights (1 to 5) are relative guesses for comparison and are not measured fluxes. Only documented and likely relationships enter the scenario model. Debated and unknown ones are drawn dashed or dotted with a question mark. Every ecosystem lists open questions and what it leaves out, and every scenario lists what it cannot tell you.

The evidence levels and keystone claims are the author's reading of the literature and carry no citations yet. Corrections from people who know these systems are the most valuable contribution.

### What the model is, and is not

Each organism gets a supply index, 1 in the reference state. Inputs set it (the weakest input type limits), stores such as litter buffer changes, **controls** carry top-down effects (a predator's fall releases its prey, a consumer's rise presses on its resource), and seed or larval flows are reported as recruitment. It shows direction and exposure. It is not a biomass model, and the keystone ranking measures structural dependence on this map. It is not Power's keystone index, which needs biomass. Stress colours are conventions for reading the numbers, not ecological tipping points.

## Develop

Requires [Bun](https://bun.sh).

```sh
bun install
bun run dev        # http://localhost:5173
bun run check      # typecheck, lint, format check, all tests
bun run build      # production build in dist/ (serve it, do not open from file://)
bun run artifact   # single self-contained HTML file in dist/
```

Stack: Vue 3, Pinia, Vite, TypeScript, ESLint, Prettier, `bun test` for pure code and Vitest for components.

## Architecture

Domain-driven, with imports that only point inward and are enforced by ESLint.

```
src/
  domain/          Ecosystem aggregate, flows, controls, scenarios. The supply index model,
                   keystone analysis, system health and stress levels. No framework, no I/O.
  application/     AtlasService (use cases) and the AtlasCatalogue port.
  infrastructure/  Ecosystem data as typed modules, a mapper into the domain, the catalogue adapter.
  presentation/    Pinia store, view models, geometry, Vue components, styles.
  main.ts          Composition root: wires the layers together.
```

Import rules, all checked by `bun run lint`:

- Use the aliases `@domain`, `@application`, `@infrastructure` and `@presentation`.
- An alias import is at most two segments deep, so each folder has an `index.ts` barrel.
- Relative imports only reach the current folder (`./file`). Never `../`.
- `domain` imports nothing from other layers, `application` only from `domain`, `infrastructure` not from `presentation`.

## Add an ecosystem or a scenario

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

MIT. See [LICENSE](LICENSE).
