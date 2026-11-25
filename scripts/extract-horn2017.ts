/**
 * Reads the six SCOR network files of Horn et al. (2017) and writes the flows between the groups used in the
 * Wadden Sea ecosystem, as an area-weighted mean over the six habitats and per habitat.
 *
 *   bun scripts/extract-horn2017.ts
 *
 * The paper's habitat areas weight the mean, so it describes an average square metre of the intertidal flats
 * of the study site, not any one habitat. Values are mgC per m² per day.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILES = {
  cockle: 'cockle-field',
  razor: 'razor-clam-field',
  mud: 'mud-flat',
  mussel: 'mussel-bank',
  sand: 'sand-flat',
  seagrass: 'seagrass-meadow',
} as const;
type Habitat = keyof typeof FILES;
const AREA_KM2: Record<Habitat, number> = {
  cockle: 6.3,
  razor: 31.5,
  mud: 23.1,
  mussel: 0.6,
  sand: 160.3,
  seagrass: 33.3,
};
const TOTAL = Object.values(AREA_KM2).reduce((a, b) => a + b, 0);

/** Which group of this atlas a compartment of the paper belongs to. */
function group(name: string): string {
  const n = name.toLowerCase();
  const has = (...xs: string[]): boolean =>
    xs.some(x => n.includes(x));
  if (n.startsWith('phytoplankton')) return 'phyto';
  if (n === 'mpb') return 'diat';
  if (n.startsWith('makrophyta')) return 'zost';
  if (n === 'bac') return 'bact';
  if (n.startsWith('poc')) return 'detr';
  if (n === 'mei') return 'meio';
  if (has('cerastoderma', 'macoma', 'mya ', 'ensis', 'fabulina'))
    return 'cockle';
  if (has('mytilus', 'crassostrea')) return 'mussel';
  if (n.startsWith('carcinus')) return 'crab';
  if (n.startsWith('crangon')) return 'shrimp';
  if (has('small crustaceans')) return 'crustaceans';
  if (has('littorina', 'peringia', 'retusa')) return 'snails';
  if (
    has(
      'oligochaeta',
      'arenicola',
      'capitella',
      'eteone',
      'lanice',
      'nephtys',
      'nereis',
      'phyllodoce',
      'pygospio',
      'scoloplos',
      'small polychaetes',
      'tharyx',
      'heteromastus',
      'lepidonotus',
    )
  )
    return 'worm';
  if (
    has(
      'anthozoa',
      'balanidae',
      'pycnogonum',
      'crepidula',
      'lepidochitona',
      'nemertea',
    )
  )
    return 'bankfauna';
  if (has('haematopus')) return 'oyc';
  if (has('somateria')) return 'eider';
  if (has('calidris canutus')) return 'knot';
  if (has('branta')) return 'goose';
  if (has('penelope', 'acuta', 'platyrhynchos')) return 'dabblers';
  if (has('tadorna')) return 'shelduck';
  if (has('larus', 'chroicocephalus')) return 'gulls';
  if (
    has(
      'calidris alpina',
      'numenius',
      'limosa',
      'tringa',
      'pluvialis',
      'recurvirostra',
      'arenaria',
      'charadrius',
      'limicola',
    )
  )
    return 'waders';
  throw new Error(`No group for compartment "${name}"`);
}

interface Network {
  names: string[];
  nLiving: number;
  stock: Map<number, number>;
  imports: Map<number, number>;
  flows: [number, number, number][];
}

function parse(path: string): Network {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  const [n = 0, nLiving = 0] = (lines[1] ?? '')
    .trim()
    .split(/\s+/)
    .map(Number);
  const names = lines
    .slice(2, 2 + n)
    .map(l => (l.split('\t')[0] ?? '').trim());
  const blocks: number[][][] = [[]];
  for (const line of lines.slice(2 + n)) {
    const p = line.trim().split(/\s+/);
    if (p.length < 2) continue;
    if (p[0] === '-1') {
      blocks.push([]);
      continue;
    }
    blocks[blocks.length - 1]!.push(p.map(Number));
  }
  const filled = blocks.filter(b => b.length > 0);
  const toMap = (rows: number[][] | undefined): Map<number, number> =>
    new Map((rows ?? []).map(r => [r[0]!, r[1]!]));
  return {
    names,
    nLiving,
    stock: toMap(filled[0]),
    imports: toMap(filled[1]),
    flows: (filled[4] ?? []).map(r => [r[0]!, r[1]!, r[2]!]),
  };
}

const flows: Record<
  string,
  { mean: number; byHabitat: Partial<Record<Habitat, number>> }
> = {};
const production: Record<
  string,
  { mean: number; byHabitat: Partial<Record<Habitat, number>> }
> = {};
const stocks: Record<
  string,
  { mean: number; byHabitat: Partial<Record<Habitat, number>> }
> = {};

const add = (
  bucket: typeof flows,
  key: string,
  h: Habitat,
  value: number,
): void => {
  const e = (bucket[key] ??= { mean: 0, byHabitat: {} });
  e.byHabitat[h] = (e.byHabitat[h] ?? 0) + value;
  e.mean += (AREA_KM2[h] / TOTAL) * value;
};

for (const h of Object.keys(FILES) as Habitat[]) {
  const net = parse(`data/sources/horn2017/${FILES[h]}.txt`);
  const g = (i: number): string => group(net.names[i - 1] ?? '');
  for (const [a, b, v] of net.flows)
    add(flows, `${g(a)}>${g(b)}`, h, v);
  // A producer's "import" is its gross production, or what arrives with the tide for plankton.
  for (const [i, v] of net.imports) add(production, g(i), h, v);
  for (const [i, v] of net.stock) add(stocks, g(i), h, v);
}

const round = (x: number): number => Math.round(x * 100) / 100;
const clean = (bucket: typeof flows): typeof flows =>
  Object.fromEntries(
    Object.entries(bucket)
      .filter(([, e]) => e.mean > 0)
      .sort((a, b) => b[1].mean - a[1].mean)
      .map(([k, e]) => [
        k,
        {
          mean: round(e.mean),
          byHabitat: Object.fromEntries(
            Object.entries(e.byHabitat).map(([h, v]) => [
              h,
              round(v as number),
            ]),
          ),
        },
      ]),
  ) as typeof flows;

const out = `// Generated by scripts/extract-horn2017.ts from data/sources/horn2017. Do not edit by hand.
// Horn et al. (2017) PLoS ONE 12(5): e0176381, https://doi.org/10.1371/journal.pone.0176381 (CC BY 4.0).
// Values are mgC per m2 per day. "mean" weights the six habitats by their area in the study site.

export type HornHabitat = 'cockle' | 'razor' | 'mud' | 'mussel' | 'sand' | 'seagrass';

export interface HornValue {
  readonly mean: number;
  readonly byHabitat: Readonly<Partial<Record<HornHabitat, number>>>;
}

export const HORN_AREA_KM2: Readonly<Record<HornHabitat, number>> = ${JSON.stringify(AREA_KM2)};

/** Flow from one group to another, keyed "from>to". */
export const HORN_FLOWS: Readonly<Record<string, HornValue>> = ${JSON.stringify(clean(flows), null, 2)};

/** Gross production of producers and what arrives with the tide for plankton, by group. */
export const HORN_PRODUCTION: Readonly<Record<string, HornValue>> = ${JSON.stringify(clean(production), null, 2)};

/** Standing stock by group, mgC per m2. */
export const HORN_STOCKS: Readonly<Record<string, HornValue>> = ${JSON.stringify(clean(stocks), null, 2)};
`;
writeFileSync(
  'src/infrastructure/ecosystems/horn2017.generated.ts',
  out,
);
console.log(
  `wrote ${Object.keys(flows).length} flows, ${Object.keys(production).length} producers, ${Object.keys(stocks).length} stocks`,
);
