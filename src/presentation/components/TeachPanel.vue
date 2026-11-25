<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAtlasStore } from '@presentation/stores';

const store = useAtlasStore();
const eco = computed(() => store.ecosystem);
const guide = computed(() => eco.value.teaching);
const flows = computed(() => store.flows);
const name = (id: string): string => eco.value.organism(id).name;

const openQuestion = ref<number | null>(null);
const ran = ref<number | null>(null);
watch(
  () => store.ecosystemId,
  () => {
    openQuestion.value = null;
    ran.value = null;
  },
);

const pct = (value: number, max: number): string =>
  `${Math.max(4, Math.round((value / Math.max(max, 0.001)) * 100))}%`;
const maxOf = (list: readonly { total: number }[]): number =>
  Math.max(...list.map(x => x.total), 0.001);

const lenses = [
  ['all', 'All flows'],
  ['energy', 'Energy only'],
  ['nutrients', 'Nutrients only'],
] as const;

const ask = (i: number): void => {
  const q = guide.value?.questions[i];
  if (!q) return;
  store.showLens('all');
  store.focusOn(q.look);
  openQuestion.value = i;
};
const run = (i: number): void => {
  const a = guide.value?.activities[i];
  if (!a) return;
  store.runActivity(a);
  ran.value = i;
};
const reset = (): void => {
  store.resetActivity();
  ran.value = null;
};
const nutrientName = (t: 'nitrogen' | 'phosphorus'): string =>
  t === 'nitrogen' ? 'Nitrogen' : 'Phosphorus';
</script>

<template>
  <p class="tag">Teach this</p>
  <h2>Energy and nutrient flows</h2>
  <p v-if="guide">{{ guide.bigIdea }}</p>

  <div class="lens-row">
    <span class="lab">Show</span>
    <div class="seg" role="group" aria-label="Which flows to show">
      <button
        v-for="[key, label] in lenses"
        :key="key"
        :aria-pressed="store.flowLens === key"
        @click="store.showLens(key)"
      >
        {{ label }}
      </button>
    </div>
  </div>

  <h3>Energy: in, up and out</h3>
  <p class="sm">
    Energy comes in from outside, passes up from eater to eater, and
    leaves as heat. It is not recycled.
  </p>
  <p class="tag">Where it enters</p>
  <ul class="bars">
    <li v-for="e in flows.energyEntries" :key="e.id">
      <span>{{ name(e.id) }}</span>
      <i
        :style="{ width: pct(e.total, maxOf(flows.energyEntries)) }"
      />
    </li>
  </ul>
  <p class="tag">The energy ladder</p>
  <ol class="ladder">
    <li v-for="r in [...flows.ladder].reverse()" :key="r.level">
      <b>Level {{ r.level }}</b>
      <span class="sm">{{
        r.level === 1
          ? 'producers and what lives on dead matter'
          : `eats level ${r.level - 1}`
      }}</span>
      <span class="chips">
        <button
          v-for="id in r.ids"
          :key="id"
          class="mini"
          @click="store.select(id)"
        >
          {{ name(id) }}
        </button>
      </span>
    </li>
  </ol>
  <p class="sm">
    Roughly a tenth of the energy moves up each step. Typical figures
    run from about 5% to 20%. That is why food chains are short and
    the top is small.
  </p>
  <p class="tag">Most energy passes through</p>
  <ul class="bars">
    <li v-for="h in flows.hubs" :key="h.id">
      <button class="linklike" @click="store.select(h.id)">
        {{ name(h.id) }}
      </button>
      <i :style="{ width: pct(h.total, maxOf(flows.hubs)) }" />
    </li>
  </ul>

  <h3>Nutrients: in and around</h3>
  <p class="sm">
    Nutrients go round and round. The plants and algae take them up,
    animals pass them on, and decomposers return them.
  </p>
  <section v-for="n in flows.nutrients" :key="n.type" class="ledger">
    <p class="tag">{{ nutrientName(n.type) }}</p>
    <p class="sm">
      <b>Enters from outside:</b>
      {{
        n.entries.length
          ? n.entries.map(e => name(e.id)).join(', ')
          : 'nothing on this map'
      }}.
    </p>
    <div
      class="stackbar slim"
      role="img"
      :aria-label="`${Math.round(n.recycledShare * 100)}% of what producers receive is recycled`"
    >
      <i
        class="s-ok"
        :style="{ width: `${n.recycledShare * 100}%` }"
      />
      <i
        class="s-mild"
        :style="{ width: `${(1 - n.recycledShare) * 100}%` }"
      />
    </div>
    <p class="sm">
      <b>{{ Math.round(n.recycledShare * 100) }}%</b> of what plants
      and algae receive comes from inside the system (one step back).
      The rest is new.
    </p>
    <ul class="bars">
      <li v-for="d in n.deliverers" :key="d.id">
        <button class="linklike" @click="store.select(d.id)">
          {{ name(d.id) }}
        </button>
        <span class="mini-tag">{{
          d.external ? 'new' : 'recycled'
        }}</span>
        <i :style="{ width: pct(d.total, maxOf(n.deliverers)) }" />
      </li>
    </ul>
  </section>

  <template v-if="guide">
    <h3>Questions to explore</h3>
    <p class="sm">
      Pick one. The map highlights the flows to look at.
    </p>
    <ul class="rows">
      <li v-for="(q, i) in guide.questions" :key="q.title">
        <button class="row" @click="ask(i)">
          <span />
          <span class="who">{{ q.title }}</span>
          <span class="what">{{ q.prompt }}</span>
        </button>
        <p v-if="openQuestion === i" class="notice">
          <b>What the map shows.</b> {{ q.notice }}
        </p>
      </li>
    </ul>

    <h3>Predict, then run</h3>
    <ul class="activities">
      <li v-for="(a, i) in guide.activities" :key="a.title">
        <b>{{ a.title }}</b>
        <p class="sm"><i>Predict:</i> {{ a.predict }}</p>
        <button class="btn" @click="run(i)">Run it</button>
        <template v-if="ran === i">
          <button class="btn quiet" @click="reset">Reset</button>
          <p class="notice"><b>What to notice.</b> {{ a.notice }}</p>
        </template>
      </li>
    </ul>
  </template>
</template>
