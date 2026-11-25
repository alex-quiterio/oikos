import type {
  Control,
  Ecosystem,
  Evidence,
  Flow,
  FlowType,
  OrganismId,
} from '@domain/ecosystem';

/**
 * Scenario model. Each organism has a supply index, 1 in the reference state.
 *  - Inputs: for each flow type an organism receives, the index is the inflow from documented and likely
 *    flows, scaled by each source's own index and any scenario factor, over the reference inflow.
 *    The weakest type sets the limit.
 *  - Release: when a predator's index falls, its prey rises.
 *  - Pressure: when a consumer or competitor rises above 1, the thing it presses on falls.
 * Debated and unknown relationships never enter the arithmetic.
 *
 * Stores (litter, detritus) buffer: they pass on only part of a change in their inflow in the short run.
 * Without this, tightly coupled recycling loops amplify small losses into total collapse.
 *
 * Seed, spore and larval flows do not limit standing organisms: an adult oak does not die because a jay is
 * missing. They are reported separately as a recruitment index, which acts over years.
 *
 * The result shows direction and exposure. It is not a biomass or population model.
 */

export interface Intervention {
  readonly abundance?: Readonly<Record<OrganismId, number>>;
  readonly factors?: Readonly<Record<string, number>>;
  readonly removed?: ReadonlySet<OrganismId>;
}

export interface Simulation {
  /** Supply index per organism. 1 is the reference state. */
  readonly supply: Readonly<Record<OrganismId, number>>;
  /** Seed, spore or larval supply relative to the reference state, for organisms that receive any. Acts over years. */
  readonly recruitment: Readonly<Record<OrganismId, number>>;
  /** Effective weight of each flow. */
  readonly flowStrength: Readonly<Record<string, number>>;
  /** How strongly each control is acting, 0 when idle. */
  readonly controlActivity: Readonly<Record<string, number>>;
}

/** Share of a change in inflow that a store passes on. A modelling convention, not a measured quantity. */
export const STORE_RESPONSE = 0.4;

export const isModelled = (e: Evidence): boolean =>
  e === 'documented' || e === 'likely';

interface Network {
  readonly ids: readonly OrganismId[];
  readonly stores: ReadonlySet<OrganismId>;
  readonly reference: ReadonlyMap<
    OrganismId,
    ReadonlyMap<FlowType, number>
  >;
  readonly inflows: ReadonlyMap<OrganismId, readonly Flow[]>;
  readonly releases: ReadonlyMap<OrganismId, readonly Control[]>;
  readonly pressures: ReadonlyMap<OrganismId, readonly Control[]>;
}

const networks = new WeakMap<Ecosystem, Network>();

function networkOf(eco: Ecosystem): Network {
  const cached = networks.get(eco);
  if (cached) return cached;
  const ids = eco.organisms.map(o => o.id);
  const reference = new Map<OrganismId, Map<FlowType, number>>();
  const inflows = new Map<OrganismId, Flow[]>(
    ids.map(id => [id, []]),
  );
  const releases = new Map<OrganismId, Control[]>(
    ids.map(id => [id, []]),
  );
  const pressures = new Map<OrganismId, Control[]>(
    ids.map(id => [id, []]),
  );
  for (const f of eco.flows) {
    if (!isModelled(f.evidence)) continue;
    const per = reference.get(f.to) ?? new Map<FlowType, number>();
    per.set(f.type, (per.get(f.type) ?? 0) + f.weight);
    reference.set(f.to, per);
    inflows.get(f.to)?.push(f);
  }
  for (const c of eco.controls) {
    if (!isModelled(c.evidence)) continue;
    (c.kind === 'release' ? releases : pressures).get(c.to)?.push(c);
  }
  const stores = new Set(
    eco.organisms.filter(o => o.group === 'store').map(o => o.id),
  );
  const net = {
    ids,
    stores,
    reference,
    inflows,
    releases,
    pressures,
  };
  networks.set(eco, net);
  return net;
}

export function simulate(
  eco: Ecosystem,
  iv: Intervention = {},
): Simulation {
  const net = networkOf(eco);
  const removed = iv.removed ?? new Set<OrganismId>();
  const factor = (id: string): number => iv.factors?.[id] ?? 1;
  const base: Record<OrganismId, number> = {};
  for (const id of net.ids)
    base[id] = removed.has(id) ? 0 : (iv.abundance?.[id] ?? 1);
  let cur: Record<OrganismId, number> = { ...base };
  const at = (id: OrganismId): number => cur[id] ?? 0;

  for (let it = 0; it < 200; it++) {
    const next: Record<OrganismId, number> = {};
    let delta = 0;
    for (const id of net.ids) {
      let limit = 1;
      const ref = net.reference.get(id);
      if (ref) {
        const sums = new Map<FlowType, number>();
        for (const f of net.inflows.get(id) ?? [])
          sums.set(
            f.type,
            (sums.get(f.type) ?? 0) +
              f.weight * factor(f.id) * at(f.from),
          );
        for (const [type, total] of ref) {
          if (type === 'seeds') continue;
          limit = Math.min(
            limit,
            Math.min(1, (sums.get(type) ?? 0) / total),
          );
        }
      }
      let release = 1;
      for (const c of net.releases.get(id) ?? [])
        release +=
          c.strength * factor(c.id) * (1 - Math.min(at(c.from), 1));
      let pressure = 0;
      for (const c of net.pressures.get(id) ?? [])
        pressure +=
          c.strength * factor(c.id) * Math.max(0, at(c.from) - 1);
      const raw = Math.min(
        3,
        ((base[id] ?? 0) * limit * Math.min(release, 3)) /
          (1 + pressure),
      );
      const target =
        net.stores.has(id) && (base[id] ?? 0) > 0
          ? 1 - (1 - raw) * STORE_RESPONSE
          : raw;
      next[id] = 0.5 * at(id) + 0.5 * target;
      delta += Math.abs((next[id] ?? 0) - at(id));
    }
    cur = next;
    if (delta < 1e-7) break;
  }

  const flowStrength: Record<string, number> = {};
  for (const f of eco.flows)
    flowStrength[f.id] =
      factor(f.id) * at(f.from) * Math.max(1, at(f.to));
  const controlActivity: Record<string, number> = {};
  for (const c of eco.controls) {
    controlActivity[c.id] =
      c.kind === 'release'
        ? c.strength * factor(c.id) * (1 - Math.min(at(c.from), 1))
        : c.strength * factor(c.id) * Math.max(0, at(c.from) - 1);
  }
  const recruitment: Record<OrganismId, number> = {};
  for (const [id, ref] of net.reference) {
    const total = ref.get('seeds');
    if (!total) continue;
    let sum = 0;
    for (const f of net.inflows.get(id) ?? [])
      if (f.type === 'seeds')
        sum += f.weight * factor(f.id) * at(f.from);
    recruitment[id] = Math.min(1, sum / total);
  }
  return { supply: cur, recruitment, flowStrength, controlActivity };
}

/** Organisms that receive at least one modelled flow. Stores and sources are excluded. */
export function modelledOrganisms(eco: Ecosystem): OrganismId[] {
  const net = networkOf(eco);
  return eco.organisms
    .filter(o => o.group !== 'store' && net.reference.has(o.id))
    .map(o => o.id);
}
