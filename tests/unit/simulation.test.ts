import { describe, expect, test } from 'bun:test';
import { rankDependence, simulate, severityOf } from '@domain';
import { StaticCatalogue } from '@infrastructure';

const byId = (id: string) => {
  const e = new StaticCatalogue().list().find(x => x.ecosystem.id === id);
  if (!e) throw new Error(`no ecosystem ${id}`);
  return e.ecosystem;
};

describe('reference state', () => {
  for (const { ecosystem } of new StaticCatalogue().list()) {
    test(`${ecosystem.id}: every organism sits at 1`, () => {
      const sim = simulate(ecosystem);
      for (const o of ecosystem.organisms) expect(sim.supply[o.id]).toBeCloseTo(1, 4);
    });
  }
});

describe('montado', () => {
  const eco = byId('montado');

  test('removing rabbits starves their specialist predators', () => {
    const sim = simulate(eco, { removed: new Set(['rab']) });
    expect(sim.supply.lynx).toBeLessThan(0.1);
    expect(sim.supply.eagle).toBeLessThan(0.1);
    expect(sim.supply.jay).toBeGreaterThan(0.8);
  });

  test('removing the root fungi cuts the oak off from nitrogen and phosphorus', () => {
    const sim = simulate(eco, { removed: new Set(['myco']) });
    expect(sim.supply.oak).toBeLessThan(0.1);
  });

  test('losing the jay thins oak recruitment but not the standing oaks', () => {
    const sim = simulate(eco, { removed: new Set(['jay']) });
    expect(sim.supply.oak).toBeCloseTo(1, 2);
    expect(sim.recruitment.oak).toBeLessThan(0.6);
    expect(sim.recruitment.oak).toBeGreaterThan(0.3);
  });

  test('debated and unknown flows never enter the arithmetic', () => {
    const withUnknownsRemoved = simulate(eco, {
      factors: { 'fox>oak:seeds': 0, 'bat>oak:energy': 0, 'myco>oak:energy': 0 },
    });
    for (const o of eco.organisms) expect(withUnknownsRemoved.supply[o.id]).toBeCloseTo(1, 4);
  });
});

describe('top-down control', () => {
  const kelp = byId('kelp-forest');

  test('losing otters releases urchins and presses kelp down', () => {
    const sim = simulate(kelp, { removed: new Set(['otter']) });
    expect(sim.supply.urch).toBeGreaterThan(1.3);
    expect(sim.supply.kelp).toBeLessThan(0.85);
  });

  test('a controls factor of zero removes the cascade', () => {
    const sim = simulate(kelp, { removed: new Set(['otter']), factors: { 'otter>urch:ctl': 0 } });
    expect(sim.supply.urch).toBeGreaterThan(0.85);
    expect(sim.supply.urch).toBeLessThan(1.15);
    expect(sim.supply.kelp).toBeGreaterThan(0.85);
  });

  test('overfished grazers let algae press on coral', () => {
    const reef = byId('coral-reef');
    const sim = simulate(reef, { abundance: { parrot: 0.3, diad: 0.05 } });
    expect(sim.supply.turf).toBeGreaterThan(1.5);
    expect(sim.supply.coral).toBeLessThan(0.6);
  });
});

describe('keystone ranking', () => {
  test('is sorted by impact and flags severity by convention', () => {
    const ranking = rankDependence(byId('montado'));
    for (let i = 1; i < ranking.length; i++)
      expect(ranking[i - 1]!.impact).toBeGreaterThanOrEqual(ranking[i]!.impact);
    expect(severityOf(0.5)).toBe('collapse');
    expect(severityOf(0.25)).toBe('major');
    expect(severityOf(0.1)).toBe('moderate');
    expect(severityOf(0.01)).toBe('minor');
  });

  test('salmon is structurally central in the river and forest', () => {
    const ranking = rankDependence(byId('salmon-rainforest'));
    const top = ranking.slice(0, 6).map(r => r.id);
    expect(top).toContain('salmon');
  });
});
