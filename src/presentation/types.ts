import type {
  ClaimStatus,
  Evidence,
  KeystoneClaim,
  OrganismGroup,
  OrganismId,
  StressLevel,
} from '@domain';
import type { NodeLayout } from '@application';
import type { EdgeGeometry } from './geometry';
import type { RelationType } from './format';

/** What the map draws for one flow or control, with all scenario and focus state already resolved. */
export interface EdgeView {
  readonly id: string;
  readonly from: OrganismId;
  readonly to: OrganismId;
  readonly type: RelationType;
  readonly isControl: boolean;
  readonly kind?: 'release' | 'pressure' | 'balance';
  readonly evidence: Evidence;
  readonly modelled: boolean;
  readonly label: string;
  readonly note?: string;
  /** Reference weight for flows, a drawing weight for controls. */
  readonly weight: number;
  /** Multiplier on the reference weight in the current scenario. */
  readonly strength: number;
  /** For controls: how strongly it is acting right now. */
  readonly active: number;
  readonly visible: boolean;
  readonly hot: boolean;
  readonly dim: boolean;
  readonly focused: boolean;
  readonly shadow: boolean;
  readonly geometry: EdgeGeometry;
}

export interface NodeView {
  readonly id: OrganismId;
  readonly name: string;
  readonly group: OrganismGroup;
  readonly layout: NodeLayout;
  readonly supply: number;
  readonly delta: string;
  readonly removed: boolean;
  readonly low: boolean;
  readonly stress: StressLevel;
  readonly dim: boolean;
  readonly selected: boolean;
  /** 0 to 1 share of the highest structural dependence in this scenario. Only set when the keystone lens is on. */
  readonly ring: number;
  readonly claim?: KeystoneClaim;
  readonly claimStatus?: ClaimStatus;
}

export type PanelTab =
  'inspect' | 'scenario' | 'keystones' | 'evidence';
