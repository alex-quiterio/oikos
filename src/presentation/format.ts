import type {
  ClaimKind,
  Evidence,
  FlowType,
  OrganismGroup,
} from '@domain';

export type RelationType = FlowType | 'ctl';

export const FLOW_TYPES: Record<
  RelationType,
  { name: string; hint: string }
> = {
  energy: { name: 'Energy', hint: 'sugars, tissue, prey' },
  nitrogen: { name: 'Nitrogen', hint: 'protein, ammonium, nitrate' },
  phosphorus: {
    name: 'Phosphorus',
    hint: 'often the scarce nutrient',
  },
  seeds: { name: 'Seeds & spores', hint: 'living cargo' },
  ctl: {
    name: 'Controls',
    hint: 'who holds whom in check. Not a flow.',
  },
};

export const GROUP_NAMES: Record<OrganismGroup, string> = {
  plant: 'Plant',
  alga: 'Alga or plankton',
  fungus: 'Fungus or microbe',
  invert: 'Invertebrate',
  fish: 'Fish',
  bird: 'Bird',
  mammal: 'Mammal',
  store: 'Store or source',
};

export const EVIDENCE_NAMES: Record<Evidence, string> = {
  documented: 'documented',
  likely: 'likely',
  debated: 'debated',
  unknown: 'unknown',
};

export const EVIDENCE_ORDER: readonly Evidence[] = [
  'documented',
  'likely',
  'debated',
  'unknown',
];

export const CLAIM_NAMES: Record<ClaimKind, string> = {
  keystone: 'Keystone',
  foundation: 'Foundation species',
  vector: 'Nutrient vector',
  symbiont: 'Key symbiont',
  engineer: 'Ecosystem engineer',
  disperser: 'Seed disperser',
};

export const CLAIM_GLYPH = {
  documented: '◆',
  proposed: '◇',
  contested: '?',
} as const;

export function percentChange(supply: number): string {
  const p = Math.round((supply - 1) * 100);
  return `${p < 0 ? '▼' : '▲'} ${Math.abs(p)}%`;
}

export const typeClass = (t: RelationType): string => `t-${t}`;
