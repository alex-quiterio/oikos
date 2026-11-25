<script setup lang="ts">
import { computed } from 'vue';
import { FLOW_TYPES, type RelationType } from '@presentation/format';
import { useAtlasStore } from '@presentation/stores';

const store = useAtlasStore();
const types = computed(() =>
  (Object.keys(FLOW_TYPES) as RelationType[])
    .map(t => ({
      type: t,
      count:
        t === 'ctl'
          ? store.ecosystem.controls.length
          : store.ecosystem.flows.filter(f => f.type === t).length,
    }))
    .filter(t => t.count > 0),
);
const unknownCount = computed(
  () => store.ecosystem.flows.filter(f => f.evidence === 'debated' || f.evidence === 'unknown').length,
);
const typeName = (t: RelationType): string =>
  t === 'ctl' ? FLOW_TYPES.ctl.name : (store.ecosystem.flowLabels[t] ?? FLOW_TYPES[t].name);
</script>

<template>
  <section class="controls" aria-label="Controls">
    <div class="crow">
      <span class="lab">Scenario</span>
      <div class="seg" role="group" aria-label="Scenario">
        <button
          v-for="s in store.ecosystem.scenarios"
          :key="s.id"
          :aria-pressed="s.id === store.scenarioId"
          @click="store.showScenario(s.id)"
        >
          {{ s.name }}
        </button>
      </div>
    </div>
    <div class="crow">
      <span class="lab">Flows</span>
      <div class="chips">
        <button
          v-for="t in types"
          :key="t.type"
          class="chip"
          :style="{ '--c': `var(--${t.type})` }"
          :title="FLOW_TYPES[t.type].hint"
          :aria-pressed="!store.hiddenTypes.includes(t.type)"
          @click="store.toggleType(t.type)"
        >
          <span class="sw" />{{ typeName(t.type) }}<span class="n">{{ t.count }}</span>
        </button>
        <button
          class="chip"
          :style="{ '--c': 'var(--muted)' }"
          :aria-pressed="store.showUnknown"
          @click="store.toggleUnknown()"
        >
          <span class="sw" />Debated &amp; unknown<span class="n">{{ unknownCount }}</span>
        </button>
      </div>
      <button
        class="tog"
        :aria-pressed="store.lens"
        title="Ring each organism by how much the rest of the web depends on it"
        @click="store.toggleLens()"
      >
        Keystone lens
      </button>
      <button class="tog" :aria-pressed="store.motion" @click="store.toggleMotion()">
        {{ store.motion ? 'Motion on' : 'Motion off' }}
      </button>
    </div>
    <div class="crow">
      <span class="lab">Stories</span>
      <div class="chips">
        <button
          v-for="(s, i) in store.stories"
          :key="s.title"
          class="chap"
          :aria-pressed="i === store.storyIndex && !store.selectedId && !store.focusIds"
          @click="store.showStory(i)"
        >
          {{ s.title }}
        </button>
      </div>
    </div>
  </section>
</template>
