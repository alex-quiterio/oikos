import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import {
  isModelled,
  stressOf,
  type Control,
  type Evidence,
  type Flow,
  type OrganismId,
  type Story,
} from '@domain';
import type { AtlasEntry } from '@application';
import {
  EVIDENCE_ORDER,
  type RelationType,
} from '@presentation/format';
import { layoutEdges } from '@presentation/geometry';
import type {
  EdgeView,
  NodeView,
  PanelTab,
} from '@presentation/types';
import { atlasService } from './service';

export interface StoryView extends Story {
  readonly kind: 'story' | 'questions';
}

const isControl = (r: Flow | Control): r is Control => 'kind' in r;

/**
 * UI state for the atlas, and the view models derived from it. All ecological logic stays in the domain
 * and application layers. This store only decides what is selected, filtered and highlighted.
 */
export const useAtlasStore = defineStore('atlas', () => {
  const service = atlasService();
  const entries = service.entries();

  // --- state
  const ecosystemId = ref(entries[0]?.ecosystem.id ?? '');
  const scenarioId = ref(entries[0]?.ecosystem.reference.id ?? '');
  const selectedId = ref<OrganismId | null>(null);
  const storyIndex = ref(0);
  const tab = ref<PanelTab>('inspect');
  const lens = ref(false);
  const showUnknown = ref(true);
  const motion = ref(
    !globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')
      .matches,
  );
  const hiddenTypes = ref<RelationType[]>([]);
  const removed = ref<OrganismId[]>([]);
  const focusIds = ref<string[] | null>(null);
  const evidenceFilter = ref<Evidence[]>([...EVIDENCE_ORDER]);
  const hoveredId = ref<string | null>(null);

  // --- domain lookups
  const entry = computed<AtlasEntry>(() =>
    service.entry(ecosystemId.value),
  );
  const ecosystem = computed(() => entry.value.ecosystem);
  const layout = computed(() => entry.value.layout);
  const scenario = computed(() =>
    ecosystem.value.scenario(scenarioId.value),
  );
  const isReference = computed(
    () =>
      scenario.value.id === ecosystem.value.reference.id &&
      removed.value.length === 0,
  );
  const removedSet = computed(() => new Set(removed.value));

  const stories = computed<StoryView[]>(() => [
    ...ecosystem.value.stories.map(s => ({
      ...s,
      kind: 'story' as const,
    })),
    {
      title: 'Open questions',
      text: 'Flows we suspect, argue about, or cannot yet measure. They are drawn dashed or dotted and stay out of the scenario arithmetic.',
      organismIds: null,
      kind: 'questions' as const,
    },
  ]);
  const story = computed(
    () =>
      stories.value[storyIndex.value] ??
      (stories.value[0] as StoryView),
  );

  // --- simulation
  const simulation = computed(() =>
    service.simulate(
      ecosystem.value,
      scenario.value,
      removedSet.value,
    ),
  );
  const health = computed(() =>
    service.health(ecosystem.value, simulation.value),
  );
  /** Recent health readings, oldest first, so the page can show the numbers falling as you act. */
  const trail = ref<{ intact: number; mean: number }[]>([]);
  watch(
    health,
    h => {
      const last = trail.value[trail.value.length - 1];
      if (
        last &&
        last.intact === h.intact &&
        last.mean === h.meanSupply
      )
        return;
      trail.value = [
        ...trail.value.slice(-39),
        { intact: h.intact, mean: h.meanSupply },
      ];
    },
    { immediate: true, flush: 'sync' },
  );
  /** Change in the share intact since the previous reading, in points. */
  const healthChange = computed(() => {
    const t = trail.value;
    return t.length < 2
      ? 0
      : (t[t.length - 1]!.intact - t[t.length - 2]!.intact) * 100;
  });
  const collapsePlaying = ref(false);
  let timer: ReturnType<typeof setInterval> | undefined;
  const collapse = computed(() =>
    tab.value === 'keystones'
      ? service.collapse(ecosystem.value, scenario.value)
      : null,
  );
  /** How many organisms of the collapse sequence are removed right now, or null when the removals are by hand. */
  const collapseStep = computed<number | null>(() => {
    const steps = collapse.value;
    if (!steps) return null;
    const k = removed.value.length;
    const match = steps[k];
    if (!match) return null;
    const want = new Set(match.removed);
    return removed.value.every(id => want.has(id)) ? k : null;
  });
  const keystones = computed(() =>
    lens.value || tab.value === 'keystones'
      ? service.keystones(ecosystem.value, scenario.value)
      : null,
  );

  // --- geometry is fixed per ecosystem
  const relationships = computed(() => [
    ...ecosystem.value.flows,
    ...ecosystem.value.controls,
  ]);
  const geometry = computed(() =>
    layoutEdges(layout.value, relationships.value),
  );

  // --- view models
  const edgeViews = computed<EdgeView[]>(() => {
    const sim = simulation.value;
    const sel = selectedId.value;
    const focus = focusIds.value ? new Set(focusIds.value) : null;
    const spot = story.value.organismIds
      ? new Set(story.value.organismIds)
      : null;
    const hidden = new Set(hiddenTypes.value);
    const gone = removedSet.value;
    const ref0 = isReference.value;
    return relationships.value.flatMap(r => {
      const geo = geometry.value[r.id];
      if (!geo) return [];
      const control = isControl(r);
      const type: RelationType = control ? 'ctl' : r.type;
      const modelled = isModelled(r.evidence);
      const visible =
        !hidden.has(type) &&
        (showUnknown.value || modelled) &&
        !gone.has(r.from) &&
        !gone.has(r.to);
      let hot = true;
      if (sel) hot = r.from === sel || r.to === sel;
      else if (focus) hot = focus.has(r.id);
      else if (story.value.kind === 'questions') hot = !modelled;
      else if (spot) hot = spot.has(r.from) && spot.has(r.to);
      const focused = !!(
        sel ||
        focus ||
        story.value.kind === 'questions' ||
        spot
      );
      const strength = control ? 1 : (sim.flowStrength[r.id] ?? 1);
      return [
        {
          id: r.id,
          from: r.from,
          to: r.to,
          type,
          isControl: control,
          kind: control ? r.kind : undefined,
          evidence: r.evidence,
          modelled,
          label: r.label,
          note: r.note,
          weight: control ? 0.6 + r.strength * 1.1 : r.weight,
          strength,
          active: control ? (sim.controlActivity[r.id] ?? 0) : 0,
          visible,
          hot,
          dim: !hot,
          focused,
          shadow: !ref0 && !control && Math.abs(strength - 1) > 0.05,
          geometry: geo,
        },
      ];
    });
  });

  const nodeViews = computed<NodeView[]>(() => {
    const sim = simulation.value;
    const views = edgeViews.value;
    const maxImpact = Math.max(
      ...(keystones.value?.ranking.map(r => r.impact) ?? [0]),
      0.001,
    );
    const impact = new Map(
      (keystones.value?.ranking ?? []).map(r => [r.id, r.impact]),
    );
    const focus = focusIds.value ? new Set(focusIds.value) : null;
    const spot = story.value.organismIds
      ? new Set(story.value.organismIds)
      : null;
    const near = new Set<string>();
    if (selectedId.value)
      for (const e of views)
        if (e.visible && e.hot) {
          near.add(e.from);
          near.add(e.to);
        }
    const touchedByFocus = new Set<string>();
    if (focus)
      for (const e of views)
        if (focus.has(e.id)) {
          touchedByFocus.add(e.from);
          touchedByFocus.add(e.to);
        }
    const touchedByUnknown = new Set<string>();
    for (const e of views)
      if (!e.modelled) {
        touchedByUnknown.add(e.from);
        touchedByUnknown.add(e.to);
      }
    const ref0 = isReference.value;
    return ecosystem.value.organisms.flatMap(o => {
      const pos = layout.value.nodes[o.id];
      if (!pos) return [];
      const supply = sim.supply[o.id] ?? 1;
      const gone = removedSet.value.has(o.id);
      let dim = false;
      if (selectedId.value)
        dim = o.id !== selectedId.value && !near.has(o.id);
      else if (focus) dim = !touchedByFocus.has(o.id);
      else if (story.value.kind === 'questions')
        dim = !touchedByUnknown.has(o.id);
      else if (spot) dim = !spot.has(o.id);
      return [
        {
          id: o.id,
          name: o.name,
          group: o.group,
          layout: pos,
          supply,
          delta:
            !ref0 && !gone && Math.abs(supply - 1) >= 0.05
              ? `${supply < 1 ? '▼' : '▲'} ${Math.abs(Math.round((supply - 1) * 100))}%`
              : '',
          removed: gone,
          low: !gone && supply < 0.6,
          stress: gone ? 'lost' : stressOf(supply),
          dim: dim && !gone,
          selected: selectedId.value === o.id,
          ring: lens.value
            ? 0.1 + (0.9 * (impact.get(o.id) ?? 0)) / maxImpact
            : 0,
          claim: o.claim,
          claimStatus: o.claim?.status,
        },
      ];
    });
  });

  const hoveredEdge = computed(
    () => edgeViews.value.find(e => e.id === hoveredId.value) ?? null,
  );

  // --- actions
  function clearFocus(): void {
    focusIds.value = null;
  }
  function showEcosystem(id: string, scenario?: string): void {
    const e = service.entry(id).ecosystem;
    ecosystemId.value = e.id;
    scenarioId.value = e.scenario(scenario).id;
    selectedId.value = null;
    storyIndex.value = 0;
    tab.value = 'inspect';
    removed.value = [];
    focusIds.value = null;
    hiddenTypes.value = [];
    stopCollapse();
    trail.value = [];
    trail.value = [
      { intact: health.value.intact, mean: health.value.meanSupply },
    ];
  }
  function showScenario(id: string): void {
    scenarioId.value = ecosystem.value.scenario(id).id;
    selectedId.value = null;
    focusIds.value = null;
    removed.value = [];
    if (scenarioId.value !== ecosystem.value.reference.id)
      tab.value = 'scenario';
  }
  function select(id: OrganismId | null): void {
    selectedId.value = id;
    focusIds.value = null;
    if (id) {
      storyIndex.value = 0;
      tab.value = 'inspect';
    }
  }
  function showStory(i: number): void {
    storyIndex.value = i;
    selectedId.value = null;
    focusIds.value = null;
    tab.value = 'inspect';
  }
  function focusOn(ids: readonly string[]): void {
    focusIds.value = [...ids];
    selectedId.value = null;
  }
  function toggleRemoved(id: OrganismId): void {
    removed.value = removed.value.includes(id)
      ? removed.value.filter(x => x !== id)
      : [...removed.value, id];
  }
  function setCollapseStep(k: number): void {
    const step = collapse.value?.[k];
    if (!step) return;
    removed.value = [...step.removed];
    selectedId.value = null;
  }
  function stopCollapse(): void {
    if (timer) clearInterval(timer);
    timer = undefined;
    collapsePlaying.value = false;
  }
  /** Step through the collapse sequence on a timer so the numbers can be watched falling. */
  function playCollapse(intervalMs = 900): void {
    const steps = collapse.value;
    if (!steps) return;
    stopCollapse();
    let k = 0;
    setCollapseStep(0);
    collapsePlaying.value = true;
    timer = setInterval(() => {
      k += 1;
      if (k >= steps.length) return stopCollapse();
      setCollapseStep(k);
    }, intervalMs);
  }
  function testRemoval(id: OrganismId): void {
    removed.value = removed.value.includes(id) ? [] : [id];
    selectedId.value = null;
  }
  const restoreAll = (): void => {
    stopCollapse();
    removed.value = [];
  };
  function toggleType(t: RelationType): void {
    hiddenTypes.value = hiddenTypes.value.includes(t)
      ? hiddenTypes.value.filter(x => x !== t)
      : [...hiddenTypes.value, t];
  }
  function toggleEvidence(e: Evidence): void {
    evidenceFilter.value = evidenceFilter.value.includes(e)
      ? evidenceFilter.value.filter(x => x !== e)
      : [...evidenceFilter.value, e];
  }
  const setTab = (t: PanelTab): void => {
    tab.value = t;
  };
  const toggleLens = (): void => {
    lens.value = !lens.value;
  };
  const toggleMotion = (): void => {
    motion.value = !motion.value;
  };
  const toggleUnknown = (): void => {
    showUnknown.value = !showUnknown.value;
  };
  const hover = (id: string | null): void => {
    hoveredId.value = id;
  };

  return {
    entries,
    ecosystemId,
    scenarioId,
    selectedId,
    storyIndex,
    tab,
    lens,
    showUnknown,
    motion,
    hiddenTypes,
    removed,
    focusIds,
    evidenceFilter,
    hoveredId,
    entry,
    ecosystem,
    layout,
    scenario,
    isReference,
    stories,
    story,
    simulation,
    health,
    collapse,
    collapseStep,
    trail,
    healthChange,
    collapsePlaying,
    playCollapse,
    stopCollapse,
    keystones,
    edgeViews,
    nodeViews,
    hoveredEdge,
    showEcosystem,
    showScenario,
    select,
    showStory,
    focusOn,
    clearFocus,
    toggleRemoved,
    testRemoval,
    setCollapseStep,
    restoreAll,
    toggleType,
    toggleEvidence,
    setTab,
    toggleLens,
    toggleMotion,
    toggleUnknown,
    hover,
  };
});
