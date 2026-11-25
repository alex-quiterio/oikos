<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { pointAt } from '@presentation/geometry';
import { typeClass, type RelationType } from '@presentation/format';
import type { EdgeView } from '@presentation/types';

const props = defineProps<{
  edges: readonly EdgeView[];
  running: boolean;
}>();

interface Particle {
  key: string;
  edge: EdgeView;
  type: RelationType;
  radius: number;
  offset: number;
  speed: number;
}

/** One dot per unit of flow weight, visible only for modelled flows that are on screen and in focus. */
const particles = computed<Particle[]>(() =>
  props.edges.flatMap(e => {
    if (
      e.isControl ||
      !e.modelled ||
      !e.visible ||
      e.dim ||
      e.strength < 0.04
    )
      return [];
    const total = Math.ceil(e.weight * 1.3);
    const out: Particle[] = [];
    for (
      let k = 0;
      k < total && k < e.weight * e.strength * 1.3;
      k++
    ) {
      out.push({
        key: `${e.id}#${k}`,
        edge: e,
        type: e.type,
        radius: 2.2 + e.weight * 0.35,
        offset: (k + 0.37 * (k % 3)) / total,
        speed:
          (0.00004 + e.weight * 0.00001) *
          (500 / Math.max(e.geometry.length, 120)),
      });
    }
    return out;
  }),
);

const els = new Map<string, SVGCircleElement>();
const register = (key: string) => (el: unknown) => {
  if (el instanceof SVGCircleElement) els.set(key, el);
  else els.delete(key);
};

let raf = 0;
function frame(t: number): void {
  if (props.running && !document.hidden) {
    for (const p of particles.value) {
      const el = els.get(p.key);
      if (!el) continue;
      const pt = pointAt(
        p.edge.geometry,
        (t * p.speed + p.offset) % 1,
      );
      el.setAttribute('cx', pt.x.toFixed(1));
      el.setAttribute('cy', pt.y.toFixed(1));
    }
  }
  raf = requestAnimationFrame(frame);
}
onMounted(() => {
  raf = requestAnimationFrame(frame);
});
onBeforeUnmount(() => cancelAnimationFrame(raf));
</script>

<template>
  <g v-show="running">
    <circle
      v-for="p in particles"
      :key="p.key"
      :ref="register(p.key)"
      class="particle"
      :class="typeClass(p.type)"
      :r="p.radius"
    />
  </g>
</template>
