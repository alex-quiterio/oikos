import type { Ecosystem, OrganismId } from '@domain/ecosystem';
import { modelledOrganisms, simulate, type Intervention } from './SupplyIndexModel';

export type Severity = 'collapse' | 'major' | 'moderate' | 'minor';

/** Conventions, not ecological thresholds. They exist to make results comparable across ecosystems. */
export function severityOf(share: number): Severity {
  if (share >= 0.4) return 'collapse';
  if (share >= 0.2) return 'major';
  if (share >= 0.1) return 'moderate';
  return 'minor';
}

export interface Dependence {
  readonly id: OrganismId;
  /** Mean absolute change in supply index across all other organisms, capped at 1 each. */
  readonly impact: number;
  /** Organisms that fall below half their reference supply when this one is removed. */
  readonly collapsed: readonly OrganismId[];
  /** Organisms that rise above 1.3 times their reference supply. */
  readonly released: readonly OrganismId[];
  readonly severity: Severity;
}

/**
 * Remove each organism in turn and measure how much of the rest of the web moves.
 * This measures structural dependence on this map. It is not Power's keystone index, which needs biomass.
 */
export function rankDependence(eco: Ecosystem, base: Intervention = {}): Dependence[] {
  const organisms = modelledOrganisms(eco);
  const out: Dependence[] = [];
  for (const id of organisms) {
    const sim = simulate(eco, { ...base, removed: new Set([...(base.removed ?? []), id]) });
    const others = organisms.filter(o => o !== id);
    let total = 0;
    const collapsed: OrganismId[] = [];
    const released: OrganismId[] = [];
    for (const o of others) {
      const v = sim.supply[o] ?? 0;
      total += Math.min(1, Math.abs(1 - v));
      if (v < 0.5) collapsed.push(o);
      else if (v > 1.3) released.push(o);
    }
    const n = Math.max(others.length, 1);
    out.push({ id, impact: total / n, collapsed, released, severity: severityOf(collapsed.length / n) });
  }
  return out.sort((a, b) => b.impact - a.impact);
}

export interface Disagreements {
  /** Flagged in the literature, but the map sees only modest structural dependence. */
  readonly literatureOnly: readonly OrganismId[];
  /** Structurally central here, but not flagged in the literature. Usually basal producers and decomposers. */
  readonly structuralOnly: readonly OrganismId[];
}

export function compareWithLiterature(eco: Ecosystem, ranking: readonly Dependence[]): Disagreements {
  const literatureOnly = ranking
    .filter(r => {
      const claim = eco.organism(r.id).claim;
      return claim && claim.status !== 'contested' && (r.severity === 'minor' || r.severity === 'moderate');
    })
    .slice(0, 3)
    .map(r => r.id);
  const structuralOnly = ranking
    .filter(r => !eco.organism(r.id).claim && (r.severity === 'collapse' || r.severity === 'major'))
    .slice(0, 3)
    .map(r => r.id);
  return { literatureOnly, structuralOnly };
}
