<script setup lang="ts">
import { computed } from 'vue';
import {
  CLAIM_NAMES,
  GROUP_NAMES,
  percentChange,
  typeClass,
} from '@presentation/format';
import { useAtlasStore } from '@presentation/stores';
import type { EdgeView } from '@presentation/types';
import EvidenceBadge from './EvidenceBadge.vue';

const store = useAtlasStore();
const eco = computed(() => store.ecosystem);
const organism = computed(() =>
  store.selectedId ? eco.value.organism(store.selectedId) : null,
);
const supply = computed(() =>
  store.selectedId
    ? (store.simulation.supply[store.selectedId] ?? 1)
    : 1,
);
const recruitment = computed(() =>
  store.selectedId
    ? store.simulation.recruitment[store.selectedId]
    : undefined,
);
const moved = computed(
  () => !store.isReference && Math.abs(supply.value - 1) >= 0.05,
);
const ins = computed(() =>
  store.edgeViews.filter(e => e.visible && e.to === store.selectedId),
);
const outs = computed(() =>
  store.edgeViews.filter(
    e => e.visible && e.from === store.selectedId,
  ),
);
const removed = computed(() =>
  store.selectedId ? store.removed.includes(store.selectedId) : false,
);
const nameOf = (id: string): string => eco.value.organism(id).name;
const other = (e: EdgeView, dir: 'in' | 'out'): string =>
  dir === 'in' ? e.from : e.to;
</script>

<template>
  <template v-if="organism">
    <p class="tag">{{ GROUP_NAMES[organism.group] }}</p>
    <h2>{{ organism.name }}</h2>
    <p>{{ organism.description }}</p>
    <template v-if="organism.claim">
      <p>
        <span class="ks-chip"
          >{{ CLAIM_NAMES[organism.claim.kind] }} ·
          {{ organism.claim.status }}</span
        >
      </p>
      <p class="sm">{{ organism.claim.note }}</p>
    </template>
    <p v-if="moved">
      <b>{{ percentChange(supply) }}</b> supply index against the
      reference state in this scenario.
    </p>
    <p
      v-if="
        recruitment !== undefined &&
        !store.isReference &&
        recruitment < 0.95
      "
    >
      <b>{{ percentChange(recruitment) }}</b> recruitment (seeds,
      spores or larvae). Acts over years and does not change the
      standing stock.
    </p>
    <template v-for="dir in ['in', 'out'] as const" :key="dir">
      <h3>{{ dir === 'in' ? 'Takes in' : 'Gives out' }}</h3>
      <p v-if="!(dir === 'in' ? ins : outs).length" class="sm">
        Nothing on the flows currently shown.
      </p>
      <ul v-else class="rows">
        <li v-for="e in dir === 'in' ? ins : outs" :key="e.id">
          <button class="row" @click="store.select(other(e, dir))">
            <span
              class="sw"
              :class="typeClass(e.type)"
              :style="{ '--c': `var(--${e.type})` }"
            />
            <span class="who"
              >{{ dir === 'in' ? 'From' : 'To' }}
              {{ nameOf(other(e, dir)) }}</span
            >
            <span class="what"
              ><EvidenceBadge :evidence="e.evidence" />{{
                e.label
              }}</span
            >
          </button>
        </li>
      </ul>
    </template>
    <button class="btn" @click="store.toggleRemoved(organism.id)">
      {{
        removed
          ? `Restore ${organism.name}`
          : `Remove ${organism.name} and see what follows`
      }}
    </button>
  </template>
  <template v-else>
    <p class="tag">Story</p>
    <h2>{{ store.story.title }}</h2>
    <p>{{ store.story.text }}</p>
    <ul v-if="store.story.kind === 'questions'" class="rows">
      <li v-for="q in eco.questions" :key="q.title">
        <button class="row" @click="store.focusOn(q.relatedIds)">
          <span />
          <span class="who">{{ q.title }}</span>
          <span class="what">{{ q.text }}</span>
        </button>
      </li>
    </ul>
    <p v-if="store.storyIndex === 0" class="sm">
      Select an organism to read what it takes in and gives out, or
      choose a scenario above.
    </p>
  </template>
</template>
