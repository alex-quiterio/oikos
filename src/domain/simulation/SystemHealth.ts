import type { Ecosystem, OrganismId } from '@domain/ecosystem';
import { rankDependence } from './KeystoneAnalysis';
import { stressOf, type StressLevel } from './Stress';
import {
  modelledOrganisms,
  simulate,
  type Intervention,
  type Simulation,
} from './SupplyIndexModel';

export interface Health {
  /** Share of organisms still at or above half their reference supply. Removed organisms count as lost. */
  readonly intact: number;
  /** Mean supply index across organisms, each capped at 1. */
  readonly meanSupply: number;
  readonly total: number;
  readonly belowHalf: readonly OrganismId[];
  /** How many organisms sit at each stress level. */
  readonly byStress: Readonly<Record<StressLevel, number>>;
}

export function assessHealth(
  eco: Ecosystem,
  sim: Simulation,
): Health {
  const organisms = modelledOrganisms(eco);
  const belowHalf = organisms.filter(
    id => (sim.supply[id] ?? 0) < 0.5,
  );
  const mean =
    organisms.reduce(
      (sum, id) => sum + Math.min(sim.supply[id] ?? 0, 1),
      0,
    ) / Math.max(organisms.length, 1);
  const byStress: Record<StressLevel, number> = {
    ok: 0,
    surge: 0,
    mild: 0,
    high: 0,
    severe: 0,
    lost: 0,
  };
  for (const id of organisms)
    byStress[stressOf(sim.supply[id] ?? 0)]++;
  return {
    byStress,
    intact:
      (organisms.length - belowHalf.length) /
      Math.max(organisms.length, 1),
    meanSupply: mean,
    total: organisms.length,
    belowHalf,
  };
}

export interface CollapseStep {
  /** Organisms removed so far, most depended-on first. */
  readonly removed: readonly OrganismId[];
  readonly health: Health;
}

/**
 * Remove organisms one after another in order of structural dependence (the single-removal ranking) and
 * record the health of the web after each. Step 0 is the starting state. Shows whether a web fails
 * gradually or drops off a cliff. The order is fixed, not a worst-case search.
 */
export function collapseSequence(
  eco: Ecosystem,
  base: Intervention = {},
  maxSteps = 10,
): CollapseStep[] {
  const order = rankDependence(eco, base)
    .slice(0, maxSteps)
    .map(r => r.id);
  const steps: CollapseStep[] = [];
  for (let k = 0; k <= order.length; k++) {
    const removed = order.slice(0, k);
    const sim = simulate(eco, {
      ...base,
      removed: new Set([...(base.removed ?? []), ...removed]),
    });
    steps.push({ removed, health: assessHealth(eco, sim) });
  }
  return steps;
}
