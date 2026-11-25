import type {
  Ecosystem,
  FlowType,
  OrganismId,
} from '@domain/ecosystem';
import { isModelled } from './SupplyIndexModel';

/**
 * Reads an ecosystem as a set of energy and nutrient flows. Everything here comes from the map's own
 * relative weights, so it shows the shape of the system, not measured amounts.
 */

export interface EntryPoint {
  readonly id: OrganismId;
  /** Total weight of the flow it sends into the system. */
  readonly total: number;
}

export interface Deliverer extends EntryPoint {
  /** True when it comes from outside the system rather than from something already in it. */
  readonly external: boolean;
}

export interface NutrientLedger {
  readonly type: 'nitrogen' | 'phosphorus';
  /** Where this nutrient enters from outside. */
  readonly entries: readonly EntryPoint[];
  /** Who delivers it to the plants and algae, biggest first. */
  readonly deliverers: readonly Deliverer[];
  /** Share of what producers receive that comes from inside the system (0 to 1). One step back only. */
  readonly recycledShare: number;
}

export interface Rung {
  /** Trophic level: 1 for producers and detritus, 2 for what eats them, and so on. */
  readonly level: number;
  readonly ids: readonly OrganismId[];
}

export interface FlowAnalysis {
  /** Where energy enters: the sun, or food and water from outside the map. */
  readonly energyEntries: readonly EntryPoint[];
  /** Organisms with the most energy passing through them (in plus out). */
  readonly hubs: readonly EntryPoint[];
  readonly trophic: Readonly<Record<OrganismId, number>>;
  readonly ladder: readonly Rung[];
  readonly nutrients: readonly NutrientLedger[];
}

const PRODUCERS = new Set(['plant', 'alga']);

export function analyseFlows(eco: Ecosystem): FlowAnalysis {
  const flows = eco.flows.filter(f => isModelled(f.evidence));
  // Larvae and spores returning to a source do not make it part of the web.
  const hasInflow = new Set(
    flows.filter(f => f.type !== 'seeds').map(f => f.to),
  );
  const isEntry = (id: OrganismId): boolean => !hasInflow.has(id);
  const group = (id: OrganismId) => eco.organism(id).group;

  const sum = (
    list: readonly { from: OrganismId; weight: number }[],
  ): EntryPoint[] => {
    const by = new Map<OrganismId, number>();
    for (const f of list)
      by.set(f.from, (by.get(f.from) ?? 0) + f.weight);
    return [...by.entries()]
      .map(([id, total]) => ({ id, total }))
      .sort((a, b) => b.total - a.total);
  };

  const energy = flows.filter(f => f.type === 'energy');
  const energyEntries = sum(energy.filter(f => isEntry(f.from)));

  const through = new Map<OrganismId, number>();
  for (const f of energy) {
    through.set(f.from, (through.get(f.from) ?? 0) + f.weight);
    through.set(f.to, (through.get(f.to) ?? 0) + f.weight);
  }
  const hubs = [...through.entries()]
    .filter(([id]) => group(id) !== 'store')
    .map(([id, total]) => ({ id, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Trophic level: producers and detritus sit at 1, and an animal sits one step above the weighted
  // average of what it eats. Repeat until the cycles settle.
  const trophic: Record<OrganismId, number> = {};
  for (const o of eco.organisms) trophic[o.id] = 1;
  for (let it = 0; it < 80; it++) {
    for (const o of eco.organisms) {
      if (isEntry(o.id) || o.group === 'store') continue;
      const eats = energy.filter(
        f => f.to === o.id && !isEntry(f.from),
      );
      if (eats.length === 0) continue;
      const total = eats.reduce((a, f) => a + f.weight, 0);
      const mean =
        eats.reduce(
          (a, f) => a + f.weight * (trophic[f.from] ?? 1),
          0,
        ) / total;
      trophic[o.id] = Math.min(1 + mean, 6);
    }
  }
  const rungs = new Map<number, OrganismId[]>();
  for (const o of eco.organisms) {
    if (isEntry(o.id) || o.group === 'store') continue;
    if (!energy.some(f => f.to === o.id || f.from === o.id)) continue;
    const level = Math.min(Math.round(trophic[o.id] ?? 1), 5);
    rungs.set(level, [...(rungs.get(level) ?? []), o.id]);
  }
  const ladder = [...rungs.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([level, ids]) => ({ level, ids }));

  const nutrients: NutrientLedger[] = [];
  for (const type of [
    'nitrogen',
    'phosphorus',
  ] as const satisfies readonly FlowType[]) {
    const list = flows.filter(f => f.type === type);
    if (list.length === 0) continue;
    const toProducers = list.filter(f => PRODUCERS.has(group(f.to)));
    const deliverers = sum(toProducers).map(d => ({
      ...d,
      external: isEntry(d.id),
    }));
    const total = toProducers.reduce((a, f) => a + f.weight, 0);
    const outside = toProducers
      .filter(f => isEntry(f.from))
      .reduce((a, f) => a + f.weight, 0);
    nutrients.push({
      type,
      entries: sum(list.filter(f => isEntry(f.from))),
      deliverers: deliverers.slice(0, 6),
      recycledShare: total > 0 ? 1 - outside / total : 0,
    });
  }
  return { energyEntries, hubs, trophic, ladder, nutrients };
}
