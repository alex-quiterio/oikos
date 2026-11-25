<script setup lang="ts">
import { computed } from 'vue';
import { useAtlasStore } from '@presentation/stores';
import type { PanelTab } from '@presentation/types';
import EvidencePanel from './EvidencePanel.vue';
import InspectPanel from './InspectPanel.vue';
import TeachPanel from './TeachPanel.vue';
import KeystonePanel from './KeystonePanel.vue';
import ScenarioPanel from './ScenarioPanel.vue';

const store = useAtlasStore();
const tabs: readonly (readonly [PanelTab, string])[] = [
  ['teach', 'Teach'],
  ['inspect', 'Inspect'],
  ['scenario', 'Scenario'],
  ['keystones', 'Keystones'],
  ['evidence', 'Evidence'],
];
const panels = {
  teach: TeachPanel,
  inspect: InspectPanel,
  scenario: ScenarioPanel,
  keystones: KeystonePanel,
  evidence: EvidencePanel,
};
const current = computed(() => panels[store.tab]);
</script>

<template>
  <aside class="side">
    <div class="ptabs" role="tablist" aria-label="Panel">
      <button
        v-for="[key, label] in tabs"
        :key="key"
        class="ptab"
        role="tab"
        :aria-selected="store.tab === key"
        @click="store.setTab(key)"
      >
        {{ label }}
      </button>
    </div>
    <div class="panel" aria-live="polite">
      <component :is="current" />
    </div>
  </aside>
</template>
