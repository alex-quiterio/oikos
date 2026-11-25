<script setup lang="ts">
import { computed } from 'vue';
import { percentChange } from '@presentation/format';
import { useAtlasStore } from '@presentation/stores';
import EvidenceBadge from './EvidenceBadge.vue';

const store = useAtlasStore();
const sc = computed(() => store.scenario);
const isRef = computed(() => sc.value.id === store.ecosystem.reference.id);
const affected = computed(() =>
  store.nodeViews
    .filter(n => !n.removed && Math.abs(n.supply - 1) >= 0.05)
    .sort((a, b) => Math.abs(b.supply - 1) - Math.abs(a.supply - 1))
    .slice(0, 7),
);
</script>

<template>
  <template v-if="isRef">
    <p class="tag">Reference state</p>
    <h2>{{ sc.name }}</h2>
    <p>{{ sc.summary }}</p>
    <p class="sm">
      Choose a scenario in the bar above the figure. Line widths and each organism's supply index will change,
      and a shadow shows where they started.
    </p>
  </template>
  <template v-else>
    <p class="tag">Scenario</p>
    <h2>{{ sc.name }}</h2>
    <p>{{ sc.summary }}</p>
    <h3>Assumes</h3>
    <ul class="plain">
      <li v-for="a in sc.assumptions" :key="a.text"><EvidenceBadge :evidence="a.evidence" />{{ a.text }}</li>
    </ul>
    <h3>Most affected</h3>
    <p v-if="!affected.length" class="sm">No organism moves by 5% or more.</p>
    <ul v-else class="rows">
      <li v-for="n in affected" :key="n.id">
        <button class="row" @click="store.select(n.id)">
          <span />
          <span class="who">{{ n.name }}</span>
          <span class="what">{{ percentChange(n.supply) }} supply index</span>
        </button>
      </li>
    </ul>
    <h3>What we do not know</h3>
    <ul class="plain">
      <li v-for="u in sc.unknowns" :key="u">{{ u }}</li>
    </ul>
  </template>
</template>
