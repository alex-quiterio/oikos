<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useAtlasStore } from '@presentation/stores';
import LogoMark from './LogoMark.vue';

const store = useAtlasStore();
/** Hovering or focusing the folded rail shows the list over the page without moving it. */
const peek = ref(false);
let closing: ReturnType<typeof setTimeout> | undefined;
const expanded = computed(() => store.sidebarOpen || peek.value);

const GROUPS = ['Land', 'Urban', 'Land and sea', 'Marine'] as const;
const groups = computed(() =>
  GROUPS.map(habitat => ({
    habitat,
    items: store.entries.filter(e => e.ecosystem.habitat === habitat),
  })).filter(g => g.items.length > 0),
);

const open = (): void => {
  clearTimeout(closing);
  peek.value = true;
};
const close = (): void => {
  clearTimeout(closing);
  closing = setTimeout(() => (peek.value = false), 180);
};
const onFocusOut = (e: FocusEvent): void => {
  const next = e.relatedTarget as Node | null;
  if (!next || !(e.currentTarget as HTMLElement).contains(next))
    close();
};
const pick = (id: string): void => {
  store.showEcosystem(id);
  peek.value = false;
};
onBeforeUnmount(() => clearTimeout(closing));
</script>

<template>
  <aside
    class="sidebar"
    :class="{
      open: store.sidebarOpen,
      peek: peek && !store.sidebarOpen,
    }"
    aria-label="Ecosystems"
    @mouseenter="open"
    @mouseleave="close"
    @focusin="open"
    @focusout="onFocusOut"
    @keydown.esc="peek = false"
  >
    <div class="side-head">
      <span class="mark"><LogoMark /></span>
      <span v-if="expanded" class="side-brand">
        <b>Oikos</b>
        <em>the household accounts of living places</em>
      </span>
      <button
        class="side-toggle"
        :aria-expanded="expanded"
        :aria-label="
          store.sidebarOpen
            ? 'Fold the ecosystem list'
            : 'Show the ecosystem list'
        "
        :title="store.sidebarOpen ? 'Fold' : 'Keep open'"
        @click="store.toggleSidebar()"
      >
        {{ store.sidebarOpen ? '«' : '»' }}
      </button>
    </div>

    <nav
      v-if="expanded"
      class="side-nav"
      aria-label="Choose an ecosystem"
    >
      <section v-for="g in groups" :key="g.habitat">
        <h2 class="side-group">{{ g.habitat }}</h2>
        <button
          v-for="e in g.items"
          :key="e.ecosystem.id"
          class="eco-item"
          :aria-current="
            e.ecosystem.id === store.ecosystemId ? 'true' : undefined
          "
          @click="pick(e.ecosystem.id)"
        >
          <b>{{ e.ecosystem.name }}</b>
          <span>{{ e.ecosystem.place }}</span>
        </button>
      </section>
      <p class="side-foot">Working atlas · open data · v0.2</p>
    </nav>

    <button
      v-else
      class="rail-label"
      aria-label="Show the ecosystem list"
      @click="open"
    >
      <span>{{ store.ecosystem.name }}</span>
    </button>
  </aside>
</template>
