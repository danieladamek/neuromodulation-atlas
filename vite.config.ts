/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
// DATA_DIR / PUBLIC_DIR / OUT_DIR let the fixture-volume build (tests) compile the same app from a second content
// build without touching src/data, public or dist. The real app uses the defaults.
const DATA_DIR = path.resolve(ROOT, process.env.DATA_DIR ?? 'src/data');
const PUBLIC_DIR = path.resolve(ROOT, process.env.PUBLIC_DIR ?? 'public');
const OUT_DIR = path.resolve(ROOT, process.env.OUT_DIR ?? 'dist');

/** SPA deep links on GitHub Pages need a 404.html that is a copy of index.html (as in Bioactive Explorer). */
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    closeBundle() {
      const index = path.join(OUT_DIR, 'index.html');
      if (fs.existsSync(index)) fs.copyFileSync(index, path.join(OUT_DIR, '404.html'));
    },
  };
}

const CHUNKS: [string, RegExp][] = [
  ['react', /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler|@remix-run)\//],
  ['charts', /node_modules\/(recharts|recharts-scale|victory-vendor|d3-(shape|path|interpolate|color|format|time|time-format|array|scale))\//],
  ['graph', /node_modules\/(graphology[^/]*|d3-(force|quadtree|dispatch|timer|zoom|selection|drag|transition|ease))\//],
  ['neo4j', /node_modules\/neo4j-driver[^/]*\//],
  ['markdown', /node_modules\/(react-markdown|remark-|micromark|mdast-|unified|vfile|unist-|hast-util-to-jsx-runtime|property-information|space-separated-tokens|comma-separated-tokens|style-to-js|inline-style-parser|estree-util)/],
];

// BASE_PATH lets the same build deploy to a GitHub Pages project sub-path, e.g. BASE_PATH=/neuromodulation-atlas/
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  publicDir: PUBLIC_DIR,
  plugins: [react(), spaFallback()],
  resolve: {
    alias: [
      { find: '@/data', replacement: DATA_DIR },
      { find: '@', replacement: path.join(ROOT, 'src') },
    ],
  },
  // Large data files ship as JSON.parse('…') rather than object literals: much cheaper to parse.
  json: { stringify: true },
  build: {
    outDir: OUT_DIR,
    emptyOutDir: true,
    target: 'es2020',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          for (const [name, re] of CHUNKS) if (re.test(id)) return name;
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    testTimeout: 30_000,
  },
});
