<script setup lang="ts">
import { useAtlasStore } from '@presentation/stores';
import LogoMark from './LogoMark.vue';

const store = useAtlasStore();
</script>

<template>
  <header class="masthead pad">
    <div class="mast-in">
      <span class="journal">
        <span class="mark"><LogoMark /></span>
        Oikos
        <em>the household accounts of living places</em>
      </span>
      <span class="meta">Working atlas · open data · v0.2</span>
    </div>
    <nav class="ecotabs" role="tablist" aria-label="Ecosystem">
      <button
        v-for="e in store.entries"
        :key="e.ecosystem.id"
        class="ecotab"
        role="tab"
        :aria-selected="e.ecosystem.id === store.ecosystemId"
        @click="store.showEcosystem(e.ecosystem.id)"
      >
        <b>{{ e.ecosystem.name }}</b>
        <span>{{ e.ecosystem.habitat }}</span>
      </button>
    </nav>
  </header>
</template>
