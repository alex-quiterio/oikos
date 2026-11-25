import type { AtlasService } from '@application';

let current: AtlasService | undefined;

/** Composition root hook: main.ts hands the application service to the presentation layer once. */
export function configureAtlas(service: AtlasService): void {
  current = service;
}

export function atlasService(): AtlasService {
  if (!current)
    throw new Error(
      'configureAtlas() must be called before the atlas store is used.',
    );
  return current;
}
