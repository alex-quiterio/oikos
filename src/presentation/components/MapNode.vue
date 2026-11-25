<script setup lang="ts">
import { computed } from 'vue';
import { CLAIM_GLYPH, GROUP_NAMES } from '@presentation/format';
import { useAtlasStore } from '@presentation/stores';
import type { NodeView } from '@presentation/types';

const props = defineProps<{ node: NodeView; reference: boolean }>();
const store = useAtlasStore();
const n = computed(() => props.node.layout);
const isSquare = computed(() => n.value.shape === 'square');
const glyph = computed(() =>
  store.lens && props.node.claimStatus ? CLAIM_GLYPH[props.node.claimStatus] : '',
);
const toggle = (): void => store.select(props.node.selected ? null : props.node.id);
</script>

<template>
  <g
    class="node"
    :class="{ sel: node.selected, dim: node.dim, removed: node.removed, low: node.low }"
    tabindex="0"
    role="button"
    :aria-label="`${node.name}, ${GROUP_NAMES[node.group]}`"
    :aria-pressed="node.selected"
    @click.stop="toggle"
    @keydown.enter.prevent="toggle"
    @keydown.space.prevent="toggle"
  >
    <rect
      v-if="isSquare"
      class="ring"
      :style="{ opacity: node.ring }"
      :x="n.x - n.r - 8"
      :y="n.y - n.r - 8"
      :width="(n.r + 8) * 2"
      :height="(n.r + 8) * 2"
      rx="12"
    />
    <circle v-else class="ring" :style="{ opacity: node.ring }" :cx="n.x" :cy="n.y" :r="n.r + 8" />
    <rect
      v-if="isSquare"
      class="body"
      :fill="`var(--${node.group})`"
      :fill-opacity="reference ? 1 : 0.35 + 0.65 * Math.min(node.supply, 1)"
      :x="n.x - n.r"
      :y="n.y - n.r"
      :width="n.r * 2"
      :height="n.r * 2"
      rx="9"
    />
    <circle
      v-else
      class="body"
      :fill="`var(--${node.group})`"
      :fill-opacity="reference ? 1 : 0.35 + 0.65 * Math.min(node.supply, 1)"
      :cx="n.x"
      :cy="n.y"
      :r="n.r"
    />
    <text class="lbl" :x="n.x" :y="n.y + n.r + 18">{{ node.name }}</text>
    <text class="dlt" :x="n.x" :y="n.y + n.r + 35">{{ node.delta }}</text>
    <text class="glyph" :x="n.x" :y="n.y + 5">{{ glyph }}</text>
  </g>
</template>
