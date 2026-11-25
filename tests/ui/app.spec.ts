import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { nextTick } from 'vue';
import { describe, expect, test } from 'vitest';
import { AtlasService } from '@application';
import { StaticCatalogue } from '@infrastructure';
import { App } from '@presentation/components';
import { configureAtlas } from '@presentation/stores';

function mountApp() {
  history.replaceState(null, '', '#');
  configureAtlas(new AtlasService(new StaticCatalogue()));
  return mount(App, { global: { plugins: [createPinia()] }, attachTo: document.body });
}

describe('App', () => {
  test('opens the ecosystem and scenario named in the URL hash', async () => {
    history.replaceState(null, '', '#coral-reef--bleaching');
    configureAtlas(new AtlasService(new StaticCatalogue()));
    const w = mount(App, { global: { plugins: [createPinia()] }, attachTo: document.body });
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
    const tabs = w.findAll('.ecotab');
    expect(tabs.length).toBe(4);
    await tabs[2]!.trigger('click');
    expect(w.find('h1').text()).toBe('Northeast Pacific kelp forest');
    await w.findAll('.seg button')[1]!.trigger('click');
    expect(w.find('.ptab[aria-selected="true"]').text()).toBe('Scenario');
    expect(w.text()).toContain('What we do not know');
    w.unmount();
  });

  test('selecting an organism shows what it takes in, and a removal reports who is short', async () => {
    const w = mountApp();
    await w
      .findAll('.node')
      [w.findAll('.node').findIndex(n => n.text().includes('Rabbits'))]!.trigger('click');
    expect(w.find('.panel').text()).toContain('Takes in');
    await w.find('.panel .btn').trigger('click');
    expect(w.find('.status').exists()).toBe(true);
    expect(w.find('.status').text()).toContain('Iberian lynx');
    w.unmount();
  });

  test('the keystone panel lists a ranking and a way to test removal', async () => {
    const w = mountApp();
    await w.findAll('.ptab')[2]!.trigger('click');
    expect(w.findAll('.ksrow').length).toBeGreaterThan(10);
    expect(w.find('.panel').text()).toContain('not a keystone index');
    w.unmount();
  });

  test('the evidence table filters by evidence level', async () => {
    const w = mountApp();
    await w.findAll('.ptab')[3]!.trigger('click');
    const all = w.findAll('tbody tr').length;
    await w.findAll('.panel .chip')[0]!.trigger('click');
    expect(w.findAll('tbody tr').length).toBeLessThan(all);
    w.unmount();
  });
});
