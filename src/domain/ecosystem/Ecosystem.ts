import type {
  Control,
  Flow,
  FlowType,
  Habitat,
  Organism,
  OrganismId,
  OpenQuestion,
  Scenario,
  Story,
} from './types';

export interface EcosystemProps {
  id: string;
  name: string;
  habitat: Habitat;
  place: string;
  intro: string;
  /** Overrides for display names of flow types in this ecosystem (for example larvae instead of seeds). */
  flowLabels?: Partial<Record<FlowType, string>>;
  organisms: readonly Organism[];
  flows: readonly Flow[];
  controls: readonly Control[];
  /** The first scenario is the reference state. */
  scenarios: readonly Scenario[];
  stories: readonly Story[];
  questions: readonly OpenQuestion[];
  omitted: string;
  care: { why: string; status: string };
}

export class InvalidEcosystemError extends Error {}

/** Aggregate root. Construction enforces the invariants, so the rest of the code can trust the graph. */
export class Ecosystem {
  readonly id: string;
  readonly name: string;
  readonly habitat: Habitat;
  readonly place: string;
  readonly intro: string;
  readonly flowLabels: Partial<Record<FlowType, string>>;
  readonly organisms: readonly Organism[];
  readonly flows: readonly Flow[];
  readonly controls: readonly Control[];
  readonly scenarios: readonly Scenario[];
  readonly stories: readonly Story[];
  readonly questions: readonly OpenQuestion[];
  readonly omitted: string;
  readonly care: { why: string; status: string };
  private readonly byId: ReadonlyMap<OrganismId, Organism>;

  private constructor(p: EcosystemProps) {
    this.id = p.id;
    this.name = p.name;
    this.habitat = p.habitat;
    this.place = p.place;
    this.intro = p.intro;
    this.flowLabels = p.flowLabels ?? {};
    this.organisms = p.organisms;
    this.flows = p.flows;
    this.controls = p.controls;
    this.scenarios = p.scenarios;
    this.stories = p.stories;
    this.questions = p.questions;
    this.omitted = p.omitted;
    this.care = p.care;
    this.byId = new Map(p.organisms.map(o => [o.id, o]));
  }

  static create(props: EcosystemProps): Ecosystem {
    const fail = (msg: string): never => {
      throw new InvalidEcosystemError(`${props.id}: ${msg}`);
    };
    const ids = new Set<string>();
    for (const o of props.organisms) {
      if (ids.has(o.id)) fail(`duplicate organism ${o.id}`);
      ids.add(o.id);
    }
    const relIds = new Set<string>();
    for (const r of [...props.flows, ...props.controls]) {
      if (!ids.has(r.from) || !ids.has(r.to)) fail(`${r.id} refers to an unknown organism`);
      if (relIds.has(r.id)) fail(`duplicate relationship ${r.id}`);
      relIds.add(r.id);
    }
    if (props.scenarios.length === 0) fail('needs a reference scenario');
    for (const s of props.scenarios) {
      for (const id of Object.keys(s.abundance))
        if (!ids.has(id)) fail(`scenario ${s.id} abundance names unknown organism ${id}`);
      for (const id of Object.keys(s.factors))
        if (!relIds.has(id)) fail(`scenario ${s.id} factor names unknown relationship ${id}`);
      if (s.unknowns.length === 0 && s !== props.scenarios[0])
        fail(`scenario ${s.id} must say what is unknown`);
    }
    for (const q of props.questions)
      for (const id of q.relatedIds) if (!relIds.has(id)) fail(`question names unknown relationship ${id}`);
    for (const st of props.stories)
      for (const id of st.organismIds ?? []) if (!ids.has(id)) fail(`story names unknown organism ${id}`);
    return new Ecosystem(props);
  }

  get reference(): Scenario {
    return this.scenarios[0] as Scenario;
  }

  organism(id: OrganismId): Organism {
    const o = this.byId.get(id);
    if (!o) throw new InvalidEcosystemError(`${this.id}: unknown organism ${id}`);
    return o;
  }

  scenario(id: string | undefined): Scenario {
    return this.scenarios.find(s => s.id === id) ?? this.reference;
  }

  flowTypeName(type: FlowType, fallback: string): string {
    return this.flowLabels[type] ?? fallback;
  }
}
