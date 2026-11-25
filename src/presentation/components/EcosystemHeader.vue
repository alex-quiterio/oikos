<script setup lang="ts">
import { computed } from 'vue';
import { EVIDENCE_ORDER } from '@presentation/format';
import { useAtlasStore } from '@presentation/stores';

const store = useAtlasStore();
const eco = computed(() => store.ecosystem);
const counts = computed(() =>
  Object.fromEntries(EVIDENCE_ORDER.map(e => [e, eco.value.flows.filter(f => f.evidence === e).length])),
);
const total = computed(() => eco.value.flows.length);
const organisms = computed(() => eco.value.organisms.length);
</script>

<template>
  <section>
    <p class="kicker">{{ eco.habitat }}</p>
    <h1>{{ eco.name }}</h1>
    <p class="place">{{ eco.place }}</p>
    <p class="abstract">{{ eco.intro }}</p>
    <div class="stats">
      <span
        ><b>{{ organisms }}</b> organisms and stores</span
      >
      <span
        ><b>{{ total }}</b> flows, <b>{{ eco.controls.length }}</b> controls</span
      >
      <span class="evbar" title="Share of flows by evidence level">
        <i
          v-for="e in EVIDENCE_ORDER"
          :key="e"
          :class="e"
          :style="{ width: `${((counts[e] ?? 0) / total) * 100}%` }"
        />
      </span>
      <span>
        <b>{{ counts.documented }}</b> documented · <b>{{ counts.likely }}</b> likely ·
        <b>{{ counts.debated }}</b> debated · <b>{{ counts.unknown }}</b> unknown
      </span>
    </div>
  </section>
</template>
