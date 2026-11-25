<script setup lang="ts">
import { computed } from 'vue';
import { CLAIM_NAMES } from '@presentation/format';
import { useAtlasStore } from '@presentation/stores';

const store = useAtlasStore();
const eco = computed(() => store.ecosystem);
const ranking = computed(() => store.keystones?.ranking ?? []);
const max = computed(() => Math.max(...ranking.value.map(r => r.impact), 0.001));
const names = (ids: readonly string[]): string => ids.map(id => eco.value.organism(id).name).join(', ');
</script>

<template>
  <p class="tag">Structural dependence and the literature</p>
  <h2>Who the web leans on</h2>
  <p class="sm">
    Each organism is removed in turn. The bar shows how much of the rest of the web moves, and the count shows
    how many others fall below half of their reference supply. This is dependence on this map, not a keystone
    index, which needs biomass.
  </p>
  <div>
    <div v-for="r in ranking" :key="r.id" class="ksrow" :class="{ on: store.removed.includes(r.id) }">
      <span class="nm">{{ eco.organism(r.id).name }}</span>
      <span v-if="eco.organism(r.id).claim" class="ks-chip" :title="eco.organism(r.id).claim?.note">
        {{ CLAIM_NAMES[eco.organism(r.id).claim!.kind] }} · {{ eco.organism(r.id).claim!.status }}
      </span>
      <span v-else />
      <span class="bar"><i :style="{ width: `${(r.impact / max) * 100}%` }" /></span>
      <small>
        {{ r.severity }}: {{ r.collapsed.length }} fall below half<template v-if="r.released.length"
          >, {{ r.released.length }} rise</template
        >.
        <a href="#" @click.prevent="store.testRemoval(r.id)">{{
          store.removed.includes(r.id) ? 'restore' : 'test removal'
        }}</a>
      </small>
    </div>
  </div>
  <template v-if="store.keystones?.disagreements.literatureOnly.length">
    <h3>Flagged in the literature, modest here</h3>
    <p class="sm">
      {{ names(store.keystones.disagreements.literatureOnly) }}. Their influence may run through behaviour,
      specialists, or controls the map cannot show, or the map lacks the alternatives that would soften a
      loss.
    </p>
  </template>
  <template v-if="store.keystones?.disagreements.structuralOnly.length">
    <h3>Structural hubs not flagged</h3>
    <p class="sm">
      {{ names(store.keystones.disagreements.structuralOnly) }}. Basal producers, decomposers and symbionts
      tend to rank high because everything draws on them.
    </p>
  </template>
</template>
