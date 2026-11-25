import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { defineConfig } from 'vitest/config';

const src = (p: string): string => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

// `ARTIFACT=1` inlines everything into one HTML file for sharing as a single page.
export default defineConfig({
  plugins: [vue(), ...(process.env.ARTIFACT ? [viteSingleFile()] : [])],
  base: './',
  resolve: {
    alias: {
      '@domain': src('domain'),
      '@application': src('application'),
      '@infrastructure': src('infrastructure'),
      '@presentation': src('presentation'),
    },
  },
  // Component tests run in vitest. Everything else runs under `bun test`.
  test: { environment: 'happy-dom', include: ['tests/ui/**/*.spec.ts'] },
});
