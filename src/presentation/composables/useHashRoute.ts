import { onBeforeUnmount, onMounted, watch } from 'vue';
import { useAtlasStore } from '@presentation/stores';
import type { PanelTab } from '@presentation/types';

/** Panels worth linking to. Inspect and Scenario follow from what is selected, so they stay out of the URL. */
const LINKABLE: readonly PanelTab[] = ['keystones', 'evidence'];

/**
 * Keeps `#ecosystem--scenario` (and optionally `--keystones` or `--evidence`) in step with the store.
 * Hash names use letters, digits and hyphens only.
 */
export function useHashRoute(): void {
  const store = useAtlasStore();

  const read = (): void => {
    const [eco, scn, tab] = location.hash.slice(1).split('--');
    if (eco && eco !== store.ecosystemId)
      store.showEcosystem(eco, scn);
    else if (scn && scn !== store.scenarioId) store.showScenario(scn);
    const linked = LINKABLE.find(t => t === tab);
    if (linked && store.tab !== linked) store.setTab(linked);
  };
  const write = (): void => {
    const reference = store.ecosystem.reference.id;
    const tab = LINKABLE.find(t => t === store.tab);
    const scenario =
      store.scenarioId !== reference || tab
        ? `--${store.scenarioId}`
        : '';
    const want = `#${store.ecosystemId}${scenario}${tab ? `--${tab}` : ''}`;
    if (location.hash !== want) history.replaceState(null, '', want);
  };

  onMounted(() => {
    read();
    write();
    window.addEventListener('hashchange', read);
  });
  onBeforeUnmount(() =>
    window.removeEventListener('hashchange', read),
  );
  watch(
    () => [store.ecosystemId, store.scenarioId, store.tab],
    write,
  );
}
