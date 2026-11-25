import type { AtlasCatalogue, AtlasEntry } from '@application';
import { coralReef, kelpForest, montado, salmonRainforest, toAtlasEntry } from '@infrastructure/ecosystems';

/** Adapter for the AtlasCatalogue port. Ecosystems are authored as typed data modules in this repository. */
export class StaticCatalogue implements AtlasCatalogue {
  private readonly entries: readonly AtlasEntry[] = [montado, salmonRainforest, kelpForest, coralReef].map(
    toAtlasEntry,
  );

  list(): readonly AtlasEntry[] {
    return this.entries;
  }
}
