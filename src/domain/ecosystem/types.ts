/** Ubiquitous language of the atlas. Everything in this folder is free of framework and I/O concerns. */

export type OrganismId = string;
export type FlowId = string; // "from>to:type"
export type ControlId = string; // "from>to:ctl"

export type FlowType = 'energy' | 'nitrogen' | 'phosphorus' | 'seeds';

/** How well the existence and direction of a relationship is supported. Never the size of it. */
export type Evidence =
  'documented' | 'likely' | 'debated' | 'unknown';

export type OrganismGroup =
  | 'plant'
  | 'alga'
  | 'fungus'
  | 'invert'
  | 'fish'
  | 'bird'
  | 'mammal'
  | 'store';

export type ClaimKind =
  | 'keystone'
  | 'foundation'
  | 'vector'
  | 'symbiont'
  | 'engineer'
  | 'disperser';
export type ClaimStatus = 'documented' | 'proposed' | 'contested';

/** What the literature says about a species' role. A claim, not a computed result. */
export interface KeystoneClaim {
  readonly kind: ClaimKind;
  readonly status: ClaimStatus;
  readonly note: string;
}

export interface Organism {
  readonly id: OrganismId;
  readonly name: string;
  readonly group: OrganismGroup;
  readonly description: string;
  readonly claim?: KeystoneClaim;
}

/** Matter, energy or propagules moving from one organism or store to another. */
export interface Flow {
  readonly id: FlowId;
  readonly from: OrganismId;
  readonly to: OrganismId;
  readonly type: FlowType;
  /** Relative size from 1 to 5. A guess for comparison, never a measured flux. */
  readonly weight: number;
  readonly evidence: Evidence;
  readonly label: string;
  readonly note?: string;
}

/**
 * Not a flow: an influence of one organism on the abundance of another.
 *  - release: when `from` (a predator) declines, `to` (its prey) rises.
 *  - pressure: when `from` rises above its reference level, `to` is pressed down.
 */
export interface Control {
  readonly id: ControlId;
  readonly from: OrganismId;
  readonly to: OrganismId;
  readonly kind: 'release' | 'pressure' | 'balance';
  readonly strength: number;
  readonly evidence: Evidence;
  readonly label: string;
  readonly note?: string;
}

export interface Assumption {
  readonly evidence: Evidence;
  readonly text: string;
}

/** A named change to the reference state, with its assumptions and what remains unknown. */
export interface Scenario {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  /** Multipliers on organism abundance. 0 removes, above 1 raises. */
  readonly abundance: Readonly<Record<OrganismId, number>>;
  /** Multipliers on individual flows or controls, by id. */
  readonly factors: Readonly<Record<string, number>>;
  readonly assumptions: readonly Assumption[];
  readonly unknowns: readonly string[];
}

export interface Story {
  readonly title: string;
  readonly text: string;
  /** Organisms to spotlight, or null for the whole map. */
  readonly organismIds: readonly OrganismId[] | null;
}

export interface OpenQuestion {
  readonly title: string;
  readonly text: string;
  readonly relatedIds: readonly string[];
}

export type Habitat = 'Land' | 'Urban' | 'Land and sea' | 'Marine';
