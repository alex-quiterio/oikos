/**
 * Turns the single-file Vite build (dist/index.html) into an HTML fragment for hosts that wrap pages in their own
 * document skeleton: no doctype, html, head or body tags, with the app script after its mount point.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist/index.html', 'utf8');
const head = /<head>([\s\S]*?)<\/head>/.exec(html)?.[1] ?? '';
const body = /<body>([\s\S]*?)<\/body>/.exec(html)?.[1] ?? '';

const scripts = [...head.matchAll(/<script[\s\S]*?<\/script>/g)].map(m => m[0]);
const headRest = head
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<meta charset[^>]*>/g, '')
  .replace(/<meta name="viewport"[^>]*>/g, '');

const fragment = `${headRest.trim()}\n${body.trim()}\n${scripts.join('\n')}\n`;
writeFileSync('dist/artifact.html', fragment);
console.log(`wrote dist/artifact.html (${Math.round(fragment.length / 1024)} KB)`);
