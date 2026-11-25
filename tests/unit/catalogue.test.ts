import { describe, expect, test } from 'bun:test';
import { StaticCatalogue } from '@infrastructure';

const entries = new StaticCatalogue().list();

describe('catalogue', () => {
  test('contains land and marine ecosystems', () => {
    const habitats = new Set(entries.map(e => e.ecosystem.habitat));
    expect(habitats.has('Land')).toBe(true);
    expect(habitats.has('Marine')).toBe(true);
  });

  for (const { ecosystem: eco, layout } of entries) {
    describe(eco.id, () => {
      test('every organism has a layout inside the canvas', () => {
        for (const o of eco.organisms) {
          const n = layout.nodes[o.id];
          expect(n).toBeDefined();
          if (!n) continue;
          expect(n.x - n.r).toBeGreaterThanOrEqual(0);
          expect(n.x + n.r).toBeLessThanOrEqual(layout.width);
          expect(n.y - n.r).toBeGreaterThanOrEqual(0);
          expect(n.y + n.r).toBeLessThanOrEqual(layout.height);
        }
      });

      test('organisms do not overlap', () => {
        const ids = Object.keys(layout.nodes);
        for (const a of ids) {
          for (const b of ids) {
            if (a >= b) continue;
            const p = layout.nodes[a]!;
            const q = layout.nodes[b]!;
            expect(Math.hypot(p.x - q.x, p.y - q.y)).toBeGreaterThan(
              p.r + q.r + 8,
            );
          }
        }
      });

      test('says what is not known', () => {
        const levels = new Set(eco.flows.map(f => f.evidence));
        expect(levels.has('documented')).toBe(true);
        expect(eco.questions.length).toBeGreaterThan(0);
        expect(eco.omitted.length).toBeGreaterThan(20);
        for (const s of eco.scenarios.slice(1))
          expect(s.unknowns.length).toBeGreaterThan(0);
      });

      test('keystone claims carry a note', () => {
        for (const o of eco.organisms)
          if (o.claim)
            expect(o.claim.note.length).toBeGreaterThan(20);
      });
    });
  }
});
