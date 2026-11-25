import { describe, expect, test } from 'bun:test';
import { analyseFlows, simulate } from '@domain';
import { StaticCatalogue } from '@infrastructure';

const entries = new StaticCatalogue().list();

describe('teaching guides', () => {
  test('every ecosystem has a guide that looks at flows', () => {
    for (const { ecosystem: eco } of entries) {
      const g = eco.teaching;
      expect(g, eco.id).toBeDefined();
      expect(g!.bigIdea.length).toBeGreaterThan(80);
      expect(g!.questions.length).toBeGreaterThanOrEqual(4);
      expect(g!.activities.length).toBeGreaterThanOrEqual(2);
      // the energy lens and the nutrient lens are both taught
      const types = new Set(
        g!.questions.flatMap(q =>
          q.look.map(id => id.split(':')[1] ?? ''),
        ),
      );
      expect(types.has('energy'), `${eco.id} energy`).toBe(true);
      expect(
        types.has('nitrogen') || types.has('phosphorus'),
        `${eco.id} nutrients`,
      ).toBe(true);
    }
  });

  test('every activity changes something you can see', () => {
    for (const { ecosystem: eco } of entries) {
      for (const a of eco.teaching!.activities) {
        const sc = eco.scenario(a.scenarioId);
        const sim = simulate(eco, {
          abundance: sc.abundance,
          factors: sc.factors,
          removed: new Set(a.remove ?? []),
        });
        const moved = eco.organisms.filter(
          o => Math.abs((sim.supply[o.id] ?? 1) - 1) >= 0.05,
        );
        expect(moved.length, `${eco.id}: ${a.title}`).toBeGreaterThan(
          0,
        );
      }
    }
  });
});

describe('flow analysis', () => {
  for (const { ecosystem: eco } of entries) {
    test(`${eco.id}: energy enters from outside and climbs a ladder`, () => {
      const a = analyseFlows(eco);
      expect(a.energyEntries.length).toBeGreaterThan(0);
      expect(a.ladder.length).toBeGreaterThanOrEqual(2);
      expect(a.ladder[0]!.level).toBe(1);
      expect(a.hubs.length).toBeGreaterThan(0);
      for (const id of a.ladder.flatMap(r => r.ids))
        expect(a.trophic[id]).toBeGreaterThanOrEqual(1);
      for (const n of a.nutrients) {
        expect(n.recycledShare).toBeGreaterThanOrEqual(0);
        expect(n.recycledShare).toBeLessThanOrEqual(1);
      }
    });
  }

  test('on the montado the oak sits at the bottom of the ladder and the lynx above the rabbit', () => {
    const eco = entries.find(
      e => e.ecosystem.id === 'montado',
    )!.ecosystem;
    const a = analyseFlows(eco);
    expect(a.trophic.oak).toBe(1);
    expect(a.trophic.lynx!).toBeGreaterThan(a.trophic.rab!);
    expect(a.trophic.rab!).toBeGreaterThan(a.trophic.grass!);
    expect(a.energyEntries.map(e => e.id)).toContain('sun');
  });

  test('the Amazon recycles most of its phosphorus and the Saharan dust is the new part', () => {
    const eco = entries.find(
      e => e.ecosystem.id === 'amazon',
    )!.ecosystem;
    const p = analyseFlows(eco).nutrients.find(
      n => n.type === 'phosphorus',
    )!;
    expect(p.entries.map(e => e.id)).toContain('dust');
    expect(p.recycledShare).toBeGreaterThan(0.5);
  });

  test('a salmon ecosystem receives its nitrogen through the soil, not directly from the sea', () => {
    const eco = entries.find(
      e => e.ecosystem.id === 'salmon-rainforest',
    )!.ecosystem;
    const n = analyseFlows(eco).nutrients.find(
      x => x.type === 'nitrogen',
    )!;
    expect(n.deliverers.some(d => d.id === 'soil')).toBe(true);
  });
});
