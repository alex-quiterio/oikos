import {
  assessHealth,
  collapseSequence,
  analyseFlows,
  compareWithLiterature,
  rankDependence,
  simulate,
  type CollapseStep,
  type Dependence,
  type Disagreements,
  type FlowAnalysis,
  type Ecosystem,
  type Health,
  type OrganismId,
  type Scenario,
  type Simulation,
} from '@domain';
import type { AtlasCatalogue, AtlasEntry } from './ports';

export interface KeystoneReport {
  readonly ranking: readonly Dependence[];
  readonly disagreements: Disagreements;
}

/** Use cases of the atlas. Stateless: all state lives in the presentation store. */
export class AtlasService {
  private readonly flowCache = new Map<string, FlowAnalysis>();
  private readonly keystoneCache = new Map<string, KeystoneReport>();
  private readonly collapseCache = new Map<
    string,
    readonly CollapseStep[]
  >();

  constructor(private readonly catalogue: AtlasCatalogue) {}

  entries(): readonly AtlasEntry[] {
    return this.catalogue.list();
  }

  entry(ecosystemId: string | undefined): AtlasEntry {
    const all = this.catalogue.list();
    return (
      all.find(e => e.ecosystem.id === ecosystemId) ??
      (all[0] as AtlasEntry)
    );
  }

  /** Run a scenario, optionally with organisms removed by hand. */
  simulate(
    eco: Ecosystem,
    scenario: Scenario,
    removed: ReadonlySet<OrganismId> = new Set(),
  ): Simulation {
    return simulate(eco, {
      abundance: scenario.abundance,
      factors: scenario.factors,
      removed,
    });
  }

  /** How much of the web is still intact in a simulated state. */
  health(eco: Ecosystem, sim: Simulation): Health {
    return assessHealth(eco, sim);
  }

  /** Remove each organism in turn under a scenario. Cached because it re-runs the model once per organism. */
  keystones(eco: Ecosystem, scenario: Scenario): KeystoneReport {
    const key = `${eco.id}|${scenario.id}`;
    const hit = this.keystoneCache.get(key);
    if (hit) return hit;
    const ranking = rankDependence(eco, {
      abundance: scenario.abundance,
      factors: scenario.factors,
    });
    const report = {
      ranking,
      disagreements: compareWithLiterature(eco, ranking),
    };
    this.keystoneCache.set(key, report);
    return report;
  }

  /** Health of the web as the most depended-on organisms are removed one after another. Cached. */
  collapse(
    eco: Ecosystem,
    scenario: Scenario,
  ): readonly CollapseStep[] {
    const key = `${eco.id}|${scenario.id}`;
    const hit = this.collapseCache.get(key);
    if (hit) return hit;
    const steps = collapseSequence(eco, {
      abundance: scenario.abundance,
      factors: scenario.factors,
    });
    this.collapseCache.set(key, steps);
    return steps;
  }

  /** The ecosystem read as energy and nutrient flows. Cached. */
  flows(eco: Ecosystem): FlowAnalysis {
    const hit = this.flowCache.get(eco.id);
    if (hit) return hit;
    const analysis = analyseFlows(eco);
    this.flowCache.set(eco.id, analysis);
    return analysis;
  }
}
