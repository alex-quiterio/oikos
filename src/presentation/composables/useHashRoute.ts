import { onBeforeUnmount, onMounted, watch } from 'vue';
import { useAtlasStore } from '@presentation/stores';

/** Keeps `#ecosystem--scenario` in step with the store. Hash names use letters, digits and hyphens only. */
export function useHashRoute(): void {
  const store = useAtlasStore();

  const read = (): void => {
    const [eco, scn] = location.hash.slice(1).split('--');
    if (eco && eco !== store.ecosystemId) store.showEcosystem(eco, scn);
    else if (scn && scn !== store.scenarioId) store.showScenario(scn);
  };
  const write = (): void => {
    const ref = store.ecosystem.reference.id;
    const want = `#${store.ecosystemId}${store.scenarioId !== ref ? `--${store.scenarioId}` : ''}`;
    if (location.hash !== want) history.replaceState(null, '', want);
  };

  onMounted(() => {
    read();
    write();
    window.addEventListener('hashchange', read);
  });
  onBeforeUnmount(() => window.removeEventListener('hashchange', read));
  watch(() => [store.ecosystemId, store.scenarioId], write);
}
