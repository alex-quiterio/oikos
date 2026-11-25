<script setup lang="ts">
import { computed } from 'vue';
import { FLOW_TYPES, GROUP_NAMES } from '@presentation/format';
import { useAtlasStore } from '@presentation/stores';
import FlowMap from './FlowMap.vue';

const store = useAtlasStore();
const flowNames = computed(() =>
  [
    ...new Set(
      store.ecosystem.flows.map(
        f =>
          store.ecosystem.flowLabels[f.type] ??
          FLOW_TYPES[f.type].name,
      ),
    ),
  ]
    .map(n => n.toLowerCase())
    .reduce(
      (text, n, i, all) =>
        i === 0
          ? n
          : `${text}${i === all.length - 1 ? ' and ' : ', '}${n}`,
      '',
    ),
);
const groups = computed(() => {
  const present = new Set(
    store.ecosystem.organisms.map(o => o.group),
  );
  return (
    Object.keys(GROUP_NAMES) as (keyof typeof GROUP_NAMES)[]
  ).filter(g => g !== 'store' && present.has(g));
});
const edge = computed(() => store.hoveredEdge);
const eco = computed(() => store.ecosystem);
const kindText = computed(() => {
  const e = edge.value;
  if (!e) return '';
  if (!e.isControl)
    return (
      eco.value.flowLabels[e.type as 'energy'] ??
      FLOW_TYPES[e.type].name
    ).toLowerCase();
  if (e.kind === 'release')
    return 'control: when the first falls, the second rises';
  if (e.kind === 'balance')
    return 'control: the second rises when the first falls and falls when it rises';
  return 'control: when the first rises, the second is pressed down';
});
</script>

<template>
  <figure>
    <FlowMap />
    <figcaption>
      <b>Figure 1.</b> Flows of {{ flowNames }} in the {{ eco.name }}.
      Line weight is a relative guess for comparison, line style shows
      evidence, and a grey shadow shows the reference state.
      <b>Scenario: {{ store.scenario.name }}.</b>
    </figcaption>
    <p class="readout" aria-live="polite">
      <template v-if="edge">
        <b
          >{{ eco.organism(edge.from).name }} →
          {{ eco.organism(edge.to).name }}</b
        >
        · {{ kindText }} · {{ edge.label }} ·
        <b>{{ edge.evidence }}</b>
        <template v-if="edge.note"><br />{{ edge.note }}</template>
      </template>
      <template v-else
        >Hover or tap a flow to read it. Click an organism to follow
        what it takes in and gives out.</template
      >
    </p>
    <div class="legend" aria-hidden="true">
      <span v-for="g in groups" :key="g"
        ><i :style="{ background: `var(--${g})` }" />{{
          GROUP_NAMES[g].toLowerCase()
        }}</span
      >
      <span
        ><i class="sq" style="background: var(--store)" />store or
        source</span
      >
      <span>◆ documented ◇ proposed ? contested keystone (lens)</span>
    </div>
    <div class="legend" aria-hidden="true">
      <span
        ><svg width="34" height="8">
          <line
            x1="1"
            y1="4"
            x2="33"
            y2="4"
            stroke="var(--ink)"
            stroke-width="3"
            stroke-linecap="round"
          /></svg
        >documented</span
      >
      <span
        ><svg width="34" height="8">
          <line
            x1="1"
            y1="4"
            x2="33"
            y2="4"
            stroke="var(--ink)"
            stroke-width="3"
            stroke-linecap="round"
            opacity=".5"
          /></svg
        >likely</span
      >
      <span
        ><svg width="34" height="8">
          <line
            x1="1"
            y1="4"
            x2="33"
            y2="4"
            stroke="var(--ink)"
            stroke-width="3"
            stroke-dasharray="10 6"
          /></svg
        >debated</span
      >
      <span
        ><svg width="34" height="8">
          <line
            x1="1"
            y1="4"
            x2="33"
            y2="4"
            stroke="var(--ink)"
            stroke-width="3"
            stroke-dasharray="2 7"
            stroke-linecap="round"
          /></svg
        >unknown</span
      >
      <span
        ><svg width="34" height="12">
          <line
            x1="1"
            y1="6"
            x2="33"
            y2="6"
            stroke="var(--ink)"
            stroke-width="7"
            opacity=".14"
            stroke-linecap="round"
          />
          <line
            x1="1"
            y1="6"
            x2="33"
            y2="6"
            stroke="var(--ink)"
            stroke-width="2.5"
            stroke-linecap="round"
          /></svg
        >shadow: reference state</span
      >
      <span
        ><svg width="38" height="12">
          <line
            x1="1"
            y1="6"
            x2="30"
            y2="6"
            stroke="var(--ctl)"
            stroke-width="2"
            stroke-dasharray="7 5"
          />
          <rect
            x="31"
            y="1"
            width="3"
            height="10"
            fill="var(--ctl)"
          /></svg
        >control, not a flow</span
      >
    </div>
    <div class="legend stresskey" aria-hidden="true">
      <span class="lab">Supply</span>
      <span class="s-ok"
        ><i style="background: var(--sc)" />holding</span
      >
      <span class="s-mild"
        ><i style="background: var(--sc)" />mild stress</span
      >
      <span class="s-high"
        ><i style="background: var(--sc)" />high stress</span
      >
      <span class="s-severe"
        ><i style="background: var(--sc)" />severe stress</span
      >
      <span class="s-lost"
        ><i style="background: var(--sc)" />lost</span
      >
      <span class="s-surge"
        ><i style="background: var(--sc)" />surging</span
      >
    </div>
  </figure>
</template>
