import { beforeEach, describe, expect, test } from 'bun:test';
import { createPinia, setActivePinia } from 'pinia';
import { AtlasService } from '@application';
import { StaticCatalogue } from '@infrastructure';
import { configureAtlas, useAtlasStore } from '@presentation/stores';

beforeEach(() => {
  configureAtlas(new AtlasService(new StaticCatalogue()));
  setActivePinia(createPinia());
});

describe('atlas store', () => {
  test('starts on the first ecosystem in its reference state', () => {
    const s = useAtlasStore();
    expect(s.ecosystem.id).toBe('montado');
    expect(s.isReference).toBe(true);
    expect(s.edgeViews.length).toBe(
      s.ecosystem.flows.length + s.ecosystem.controls.length,
    );
  });

  test('choosing a scenario opens the scenario tab and draws shadows where flows change', () => {
    const s = useAtlasStore();
    s.showScenario('rabbit-collapse');
    expect(s.tab).toBe('scenario');
    expect(s.isReference).toBe(false);
    expect(s.edgeViews.some(e => e.shadow)).toBe(true);
    const lynx = s.nodeViews.find(n => n.id === 'lynx');
    expect(lynx?.supply).toBeLessThan(0.2);
    expect(lynx?.low).toBe(true);
  });

  test('selecting an organism spotlights only its flows', () => {
    const s = useAtlasStore();
    s.select('rab');
    const hot = s.edgeViews.filter(e => e.hot);
    expect(hot.length).toBeGreaterThan(0);
    for (const e of hot)
      expect(e.from === 'rab' || e.to === 'rab').toBe(true);
    expect(s.nodeViews.find(n => n.id === 'jay')?.dim).toBe(true);
  });

  test('hiding a flow type hides its edges', () => {
    const s = useAtlasStore();
    s.toggleType('seeds');
    expect(
      s.edgeViews
        .filter(e => e.type === 'seeds')
        .every(e => !e.visible),
    ).toBe(true);
  });

  test('open questions spotlight only debated and unknown flows', () => {
    const s = useAtlasStore();
    s.showStory(s.stories.length - 1);
    expect(s.story.kind).toBe('questions');
    for (const e of s.edgeViews) expect(e.hot).toBe(!e.modelled);
  });

  test('switching ecosystem resets selection and scenario', () => {
    const s = useAtlasStore();
    s.select('oak');
    s.showScenario('drought');
    s.showEcosystem('kelp-forest');
    expect(s.selectedId).toBeNull();
    expect(s.scenarioId).toBe('reference');
    expect(s.ecosystem.habitat).toBe('Marine');
  });

  test('the keystone lens ranks organisms and flags literature claims', () => {
    const s = useAtlasStore();
    s.showEcosystem('kelp-forest');
    s.toggleLens();
    expect(s.keystones?.ranking.length).toBeGreaterThan(5);
    expect(
      s.nodeViews.find(n => n.id === 'otter')?.claim?.status,
    ).toBe('documented');
    expect(Math.max(...s.nodeViews.map(n => n.ring))).toBeCloseTo(
      1,
      5,
    );
  });

  test('removing an organism by hand reports it and propagates', () => {
    const s = useAtlasStore();
    s.toggleRemoved('rab');
    expect(s.isReference).toBe(false);
    expect(s.nodeViews.find(n => n.id === 'rab')?.removed).toBe(true);
    expect(
      s.edgeViews
        .filter(e => e.from === 'rab')
        .every(e => !e.visible),
    ).toBe(true);
  });

  test('health falls when a scenario runs and when organisms are removed', () => {
    const s = useAtlasStore();
    expect(s.health.intact).toBe(1);
    s.showScenario('rabbit-collapse');
    const scenarioOnly = s.health.intact;
    expect(scenarioOnly).toBeLessThan(1);
    s.toggleRemoved('oak');
    expect(s.health.intact).toBeLessThan(scenarioOnly);
  });

  test('stepping the collapse sequence removes the top organisms in order', () => {
    const s = useAtlasStore();
    s.setTab('keystones');
    expect(s.collapse?.length).toBeGreaterThan(5);
    expect(s.collapseStep).toBe(0);
    s.setCollapseStep(3);
    expect(s.removed.length).toBe(3);
    expect(s.collapseStep).toBe(3);
    expect(s.health.intact).toBeLessThan(0.9);
    s.toggleRemoved('sun');
    expect(s.collapseStep).toBeNull();
  });

  test('health trail records each change and the playback steps the sequence', () => {
    const s = useAtlasStore();
    s.setTab('keystones');
    const before = s.trail.length;
    s.setCollapseStep(2);
    expect(s.trail.length).toBeGreaterThan(before);
    expect(s.healthChange).toBeLessThan(0);
    expect(
      s.nodeViews.filter(n => n.stress === 'lost').length,
    ).toBeGreaterThanOrEqual(2);
    s.playCollapse(10);
    expect(s.collapsePlaying).toBe(true);
    expect(s.removed.length).toBe(0);
    s.stopCollapse();
    expect(s.collapsePlaying).toBe(false);
  });

  test('stress levels follow the scenario', () => {
    const s = useAtlasStore();
    expect(s.nodeViews.every(n => n.stress === 'ok')).toBe(true);
    s.showScenario('rabbit-collapse');
    expect(s.nodeViews.find(n => n.id === 'lynx')?.stress).toBe(
      'severe',
    );
  });

  test('the sidebar starts open and folds once an ecosystem is chosen', () => {
    const s = useAtlasStore();
    expect(s.sidebarOpen).toBe(true);
    s.showEcosystem('veluwe');
    expect(s.sidebarOpen).toBe(false);
    s.toggleSidebar();
    expect(s.sidebarOpen).toBe(true);
  });
});
