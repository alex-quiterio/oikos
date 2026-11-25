import type { AtlasEntry, NodeLayout } from '@application';
import { Ecosystem, type Evidence } from '@domain';
import type { EcosystemDto, EvidenceCode } from './dto';

const EVIDENCE: Record<EvidenceCode, Evidence> = { E: 'documented', L: 'likely', D: 'debated', U: 'unknown' };

/** Anti-corruption layer: authoring format in, domain aggregate and map layout out. */
export function toAtlasEntry(dto: EcosystemDto): AtlasEntry {
  const ecosystem = Ecosystem.create({
    id: dto.id,
    name: dto.name,
    habitat: dto.habitat,
    place: dto.place,
    intro: dto.intro,
    flowLabels: dto.flowLabels,
    organisms: Object.entries(dto.nodes).map(([id, n]) => ({
      id,
      name: n.n,
      group: n.g,
      description: n.d,
      claim: n.ks && { kind: n.ks.k, status: n.ks.s, note: n.ks.t },
    })),
    flows: dto.flows.map(([from, to, type, weight, ev, label, note]) => ({
      id: `${from}>${to}:${type}`,
      from,
      to,
      type,
      weight,
      evidence: EVIDENCE[ev],
      label,
      note,
    })),
    controls: (dto.controls ?? []).map(([from, to, kind, strength, ev, label, note]) => ({
      id: `${from}>${to}:ctl`,
      from,
      to,
      kind,
      strength,
      evidence: EVIDENCE[ev],
      label,
      note,
    })),
    scenarios: dto.scenarios.map(s => ({
      id: s.id,
      name: s.name,
      summary: s.summary,
      abundance: s.abundance,
      factors: s.factors,
      assumptions: s.assumes.map(([ev, text]) => ({ evidence: EVIDENCE[ev], text })),
      unknowns: s.unknowns,
    })),
    stories: dto.stories.map(s => ({ title: s.t, text: s.x, organismIds: s.nodes })),
    questions: dto.questions.map(q => ({ title: q.t, text: q.x, relatedIds: q.ids })),
    omitted: dto.omitted,
    care: dto.care,
  });
  const nodes: Record<string, NodeLayout> = {};
  for (const [id, n] of Object.entries(dto.nodes))
    nodes[id] = { x: n.x, y: n.y, r: n.r, shape: n.s === 's' ? 'square' : 'circle' };
  return {
    ecosystem,
    layout: {
      width: dto.view.w,
      height: dto.view.h,
      sky: dto.view.sky,
      bands: dto.view.bands,
      lines: dto.view.lines,
      labels: dto.view.labels,
      nodes,
    },
  };
}
