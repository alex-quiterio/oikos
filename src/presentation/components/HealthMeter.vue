<script setup lang="ts">
import { computed } from 'vue';
import { STRESS_LABELS, STRESS_ORDER } from '@domain';
import { useTweened } from '@presentation/composables';
import { useAtlasStore } from '@presentation/stores';

const store = useAtlasStore();
const pct = useTweened(() => store.health.intact * 100);
const mean = useTweened(() => store.health.meanSupply);
const below = useTweened(() => store.health.belowHalf.length);
const level = computed(() => {
  const worst = Math.min(
    store.health.intact,
    store.health.meanSupply,
  );
  return worst >= 0.85
    ? 'good'
    : worst >= 0.6
      ? 'strained'
      : 'failing';
});
const words = {
  good: 'holding',
  strained: 'under strain',
  failing: 'failing',
} as const;
const change = computed(() => Math.round(store.healthChange));
const fromReference = computed(() =>
  Math.round(100 - store.health.intact * 100),
);
const total = computed(() => store.health.total);
const segments = computed(() =>
  STRESS_ORDER.map(level => ({
    level,
    n: store.health.byStress[level],
  })),
);
const names = computed(() =>
  store.health.belowHalf
    .map(id => store.ecosystem.organism(id).name)
    .join(', '),
);

const W = 150;
const H = 36;
const spark = computed(() => {
  const t = store.trail;
  if (t.length < 2) return null;
  const x = (i: number): number => (i / (t.length - 1)) * (W - 8) + 4;
  const y = (v: number): number => 4 + (1 - v) * (H - 8);
  return {
    line: t
      .map((p, i) => `${x(i).toFixed(1)},${y(p.intact).toFixed(1)}`)
      .join(' '),
    last: { x: x(t.length - 1), y: y(t[t.length - 1]!.intact) },
  };
});
</script>

<template>
  <section class="health" :class="level" aria-label="System health">
    <div class="health-top">
      <div class="health-nums">
        <span class="lab">System health</span>
        <b class="big">{{ Math.round(pct) }}%</b>
        <span class="health-word">{{ words[level] }}</span>
        <span
          v-if="change !== 0"
          class="health-delta"
          :class="change < 0 ? 'down' : 'up'"
        >
          {{ change < 0 ? '▼' : '▲' }} {{ Math.abs(change) }} points
          since the last change
        </span>
        <span v-if="fromReference > 0" class="stat">
          <b>{{ fromReference }}</b> points below the reference state
        </span>
        <span class="stat">
          mean supply <b>{{ mean.toFixed(2) }}</b>
        </span>
        <span class="stat">
          <b>{{ Math.round(below) }}</b> of {{ total }} below half
        </span>
      </div>
      <svg
        v-if="spark"
        class="spark"
        :viewBox="`0 0 ${W} ${H}`"
        role="img"
        aria-label="Trend of the share intact over your recent changes"
      >
        <line class="base" x1="4" :x2="W - 4" y1="4" y2="4" />
        <polyline :points="spark.line" />
        <circle :cx="spark.last.x" :cy="spark.last.y" r="3.5" />
      </svg>
    </div>
    <div
      class="stackbar"
      role="meter"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(pct)"
      aria-label="Share of organisms at or above half their reference supply"
    >
      <i
        v-for="seg in segments"
        :key="seg.level"
        :class="`s-${seg.level}`"
        :style="{ width: `${(seg.n / total) * 100}%` }"
        :title="`${seg.n} ${STRESS_LABELS[seg.level]}`"
      />
    </div>
    <div class="stress-chips">
      <span
        v-for="seg in segments"
        :key="seg.level"
        :class="[`s-${seg.level}`, { zero: seg.n === 0 }]"
      >
        <i /><b>{{ seg.n }}</b> {{ STRESS_LABELS[seg.level] }}
      </span>
    </div>
    <p v-if="store.health.belowHalf.length" class="health-note">
      Below half of reference supply: {{ names }}.
    </p>
  </section>
</template>
