<script setup lang="ts">
import { useHashRoute } from '@presentation/composables';
import { useAtlasStore } from '@presentation/stores';
import ControlBar from './ControlBar.vue';
import EcosystemHeader from './EcosystemHeader.vue';
import HealthMeter from './HealthMeter.vue';
import FlowFigure from './FlowFigure.vue';
import MastHead from './MastHead.vue';
import ProseSections from './ProseSections.vue';
import SidePanel from './SidePanel.vue';
import StatusBar from './StatusBar.vue';

useHashRoute();
const store = useAtlasStore();
const onEscape = (): void => {
  store.clearFocus();
  store.select(null);
};
</script>

<template>
  <div @keydown.esc="onEscape">
    <MastHead />
    <main class="wrap pad">
      <EcosystemHeader />
      <ControlBar />
      <HealthMeter />
      <StatusBar />
      <section class="stage">
        <FlowFigure />
        <SidePanel />
      </section>
      <ProseSections />
    </main>
  </div>
</template>
