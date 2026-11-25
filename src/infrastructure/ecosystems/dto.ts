import type {
  ClaimKind,
  ClaimStatus,
  FlowType,
  Habitat,
  OrganismGroup,
} from '@domain/ecosystem';

/**
 * Compact authoring format for ecosystem data. A mapper (anti-corruption layer) turns it into domain objects.
 * Evidence codes: E documented, L likely, D debated, U unknown.
 */
export type EvidenceCode = 'E' | 'L' | 'D' | 'U';

export type FlowTuple = [
  from: string,
  to: string,
  type: FlowType,
  weight: number,
  evidence: EvidenceCode,
  label: string,
  note?: string,
];

export type ControlTuple = [
  from: string,
  to: string,
  kind: 'release' | 'pressure' | 'balance',
  strength: number,
  evidence: EvidenceCode,
  label: string,
  note?: string,
];

export interface NodeDto {
  n: string;
  g: OrganismGroup;
  s: 'c' | 's';
  x: number;
  y: number;
  r: number;
  d: string;
  ks?: { k: ClaimKind; s: ClaimStatus; t: string };
}

export interface BandDto {
  d: string;
  fill: 'soil' | 'seabed' | 'water' | 'land';
  opacity?: number;
}

export interface ScenarioDto {
  id: string;
  name: string;
  summary: string;
  abundance: Record<string, number>;
  factors: Record<string, number>;
  assumes: [EvidenceCode, string][];
  unknowns: string[];
}

export interface EcosystemDto {
  id: string;
  name: string;
  habitat: Habitat;
  place: string;
  intro: string;
  flowLabels?: Partial<Record<FlowType, string>>;
  view: {
    w: number;
    h: number;
    sky: 'land' | 'water';
    bands: BandDto[];
    lines: string[];
    labels: [string, number, number][];
  };
  nodes: Record<string, NodeDto>;
  flows: FlowTuple[];
  controls?: ControlTuple[];
  stories: { t: string; nodes: string[] | null; x: string }[];
  questions: { t: string; x: string; ids: string[] }[];
  omitted: string;
  care: { why: string; status: string };
  scenarios: ScenarioDto[];
  teach?: TeachDto;
}

/** Teaching material for one ecosystem. See TeachingGuide in the domain. */
export interface TeachDto {
  bigIdea: string;
  questions: {
    t: string;
    x: string;
    look: string[];
    notice: string;
  }[];
  activities: {
    t: string;
    predict: string;
    notice: string;
    scenario?: string;
    remove?: string[];
  }[];
}
