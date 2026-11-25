import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { nextTick } from 'vue';
import { describe, expect, test, vi } from 'vitest';
import { AtlasService } from '@application';
import { StaticCatalogue } from '@infrastructure';
import { App } from '@presentation/components';
import { configureAtlas } from '@presentation/stores';

function mountApp() {
  history.replaceState(null, '', '#');
  configureAtlas(new AtlasService(new StaticCatalogue()));
  return mount(App, {
    global: { plugins: [createPinia()] },
    attachTo: document.body,
  });
}

describe('App', () => {
  test('opens the ecosystem and scenario named in the URL hash', async () => {
    history.replaceState(null, '', '#coral-reef--bleaching');
    configureAtlas(new AtlasService(new StaticCatalogue()));
    const w = mount(App, {
      global: { plugins: [createPinia()] },
      attachTo: document.body,
    });
    await nextTick();
    expect(w.find('h1').text()).toBe('Caribbean coral reef');
    expect(w.text()).toContain('Heat bleaching');
    expect(location.hash).toBe('#coral-reef--bleaching');
    w.unmount();
  });

  test('renders the figure with every organism and flow', async () => {
    const w = mountApp();
    expect(w.findAll('.node').length).toBe(22);
    expect(w.findAll('.edge').length).toBe(57 + 5);
    expect(w.text()).toContain('Cork oak montado');
    expect(w.text()).toContain('Figure 1.');
    w.unmount();
  });

  test('switches ecosystem and scenario from the controls', async () => {
    const w = mountApp();
    const tabs = w.findAll('.eco-item');
    expect(tabs.length).toBe(new StaticCatalogue().list().length);
    const kelp = tabs.find(t => t.text().includes('kelp forest'));
    await kelp!.trigger('click');
    expect(w.find('.sidebar').classes()).not.toContain('open');
    expect(w.find('h1').text()).toBe('Northeast Pacific kelp forest');
    await w.findAll('.seg button')[1]!.trigger('click');
    expect(w.find('.ptab[aria-selected="true"]').text()).toBe(
      'Scenario',
    );
    expect(w.text()).toContain('What we do not know');
    w.unmount();
  });

  test('selecting an organism shows what it takes in, and a removal reports who is short', async () => {
    const w = mountApp();
    await w
      .findAll('.node')
      [
        w
          .findAll('.node')
          .findIndex(n => n.text().includes('Rabbits'))
      ]!.trigger('click');
    expect(w.find('.panel').text()).toContain('Takes in');
    await w.find('.panel .btn').trigger('click');
    expect(w.find('.status').exists()).toBe(true);
    expect(w.find('.status').text()).toContain('Iberian lynx');
    w.unmount();
  });

  test('the keystone panel lists a ranking and a way to test removal', async () => {
    const w = mountApp();
    await w
      .findAll('.ptab')
      .find(t => t.text() === 'Keystones')!
      .trigger('click');
    expect(w.findAll('.ksrow').length).toBeGreaterThan(10);
    expect(w.find('.panel').text()).toContain('not a keystone index');
    w.unmount();
  });

  test('the evidence table filters by evidence level', async () => {
    const w = mountApp();
    await w
      .findAll('.ptab')
      .find(t => t.text() === 'Evidence')!
      .trigger('click');
    const all = w.findAll('tbody tr').length;
    await w.findAll('.panel .chip')[0]!.trigger('click');
    expect(w.findAll('tbody tr').length).toBeLessThan(all);
    w.unmount();
  });

  test('shows system health, and the collapse chart steps through removals', async () => {
    const w = mountApp();
    expect(w.find('.health').text()).toContain('100%');
    await w
      .findAll('.ptab')
      .find(t => t.text() === 'Keystones')!
      .trigger('click');
    expect(w.find('.collapse svg').exists()).toBe(true);
    const slider = w.find('.collapse input[type="range"]');
    await slider.setValue(4);
    await vi.waitFor(
      () => expect(w.find('.health').text()).not.toContain('100%'),
      { timeout: 2000 },
    );
    expect(w.find('.status').text()).toContain('Removed:');
    w.unmount();
  });

  test('the ecosystem list folds after a pick and unfolds on hover', async () => {
    const w = mountApp();
    await nextTick();
    expect(w.find('.sidebar').classes()).toContain('open');
    expect(w.findAll('.eco-item').length).toBe(11);
    await w.findAll('.eco-item')[1]!.trigger('click');
    expect(w.find('.sidebar').classes()).not.toContain('open');
    expect(w.findAll('.eco-item').length).toBe(0);
    expect(w.find('.rail-label').text()).toContain('Veluwe');
    expect(w.find('.shell').classes()).not.toContain('is-open');
    await w.find('.sidebar').trigger('mouseenter');
    expect(w.findAll('.eco-item').length).toBe(11);
    expect(w.find('.sidebar').classes()).toContain('peek');
    await w.find('.sidebar').trigger('keydown', { key: 'Escape' });
    expect(w.findAll('.eco-item').length).toBe(0);
    w.unmount();
  });

  test('opens on the teaching tab, and a question highlights its flows', async () => {
    const w = mountApp();
    await nextTick();
    expect(w.find('.ptab[aria-selected="true"]').text()).toBe(
      'Teach',
    );
    expect(w.find('.panel').text()).toContain(
      'Energy and nutrient flows',
    );
    expect(w.find('.ladder').exists()).toBe(true);
    expect(w.findAll('.ledger').length).toBeGreaterThan(0);
    const q = w.findAll('.panel .row')[0]!;
    await q.trigger('click');
    expect(w.find('.notice').text()).toContain('What the map shows');
    expect(w.findAll('.edge.hot').length).toBeGreaterThan(0);
    w.unmount();
  });

  test('the energy lens hides the nutrient flows', async () => {
    const w = mountApp();
    await nextTick();
    const before = w
      .findAll('.edge')
      .filter(e => e.isVisible()).length;
    const energy = w
      .findAll('.lens-row .seg button')
      .find(b => b.text() === 'Energy only')!;
    await energy.trigger('click');
    const after = w
      .findAll('.edge')
      .filter(e => e.isVisible()).length;
    expect(after).toBeLessThan(before);
    w.unmount();
  });

  test('a predict-then-run activity runs the scenario and reveals what to notice', async () => {
    const w = mountApp();
    await nextTick();
    const run = w
      .findAll('.activities .btn')
      .find(b => b.text() === 'Run it')!;
    await run.trigger('click');
    expect(w.find('.status').exists()).toBe(true);
    expect(w.find('.activities .notice').text()).toContain(
      'What to notice',
    );
    expect(w.find('.ptab[aria-selected="true"]').text()).toBe(
      'Teach',
    );
    await w.find('.activities .btn.quiet').trigger('click');
    expect(w.find('.status').exists()).toBe(false);
    w.unmount();
  });
});
