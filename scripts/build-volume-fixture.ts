/**
 * build-volume-fixture.ts — builds the app a second time from a fixture pack that adds a volume, into
 * dist-volume-fixture/. The Playwright suite serves it on :4174 and replays a reader's stored notes against it, which
 * is how APP-SPEC §1.2's promise is actually tested: a note written in V0 survives a rebuild that adds a volume.
 *
 * The real content-pack is never modified — it is copied to scripts/.cache/volume-fixture-pack first, and the fixture
 * volume's prose is obviously a fixture (it cites real, verified references, because the citation gate is real).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(ROOT, 'scripts/.cache');
const PACK = path.join(CACHE, 'volume-fixture-pack');
const DATA = path.join(CACHE, 'volume-fixture-data');
const PUBLIC = path.join(CACHE, 'volume-fixture-public');
const OUT = path.join(ROOT, 'dist-volume-fixture');

const REVIEW = `<!-- section: v1-abstract -->
# Abstract

<!-- framing -->
This is a fixture volume. It exists only so the test suite can prove that a rebuild which adds a volume leaves an
existing reader's notes, section ids and reference numbering untouched. It is not part of the published review.

The shared bibliography is unchanged by this fixture: the inflammatory reflex was described as a neural circuit in
which efferent vagal activity suppresses cytokine release [149], and this fixture cites it only to exercise the
citation gate that every volume passes [149].

<!-- section: v1-1-fixture-section -->
## 1. A fixture section

<!-- framing -->
The section below carries one cited block, one framing block and one synthesis block, which is the minimum a real
volume's parser must handle.

The clinical societies' glossary defines neuromodulation broadly enough to span electrical, magnetic and chemical
delivery [1], which is the definitional point Volume 0 opens with [1].

<!-- synthesis -->
Taken together, a fixture volume that parses, cites and renders like a real one is the cheapest way to keep the
promise that volumes are added rather than forked [1,149].
`;

function run(cmd: string, args: string[], env: NodeJS.ProcessEnv) {
  const res = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', env: { ...process.env, ...env } });
  if (res.status !== 0) { console.error(`\n${cmd} ${args.join(' ')} failed`); process.exit(res.status ?? 1); }
}

// 1. a copy of the pack, plus a second volume
fs.rmSync(PACK, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'content-pack'), PACK, { recursive: true });
fs.mkdirSync(path.join(PACK, 'volumes/v1'), { recursive: true });
fs.writeFileSync(path.join(PACK, 'volumes/v1/review.md'), REVIEW);

const manifest = yaml.load(fs.readFileSync(path.join(PACK, 'manifest.yaml'), 'utf8'), { schema: yaml.CORE_SCHEMA }) as { volumes: { id: string; status: string }[] };
const v1 = manifest.volumes.find((v) => v.id === 'v1');
if (!v1) { console.error('the pack no longer declares v1 — update this fixture'); process.exit(1); }
v1.status = 'ready';
fs.writeFileSync(path.join(PACK, 'manifest.yaml'), yaml.dump(manifest, { lineWidth: 110 }));

const scope = yaml.load(fs.readFileSync(path.join(PACK, 'scope.yaml'), 'utf8'), { schema: yaml.CORE_SCHEMA }) as { volumes: Record<string, unknown> };
scope.volumes.v1 = {
  depth: 'deep',
  outline_approved: '2026-09-15',
  search_strategy: {
    run_on: '2026-09-15',
    sources: ['fixture'],
    queries: [{ q: 'fixture volume, no real sweep was run', source: 'fixture', hits: 0, kept: 0, date: '2026-09-15' }],
    snowball: [],
    inclusion: ['nothing — this volume is a test fixture'],
    exclusion: ['everything — this volume is a test fixture'],
    known_gaps: ['this is a fixture volume and has no corpus of its own'],
  },
  corpus_profile: { by_tier: { seminal: 0, classic: 0, current: 0, background: 0 }, year_range: [2002, 2026], concentration: 'fixture', dissent_represented: false },
};
fs.writeFileSync(path.join(PACK, 'scope.yaml'), yaml.dump(scope, { lineWidth: 110 }));

// 2. content build + app build into their own directories
const env = { CONTENT_PACK: PACK, DATA_DIR: DATA, PUBLIC_DIR: PUBLIC, OUT_DIR: OUT, BASE_PATH: '/' };
run('npx', ['tsx', 'scripts/build-content.ts'], env);
run('npx', ['vite', 'build'], env);
console.log(`\nfixture build with volumes v0 + v1 → ${path.relative(ROOT, OUT)}`);
