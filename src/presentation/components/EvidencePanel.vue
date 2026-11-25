<script setup lang="ts">
import { computed } from 'vue';
import { EVIDENCE_ORDER } from '@presentation/format';
import { useAtlasStore } from '@presentation/stores';
import EvidenceBadge from './EvidenceBadge.vue';

const store = useAtlasStore();
const eco = computed(() => store.ecosystem);
const rows = computed(() => store.edgeViews.filter(e => store.evidenceFilter.includes(e.evidence)));
const name = (id: string): string => eco.value.organism(id).name;
</script>

<template>
  <p class="tag">Table 1</p>
  <h2>Every flow and its evidence</h2>
  <div class="chips">
    <button
      v-for="e in EVIDENCE_ORDER"
      :key="e"
      class="chip"
      :aria-pressed="store.evidenceFilter.includes(e)"
      @click="store.toggleEvidence(e)"
    >
      {{ e }}
    </button>
  </div>
  <table class="tbl">
    <thead>
      <tr>
        <th>Flow</th>
        <th>Evidence</th>
        <th class="num">Wt</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="e in rows" :key="e.id" data-e @click="store.focusOn([e.id])">
        <td>
          <span class="swatch" :style="{ background: `var(--${e.type})` }" />
          {{ name(e.from) }} → {{ name(e.to) }}<br />
          <span class="sm"
            >{{ e.label }}<template v-if="e.note">. {{ e.note }}</template></span
          >
        </td>
        <td><EvidenceBadge :evidence="e.evidence" /></td>
        <td class="num">{{ e.isControl ? e.weight.toFixed(1) : e.weight }}</td>
      </tr>
    </tbody>
  </table>
</template>
