import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { nextTick } from 'vue';
import { describe, expect, test } from 'vitest';
import { AtlasService } from '@application';
import { StaticCatalogue } from '@infrastructure';
import { App } from '@presentation/components';
import { configureAtlas } from '@presentation/stores';

const entries = new StaticCatalogue().list();

describe('every route renders', () => {
  for (const { ecosystem } of entries) {
    for (const scenario of ecosystem.scenarios) {
      test(`#${ecosystem.id}--${scenario.id}`, async () => {
        history.replaceState(null, '', `#${ecosystem.id}--${scenario.id}`);
        configureAtlas(new AtlasService(new StaticCatalogue()));
        const w = mount(App, { global: { plugins: [createPinia()] }, attachTo: document.body });
        await nextTick();
        expect(w.find('h1').text()).toBe(ecosystem.name);
        expect(w.findAll('.node').length).toBe(ecosystem.organisms.length);
        w.unmount();
      });
    }
  }
});
