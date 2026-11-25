<script setup lang="ts">
import type { Evidence } from '@domain';

defineProps<{ evidence: Evidence }>();
</script>

<template>
  <span class="cf" :class="evidence">{{ evidence }}</span>
</template>
