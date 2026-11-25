import { describe, expect, test } from 'bun:test';
import { StaticCatalogue } from '@infrastructure';
import {
  HORN_AREA_KM2,
  HORN_FLOWS,
  HORN_PRODUCTION,
} from '@infrastructure/ecosystems';

const wadden = new StaticCatalogue()
  .list()
  .find(e => e.ecosystem.id === 'wadden-sea')!.ecosystem;
const flow = (from: string, to: string, type = 'energy') =>
  wadden.flows.find(
    f => f.from === from && f.to === to && f.type === type,
  )!;

describe('Horn et al. (2017) anchoring', () => {
  test('the extracted data match the paper’s own text', () => {
    // Habitat areas as given in the Methods of the paper
    expect(HORN_AREA_KM2.sand).toBe(160.3);
    expect(HORN_AREA_KM2.seagrass).toBe(33.3);
    // Mud algae are the largest producer, and worms are the main food of waders
    const production = HORN_PRODUCTION;
    expect(production.diat!.mean).toBeGreaterThan(
      production.phyto!.mean * 5,
    );
    expect(HORN_FLOWS['worm>waders']!.mean).toBeGreaterThan(100);
  });

  test('cited works exist, and every source names one', () => {
    expect(wadden.references.map(r => r.id)).toContain('horn2017');
    for (const r of [...wadden.flows, ...wadden.controls])
      if (r.source)
        expect(
          wadden.references.some(x => x.id === r.source!.ref),
        ).toBe(true);
  });

  test('most flows between producers, animals and birds are anchored, and fish and seals are not', () => {
    const sourced = wadden.flows.filter(f => f.source).length;
    expect(sourced).toBeGreaterThan(40);
    expect(flow('plaice', 'seal').source).toBeUndefined();
    expect(flow('worm', 'plaice').source).toBeUndefined();
    expect(flow('sea', 'phyto', 'nitrogen').source).toBeUndefined();
  });

  test('weights follow the paper’s sizes', () => {
    const w = (a: string, b: string) => flow(a, b).weight;
    expect(w('sun', 'diat')).toBeGreaterThan(w('diat', 'snails'));
    expect(w('diat', 'snails')).toBeGreaterThan(w('worm', 'waders'));
    expect(w('worm', 'waders')).toBeGreaterThan(w('cockle', 'oyc'));
    expect(w('cockle', 'oyc')).toBeGreaterThan(w('mussel', 'eider'));
    for (const f of wadden.flows) {
      expect(f.weight).toBeGreaterThanOrEqual(1);
      expect(f.weight).toBeLessThanOrEqual(5);
    }
  });

  test('flows the paper rates low quality are not marked documented', () => {
    expect(flow('diat', 'detr').evidence).toBe('likely');
    expect(flow('snails', 'detr').evidence).toBe('likely');
    expect(flow('cockle', 'knot').evidence).toBe('documented');
  });

  test('a source says which values and which habitats it rests on', () => {
    const d = flow('cockle', 'knot').source!.detail;
    expect(d).toContain('mgC');
    expect(d).toContain('area-weighted');
    expect(d).toContain('present in 2 of 6 habitats');
    expect(d).toContain('seagrass meadow');
  });

  test('the knot depends on clams and the geese and wigeon on seagrass, as the diets in the paper say', () => {
    const intake = (to: string, from: string) => {
      const into = wadden.flows.filter(
        f => f.to === to && f.type === 'energy',
      );
      const total = into.reduce((a, f) => a + f.weight, 0);
      return flow(from, to).weight / total;
    };
    expect(flow('cockle', 'knot').weight).toBeGreaterThan(
      flow('snails', 'knot').weight,
    );
    expect(intake('dabblers', 'zost')).toBeGreaterThan(0.99);
    expect(intake('goose', 'zost')).toBeGreaterThan(0.99);
  });
});
