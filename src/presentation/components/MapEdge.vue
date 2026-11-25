<script setup lang="ts">
import { computed } from 'vue';
import { typeClass } from '@presentation/format';
import { useAtlasStore } from '@presentation/stores';
import type { EdgeView } from '@presentation/types';

const props = defineProps<{ edge: EdgeView }>();
const store = useAtlasStore();
const width = (w: number): number => 0.9 + w * 0.85;
const live = computed(() => props.edge.isControl || props.edge.strength >= 0.04);
const lineWidth = computed(() => {
  const e = props.edge;
  if (e.isControl) return e.active > 0.05 ? 1.5 + Math.min(e.active, 2) * 2.5 : e.weight;
  return width(Math.min(e.weight * e.strength, 6));
});
const questionMark = computed(() => props.edge.evidence === 'debated' || props.edge.evidence === 'unknown');
</script>

<template>
  <g
    v-show="edge.visible"
    class="edge"
    :class="[
      typeClass(edge.type),
      `c-${edge.evidence}`,
      {
        ctl: edge.isControl,
        dim: edge.dim,
        hot: edge.hot && edge.focused,
        act: edge.active > 0.05,
        hover: store.hoveredId === edge.id,
      },
    ]"
  >
    <path v-if="edge.shadow" class="ghost" :d="edge.geometry.d" :stroke-width="width(edge.weight)" />
    <path
      v-show="live"
      class="line"
      :d="edge.geometry.d"
      :stroke-width="lineWidth"
      :marker-end="`url(#ar-${edge.type})`"
    />
    <path
      class="hit"
      :d="edge.geometry.d"
      @pointerenter="store.hover(edge.id)"
      @pointerleave="store.hover(null)"
      @click.stop="store.hover(edge.id)"
    />
    <text v-if="questionMark && live" class="qm" :x="edge.geometry.mid.x" :y="edge.geometry.mid.y + 6"
      >?</text
    >
  </g>
</template>
