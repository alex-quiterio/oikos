import { onBeforeUnmount, ref, watch, type Ref } from 'vue';

/** Eases a number toward its target so changes can be watched, not just read. Jumps when motion is reduced. */
export function useTweened(
  source: () => number,
  ms = 500,
): Ref<number> {
  const shown = ref(source());
  const reduced = globalThis.matchMedia?.(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  let raf = 0;
  watch(source, to => {
    cancelAnimationFrame(raf);
    if (reduced || typeof requestAnimationFrame === 'undefined') {
      shown.value = to;
      return;
    }
    const from = shown.value;
    const t0 = performance.now();
    const step = (t: number): void => {
      const k = Math.min(1, (t - t0) / ms);
      shown.value = from + (to - from) * (1 - Math.pow(1 - k, 3));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  });
  onBeforeUnmount(() => cancelAnimationFrame(raf));
  return shown;
}
