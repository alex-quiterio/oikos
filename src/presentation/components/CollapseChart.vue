<script setup lang="ts">
import { computed } from 'vue';
import { useTweened } from '@presentation/composables';
import type { CollapseStep } from '@domain';
import { useAtlasStore } from '@presentation/stores';

const props = defineProps<{
  steps: readonly CollapseStep[];
  current: number | null;
}>();
const store = useAtlasStore();
const now = computed(() => props.steps[props.current ?? 0]?.health);
const intactNow = useTweened(() => (now.value?.intact ?? 1) * 100);
const meanNow = useTweened(() => now.value?.meanSupply ?? 1);
const belowNow = useTweened(() => now.value?.belowHalf.length ?? 0);

const W = 340;
const H = 200;
const M = { l: 40, r: 12, t: 12, b: 46 };
const n = computed(() => Math.max(props.steps.length - 1, 1));
const x = (k: number): number =>
  M.l + (k / n.value) * (W - M.l - M.r);
const y = (v: number): number => M.t + (1 - v) * (H - M.t - M.b);
const line = (pick: (s: CollapseStep) => number): string =>
  props.steps
    .map((s, k) => `${x(k).toFixed(1)},${y(pick(s)).toFixed(1)}`)
    .join(' ');
const intact = computed(() => line(s => s.health.intact));
const mean = computed(() => line(s => s.health.meanSupply));
const ticks = [0, 0.5, 1];
const labelOf = (k: number): string => {
  const id = props.steps[k]?.removed[k - 1];
  return id ? store.ecosystem.organism(id).name : 'none removed';
};
const biggestDrop = computed(() => {
  let best = { k: 0, drop: 0 };
  for (let k = 1; k < props.steps.length; k++) {
    const drop =
      (props.steps[k - 1]?.health.intact ?? 0) -
      (props.steps[k]?.health.intact ?? 0);
    if (drop > best.drop) best = { k, drop };
  }
  return best;
});
</script>

<template>
  <figure class="collapse">
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      role="img"
      aria-label="Share of the web that stays intact as organisms are removed, most depended-on first"
    >
      <g v-for="t in ticks" :key="t">
        <line
          :x1="M.l"
          :x2="W - M.r"
          :y1="y(t)"
          :y2="y(t)"
          class="grid"
        />
        <text :x="M.l - 6" :y="y(t) + 4" class="axis end">
          {{ Math.round(t * 100) }}%
        </text>
      </g>
      <polyline :points="mean" class="mean" />
      <polyline :points="intact" class="intact" />
      <g v-for="(s, k) in steps" :key="k">
        <text
          v-if="k % 2 === 0 || steps.length < 8"
          :x="x(k)"
          :y="H - M.b + 16"
          class="axis mid"
        >
          {{ k }}
        </text>
        <circle
          :cx="x(k)"
          :cy="y(s.health.intact)"
          :r="current === k ? 6 : 4"
          class="pt"
          :class="{ on: current === k }"
          tabindex="0"
          role="button"
          :aria-label="`Remove ${k} organisms: ${Math.round(s.health.intact * 100)}% intact. Last removed: ${labelOf(k)}`"
          @click="store.setCollapseStep(k)"
          @keydown.enter.prevent="store.setCollapseStep(k)"
        >
          <title>
            {{ k }} removed, last: {{ labelOf(k) }}.
            {{ Math.round(s.health.intact * 100) }}% intact
          </title>
        </circle>
      </g>
      <text :x="(M.l + W - M.r) / 2" :y="H - 8" class="axis mid">
        organisms removed, most depended-on first
      </text>
    </svg>
    <figcaption>
      <span class="key"><i class="k-intact" />share intact</span>
      <span class="key"><i class="k-mean" />mean supply index</span>
    </figcaption>
    <div v-if="now" class="steprow" aria-live="polite">
      <div>
        <b>{{ Math.round(intactNow) }}%</b><small>share intact</small>
      </div>
      <div>
        <b>{{ meanNow.toFixed(2) }}</b><small>mean supply</small>
      </div>
      <div>
        <b>{{ Math.round(belowNow) }} / {{ now.total }}</b
        ><small>below half</small>
      </div>
    </div>
    <button
      class="play"
      :aria-pressed="store.collapsePlaying"
      @click="
        store.collapsePlaying
          ? store.stopCollapse()
          : store.playCollapse()
      "
    >
      {{ store.collapsePlaying ? 'Pause' : '▶ Play the collapse' }}
    </button>
    <label class="slider">
      <span class="sm">Remove the top</span>
      <input
        type="range"
        min="0"
        :max="steps.length - 1"
        step="1"
        :value="current ?? 0"
        :aria-valuetext="
          current === null
            ? 'removed by hand'
            : `${current} organisms removed`
        "
        @input="
          store.setCollapseStep(
            +($event.target as HTMLInputElement).value,
          )
        "
      />
      <b>{{ current ?? '·' }}</b>
    </label>
    <p v-if="biggestDrop.drop > 0" class="sm">
      Largest single drop: removing {{ labelOf(biggestDrop.k) }} takes
      {{ Math.round(biggestDrop.drop * 100) }} points off the share
      intact.
    </p>
  </figure>
</template>
