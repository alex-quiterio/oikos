import type { MapLayout } from '@application';

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** A gently curved edge, drawn as a quadratic Bézier from the rim of one node to the rim of the next. */
export interface EdgeGeometry {
  readonly d: string;
  readonly p0: Point;
  readonly c: Point;
  readonly p1: Point;
  /** Chord length, used to even out particle speed. */
  readonly length: number;
  readonly mid: Point;
}

export interface Endpoints {
  readonly id: string;
  readonly from: string;
  readonly to: string;
}

const fix = (n: number): string => n.toFixed(1);

export function pointAt(g: EdgeGeometry, t: number): Point {
  const u = 1 - t;
  return {
    x: u * u * g.p0.x + 2 * u * t * g.c.x + t * t * g.p1.x,
    y: u * u * g.p0.y + 2 * u * t * g.c.y + t * t * g.p1.y,
  };
}

/** Parallel edges between the same pair bend further apart, and opposite directions bend to opposite sides. */
export function layoutEdges(layout: MapLayout, edges: readonly Endpoints[]): Record<string, EdgeGeometry> {
  const seen = new Map<string, number>();
  const out: Record<string, EdgeGeometry> = {};
  for (const e of edges) {
    const a = layout.nodes[e.from];
    const b = layout.nodes[e.to];
    if (!a || !b) continue;
    const key = `${e.from}>${e.to}`;
    const idx = seen.get(key) ?? 0;
    seen.set(key, idx + 1);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const p0 = { x: a.x + ux * (a.r + 3), y: a.y + uy * (a.r + 3) };
    const p1 = { x: b.x - ux * (b.r + 9), y: b.y - uy * (b.r + 9) };
    const bend = len * (0.12 + 0.09 * idx);
    const c = { x: (p0.x + p1.x) / 2 + uy * bend, y: (p0.y + p1.y) / 2 - ux * bend };
    const g: EdgeGeometry = {
      d: `M${fix(p0.x)} ${fix(p0.y)} Q${fix(c.x)} ${fix(c.y)} ${fix(p1.x)} ${fix(p1.y)}`,
      p0,
      c,
      p1,
      length: Math.hypot(p1.x - p0.x, p1.y - p0.y),
      mid: { x: 0, y: 0 },
    };
    out[e.id] = { ...g, mid: pointAt(g, 0.5) };
  }
  return out;
}
