<script setup lang="ts">
import { computed } from 'vue';
import { FLOW_TYPES, typeClass, type RelationType } from '@presentation/format';
import { useAtlasStore } from '@presentation/stores';
import FlowParticles from './FlowParticles.vue';
import MapEdge from './MapEdge.vue';
import MapNode from './MapNode.vue';

const store = useAtlasStore();
const layout = computed(() => store.entry.layout);
const types = Object.keys(FLOW_TYPES) as RelationType[];
const water = computed(() => (layout.value.sky === 'water' ? 'var(--water)' : 'var(--land)'));
const clearAll = (): void => {
  store.clearFocus();
  store.select(null);
};
</script>

<template>
  <div class="mapwrap" :style="{ '--sky': water }">
    <svg
      id="map"
      :class="{ lens: store.lens }"
      :viewBox="`0 0 ${layout.width} ${layout.height}`"
      role="img"
      :aria-label="`Flow map of ${store.ecosystem.name}`"
      @click="clearAll"
    >
      <defs>
        <marker
          v-for="t in types"
          :id="`ar-${t}`"
          :key="t"
          viewBox="0 0 10 10"
          :refX="t === 'ctl' ? 5 : 8"
          refY="5"
          markerWidth="9"
          markerHeight="9"
          markerUnits="userSpaceOnUse"
          orient="auto"
        >
          <path class="mk" :class="typeClass(t)" :d="t === 'ctl' ? 'M4 0 H7 V10 H4 z' : 'M0 1 L9 5 L0 9 z'" />
        </marker>
      </defs>
      <rect x="0" y="0" :width="layout.width" :height="layout.height" :fill="water" />
      <path
        v-for="(b, i) in layout.bands"
        :key="`b${i}`"
        :d="b.d"
        :fill="`var(--${b.fill})`"
        :opacity="b.opacity ?? 1"
      />
      <path
        v-for="(d, i) in layout.lines"
        :key="`l${i}`"
        :d="d"
        fill="none"
        stroke="var(--ink)"
        stroke-opacity="0.35"
        stroke-width="1.5"
      />
      <text v-for="l in layout.labels" :key="l[0]" class="zone-label" :x="l[1]" :y="l[2]">{{ l[0] }}</text>
      <g>
        <MapEdge v-for="e in store.edgeViews" :key="e.id" :edge="e" />
      </g>
      <FlowParticles :edges="store.edgeViews" :running="store.motion" />
      <g>
        <MapNode v-for="n in store.nodeViews" :key="n.id" :node="n" :reference="store.isReference" />
      </g>
    </svg>
  </div>
</template>
