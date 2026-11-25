<script setup lang="ts">
import { useAtlasStore } from '@presentation/stores';

const store = useAtlasStore();
</script>

<template>
  <section class="prose">
    <div>
      <h2>Why this place</h2>
      <p>{{ store.ecosystem.care.why }}</p>
      <p class="sm">{{ store.ecosystem.care.status }}</p>
    </div>
    <div>
      <h2>Methods and limits</h2>
      <p>
        Each flow has a relative weight from 1 to 5, set by the author from published descriptions. They are
        not measurements.
      </p>
      <p>
        The scenario model multiplies each flow by the supply of its source and takes the weakest input type
        for each organism. Stores such as litter pass on only part of a change. Release of prey from predators
        and pressure from consumers are handled by separate controls. Seed, spore and larval flows are
        reported as recruitment and do not change standing stock. Only documented and likely relationships
        enter the arithmetic.
      </p>
      <p>
        It shows direction and exposure. It does not predict biomass, and real webs contain alternatives that
        are missing here.
      </p>
    </div>
    <div>
      <h2>What this map leaves out</h2>
      <p>{{ store.ecosystem.omitted }}</p>
      <p class="sm">Corrections and sources are welcome. See CONTRIBUTING.md in the repository.</p>
    </div>
  </section>
</template>
