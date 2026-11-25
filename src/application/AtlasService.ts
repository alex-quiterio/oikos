import {
  compareWithLiterature,
  rankDependence,
  simulate,
  type Dependence,
  type Disagreements,
  type Ecosystem,
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
  private readonly keystoneCache = new Map<string, KeystoneReport>();

  constructor(private readonly catalogue: AtlasCatalogue) {}

  entries(): readonly AtlasEntry[] {
    return this.catalogue.list();
  }

  entry(ecosystemId: string | undefined): AtlasEntry {
    const all = this.catalogue.list();
    return all.find(e => e.ecosystem.id === ecosystemId) ?? (all[0] as AtlasEntry);
  }

  /** Run a scenario, optionally with organisms removed by hand. */
  simulate(eco: Ecosystem, scenario: Scenario, removed: ReadonlySet<OrganismId> = new Set()): Simulation {
    return simulate(eco, { abundance: scenario.abundance, factors: scenario.factors, removed });
  }

  /** Remove each organism in turn under a scenario. Cached because it re-runs the model once per organism. */
  keystones(eco: Ecosystem, scenario: Scenario): KeystoneReport {
    const key = `${eco.id}|${scenario.id}`;
    const hit = this.keystoneCache.get(key);
    if (hit) return hit;
    const ranking = rankDependence(eco, { abundance: scenario.abundance, factors: scenario.factors });
    const report = { ranking, disagreements: compareWithLiterature(eco, ranking) };
    this.keystoneCache.set(key, report);
    return report;
  }
}
