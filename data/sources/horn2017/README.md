# Horn et al. (2017) network files

Carbon-flow networks for six intertidal habitats of the north-eastern German Wadden Sea, in SCOR format.
These are the supporting files S1 to S6 of:

> Horn S, de la Vega C, Asmus R, Schwemmer P, Enners L, Garthe S, et al. (2017) Interaction between birds and
> macrofauna within food webs of six intertidal habitats of the Wadden Sea. PLoS ONE 12(5): e0176381.
> https://doi.org/10.1371/journal.pone.0176381

Published under the Creative Commons Attribution licence (CC BY 4.0). They are copied here unchanged so that the
numbers in `src/infrastructure/ecosystems/horn2017.generated.ts` can be re-derived with
`bun scripts/extract-horn2017.ts`.

| File                   | Habitat          | Supporting file | Area in the study site |
| ---------------------- | ---------------- | --------------- | ---------------------- |
| `cockle-field.txt`     | Cockle field     | S1              | 6.3 km²                |
| `razor-clam-field.txt` | Razor clam field | S2              | 31.5 km²               |
| `mud-flat.txt`         | Mud flat         | S3              | 23.1 km²               |
| `mussel-bank.txt`      | Mussel bank      | S4              | 0.6 km²                |
| `sand-flat.txt`        | Sand flat        | S5              | 160.3 km²              |
| `seagrass-meadow.txt`  | Seagrass meadow  | S6              | 33.3 km²               |

Format: node names, then standing stocks (mgC m⁻²), imports, exports and respiration (mgC m⁻² d⁻¹), then every
flow as `from to value` in mgC m⁻² d⁻¹. The paper builds each network from field stocks and literature energy
ratios and diets, and balances it. It rates flows to detritus and exports of unused production as low quality.
