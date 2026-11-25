<script setup lang="ts">
import { computed } from 'vue';
import { percentChange } from '@presentation/format';
import { useAtlasStore } from '@presentation/stores';

const store = useAtlasStore();
const names = computed(() => store.removed.map(id => store.ecosystem.organism(id).name).join(', '));
const short = computed(() =>
  store.nodeViews
    .filter(n => !n.removed && n.group !== 'store' && n.supply < 0.5)
    .map(n => `${n.name} (${percentChange(n.supply)})`),
);
</script>

<template>
  <div v-if="store.removed.length" class="status">
    <span><b>Removed:</b> {{ names }}.</span>
    <span
      ><b>Below half supply:</b>
      {{ short.length ? short.join('; ') : 'nobody. The map has other routes.' }}</span
    >
    <button class="btn" @click="store.restoreAll()">Restore everything</button>
  </div>
</template>
