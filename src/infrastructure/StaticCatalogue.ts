import type { AtlasCatalogue, AtlasEntry } from '@application';
import {
  amazon,
  coralReef,
  hydrothermalVent,
  kelpForest,
  montado,
  salmonRainforest,
  savanna,
  toAtlasEntry,
  tundra,
  veluwe,
  waddenSea,
} from '@infrastructure/ecosystems';

/** Adapter for the AtlasCatalogue port. Ecosystems are authored as typed data modules in this repository. */
export class StaticCatalogue implements AtlasCatalogue {
  // Land first, then the places where land meets sea, then the sea.
  private readonly entries: readonly AtlasEntry[] = [
    montado,
    veluwe,
    savanna,
    amazon,
    tundra,
    salmonRainforest,
    waddenSea,
    kelpForest,
    coralReef,
    hydrothermalVent,
  ].map(toAtlasEntry);

  list(): readonly AtlasEntry[] {
    return this.entries;
  }
}
