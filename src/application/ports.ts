import type { Ecosystem, OrganismId } from '@domain/ecosystem';

/** Where and how an organism is drawn. A presentation concern kept out of the domain model. */
export interface NodeLayout {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly shape: 'circle' | 'square';
}

export interface Band {
  readonly d: string;
  readonly fill: 'soil' | 'seabed' | 'water' | 'land';
  readonly opacity?: number;
}

export interface MapLayout {
  readonly width: number;
  readonly height: number;
  readonly sky: 'land' | 'water';
  readonly bands: readonly Band[];
  readonly lines: readonly string[];
  readonly labels: readonly (readonly [text: string, x: number, y: number])[];
  readonly nodes: Readonly<Record<OrganismId, NodeLayout>>;
}

export interface AtlasEntry {
  readonly ecosystem: Ecosystem;
  readonly layout: MapLayout;
}

/** Port: where the atlas gets its ecosystems from. Implemented in infrastructure. */
export interface AtlasCatalogue {
  list(): readonly AtlasEntry[];
}
